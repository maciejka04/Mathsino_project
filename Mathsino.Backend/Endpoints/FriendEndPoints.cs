using Mathsino.Backend.Services;
using Npgsql.Replication;

public static class FriendEndPoints
{
    public static void MapFriendEndPoints(this WebApplication app)
    {
        app.MapGet(
            "/friends/{userId}",
            async (FriendService friendService, int userId) =>
            {
                var friends = await friendService.GetFriendsByUserIdAsync(userId);
                return Results.Ok(friends);
            }
        );
        app.MapGet(
            "/friends/{userId}/requests",
            async (FriendService friendService, int userId) =>
            {
                var friends = await friendService.GetFriendsRequestsByUserIdAsync(userId);
                return Results.Ok(friends);
            }
        );
        app.MapGet(
            "/friends/{userId}/sent",
            async (FriendService friendService, int userId) =>
            {
                var friends = await friendService.GetFriendsSentedRequestsByUserIdAsync(userId);
                return Results.Ok(friends);
            }
        );

        app.MapPost(
            "/friends/{userId}/add/{friendId}",
            async (FriendService friendService, int userId, int friendId) =>
            {
                var friends = await friendService.SendFriendRequestAsync(userId, friendId);
                return Results.Ok(friends);
            }
        );

        app.MapPost(
            "/friends/{userId}/add-by-username/{friendUserName}",
            async (FriendService friendService, int userId, string friendUserName) =>
            {
                try
                {
                    var (success, message) = await friendService.SendFriendRequestByUserNameAsync(
                        userId,
                        friendUserName
                    );

                    if (success)
                    {
                        return Results.Ok(new { message });
                    }

                    return Results.BadRequest(new { message });
                }
                catch (Exception ex)
                {
                    return Results.BadRequest(new { message = ex.Message });
                }
            }
        );

        app.MapPost(
            "/friends/{userId}/accept/{senderId}",
            async (FriendService friendService, int userId, int senderId) =>
            {
                var friends = await friendService.AcceptFriendRequestAsync(userId, senderId);
                return Results.Ok(friends);
            }
        );
        app.MapDelete(
            "/friends/{userId}/decline/{senderId}",
            async (FriendService friendService, int userId, int senderId) =>
            {
                var friends = await friendService.DeclineFriendRequestAsync(userId, senderId);
                return Results.Ok(friends);
            }
        );
        app.MapDelete(
            "/friends/{userId}/remove/{friendId}",
            async (FriendService friendService, int userId, int friendId) =>
            {
                var friends = await friendService.RemoveFriendAsync(userId, friendId);
                return Results.Ok(friends);
            }
        );
        app.MapDelete(
            "/friends/{userId}/cancel/{receiverId}",
            async (FriendService friendService, int userId, int receiverId) =>
            {
                var success = await friendService.CancelSentFriendRequestAsync(userId, receiverId);
                return success
                    ? Results.Ok()
                    : Results.BadRequest("Failed to cancel friend request");
            }
        );
    }
}
