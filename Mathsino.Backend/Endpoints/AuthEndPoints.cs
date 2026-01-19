using System.Security.Claims;
using Mathsino.Backend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Facebook;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;

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
                    },
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
                    },
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
                return Results.Ok(new { message = "Wylogowano pomyślnie" });
            }
        );

        // Endpoint testowy statusu/profilu (ZABEZPIECZONY PRZED CRASHEM)
        app.MapGet(
                "/api/auth/profile",
                async (HttpContext context, MathsinoContext db) =>
                {
                    // 1. Sprawdzenie czy user jest w ogóle zalogowany w kontekście HTTP
                    if (context.User?.Identity?.IsAuthenticated != true)
                    {
                        return Results.Unauthorized();
                    }

                    // 2. Bezpieczne pobranie ID
                    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
                    if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value))
                    {
                        return Results.Unauthorized();
                    }

                    if (int.TryParse(userIdClaim.Value, out var userIdInt))
                    {
                        var user = await db.Users.FindAsync(userIdInt);
                        if (user == null) return Results.Unauthorized();

                        var userName = context.User.FindFirst(ClaimTypes.Name)?.Value ?? user.UserName;
                        var email = context.User.FindFirst(ClaimTypes.Email)?.Value ?? user.Email;

                        return Results.Ok(
                            new
                            {
                                IsAuthenticated = true,
                                UserId = userIdClaim.Value,
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
                    
                    return Results.Unauthorized();
                }
            )
            .RequireAuthorization();

        // Endpoint do aktualizacji awatara
        app.MapPut(
                "/api/user/avatar",
                async (HttpContext context, UpdateAvatarRequest request, MathsinoContext db) =>
                {
                    if (context.User?.Identity?.IsAuthenticated == true)
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
            
        // Prosty endpoint do sprawdzania stanu (często używany przez frontend)
        app.MapGet("/auth/user", (HttpContext context) => 
        {
             if (context.User?.Identity?.IsAuthenticated == true)
             {
                 return Results.Ok(new { 
                     isAuthenticated = true,
                     userName = context.User.Identity.Name,
                     userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                 });
             }
             return Results.Unauthorized();
        });
    }
}

public record UpdateAvatarRequest(string AvatarPath);