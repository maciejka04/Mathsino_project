using Mathsino.Backend.Game;
using Mathsino.Backend.Models;
using Mathsino.Backend.Services;

namespace Mathsino.Backend.Interfaces;

public interface IUsersService
{
    Task<List<UserRankingDto>> GetFriendsRankingAsync(int userId);
    Task<List<UserRankingDto>> GetFriendsRankingByPeriodAsync(int userId, DateTime startDate);
    Task<List<UserRankingDto>> GetGlobalRankingAsync();
    Task<List<UserRankingDto>> GetGlobalRankingByPeriodAsync(DateTime startDate);
    Task<User> GetUserByIdAsync(int id);
    Task<User> GetUserByUserNameAsync(string userName);
    Task<SingleGameDto> GetUserGameByUserIdAndGameIdAsync(int userId, Guid gameId);
    Task<List<SingleGameDto>> GetUserGamesByUserIdAsync(int userId);
    Task<List<User>> GetUsersAsync();
    Task<UserStatsDto> GetUserStatsByIdAsync(int userId);
}
