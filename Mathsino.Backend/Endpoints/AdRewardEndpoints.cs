// Infrastructure/AdRewardEndpointsExtensions.cs
using System.Security.Claims;
using Mathsino.Backend.Interfaces;
using Mathsino.Backend.Models;
using Mathsino.Backend.Services;

namespace Mathsino.Backend.Infrastructure;

public static class AdRewardEndpointsExtensions
{
    public static WebApplication MapAdRewardEndpoints(this WebApplication app)
    {
        app.MapPost(
                "user/{id}/start-ad-view",
                async (int id, HttpContext context, IAdRewardService adRewardService) =>
                {
                    try
                    {
                        var response = await adRewardService.StartAdViewAsync(id);
                        return Results.Ok(response);
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
            )
            .RequireAuthorization();

        app.MapPost(
                "user/{id}/claim-ad-reward",
                async (
                    int id,
                    ClaimAdRewardRequest request,
                    HttpContext context,
                    IAdRewardService adRewardService
                ) =>
                {
                    try
                    {
                        var response = await adRewardService.ClaimAdRewardAsync(id, request.Token);
                        return Results.Ok(response);
                    }
                    catch (InvalidOperationException ex)
                    {
                        return Results.BadRequest(new { message = ex.Message });
                    }
                    catch (Exception ex)
                    {
                        return Results.Problem(ex.Message);
                    }
                }
            )
            .RequireAuthorization();
        return app;
    }
}
