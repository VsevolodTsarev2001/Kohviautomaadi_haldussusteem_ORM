namespace Kohviautomaadi_haldussusteem_ORM.Models
{
    public class RegisterRequest
    {
        public string Nimi { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        // id роли (client=1, worker=2)
        public int RoleId { get; set; }
    }
}
