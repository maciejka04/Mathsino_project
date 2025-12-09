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
        logger?.LogInformation("Fetching user with ID {UserId}", id);
        return await dbContext.Users.FindAsync(id)
            ?? throw new KeyNotFoundException($"User with ID {id} not found.");
    }

    public async Task<List<SingleGameDto>> GetUserGamesByUserIdAsync(int userId)
    {
        logger?.LogInformation("Fetching games for user ID {UserId}", userId);
        return await dbContext
            .SingleGames.Where(sg => sg.UserId == userId)
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

        var games = await dbContext.SingleGames.Where(sg => sg.UserId == userId).ToListAsync();

        return new UserStatsDto
        {
            TotalGames = games.Count,
            TotalWins = games.Count(g =>
                g.SingleGameResult == GameResult.Win || g.SingleGameResult == GameResult.Blackjack
            ),
            TotalLosses = games.Count(g => g.SingleGameResult == GameResult.Lose),
            TotalPushes = games.Count(g => g.SingleGameResult == GameResult.Push),
            WinRate =
                games.Count > 0
                    ? (double)(
                        games.Count(g =>
                            g.SingleGameResult == GameResult.Win
                            || g.SingleGameResult == GameResult.Blackjack
                        )
                        + games.Count(g =>
                            g.SingleGameSplitResult == GameResult.Win
                            || g.SingleGameSplitResult == GameResult.Blackjack
                        )
                    ) / games.Count
                    : 0,
            BlackJacks = games.Count(g => g.SingleGameResult == GameResult.Blackjack),
        };
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
}
