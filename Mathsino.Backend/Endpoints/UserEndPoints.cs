using Mathsino.Backend.Interfaces;
using Mathsino.Backend.Models;
using Mathsino.Backend.Services;

public record UserLanguageDto(string Language);

public record UserMusicDto(int MusicId);

public record UserAudioSettingsDto(bool MusicEnabled, bool SoundEffectsEnabled);

public static class UserEndPoints
{
    public static void MapUserEndPoints(this WebApplication app)
    {
        app.MapGet(
            "/users",
            async (IUsersService usersService) =>
            {
                var users = await usersService.GetUsersAsync();
                return Results.Ok(users);
            }
        );

        app.MapGet(
            "/users/{id}",
            async (int id, IUsersService usersService) =>
            {
                var users = await usersService.GetUserByIdAsync(id);
                return Results.Ok(users);
            }
        );

        app.MapGet(
            "userinfo",
            async (HttpContext context, IBalanceService balanceService) =>
            {
                return context
                    .User.Identities.First()
                    .Claims.Select(c => new
                    {
                        Type = c.Type.ToString(),
                        Value = c.Value.ToString(),
                        Subject = c.Subject?.ToString(),
                    })
                    .ToList();
            }
        );

        app.MapGet(
            "/users/user-name/{userName}",
            async (string userName, IUsersService usersService) =>
            {
                var user = await usersService.GetUserByUserNameAsync(userName);
                return Results.Ok(user);
            }
        );

        app.MapPut(
            "/users/{userId}/user-name/{newUserName}",
            async (int userId, string newUserName, IUserNameService userNameService) =>
            {
                try
                {
                    var (success, message) = await userNameService.ChangeUserNameAsync(
                        userId,
                        newUserName
                    );

                    if (success)
                    {
                        return Results.Ok(new { message });
                    }

                    return Results.BadRequest(new { message });
                }
                catch (Exception ex)
                {
                    return Results.BadRequest(new { message = ex.Message });
                }
            }
        );
        app.MapGet(
            "/users/{userId}/games",
            async (int userId, IUsersService usersService) =>
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

        // Update user language preference
        app.MapPut(
            "/users/{id}/language",
            async (int id, UserLanguageDto dto, MathsinoContext db) =>
            {
                var user = await db.Users.FindAsync(id);
                if (user is null)
                    return Results.NotFound();
                user.Language = dto.Language;
                await db.SaveChangesAsync();
                return Results.NoContent();
            }
        );

        // Update user music preference
        app.MapPut(
            "/users/{id}/music",
            async (int id, UserMusicDto dto, MathsinoContext db) =>
            {
                var user = await db.Users.FindAsync(id);
                if (user is null)
                    return Results.NotFound();
                user.MusicId = dto.MusicId;
                await db.SaveChangesAsync();
                return Results.NoContent();
            }
        );

        // Update user audio settings
        app.MapPut(
            "/users/{id}/audio-settings",
            async (int id, UserAudioSettingsDto dto, MathsinoContext db) =>
            {
                var user = await db.Users.FindAsync(id);
                if (user is null)
                    return Results.NotFound();
                user.MusicEnabled = dto.MusicEnabled;
                user.SoundEffectsEnabled = dto.SoundEffectsEnabled;
                await db.SaveChangesAsync();
                return Results.NoContent();
            }
        );

        app.MapGet(
            "/users/{userId}/games/{gameId}",
            async (int userId, Guid gameId, IUsersService usersService) =>
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
            async (int userId, IUsersService usersService) =>
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

        app.MapGet(
            "/users/{userId}/friends/ranking",
            async (int userId, IUsersService usersService) =>
            {
                try
                {
                    var ranking = await usersService.GetFriendsRankingAsync(userId);
                    return Results.Ok(ranking);
                }
                catch (Exception ex)
                {
                    return Results.BadRequest(new { message = ex.Message });
                }
            }
        );

        app.MapGet(
            "/users/{userId}/friends/ranking/weekly",
            async (int userId, IUsersService usersService) =>
            {
                var lastWeek = DateTime.UtcNow.AddDays(-7);
                var ranking = await usersService.GetFriendsRankingByPeriodAsync(userId, lastWeek);
                return Results.Ok(ranking);
            }
        );

        app.MapGet(
            "/users/{userId}/friends/ranking/monthly",
            async (int userId, IUsersService usersService) =>
            {
                var lastMonth = DateTime.UtcNow.AddDays(-30);
                var ranking = await usersService.GetFriendsRankingByPeriodAsync(userId, lastMonth);
                return Results.Ok(ranking);
            }
        );

        app.MapGet(
            "/users/ranking/global",
            async (IUsersService usersService) =>
            {
                var ranking = await usersService.GetGlobalRankingAsync();
                return Results.Ok(ranking);
            }
        );

        app.MapGet(
            "/users/ranking/weekly",
            async (IUsersService usersService) =>
            {
                var lastWeek = DateTime.Now.AddDays(-7);
                var ranking = await usersService.GetGlobalRankingByPeriodAsync(lastWeek);
                return Results.Ok(ranking);
            }
        );

        app.MapGet(
            "/users/ranking/monthly",
            async (IUsersService usersService) =>
            {
                var lastMonth = DateTime.Now.AddDays(-30);
                var ranking = await usersService.GetGlobalRankingByPeriodAsync(lastMonth);
                return Results.Ok(ranking);
            }
        );
    }
}
