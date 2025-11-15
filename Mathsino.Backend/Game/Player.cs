using Mathsino.Backend.Models;

namespace Mathsino.Backend.Game;

public class Player
{
    public User User { get; set; } = default!;
    public List<Card> Hand { get; set; } = [];

    public int HandValue()
    {
        int value = Hand.Sum(card => card.Value);
        int aceCount = Hand.Count(card => card.Rank == "A");

        while (value > 21 && aceCount > 0)
        {
            value -= 10;
            aceCount--;
        }

        return value;
    }
}
