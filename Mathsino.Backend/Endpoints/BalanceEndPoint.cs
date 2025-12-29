using System.Security.Claims;
using Mathsino.Backend.Interfaces;
using Mathsino.Backend.Models;

public static class BalanceEndPoints
{
    public static void MapBalanceEndPoints(this WebApplication app)
    {
        app.MapGet(
            "user/{id}/balance",
            async (int id, IBalanceService balanceService) =>
            {
                var balance = await balanceService.GetBalance(id);
                return Results.Ok(balance);
            }
        );

        // app.MapPost(
        //     "user/{id}/balance/add",
        //     async (int id, int amount, IBalanceService balanceService) =>
        //     {
        //         await balanceService.AddBalance(id, amount);
        //         var newBalance = await balanceService.GetBalance(id);
        //         return Results.Ok(newBalance);
        //     }
        // );

        // app.MapPost(
        //     "user/{id}/balance/deduct",
        //     async (int id, int amount, IBalanceService balanceService) =>
        //     {
        //         await balanceService.DeductBalance(id, amount);
        //         var newBalance = await balanceService.GetBalance(id);
        //         return Results.Ok(newBalance);
        //     }
        // );
        app.MapPost(
                "user/{id}/spin-wheel",
                async (int id, HttpContext context, MathsinoContext db) =>
                {
                    var loggedInUserIdString = context
                        .User.FindFirst(ClaimTypes.NameIdentifier)
                        ?.Value;
                    if (
                        !int.TryParse(loggedInUserIdString, out var loggedInUserId)
                        || loggedInUserId != id
                    )
                    {
                        return Results.Forbid();
                    }

                    var user = await db.Users.FindAsync(id);
                    if (user is null)
                    {
                        return Results.NotFound();
                    }

                    const int COOLDOWN_MINUTES = 24 * 60;
                    var now = DateTime.UtcNow;

                    if (user.LastSpinTime.HasValue)
                    {
                        var lastSpin = user.LastSpinTime.Value;

                        if (lastSpin.Kind != DateTimeKind.Utc)
                        {
                            lastSpin = lastSpin.ToUniversalTime();
                        }

                        var nextSpinAvailableAt = lastSpin.AddMinutes(COOLDOWN_MINUTES);

                        if (now < nextSpinAvailableAt)
                        {
                            var timeRemaining = nextSpinAvailableAt - now;

                            return Results.BadRequest(
                                new
                                {
                                    message = "Wymagana jest przerwa.",
                                    cooldownHours = timeRemaining.Hours,
                                    cooldownMinutes = timeRemaining.Minutes,
                                    cooldownSeconds = timeRemaining.Seconds,
                                    nextSpinAvailable = nextSpinAvailableAt,
                                    lastSpin = lastSpin,
                                }
                            );
                        }
                    }

                    var random = new Random();
                    int[] possibleRewards = { 100, 200, 400, 1000, 200, 400, 2000 };
                    int rewardIndex = random.Next(possibleRewards.Length);
                    int rewardAmount = possibleRewards[rewardIndex];

                    user.Balance += rewardAmount;
                    user.LastSpinTime = now;
                    await db.SaveChangesAsync();

                    return Results.Ok(
                        new
                        {
                            message = $"Wygrałeś: {rewardAmount} PLN!",
                            reward = rewardAmount,
                            rewardIndex = rewardIndex,
                            newBalance = user.Balance,
                            lastSpinTime = user.LastSpinTime,
                        }
                    );
                }
            )
            .RequireAuthorization();
    }
}
