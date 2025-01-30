﻿using Microsoft.AspNetCore.Mvc;
using System.Linq.Dynamic.Core;
using SystemAdmin.Helper;

namespace SystemAdmin.Controllers
{
    public class StatusController : Controller
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly string _baseUrl;
        private readonly StatusHubClient _statusHubClient;

        public StatusController(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
            _baseUrl = _config.GetValue<string>("Urls:BaseUrl") ?? "";
            string hubUrl = $"{_baseUrl}/statushub";
            _statusHubClient = new StatusHubClient(hubUrl);
        }

        public IActionResult Index()
        {
            var baseUrl = Environment.GetEnvironmentVariable("BASE_URL") ?? "";
            ViewData["baseUrl"] = _baseUrl;
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> GetData()
        {
            try
            {
                // Get parameters from request
                var request = Request.Form;
                var draw = request["draw"].FirstOrDefault();
                var start = int.Parse(request["start"].FirstOrDefault() ?? "0");
                var length = int.Parse(request["length"].FirstOrDefault() ?? "10");
                var searchValue = request["search[value]"].FirstOrDefault();
                var startDateStr = request["startDate"].FirstOrDefault();
                var endDateStr = request["endDate"].FirstOrDefault();

                // Sorting parameters
                var sortColumnIndex = int.Parse(request["order[0][column]"].FirstOrDefault() ?? "0");
                var sortColumnName = request[$"columns[{sortColumnIndex}][data]"].FirstOrDefault() ?? "ParentEvent.CreationTime";
                var sortDirection = request["order[0][dir]"].FirstOrDefault() ?? "asc";

                // Calculate page number for the API (DataTables uses start/length)
                var pageNumber = (start / length) + 1;
                // Construct the API URL with query parameters
                var queryParams = new List<string>
                {
                    $"pageSize={length}",
                    $"pageNumber={pageNumber}",
                    $"sortColumn={Uri.EscapeDataString(sortColumnName)}",
                    $"sortDirection={Uri.EscapeDataString(sortDirection)}"
                };
                if (!string.IsNullOrEmpty(searchValue))
                    queryParams.Add($"searchTerm={Uri.EscapeDataString(searchValue)}");

                if (!string.IsNullOrEmpty(startDateStr))
                    queryParams.Add($"startDate={Uri.EscapeDataString(startDateStr)}");

                if (!string.IsNullOrEmpty(endDateStr))
                    queryParams.Add($"endDate={Uri.EscapeDataString(endDateStr)}");

                var apiResponse = await _statusHubClient.GetIntegrationEventContentAsync();

                // Apply search functionality (case-insensitive)
                if (!string.IsNullOrEmpty(searchValue))
                {
                    apiResponse.Data = apiResponse.Data
                        .Where(item =>
                            (item.Identifier?.Contains(searchValue, StringComparison.OrdinalIgnoreCase) ?? false) ||
                            (item.ParentEvent?.Title?.Contains(searchValue, StringComparison.OrdinalIgnoreCase) ?? false) ||
                            (item.ParentEvent?.Author?.Contains(searchValue, StringComparison.OrdinalIgnoreCase) ?? false) ||
                            (item.ParentEvent?.CollectionCode?.Contains(searchValue, StringComparison.OrdinalIgnoreCase) ?? false) ||
                            (item.ParentEvent?.CreationTime.Contains(searchValue, StringComparison.OrdinalIgnoreCase) ?? false))
                        .ToList();
                }

                // Apply date filters
                if (DateTime.TryParse(startDateStr, out DateTime startDateTime) &&
                    DateTime.TryParse(endDateStr, out DateTime endDateTime))
                {
                    apiResponse.Data = apiResponse.Data.Where(e =>
                    {
                        if (DateTime.TryParse(e.ParentEvent.CreationTime, out DateTime creationTime))
                        {
                            return creationTime.Date >= startDateTime.Date && creationTime.Date <= endDateTime.Date;
                        }
                        return false; // Exclude entries where CreationTime is not a valid date
                    }).ToList();
                }

                // Format the response for DataTables
                var groupedData = apiResponse?.Data
                    .GroupBy(item => item.Identifier) // Grouping by Identifier
                    .Select(group =>
                    {
                        var parentEvent = group.FirstOrDefault()?.ParentEvent; // Get the ParentEvent
                        var relatedEvents = group.Skip(1).Select(item => new
                        {
                            item.Identifier,
                            ParentEvent = item.ParentEvent // These are the related events
                        }).ToList();

                        return new
                        {
                            Identifier = group.Key,
                            ParentEvent = parentEvent,
                            RelatedEvents = relatedEvents
                        };
                    }).ToList();

                // Apply sorting to the grouped data
                groupedData = (sortDirection == "asc"
                    ? groupedData.OrderBy(item => GetPropertyValue(item, sortColumnName))
                    : groupedData.OrderByDescending(item => GetPropertyValue(item, sortColumnName)))
                    .ToList();

                // Apply pagination
                var paginatedData = groupedData.Skip(start).Take(length).ToList();

                // Format the response for DataTables
                var jsonData = new
                {
                    draw = draw ?? "0",
                    recordsFiltered = apiResponse?.TotalRecords ?? 0,
                    recordsTotal = apiResponse?.TotalRecords ?? 0,
                    data = paginatedData
                };

                return new JsonResult(jsonData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = ex.Message
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> DeleteEvent(Guid eventId)
        {
            try
            {
                // Make the HTTP DELETE request to the API
                var response = await _statusHubClient.DeleteEventAsync(eventId);

                // Check if the response is successful
                if (!response)
                {
                    //var errorMessage = await response.Content.ReadAsStringAsync();
                    return Json(new { success = false, message = "Invalid data" });
                }

                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                // Log the exception and return an error message
                return Json(new { success = false, message = ex.Message });
            }
        }

        private static object GetPropertyValue(object obj, string propertyName)
        {
            if (obj == null || string.IsNullOrEmpty(propertyName))
                return null;

            // Split the property path by '.'
            var propertyNames = propertyName.Split('.');

            foreach (var name in propertyNames)
            {
                if (obj == null) return null;

                // Get all properties of the object
                var property = obj.GetType()
                                  .GetProperties()
                                  .FirstOrDefault(p => string.Equals(p.Name, name, StringComparison.OrdinalIgnoreCase));

                if (property == null) return null;

                // Get the value of the property
                obj = property.GetValue(obj, null);
            }

            return obj;
        }
    }
}