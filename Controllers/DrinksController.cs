using Kohviautomaadi_haldussusteem_ORM.Data;
using Kohviautomaadi_haldussusteem_ORM.Models;
using Microsoft.AspNetCore.Mvc;

namespace Kohviautomaadi_haldussusteem_ORM.Controllers
{
    public class DrinksController : BaseController
    {
        public DrinksController(ApplicationDbContext db) : base(db) { }

        [HttpPost]
        public async Task<IActionResult> Create(Drink model)
        {
            _db.Drinks.Add(model);
            await _db.SaveChangesAsync();
            return Ok(model);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Drink m)
        {
            var d = await _db.Drinks.FindAsync(id);
            if (d == null) return NotFound();

            d.JoogiNimi = m.JoogiNimi;
            d.Kogus = m.Kogus;
            d.TopsiTüüp = m.TopsiTüüp;
            d.MaksimisViis = m.MaksimisViis;

            await _db.SaveChangesAsync();
            return Ok(d);
        }
    }

}
