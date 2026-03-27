using Microsoft.EntityFrameworkCore;
using Ekta_Mobilya_web.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.StaticFiles;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 100 * 1024 * 1024; // 100 MB limit
});

// Ayrıca controller bazlı limit için bunu da altına ekle:
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(x =>
{
    x.ValueLengthLimit = int.MaxValue;
    x.MultipartBodyLengthLimit = 100 * 1024 * 1024; // 100 MB
});

// --- 1. AYARLAR ---
var jwtKey = "super_secret_key_1234567890123456";

// --- 2. SERVİSLER ---

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// SWAGGER YAPILANDIRMASI (Authorize Kilidi Buradan Geliyor)
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Ekta Mobilya API", Version = "v1" });

    // Swagger'a JWT desteğini tanıtıyoruz
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Örnek kullanım: 'Bearer 12345abcdef'"
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
            new string[] {}
        }
    });
});

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// AUTHENTICATION & JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = "EktaApp",
        ValidAudience = "EktaApp",
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
// 1. Önce CORS politikası uygulanmalı
app.UseCors("AllowReact");

// 2. Statik dosyalar için MIME tiplerini ve CORS header'larını ayarla
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".glb"] = "model/gltf-binary";
provider.Mappings[".gltf"] = "model/gltf+json";

// Tüm statik dosyalar (resimler + modeller) için tek bir ayar:
app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = provider,
    OnPrepareResponse = ctx =>
    {
        // Bu satır React tarafındaki "CORS policy blocked" hatasını çözer
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, OPTIONS");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type");
    }
});

// Artık ikinci bir app.UseStaticFiles() çağırmana gerek yok, yukarıdaki her şeyi kapsıyor.

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();