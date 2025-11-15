using Mathsino.Backend.Models;

namespace Mathsino.Backend.Services;

public class UsersService(ILogger<UsersService>? logger, MathsinoContext dbContext)
{
    public async Task<User> GetUserByIdAsync(int id)
    {
        logger?.LogInformation("Fetching user with ID {UserId}", id);
        return await dbContext.Users.FindAsync(id)
            ?? throw new KeyNotFoundException($"User with ID {id} not found.");
    }
}
