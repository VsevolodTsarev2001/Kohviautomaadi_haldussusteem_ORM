namespace Kohviautomaadi_haldussusteem_ORM.Models
{
    public class Order
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }  // <- nullable

        public DateTime CreatedAt { get; set; }
        public decimal TotalPrice { get; set; } // Общая стоимость заказа
        public string Status { get; set; } = "Принят"; // Статус заказа
        
        // Поля для скидок
        public decimal DiscountAmount { get; set; } = 0; // Сумма скидки
        public string? PromocodeUsed { get; set; } // Использованный промокод
        public decimal FinalPrice { get; set; } // Итоговая цена после скидки

        public List<OrderItem>? Items { get; set; } // <- nullable
    }
}