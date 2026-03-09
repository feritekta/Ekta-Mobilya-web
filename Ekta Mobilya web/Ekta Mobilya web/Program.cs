using Microsoft.EntityFrameworkCore;
using Ekta_Mobilya_web.Data;

var builder = WebApplication.CreateBuilder(args);
// Veritabaný baðlantý servisini (DbContext) uygulamaya tanýtýyoruz.
builder.Services.AddDbContext<AppDbContext>(options =>
    // SQL Server kullanacaðýmýzý ve baðlantý adresini (Connection String) 
    // 'appsettings.json' dosyasýndaki "DefaultConnection" adýndan alacaðýmýzý belirtiyoruz.
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// React (Frontend) uygulamamýzýn API'ye eriþebilmesi için izin veriyoruz.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        builder => builder.AllowAnyOrigin() // Þimdilik her yerden gelen isteðe izin ver (Test aþamasý için).
                          .AllowAnyMethod() // GET, POST, DELETE hepsine izin ver.
                          .AllowAnyHeader()); // Tüm baþlýklara izin ver.
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReact");

app.UseAuthorization();

app.MapControllers();

app.Run();
