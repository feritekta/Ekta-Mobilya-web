using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ekta_Mobilya_web.Data;
using Ekta_Mobilya_web.Models;

namespace Ekta_Mobilya_web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // HESAP OLUŞTURMA (Register)
        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            // Bu email ile daha önce kayıt olunmuş mu?
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                return BadRequest("Bu email adresi zaten kullanımda.");

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok("Hesap başarıyla oluşturuldu!");
        }

        // GİRİŞ YAPMA (Login)
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User loginUser)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginUser.Email && u.PasswordHash == loginUser.PasswordHash);

            if (user == null)
                return Unauthorized("Email veya şifre hatalı.");

            // DEĞİŞİKLİK BURADA: Artık kullanıcının ID'sini de gönderiyoruz
            return Ok(new
            {
                id = user.Id,
                username = user.Username,
                message = "Giriş başarılı!"
            });
        }
    }
}
