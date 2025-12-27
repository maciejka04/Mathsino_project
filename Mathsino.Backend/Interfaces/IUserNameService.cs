namespace Mathsino.Backend.Interfaces;

public interface IUserNameService
{
    Task<(bool Success, string Message)> ChangeUserNameAsync(int userId, string newUserName);
    Task<string> GenerateUniqueUserNameAsync(string firstName, string lastName);
    bool IsValidUserName(string userName);
    Task<bool> UserNameExistsAsync(string userName);
}
