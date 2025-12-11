namespace Kohviautomaadi_haldussusteem_ORM.Models

{
    public class OrderItem
    {
        public int Id { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; }

        public int DrinkId { get; set; }
        public Drink Drink { get; set; }

        public int Quantity { get; set; } = 1;
    }


}
