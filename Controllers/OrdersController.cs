using Kohviautomaadi_haldussusteem_ORM.Data;
using Kohviautomaadi_haldussusteem_ORM.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Kohviautomaadi_haldussusteem_ORM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Требуется авторизация для всех методов
    public class OrdersController : BaseController
    {
        public OrdersController(ApplicationDbContext db) : base(db) { }

        [HttpGet]
        [Authorize(Roles = "worker")] // Только worker может просматривать все заказы
        public async Task<IActionResult> Get(
            [FromQuery] int? userId = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] string? status = null)
        {
            var query = _db.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Drink)
                .Include(o => o.User)
                .AsQueryable();

            // Фильтр по пользователю
            if (userId.HasValue)
            {
                query = query.Where(o => o.UserId == userId.Value);
            }

            // Фильтр по дате начала
            if (fromDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt >= fromDate.Value);
            }

            // Фильтр по дате окончания
            if (toDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt <= toDate.Value);
            }

            // Фильтр по статусу
            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(o => o.Status == status);
            }

            var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
            return Ok(orders);
        }

        [HttpGet("my")]
        [Authorize] // Клиент может видеть только свои заказы
        public async Task<IActionResult> GetMyOrders()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Не удалось определить пользователя");
            }

            var orders = await _db.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Drink)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpPost]
        [Authorize] // Все авторизованные могут создавать заказы
        public async Task<IActionResult> Create([FromBody] Order order)
        {
            // Логирование для отладки
            Console.WriteLine($"Получен заказ от пользователя {order.UserId}");
            Console.WriteLine($"Количество элементов: {order.Items?.Count ?? 0}");
            
            if (order.Items != null)
            {
                foreach (var item in order.Items)
                {
                    Console.WriteLine($"Item: DrinkId={item.DrinkId}, Quantity={item.Quantity}");
                }
            }

            // Проверка пользователя
            var user = await _db.Users.FindAsync(order.UserId);
            if (user == null) return BadRequest("Пользователь не найден");

            order.CreatedAt = DateTime.Now;
            order.Status = "Принят"; // Устанавливаем начальный статус

            // Создаём новые OrderItem и уменьшаем количество напитков
            var newItems = new List<OrderItem>();
            decimal totalPrice = 0;
            
            foreach (var item in order.Items)
            {
                var drink = await _db.Drinks.FindAsync(item.DrinkId);
                if (drink == null) return BadRequest($"Напиток с ID {item.DrinkId} не найден");
                if (drink.Kogus < item.Quantity) return BadRequest($"Недостаточно напитка {drink.JoogiNimi}");

                drink.Kogus -= item.Quantity;
                drink.OrderCount += item.Quantity; // Увеличиваем счетчик популярности
                totalPrice += drink.Price * item.Quantity; // Рассчитываем общую стоимость

                newItems.Add(new OrderItem
                {
                    DrinkId = drink.Id,
                    Quantity = item.Quantity
                });
            }

            order.Items = newItems;
            order.TotalPrice = totalPrice; // Устанавливаем общую стоимость
            
            // Обработка промокода
            decimal discountAmount = 0;
            if (!string.IsNullOrWhiteSpace(order.PromocodeUsed))
            {
                var promocode = await _db.Promocodes
                    .FirstOrDefaultAsync(p => p.Code == order.PromocodeUsed && p.IsActive);
                    
                if (promocode != null)
                {
                    // Вычисляем скидку
                    if (promocode.DiscountPercent > 0)
                    {
                        discountAmount = totalPrice * (promocode.DiscountPercent / 100);
                    }
                    else if (promocode.DiscountAmount > 0)
                    {
                        discountAmount = promocode.DiscountAmount;
                    }
                    
                    discountAmount = Math.Min(discountAmount, totalPrice);
                    
                    // Увеличиваем счетчик использований
                    promocode.UsageCount++;
                }
            }
            
            order.DiscountAmount = discountAmount;
            order.FinalPrice = totalPrice - discountAmount;

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();
            
            // Записываем использование промокода
            if (discountAmount > 0 && !string.IsNullOrWhiteSpace(order.PromocodeUsed))
            {
                var promocode = await _db.Promocodes
                    .FirstOrDefaultAsync(p => p.Code == order.PromocodeUsed);
                    
                if (promocode != null)
                {
                    _db.PromocodeUsages.Add(new PromocodeUsage
                    {
                        PromocodeId = promocode.Id,
                        UserId = order.UserId,
                        OrderId = order.Id,
                        DiscountAmount = discountAmount,
                        UsedAt = DateTime.Now
                    });
                    await _db.SaveChangesAsync();
                }
            }

            return Ok(order);
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "worker")] // Только worker может менять статус заказов
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdate statusUpdate)
        {
            var order = await _db.Orders.FindAsync(id);
            if (order == null) return NotFound("Заказ не найден");

            order.Status = statusUpdate.Status;
            await _db.SaveChangesAsync();

            return Ok(order);
        }

        [HttpPost("{id}/repeat")]
        [Authorize] // Все авторизованные могут повторять заказы
        public async Task<IActionResult> RepeatOrder(int id)
        {
            var originalOrder = await _db.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Drink)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (originalOrder == null) return NotFound("Заказ не найден");

            // Создаем новый заказ на основе старого
            var newOrder = new Order
            {
                UserId = originalOrder.UserId,
                CreatedAt = DateTime.Now,
                Status = "Принят",
                Items = new List<OrderItem>()
            };

            decimal totalPrice = 0;

            foreach (var item in originalOrder.Items!)
            {
                var drink = await _db.Drinks.FindAsync(item.DrinkId);
                if (drink == null) continue;
                if (drink.Kogus < item.Quantity)
                {
                    return BadRequest($"Недостаточно напитка {drink.JoogiNimi}. В наличии: {drink.Kogus}, требуется: {item.Quantity}");
                }

                drink.Kogus -= item.Quantity;
                drink.OrderCount += item.Quantity;
                totalPrice += drink.Price * item.Quantity;

                newOrder.Items.Add(new OrderItem
                {
                    DrinkId = drink.Id,
                    Quantity = item.Quantity
                });
            }

            newOrder.TotalPrice = totalPrice;

            _db.Orders.Add(newOrder);
            await _db.SaveChangesAsync();

            return Ok(newOrder);
        }
    }

    public class StatusUpdate
    {
        public string Status { get; set; } = string.Empty;
    }
}
