using Mathsino.Backend.Game;
using Mathsino.Backend.Interfaces;
using Mathsino.Backend.Models;
using Mathsino.Backend.Services;
using Microsoft.EntityFrameworkCore;

namespace Mathsino.Backend.Endpoints;

public static class GameEndPoints
{
    public static void MapGameEndPoints(this WebApplication app)
    {
        app.MapPost(
                "/games/create-singleplayer",
                async (int userId, int betAmount, IGameService gameService) =>
                {
                    try
                    {
                        var game = await gameService.CreateSinglePlayerGame(userId, betAmount);
                        return Results.Ok(game);
                    }
                    catch (InvalidOperationException ex)
                    {
                        return Results.BadRequest(ex.Message);
                    }
                }
            )
            .RequireAuthorization();

        app.MapGet(
                "/games/active-singleplayer",
                async (int userId, IGameService gameService) =>
                {
                    var game = await gameService.GetActiveGameForUserAsync(userId);
                    if (game == null)
                        return Results.NotFound();
                    return Results.Ok(game);
                }
            )
            .RequireAuthorization();

        app.MapGet(
            "/games/{gameId}",
            (IGameService gameService, Guid gameId) => Results.Ok(gameService.GetGameById(gameId))
        );

        app.MapGet(
            "/games/{gameId}/player-hit/{playerId}",
            async (IGameService gameService, Guid gameId, Guid playerId) =>
                await gameService.PlayerHit(gameId, playerId)
        );

        app.MapGet(
            "/games/{gameId}/player-pass/{playerId}",
            async (IGameService gameService, Guid gameId, Guid playerId) =>
                await gameService.PlayerPass(gameId, playerId)
        );

        app.MapPost(
            "/games/{gameId}/player-double/{playerId}",
            async (Guid gameId, Guid playerId, IGameService gameService) =>
            {
                try
                {
                    var game = await gameService.PlayerDouble(gameId, playerId);
                    return Results.Ok(game);
                }
                catch (InvalidOperationException ex)
                {
                    return Results.BadRequest(ex.Message);
                }
            }
        );

        app.MapPost(
            "/games/{gameId}/player-split/{playerId}",
            async (IGameService gameService, Guid gameId, Guid playerId) =>
            {
                try
                {
                    var game = await gameService.PlayerSplit(gameId, playerId);
                    return Results.Ok(game);
                }
                catch (InvalidOperationException ex)
                {
                    return Results.BadRequest(ex.Message);
                }
            }
        );

        app.MapPost(
            "/games/{gameId}/player-hit-split/{playerId}",
            async (IGameService gameService, Guid gameId, Guid playerId) =>
                await gameService.PlayerHitSplit(gameId, playerId)
        );

        app.MapPost(
            "/games/{gameId}/player-double-split/{playerId}",
            async (Guid gameId, Guid playerId, IGameService gameService) =>
            {
                try
                {
                    var game = await gameService.PlayerDoubleSplit(gameId, playerId);
                    return Results.Ok(game);
                }
                catch (InvalidOperationException ex)
                {
                    return Results.BadRequest(ex.Message);
                }
                catch (KeyNotFoundException ex)
                {
                    return Results.NotFound(ex.Message);
                }
            }
        );

        app.MapGet(
            "/games/{gameId}/check-results/{playerId}",
            async (IGameService gameService, Guid gameId, Guid playerId) =>
                await gameService.CheckResults(gameId, playerId)
        );

        app.MapPost(
            "/games/analyze-move",
            (IGameService gameService, AnalyzeMoveRequest request) =>
            {
                var result = gameService.AnalyzeMove(request);
                return Results.Ok(result);
            }
        );
    }
}
