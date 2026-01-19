using Mathsino.Backend.Game;
using Mathsino.Backend.Interfaces;
using Mathsino.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Mathsino.Backend.Services;

public class UsersService(ILogger<UsersService>? logger, MathsinoContext dbContext) : IUsersService
{
    public async Task<List<User>> GetUsersAsync()
    {
        logger?.LogInformation("Fetching all users");
        var users = await dbContext.Users.ToListAsync();
        return users;
    }

    public async Task<User> GetUserByIdAsync(int id)
    {
        logger?.LogInformation("Fetching user with ID {id}", id);
        return await dbContext.Users.FindAsync(id)
            ?? throw new KeyNotFoundException($"User with ID {id} not found.");
    }

    public async Task<User> GetUserByUserNameAsync(string userName)
    {
        logger?.LogInformation("Fetching user with UserName {userName}", userName);
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.UserName == userName);
        return user
            ?? throw new KeyNotFoundException($"User with UserName '{userName}' not found.");
    }

    public async Task<List<SingleGameDto>> GetUserGamesByUserIdAsync(int userId)
    {
        logger?.LogInformation("Fetching games for user ID {UserId}", userId);
        return await dbContext
            .SingleGames.Where(sg =>
                sg.UserId == userId && sg.SingleGameResult != GameResult.Snapshot
            )
            .Select(sg => new SingleGameDto(
                sg.Id,
                sg.GameId,
                sg.UserId,
                sg.PlayerId,
                sg.StartTime,
                sg.EndTime,
                sg.SingleGameResult,
                sg.SingleGameSplitResult,
                sg.BalanceAfterGame
            ))
            .ToListAsync();
    }

    public async Task<SingleGameDto> GetUserGameByUserIdAndGameIdAsync(int userId, Guid gameId)
    {
        logger?.LogInformation("Fetching game ID {GameId} for user ID {UserId}", gameId, userId);
        var game = await dbContext
            .SingleGames.Where(sg => sg.UserId == userId && sg.GameId == gameId)
            .Select(sg => new SingleGameDto(
                sg.Id,
                sg.GameId,
                sg.UserId,
                sg.PlayerId,
                sg.StartTime,
                sg.EndTime,
                sg.SingleGameResult,
                sg.SingleGameSplitResult,
                sg.BalanceAfterGame
            ))
            .FirstOrDefaultAsync();

        return game
            ?? throw new KeyNotFoundException(
                $"Game with ID {gameId} for user ID {userId} not found."
            );
    }

    public async Task<UserStatsDto> GetUserStatsByIdAsync(int userId)
    {
        logger?.LogInformation("Calculating stats for user {UserId}", userId);

        // 1. Pobieramy usera (dla liczników achievementów zapisanych w bazie)
        var user = await dbContext.Users.FindAsync(userId);
        if (user == null) throw new KeyNotFoundException($"User {userId} not found");

        // 2. Pobieramy gry
        var allGames = await dbContext.SingleGames.Where(sg => sg.UserId == userId).ToListAsync();
        var realGames = allGames.Where(g => g.SingleGameResult != GameResult.Snapshot).ToList();

        // 3. Obliczamy Peak Balance
        int peakBalance = user.Balance; // startujemy od obecnego
        if (allGames.Any())
        {
            int maxHist = allGames.Max(g => g.BalanceAfterGame);
            if(maxHist > peakBalance) peakBalance = maxHist;
        }

        // 4. Obliczamy Streak
        var daysStreak = 0;
        var datesWithGames = new List<DateTime>();
        if (allGames.Count > 0)
        {
            datesWithGames = allGames
                .Select(g => g.StartTime.Date)
                .Distinct()
                .OrderByDescending(d => d)
                .ToList();

            foreach (var day in datesWithGames)
            {
                if (day == DateTime.UtcNow.Date.AddDays(-daysStreak) || day == DateTime.UtcNow.Date.AddDays(-(daysStreak + 1)))
                {
                    daysStreak++;
                }
                else if (day < DateTime.UtcNow.Date.AddDays(-(daysStreak + 1)))
                {
                    break;
                }
            }
        }

        // 5. Liczymy znajomych (przywrócone dla Achievementu Social Butterfly)
        var friendsCount = await dbContext.UserFriends.CountAsync(f => 
            (f.UserId == userId || f.FriendId == userId) && f.Status == FriendStatus.Accepted
        );

        return new UserStatsDto
        {
            TotalGames = realGames.Count,
            TotalWins = realGames.Count(g => g.SingleGameResult == GameResult.Win),
            TotalLosses = realGames.Count(g => g.SingleGameResult == GameResult.Lose),
            TotalPushes = realGames.Count(g => g.SingleGameResult == GameResult.Push),
            WinRate =
                realGames.Count > 0
                    ? (double)(
                        realGames.Count(g =>
                            g.SingleGameResult == GameResult.Win
                            || g.SingleGameResult == GameResult.Blackjack
                        )
                        + realGames.Count(g =>
                            g.SingleGameSplitResult == GameResult.Win
                            || g.SingleGameSplitResult == GameResult.Blackjack
                        )
                    ) / realGames.Count
                    : 0,
            BlackJacks = realGames.Count(g => g.SingleGameResult == GameResult.Blackjack),
            PeakBalance = peakBalance,
            DaysStreak = daysStreak,

            // --- NOWE POLA WYMAGANE PRZEZ FRONTEND ---
            SpinWheelCount = user.SpinWheelCount,
            DoubleDownWins = user.DoubleDownWins,
            LessonsCompleted = user.LessonsCompleted,
            FriendsCount = friendsCount
        };
    }

    public async Task<List<UserRankingDto>> GetFriendsRankingAsync(int userId)
    {
        var friendIds = await dbContext
            .UserFriends.Where(f =>
                (f.UserId == userId || f.FriendId == userId) && f.Status == FriendStatus.Accepted
            )
            .Select(f => f.UserId == userId ? f.FriendId : f.UserId)
            .ToListAsync();

        if (!friendIds.Contains(userId))
        {
            friendIds.Add(userId);
        }

        var users = await dbContext.Users.Where(u => friendIds.Contains(u.Id)).ToListAsync();

        var ranking = new List<UserRankingDto>();

        foreach (var u in users)
        {
            var peak =
                await dbContext
                    .SingleGames.Where(sg => sg.UserId == u.Id)
                    .Select(sg => (int?)sg.BalanceAfterGame)
                    .MaxAsync() ?? 5000;

            ranking.Add(new UserRankingDto(u.Id, u.UserName, u.AvatarPath, peak));
        }

        return ranking.OrderByDescending(r => r.PeakBalance).Take(10).ToList();
    }

    public async Task<List<UserRankingDto>> GetFriendsRankingByPeriodAsync(
        int userId,
        DateTime startDate
    )
    {
        var friendIds = await dbContext
            .UserFriends.Where(f => f.UserId == userId)
            .Select(f => f.FriendId)
            .ToListAsync();

        friendIds.Add(userId);

        var ranking = new List<UserRankingDto>();

        foreach (var id in friendIds)
        {
            var user = await dbContext.Users.FindAsync(id);
            if (user == null)
                continue;

            var peak =
                await dbContext
                    .SingleGames.Where(sg => sg.UserId == id && sg.StartTime >= startDate)
                    .Select(sg => (int?)sg.BalanceAfterGame)
                    .MaxAsync() ?? 0;

            if (peak > 0)
            {
                ranking.Add(new UserRankingDto(user.Id, user.UserName, user.AvatarPath, peak));
            }
        }

        return ranking.OrderByDescending(r => r.PeakBalance).Take(10).ToList();
    }

    public async Task<List<UserRankingDto>> GetGlobalRankingAsync()
    {
        logger?.LogInformation("Pobieranie ogólnego rankingu Top 10");

        var users = await dbContext.Users.ToListAsync();
        var ranking = new List<UserRankingDto>();

        foreach (var u in users)
        {
            var peak =
                await dbContext
                    .SingleGames.Where(sg => sg.UserId == u.Id)
                    .Select(sg => (int?)sg.BalanceAfterGame)
                    .MaxAsync() ?? 5000;

            ranking.Add(new UserRankingDto(u.Id, u.UserName, u.AvatarPath, peak));
        }

        return ranking.OrderByDescending(r => r.PeakBalance).Take(10).ToList();
    }

    public async Task<List<UserRankingDto>> GetGlobalRankingByPeriodAsync(DateTime startDate)
    {
        logger?.LogInformation("Pobieranie rankingu globalnego od {startDate}", startDate);

        var users = await dbContext.Users.ToListAsync();
        var ranking = new List<UserRankingDto>();

        foreach (var u in users)
        {
            var peak =
                await dbContext
                    .SingleGames.Where(sg => sg.UserId == u.Id && sg.StartTime >= startDate)
                    .Select(sg => (int?)sg.BalanceAfterGame)
                    .MaxAsync() ?? 0;

            if (peak > 0)
            {
                ranking.Add(new UserRankingDto(u.Id, u.UserName, u.AvatarPath, peak));
            }
        }

        return ranking.OrderByDescending(r => r.PeakBalance).Take(10).ToList();
    }
}

// Zaktualizowane DTO na dole pliku (Zawiera teraz brakujące pola!)
public record UserStatsDto
{
    public int TotalGames { get; init; }
    public int TotalWins { get; init; }
    public int TotalLosses { get; init; }
    public int TotalPushes { get; init; }
    public double WinRate { get; init; }
    public int BlackJacks { get; init; } = 0;
    public int PeakBalance { get; init; } = 5000;
    public int DaysStreak { get; init; } = 0;
    
    // Pola niezbędne do Achievementów:
    public int SpinWheelCount { get; init; } = 0;
    public int DoubleDownWins { get; init; } = 0;
    public int LessonsCompleted { get; init; } = 0;
    public int FriendsCount { get; init; } = 0;
}

public record UserRankingDto(int Id, string UserName, string AvatarPath, int PeakBalance);