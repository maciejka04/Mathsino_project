namespace Mathsino.Backend.Game;

using System.Text.Json.Serialization;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum GameResult
{
    Win,
    Lose,
    Push,
    Blackjack,
    Snapshot,
    InProgress,
}
