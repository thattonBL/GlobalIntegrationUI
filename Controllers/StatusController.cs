using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SystemAdmin.Context;
using SystemAdmin.Models;
using System.Linq.Dynamic.Core;
using Microsoft.Extensions.Primitives;
using System.Linq;

namespace SystemAdmin.Controllers
{
    public class StatusController : Controller
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly string _baseUrl;
        private readonly AppDbContext _context;

        public StatusController(HttpClient httpClient, IConfiguration config, AppDbContext context)
        {
            _httpClient = httpClient;
            _config = config;
            _baseUrl = _config.GetValue<string>("Urls:BaseUrl") ?? "";
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            //var baseUrl = Environment.GetEnvironmentVariable("BASE_URL") ?? "";
            ViewData["baseUrl"] = _baseUrl;
            var events = _context.IntegrationEventLogs?.ToList();
            return View(events);
        }

        [HttpPost]
        public async Task<IActionResult> GetData()
        {
            try
            {
                int pageSize = 0;
                var request = Request.Form;
                var draw = Request.Form["draw"].FirstOrDefault();
                var start = Request.Form["start"].FirstOrDefault();
                var length = Request.Form["length"].FirstOrDefault();
                var sortColumnIndex = Request.Form["order[0][column]"].FirstOrDefault();
                var sortColumn = !string.IsNullOrEmpty(sortColumnIndex)
                    ? Request.Form["columns[" + sortColumnIndex + "][name]"].FirstOrDefault()
                    : "CreationTime"; // Default sort column if none is provided
                var sortColumnDir = Request.Form["order[0][dir]"].FirstOrDefault() ?? "asc";
                var searchValue = Request.Form["search[value]"].FirstOrDefault();

                // Date range filtering parameters
                var startDateStr = request["startDate"].FirstOrDefault();
                var endDateStr = request["endDate"].FirstOrDefault();
                DateTime? startDate = string.IsNullOrEmpty(startDateStr) ? (DateTime?)null : DateTime.Parse(startDateStr);
                DateTime? endDate = string.IsNullOrEmpty(endDateStr) ? (DateTime?)null : DateTime.Parse(endDateStr);

                pageSize = length != null ? int.Parse(length) : 0;
                int skip = start != null ? int.Parse(start) : 0;
                //var data = (from items in _context.RsiPostItems select items);
                var query = _context.IntegrationEventLogs?.AsQueryable();

                // Apply date range filter
                if (startDate.HasValue && endDate.HasValue)
                {
                    if (startDate.Value.Date == endDate.Value.Date)
                    {
                        // Filter for a specific date
                        query = query.Where(e => e.CreationTime.Date == startDate.Value.Date);
                    }
                    else
                    {
                        // Filter for a range of dates
                        query = query.Where(e => e.CreationTime.Date >= startDate.Value.Date && e.CreationTime.Date <= endDate.Value.Date);
                    }
                }

                // Client-side deserialization
                var data = query
                    .AsEnumerable() // Bring the data into memory
                    .Select(e =>
                    {
                        var content = JsonConvert.DeserializeObject<IntegrationEventContent>(e.Content);

                        return new
                        {
                            e.EventId,
                            e.CreationTime,
                            Identifier = content?.RsiMessage?.Identifier,
                            CollectionCode = content?.RsiMessage?.CollectionCode,
                            Author = content?.RsiMessage?.Author,
                            EventName = e.EventTypeName,
                            CreationDate = e.CreationTime,
                            TransactionId = e.TransactionId,
                            Title = content?.RsiMessage?.Title,
                            FullContent = e.Content
                        };
                    });

                // Group events by Identifier
                var groupedData = data
                    .Where(e => e.Identifier != null)
                    .GroupBy(e => e.Identifier)
                    .Select(group =>
                    {
                        // Apply precedence logic
                        var events = group.ToList();
                        var parentEvent = events
                            .OrderBy(e =>
                                e.EventName.Contains("NewRsiMessagePublishedIntegrationEvent") ? 1 :
                                e.EventName.Contains("NewRsiMessageReceivedIntegrationEvent") ? 2 :
                                3) // Published > Received > Submitted
                            .First();

                        var childEvents = events
                            .Where(e => e.EventId != parentEvent.EventId)
                            .OrderBy(e =>
                                e.EventName.Contains("NewRsiMessageReceivedIntegrationEvent") ? 1 :
                                2) // Received > Submitted
                            .ToList();

                        return new
                        {
                            Identifier = group.Key,
                            ParentEvent = parentEvent,
                            RelatedEvents = childEvents
                        };
                    })
                    .ToList();

                // Apply search filter
                if (!string.IsNullOrEmpty(searchValue))
                {
                    groupedData = groupedData
                        .Where(e =>
                            (e.Identifier != null && e.Identifier.Contains(searchValue, StringComparison.OrdinalIgnoreCase)) ||
                            (e.ParentEvent.CollectionCode != null && e.ParentEvent.CollectionCode.Contains(searchValue, StringComparison.OrdinalIgnoreCase)) ||
                            (e.ParentEvent.Author != null && e.ParentEvent.Author.Contains(searchValue, StringComparison.OrdinalIgnoreCase)) ||
                            (e.ParentEvent.Title != null && e.ParentEvent.Title.Contains(searchValue, StringComparison.OrdinalIgnoreCase)) ||
                            (e.ParentEvent.EventName != null && e.ParentEvent.EventName.Contains(searchValue, StringComparison.OrdinalIgnoreCase)))
                        .ToList();
                }

                int totalRecords = groupedData.Count();
                var pagedData = groupedData.Skip(skip).Take(pageSize).ToList();
                if (string.IsNullOrEmpty(sortColumn) || !pagedData.Any())
                {
                    sortColumn = "CreationTime"; // Default column
                }

                // Sorting and pagination
                if (!string.IsNullOrEmpty(sortColumn) && !string.IsNullOrEmpty(sortColumnDir))
                {
                    if (sortColumnDir.Equals("asc", StringComparison.OrdinalIgnoreCase))
                    {
                        pagedData = pagedData
                            .OrderBy(e => GetPropertyValue(e.ParentEvent, sortColumn))
                            .ToList();
                    }
                    else if (sortColumnDir.Equals("desc", StringComparison.OrdinalIgnoreCase))
                    {
                        pagedData = pagedData
                            .OrderByDescending(e => GetPropertyValue(e.ParentEvent, sortColumn))
                            .ToList();
                    }
                }

                // Prepare response
                var jsonData = new
                {
                    draw = draw,
                    recordsFiltered = totalRecords,
                    recordsTotal = totalRecords,
                    data = pagedData
                };

                return new JsonResult(jsonData);
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost]
        public IActionResult DeleteEvent(string eventId)
        {
            Guid guidValue;
            if (!Guid.TryParse(eventId, out guidValue))
            {
                return Json(new { success = false, message = "Invalid EventId." });
            }

            try
            {
                // Find the parent event by EventId
                var parentEvent = _context.IntegrationEventLogs?.FirstOrDefault(e => e.EventId == guidValue);
                if (parentEvent == null)
                {
                    return Json(new { success = false, message = "Parent event not found." });
                }

                // Deserialize the parent event's content to find the Identifier
                var content = JsonConvert.DeserializeObject<IntegrationEventContent>(parentEvent.Content);
                var identifier = content?.RsiMessage?.Identifier;

                if (string.IsNullOrEmpty(identifier))
                {
                    return Json(new { success = false, message = "Identifier not found for the parent event." });
                }

                var eventsToDelete = _context.IntegrationEventLogs?.Where(e => e.Content.Contains($"\"Identifier\": \"{identifier}\"")).ToList();

                if (eventsToDelete == null || !eventsToDelete.Any())
                {
                    return Json(new { success = false, message = "No related events found for the given identifier." });
                }

                // Remove all events with the same Identifier
                _context.IntegrationEventLogs?.RemoveRange(eventsToDelete);
                _context.SaveChanges();

                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                // Log the exception and return an error message
                return Json(new { success = false, message = ex.Message });
            }
        }

        object? GetPropertyValue(object obj, string propertyName)
        {
            return obj?.GetType()?.GetProperty(propertyName)?.GetValue(obj, null);
        }
    }
}