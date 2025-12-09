using System.Text.Json.Serialization;

namespace Mathsino.Backend.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum FriendStatus
{
    Requested,
    Accepted,
}
