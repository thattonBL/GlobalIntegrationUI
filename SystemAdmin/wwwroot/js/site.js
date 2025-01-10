// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// For testing/styling UI outside of system uncmment below lines
// var fakeJsonDataArray = new Array([{ "EventName": "RsiMessagePublished.IntegrationEvent", "AppName": "", "Identifier": "FRIEND01", "CollectionCode": "", "CreationDate": "07/05/2024 16:20:03", "EventId": "a88fdfee-1b41-442a-92fb-d168cbf986b2", "TransactionId": "be1bb2ab-4416-4e28-bfa8-fac0d027413c" }, { "EventName": "NewRsiMessageRecieved.IntegrationEvent", "AppName": "GatewayGrpcService", "Identifier": "FRIEND01", "CollectionCode": "", "CreationDate": "07/05/2024 16:20:00", "EventId": "9e4bd9de-1c79-46c6-8103-8c22fbae9a53", "TransactionId": "7e17e78d-acfd-4d99-80ff-fc51fe03996c" }, { "EventName": "NewRsiMessageSubmitted.IntegrationEvent", "AppName": "", "Identifier": "FRIEND01", "CollectionCode": "TST", "CreationDate": "07/05/2024 16:19:57", "EventId": "2ec4e090-fff9-4528-b477-de5a3e75d40b", "TransactionId": "dc17cc1d-8e13-46fa-a924-39ce8265346c" }], [{ "EventName": "NewRsiMessageSubmitted.IntegrationEvent", "AppName": "", "Identifier": "FRIEND02", "CollectionCode": "", "CreationDate": "07/05/2024 16:20:21", "EventId": "d5213c26-4bb1-44c3-b43b-ab957f340d72", "TransactionId": "37995576-8fca-44c9-8700-2fac2853424d" }, { "EventName": "NewRsiMessageRecieved.IntegrationEvent", "AppName": "GatewayGrpcService", "Identifier": "FRIEND02", "CollectionCode": "", "CreationDate": "07/05/2024 16:20:21", "EventId": "e0fde2fb-1a26-4092-a04f-93ea9d25bda5", "TransactionId": "65c15343-31f8-4faf-95a7-394492864c1a" }, { "EventName": "NewRsiMessageSubmitted.IntegrationEvent", "AppName": "", "Identifier": "FRIEND02", "CollectionCode": "TST", "CreationDate": "07/05/2024 16:20:20", "EventId": "fa12f70e-5ee6-4a33-a0ce-d54687218acd", "TransactionId": "15890cb5-f140-4ab0-b548-0156c8eafe5f" }], [{ "EventName": "NewRsiMessageRecieved.IntegrationEvent", "AppName": "", "Identifier": "FRIEND03", "CollectionCode": "", "CreationDate": "07/05/2024 16:20:30", "EventId": "4966fc82-a158-43d9-b345-d05b8f715ef8", "TransactionId": "5c538fa5-6674-4b4a-8c1b-5f9bb5af8d39" }, { "EventName": "NewRsiMessageRecieved.IntegrationEvent", "AppName": "GatewayGrpcService", "Identifier": "FRIEND03", "CollectionCode": "", "CreationDate": "07/05/2024 16:20:30", "EventId": "1d7d8d57-083c-4a10-b2cf-e435064e52e8", "TransactionId": "729ed7a7-a8dc-46e7-b93b-7ab517c8565f" }, { "EventName": "NewRsiMessageSubmitted.IntegrationEvent", "AppName": "", "Identifier": "FRIEND03", "CollectionCode": "TST", "CreationDate": "07/05/2024 16:20:30", "EventId": "40fbb655-90f8-4d78-aeda-f46eebc4a1a9", "TransactionId": "ce94cb02-71d5-476d-baf7-b2ef77a2c53c" }], [{ "EventName": "RsiMessagePublished.IntegrationEvent", "AppName": "", "Identifier": "FRIEND04", "CollectionCode": "", "CreationDate": "07/05/2024 16:32:47", "EventId": "1c700b35-abdf-44da-8b2a-06b2b9037ad8", "TransactionId": "ae1bbfa4-618e-4997-b4c4-dedff12c848e" }, { "EventName": "NewRsiMessageRecieved.IntegrationEvent", "AppName": "GatewayGrpcService", "Identifier": "FRIEND04", "CollectionCode": "", "CreationDate": "07/05/2024 16:32:45", "EventId": "b7bd29f2-e2bc-4a74-a202-b7777ce0aca9", "TransactionId": "18d3aea5-3786-47d5-add6-961076c242e6" }, { "EventName": "NewRsiMessageSubmitted.IntegrationEvent", "AppName": "", "Identifier": "FRIEND04", "CollectionCode": "TST", "CreationDate": "07/05/2024 16:32:40", "EventId": "92700d93-3625-44e2-bc65-8bc2832d3fe0", "TransactionId": "d7912aba-ef84-4810-934f-dfa983d9e3c1" }], [{ "EventName": "RsiMessagePublished.IntegrationEvent", "AppName": "", "Identifier": "FRIEND05", "CollectionCode": "", "CreationDate": "07/05/2024 16:34:36", "EventId": "c7c3f2c9-7083-42e9-9e0f-c0d80edd2445", "TransactionId": "0219cae7-3f3c-41e0-9e8e-9a8f8a790394" }, { "EventName": "NewRsiMessageRecieved.IntegrationEvent", "AppName": "GatewayGrpcService", "Identifier": "FRIEND05", "CollectionCode": "", "CreationDate": "07/05/2024 16:33:53", "EventId": "086c3479-4cb1-4a7e-9815-094cff7af32b", "TransactionId": "c82825c1-4079-4052-8831-8578ddd96494" }, { "EventName": "NewRsiMessageSubmitted.IntegrationEvent", "AppName": "", "Identifier": "FRIEND05", "CollectionCode": "TST", "CreationDate": "07/05/2024 16:33:52", "EventId": "2a78f2ea-6f29-4799-ae90-59a3aa033285", "TransactionId": "21e9d7d7-a569-4561-8a1a-5d8b098553a2" }]);

//$(document).ready(function () {
//     fakeJsonDataArray.forEach(function (item, index) {
//        createAccordion("fakeData_" + index, item);
//    });
//});

var connection;
var serverBaseUrl = "";
var serviceStatus = "Running";
function initiateSignalRConnection(baseUrl) {
    
    connection = new signalR.HubConnectionBuilder().withUrl(baseUrl + "/statusHub").build();
    serverBaseUrl = baseUrl;
    // Start the SignalR connection and feedback any errors
    connection.start().then(() => {
        console.log("Connected to SignalR hub");
    }).catch(err => console.error(err.toString()));

    // Subscribe to the SignalR events after the connection is established
    connection.on("SendStatusUpdate", (identifier, jsonAuditString) => {
        console.log("SendStatusUpdate event received identifier:" + identifier + " json: " + jsonAuditString);
        var jsonObject = JSON.parse(jsonAuditString);
        createAccordion(identifier, jsonObject);
    });

    connection.onclose(() => {
        console.log("SignalR connection closed reopening...");
        initiateSignalRConnection(serverBaseUrl);
    })

    $("#consumerToggleButton").click(function () {
        if (serviceStatus === "Running") {
            stopGrpcService();
        } else {
            restartGrpcService()
        }
    });

    document.getElementById("serviceStatusText").innerHTML = serviceStatus;
}

async function stopGrpcService() {
    try {
       var response = await connection.invoke("StopNamedConsumer", "grpcService");
       if(response){
           const liElement = document.getElementById("consumerToggleButton");
           liElement.textContent = 'Restart Service';
           liElement.classList.add('success');
           liElement.classList.remove('failure');
           serviceStatus = "Stopped";
           document.getElementById("serviceStatusText").innerHTML = serviceStatus;
       }
    } catch (err) {
        console.error(err);
    }
}

async function restartGrpcService() {
    try {
        var response = await connection.invoke("RestartNamedConsumer", "grpcService");
        if (response) {
            const liElement = document.getElementById("consumerToggleButton");
            liElement.textContent = 'Stop Service';
            liElement.classList.remove('success');
            liElement.classList.add('failure');
            serviceStatus = "Running";
            document.getElementById("serviceStatusText").innerHTML = serviceStatus;
        }
    } catch (err) {
        console.error(err);
    }
}

function createAccordionContent(data, isFirst) {
    var content = '<div class="accordion-content">';
    for (var key in data) {
        if (key !== "EventName" && key !== "AppName" && key !== "Identifier") {
            content += '<p><strong>' + key + ':</strong> ' + data[key] + '</p>';
        }
    }
    if (isFirst) {
        content += '<p><strong>Audit trail:</strong></p>';
    } 
    content += '</div>';
    return content;
}

function createNestedAccordion(id, item, headerColor) {   
    var accordionHtml = '';
    var header = item.EventName + ' - ' + item.AppName + ' - ' + item.Identifier;
    var content = createAccordionContent(item, false);
    accordionHtml += '<h3 style=background-color:' + headerColor  + '>' + header + '</h3><div>' + content + '</div>';
    return accordionHtml;
}

function createAccordion(id, jsonData) {
    var accordionHtml = '<div id="accordion' + id + '">';

    var item = jsonData.shift();
    var headerCssColor = getCssColor(item.EventName);
    var header = item.EventName.split(".").shift() + ' - ' + getAppName(item.AppName, item.EventName.split(".").shift()) + ' - ' + item.Identifier;
    var content = createAccordionContent(item, true);

    var nestedAccordionHtml = '';
    jsonData.forEach(function (item, index) {
        nestedAccordionHtml += '<div id="nestedAccordion' + id + '-' + index + '">';
        headerColor = getCssColor(item.EventName);
        var nestedAccordion = createNestedAccordion(id + '-' + index, item, headerColor);
        nestedAccordionHtml += nestedAccordion;
        nestedAccordionHtml += '</div>';
    });

    accordionHtml += '<h3 style=background-color:' + headerCssColor + '>' + header + '</h3><div>' + content + nestedAccordionHtml + '</div>';
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

    function getAppName(appName, eventName){
        if (appName != "") return appName;
        switch (eventName) {
            case "RsiMessagePublished":
                return "3rd Party System B33";
            case "NewRsiMessageSubmitted":
                return "Gateway Request API";
            case "RequestStatusChangedToCancelled":
                return "Gateway Request API";
            default:
                "Unknown";
        }
    }

    function getCssColor(eventName) {
        var eventNameTrimed = eventName.split(".").shift();
        switch (eventNameTrimed) {
            case "RsiMessagePublished":
                return "seagreen";
            case "NewRsiMessageRecieved":
                return "chocolate";
            case "NewRsiMessageSubmitted":
                return "darkcyan";
            default:
                return "indianred";
        }
    }
}