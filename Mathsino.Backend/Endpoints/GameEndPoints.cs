using Mathsino.Backend.Models;
using Mathsino.Backend.Services;
using Microsoft.EntityFrameworkCore;

public static class GameEndPoints
{
    public static void MapGameEndPoints(this WebApplication app)
    {
        app.MapGet("/games/create-singleplayer", async (GameService gameService, int userId) =>
            Results.Ok(await gameService.CreateSinglePlayerGame(userId)));

        app.MapGet("/games/{gameId}", (GameService gameService, Guid gameId) =>
            Results.Ok(gameService.GetGameById(gameId)));

        app.MapGet("/games/{gameId}/player-hit/{playerId}", (GameService gameService, Guid gameId, Guid playerId) =>
            gameService.PlayerHit(gameId, playerId));

        app.MapGet("/games/{gameId}/player-pass/{playerId}", (GameService gameService, Guid gameId, Guid playerId) =>
            gameService.PlayerPass(gameId, playerId));

        app.MapPost("/games/{gameId}/player-double/{playerId}", (GameService gameService, Guid gameId, Guid playerId) =>
            gameService.PlayerDouble(gameId, playerId));

        app.MapPost("/games/{gameId}/player-split/{playerId}", (GameService gameService, Guid gameId, Guid playerId) =>
            gameService.PlayerSplit(gameId, playerId));

        app.MapPost("/games/{gameId}/player-hit-split/{playerId}", (GameService gameService, Guid gameId, Guid playerId) =>
            gameService.PlayerHitSplit(gameId, playerId));

        app.MapPost("/games/{gameId}/player-double-split/{playerId}", (GameService gameService, Guid gameId, Guid playerId) =>
            gameService.PlayerDoubleSplit(gameId, playerId));

        app.MapGet("games/{gameId}/check-results/{playerId}", (GameService gameService, Guid gameId, Guid playerId) =>
            gameService.CheckResults(gameId, playerId));
    }
}
