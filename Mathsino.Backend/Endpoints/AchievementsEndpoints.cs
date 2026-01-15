using Mathsino.Backend.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace Mathsino.Backend.Endpoints;

public static class AchievementsEndpoints
{
    public static void MapAchievementsEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/users/{userId}/achievements");

        group.MapGet("/", async (int userId, IAchievementService service) =>
        {
            try
            {
                var list = await service.GetUserAchievementsAsync(userId);
                return Results.Ok(list);
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound();
            }
        });

        group.MapPost("/{achievementId}/claim", async (int userId, int achievementId, IAchievementService service) =>
        {
            try
            {
                await service.ClaimAchievementRewardAsync(userId, achievementId);
                return Results.Ok();
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound();
            }
        });
    }
}
