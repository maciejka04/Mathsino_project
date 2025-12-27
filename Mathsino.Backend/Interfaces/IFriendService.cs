using Mathsino.Backend.Models;

namespace Mathsino.Backend.Interfaces;

public interface IFriendService
{
    Task<bool> AcceptFriendRequestAsync(int userId, int senderId);
    Task<bool> CancelSentFriendRequestAsync(int userId, int receiverId);
    Task<bool> DeclineFriendRequestAsync(int userId, int senderId);
    Task<List<User>> GetFriendsByUserIdAsync(int userId);
    Task<List<User>> GetFriendsRequestsByUserIdAsync(int userId);
    Task<List<User>> GetFriendsSentedRequestsByUserIdAsync(int userId);
    Task<bool> RemoveFriendAsync(int userId, int friendId);
    Task<bool> SendFriendRequestAsync(int userId, int friendId);
    Task<(bool Success, string Message)> SendFriendRequestByUserNameAsync(
        int userId,
        string friendUserName
    );
}
