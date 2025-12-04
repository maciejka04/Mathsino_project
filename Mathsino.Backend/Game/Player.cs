using System;
using System.Collections.Generic;
using System.Linq;
using Mathsino.Backend.Models;

namespace Mathsino.Backend.Game
{
    public class Player
    {
        public Guid PlayerId { get; set; } = Guid.NewGuid();
        public User User { get; set; } = default!;

        public List<Card> Hand { get; set; } = new List<Card>();

        public List<Card>? SplitHand { get; set; } = null;

        public PlayerStatus Status { get; set; } = PlayerStatus.Active;
        public PlayerStatus SplitStatus { get; set; } = PlayerStatus.Active;

        public GameResult? Result { get; set; } = null;
        public GameResult? SplitResult { get; set; } = null;

        public bool HasDoubledMain { get; set; } = false;
        public bool HasDoubledSplit { get; set; } = false;


        public bool HasSplit => SplitHand != null;

        public int HandValue => CalculateHandValue(Hand);
        public int? SplitHandValue => SplitHand != null ? CalculateHandValue(SplitHand) : null;

        private int CalculateHandValue(List<Card> hand)
        {
            int value = hand.Sum(c => c.Value);
            int aceCount = hand.Count(c => c.Rank == "A");

            while (value > 21 && aceCount > 0)
            {
                value -= 10;
                aceCount--;
            }

            return value;
        }

    }
}
