using System.Collections.Generic;
using Mathsino.Backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace Mathsino.Backend.Endpoints;

/// <summary>
/// Minimal API endpoints supporting the Achievements feature.
/// No additional database tables are introduced – all progress and status
/// are stored directly on the existing Users table.
/// </summary>
public static class AchievementsEndPoints
{
    public static void MapAchievementsEndPoints(this WebApplication app)
    {
        // GET /users/{userId}/achievements – list of 16 achievements with current status (0/1/2)
        app.MapGet(
            "/users/{userId}/achievements",
            async (int userId, MathsinoContext db) =>
            {
                var user = await db.Users.FindAsync(userId);
                if (user is null)
                    return Results.NotFound();

                // Evaluate completion for each achievement based on user's progress properties.
                EvaluateAchievementsProgress(user);

                var list = new List<object>();
                for (int i = 1; i <= 16; i++)
                {
                    string prop = $"Achievement{i:00}Status";
                    var pi = typeof(User).GetProperty(prop);
                    if (pi is null) continue;
                    int status = (int)(pi.GetValue(user) ?? 0);
                    list.Add(new { Id = i, Status = status });
                }

                return Results.Ok(list);
            }
        );

        // POST /users/{userId}/achievements/{achievementId}/claim – claim reward once completed.
        app.MapPost(
            "/users/{userId}/achievements/{achievementId}/claim",
            async (int userId, int achievementId, MathsinoContext db) =>
            {
                if (achievementId < 1 || achievementId > 16)
                    return Results.BadRequest(new { message = "invalid achievementId" });

                var user = await db.Users.FindAsync(userId);
                if (user is null) return Results.NotFound();

                string prop = $"Achievement{achievementId:00}Status";
                var pi = typeof(User).GetProperty(prop);
                if (pi is null) return Results.BadRequest(new { message = "unsupported achievement" });

                int status = (int)(pi.GetValue(user) ?? 0);
                if (status != 1) // must be completed but not yet claimed
                    return Results.BadRequest(new { message = "achievement not claimable" });

                // Apply reward according to config
                ApplyReward(user, achievementId);

                // mark as claimed
                pi.SetValue(user, 2);
                await db.SaveChangesAsync();
                return Results.Ok(new { message = "reward granted" });
            }
        );
    }

    private static void EvaluateAchievementsProgress(User u)
    {
        // Helper to update status to 1 (completed) when criteria met.
        void SetCompleted(int achievementId, bool completed)
        {
            if (!completed) return;
            string prop = $"Achievement{achievementId:00}Status";
            var pi = typeof(User).GetProperty(prop);
            if (pi is null) return;
            int cur = (int)(pi.GetValue(u) ?? 0);
            if (cur == 0) pi.SetValue(u, 1);
        }

        // Achievement 1 – mixed conditions (lesson >=1, games>=5, spin>=1)
        SetCompleted(1, u.LessonsCompleted >= 1 && u.GamesPlayed >= 5 && u.SpinWheelCount >= 1);

        SetCompleted(2, u.LessonsCompleted >= 10);
        SetCompleted(3, u.Balance >= 3000);
        SetCompleted(4, u.Balance >= 7000);
        SetCompleted(5, u.Balance >= 10000);
        SetCompleted(6, u.Balance >= 20000);
        SetCompleted(7, u.Balance >= 100000);
        SetCompleted(8, u.LoginStreak >= 10);
        SetCompleted(9, u.SpinWheelCount >= 25);
        SetCompleted(10, u.FriendsCount >= 3);
        SetCompleted(11, u.GamesPlayed >= 100);
        SetCompleted(12, u.GamesPlayed >= 1000);
        SetCompleted(13, u.GamesPlayed >= 10000);
        SetCompleted(14, u.BlackjacksCount >= 1);
        SetCompleted(15, u.BlackjacksCount >= 10);
        SetCompleted(16, u.DoubleDownWins >= 5);
    }

    private static void ApplyReward(User user, int achievementId)
    {
        switch (achievementId)
        {
            // Cash rewards
            case 2:
                user.Balance += 1000;
                break;
            case 3:
                user.Balance += 500;
                break;
            case 4:
                user.Balance += 1000;
                break;
            case 8:
                user.Balance += 2000;
                break;
            case 10:
                user.Balance += 500;
                break;
            case 12:
                user.Balance += 5000;
                break;
            case 14:
                user.Balance += 200;
                break;
            // Avatars (reward is avatarPath update)
            case 1:
                user.AvatarPath = "parrot-teacher.png"; // example placeholder
                break;
            case 5:
                user.AvatarPath = "avatar_vip.png";
                break;
            case 6:
                user.AvatarPath = "avatar_rich.png";
                break;
            case 7:
                user.AvatarPath = "avatar_king.png";
                break;
            case 9:
                user.AvatarPath = "avatar_crazy.png";
                break;
            case 11:
                user.AvatarPath = "avatar_veteran.png";
                break;
            case 13:
                user.AvatarPath = "avatar_cyborg.png";
                break;
            case 15:
                user.AvatarPath = "avatar_ace.png";
                break;
            case 16:
                user.AvatarPath = "avatar_risk.png";
                break;
            default:
                break;
        }
    }
}
