using Kohviautomaadi_haldussusteem_ORM.Models;
using Kohviautomaadi_haldussusteem_ORM.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace Kohviautomaadi_haldussusteem_ORM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : BaseController
    {
        private readonly IConfiguration _config;
        private readonly PasswordHasher<User> _passwordHasher;

        public AuthController(ApplicationDbContext db, IConfiguration config) : base(db)
        {
            _config = config;
            _passwordHasher = new PasswordHasher<User>();
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var role = await _db.Roles.FindAsync(request.RoleId);
            if (role == null)
                return BadRequest("Указанная роль не существует.");

            var user = new User
            {
                Nimi = request.Nimi,
                Email = request.Email,
                RoleId = request.RoleId
            };

            user.Password = _passwordHasher.HashPassword(user, request.Password);

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Регистрация успешна" });
        }



        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _db.Users
                .Include(u => u.Role)
                .FirstOrDefault(x => x.Email == request.Email);
            if (user == null) return Unauthorized("Пользователь не найден");

            var result = _passwordHasher.VerifyHashedPassword(user, user.Password, request.Password);
            if (result == PasswordVerificationResult.Failed)
                return Unauthorized("Неверный пароль");

            var key = Encoding.ASCII.GetBytes(_config["JwtKey"]);
            var tokenHandler = new JwtSecurityTokenHandler();

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role?.Name ?? "client")
                }),
                Expires = DateTime.UtcNow.AddHours(4),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return Ok(new
            {
                token = tokenHandler.WriteToken(token),
                userId = user.Id,
                role = user.Role?.Name ?? "client"
            });
        }
    }
}
