using Mathsino.Backend.Models;

namespace Mathsino.Backend.Services;

public interface IAdRewardService
{
    Task<ClaimAdRewardResponse> ClaimAdRewardAsync(int userId, string token);
    Task<AdView?> GetActiveAdViewAsync(int userId);
    Task<StartAdViewResponse> StartAdViewAsync(int userId);
}
