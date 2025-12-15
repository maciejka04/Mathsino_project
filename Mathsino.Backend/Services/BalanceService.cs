using Mathsino.Backend.Game;
using Mathsino.Backend.Models;

namespace Mathsino.Backend.Services;

public class BalanceService
{
    private readonly ILogger<BalanceService>? logger;
    private readonly MathsinoContext dbContext;

    public BalanceService(ILogger<BalanceService>? logger, MathsinoContext dbContext)
    {
        this.logger = logger;
        this.dbContext = dbContext;
    }

    public async Task<bool> DeductBalance(int userId, int amount)
    {
        var user = await dbContext.Users.FindAsync(userId);
        if (user == null || user.Balance < amount)
        {
            logger?.LogWarning("Cannot deduct {Amount} from user {UserId}", amount, userId);
            return false;
        }

        user.Balance -= amount;
        await dbContext.SaveChangesAsync();
        logger?.LogInformation("Deducted {Amount} from user {UserId}", amount, userId);
        return true;
    }

    public async Task AddBalance(int userId, int amount)
    {
        var user = await dbContext.Users.FindAsync(userId);
        if (user == null)
            throw new KeyNotFoundException($"User {userId} not found");

        user.Balance += amount;
        await dbContext.SaveChangesAsync();
        logger?.LogInformation("Added {Amount} to user {UserId}", amount, userId);
    }

    public async Task<int> GetBalance(int userId)
    {
        var user = await dbContext.Users.FindAsync(userId);
        if (user == null)
            throw new KeyNotFoundException($"User {userId} not found");
        return user.Balance;
    }

    public async Task SaveBalanceSnapshot(int userId)
    {
        logger?.LogInformation("Saving balance snapshot for user {UserId}", userId);

        var user = await dbContext.Users.FindAsync(userId);
        if (user == null)
        {
            logger?.LogError("User {UserId} not found for snapshot", userId);
            throw new KeyNotFoundException($"User {userId} not found");
        }

        var snapshotRecord = new SingleGame
        {
            GameId = Guid.NewGuid(),
            UserId = userId,
            PlayerId = Guid.NewGuid(),
            StartTime = DateTime.Now,
            EndTime = DateTime.Now,
            SingleGameResult = GameResult.Snapshot,
            SingleGameSplitResult = null,
            BalanceAfterGame = user.Balance,
        };

        await dbContext.SingleGames.AddAsync(snapshotRecord);
        await dbContext.SaveChangesAsync();

        logger?.LogInformation(
            "Balance snapshot saved: {Balance} PLN for user {UserId}",
            user.Balance,
            userId
        );
    }
}
