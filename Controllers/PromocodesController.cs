using Kohviautomaadi_haldussusteem_ORM.Data;
using Kohviautomaadi_haldussusteem_ORM.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kohviautomaadi_haldussusteem_ORM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PromocodesController : BaseController
    {
        public PromocodesController(ApplicationDbContext db) : base(db) { }

        // GET: api/Promocodes - Получить все промокоды (для работников)
        [HttpGet]
        public async Task<IActionResult> GetPromocodes()
        {
            var promocodes = await _db.Promocodes
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
            return Ok(promocodes);
        }

        // POST: api/Promocodes/validate - Проверить промокод
        [HttpPost("validate")]
        public async Task<IActionResult> ValidatePromocode([FromBody] ValidatePromocodeRequest request)
        {
            var promocode = await _db.Promocodes
                .FirstOrDefaultAsync(p => p.Code == request.Code && p.IsActive);

            if (promocode == null)
            {
                return BadRequest(new { message = "Промокод не найден или неактивен" });
            }

            // Проверка срока действия
            var now = DateTime.Now;
            if (promocode.ValidFrom.HasValue && now < promocode.ValidFrom.Value)
            {
                return BadRequest(new { message = "Промокод еще не активен" });
            }

            if (promocode.ValidTo.HasValue && now > promocode.ValidTo.Value)
            {
                return BadRequest(new { message = "Срок действия промокода истек" });
            }

            // Проверка лимита использований
            if (promocode.MaxUsageCount.HasValue && promocode.UsageCount >= promocode.MaxUsageCount.Value)
            {
                return BadRequest(new { message = "Превышен лимит использований промокода" });
            }

            // Проверка минимальной суммы заказа
            if (promocode.MinOrderAmount.HasValue && request.OrderAmount < promocode.MinOrderAmount.Value)
            {
                return BadRequest(new { 
                    message = $"Минимальная сумма заказа для применения промокода: €{promocode.MinOrderAmount.Value:F2}" 
                });
            }

            // Вычисляем скидку
            decimal discountAmount = 0;
            if (promocode.DiscountPercent > 0)
            {
                discountAmount = request.OrderAmount * (promocode.DiscountPercent / 100);
            }
            else if (promocode.DiscountAmount > 0)
            {
                discountAmount = promocode.DiscountAmount;
            }

            // Скидка не может быть больше суммы заказа
            discountAmount = Math.Min(discountAmount, request.OrderAmount);

            return Ok(new
            {
                valid = true,
                code = promocode.Code,
                discountAmount = discountAmount,
                discountPercent = promocode.DiscountPercent,
                finalPrice = request.OrderAmount - discountAmount
            });
        }

        // POST: api/Promocodes - Создать новый промокод (для работников)
        [HttpPost]
        public async Task<IActionResult> CreatePromocode([FromBody] Promocode promocode)
        {
            // Проверяем уникальность кода
            var exists = await _db.Promocodes.AnyAsync(p => p.Code == promocode.Code);
            if (exists)
            {
                return BadRequest(new { message = "Промокод с таким кодом уже существует" });
            }

            promocode.CreatedAt = DateTime.Now;
            _db.Promocodes.Add(promocode);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPromocodes), new { id = promocode.Id }, promocode);
        }

        // PUT: api/Promocodes/{id} - Обновить промокод
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePromocode(int id, [FromBody] Promocode updatedPromocode)
        {
            var promocode = await _db.Promocodes.FindAsync(id);
            if (promocode == null)
            {
                return NotFound(new { message = "Промокод не найден" });
            }

            promocode.Code = updatedPromocode.Code;
            promocode.DiscountPercent = updatedPromocode.DiscountPercent;
            promocode.DiscountAmount = updatedPromocode.DiscountAmount;
            promocode.ValidFrom = updatedPromocode.ValidFrom;
            promocode.ValidTo = updatedPromocode.ValidTo;
            promocode.MaxUsageCount = updatedPromocode.MaxUsageCount;
            promocode.MinOrderAmount = updatedPromocode.MinOrderAmount;
            promocode.IsActive = updatedPromocode.IsActive;

            await _db.SaveChangesAsync();
            return Ok(promocode);
        }

        // DELETE: api/Promocodes/{id} - Удалить промокод
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePromocode(int id)
        {
            var promocode = await _db.Promocodes.FindAsync(id);
            if (promocode == null)
            {
                return NotFound(new { message = "Промокод не найден" });
            }

            _db.Promocodes.Remove(promocode);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/Promocodes/usage-stats - Статистика использования промокодов
        [HttpGet("usage-stats")]
        public async Task<IActionResult> GetUsageStats()
        {
            var stats = await _db.Promocodes
                .Select(p => new
                {
                    p.Id,
                    p.Code,
                    p.DiscountPercent,
                    p.DiscountAmount,
                    p.UsageCount,
                    p.MaxUsageCount,
                    p.IsActive,
                    TotalDiscountGiven = _db.PromocodeUsages
                        .Where(pu => pu.PromocodeId == p.Id)
                        .Sum(pu => pu.DiscountAmount)
                })
                .ToListAsync();

            return Ok(stats);
        }
    }

    public class ValidatePromocodeRequest
    {
        public string Code { get; set; } = string.Empty;
        public decimal OrderAmount { get; set; }
    }
}
