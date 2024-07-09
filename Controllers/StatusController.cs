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
            //var response = await _httpClient.GetStringAsync(Path.Combine(_baseUrl, "api/Statuses/GetStatuses"));
            //var statuses = JsonConvert.DeserializeObject<List<StatusModel>>(response);

            //ViewBag.Statuses = statuses;
            return View();
        }        
    }
}

