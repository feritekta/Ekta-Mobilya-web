using Microsoft.EntityFrameworkCore;
using Ekta_Mobilya_web.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- 1. AYARLAR ---
// JWT Key (En az 16-32 karakter olmalı, AuthController ile aynı olmalı!)
var jwtKey = "super_secret_key_1234567890123456";

// --- 2. SERVİSLER ---

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS (React bağlantısı için)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// AUTHENTICATION & JWT (Burası güncellendi)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, // AuthController'da "EktaApp" verdiğin için bunu true yapıyoruz
        ValidateAudience = true, // AuthController'da "EktaApp" verdiğin için bunu true yapıyoruz
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = "EktaApp", // AuthController ile birebir aynı olmalı
        ValidAudience = "EktaApp", // AuthController ile birebir aynı olmalı
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// --- 3. MIDDLEWARE (ARA YAZILIM) ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS mutlaka Auth'dan önce gelmeli!
app.UseCors("AllowReact");

// SIRA ÇOK ÖNEMLİ: Önce Authentication, sonra Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();