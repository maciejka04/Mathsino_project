using Mathsino.Backend.Game;
using Mathsino.Backend.Models;
using Mathsino.Backend.Services;
using Microsoft.EntityFrameworkCore;

public static class UserEndPoints
{
    public static void MapUserEndPoints(this WebApplication app)
    {
        app.MapGet(
            "/users",
            async (MathsinoContext db) =>
            {
                var users = await db
                    .Users.Include(u => u.Friends)
                        .ThenInclude(uf => uf.Friend)
                    .Select(u => new UserDto(
                        u.Id,
                        u.FirstName,
                        u.LastName,
                        u.Email,
                        u.Friends.Select(f => new FriendDto(
                                f.Friend.Id,
                                f.Friend.FirstName,
                                f.Friend.LastName,
                                f.Friend.Email,
                                f.Friend.Balance,
                                f.Friend.AvatarPath
                            ))
                            .ToList(),
                        u.Balance,
                        u.AvatarPath
                    ))
                    .ToListAsync();

                return Results.Ok(users);
            }
        );

        app.MapGet(
            "/users/{id}",
            async (int id, MathsinoContext db) =>
            {
                var user = await db
                    .Users.Include(u => u.Friends)
                        .ThenInclude(uf => uf.Friend)
                    .Where(u => u.Id == id)
                    .Select(u => new UserDto(
                        u.Id,
                        u.FirstName,
                        u.LastName,
                        u.Email,
                        u.Friends.Select(f => new FriendDto(
                                f.Friend.Id,
                                f.Friend.FirstName,
                                f.Friend.LastName,
                                f.Friend.Email,
                                f.Friend.Balance,
                                f.Friend.AvatarPath
                            ))
                            .ToList(),
                        u.Balance,
                        u.AvatarPath
                    ))
                    .FirstOrDefaultAsync();

                return user is not null ? Results.Ok(user) : Results.NotFound();
            }
        );
        app.MapGet(
            "/users/{userId}/games",
            async (int userId, UsersService usersService) =>
            {
                try
                {
                    var games = await usersService.GetUserGamesByUserIdAsync(userId);
                    return Results.Ok(games);
                }
                catch (KeyNotFoundException ex)
                {
                    return Results.NotFound(new { message = ex.Message });
                }
            }
        );

        app.MapGet(
            "/users/{userId}/games/{gameId}",
            async (int userId, Guid gameId, UsersService usersService) =>
            {
                try
                {
                    var game = await usersService.GetUserGameByUserIdAndGameIdAsync(userId, gameId);
                    return Results.Ok(game);
                }
                catch (KeyNotFoundException ex)
                {
                    return Results.NotFound(new { message = ex.Message });
                }
            }
        );

        app.MapGet(
            "users/{userId}/stats",
            async (int userId, UsersService usersService) =>
            {
                try
                {
                    var stats = await usersService.GetUserStatsByIdAsync(userId);
                    return Results.Ok(stats);
                }
                catch (KeyNotFoundException ex)
                {
                    return Results.NotFound(new { message = ex.Message });
                }
            }
        );
    }
}
