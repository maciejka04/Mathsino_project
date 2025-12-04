namespace Mathsino.Backend.Game;

public class Card
{
    public string Rank { get; set; } = string.Empty;
    public string Suit { get; set; } = string.Empty;

    public int Value
    {
        get
        {
            return Rank switch
            {
                "A" => 11,
                "K" or "Q" or "J" => 10,
                _ => int.Parse(Rank),
            };
        }
    }

    public int Seed { get; set; } = 0;
}
