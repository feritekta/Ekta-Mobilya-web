using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ekta_Mobilya_web.Data;
using Ekta_Mobilya_web.Models;
using Microsoft.AspNetCore.Authorization;
using System.IO;

namespace Ekta_Mobilya_web.Controllers
{
    // React'tan gelecek "Dosya + Metin" paketini karşılayan yardımcı sınıf
    public class ProductDto
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public string? Category { get; set; }
        public IFormFile? ImageFile { get; set; } // Fotoğraf için
        public IFormFile? ModelFile { get; set; } // .glb için
    }

    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // --- 1. ÜRÜN LİSTELEME ---
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
                p.ModelUrl,
                IsFavorite = userId.HasValue && _context.Favorites.Any(f => f.UserId == userId && f.ProductId == p.Id)
            }).ToList();

            return Ok(productList);
        }

        // --- 2. ÜRÜN EKLEME (Admin - Dosya Destekli) ---
        [Authorize(Roles = "Admin")]
        [HttpPost("add")]
        public async Task<IActionResult> AddProduct([FromForm] ProductDto dto)
        {
            if (dto == null) return BadRequest("Ürün verisi boş olamaz.");

            var product = new Product
            {
                Name = dto.Name,
                Price = dto.Price,
                Description = dto.Description,
                Category = dto.Category
            };

            // Resim varsa kaydet
            if (dto.ImageFile != null)
                product.ImageUrl = await SaveFile(dto.ImageFile);

            // GLB Model varsa kaydet
            if (dto.ModelFile != null)
                product.ModelUrl = await SaveFile(dto.ModelFile);

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return Ok(product);
        }

        // --- 3. ÜRÜN GÜNCELLEME (Admin - Dosya Destekli) ---
        [Authorize(Roles = "Admin")]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] ProductDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound("Ürün bulunamadı.");

            product.Name = dto.Name;
            product.Price = dto.Price;
            product.Description = dto.Description;
            product.Category = dto.Category;

            // Eğer yeni bir resim seçildiyse güncelle
            if (dto.ImageFile != null)
                product.ImageUrl = await SaveFile(dto.ImageFile);

            // Eğer yeni bir model seçildiyse güncelle
            if (dto.ModelFile != null)
                product.ModelUrl = await SaveFile(dto.ModelFile);

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

        // --- YARDIMCI DOSYA KAYDETME FONKSİYONU ---
        private async Task<string> SaveFile(IFormFile file)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/uploads/{uniqueFileName}";
        }
    }
}