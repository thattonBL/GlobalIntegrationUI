// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

function initiateSignalRConnection(baseUrl) {
    const connection = new signalR.HubConnectionBuilder().withUrl(baseUrl + "/statusHub").build();

    //fetchInitialData(baseUrl);

    //// Initial accordion load
    ////const initialStatuses = @Html.Raw(JsonConvert.SerializeObject(Model);
    //const initialAccordionContent = constructAccordionContent(initialStatuses);
    //initializeAccordion(initialAccordionContent);

    // Start the SignalR connection and feedback any errors
    connection.start().then(() => {
        console.log("Connected to SignalR hub");
    }).catch(err => console.error(err.toString()));

    // Subscribe to the SignalR events after the connection is established
    connection.on("SendStatusUpdate", (identifier, jsonAuditString) => {
        console.log("SendStatusUpdate event received identifier:" + identifier + " json: " + jsonAuditString);
        var jsonObject = JSON.parse(jsonAuditString);
        createAccordion(identifier, jsonObject);
        //console.log(jsonObject);
        //updateAccordion(baseUrl);
    });

    //connection.on("StoppedNamedConsumer", (data) => {
    //    console.log("StoppedNamedConsumer event received:", data);
    //    //const identifier = data.consumerId;
    //    //// alert("Stop event received for consumer: " + identifier);                        
    //    //const eventNameCell = $(`td:nth-child(2)`);
    //    //eventNameCell.css({ "background-color": "red" });
    //});

    //connection.on("RestartedNamedConsumer", (data) => {
    //    console.log("RestartedNamedConsumer event received:", data);
    //    //const identifier = data.ConsumerId;
    //    //// alert("Restart event received for consumer: " + identifier);
    //    //const eventNameCell = $(`td:nth-child(2)`);
    //    //eventNameCell.css({ "background-color": "white" });
    //});
}

//function fetchInitialData(configUrl) {
//    var requestUrl = configUrl + '/api/Statuses/GetStatuses';
//    console.log('fetchInitialData requestUrl is: ' + requestUrl);
//    return $.ajax({
//        url: requestUrl,
//        method: 'GET',
//        dataType: 'json'
//    });
//}


function createAccordionContent(data) {
    var content = '<div class="accordion-content">';
    for (var key in data) {
        if (key !== "EventName" && key !== "AppName" && key !== "Identifier") {
            content += '<p><strong>' + key + ':</strong> ' + data[key] + '</p>';
        }
    }
    content += '</div>';
    return content;
}

function createNestedAccordion(id, item) {   
    var accordionHtml = '';
    var header = item.EventName + ' - ' + item.AppName + ' - ' + item.Identifier;
    var content = createAccordionContent(item);
    accordionHtml += '<h3>' + header + '</h3><div>' + content + '</div>';
    return accordionHtml;
}

function createAccordion(id, jsonData) {
    var accordionHtml = '<div id="accordion' + id + '">';

    var item = jsonData.shift();
    var header = item.EventName + ' - ' + item.AppName + ' - ' + item.Identifier;
    var content = createAccordionContent(item);

    var nestedAccordionHtml = '';
    jsonData.forEach(function (item, index) {
        nestedAccordionHtml += '<div id="nestedAccordion' + id + '-' + index + '">';
        var nestedAccordion = createNestedAccordion(id + '-' + index, item);
        nestedAccordionHtml += nestedAccordion;
        nestedAccordionHtml += '</div>';
    });
    
    accordionHtml += '<h3>' + header + '</h3><div>' + content + nestedAccordionHtml + '</div>';;
    accordionHtml += '</div>';

    var collapsed = false;
    var existingElement = $("#accordions").find('#accordion' + id);
    if (existingElement.length != 0) {
        collapsed = existingElement.accordion("option", "active");
        existingElement.replaceWith(accordionHtml);
    } else {
        $('#accordions').prepend(accordionHtml);
    }

    $('#accordion' + id).accordion({
        collapsible: true,
        heightStyle: "content",
        active: collapsed
    });

    // Initialize the nested accordions
    jsonData.forEach(function (item, index) {
        $('#nestedAccordion' + id + '-' + index).accordion({
            collapsible: true,
            heightStyle: "content",
            active: false
        });
    });
}