using System.Text.Json;
using System.Text.Json.Serialization;
using Mathsino.Backend.Game;
using Mathsino.Backend.Interfaces;
using Mathsino.Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

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

        private readonly JsonSerializerOptions _jsonOptions = new()
        {
            ReferenceHandler = ReferenceHandler.IgnoreCycles
        };

        public async Task<Game.Game> CreateSinglePlayerGame(int userId, int betAmount)
        {
            _logger?.LogInformation("Request to create single-player game for user ID {UserId}", userId);

            var existingGame = await GetActiveGameForUserAsync(userId);
            if (existingGame != null)
            {
                _logger?.LogInformation("Found active game {GameId} for user {UserId}. Resuming.", existingGame.Id, userId);
                return existingGame;
            }

            if (!await _balanceService.DeductBalance(userId, betAmount))
            {
                throw new InvalidOperationException("Insufficient balance");
            }

            using var scope = _scopeFactory.CreateScope();
            var usersService = scope.ServiceProvider.GetRequiredService<IUsersService>();
            var dbContext = scope.ServiceProvider.GetRequiredService<MathsinoContext>();
            
            var user = await usersService.GetUserByIdAsync(userId);

            var player = new Player { User = user, BetAmount = betAmount };
            var game = new Game.Game { Type = GameType.SinglePlayer };
            game.AddPlayer(player);
            
            lock (_gamesLock)
            {
                _games[game.Id] = game;
            }
            game.StartGame();

            // Save initial state to DB
            var singleGameRecord = new SingleGame
            {
                GameId = game.Id,
                UserId = userId,
                PlayerId = player.PlayerId,
                StartTime = game.StartTime,
                EndTime = DateTime.UtcNow, // Will be updated on finish
                SingleGameResult = GameResult.InProgress,
                BetAmount = betAmount,
                BalanceAfterGame = user.Balance,
                GameStateJson = JsonSerializer.Serialize(game, _jsonOptions)
            };
            dbContext.SingleGames.Add(singleGameRecord);
            await dbContext.SaveChangesAsync();

            _logger?.LogInformation("Created new game {GameId} and saved to DB.", game.Id);

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
            }
            return game;
        }

        public Game.Game GetGameById(Guid gameId)
        {
            // Try memory first
            lock (_gamesLock)
            {
                if (_games.TryGetValue(gameId, out var game))
                    return game;
            }

            // Try DB if not in memory (maybe restarted)
            var gameFromDb = LoadGameFromDb(gameId).Result;
            if (gameFromDb != null)
            {
                lock (_gamesLock)
                {
                    _games[gameFromDb.Id] = gameFromDb;
                }
                return gameFromDb;
            }

            throw new KeyNotFoundException($"Game with ID {gameId} not found.");
        }

        public async Task<Game.Game> PlayerHit(Guid gameId, Guid playerId)
        {
            _logger?.LogInformation("Player {PlayerId} hits in game {GameId}", playerId, gameId);
            var game = GetGameById(gameId);
            game.PlayerHit(playerId);
            await SaveGameStateAsync(game);
            return game;
        }

        public async Task<Game.Game> PlayerPass(Guid gameId, Guid playerId)
        {
            _logger?.LogInformation("Player {PlayerId} passes in game {GameId}", playerId, gameId);
            var game = GetGameById(gameId);
            game.PlayerPass(playerId);
            await SaveGameStateAsync(game);
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

            // Increment DoubleDownWins counter for the user
            using (var scope = _scopeFactory.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<MathsinoContext>();
                var dbUser = await dbContext.Users.FindAsync(player.User.Id);
                if (dbUser != null)
                {
                    dbUser.DoubleDownWins += 1;
                    await dbContext.SaveChangesAsync();
                }
            }

            await SaveGameStateAsync(game);
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
            await SaveGameStateAsync(game);
            return game;
        }

        public async Task<Game.Game> PlayerHitSplit(Guid gameId, Guid playerId)
        {
            _logger?.LogInformation(
                "Player {PlayerId} hits split in game {GameId}",
                playerId,
                gameId
            );
            var game = GetGameById(gameId);
            game.PlayerHitSplit(playerId);
            await SaveGameStateAsync(game);
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

            // Increment DoubleDownWins counter for the user for split hand
            using (var scope = _scopeFactory.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<MathsinoContext>();
                var dbUser = await dbContext.Users.FindAsync(player.User.Id);
                if (dbUser != null)
                {
                    dbUser.DoubleDownWins += 1;
                    await dbContext.SaveChangesAsync();
                }
            }

            await SaveGameStateAsync(game);
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
            await SaveResultsInDB(game); // This finalizes the game in DB
            
            // Remove from memory if completed
            if (game.Status == GameStatus.Completed)
            {
                lock (_gamesLock)
                {
                    _games.Remove(gameId);
                }
            }
            
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
                // Find existing 'InProgress' record to update
                var existingRecord = await dbContext.SingleGames.FirstOrDefaultAsync(sg =>
                    sg.GameId == game.Id && sg.PlayerId == player.PlayerId
                );

                if (existingRecord == null)
                {
                    // Should not happen for SinglePlayer if created correctly, but fallback:
                    existingRecord = new SingleGame
                    {
                        GameId = game.Id,
                        UserId = player.User.Id,
                        PlayerId = player.PlayerId,
                        StartTime = game.StartTime,
                        BetAmount = player.BetAmount
                    };
                    dbContext.SingleGames.Add(existingRecord);
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

                existingRecord.EndTime = DateTime.UtcNow;
                existingRecord.SingleGameResult = player.Result;
                existingRecord.SingleGameSplitResult = player.SplitResult;
                existingRecord.BalanceAfterGame = await _balanceService.GetBalance(player.User.Id);
                existingRecord.GameStateJson = null; // Clear state as game is finished
            }
            await dbContext.SaveChangesAsync();
            _logger?.LogInformation(
                "Game results saved successfully for game ID {GameId}",
                game.Id
            );
        }

        private async Task SaveGameStateAsync(Game.Game game)
        {
             // Only save state for SinglePlayer games for now as structure suggests
            if(game.Type != GameType.SinglePlayer) return;

            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<MathsinoContext>();
            var json = JsonSerializer.Serialize(game, _jsonOptions);

            foreach (var player in game.Players)
            {
                var record = await dbContext.SingleGames
                    .FirstOrDefaultAsync(sg => sg.GameId == game.Id && sg.PlayerId == player.PlayerId);
                
                if (record != null)
                {
                    record.GameStateJson = json;
                    record.EndTime = DateTime.UtcNow; // Update timestamp
                }
            }
            await dbContext.SaveChangesAsync();
        }

        private async Task<Game.Game?> LoadGameFromDb(Guid gameId)
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<MathsinoContext>();
            var record = await dbContext.SingleGames.FirstOrDefaultAsync(g => g.GameId == gameId);
            
            if (record != null && !string.IsNullOrEmpty(record.GameStateJson))
            {
                try
                {
                    return JsonSerializer.Deserialize<Game.Game>(record.GameStateJson, _jsonOptions);
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Failed to load game {GameId}", gameId);
                }
            }
            return null;
        }

        public async Task<Game.Game?> GetActiveGameForUserAsync(int userId)
        {
             // Check memory
            lock (_gamesLock)
            {
                 var activeInMemory = _games.Values.FirstOrDefault(g => 
                    g.Type == GameType.SinglePlayer && 
                    g.Status == GameStatus.InProgress &&
                    g.Players.Any(p => p.User.Id == userId));
                 if (activeInMemory != null) return activeInMemory;
            }

            // Check DB
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<MathsinoContext>();
            var activeRecord = await dbContext.SingleGames
                .OrderByDescending(g => g.StartTime)
                .FirstOrDefaultAsync(g => g.UserId == userId && g.SingleGameResult == GameResult.InProgress);

            if (activeRecord != null && !string.IsNullOrEmpty(activeRecord.GameStateJson))
            {
                try
                {
                    var game = JsonSerializer.Deserialize<Game.Game>(activeRecord.GameStateJson, _jsonOptions);
                    if (game != null)
                    {
                        lock (_gamesLock)
                        {
                            if (!_games.ContainsKey(game.Id))
                                _games[game.Id] = game;
                        }
                        return game;
                    }
                }
                catch (Exception ex)
                {
                     _logger?.LogError(ex, "Failed to restore active game for user {UserId}", userId);
                }
            }
            return null;
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
