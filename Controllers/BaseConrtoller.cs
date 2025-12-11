using Kohviautomaadi_haldussusteem_ORM.Data;
using Microsoft.AspNetCore.Mvc;

namespace Kohviautomaadi_haldussusteem_ORM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BaseController : ControllerBase
    {
        protected readonly ApplicationDbContext _db;

        public BaseController(ApplicationDbContext db)
        {
            _db = db;
        }
    }

}
