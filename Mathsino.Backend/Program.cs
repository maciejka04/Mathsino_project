using System.Security.Claims;
using Mathsino.Backend.Models;
using Mathsino.Backend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Facebook;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.EntityFrameworkCore;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
var builder = WebApplication.CreateBuilder(args);

// =======================================================
// === 1. KONFIGURACJA UWIERZYTELNIANIA (AUTHENTICATION) ===
// =======================================================

// Używamy ciasteczek do przechowywania stanu zalogowania
builder
    .Services.AddAuthentication(options =>
    {
        // Ustawienie domyślnego schematu dla wszystkich operacji związanych z uwierzytelnianiem
        options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
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
            options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
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

// =======================================================
// === 2. STANDARDOWA KONFIGURACJA USŁUG ===
// =======================================================

builder.AddServiceDefaults();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Konfiguracja CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowReactApp",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    );
});

// Konfiguracja kontekstu bazy danych z odczytem Connection String (sprawdzamy mathsino-db)
builder.Services.AddDbContextPool<MathsinoContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
            ?? builder.Configuration.GetConnectionString("mathsino-db")
    )
);

builder.Services.AddScoped<UsersService>();
builder.Services.AddScoped<FriendService>();
builder.Services.AddScoped<UserNameService>();
builder.Services.AddSingleton<GameService>();
builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        // TUTAJ WPISZ SWOJĄ NAZWĘ KONTEKSTU (np. MathsinoDbContext)
        var context = services.GetRequiredService<MathsinoContext>();

        // Ta komenda robi to samo co "dotnet ef database update", ale automatycznie!
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Wystąpił błąd podczas tworzenia bazy danych.");
    }
}

// =======================================================
// === 3. KONFIGURACJA MIDDLEWARE ===
// =======================================================

app.UseCors("AllowReactApp");

app.UseSwagger();
app.UseSwaggerUI();

// Ważne: Włącz uwierzytelnianie i autoryzację
app.UseAuthentication();
app.UseAuthorization();

MigrateDatabase(app);

// =======================================================
// === 4. ENDPOINTY DLA OAUTH ===
// =======================================================

// Endpoint do inicjacji logowania Google
app.MapGet(
    "/api/auth/google",
    (HttpContext context) =>
    {
        return Results.Challenge(
            properties: new AuthenticationProperties { RedirectUri = "http://localhost:3000/" }, // Przekierowanie do root po sukcesie
            authenticationSchemes: new[] { GoogleDefaults.AuthenticationScheme }
        );
    }
);

// Endpoint do inicjacji logowania Facebook
app.MapGet(
    "/api/auth/facebook",
    (HttpContext context) =>
    {
        return Results.Challenge(
            properties: new AuthenticationProperties { RedirectUri = "http://localhost:3000/" }, // Przekierowanie do root po sukcesie
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

                        return Results.Ok(new { message = "Awatar zaktualizowany pomyślnie." });
                    }
                    return Results.NotFound(new { message = "Użytkownik nie znaleziony." });
                }
            }
            return Results.Unauthorized();
        }
    )
    .RequireAuthorization();

app.MapUserEndPoints();
app.MapGameEndPoints();
app.MapBalanceEndPoints();
app.MapFriendEndPoints();

await app.RunAsync();

// =======================================================
// === 5. HANDLERY POMOCNICZE ===
// =======================================================

// Handler obsługujący callback OAuth - logikę zapisu/odczytu z DB
static async Task OnCreatingTicketHandler(
    OAuthCreatingTicketContext context,
    string provider,
    IServiceCollection services
)
{
    // Pobieramy Service Provider
    using var scope = services.BuildServiceProvider().CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MathsinoContext>();
    var userNameService = scope.ServiceProvider.GetRequiredService<UserNameService>();

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

        var userName = await userNameService.GenerateUniqueUserNameAsync(firstName, lastName);

        user = new User
        {
            FirstName = firstName,
            LastName = lastName,
            UserName = userName,
            Email = email,
            Provider = provider,
            ProviderId = providerId,
            AvatarPath = "snake.png",
            Balance = 5000,
        };
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();
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

static void MigrateDatabase(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<MathsinoContext>();
    db.Database.Migrate();
}
