using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mathsino.Backend.Game;
using Mathsino.Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Mathsino.Backend.Services
{
    public class GameService
    {
        private readonly ILogger<GameService>? logger;
        private readonly IServiceScopeFactory scopeFactory;
        private readonly BalanceService balanceService;
        private static readonly Dictionary<Guid, Mathsino.Backend.Game.Game> _games = new();
        private static readonly object _gamesLock = new object();

        public GameService(
            ILogger<GameService>? logger,
            IServiceScopeFactory scopeFactory,
            BalanceService balanceService
        )
        {
            this.logger = logger;
            this.scopeFactory = scopeFactory;
            this.balanceService = balanceService;
        }

        public async Task<Mathsino.Backend.Game.Game> CreateSinglePlayerGame(
            int userId,
            int betAmount
        )
        {
            logger?.LogInformation("Creating single-player game for user ID {UserId}", userId);

            if (!await balanceService.DeductBalance(userId, betAmount))
            {
                throw new InvalidOperationException("Insufficient balance");
            }

            using var scope = scopeFactory.CreateScope();
            var usersService = scope.ServiceProvider.GetRequiredService<UsersService>();
            var user = await usersService.GetUserByIdAsync(userId);

            var player = new Mathsino.Backend.Game.Player { User = user, BetAmount = betAmount };
            var game = new Mathsino.Backend.Game.Game
            {
                Type = Mathsino.Backend.Game.GameType.SinglePlayer,
            };
            game.AddPlayer(player);
            lock (_gamesLock)
            {
                _games[game.Id] = game;
                logger?.LogInformation(
                    "[CreateGame] Game {GameId} added to dictionary. Total games: {Count}",
                    game.Id,
                    _games.Count
                );
            }
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
            lock (_gamesLock)
            {
                _games[game.Id] = game;
                logger?.LogInformation(
                    "[CreateGame] Game {GameId} added to dictionary. Total games: {Count}",
                    game.Id,
                    _games.Count
                );
            }
            return game;
        }

        public Mathsino.Backend.Game.Game GetGameById(Guid gameId)
        {
            logger?.LogInformation("Fetching game with ID {GameId}", gameId);

            lock (_gamesLock)
            {
                if (_games.TryGetValue(gameId, out var game))
                    return game;
            }
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

        public async Task<Mathsino.Backend.Game.Game> PlayerDouble(Guid gameId, Guid playerId)
        {
            logger?.LogInformation("Player {PlayerId} doubles in game {GameId}", playerId, gameId);
            var game = GetGameById(gameId);
            var player = game.Players.FirstOrDefault(p => p.PlayerId == playerId);

            if (player == null)
                throw new KeyNotFoundException("Player not found");

            if (!await balanceService.DeductBalance(player.User.Id, player.BetAmount))
            {
                throw new InvalidOperationException("Insufficient balance for double");
            }

            game.PlayerDouble(playerId);
            return game;
        }

        public async Task<Mathsino.Backend.Game.Game> PlayerSplit(Guid gameId, Guid playerId)
        {
            logger?.LogInformation("Player {PlayerId} splits in game {GameId}", playerId, gameId);
            var game = GetGameById(gameId);
            var player = game.Players.FirstOrDefault(p => p.PlayerId == playerId);

            if (player == null)
                throw new KeyNotFoundException("Player not found");

            if (!await balanceService.DeductBalance(player.User.Id, player.BetAmount))
            {
                throw new InvalidOperationException("Insufficient balance for split");
            }

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

        public async Task<Mathsino.Backend.Game.Game> PlayerDoubleSplit(Guid gameId, Guid playerId)
        {
            logger?.LogInformation(
                "Player {PlayerId} doubles split in game {GameId}",
                playerId,
                gameId
            );

            var game = GetGameById(gameId);
            var player = game.Players.FirstOrDefault(p => p.PlayerId == playerId);

            if (player == null)
            {
                throw new KeyNotFoundException($"Player {playerId} not found in game {gameId}");
            }
            if (!await balanceService.DeductBalance(player.User.Id, player.BetAmount))
            {
                throw new InvalidOperationException("Insufficient balance for double split");
            }

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
                var existingRecord = await dbContext.SingleGames.FirstOrDefaultAsync(sg =>
                    sg.GameId == game.Id && sg.PlayerId == player.PlayerId
                );

                if (existingRecord != null)
                {
                    logger?.LogWarning(
                        "Game result already exists for player {PlayerId} in game {GameId}. Skipping.",
                        player.PlayerId,
                        game.Id
                    );
                    continue;
                }

                logger?.LogInformation(
                    "Saving result for player ID {PlayerId} in game ID {GameId}",
                    player.PlayerId,
                    game.Id
                );

                int totalPayout = CalculatePayout(player);

                if (totalPayout > 0)
                {
                    await balanceService.AddBalance(player.User.Id, totalPayout);
                }

                logger?.LogInformation(
                    "Saving result for player ID {PlayerId} in game ID {GameId}, payout: {Payout}",
                    player.PlayerId,
                    game.Id,
                    totalPayout
                );

                var singleGameRecord = new SingleGame
                {
                    GameId = game.Id,
                    UserId = player.User.Id,
                    PlayerId = player.PlayerId,
                    StartTime = game.StartTime,
                    EndTime = DateTime.Now,
                    SingleGameResult = player.Result,
                    SingleGameSplitResult = player.SplitResult,
                    BalanceAfterGame = await balanceService.GetBalance(player.User.Id),
                };
                dbContext.SingleGames.Add(singleGameRecord);
            }
            await dbContext.SaveChangesAsync();
            logger?.LogInformation("Game results saved successfully for game ID {GameId}", game.Id);
        }

        private int CalculatePayout(Player player)
        {
            int totalPayout = 0;
            int mainBet = player.HasDoubledMain ? player.BetAmount * 2 : player.BetAmount;

            totalPayout += player.Result switch
            {
                GameResult.Win => mainBet * 2,
                GameResult.Blackjack => mainBet + (int)(mainBet * 1.5),
                GameResult.Push => mainBet,
                _ => 0,
            };

            if (player.HasSplit && player.SplitResult != null)
            {
                int splitBet = player.HasDoubledSplit ? player.BetAmount * 2 : player.BetAmount;

                totalPayout += player.SplitResult switch
                {
                    GameResult.Win => splitBet * 2,
                    GameResult.Blackjack => splitBet + (int)(splitBet * 1.5),
                    GameResult.Push => splitBet,
                    _ => 0,
                };
            }

            return totalPayout;
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
