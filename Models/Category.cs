namespace Kohviautomaadi_haldussusteem_ORM.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Nimi { get; set; }

        public List<Drink> Drinks { get; set; }
    }

}
