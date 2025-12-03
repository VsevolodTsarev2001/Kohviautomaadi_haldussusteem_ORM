using Kohviautomaadi_haldussusteem_ORM.Data;
using Kohviautomaadi_haldussusteem_ORM.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kohviautomaadi_haldussusteem_ORM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DrinksController : BaseController
    {
        public DrinksController(ApplicationDbContext db) : base(db) { }

        [HttpGet]
        public async Task<IActionResult> GetDrinks()
        {
            var drinks = await _db.Drinks.Include(d => d.Category).ToListAsync();
            return Ok(drinks);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDrink(Drink drink)
        {
            _db.Drinks.Add(drink);
            await _db.SaveChangesAsync();
            return Ok(drink);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDrink(int id, Drink model)
        {
            var drink = await _db.Drinks.FindAsync(id);
            if (drink == null) return NotFound();

            drink.JoogiNimi = model.JoogiNimi;
            drink.Kogus = model.Kogus;
            drink.TopsiTüüp = model.TopsiTüüp;
            drink.MaksimisViis = model.MaksimisViis;
            drink.CategoryId = model.CategoryId;

            await _db.SaveChangesAsync();
            return Ok(drink);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDrink(int id)
        {
            var drink = await _db.Drinks.FindAsync(id);
            if (drink == null) return NotFound();

            if (drink.Kogus > 0)
                return BadRequest("Drink kogus must be 0 before deleting.");

            _db.Drinks.Remove(drink);
            await _db.SaveChangesAsync();
            return Ok();
        }
    }
}
