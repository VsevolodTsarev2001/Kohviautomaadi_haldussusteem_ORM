using Kohviautomaadi_haldussusteem_ORM.Data;
using Kohviautomaadi_haldussusteem_ORM.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kohviautomaadi_haldussusteem_ORM.Controllers
{
    public class OrdersController : BaseController
    {
        public OrdersController(ApplicationDbContext db) : base(db) { }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok(await _db.Orders
                .Include(x => x.User)
                .Include(x => x.Items)
                .ThenInclude(i => i.Drink)
                .ToListAsync());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Order order)
        {
            try
            {
                if (order.Items == null || !order.Items.Any())
                    return BadRequest("Пустой список товаров");

                order.CreatedAt = DateTime.Now;

                foreach (var item in order.Items)
                {
                    var drink = await _db.Drinks.FirstOrDefaultAsync(d => d.Id == item.DrinkId);
                    if (drink == null)
                        return BadRequest($"Напиток ID={item.DrinkId} не найден");

                    if (item.Quantity <= 0)
                        return BadRequest("Количество должно быть больше 0");

                    if (drink.Kogus < item.Quantity)
                        return BadRequest($"Недостаточно напитка «{drink.JoogiNimi}». Доступно: {drink.Kogus}");

                    drink.Kogus -= item.Quantity;
                }

                _db.Orders.Add(order);
                await _db.SaveChangesAsync();

                return Ok(order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Server error: " + ex.Message);
            }
        }
    }

}
