using Kohviautomaadi_haldussusteem_ORM.Data;
using Kohviautomaadi_haldussusteem_ORM.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kohviautomaadi_haldussusteem_ORM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Требуется авторизация для всех методов
    public class DrinksController : BaseController
    {
        public DrinksController(ApplicationDbContext db) : base(db) { }

        [HttpGet]
        [AllowAnonymous] // Все могут просматривать напитки
        public async Task<IActionResult> GetDrinks(
            [FromQuery] string? search = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] bool? inStock = null)
        {
            var query = _db.Drinks.Include(d => d.Category).AsQueryable();

            // Поиск по названию
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(d => d.JoogiNimi.Contains(search));
            }

            // Фильтрация по категории
            if (categoryId.HasValue)
            {
                query = query.Where(d => d.CategoryId == categoryId.Value);
            }

            // Фильтрация только товаров в наличии
            if (inStock.HasValue && inStock.Value)
            {
                query = query.Where(d => d.Kogus > 0);
            }

            // Сортировка
            query = sortBy?.ToLower() switch
            {
                "name" => query.OrderBy(d => d.JoogiNimi),
                "name_desc" => query.OrderByDescending(d => d.JoogiNimi),
                "price" => query.OrderBy(d => d.Price),
                "price_desc" => query.OrderByDescending(d => d.Price),
                "stock" => query.OrderBy(d => d.Kogus),
                "stock_desc" => query.OrderByDescending(d => d.Kogus),
                "popularity" => query.OrderByDescending(d => d.OrderCount), // Самые популярные
                "popularity_asc" => query.OrderBy(d => d.OrderCount),
                _ => query.OrderBy(d => d.Id) // По умолчанию по ID
            };

            var drinks = await query.ToListAsync();
            return Ok(drinks);
        }

        [HttpPost]
        [Authorize(Roles = "worker")] // Только worker может создавать напитки
        public async Task<IActionResult> CreateDrink(CreateDrinkDto dto)
        {
            // Создаём Drink из DTO - без навигационных свойств
            var drink = new Drink
            {
                JoogiNimi = dto.JoogiNimi,
                Kogus = dto.Kogus,
                TopsiTüüp = dto.TopsiTüüp,
                MaksimisViis = dto.MaksimisViis,
                Price = dto.Price,
                CategoryId = dto.CategoryId,
                OrderCount = 0 // Явно устанавливаем начальное значение
            };
            
            _db.Drinks.Add(drink);
            await _db.SaveChangesAsync();
            
            // Загружаем Category для корректного ответа
            await _db.Entry(drink).Reference(d => d.Category).LoadAsync();
            
            return Ok(drink);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "worker")] // Только worker может обновлять напитки
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
        [Authorize(Roles = "worker")] // Только worker может удалять напитки
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
