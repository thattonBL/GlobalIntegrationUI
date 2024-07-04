// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

function initiateSignalRConnection(baseUrl, initialStatuses) {
    const connection = new signalR.HubConnectionBuilder().withUrl(baseUrl + "/statusHub").build();

    fetchInitialData(baseUrl);

    // Initial accordion load
    //const initialStatuses = @Html.Raw(JsonConvert.SerializeObject(Model);
    const initialAccordionContent = constructAccordionContent(initialStatuses);
    initializeAccordion(initialAccordionContent);

    // Start the SignalR connection and feedback any errors
    connection.start().then(() => {
        console.log("Connected to SignalR hub");
    }).catch(err => console.error(err.toString()));

    // Subscribe to the SignalR events after the connection is established
    connection.on("SubmittedStatusUpdate", () => {
        updateAccordion(baseUrl);
    });
    connection.on("ReceivedStatusUpdate", () => {
        updateAccordion(baseUrl);
    });
    connection.on("PublishedStatusUpdate", () => {
        updateAccordion(baseUrl);
    });

    connection.on("StoppedNamedConsumer", (data) => {
        console.log("StoppedNamedConsumer event received:", data);
        const identifier = data.consumerId;
        // alert("Stop event received for consumer: " + identifier);                        
        const eventNameCell = $(`td:nth-child(2)`);
        eventNameCell.css({ "background-color": "red" });
    });

    connection.on("RestartedNamedConsumer", (data) => {
        console.log("RestartedNamedConsumer event received:", data);
        const identifier = data.ConsumerId;
        // alert("Restart event received for consumer: " + identifier);
        const eventNameCell = $(`td:nth-child(2)`);
        eventNameCell.css({ "background-color": "white" });
    });
}

function fetchInitialData(configUrl) {
    var requestUrl = configUrl + '/api/Statuses/GetStatuses';
    console.log('fetchInitialData requestUrl is: ' + requestUrl);
    return $.ajax({
        url: requestUrl,
        method: 'GET',
        dataType: 'json'
    });
}

function initializeAccordion(accordionContent) {
    const $accordion = $('#statusAccordion');
    $accordion.empty();

    accordionContent.forEach(item => {
        $accordion.append(item.header);
        $accordion.append(item.content);
    });

    $accordion.accordion({
        header: ".accordion-header",
        collapsible: true,
        active: false
    });
}

function updateAccordion(configUrl) {
    fetchInitialData(configUrl).done(function (statuses) {
        const accordionContent = constructAccordionContent(statuses);
        initializeAccordion(accordionContent);
        location.reload();
    });
}

function constructAccordionContent(statuses) {
    const accordionContent = [];

    const submittedStatuses = statuses.filter(status => status.EventName === 'NewRsiMessageSubmitted.IntegrationEvent');

    submittedStatuses.forEach(sub => {
        const recStatus = statuses.find(status => status.Identifier === sub.Identifier && status.EventName === 'NewRsiMessageRecieved.IntegrationEvent');
        const pubStatus = statuses.find(status => status.Identifier === sub.Identifier && status.EventName === 'RsiMessagePublished.IntegrationEvent');

        const header = `<div class="accordion-header badge badge-success badge-identifier">Published: ${pubStatus ? pubStatus.Identifier : 'Not Published'}</div>`;
        const content = `
                            <div class="accordion-content">
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Event ID</th>
                                            <th>Event Name</th>
                                            <th>Identifier</th>
                                            <th>CreationTime</th>
                                            <th>Transaction ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>${sub.EventId}</td>
                                            <td data-identifier="Test">${sub.EventName}</td>
                                            <td>${sub.Identifier}</td>
                                            <td>${sub.CreationTime}</td>
                                            <td>${sub.TransactionId}</td>
                                        </tr>
                                        ${recStatus ? `
                                            <tr>
                                                <td>${recStatus.EventId}</td>
                                                <td data-identifier="Test">${recStatus.EventName}</td>
                                                <td>${recStatus.Identifier}</td>
                                                <td>${recStatus.CreationTime}</td>
                                                <td>${recStatus.TransactionId}</td>
                                            </tr>` : ''}
                                        ${pubStatus ? `
                                            <tr>
                                                <td>${pubStatus.EventId}</td>
                                                <td>${pubStatus.EventName}</td>
                                                <td>${pubStatus.Identifier}</td>
                                                <td>${pubStatus.CreationTime}</td>
                                                <td>${pubStatus.TransactionId}</td>
                                            </tr>` : ''}
                                    </tbody>
                                </table>
                            </div>
                        `;

        accordionContent.push({ header, content });
    });

    return accordionContent;
}