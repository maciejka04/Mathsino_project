using Mathsino.Backend.Interfaces;
using Mathsino.Backend.Models;
using Mathsino.Backend.Game;
using Microsoft.EntityFrameworkCore;

namespace Mathsino.Backend.Services;

public class AchievementService(ILogger<AchievementService>? logger, MathsinoContext dbContext, IBalanceService balanceService) : IAchievementService
{
    // keep reference to avoid CS9113
    private readonly ILogger<AchievementService>? _logger = logger;
    public async Task<List<UserAchievementDto>> GetUserAchievementsAsync(int userId)
    {
        var user = await dbContext.Users.FindAsync(userId) ?? throw new KeyNotFoundException();

        var existing = await dbContext.UserAchievements.Where(ua => ua.UserId == userId).ToListAsync();

        // gather stats needed
        int lessonsCompleted = user.LessonsCompleted;
        int spinWheelCount = user.SpinWheelCount;
        int doubleDownWins = user.DoubleDownWins;

        int friendsCount = await dbContext.UserFriends.CountAsync(f => (f.UserId == userId || f.FriendId == userId) && f.Status == FriendStatus.Accepted);

        var totalGamesQueryable = dbContext.SingleGames.Where(g => g.UserId == userId && g.SingleGameResult != GameResult.Snapshot);
        int gamesPlayed = await totalGamesQueryable.CountAsync();
        int blackjacks = await totalGamesQueryable.CountAsync(g => g.SingleGameResult == GameResult.Blackjack || g.SingleGameSplitResult == GameResult.Blackjack);
        int peakBalance = await dbContext.SingleGames.Where(g => g.UserId == userId).Select(g => (int?)g.BalanceAfterGame).MaxAsync() ?? user.Balance;

        // Days streak calculation similar to UsersService
        var allGameDates = await totalGamesQueryable.Select(g => g.StartTime.Date).Distinct().ToListAsync();
        int daysStreak = 0;
        if (allGameDates.Count > 0)
        {
            var ordered = allGameDates.Distinct().OrderByDescending(d => d).ToList();
            foreach (var day in ordered)
            {
                if (day == DateTime.UtcNow.Date.AddDays(-daysStreak))
                    daysStreak++;
                else
                    break;
            }
        }

        // map and compute
        var result = new List<UserAchievementDto>();
        foreach (var def in AchievementDefinition.All)
        {
            int progress = 0;
            switch (def.Id)
            {
                case 1: // The Journey Begins composite, approximate: lessons>=1 && gamesPlayed>=5 && spinWheelCount>=1 && user has at least 1 win
                    int wins = await totalGamesQueryable.CountAsync(g => g.SingleGameResult == GameResult.Win || g.SingleGameResult == GameResult.Blackjack);
                    progress = (lessonsCompleted >= 1 && gamesPlayed >= 5 && spinWheelCount >= 1 && wins >= 1) ? 1 : 0;
                    break;
                case 2: // Master of Strategy
                    progress = lessonsCompleted;
                    break;
                case 3:
                case 4:
                case 5:
                case 6:
                case 7: // PeakBalance achievements
                    progress = peakBalance;
                    break;
                case 8: // Daily Regular
                    progress = daysStreak;
                    break;
                case 9: // Fortune Seeker
                    progress = spinWheelCount;
                    break;
                case 10: // Friendly Face
                    progress = friendsCount;
                    break;
                case 11:
                case 12:
                case 13: // Games Played achievements
                    progress = gamesPlayed;
                    break;
                case 14:
                case 15: // Blackjack achievements
                    progress = blackjacks;
                    break;
                case 16: // Double Trouble
                    progress = doubleDownWins;
                    break;
            }

            int status = 0; // default
            var stored = existing.FirstOrDefault(e => e.AchievementId == def.Id);
            if (stored != null)
                status = stored.Status;

            // auto set to completed if progress >= target and no record yet
            if (status == 0 && progress >= def.TargetValue)
            {
                // create record status=1
                stored = new UserAchievement
                {
                    UserId = userId,
                    AchievementId = def.Id,
                    Status = 1
                };
                dbContext.UserAchievements.Add(stored);
                status = 1;
            }
            result.Add(new UserAchievementDto(def.Id, def.Title, progress, def.TargetValue, status, def.RewardType, def.RewardValue, def.RewardLabel));
        }

        await dbContext.SaveChangesAsync();
        return result;
    }

    public async Task ClaimAchievementRewardAsync(int userId, int achievementId)
    {
        var record = await dbContext.UserAchievements.FirstOrDefaultAsync(ua => ua.UserId == userId && ua.AchievementId == achievementId);
        if (record == null || record.Status != 1)
            throw new InvalidOperationException("Reward not available");

        var def = AchievementDefinition.All.First(a => a.Id == achievementId);

        switch (def.RewardType)
        {
            case RewardType.Cash:
                await balanceService.AddBalance(userId, def.RewardValue);
                break;
            case RewardType.Avatar:
                // nothing to do; avatar will be unlocked by having status==2. User selects later.
                break;
        }

        record.Status = 2;
        await dbContext.SaveChangesAsync();
    }
}
