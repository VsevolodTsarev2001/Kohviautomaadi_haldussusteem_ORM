namespace Kohviautomaadi_haldussusteem_ORM.Models
{
    public class PromocodeUsage
    {
        public int Id { get; set; }
        
        public int PromocodeId { get; set; }
        public Promocode Promocode { get; set; } = null!;
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;
        
        public decimal DiscountAmount { get; set; } // Фактическая сумма скидки
        
        public DateTime UsedAt { get; set; } = DateTime.Now;
    }
}
