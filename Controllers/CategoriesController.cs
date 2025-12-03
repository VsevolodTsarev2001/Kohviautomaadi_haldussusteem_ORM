using Kohviautomaadi_haldussusteem_ORM.Data;
using Kohviautomaadi_haldussusteem_ORM.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kohviautomaadi_haldussusteem_ORM.Controllers
{
    public class CategoriesController : BaseController
    {
        public CategoriesController(ApplicationDbContext db) : base(db) { }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok(await _db.Categories.ToListAsync());
        }

        [HttpPost]
        public async Task<IActionResult> Create(Category category)
        {
            _db.Categories.Add(category);
            await _db.SaveChangesAsync();
            return Ok(category);
        }
    }

}
