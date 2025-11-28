using Kohviautomaadi_haldussusteem_ORM.Controllers;
using Kohviautomaadi_haldussusteem_ORM.Data;
using Kohviautomaadi_haldussusteem_ORM.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

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
    public async Task<IActionResult> Create(Order order)
    {
        order.CreatedAt = DateTime.Now;

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        return Ok(order);
    }
}
