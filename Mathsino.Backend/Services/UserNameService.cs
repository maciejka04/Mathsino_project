using System.Text.RegularExpressions;
using Mathsino.Backend.Interfaces;
using Mathsino.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Mathsino.Backend.Services
{
    public class UserNameService : IUserNameService
    {
        private readonly MathsinoContext _dbContext;
        private readonly ILogger<UserNameService>? _logger;

        public UserNameService(MathsinoContext dbContext, ILogger<UserNameService>? logger = null)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<string> GenerateUniqueUserNameAsync(string firstName, string lastName)
        {
            string normalizedFirst = NormalizeString(firstName);
            string normalizedLast = NormalizeString(lastName);

            string firstPart =
                normalizedFirst.Length >= 3
                    ? normalizedFirst.Substring(0, 3)
                    : normalizedFirst.PadRight(3, 'x');

            string lastPart =
                normalizedLast.Length >= 3
                    ? normalizedLast.Substring(0, 3)
                    : normalizedLast.PadRight(3, 'x');

            string baseUserName = $"{firstPart}{lastPart}";

            if (!await UserNameExistsAsync(baseUserName))
            {
                _logger?.LogInformation("Generated username: {UserName}", baseUserName);
                return baseUserName;
            }

            int i = 1;
            string userName;
            do
            {
                userName = $"{baseUserName}{i}";
                i++;
            } while (await UserNameExistsAsync(userName));

            _logger?.LogInformation("Generated username with number: {UserName}", userName);
            return userName;
        }

        public async Task<bool> UserNameExistsAsync(string userName)
        {
            return await _dbContext.Users.AnyAsync(u => u.UserName.ToLower() == userName.ToLower());
        }

        public bool IsValidUserName(string userName)
        {
            if (string.IsNullOrWhiteSpace(userName))
                return false;

            if (userName.Length < 3 || userName.Length > 30)
                return false;

            return Regex.IsMatch(userName, @"^[a-zA-Z0-9_.]+$");
        }

        public async Task<(bool Success, string Message)> ChangeUserNameAsync(
            int userId,
            string newUserName
        )
        {
            if (!IsValidUserName(newUserName))
            {
                return (
                    false,
                    "Username must be 3-30 characters long and contain only letters and numbers"
                );
            }

            if (await UserNameExistsAsync(newUserName))
            {
                return (false, "Username is already taken");
            }

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                return (false, "User not found");
            }

            string oldUserName = user.UserName;
            user.UserName = newUserName;
            await _dbContext.SaveChangesAsync();

            _logger?.LogInformation(
                "User {UserId} changed username from '{OldUserName}' to '{NewUserName}'",
                userId,
                oldUserName,
                newUserName
            );

            return (true, "Username changed successfully");
        }

        private string NormalizeString(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            var polishChars = new Dictionary<char, char>
            {
                { 'ą', 'a' },
                { 'ć', 'c' },
                { 'ę', 'e' },
                { 'ł', 'l' },
                { 'ń', 'n' },
                { 'ó', 'o' },
                { 'ś', 's' },
                { 'ź', 'z' },
                { 'ż', 'z' },
                { 'Ą', 'a' },
                { 'Ć', 'c' },
                { 'Ę', 'e' },
                { 'Ł', 'l' },
                { 'Ń', 'n' },
                { 'Ó', 'o' },
                { 'Ś', 's' },
                { 'Ź', 'z' },
                { 'Ż', 'z' },
            };

            string normalized = new string(
                input
                    .Select(c => polishChars.ContainsKey(c) ? polishChars[c] : c)
                    .Where(c => char.IsLetterOrDigit(c))
                    .ToArray()
            ).ToLower();

            return normalized;
        }
    }
}
