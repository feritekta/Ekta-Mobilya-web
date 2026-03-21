namespace Ekta_Mobilya_web.Models
{
    public class User
    {
        public int Id { get; set; }
        public string? Username { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; } // Şifreyi açık yazmıyoruz, hash'liyoruz.
        public string Role { get; set; } = "User"; // Varsayılan olarak User
    }
}
