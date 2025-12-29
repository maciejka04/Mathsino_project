namespace Mathsino.Backend.Interfaces;

public interface IBalanceService
{
    Task AddBalance(int userId, int amount);
    Task<bool> DeductBalance(int userId, int amount);
    Task<int> GetBalance(int userId);
    Task SaveBalanceSnapshot(int userId);
}
