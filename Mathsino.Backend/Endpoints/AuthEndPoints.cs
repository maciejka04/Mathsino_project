using System.Security.Claims;
using Mathsino.Backend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Facebook;
using Microsoft.AspNetCore.Authentication.Google;

namespace Mathsino.Backend.Endpoints;

public static class AuthEndPoints
{
    public static void MapAuthEndPoints(this WebApplication app)
    {
        // Endpoint do inicjacji logowania Google
        app.MapGet(
            "/api/auth/google",
            (HttpContext context, IConfiguration configuration) =>
            {
                return Results.Challenge(
                    properties: new AuthenticationProperties
                    {
                        RedirectUri =
                            configuration["LogInRedirectUri"]
                            ?? throw new InvalidOperationException(
                                "LogInRedirectUri is not configured."
                            ),
                    }, // Przekierowanie do root po sukcesie
                    authenticationSchemes: new[] { GoogleDefaults.AuthenticationScheme }
                );
            }
        );

        // Endpoint do inicjacji logowania Facebook
        app.MapGet(
            "/api/auth/facebook",
            (HttpContext context, IConfiguration configuration) =>
            {
                return Results.Challenge(
                    properties: new AuthenticationProperties
                    {
                        RedirectUri =
                            configuration["LogInRedirectUri"]
                            ?? throw new InvalidOperationException(
                                "LogInRedirectUri is not configured."
                            ),
                    }, // Przekierowanie do root po sukcesie
                    authenticationSchemes: new[] { FacebookDefaults.AuthenticationScheme }
                );
            }
        );

        // Endpoint wylogowania
        app.MapPost(
            "/api/auth/logout",
            async (HttpContext context) =>
            {
                await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                context.Response.StatusCode = 200;
            }
        );

        // Endpoint testowy statusu/profilu
        app.MapGet(
                "/api/auth/profile",
                async (HttpContext context, MathsinoContext db) =>
                {
                    if (context.User.Identity?.IsAuthenticated == true)
                    {
                        var userIdString = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        if (int.TryParse(userIdString, out var userIdInt))
                        {
                            var user = await db.Users.FindAsync(userIdInt);
                            var userName = context.User.FindFirst(ClaimTypes.Name)?.Value;
                            var email = context.User.FindFirst(ClaimTypes.Email)?.Value;

                            return Results.Ok(
                                new
                                {
                                    IsAuthenticated = true,
                                    UserId = userIdString,
                                    UserName = userName,
                                    Email = email,
                                    AvatarPath = user.AvatarPath,
                                    Balance = user.Balance,
                                    UserNameTag = user.UserName,
                                    LastSpinTime = user.LastSpinTime,
                                    LessonsCompleted = user.LessonsCompleted,
                                    Message = "Zalogowano pomyślnie!",
                                }
                            );
                        }
                    }
                    return Results.Unauthorized();
                }
            )
            .RequireAuthorization();

        app.MapPut(
                "/api/user/avatar",
                async (HttpContext context, UpdateAvatarRequest request, MathsinoContext db) =>
                {
                    if (context.User.Identity?.IsAuthenticated == true)
                    {
                        var userIdString = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        if (int.TryParse(userIdString, out var userId))
                        {
                            var user = await db.Users.FindAsync(userId);
                            if (user != null)
                            {
                                user.AvatarPath = request.AvatarPath;
                                await db.SaveChangesAsync();

                                return Results.Ok(
                                    new { message = "Awatar zaktualizowany pomyślnie." }
                                );
                            }
                            return Results.NotFound(new { message = "Użytkownik nie znaleziony." });
                        }
                    }
                    return Results.Unauthorized();
                }
            )
            .RequireAuthorization();
    }
}
