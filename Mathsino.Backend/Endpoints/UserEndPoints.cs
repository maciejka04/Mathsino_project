using Mathsino.Backend.Interfaces;
using Mathsino.Backend.Models;
using Mathsino.Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Ważne dla FindAsync
using System.Text.Json;

public record UserLanguageDto(string Language);

public record UserMusicDto(int MusicId);

public record UserAudioSettingsDto(bool MusicEnabled, bool SoundEffectsEnabled);

public static class UserEndPoints
{
    public static void MapUserEndPoints(this WebApplication app)
    {
        // --- ISTNIEJĄCE ENDPOINTY ---

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

        app.MapPut(
            "/users/{id}/progress/{completedLessons}",
            async (int id, int completedLessons, MathsinoContext db) =>
            {
                var user = await db.Users.FindAsync(id);
                if (user is null) return Results.NotFound();

                if (completedLessons > user.LessonsCompleted)
                {
                    user.LessonsCompleted = completedLessons;
                    await db.SaveChangesAsync();
                }
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

        // --- NOWE ENDPOINTY DLA OSIĄGNIĘĆ ---

        // 1. Pobierz listę odebranych osiągnięć
        app.MapGet("/users/{id}/achievements", async (int id, MathsinoContext db) =>
        {
            var user = await db.Users.FindAsync(id);
            if (user == null) return Results.NotFound();

            if (string.IsNullOrEmpty(user.ClaimedAchievements))
                return Results.Ok(new List<int>());

            var ids = user.ClaimedAchievements
                          .Split(',', StringSplitOptions.RemoveEmptyEntries)
                          .Select(int.Parse)
                          .ToList();
            return Results.Ok(ids);
        });

        // 2. Odbierz nagrodę (z weryfikacją warunków)
        app.MapPost("/users/{id}/achievements/claim", async (int id, int achievementId, MathsinoContext db, IUsersService usersService) =>
        {
            var user = await db.Users.FindAsync(id);
            if (user == null) return Results.NotFound();

            // Parsowanie listy odebranych
            var claimedIds = string.IsNullOrEmpty(user.ClaimedAchievements)
                ? new List<int>()
                : user.ClaimedAchievements.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList();

            if (claimedIds.Contains(achievementId))
            {
                return Results.BadRequest(new { message = "Już odebrano tę nagrodę." });
            }

            // Pobranie statystyk do weryfikacji
            var stats = await usersService.GetUserStatsByIdAsync(id);

            // [DEBUG] Wypisujemy w konsoli stan faktyczny (BEZ FRIENDS COUNT)
            Console.WriteLine($"[CLAIM DEBUG] User: {user.UserName}, AchivID: {achievementId}");
            Console.WriteLine($"[CLAIM DEBUG] Stats: TotalGames={stats.TotalGames}, Balance={user.Balance}, Streak={stats.DaysStreak}");
            Console.WriteLine($"[CLAIM DEBUG] User Fields: Spins={user.SpinWheelCount}, DoubleWins={user.DoubleDownWins}, Lessons={user.LessonsCompleted}");

            // LOGIKA WERYFIKACJI (musi się zgadzać z achievementsConfig.js)
            bool conditionMet = false;
            int rewardValue = 0;

            switch (achievementId)
            {
                case 1: // First Steps (1 game)
                    conditionMet = stats.TotalGames >= 1;
                    rewardValue = 100;
                    break;
                case 2: // Regular Player (50 games)
                    conditionMet = stats.TotalGames >= 50;
                    rewardValue = 1000;
                    break;
                case 3: // High Roller (Balance 5000)
                    conditionMet = user.Balance >= 2000; 
                    rewardValue = 2000;
                    break;
                case 4: // Streak Master (Login 3 days)
                    conditionMet = stats.DaysStreak >= 3;
                    rewardValue = 500;
                    break;
                case 5: // Blackjack King (10 Blackjacks)
                    conditionMet = stats.BlackJacks >= 10;
                    rewardValue = 1500;
                    break;
                case 6: // Spin Enthusiast (5 spins)
                    conditionMet = user.SpinWheelCount >= 5;
                    rewardValue = 300;
                    break;
                case 7: // Social Butterfly (3 friends)
                    // conditionMet = stats.FriendsCount >= 3; // TYMCZASOWO WYŁĄCZONE
                    conditionMet = false; 
                    rewardValue = 500;
                    break;
                case 8: // Double Trouble (5 Double Down wins)
                    conditionMet = user.DoubleDownWins >= 5;
                    rewardValue = 1000;
                    break;
                case 9: // Scholar (5 lessons)
                    conditionMet = user.LessonsCompleted >= 5;
                    rewardValue = 800;
                    break;
                case 10: // Grand Master (100 games)
                    conditionMet = stats.TotalGames >= 100;
                    rewardValue = 5000; 
                    break;
                default:
                    return Results.BadRequest(new { message = "Nieznane ID osiągnięcia." });
            }

            if (!conditionMet)
            {
                return Results.BadRequest(new { message = "Nie spełniono warunków do odebrania nagrody (Sprawdź konsolę serwera)." });
            }

            // Przyznanie nagrody
            user.Balance += rewardValue;
            
            // Zapisanie faktu odebrania
            claimedIds.Add(achievementId);
            user.ClaimedAchievements = string.Join(",", claimedIds);

            await db.SaveChangesAsync();

            return Results.Ok(new
            {
                message = "Nagroda odebrana!",
                newBalance = user.Balance,
                claimedId = achievementId
            });
        });
    }
}