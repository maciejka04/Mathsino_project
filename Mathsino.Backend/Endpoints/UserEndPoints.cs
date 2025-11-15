using Mathsino.Backend.Models;
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
                                f.Friend.Email
                            ))
                            .ToList()
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
                                f.Friend.Email
                            ))
                            .ToList()
                    ))
                    .FirstOrDefaultAsync();

                return user is not null ? Results.Ok(user) : Results.NotFound();
            }
        );
    }
}
