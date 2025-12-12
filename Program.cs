using Kohviautomaadi_haldussusteem_ORM.Data;
using Kohviautomaadi_haldussusteem_ORM.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    // Подавляем предупреждение о pending changes в Development режиме
    options.ConfigureWarnings(warnings => 
        warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Настройка для работы с camelCase JSON
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        // Игнорировать циклические ссылки
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();

// Swagger с JWT
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Coffee Machine API",
        Version = "v1"
    });

    // JWT авторизация
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header. Введите: Bearer {ваш_токен}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

builder.Services.AddHttpClient();

// JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var key = Encoding.ASCII.GetBytes(builder.Configuration["JwtKey"]);
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Инициализация ролей
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    // Применяем миграции автоматически
    try
    {
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Migration error: {ex.Message}");
    }

    // Добавляем колонки вручную, если их нет
    try
    {
        db.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Drinks]') AND name = 'Price')
            BEGIN
                ALTER TABLE [Drinks] ADD [Price] decimal(18,2) NOT NULL DEFAULT 0;
            END
        ");

        db.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Drinks]') AND name = 'OrderCount')
            BEGIN
                ALTER TABLE [Drinks] ADD [OrderCount] int NOT NULL DEFAULT 0;
            END
        ");

        db.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'TotalPrice')
            BEGIN
                ALTER TABLE [Orders] ADD [TotalPrice] decimal(18,2) NOT NULL DEFAULT 0;
            END
        ");

        db.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'Status')
            BEGIN
                ALTER TABLE [Orders] ADD [Status] nvarchar(50) NOT NULL DEFAULT N'Принят';
            END
        ");

        // Добавляем поля для скидок в Orders
        db.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'DiscountAmount')
            BEGIN
                ALTER TABLE [Orders] ADD [DiscountAmount] decimal(18,2) NOT NULL DEFAULT 0;
            END
        ");

        db.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'PromocodeUsed')
            BEGIN
                ALTER TABLE [Orders] ADD [PromocodeUsed] nvarchar(50) NULL;
            END
        ");

        db.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'FinalPrice')
            BEGIN
                ALTER TABLE [Orders] ADD [FinalPrice] decimal(18,2) NOT NULL DEFAULT 0;
            END
        ");

        // Создаем таблицу Promocodes
        db.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Promocodes')
            BEGIN
                CREATE TABLE [Promocodes] (
                    [Id] int IDENTITY(1,1) PRIMARY KEY,
                    [Code] nvarchar(50) NOT NULL UNIQUE,
                    [DiscountPercent] decimal(5,2) NOT NULL DEFAULT 0,
                    [DiscountAmount] decimal(18,2) NOT NULL DEFAULT 0,
                    [ValidFrom] datetime2 NULL,
                    [ValidTo] datetime2 NULL,
                    [MaxUsageCount] int NULL,
                    [UsageCount] int NOT NULL DEFAULT 0,
                    [MinOrderAmount] decimal(18,2) NULL,
                    [IsActive] bit NOT NULL DEFAULT 1,
                    [CreatedAt] datetime2 NOT NULL DEFAULT GETDATE()
                );
            END
        ");

        // Создаем таблицу PromocodeUsages
        db.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PromocodeUsages')
            BEGIN
                CREATE TABLE [PromocodeUsages] (
                    [Id] int IDENTITY(1,1) PRIMARY KEY,
                    [PromocodeId] int NOT NULL,
                    [UserId] int NOT NULL,
                    [OrderId] int NOT NULL,
                    [DiscountAmount] decimal(18,2) NOT NULL,
                    [UsedAt] datetime2 NOT NULL DEFAULT GETDATE(),
                    FOREIGN KEY ([PromocodeId]) REFERENCES [Promocodes]([Id]),
                    FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]),
                    FOREIGN KEY ([OrderId]) REFERENCES [Orders]([Id])
                );
            END
        ");

        Console.WriteLine("✅ Database schema updated successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Schema update error: {ex.Message}");
    }

    if (!db.Roles.Any())
    {
        db.Roles.AddRange(
            new Role { Name = "worker" },
            new Role { Name = "client" }
        );

        db.SaveChanges();
    }
    
    // Инициализация категорий
    if (!db.Categories.Any())
    {
        db.Categories.AddRange(
            new Category { Nimi = "Kohv" },
            new Category { Nimi = "Tee" },
            new Category { Nimi = "Joogid" }
        );
        db.SaveChanges();
    }
    
    // Инициализация напитков
    if (!db.Drinks.Any())
    {
        var coffeeCategory = db.Categories.FirstOrDefault(c => c.Nimi == "Kohv");
        if (coffeeCategory != null)
        {
            db.Drinks.AddRange(
                new Drink { JoogiNimi = "Latte", Kogus = 15, TopsiTüüp = "Keskmine", MaksimisViis = "Kaart", CategoryId = coffeeCategory.Id, Price = 2.50m },
                new Drink { JoogiNimi = "Espresso", Kogus = 20, TopsiTüüp = "Väike", MaksimisViis = "Sularaha", CategoryId = coffeeCategory.Id, Price = 1.80m },
                new Drink { JoogiNimi = "Cappuccino", Kogus = 10, TopsiTüüp = "Keskmine", MaksimisViis = "Kaart", CategoryId = coffeeCategory.Id, Price = 3.00m }
            );
            db.SaveChanges();
        }
    }
    else
    {
        // Обновляем цены для существующих напитков, если Price = 0
        var drinks = db.Drinks.Where(d => d.Price == 0).ToList();
        if (drinks.Any())
        {
            foreach (var drink in drinks)
            {
                drink.Price = drink.JoogiNimi switch
                {
                    "Latte" => 2.50m,
                    "Espresso" => 1.80m,
                    "Cappuccino" => 3.00m,
                    _ => 2.00m // Default price
                };
            }
            db.SaveChanges();
        }
    }
    
    // Инициализация тестовых пользователей
    var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
    var clientRole = db.Roles.FirstOrDefault(r => r.Name == "client");
    var workerRole = db.Roles.FirstOrDefault(r => r.Name == "worker");
    
    if (clientRole != null && workerRole != null)
    {
        // Проверяем и создаем/обновляем тестового клиента
        var testClient = db.Users.FirstOrDefault(u => u.Email == "client@test.ee");
        if (testClient == null)
        {
            testClient = new User { Nimi = "Test Client", Email = "client@test.ee", RoleId = clientRole.Id };
            testClient.Password = hasher.HashPassword(testClient, "123456");
            db.Users.Add(testClient);
        }
        else
        {
            // Обновляем пароль существующего пользователя
            testClient.Password = hasher.HashPassword(testClient, "123456");
            testClient.RoleId = clientRole.Id;
        }
        
        // Проверяем и создаем/обновляем тестового работника
        var testWorker = db.Users.FirstOrDefault(u => u.Email == "worker@test.ee");
        if (testWorker == null)
        {
            testWorker = new User { Nimi = "Test Worker", Email = "worker@test.ee", RoleId = workerRole.Id };
            testWorker.Password = hasher.HashPassword(testWorker, "123456");
            db.Users.Add(testWorker);
        }
        else
        {
            // Обновляем пароль существующего пользователя
            testWorker.Password = hasher.HashPassword(testWorker, "123456");
            testWorker.RoleId = workerRole.Id;
        }
        
        db.SaveChanges();
    }
    
    // Инициализация промокодов
    if (!db.Promocodes.Any())
    {
        db.Promocodes.AddRange(new[]
        {
            new Promocode
            {
                Code = "WELCOME10",
                DiscountPercent = 10,
                DiscountAmount = 0,
                ValidFrom = DateTime.Now,
                ValidTo = DateTime.Now.AddMonths(3),
                MaxUsageCount = 100,
                UsageCount = 0,
                MinOrderAmount = 5.00m,
                IsActive = true
            },
            new Promocode
            {
                Code = "COFFEE20",
                DiscountPercent = 20,
                DiscountAmount = 0,
                ValidFrom = DateTime.Now,
                ValidTo = DateTime.Now.AddMonths(1),
                MaxUsageCount = 50,
                UsageCount = 0,
                MinOrderAmount = 10.00m,
                IsActive = true
            },
            new Promocode
            {
                Code = "SAVE2EUR",
                DiscountPercent = 0,
                DiscountAmount = 2.00m,
                ValidFrom = DateTime.Now,
                ValidTo = DateTime.Now.AddMonths(2),
                MaxUsageCount = null, // Без ограничений
                UsageCount = 0,
                MinOrderAmount = 8.00m,
                IsActive = true
            }
        });
        db.SaveChanges();
    }
}

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(options => options
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader()
);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
