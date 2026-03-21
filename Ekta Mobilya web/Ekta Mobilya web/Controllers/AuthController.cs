using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ekta_Mobilya_web.Data;
using Ekta_Mobilya_web.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Ekta_Mobilya_web.Controllers
{
    // --- GİRİŞ İÇİN ÖZEL MODEL ---
    // Bu sınıfı buraya ekliyoruz ki Login olurken Username istemesin.
    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                return BadRequest("Bu email adresi zaten kullanımda.");

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok("Hesap başarıyla oluşturuldu!");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginUser) // Değişti: LoginRequest kullanıyoruz
        {
            // Veritabanında kullanıcıyı bul
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginUser.Email && u.PasswordHash == loginUser.PasswordHash);

            if (user == null)
                return Unauthorized("Email veya şifre hatalı.");

            // 🔑 JWT oluştur
            // Not: Gerçek projede bu key appsettings.json'dan çekilmelidir.
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("super_secret_key_1234567890123456"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username ?? ""),
                new Claim(ClaimTypes.Role, user.Role ?? "User"),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: "EktaApp",
                audience: "EktaApp",
                claims: claims,
                expires: DateTime.Now.AddHours(3),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                token = tokenString,
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    role = user.Role
                }
            });
        }
    }
}