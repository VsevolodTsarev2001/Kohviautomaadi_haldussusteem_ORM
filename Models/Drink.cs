namespace Kohviautomaadi_haldussusteem_ORM.Models
{
    public class Drink
    {
        public int Id { get; set; }

        public string JoogiNimi { get; set; }
        public int Kogus { get; set; }
        public string TopsiTüüp { get; set; }
        public string MaksimisViis { get; set; }

        public int CategoryId { get; set; }
        public Category Category { get; set; }
    }


}
