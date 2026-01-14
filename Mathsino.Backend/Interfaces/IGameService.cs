using Mathsino.Backend.Models;

namespace Mathsino.Backend.Interfaces;

public interface IGameService
{
    AnalysisResult AnalyzeMove(AnalyzeMoveRequest request);
    Task<Game.Game> CheckResults(Guid gameId, Guid playerId);
    Task<Game.Game> CreateMultiPlayerGame(int userId);
    Task<Game.Game> CreateSinglePlayerGame(int userId, int betAmount);
    Task<Game.Game?> GetActiveGameForUserAsync(int userId);
    Game.Game GetGameById(Guid gameId);
    Task<Game.Game> PlayerDouble(Guid gameId, Guid playerId);
    Task<Game.Game> PlayerDoubleSplit(Guid gameId, Guid playerId);
    Task<Game.Game> PlayerHit(Guid gameId, Guid playerId);
    Task<Game.Game> PlayerHitSplit(Guid gameId, Guid playerId);
    Task<Game.Game> PlayerPass(Guid gameId, Guid playerId);
    Task<Game.Game> PlayerSplit(Guid gameId, Guid playerId);
}
