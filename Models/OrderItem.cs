namespace Kohviautomaadi_haldussusteem_ORM.Models

{
    public class OrderItem
    {
        public int Id { get; set; }

        public int DrinkId { get; set; }
        public Drink Drink { get; set; }
    }

}
