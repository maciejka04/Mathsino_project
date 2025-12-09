using Mathsino.Backend.Services;
using Npgsql.Replication;

public static class FriendEndPoints
{
    public static void MapFriendEndPoints(this WebApplication app)
    {
        app.MapGet(
            "/friends/{id}",
            async (FriendService friendService, int userId) =>
            {
                var friends = await friendService.GetFriendsByUserIdAsync(userId);
                return Results.Ok(friends);
            }
        );
        app.MapGet(
            "/friends/{id}/add/{friendId}",
            async (FriendService friendService, int userId, int friendId) =>
            {
                var friends = await friendService.SendFriendRequestAsync(userId, friendId);
                return Results.Ok(friends);
            }
        );
        app.MapGet(
            "friends/{id}/requests",
            async (FriendService friendService, int userId) =>
            {
                var friends = await friendService.GetFriendsRequestsByUserIdAsync(userId);
                return Results.Ok(friends);
            }
        );
        app.MapGet(
            "/friends/{id}/accept/{friendId}",
            async (FriendService friendService, int userId, int senderId) =>
            {
                var friends = await friendService.AcceptFriendRequestAsync(userId, senderId);
                return Results.Ok(friends);
            }
        );
        app.MapGet(
            "/friends/{id}/decline/{friendId}",
            async (FriendService friendService, int userId, int senderId) =>
            {
                var friends = await friendService.DeclineFriendRequestAsync(userId, senderId);
                return Results.Ok(friends);
            }
        );
        app.MapGet(
            "/friends/{id}/remove/{friendId}",
            async (FriendService friendService, int userId, int friendId) =>
            {
                var friends = await friendService.RemoveFriendAsync(userId, friendId);
                return Results.Ok(friends);
            }
        );
    }
}
