using Kohviautomaadi_haldussusteem_ORM.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kohviautomaadi_haldussusteem_ORM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : BaseController
    {
        public StatisticsController(ApplicationDbContext db) : base(db) { }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var from = fromDate ?? DateTime.Now.AddDays(-30);
            var to = toDate ?? DateTime.Now;

            // Общее количество заказов
            var totalOrders = await _db.Orders
                .Where(o => o.CreatedAt >= from && o.CreatedAt <= to)
                .CountAsync();

            // Общая выручка
            var totalRevenue = await _db.Orders
                .Where(o => o.CreatedAt >= from && o.CreatedAt <= to)
                .SumAsync(o => o.TotalPrice);

            // Средний чек
            var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Самые популярные напитки
            var popularDrinks = await _db.Drinks
                .OrderByDescending(d => d.OrderCount)
                .Take(5)
                .Select(d => new
                {
                    d.Id,
                    d.JoogiNimi,
                    d.OrderCount,
                    d.Price,
                    Revenue = d.OrderCount * d.Price
                })
                .ToListAsync();

            // Продажи по дням (последние 7 дней)
            var salesByDay = await _db.Orders
                .Where(o => o.CreatedAt >= DateTime.Now.AddDays(-7))
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    OrderCount = g.Count(),
                    Revenue = g.Sum(o => o.TotalPrice)
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            // Статистика по статусам
            var ordersByStatus = await _db.Orders
                .Where(o => o.CreatedAt >= from && o.CreatedAt <= to)
                .GroupBy(o => o.Status)
                .Select(g => new
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            // Топ клиенты
            var topCustomers = await _db.Orders
                .Where(o => o.CreatedAt >= from && o.CreatedAt <= to)
                .GroupBy(o => o.User)
                .Select(g => new
                {
                    UserId = g.Key!.Id,
                    UserName = g.Key.Nimi,
                    UserEmail = g.Key.Email,
                    OrderCount = g.Count(),
                    TotalSpent = g.Sum(o => o.TotalPrice)
                })
                .OrderByDescending(x => x.TotalSpent)
                .Take(5)
                .ToListAsync();

            return Ok(new
            {
                period = new { from, to },
                summary = new
                {
                    totalOrders,
                    totalRevenue,
                    averageOrderValue
                },
                popularDrinks,
                salesByDay,
                ordersByStatus,
                topCustomers
            });
        }

        [HttpGet("drinks-stats")]
        public async Task<IActionResult> GetDrinksStatistics()
        {
            var stats = await _db.Drinks
                .Include(d => d.Category)
                .Select(d => new
                {
                    d.Id,
                    d.JoogiNimi,
                    CategoryName = d.Category.Nimi,
                    d.Price,
                    d.Kogus,
                    d.OrderCount,
                    Revenue = d.OrderCount * d.Price,
                    StockValue = d.Kogus * d.Price
                })
                .OrderByDescending(d => d.OrderCount)
                .ToListAsync();

            return Ok(stats);
        }

        [HttpGet("sales-by-period")]
        public async Task<IActionResult> GetSalesByPeriod(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] string groupBy = "day") // day, week, month
        {
            var orders = await _db.Orders
                .Where(o => o.CreatedAt >= fromDate && o.CreatedAt <= toDate)
                .ToListAsync();

            IEnumerable<object> groupedData = groupBy.ToLower() switch
            {
                "week" => orders
                    .GroupBy(o => GetWeekNumber(o.CreatedAt))
                    .Select(g => new
                    {
                        Period = $"Week {g.Key}",
                        OrderCount = g.Count(),
                        Revenue = g.Sum(o => o.TotalPrice)
                    }),
                "month" => orders
                    .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
                    .Select(g => new
                    {
                        Period = $"{g.Key.Year}-{g.Key.Month:D2}",
                        OrderCount = g.Count(),
                        Revenue = g.Sum(o => o.TotalPrice)
                    }),
                _ => orders // day
                    .GroupBy(o => o.CreatedAt.Date)
                    .Select(g => new
                    {
                        Period = g.Key.ToString("yyyy-MM-dd"),
                        OrderCount = g.Count(),
                        Revenue = g.Sum(o => o.TotalPrice)
                    })
            };

            return Ok(groupedData);
        }

        [HttpGet("category-stats")]
        public async Task<IActionResult> GetCategoryStatistics()
        {
            var stats = await _db.Categories
                .Select(c => new
                {
                    c.Id,
                    c.Nimi,
                    DrinkCount = c.Drinks.Count,
                    TotalOrders = c.Drinks.Sum(d => d.OrderCount),
                    TotalRevenue = c.Drinks.Sum(d => d.OrderCount * d.Price),
                    InStock = c.Drinks.Sum(d => d.Kogus)
                })
                .ToListAsync();

            return Ok(stats);
        }

        private static int GetWeekNumber(DateTime date)
        {
            var jan1 = new DateTime(date.Year, 1, 1);
            var daysOffset = (int)System.Globalization.CultureInfo.CurrentCulture.DateTimeFormat.FirstDayOfWeek - (int)jan1.DayOfWeek;
            var firstWeekDay = jan1.AddDays(daysOffset);
            var currentCulture = System.Globalization.CultureInfo.CurrentCulture;
            var weekNumber = currentCulture.Calendar.GetWeekOfYear(date, System.Globalization.CalendarWeekRule.FirstFourDayWeek, System.DayOfWeek.Monday);
            return weekNumber;
        }
    }
}
