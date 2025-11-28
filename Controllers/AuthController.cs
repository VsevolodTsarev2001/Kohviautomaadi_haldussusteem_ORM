using Kohviautomaadi_haldussusteem_ORM.Data;
using Kohviautomaadi_haldussusteem_ORM.Models;
using Microsoft.AspNetCore.Mvc;

namespace Kohviautomaadi_haldussusteem_ORM.Controllers
{
    [Route("api/[controller]")]
    public class AuthController : BaseController
    {
        public AuthController(ApplicationDbContext db) : base(db) { }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            // TODO: hash password!!!
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return Ok(user);
        }

        [HttpPost("login")]
        public IActionResult Login(string email, string password)
        {
            var user = _db.Users.FirstOrDefault(x => x.Email == email && x.Password == password);
            if (user == null)
                return Unauthorized();

            return Ok(user);
        }
    }

}
