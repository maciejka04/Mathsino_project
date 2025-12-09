using Mathsino.Backend.Game;
using Mathsino.Backend.Models;
using Mathsino.Backend.Services;
using Microsoft.EntityFrameworkCore;

public record UserLanguageDto(string Language);

public record UserMusicDto(int MusicId);

public record UserAudioSettingsDto(bool MusicEnabled, bool SoundEffectsEnabled);

public static class UserEndPoints
{
    public static void MapUserEndPoints(this WebApplication app)
    {
        app.MapGet(
            "/users",
            async (UsersService usersService) =>
            {
                var users = await usersService.GetUsersAsync();
                return Results.Ok(users);
            }
        );

        app.MapGet(
            "/users/{id}",
            async (int id, UsersService usersService) =>
            {
                var users = await usersService.GetUserByIdAsync(id);
                return Results.Ok(users);
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
