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
        );
    }
}
