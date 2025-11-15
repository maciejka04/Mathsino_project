namespace Mathsino.Backend.Game;

public class Deck
{
    private static readonly string[] Suits = { "Hearts", "Diamonds", "Clubs", "Spades" };
    private static readonly string[] Ranks =
    {
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
        "A",
    };

    public List<Card> Cards { get; set; } = [];

    public Deck()
    {
        var rnd = new Random();
        foreach (var suit in Suits)
        {
            foreach (var rank in Ranks)
            {
                Cards.Add(
                    new Card
                    {
                        Rank = rank,
                        Suit = suit,
                        Seed = rnd.Next(),
                    }
                );
            }
        }
        Cards = Cards.OrderBy(c => c.Seed).ToList();
    }

    public Card DrawCard()
    {
        if (Cards.Count == 0)
        {
            throw new InvalidOperationException("No cards left in the deck.");
        }

        var card = Cards[0];
        Cards.RemoveAt(0);
        return card;
    }
}
