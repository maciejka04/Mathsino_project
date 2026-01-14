using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using Mathsino.Backend.Models;

namespace Mathsino.Backend.Game
{
    public class Game
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public GameType Type { get; set; } = GameType.SinglePlayer;
        public GameStatus Status { get; set; } = GameStatus.WaitingForPlayers;
        public List<Player> Players { get; set; } = new List<Player>();

        public DateTime StartTime { get; set; } = DateTime.Now;

        [JsonIgnore]
        public Deck Deck { get; set; } = new Deck();

        public Player Dealer { get; set; } =
            new Player
            {
                User = new User { Id = 0, FirstName = "Dealer" },
            };

        public void AddPlayer(Player player)
        {
            if (Status != GameStatus.WaitingForPlayers)
                throw new InvalidOperationException(
                    "Cannot join a game that is already in progress or completed."
                );
            if (Type == GameType.SinglePlayer && Players.Count >= 1)
                throw new InvalidOperationException(
                    "Cannot join a single-player game that already has a player."
                );
            if (Players.Any(p => p.User.Id == player.User.Id))
                throw new InvalidOperationException("Player is already in the game.");
            if (Type == GameType.MultiPlayer && Players.Count > 3)
                throw new InvalidOperationException(
                    "Cannot join a multi-player game that already has 3 players."
                );
            Players.Add(player);
        }

        public void StartGame()
        {
            if (Players.Count == 0)
                throw new InvalidOperationException("Cannot start a game with no players.");
            Status = GameStatus.InProgress;

            DrawCards();
            DrawCards();

            var player = Players.First();

            if (player.Hand.Count == 2 && player.HandValue == 21)
            {
                player.Status = PlayerStatus.Passed;
                EndGame();
            }
        }

        public void DrawCards()
        {
            foreach (var player in Players)
            {
                player.Hand.Add(Deck.DrawCard());
            }
            Dealer.Hand.Add(Deck.DrawCard());
        }

        public void DealerDrawCard()
        {
            while (Dealer.HandValue < 17)
            {
                Dealer.Hand.Add(Deck.DrawCard());
            }
        }

        public void PlayerHit(Guid playerId)
        {
            var player = Players.FirstOrDefault(p => p.PlayerId == playerId);
            if (player == null)
                throw new InvalidOperationException("Player not found in the game.");
            if (Status != GameStatus.InProgress)
                throw new InvalidOperationException("Cannot hit when the game is not in progress.");

            if (player.Status != PlayerStatus.Active)
                throw new InvalidOperationException("Main hand is not active.");

            if (player.HasDoubledMain)
                throw new InvalidOperationException("Cannot hit after doubling on main hand.");

            player.Hand.Add(Deck.DrawCard());

            if (player.HandValue > 21)
            {
                player.Result = GameResult.Lose;
                player.Status = PlayerStatus.Passed;
                TryProceedAfterMainHandEnded(player);
            }
            else if (player.HandValue == 21)
            {
                player.Status = PlayerStatus.Passed;
                TryProceedAfterMainHandEnded(player);
            }
        }

        public void PlayerPass(Guid playerId)
        {
            if (Status != GameStatus.InProgress)
                throw new InvalidOperationException(
                    "Cannot pass when the game is not in progress."
                );
            var player = Players.FirstOrDefault(p => p.PlayerId == playerId);
            if (player == null)
                throw new InvalidOperationException("Player not found in the game.");

            if (!player.HasSplit)
            {
                if (player.Status != PlayerStatus.Active)
                    throw new InvalidOperationException("Player has already passed.");
                player.Status = PlayerStatus.Passed;
                if (Type == GameType.SinglePlayer)
                {
                    EndGame();
                }
                return;
            }

            if (player.Status == PlayerStatus.Active)
            {
                player.Status = PlayerStatus.Passed;
                TryProceedAfterMainHandEnded(player);
                return;
            }

            // jeśli główna ręka już zakończona, to pass dotyczy split
            if (player.SplitStatus == PlayerStatus.Active)
            {
                player.SplitStatus = PlayerStatus.Passed;
                TryEndGameAfterAllPlayers();
                return;
            }

            throw new InvalidOperationException("Both hands have already passed.");
        }

        public void PlayerSplit(Guid playerId)
        {
            var player = Players.FirstOrDefault(p => p.PlayerId == playerId);
            if (player == null)
                throw new InvalidOperationException("Player not found.");
            if (Status != GameStatus.InProgress)
                throw new InvalidOperationException("Cannot split when game is not in progress.");
            if (player.Hand.Count != 2)
                throw new InvalidOperationException(
                    "Split allowed only with initial two-card hand."
                );
            if (player.HasSplit)
                throw new InvalidOperationException("Player already split.");
            if (player.Hand[0].Rank != player.Hand[1].Rank)
                throw new InvalidOperationException("Cards must have same rank to split.");

            player.SplitHand = new List<Card>();
            var second = player.Hand[1];
            player.Hand.RemoveAt(1);
            player.SplitHand.Add(second);

            player.Hand.Add(Deck.DrawCard());
            player.SplitHand.Add(Deck.DrawCard());

            player.Status = PlayerStatus.Active;
            player.SplitStatus = PlayerStatus.Active;
        }

        public void PlayerHitSplit(Guid playerId)
        {
            var player = Players.FirstOrDefault(p => p.PlayerId == playerId);
            if (player == null)
                throw new InvalidOperationException("Player not found.");
            if (Status != GameStatus.InProgress)
                throw new InvalidOperationException("Cannot hit when game is not in progress.");
            if (!player.HasSplit)
                throw new InvalidOperationException("Player has no split hand.");

            if (player.Status == PlayerStatus.Active)
                throw new InvalidOperationException(
                    "You must finish the main hand before hitting the split hand."
                );

            if (player.SplitStatus != PlayerStatus.Active)
                throw new InvalidOperationException("Split hand is not active.");

            if (player.HasDoubledSplit)
                throw new InvalidOperationException("Cannot hit after doubling on split hand.");

            player.SplitHand!.Add(Deck.DrawCard());

            if (player.SplitHandValue > 21)
            {
                player.SplitResult = GameResult.Lose;
                player.SplitStatus = PlayerStatus.Passed;
                TryEndGameAfterAllPlayers();
            }
            else if (player.SplitHandValue == 21)
            {
                player.SplitStatus = PlayerStatus.Passed;
                TryEndGameAfterAllPlayers();
            }
        }

        public void PlayerDouble(Guid playerId)
        {
            var player = Players.FirstOrDefault(p => p.PlayerId == playerId);
            if (player == null)
                throw new InvalidOperationException("Player not found.");
            if (Status != GameStatus.InProgress)
                throw new InvalidOperationException(
                    "Cannot double when the game is not in progress."
                );

            if (player.Hand.Count != 2)
                throw new InvalidOperationException(
                    "Double is only allowed on the initial two-card hand."
                );
            if (player.HasDoubledMain)
                throw new InvalidOperationException("Player has already doubled on main hand.");
            if (player.Status != PlayerStatus.Active)
                throw new InvalidOperationException("Main hand is not active.");

            player.HasDoubledMain = true;
            player.Hand.Add(Deck.DrawCard());

            if (player.HandValue > 21)
            {
                player.Result = GameResult.Lose;
                player.Status = PlayerStatus.Passed;
                TryProceedAfterMainHandEnded(player);
                return;
            }
            else if (player.HandValue == 21)
            {
                player.Status = PlayerStatus.Passed;
                TryProceedAfterMainHandEnded(player);
                return;
            }

            player.Status = PlayerStatus.Passed;
            TryProceedAfterMainHandEnded(player);
        }

        public void PlayerDoubleSplit(Guid playerId)
        {
            var player = Players.FirstOrDefault(p => p.PlayerId == playerId);
            if (player == null)
                throw new InvalidOperationException("Player not found.");
            if (Status != GameStatus.InProgress)
                throw new InvalidOperationException(
                    "Cannot double when the game is not in progress."
                );
            if (!player.HasSplit)
                throw new InvalidOperationException("Player has no split hand.");
            if (player.Status == PlayerStatus.Active)
                throw new InvalidOperationException(
                    "You must finish the main hand before doubling the split hand."
                );

            if (player.SplitHand!.Count != 2)
                throw new InvalidOperationException(
                    "Double is only allowed on the initial two-card split hand."
                );
            if (player.HasDoubledSplit)
                throw new InvalidOperationException("Player has already doubled on split hand.");
            if (player.SplitStatus != PlayerStatus.Active)
                throw new InvalidOperationException("Split hand is not active.");

            player.HasDoubledSplit = true;
            player.SplitHand.Add(Deck.DrawCard());

            if (player.SplitHandValue > 21)
            {
                player.SplitResult = GameResult.Lose;
                player.SplitStatus = PlayerStatus.Passed;
                TryEndGameAfterAllPlayers();
                return;
            }
            else if (player.SplitHandValue == 21)
            {
                player.SplitStatus = PlayerStatus.Passed;
                TryEndGameAfterAllPlayers();
                return;
            }

            player.SplitStatus = PlayerStatus.Passed;
            TryEndGameAfterAllPlayers();
        }

        public void CheckResults(Guid playerId)
        {
            if (Status != GameStatus.Completed)
                throw new InvalidOperationException("Game is not yet completed.");

            var player = Players.FirstOrDefault(p => p.PlayerId == playerId);
            if (player == null)
                throw new InvalidOperationException("Player not found.");

            // Główna ręka
            player.Result = EvaluateHandAgainstDealer(player.HandValue, player.Hand);

            // Split (jeśli istnieje)
            if (player.HasSplit && player.SplitHandValue.HasValue && player.SplitHand != null)
            {
                player.SplitResult = EvaluateHandAgainstDealer(
                    player.SplitHandValue.Value,
                    player.SplitHand
                );
            }
        }

        private GameResult EvaluateHandAgainstDealer(int playerValue, List<Card> hand)
        {
            bool playerHasBlackjack = hand.Count == 2 && playerValue == 21;
            bool dealerHasBlackjack = Dealer.Hand.Count == 2 && Dealer.HandValue == 21;

            if (playerValue > 21)
                return GameResult.Lose;

            if (playerHasBlackjack && dealerHasBlackjack)
            {
                return GameResult.Push;
            }

            if (playerHasBlackjack)
            {
                return GameResult.Blackjack;
            }

            if (dealerHasBlackjack)
            {
                return GameResult.Lose;
            }

            if (Dealer.HandValue > 21)
                return GameResult.Win;

            if (playerValue > Dealer.HandValue)
                return GameResult.Win;
            if (playerValue < Dealer.HandValue)
                return GameResult.Lose;

            return GameResult.Push;
        }

        private void TryProceedAfterMainHandEnded(Player player)
        {
            if (!player.HasSplit)
            {
                if (Type == GameType.SinglePlayer)
                {
                    EndGame();
                }
                else
                {
                    TryEndGameAfterAllPlayers();
                }
            }
            else
            {
                if (player.SplitStatus == PlayerStatus.Passed)
                {
                    TryEndGameAfterAllPlayers();
                }
                else
                {
                    // main zakończona, split będzie teraz aktywna — nie wykonujemy EndGame
                }
            }
        }

        private void TryEndGameAfterAllPlayers()
        {
            foreach (var p in Players)
            {
                if (p.Status == PlayerStatus.Active)
                    return;
                if (p.HasSplit && p.SplitStatus == PlayerStatus.Active)
                    return;
            }

            EndGame();
        }

        public void EndGame()
        {
            bool anyPlayerAlive = false;

            foreach (var p in Players)
            {
                if (p.HandValue <= 21)
                {
                    anyPlayerAlive = true;
                    break;
                }

                if (p.HasSplit)
                {
                    if (p.SplitHandValue.GetValueOrDefault(99) <= 21)
                    {
                        anyPlayerAlive = true;
                        break;
                    }
                }
            }

            if (anyPlayerAlive)
            {
                DealerDrawCard();
            }

            Status = GameStatus.Completed;
        }
    }
}
