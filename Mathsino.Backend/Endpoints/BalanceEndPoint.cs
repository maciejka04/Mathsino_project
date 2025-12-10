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
        // Wymagaj, aby endpoint był wywoływany przez zalogowanego użytkownika
        .RequireAuthorization();
    }
}