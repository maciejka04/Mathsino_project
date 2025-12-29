using System.Security.Cryptography;
using Mathsino.Backend.Interfaces;
using Mathsino.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Mathsino.Backend.Services;

public class AdRewardService : IAdRewardService
{
    private readonly MathsinoContext _dbContext;
    private readonly IBalanceService _balanceService;
    private readonly ILogger<AdRewardService> _logger;

    private const int TOKEN_EXPIRY_MINUTES = 20;
    private const int MIN_AD_DURATION_SECONDS = 20;
    private const int DEFAULT_REWARD_AMOUNT = 100;

    public AdRewardService(
        MathsinoContext dbContext,
        IBalanceService balanceService,
        ILogger<AdRewardService> logger
    )
    {
        _dbContext = dbContext;
        _balanceService = balanceService;
        _logger = logger;
    }

    public async Task<StartAdViewResponse> StartAdViewAsync(int userId)
    {
        _logger.LogInformation("Starting ad view for user {UserId}", userId);

        var userExists = await _dbContext.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
        {
            _logger.LogWarning("User {UserId} not found", userId);
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }

        var existingToken = await GetActiveAdViewAsync(userId);
        if (existingToken != null)
        {
            _logger.LogInformation(
                "User {UserId} already has active token, returning existing",
                userId
            );

            return new StartAdViewResponse(
                existingToken.VerificationToken,
                existingToken.ExpiresAt,
                existingToken.RewardAmount
            );
        }

        var token = GenerateSecureToken();

        var adView = new AdView
        {
            UserId = userId,
            VerificationToken = token,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(TOKEN_EXPIRY_MINUTES),
            RewardClaimed = false,
            RewardAmount = DEFAULT_REWARD_AMOUNT,
        };

        _dbContext.AdViews.Add(adView);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation(
            "Created ad view token for user {UserId}, expires at {ExpiresAt}",
            userId,
            adView.ExpiresAt
        );

        return new StartAdViewResponse(token, adView.ExpiresAt, adView.RewardAmount);
    }

    public async Task<ClaimAdRewardResponse> ClaimAdRewardAsync(int userId, string token)
    {
        var userExists = await _dbContext.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
        {
            _logger.LogWarning("User {UserId} not found", userId);
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }

        _logger.LogInformation("User {UserId} attempting to claim ad reward", userId);

        var adView = await _dbContext.AdViews.FirstOrDefaultAsync(ad =>
            ad.UserId == userId && ad.VerificationToken == token && !ad.RewardClaimed
        );
        if (adView == null)
        {
            _logger.LogWarning(
                "Invalid claim attempt for user {UserId} and token {Token}",
                userId,
                token
            );
            throw new InvalidOperationException("Invalid token or reward already claimed");
        }

        if (adView.ExpiresAt < DateTime.UtcNow)
        {
            _logger.LogWarning("Token expired for user {UserId} and token {Token}", userId, token);
            throw new InvalidOperationException("Token has expired");
        }

        var secondsElapsed = (DateTime.UtcNow - adView.CreatedAt).TotalSeconds;
        if (secondsElapsed < MIN_AD_DURATION_SECONDS)
        {
            _logger.LogWarning(
                "User {UserId} tried to claim reward too quickly: {Seconds}s < {MinSeconds}s",
                userId,
                secondsElapsed,
                MIN_AD_DURATION_SECONDS
            );
            var secondsRemaining = (int)(MIN_AD_DURATION_SECONDS - secondsElapsed);
            throw new InvalidOperationException(
                $"Ad view not completed. Please wait {secondsRemaining} more seconds."
            );
        }
        using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            await _balanceService.AddBalance(userId, adView.RewardAmount);

            adView.RewardClaimed = true;
            adView.RewardClaimedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            await _balanceService.SaveBalanceSnapshot(userId);

            await transaction.CommitAsync();

            _logger.LogInformation(
                "User {UserId} successfully claimed ad reward: {Amount} PLN",
                userId,
                adView.RewardAmount
            );

            var newBalance = await _balanceService.GetBalance(userId);

            return new ClaimAdRewardResponse(newBalance, adView.RewardAmount);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error claiming ad reward for user {UserId}", userId);
            throw;
        }
    }

    public async Task<AdView?> GetActiveAdViewAsync(int userId)
    {
        return await _dbContext
            .AdViews.Where(av =>
                av.UserId == userId && !av.RewardClaimed && av.ExpiresAt > DateTime.UtcNow
            )
            .OrderByDescending(av => av.CreatedAt)
            .FirstOrDefaultAsync();
    }

    private static string GenerateSecureToken()
    {
        return Guid.NewGuid().ToString("N");
    }
}
