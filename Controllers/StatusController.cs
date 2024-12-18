using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SystemAdmin.Models;

namespace SystemAdmin.Controllers
{
    public class StatusController : Controller
    {       

        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly string _baseUrl = "";

        public StatusController(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
            _baseUrl = _config.GetValue<string>("Urls:BaseUrl") ?? "";
        }

        public async Task<IActionResult> Index()
        {
            var baseUrl = Environment.GetEnvironmentVariable("BASE_URL") ?? "";
            //var request = HttpContext.Request;
            //var baseUrl = $"{request.Scheme}://{request.Host}";
            ViewData["baseUrl"] = baseUrl;
            return View();
        }        
    }
}

