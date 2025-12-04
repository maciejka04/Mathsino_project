using System.Text.Json.Serialization;

namespace Mathsino.Backend.Game;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum GameType
{
    SinglePlayer,
    MultiPlayer,
}
