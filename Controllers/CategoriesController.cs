using Kohviautomaadi_haldussusteem_ORM.Data;
using Kohviautomaadi_haldussusteem_ORM.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kohviautomaadi_haldussusteem_ORM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Требуется авторизация
    public class CategoriesController : BaseController
    {
        public CategoriesController(ApplicationDbContext db) : base(db) { }

        [HttpGet]
        [AllowAnonymous] // Все могут просматривать категории
        public async Task<IActionResult> Get()
        {
            return Ok(await _db.Categories.ToListAsync());
        }

        [HttpPost]
        [Authorize(Roles = "worker")] // Только worker может создавать категории
        public async Task<IActionResult> Create(Category category)
        {
            _db.Categories.Add(category);
            await _db.SaveChangesAsync();
            return Ok(category);
        }
    }

}
