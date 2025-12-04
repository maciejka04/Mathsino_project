namespace Mathsino.Backend.Test;

using Shouldly;

public class Tests
{
    [SetUp]
    public void Setup() { }

    [Test]
    public void Test1()
    {
        Assert.Pass();
    }
}

public class DeckTests
{
    [Test]
    public void Deck_Should_Contain_52_Cards()
    {
        var deck = new Mathsino.Backend.Game.Deck();
        deck.Cards.Count.ShouldBe(52);
    }

    [Test]
    public void Deck_Cards_Should_Be_Unique()
    {
        var deck = new Mathsino.Backend.Game.Deck();
        var uniqueCards = deck.Cards.Select(c => $"{c.Rank} of {c.Suit}").Distinct().Count();
        uniqueCards.ShouldBe(52);
    }

    [Test]
    public void Deck_Cards_Should_Be_Shuffled()
    {
        var deck1 = new Mathsino.Backend.Game.Deck();
        var deck2 = new Mathsino.Backend.Game.Deck();
        bool areSameOrder = deck1
            .Cards.Select(c => $"{c.Rank} of {c.Suit}")
            .SequenceEqual(deck2.Cards.Select(c => $"{c.Rank} of {c.Suit}"));
        areSameOrder.ShouldBeFalse();
    }

    [Test]
    public void DrawCard_Should_Remove_Card_From_Deck()
    {
        var deck = new Mathsino.Backend.Game.Deck();
        var initialCount = deck.Cards.Count;
        var drawnCard = deck.DrawCard();
        deck.Cards.Count.ShouldBe(initialCount - 1);
        deck.Cards.ShouldNotContain(drawnCard);
    }

    [Test]
    public void DrawCard_Should_Be_First_Card_In_Deck()
    {
        var deck = new Mathsino.Backend.Game.Deck();
        var firstCard = deck.Cards[0];
        var drawnCard = deck.DrawCard();
        drawnCard.ShouldBe(firstCard);
    }
}

public class PlayerTests
{
    [Test]
    public void HandValue_Should_Calculate_Correct_Value_Without_Aces()
    {
        var player = new Mathsino.Backend.Game.Player();
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "10", Suit = "Hearts" });
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "7", Suit = "Clubs" });
        player.HandValue.ShouldBe(17);
    }

    [Test]
    public void HandValue_Should_Calculate_Correct_Value_With_Aces()
    {
        var player = new Mathsino.Backend.Game.Player();
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "A", Suit = "Spades" });
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "7", Suit = "Diamonds" });
        player.HandValue.ShouldBe(18);
    }

    [Test]
    public void HandValue_Should_Adjust_Ace_Value_When_Over_21()
    {
        var player = new Mathsino.Backend.Game.Player();
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "A", Suit = "Spades" });
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "9", Suit = "Diamonds" });
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "5", Suit = "Hearts" });
        player.HandValue.ShouldBe(15);
    }

    [Test]
    public void HandValue_Test()
    {
        var player = new Mathsino.Backend.Game.Player();
        player.HandValue.ShouldBe(0);

        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "A", Suit = "Spades" });
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "10", Suit = "Diamonds" });
        player.HandValue.ShouldBe(21);
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "7", Suit = "Hearts" });
        player.HandValue.ShouldBe(18);
    }
}

public class GameTests
{
    [Test]
    public void AddPlayer_Should_Add_Player_To_Game()
    {
        var game = new Mathsino.Backend.Game.Game
        {
            Type = Mathsino.Backend.Game.GameType.MultiPlayer,
        };
        var player = new Mathsino.Backend.Game.Player
        {
            User = new Mathsino.Backend.Models.User { Id = 1 },
        };
        game.AddPlayer(player);
        game.Players.Count.ShouldBe(1);
        game.Players[0].ShouldBe(player);
    }

    [Test]
    public void AddPlayer_Should_Throw_When_Game_In_Progress()
    {
        var game = new Mathsino.Backend.Game.Game
        {
            Status = Mathsino.Backend.Game.GameStatus.InProgress,
        };
        var player = new Mathsino.Backend.Game.Player
        {
            User = new Mathsino.Backend.Models.User { Id = 1 },
        };
        Should.Throw<InvalidOperationException>(() => game.AddPlayer(player));
    }

    [Test]
    public void AddPlayer_Should_Throw_When_SinglePlayer_Game_Full()
    {
        var game = new Mathsino.Backend.Game.Game
        {
            Type = Mathsino.Backend.Game.GameType.SinglePlayer,
        };
        var player1 = new Mathsino.Backend.Game.Player
        {
            User = new Mathsino.Backend.Models.User { Id = 1 },
        };
        var player2 = new Mathsino.Backend.Game.Player
        {
            User = new Mathsino.Backend.Models.User { Id = 2 },
        };
        game.AddPlayer(player1);
        Should.Throw<InvalidOperationException>(() => game.AddPlayer(player2));
    }

    [Test]
    public void StartGame_Should_Change_Status_And_Deal_Cards()
    {
        var game = new Mathsino.Backend.Game.Game
        {
            Type = Mathsino.Backend.Game.GameType.SinglePlayer,
        };
        var player = new Mathsino.Backend.Game.Player
        {
            User = new Mathsino.Backend.Models.User { Id = 1 },
        };
        game.AddPlayer(player);
        game.StartGame();
        game.Status.ShouldBe(Mathsino.Backend.Game.GameStatus.InProgress);
        player.Hand.Count.ShouldBe(2);
        game.Dealer.Hand.Count.ShouldBe(2);
    }
}

public class DealerTests
{
    [Test]
    public void Dealer_Should_Hit_Until_17_Or_Higher()
    {
        var game = new Mathsino.Backend.Game.Game();
        var dealer = game.Dealer;

        dealer.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "5", Suit = "Hearts" });
        dealer.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "6", Suit = "Clubs" });

        game.DealerDrawCard();

        dealer.HandValue.ShouldBeGreaterThanOrEqualTo(17);
    }
}

public class CheckResultsTests
{
    [Test]
    public void CheckResults_Should_Set_Player_Result_Correctly_To_Lose_Higher_Than_21()
    {
        var game = new Mathsino.Backend.Game.Game();
        var player = new Mathsino.Backend.Game.Player();
        game.Players.Add(player);

        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "10", Suit = "Hearts" });
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "9", Suit = "Clubs" });
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "5", Suit = "Diamonds" });
        game.Dealer.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "10", Suit = "Spades" });
        game.Dealer.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "7", Suit = "Diamonds" });

        game.Status = Mathsino.Backend.Game.GameStatus.Completed;
        game.CheckResults(player.PlayerId);

        player.Result.ShouldBe(Mathsino.Backend.Game.GameResult.Lose);
    }

    [Test]
    public void CheckResults_Should_Set_Player_Result_Correctly_To_Lose_Lower_Than_Dealer()
    {
        var game = new Mathsino.Backend.Game.Game();
        var player = new Mathsino.Backend.Game.Player();
        game.Players.Add(player);

        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "10", Suit = "Hearts" });
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "9", Suit = "Clubs" });
        game.Dealer.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "10", Suit = "Spades" });
        game.Dealer.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "10", Suit = "Diamonds" });

        game.Status = Mathsino.Backend.Game.GameStatus.Completed;
        game.CheckResults(player.PlayerId);

        player.Result.ShouldBe(Mathsino.Backend.Game.GameResult.Lose);
    }

    [Test]
    public void CheckResults_Should_Set_Player_Result_Correctly_To_Win_Higher_Than_Dealer()
    {
        var game = new Mathsino.Backend.Game.Game();
        var player = new Mathsino.Backend.Game.Player();
        game.Players.Add(player);

        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "10", Suit = "Hearts" });
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "9", Suit = "Clubs" });
        game.Dealer.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "10", Suit = "Spades" });
        game.Dealer.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "7", Suit = "Diamonds" });

        game.Status = Mathsino.Backend.Game.GameStatus.Completed;
        game.CheckResults(player.PlayerId);

        player.Result.ShouldBe(Mathsino.Backend.Game.GameResult.Win);
    }

    [Test]
    public void CheckResults_Should_Set_Player_Result_Correctly_To_Win_Dealer_Higher_Than_21()
    {
        var game = new Mathsino.Backend.Game.Game();
        var player = new Mathsino.Backend.Game.Player();
        game.Players.Add(player);

        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "10", Suit = "Hearts" });
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "9", Suit = "Clubs" });
        game.Dealer.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "10", Suit = "Spades" });
        game.Dealer.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "6", Suit = "Diamonds" });
        game.Dealer.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "7", Suit = "Diamonds" });

        game.Status = Mathsino.Backend.Game.GameStatus.Completed;
        game.CheckResults(player.PlayerId);

        player.Result.ShouldBe(Mathsino.Backend.Game.GameResult.Win);
    }

    [Test]
    public void CheckResults_Should_Set_Player_Result_Correctly_To_Blackjack()
    {
        var game = new Mathsino.Backend.Game.Game();
        var player = new Mathsino.Backend.Game.Player();
        game.Players.Add(player);

        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "10", Suit = "Hearts" });
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "A", Suit = "Clubs" });
        game.Dealer.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "10", Suit = "Spades" });
        game.Dealer.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "7", Suit = "Diamonds" });

        game.Status = Mathsino.Backend.Game.GameStatus.Completed;
        game.CheckResults(player.PlayerId);

        player.Result.ShouldBe(Mathsino.Backend.Game.GameResult.Blackjack);
    }

    [Test]
    public void CheckResults_Should_Set_Player_Result_Correctly_To_Push()
    {
        var game = new Mathsino.Backend.Game.Game();
        var player = new Mathsino.Backend.Game.Player();
        game.Players.Add(player);

        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "10", Suit = "Hearts" });
        player.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "7", Suit = "Clubs" });
        game.Dealer.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "10", Suit = "Spades" });
        game.Dealer.Hand.Add(new Mathsino.Backend.Game.Card { Rank = "7", Suit = "Diamonds" });

        game.Status = Mathsino.Backend.Game.GameStatus.Completed;
        game.CheckResults(player.PlayerId);

        player.Result.ShouldBe(Mathsino.Backend.Game.GameResult.Push);
    }
}
