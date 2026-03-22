using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ekta_Mobilya_web.Data;
using Ekta_Mobilya_web.Models;
using Microsoft.AspNetCore.Authorization;

namespace Ekta_Mobilya_web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // --- 1. ÜRÜN LİSTELEME (Gelişmiş) ---
        [HttpGet]
        public async Task<IActionResult> GetProducts([FromQuery] int? userId)
        {
            var products = await _context.Products.ToListAsync();

            var productList = products.Select(p => new {
                p.Id,
                p.Name,
                p.Price,
                p.Description,
                p.ImageUrl,
                p.Category,
                p.ModelUrl, // Eksik olan GLB alanı eklendi
                IsFavorite = userId.HasValue && _context.Favorites.Any(f => f.UserId == userId && f.ProductId == p.Id)
            }).ToList();

            return Ok(productList);
        }

        // --- 2. ÜRÜN EKLEME (Admin) ---
        [Authorize(Roles = "Admin")]
        [HttpPost("add")]
        public async Task<IActionResult> AddProduct([FromBody] Product product)
        {
            if (product == null) return BadRequest("Ürün verisi boş olamaz.");

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return Ok(product);
        }

        // --- 3. ÜRÜN GÜNCELLEME (Admin) ---
        [Authorize(Roles = "Admin")]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product updatedProduct)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound("Ürün bulunamadı.");

            // Tüm alanları tek tek güncelliyoruz
            product.Name = updatedProduct.Name;
            product.Price = updatedProduct.Price;
            product.Description = updatedProduct.Description;
            product.ImageUrl = updatedProduct.ImageUrl;
            product.Category = updatedProduct.Category;
            product.ModelUrl = updatedProduct.ModelUrl; // GLB model yolu güncellemesi eklendi

            await _context.SaveChangesAsync();
            return Ok(product);
        }

        // --- 4. ÜRÜN SİLME (Admin) ---
        [Authorize(Roles = "Admin")]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Ürün silindi." });
        }

        // --- FAVORİ İŞLEMLERİ ---

        [HttpPost("favorite")]
        public async Task<IActionResult> AddFavorite([FromBody] Favorite favorite)
        {
            var existing = await _context.Favorites
                .AnyAsync(f => f.UserId == favorite.UserId && f.ProductId == favorite.ProductId);

            if (existing) return BadRequest("Bu ürün zaten favorilerinizde.");

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Favorilere eklendi!" });
        }

        [HttpGet("my-favorites/{userId}")]
        public async Task<IActionResult> GetMyFavorites(int userId)
        {
            var favorites = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Include(f => f.Product)
                .Select(f => f.Product)
                .ToListAsync();

            return Ok(favorites);
        }

        [HttpDelete("favorite-remove")]
        public async Task<IActionResult> RemoveFavorite(int userId, int productId)
        {
            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.ProductId == productId);

            if (favorite == null) return NotFound("Favori kaydı bulunamadı.");

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Favorilerden kaldırıldı!" });
        }

        // Örnek Veri Seed (İhtiyaç duyarsan kullan)
        [HttpPost("seed")]
        public async Task<IActionResult> SeedData()
        {
            if (_context.Products.Any()) return BadRequest("Veriler zaten eklenmiş.");

            _context.Products.AddRange(
                new Product { Name = "Modern Koltuk", Description = "Şık tasarım.", Price = 15000, ImageUrl = "/images/koltuk.jpg", Category = "Oturma Odası", ModelUrl = "/models/koltuk.glb" }
            );

            await _context.SaveChangesAsync();
            return Ok("Örnek veriler eklendi.");
        }
    }
}