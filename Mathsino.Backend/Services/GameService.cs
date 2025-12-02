using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mathsino.Backend.Game;
using Mathsino.Backend.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Mathsino.Backend.Services
{
    public class GameService
    {
        private readonly ILogger<GameService>? logger;
        private readonly IServiceScopeFactory scopeFactory;
        private readonly Dictionary<Guid, Mathsino.Backend.Game.Game> _games =
            new Dictionary<Guid, Mathsino.Backend.Game.Game>();

        public GameService(ILogger<GameService>? logger, IServiceScopeFactory scopeFactory)
        {
            this.logger = logger;
            this.scopeFactory = scopeFactory;
        }

        public async Task<Mathsino.Backend.Game.Game> CreateSinglePlayerGame(int userId)
        {
            logger?.LogInformation("Creating single-player game for user ID {UserId}", userId);

            using var scope = scopeFactory.CreateScope();
            var usersService = scope.ServiceProvider.GetRequiredService<UsersService>();
            var user = await usersService.GetUserByIdAsync(userId);

            var player = new Mathsino.Backend.Game.Player { User = user };
            var game = new Mathsino.Backend.Game.Game
            {
                Type = Mathsino.Backend.Game.GameType.SinglePlayer,
            };
            game.AddPlayer(player);
            _games[game.Id] = game;
            game.StartGame();
            return game;
        }

        public async Task<Mathsino.Backend.Game.Game> CreateMultiPlayerGame(int userId)
        {
            logger?.LogInformation("Creating multi-player game for user ID {UserId}", userId);

            using var scope = scopeFactory.CreateScope();
            var usersService = scope.ServiceProvider.GetRequiredService<UsersService>();
            var user = await usersService.GetUserByIdAsync(userId);

            var player = new Mathsino.Backend.Game.Player { User = user };
            var game = new Mathsino.Backend.Game.Game
            {
                Type = Mathsino.Backend.Game.GameType.MultiPlayer,
            };
            game.AddPlayer(player);
            _games[game.Id] = game;
            return game;
        }

        public Mathsino.Backend.Game.Game GetGameById(Guid gameId)
        {
            logger?.LogInformation("Fetching game with ID {GameId}", gameId);
            if (_games.TryGetValue(gameId, out var game))
                return game;
            throw new KeyNotFoundException($"Game with ID {gameId} not found.");
        }

        public Mathsino.Backend.Game.Game PlayerHit(Guid gameId, Guid playerId)
        {
            logger?.LogInformation("Player {PlayerId} hits in game {GameId}", playerId, gameId);
            var game = GetGameById(gameId);
            game.PlayerHit(playerId);
            return game;
        }

        public Mathsino.Backend.Game.Game PlayerPass(Guid gameId, Guid playerId)
        {
            logger?.LogInformation("Player {PlayerId} passes in game {GameId}", playerId, gameId);
            var game = GetGameById(gameId);
            game.PlayerPass(playerId);
            return game;
        }

        public Mathsino.Backend.Game.Game PlayerDouble(Guid gameId, Guid playerId)
        {
            logger?.LogInformation("Player {PlayerId} doubles in game {GameId}", playerId, gameId);
            var game = GetGameById(gameId);
            game.PlayerDouble(playerId);
            return game;
        }

        public Mathsino.Backend.Game.Game PlayerSplit(Guid gameId, Guid playerId)
        {
            logger?.LogInformation("Player {PlayerId} splits in game {GameId}", playerId, gameId);
            var game = GetGameById(gameId);
            game.PlayerSplit(playerId);
            return game;
        }

        public Mathsino.Backend.Game.Game PlayerHitSplit(Guid gameId, Guid playerId)
        {
            logger?.LogInformation(
                "Player {PlayerId} hits split in game {GameId}",
                playerId,
                gameId
            );
            var game = GetGameById(gameId);
            game.PlayerHitSplit(playerId);
            return game;
        }

        public Mathsino.Backend.Game.Game PlayerDoubleSplit(Guid gameId, Guid playerId)
        {
            logger?.LogInformation(
                "Player {PlayerId} doubles split in game {GameId}",
                playerId,
                gameId
            );
            var game = GetGameById(gameId);
            game.PlayerDoubleSplit(playerId);
            return game;
        }

        public async Task<Mathsino.Backend.Game.Game> CheckResults(Guid gameId, Guid playerId)
        {
            logger?.LogInformation(
                "Checking results for player {PlayerId} in game {GameId}",
                playerId,
                gameId
            );
            var game = GetGameById(gameId);
            game.CheckResults(playerId);
            await SaveResultsInDB(game);
            return game;
        }

        private async Task SaveResultsInDB(Game.Game game)
        {
            logger?.LogInformation("Saving game results to database for game ID {GameId}", game.Id);
            using var scope = scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<MathsinoContext>();

            foreach (var player in game.Players)
            {
                logger?.LogInformation(
                    "Saving result for player ID {PlayerId} in game ID {GameId}",
                    player.PlayerId,
                    game.Id
                );
                var singleGameRecord = new SingleGame
                {
                    GameId = game.Id,
                    UserId = player.User.Id,
                    PlayerId = player.PlayerId,
                    StartTime = game.StartTime,
                    EndTime = DateTime.Now,
                    SingleGameResult = player.Result,
                    BalanceAfterGame = player.User.Balance,
                };
                dbContext.SingleGames.Add(singleGameRecord);
            }
            await dbContext.SaveChangesAsync();
            logger?.LogInformation("Game results saved successfully for game ID {GameId}", game.Id);
        }

        public AnalysisResult AnalyzeMove(AnalyzeMoveRequest request)
        {
            var playerHand = request
                .PlayerHandCards.Select(c => new Card { Rank = c.Rank, Suit = c.Suit })
                .ToList();

            var dealerCard = new Card
            {
                Rank = request.DealerCard.Rank,
                Suit = request.DealerCard.Suit,
            };

            if (!Enum.TryParse<BlackjackStrategy.Move>(request.Action, true, out var action))
            {
                throw new ArgumentException($"Invalid action: {request.Action}");
            }

            var result = BlackjackStrategy.AnalyzeMove(
                playerHand,
                dealerCard,
                action,
                request.CanSplit,
                request.CanDouble
            );

            return new AnalysisResult(result.IsCorrect, result.CorrectMove, result.Reasoning);
        }
    }
}
