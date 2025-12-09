using Mathsino.Backend.Models;
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
    }
}