namespace Kohviautomaadi_haldussusteem_ORM.Models
{
    public class CreateDrinkDto
    {
        public string JoogiNimi { get; set; }
        public int Kogus { get; set; }
        public string TopsiTüüp { get; set; }
        public string MaksimisViis { get; set; }
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
    }
}
