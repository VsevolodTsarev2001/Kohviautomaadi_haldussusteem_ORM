using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text;

namespace Kohviautomaadi_haldussusteem_ORM.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public PaymentController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        [HttpGet("{sum}")]
        public async Task<IActionResult> MakePayment(string sum)
        {
            var paymentData = new
            {
                api_username = "e36eb40f5ec87fa2",
                account_name = "EUR3D1",
                amount = sum,
                order_reference = Math.Ceiling(new Random().NextDouble() * 999999),
                nonce = $"a9b7f7e7as{DateTime.Now}{new Random().NextDouble() * 999999}",
                timestamp = DateTime.Now,
                customer_url = "https://maksmine.web.app/makse"
            };

            var json = JsonSerializer.Serialize(paymentData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", "ZTM2ZWI0MGY1ZWM4N2ZhMjo3YjkxYTNiOWUxYjc0NTI0YzJlOWZjMjgyZjhhYzhjZA==");

            var response = await client.PostAsync("https://igw-demo.every-pay.com/api/v4/payments/oneoff", content);

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(responseContent);
                var paymentLink = jsonDoc.RootElement.GetProperty("payment_link");
                return Ok(paymentLink);
            }
            else
            {
                return BadRequest("Payment failed.");
            }
        }
    }
}