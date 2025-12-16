using Mathsino.Backend.Game;
using Mathsino.Backend.Models;
using Mathsino.Backend.Services;
using Microsoft.EntityFrameworkCore;

public static class GameEndPoints
{
    extension(WebApplication app)
    {
        public void MapGameEndPoints()
        {
            app.MapPost(
                "/games/create-singleplayer",
                async (int userId, int betAmount, GameService gameService) =>
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
            );

            app.MapGet(
                "/games/{gameId}",
                (GameService gameService, Guid gameId) =>
                    Results.Ok(gameService.GetGameById(gameId))
            );

            app.MapGet(
                "/games/{gameId}/player-hit/{playerId}",
                (GameService gameService, Guid gameId, Guid playerId) =>
                    gameService.PlayerHit(gameId, playerId)
            );

            app.MapGet(
                "/games/{gameId}/player-pass/{playerId}",
                (GameService gameService, Guid gameId, Guid playerId) =>
                    gameService.PlayerPass(gameId, playerId)
            );

            app.MapPost(
                "/games/{gameId:guid}/player-double/{playerId:guid}",
                async (Guid gameId, Guid playerId, GameService gameService) =>
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
                async (GameService gameService, Guid gameId, Guid playerId) =>
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
                (GameService gameService, Guid gameId, Guid playerId) =>
                    gameService.PlayerHitSplit(gameId, playerId)
            );

            app.MapPost(
                "/games/{gameId}/player-double-split/{playerId}",
                async (Guid gameId, Guid playerId, GameService gameService) =>
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
                "games/{gameId}/check-results/{playerId}",
                (GameService gameService, Guid gameId, Guid playerId) =>
                    gameService.CheckResults(gameId, playerId)
            );

            app.MapPost(
                "/games/analyze-move",
                (GameService gameService, AnalyzeMoveRequest request) =>
                {
                    var result = gameService.AnalyzeMove(request);
                    return Results.Ok(result);
                }
            );
        }
    }
}
