using System.ComponentModel.DataAnnotations;

namespace Kohviautomaadi_haldussusteem_ORM.Models
{
    public class Promocode
    {
        public int Id { get; set; }
        
        [Required]
        public string Code { get; set; } // Код промокода (например, "SUMMER2024")
        
        public decimal DiscountPercent { get; set; } // Процент скидки (например, 10 для 10%)
        
        public decimal DiscountAmount { get; set; } // Фиксированная скидка в евро
        
        public DateTime? ValidFrom { get; set; } // Дата начала действия
        
        public DateTime? ValidTo { get; set; } // Дата окончания действия
        
        public int? MaxUsageCount { get; set; } // Максимальное количество использований
        
        public int UsageCount { get; set; } // Текущее количество использований
        
        public decimal? MinOrderAmount { get; set; } // Минимальная сумма заказа для применения
        
        public bool IsActive { get; set; } = true; // Активен ли промокод
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        // Связь с использованиями промокода
        public List<PromocodeUsage>? PromocodeUsages { get; set; }
    }
}
