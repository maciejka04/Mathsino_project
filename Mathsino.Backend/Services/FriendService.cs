using Mathsino.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Mathsino.Backend.Services
{
    public class FriendService(ILogger<FriendService>? logger, MathsinoContext dbContext)
    {
        private readonly ILogger<FriendService>? _logger = logger;
        private readonly MathsinoContext _dbContext = dbContext;

        public async Task<List<User>> GetFriendsByUserIdAsync(int userId)
        {
            _logger?.LogInformation("Getting friends for user {UserId}", userId);

            var friends = await _dbContext
                .UserFriends.Where(uf =>
                    (uf.UserId == userId || uf.FriendId == userId)
                    && uf.Status == FriendStatus.Accepted
                )
                .Select(uf => uf.UserId == userId ? uf.Friend : uf.User)
                .ToListAsync();
            return friends;
        }

        public async Task<bool> SendFriendRequestAsync(int userId, int friendId)
        {
            _logger?.LogInformation(
                "User {UserId} sending friend request to {FriendId}",
                userId,
                friendId
            );

            if (userId == friendId)
            {
                _logger?.LogWarning(
                    "User {UserId} tried to send friend request to themselves",
                    userId
                );
                return false;
            }
            var friendExists = await _dbContext.Users.AnyAsync(u => u.Id == friendId);
            if (!friendExists)
            {
                _logger?.LogWarning("Friend {FriendId} does not exist", friendId);
                return false;
            }

            var existingRelation = await _dbContext.UserFriends.FirstOrDefaultAsync(uf =>
                (uf.UserId == userId && uf.FriendId == friendId)
                || (uf.UserId == friendId && uf.FriendId == userId)
            );

            if (existingRelation != null)
            {
                _logger?.LogWarning(
                    "Relation already exists between {UserId} and {FriendId}",
                    userId,
                    friendId
                );
                return false;
            }

            var friendRequest = new UserFriend
            {
                UserId = userId,
                FriendId = friendId,
                Status = FriendStatus.Requested,
            };

            _dbContext.UserFriends.Add(friendRequest);
            await _dbContext.SaveChangesAsync();

            _logger?.LogInformation(
                "Friend request sent from {UserId} to {FriendId}",
                userId,
                friendId
            );

            return true;
        }

        public async Task<(bool Success, string Message)> SendFriendRequestByUserNameAsync(
            int userId,
            string friendUserName
        )
        {
            _logger?.LogInformation(
                "User {UserId} sending friend request to username '{FriendUserName}'",
                userId,
                friendUserName
            );

            var friend = await _dbContext.Users.FirstOrDefaultAsync(u =>
                u.UserName.ToLower() == friendUserName.ToLower()
            );

            if (friend == null)
            {
                _logger?.LogWarning(
                    "User with username '{FriendUserName}' does not exist",
                    friendUserName
                );
                return (false, "User not found");
            }

            if (userId == friend.Id)
            {
                _logger?.LogWarning(
                    "User {UserId} tried to send friend request to themselves (username: {FriendUserName})",
                    userId,
                    friendUserName
                );
                return (false, "You cannot add yourself as a friend");
            }

            var existingRelation = await _dbContext.UserFriends.FirstOrDefaultAsync(uf =>
                (uf.UserId == userId && uf.FriendId == friend.Id)
                || (uf.UserId == friend.Id && uf.FriendId == userId)
            );

            if (existingRelation != null)
            {
                if (existingRelation.Status == FriendStatus.Accepted)
                {
                    _logger?.LogWarning(
                        "Users {UserId} and {FriendId} are already friends",
                        userId,
                        friend.Id
                    );
                    return (false, "You are already friends");
                }
                else if (existingRelation.Status == FriendStatus.Requested)
                {
                    _logger?.LogWarning(
                        "Friend request already exists between {UserId} and {FriendId}",
                        userId,
                        friend.Id
                    );
                    return (false, "Friend request already sent");
                }
            }

            var friendRequest = new UserFriend
            {
                UserId = userId,
                FriendId = friend.Id,
                Status = FriendStatus.Requested,
            };

            _dbContext.UserFriends.Add(friendRequest);
            await _dbContext.SaveChangesAsync();

            _logger?.LogInformation(
                "Friend request sent from {UserId} to {FriendId} (username: {FriendUserName})",
                userId,
                friend.Id,
                friendUserName
            );

            return (true, "Friend request sent successfully");
        }

        public async Task<bool> AcceptFriendRequestAsync(int userId, int senderId)
        {
            _logger?.LogInformation(
                "User {UserId} accepting friend request from {SenderId}",
                userId,
                senderId
            );

            var request = await _dbContext.UserFriends.FirstOrDefaultAsync(uf =>
                uf.UserId == senderId
                && uf.FriendId == userId
                && uf.Status == FriendStatus.Requested
            );

            if (request == null)
            {
                _logger?.LogWarning(
                    "Friend request from {SenderId} to {UserId} not found",
                    senderId,
                    userId
                );
                return false;
            }

            request.Status = FriendStatus.Accepted;
            await _dbContext.SaveChangesAsync();

            _logger?.LogInformation(
                "Friend request accepted between {UserId} and {SenderId}",
                userId,
                senderId
            );

            return true;
        }

        public async Task<bool> DeclineFriendRequestAsync(int userId, int senderId)
        {
            _logger?.LogInformation(
                "User {UserId} declining friend request from {SenderId}",
                userId,
                senderId
            );

            var request = await _dbContext.UserFriends.FirstOrDefaultAsync(uf =>
                uf.UserId == senderId
                && uf.FriendId == userId
                && uf.Status == FriendStatus.Requested
            );

            if (request == null)
            {
                _logger?.LogWarning(
                    "Friend request from {SenderId} to {UserId} not found",
                    senderId,
                    userId
                );
                return false;
            }

            _dbContext.UserFriends.Remove(request);
            await _dbContext.SaveChangesAsync();

            _logger?.LogInformation(
                "Friend request declined and removed between {UserId} and {SenderId}",
                userId,
                senderId
            );

            return true;
        }

        public async Task<bool> CancelSentFriendRequestAsync(int userId, int receiverId)
        {
            _logger?.LogInformation(
                "User {UserId} canceling friend request to {ReceiverId}",
                userId,
                receiverId
            );

            var request = await _dbContext.UserFriends.FirstOrDefaultAsync(uf =>
                uf.UserId == userId // ⬅️ TY jesteś nadawcą
                && uf.FriendId == receiverId // ⬅️ Drugi user jest odbiorcą
                && uf.Status == FriendStatus.Requested
            );

            if (request == null)
            {
                _logger?.LogWarning(
                    "Friend request from {UserId} to {ReceiverId} not found",
                    userId,
                    receiverId
                );
                return false;
            }

            _dbContext.UserFriends.Remove(request);
            await _dbContext.SaveChangesAsync();

            _logger?.LogInformation(
                "Friend request canceled from {UserId} to {ReceiverId}",
                userId,
                receiverId
            );

            return true;
        }

        public async Task<bool> RemoveFriendAsync(int userId, int friendId)
        {
            _logger?.LogInformation("User {UserId} removing friend {FriendId}", userId, friendId);

            var friendship = await _dbContext.UserFriends.FirstOrDefaultAsync(uf =>
                (
                    (uf.UserId == userId && uf.FriendId == friendId)
                    || (uf.UserId == friendId && uf.FriendId == userId)
                )
                && uf.Status == FriendStatus.Accepted
            );

            if (friendship == null)
            {
                _logger?.LogWarning(
                    "Friendship between {UserId} and {FriendId} not found",
                    userId,
                    friendId
                );
                return false;
            }

            _dbContext.UserFriends.Remove(friendship);
            await _dbContext.SaveChangesAsync();

            _logger?.LogInformation(
                "Friendship removed between {UserId} and {FriendId}",
                userId,
                friendId
            );

            return true;
        }

        //pobieranie zaproszeń otrzymanych
        public async Task<List<User>> GetFriendsRequestsByUserIdAsync(int userId)
        {
            var requests = await _dbContext
                .UserFriends.Where(uf =>
                    uf.FriendId == userId && uf.Status == FriendStatus.Requested
                )
                .Select(uf => uf.User)
                .ToListAsync();

            _logger?.LogInformation(
                "Found {Count} pending requests for user {UserId}",
                requests.Count,
                userId
            );

            return requests;
        }

        public async Task<List<User>> GetFriendsSentedRequestsByUserIdAsync(int userId)
        {
            var requests = await _dbContext
                .UserFriends.Where(uf => uf.UserId == userId && uf.Status == FriendStatus.Requested)
                .Select(uf => uf.Friend)
                .ToListAsync();

            _logger?.LogInformation(
                "Found {Count} pending requests for user {UserId}",
                requests.Count,
                userId
            );

            return requests;
        }
    }
}
