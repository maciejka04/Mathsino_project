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
}
