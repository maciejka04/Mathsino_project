namespace Mathsino.Backend.Game;

public class Game
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public GameType Type { get; set; } = GameType.SinglePlayer;

    public GameStatus Status { get; set; } = GameStatus.WaitingForPlayers;

    public List<Player> Players { get; set; } = [];

    public Deck Deck { get; set; } = new Deck();

    public Player Dealer { get; set; } = new Player();

    public void AddPlayer(Player player)
    {
        if (Status != GameStatus.WaitingForPlayers)
        {
            throw new InvalidOperationException(
                "Cannot join a game that is already in progress or completed."
            );
        }
        if (Type == GameType.SinglePlayer && Players.Count >= 1)
        {
            throw new InvalidOperationException(
                "Cannot join a single-player game that already has a player."
            );
        }
        if (Players.Any(p => p.User.Id == player.User.Id))
        {
            throw new InvalidOperationException("Player is already in the game.");
        }

        if (Type == GameType.MultiPlayer && Players.Count > 3)
        {
            throw new InvalidOperationException(
                "Cannot join a multi-player game that already has 3 players."
            );
        }
        Players.Add(player);
    }

    public void StartGame()
    {
        if (Players.Count == 0)
        {
            throw new InvalidOperationException("Cannot start a game with no players.");
        }
        Status = GameStatus.InProgress;

        DrawCards();
        DrawCards();
    }

    public void DrawCards()
    {
        foreach (var player in Players)
        {
            player.Hand.Add(Deck.DrawCard());
        }
        Dealer.Hand.Add(Deck.DrawCard());
    }
}

public enum GameType
{
    SinglePlayer,
    MultiPlayer,
}

public enum GameStatus
{
    WaitingForPlayers,
    InProgress,
    Completed,
}
