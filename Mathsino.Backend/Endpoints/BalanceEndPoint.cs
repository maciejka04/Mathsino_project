using Mathsino.Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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
            "user/{id}/claim-ad-reward", // Ta ścieżka była wcześniej niedostępna (404)
            async (int id, HttpContext context, MathsinoContext db) =>
            {
                // 1. AUTORYZACJA: Sprawdź, czy zalogowany użytkownik jest tym, dla którego przyznajemy nagrodę
                var loggedInUserIdString = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (!int.TryParse(loggedInUserIdString, out var loggedInUserId) || loggedInUserId != id)
                {
                    // Użytkownik próbował przyznać nagrodę innemu ID
                    return Results.Forbid(); 
                }

                var user = await db.Users.FindAsync(id);
                if (user is null)
                {
                    return Results.NotFound();
                }

                // Ustal kwotę nagrody (zgodnie z frontendem było 50)
                const int REWARD_AMOUNT = 50; 
                
                // 2. Przyznaj nagrodę
                user.Balance += REWARD_AMOUNT;
                await db.SaveChangesAsync();

                // Możesz zwrócić aktualny balans lub wiadomość o sukcesie
                return Results.Ok(new { message = $"Przyznano nagrodę: {REWARD_AMOUNT} PLN", newBalance = user.Balance });
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