using Mathsino.Backend.Game;
using Mathsino.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Mathsino.Backend.Services;

public class UsersService(ILogger<UsersService>? logger, MathsinoContext dbContext)
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

        var allGames = await dbContext.SingleGames.Where(sg => sg.UserId == userId).ToListAsync();

        var realGames = allGames.Where(g => g.SingleGameResult != GameResult.Snapshot).ToList();

        int peakBalance = 5000;
        if (allGames.Any())
        {
            peakBalance = allGames.Max(g => g.BalanceAfterGame);
        }

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
}

public record UserStatsDto
{
    public int TotalGames { get; init; }
    public int TotalWins { get; init; }
    public int TotalLosses { get; init; }
    public int TotalPushes { get; init; }
    public double WinRate { get; init; }
    public int BlackJacks { get; init; } = 0;

    public int PeakBalance { get; init; } = 5000;
}

public record UserRankingDto(int Id, string UserName, string AvatarPath, int PeakBalance);
