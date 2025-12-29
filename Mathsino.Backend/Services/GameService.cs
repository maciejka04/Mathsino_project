using Mathsino.Backend.Game;
using Mathsino.Backend.Interfaces;
using Mathsino.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Mathsino.Backend.Services
{
    public class GameService(
        ILogger<GameService>? logger,
        IServiceScopeFactory scopeFactory,
        IBalanceService balanceService
    ) : IGameService
    {
        private readonly ILogger<GameService>? _logger = logger;
        private readonly IServiceScopeFactory _scopeFactory = scopeFactory;
        private readonly IBalanceService _balanceService = balanceService;
        private static readonly Dictionary<Guid, Game.Game> _games = new();
        private static readonly object _gamesLock = new object();

        public async Task<Game.Game> CreateSinglePlayerGame(int userId, int betAmount)
        {
            _logger?.LogInformation("Creating single-player game for user ID {UserId}", userId);

            if (!await _balanceService.DeductBalance(userId, betAmount))
            {
                throw new InvalidOperationException("Insufficient balance");
            }

            using var scope = _scopeFactory.CreateScope();
            var usersService = scope.ServiceProvider.GetRequiredService<IUsersService>();
            var user = await usersService.GetUserByIdAsync(userId);

            var player = new Player { User = user, BetAmount = betAmount };
            var game = new Game.Game { Type = GameType.SinglePlayer };
            game.AddPlayer(player);
            lock (_gamesLock)
            {
                _games[game.Id] = game;
                _logger?.LogInformation(
                    "[CreateGame] Game {GameId} added to dictionary. Total games: {Count}",
                    game.Id,
                    _games.Count
                );
            }
            game.StartGame();
            return game;
        }

        public async Task<Game.Game> CreateMultiPlayerGame(int userId)
        {
            _logger?.LogInformation("Creating multi-player game for user ID {UserId}", userId);

            using var scope = _scopeFactory.CreateScope();
            var usersService = scope.ServiceProvider.GetRequiredService<IUsersService>();
            var user = await usersService.GetUserByIdAsync(userId);

            var player = new Player { User = user };
            var game = new Game.Game { Type = GameType.MultiPlayer };
            game.AddPlayer(player);
            lock (_gamesLock)
            {
                _games[game.Id] = game;
                _logger?.LogInformation(
                    "[CreateGame] Game {GameId} added to dictionary. Total games: {Count}",
                    game.Id,
                    _games.Count
                );
            }
            return game;
        }

        public Game.Game GetGameById(Guid gameId)
        {
            _logger?.LogInformation("Fetching game with ID {GameId}", gameId);

            lock (_gamesLock)
            {
                if (_games.TryGetValue(gameId, out var game))
                    return game;
            }
            throw new KeyNotFoundException($"Game with ID {gameId} not found.");
        }

        public Game.Game PlayerHit(Guid gameId, Guid playerId)
        {
            _logger?.LogInformation("Player {PlayerId} hits in game {GameId}", playerId, gameId);
            var game = GetGameById(gameId);
            game.PlayerHit(playerId);
            return game;
        }

        public Game.Game PlayerPass(Guid gameId, Guid playerId)
        {
            _logger?.LogInformation("Player {PlayerId} passes in game {GameId}", playerId, gameId);
            var game = GetGameById(gameId);
            game.PlayerPass(playerId);
            return game;
        }

        public async Task<Game.Game> PlayerDouble(Guid gameId, Guid playerId)
        {
            _logger?.LogInformation("Player {PlayerId} doubles in game {GameId}", playerId, gameId);
            var game = GetGameById(gameId);
            var player = game.Players.FirstOrDefault(p => p.PlayerId == playerId);

            if (player == null)
                throw new KeyNotFoundException("Player not found");

            if (!await _balanceService.DeductBalance(player.User.Id, player.BetAmount))
            {
                throw new InvalidOperationException("Insufficient balance for double");
            }

            game.PlayerDouble(playerId);
            return game;
        }

        public async Task<Game.Game> PlayerSplit(Guid gameId, Guid playerId)
        {
            _logger?.LogInformation("Player {PlayerId} splits in game {GameId}", playerId, gameId);
            var game = GetGameById(gameId);
            var player = game.Players.FirstOrDefault(p => p.PlayerId == playerId);

            if (player == null)
                throw new KeyNotFoundException("Player not found");

            if (!await _balanceService.DeductBalance(player.User.Id, player.BetAmount))
            {
                throw new InvalidOperationException("Insufficient balance for split");
            }

            game.PlayerSplit(playerId);
            return game;
        }

        public Game.Game PlayerHitSplit(Guid gameId, Guid playerId)
        {
            _logger?.LogInformation(
                "Player {PlayerId} hits split in game {GameId}",
                playerId,
                gameId
            );
            var game = GetGameById(gameId);
            game.PlayerHitSplit(playerId);
            return game;
        }

        public async Task<Game.Game> PlayerDoubleSplit(Guid gameId, Guid playerId)
        {
            _logger?.LogInformation(
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
            if (!await _balanceService.DeductBalance(player.User.Id, player.BetAmount))
            {
                throw new InvalidOperationException("Insufficient balance for double split");
            }

            game.PlayerDoubleSplit(playerId);
            return game;
        }

        public async Task<Game.Game> CheckResults(Guid gameId, Guid playerId)
        {
            _logger?.LogInformation(
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
            _logger?.LogInformation(
                "Saving game results to database for game ID {GameId}",
                game.Id
            );
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<MathsinoContext>();

            foreach (var player in game.Players)
            {
                var existingRecord = await dbContext.SingleGames.FirstOrDefaultAsync(sg =>
                    sg.GameId == game.Id && sg.PlayerId == player.PlayerId
                );

                if (existingRecord != null)
                {
                    _logger?.LogWarning(
                        "Game result already exists for player {PlayerId} in game {GameId}. Skipping.",
                        player.PlayerId,
                        game.Id
                    );
                    continue;
                }

                _logger?.LogInformation(
                    "Saving result for player ID {PlayerId} in game ID {GameId}",
                    player.PlayerId,
                    game.Id
                );

                int totalPayout = CalculatePayout(player);

                if (totalPayout > 0)
                {
                    await _balanceService.AddBalance(player.User.Id, totalPayout);
                }

                _logger?.LogInformation(
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
                    BalanceAfterGame = await _balanceService.GetBalance(player.User.Id),
                };
                dbContext.SingleGames.Add(singleGameRecord);
            }
            await dbContext.SaveChangesAsync();
            _logger?.LogInformation(
                "Game results saved successfully for game ID {GameId}",
                game.Id
            );
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
