using System.Threading.Tasks;

namespace Mathsino.Backend.Services;

public class GameService(ILogger<GameService>? logger, IServiceScopeFactory scopeFactory)
{
    private readonly Dictionary<Guid, Game.Game> _games = [];

    public async Task<Game.Game> CreateSinglePlayerGame(int userId)
    {
        logger?.LogInformation("Creating single-player game for user ID {UserId}", userId);

        using var scope = scopeFactory.CreateScope();
        var usersService = scope.ServiceProvider.GetRequiredService<UsersService>();
        var user = await usersService.GetUserByIdAsync(userId);

        var player = new Game.Player { User = user };
        var game = new Game.Game { Type = Game.GameType.SinglePlayer };
        game.AddPlayer(player);
        _games[game.Id] = game;
        game.StartGame();
        return game;
    }

    public async Task<Game.Game> CreateMultiPlayerGame(int userId)
    {
        logger?.LogInformation("Creating multi-player game for user ID {UserId}", userId);

        using var scope = scopeFactory.CreateScope();
        var usersService = scope.ServiceProvider.GetRequiredService<UsersService>();
        var user = await usersService.GetUserByIdAsync(userId);

        var player = new Game.Player { User = user };
        var game = new Game.Game { Type = Game.GameType.MultiPlayer };
        game.AddPlayer(player);
        _games[game.Id] = game;
        return game;
    }

    public Game.Game GetGameById(Guid gameId)
    {
        logger?.LogInformation("Fetching game with ID {GameId}", gameId);
        if (_games.TryGetValue(gameId, out var game))
        {
            return game;
        }
        throw new KeyNotFoundException($"Game with ID {gameId} not found.");
    }

    public Game.Game PlayerHit(Guid gameId, Guid playerId)
    {
        logger?.LogInformation("Player {PlayerId} hits in game {GameId}", playerId, gameId);
        var game = GetGameById(gameId);
        game.PlayerHit(playerId);
        return game;
    }

    public Game.Game PlayerPass(Guid gameId, Guid playerId)
    {
        logger?.LogInformation("Player {PlayerId} passes in game {GameId}", playerId, gameId);
        var game = GetGameById(gameId);
        game.PlayerPass(playerId);
        return game;
    }

    public Game.Game PlayerDouble(Guid gameId, Guid playerId)
    {
        logger?.LogInformation("Player {PlayerId} doubles in game {GameId}", playerId, gameId);
        var game = GetGameById(gameId);
        game.PlayerDouble(playerId);
        return game;
    }

    public Game.Game CheckResults(Guid gameId, Guid playerId)
    {
        logger?.LogInformation(
            "Checking results for player {PlayerId} in game {GameId}",
            playerId,
            gameId
        );
        var game = GetGameById(gameId);
        game.CheckResults(playerId);
        return game;
    }

}