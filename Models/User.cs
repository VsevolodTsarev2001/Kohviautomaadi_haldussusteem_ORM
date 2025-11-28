namespace Kohviautomaadi_haldussusteem_ORM.Models

{
    public class User
    {
        public int Id { get; set; }
        public string Nimi { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }

        public string Role { get; set; } // "client" / "haldur"
    }

}
