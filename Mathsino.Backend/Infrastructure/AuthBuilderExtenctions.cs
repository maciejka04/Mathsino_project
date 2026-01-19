using System.Security.Claims;
using Mathsino.Backend.Interfaces;
using Mathsino.Backend.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Facebook;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.EntityFrameworkCore;

namespace Mathsino.Backend.Infrastructure;

public static class AuthBuilderExtenctions
{
    public static WebApplicationBuilder AddAuthServices(this WebApplicationBuilder builder)
    {
        // Używamy ciasteczek do przechowywania stanu zalogowania
        builder
            .Services.AddAuthentication(options =>
            {
                // Ustawienie domyślnego schematu dla wszystkich operacji związanych z uwierzytelnianiem
                options.DefaultAuthenticateScheme =
                    CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            })
            // Dodajemy obsługę ciasteczek (Cookies)
            .AddCookie(options =>
            {
                options.Cookie.Name = "MathsinoAuth";
                // Ustaw czas życia ciasteczka
                options.ExpireTimeSpan = TimeSpan.FromHours(24);
                // Opcje Cookie (np. SecurePolicy = CookieSecurePolicy.Always dla produkcji)
            })
            // Dodajemy strategię Google OAuth
            .AddGoogle(
                GoogleDefaults.AuthenticationScheme,
                options =>
                {
                    options.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
                    options.ClientSecret = builder.Configuration[
                        "Authentication:Google:ClientSecret"
                    ]!;
                    options.Scope.Add("profile");
                    options.Scope.Add("email");
                    options.CallbackPath = "/signin-google";

                    options.Events.OnCreatingTicket = context =>
                        OnCreatingTicketHandler(context, "Google", builder.Services);
                }
            )
            // Dodajemy strategię Facebook OAuth
            .AddFacebook(
                FacebookDefaults.AuthenticationScheme,
                options =>
                {
                    options.AppId = builder.Configuration["Authentication:Facebook:AppId"]!;
                    options.AppSecret = builder.Configuration["Authentication:Facebook:AppSecret"]!;
                    options.Scope.Add("email");

                    // Kluczowy handler do zapisu/odczytu użytkownika z DB
                    options.Events.OnCreatingTicket = context =>
                        OnCreatingTicketHandler(context, "Facebook", builder.Services);
                }
            );

        builder.Services.AddAuthorization();

        return builder;
    }

    static async Task OnCreatingTicketHandler(
        OAuthCreatingTicketContext context,
        string provider,
        IServiceCollection services
    )
    {
        // Pobieramy Service Provider
        using var scope = services.BuildServiceProvider().CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<MathsinoContext>();
        var userNameService = scope.ServiceProvider.GetRequiredService<IUserNameService>();

        var providerId = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = context.Principal?.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(providerId) || string.IsNullOrEmpty(email))
        {
            context.Fail("Brak wymaganych informacji od dostawcy.");
            return;
        }

        // 1. Znajdź istniejącego użytkownika (po Provider i ProviderId)
        var user = await dbContext.Users.FirstOrDefaultAsync(u =>
            u.Provider == provider && u.ProviderId == providerId
        );

        /*
        if (user != null && user.Balance < 5000)
        {
            // TYMCZASOWA LINIA: Zapewnienie, że istniejący użytkownik ma min. 5000 na start
            user.Balance = 5000;
            await dbContext.SaveChangesAsync();
        }
        */

        if (user == null)
        {
            // 2. Utwórz nowego użytkownika, jeśli nie istnieje
            var firstName =
                context.Principal?.FindFirst(ClaimTypes.GivenName)?.Value
                ?? context.Principal?.FindFirst("given_name")?.Value
                ?? "Użytkownik";
            var lastName = context.Principal?.FindFirst(ClaimTypes.Surname)?.Value ?? "";
            var NewUserPastSpinTime = new DateTime(2025, 12, 1, 12, 0, 0, DateTimeKind.Utc);
            var userName = await userNameService.GenerateUniqueUserNameAsync(firstName, lastName);
            var balanceService = scope.ServiceProvider.GetRequiredService<IBalanceService>();

            user = new User
            {
                FirstName = firstName,
                LastName = lastName,
                UserName = userName,
                Email = email,
                Provider = provider,
                ProviderId = providerId,
                AvatarPath = "snake.png",
                Balance = 2500,
                LastSpinTime = NewUserPastSpinTime,
                LessonsCompleted = 0,
            };
            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync();

            await balanceService.SaveBalanceSnapshot(user.Id);
        }

        // 3. Utwórz ClaimsPrincipal z użyciem wewnętrznego ID użytkownika z bazy
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FirstName),
            new Claim(ClaimTypes.Email, user.Email),
        };

        var appIdentity = new ClaimsIdentity(claims, context.Scheme.Name);

        // Zastąp Principa OAuth nowym Principlem z Twoim wewnętrznym ID
        context.Principal = new ClaimsPrincipal(appIdentity);
    }
}
