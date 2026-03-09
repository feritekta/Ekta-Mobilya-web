namespace Ekta_Mobilya_web.Models
{
    public class Favorite
    {
        public int Id { get; set; }
        public int UserId { get; set; }//Hangi Kullanıcı
        public int ProductId { get; set; } //Hangi Ürün

        // İlişkiler (Opsiyonel ama iyi pratiktir)
        public User? User { get; set; }
        public Product? Product { get; set; }
    }
}
