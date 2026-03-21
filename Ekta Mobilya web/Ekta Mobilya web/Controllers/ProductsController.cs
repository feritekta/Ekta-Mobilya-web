using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ekta_Mobilya_web.Data;
using Ekta_Mobilya_web.Models;
using Microsoft.AspNetCore.Authorization; // [Authorize] için gerekli
 

namespace Ekta_Mobilya_web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        // Dependency Injection: Veritabanı bağlantımızı (AppDbContext) bu sınıfa tanıtıyoruz.
        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // ÜRÜN EKLEME (Sadece Adminler Yapabilir)
        [Authorize(Roles = "Admin")]
        [HttpPost("add")]
        public async Task<IActionResult> AddProduct([FromBody] Product product)
        {
            if (product == null) return BadRequest();

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return Ok(product);
        }

        // ÜRÜN GÜNCELLEME (PUT) - Fotoğraf, açıklama vs.
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product updatedProduct)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.Name = updatedProduct.Name;
            product.Price = updatedProduct.Price;
            product.Description = updatedProduct.Description;
            product.ImageUrl = updatedProduct.ImageUrl;
            product.Category = updatedProduct.Category;

            await _context.SaveChangesAsync();
            return Ok(product);
        }

        // ÜRÜN SİLME (DELETE)
        [Authorize(Roles = "Admin")]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return Ok();
        }

        

        //// 1. ADIM: Tüm Ürünleri Getir (GET api/products)
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        //{
        //    // Veritabanındaki 'Products' tablosuna gider ve tüm listeyi çeker.
        //    return await _context.Products.ToListAsync();
        //}

        // 2. ADIM: Test Verisi Eklemek (POST api/products/seed)
        // Veritabanın şu an boş olduğu için, React'te bir şey görebilmemiz adına geçici bir 'Seed' metodu yazıyoruz.
        [HttpPost("seed")]
        public async Task<IActionResult> SeedData()
        {
            // Eğer tabloda zaten ürün varsa tekrar eklemesin diye kontrol ediyoruz.
            if (_context.Products.Any()) return BadRequest("Veriler zaten eklenmiş.");

            _context.Products.AddRange(
                new Product { Name = "Modern Koltuk Takımı", Description = "Lüks kadife kumaş, antrasit gri.", Price = 15000, ImageUrl = "https://example.com/koltuk.jpg", Category = "Oturma Odası" },
                new Product { Name = "Ahşap Yemek Masası", Description = "6 kişilik doğal meşe kaplama.", Price = 8500, ImageUrl = "https://example.com/masa.jpg", Category = "Mutfak" },
                new Product { Name = "Minimalist Kitaplık", Description = "Metal ayaklı, modern tasarım.", Price = 2200, ImageUrl = "https://example.com/kitaplik.jpg", Category = "Çalışma Odası" }
            );

            await _context.SaveChangesAsync(); // Değişiklikleri veritabanına kaydeder.
            return Ok("Örnek mobilyalar başarıyla eklendi!");
        }

        // 1. ÜRÜN LİSTESİNİ FAVORİ BİLGİSİYLE GETİRME
        [HttpGet("{userId?}")] // userId opsiyonel (giriş yapmayanlar için null gelir)
        public async Task<IActionResult> GetProducts(int? userId)
        {
            // Önce tüm ürünleri veritabanından çekiyoruz
            var products = await _context.Products.ToListAsync();

            // Ürünleri yeni bir yapıya (anonim nesneye) dönüştürüyoruz
            var productList = products.Select(p => new {
                p.Id,
                p.Name,
                p.Price,
                p.Description,
                // EĞER kullanıcı giriş yapmışsa (userId varsa), bu ürün o kullanıcının favorilerinde mi kontrol et:
                IsFavorite = userId.HasValue && _context.Favorites.Any(f => f.UserId == userId && f.ProductId == p.Id)
            }).ToList();

            return Ok(productList);
        }

        // --- SENDEKİ DİĞER KODLAR AYNI KALIYOR ---

        [HttpPost("favorite")]
        public async Task<IActionResult> AddFavorite([FromBody] Favorite favorite)
        {
            var existing = await _context.Favorites
                .AnyAsync(f => f.UserId == favorite.UserId && f.ProductId == favorite.ProductId);

            if (existing) return BadRequest("Bu ürün zaten favorilerinizde.");

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();
            return Ok("Ürün veritabanına kaydedildi!");
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

            if (favorite == null)
                return NotFound("Favori kaydı bulunamadı.");

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Favorilerden kaldırıldı!" });
        }
    }


}
