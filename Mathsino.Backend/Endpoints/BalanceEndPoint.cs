using System.Security.Claims;
using Mathsino.Backend.Models;
using Mathsino.Backend.Services;
using Microsoft.EntityFrameworkCore;

public static class BalanceEndPoints
{
    public static void MapBalanceEndPoints(this WebApplication app)
    {
        app.MapGet(
            "user/{id}/balance",
            async (int id, MathsinoContext db) =>
            {
                var user = await db.Users.FindAsync(id);
                if (user is null)
                {
                    return Results.NotFound();
                }
                return Results.Ok(user.Balance);
            }
        );

        app.MapPost(
            "user/{id}/balance/add",
            async (int id, int amount, MathsinoContext db) =>
            {
                var user = await db.Users.FindAsync(id);
                if (user is null)
                {
                    return Results.NotFound();
                }
                user.Balance += amount;
                await db.SaveChangesAsync();
                return Results.Ok(user.Balance);
            }
        );

        app.MapPost(
            "user/{id}/balance/deduct",
            async (int id, int amount, MathsinoContext db) =>
            {
                var user = await db.Users.FindAsync(id);
                if (user is null)
                {
                    return Results.NotFound();
                }

                if (user.Balance < amount)
                {
                    return Results.BadRequest("Insufficient balance");
                }
                user.Balance -= amount;
                await db.SaveChangesAsync();
                return Results.Ok(user.Balance);
            }
        );
        app.MapPost(
            "user/{id}/claim-ad-reward",
            async (int id, BalanceService balanceService) =>
            {
                try
                {
                    // Dodaj nagrodę
                    await balanceService.AddBalance(id, 50);

                    await balanceService.SaveBalanceSnapshot(id);

                    int newBalance = await balanceService.GetBalance(id);
                    return Results.Ok(new { balance = newBalance });
                }
                catch (KeyNotFoundException ex)
                {
                    return Results.NotFound(new { message = ex.Message });
                }
                catch (Exception ex)
                {
                    return Results.Problem(ex.Message);
                }
            }
        )
        .RequireAuthorization();
        app.MapPost(
            "user/{id}/spin-wheel",
            async (int id, HttpContext context, MathsinoContext db) =>
            {
                var loggedInUserIdString = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(loggedInUserIdString, out var loggedInUserId) || loggedInUserId != id)
                {
                    return Results.Forbid();
                }

                var user = await db.Users.FindAsync(id);
                if (user is null)
                {
                    return Results.NotFound();
                }

                const int COOLDOWN_MINUTES = 1; //docelowo zmienic na 24*60
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

                        return Results.BadRequest(new
                        {
                            message = "Wymagana jest przerwa.",
                            cooldownHours = timeRemaining.Hours,
                            cooldownMinutes = timeRemaining.Minutes,
                            cooldownSeconds = timeRemaining.Seconds,
                            nextSpinAvailable = nextSpinAvailableAt,
                            lastSpin = lastSpin
                        });
                    }
                }

                
                                
                
                var random = new Random();
                int[] possibleRewards = { 100, 100, 100, 200, 200, 300, 500 }; 
                int rewardIndex = random.Next(possibleRewards.Length);
                int rewardAmount = possibleRewards[rewardIndex];

                user.Balance += rewardAmount;
                user.LastSpinTime = now;
                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    message = $"Wygrałeś: {rewardAmount} PLN!",
                    reward = rewardAmount,
                    rewardIndex = rewardIndex, 
                    newBalance = user.Balance,
                    lastSpinTime = user.LastSpinTime 
                });
            }
        )
        .RequireAuthorization();

        
    }
}
