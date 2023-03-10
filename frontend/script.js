const dialog = document.getElementById("dialog-box")
const zone1 = document.getElementById("zone1");
const tasks = document.getElementById("tasks");
const loading = document.getElementById("loading")
const clients = []

function open_dialog_box(){
    dialog.showModal();
}

// This function close the dialog box and create cards from data fetched from the server, then add the data to the database
function close_dialog_box(){
    dialog.close();
    const content = {
        "username": document.getElementById("username").value,
        "password": document.getElementById("password").value
    }
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const request = new Request("http://127.0.0.1:5000/get_akuiteo_timetable/", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(content),
        mode: "cors",
        cache: "default",
    });
    loading.show();
    fetch(request).then(function(response) {
        return response.json();
    }).then(function(response) {
        console.log(response)
        loading.close();
        try{
            response.forEach(element => {
                create_card(element);
            });
        }
        catch(error){
        }
        // Upload the data to the database
        console.log(response)
        add_timetable_to_db(response);
    });
}

// This function add the data to the database
function add_timetable_to_db(data){
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const request = new Request("http://127.0.0.1:5000/upload_timetable_to_db/", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(data),
        mode: "cors",
        cache: "default",
    });
    
    fetch(request).then(function(response) {
        return response.json();
    }).then(function(response) {
        console.log(response)
    });
}

function fetch_database(){
    const clients_request = new Request("http://127.0.0.1:5000/getClients/", {
        method: "GET",
        mode: "cors",
        cache: "default",
    });
    fetch(clients_request).then(function(response) {
        return response
    }).then(function(response) {
        // if request is successful (code 200)
        if (response.status==200){
            response.json().then(function(data){
                data.forEach(element => {
                    clients.push(element);
                });
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                const request = new Request("http://127.0.0.1:5000/read_timetable_from_db/", {
                    method: "GET",
                    mode: "cors",
                    cache: "default",
                });
                fetch(request).then(function(response) {
                    return response
                }).then(function(response) {
                    if (response.status==200){
                        response.json().then(function(data){
                            data.forEach(element => {
                                create_card(element)
                            });
                        })
                    }
                });
            })
        }
        // if request is successful but no client in database (code 204)
        if (response.status==204){
            const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                const request = new Request("http://127.0.0.1:5000/read_timetable_from_db/", {
                    method: "GET",
                    mode: "cors",
                    cache: "default",
                });
                fetch(request).then(function(response) {
                    return response
                }).then(function(response) {
                    if (response.status==200){
                        response.json().then(function(data){
                            data.forEach(element => {
                                create_card(element)
                            });
                        })
                    }
                });
        }
    });
}

function create_card(data){
    var is_client = false;
    clients.forEach(client => {
        // Format client name (agreement fiit find word beofre space)
        if (client.name.includes(" ")){
            client.name = client.name.substring(0,client.name.indexOf(' '));
            console.log("Agreement FI'IT trouvé : "+client.name)
        }

        if (data.AFFAIRES.toUpperCase().includes(client.name.toUpperCase())){
            is_client = true;
            data.client = client.name;
            data.client_hours = client.hours;
        }
    });

    if(data.AFFAIRES.includes("-")){
        data.AFFAIRES = data.AFFAIRES.split("-")[1]
    }

    // If it is a known client
    if (is_client){
        const card = document.createElement('div');
        card.className = "card";

        // Add title name
        const title = document.createElement("h1");
        title.className = "card-title";
        title.append(data.AFFAIRES)


        // Add total hours
        const status = document.createElement("p");
        status.className = "card-status";
        status.append("Temps chargés : ")
        status.append(document.createElement("br"))
        status.append(data.Total + "h / " + data.client_hours + "h")

        // Add progress bar
        const progress = document.createElement("progress");
        progress.className = "card-progress";
        progress.max = data.client_hours;
        progress.value = data.Total;

        if (data.Total/data.client_hours > 0.3){
            progress.style.setProperty("--progress-color", "#E4CE2C");
        }
        if (data.Total/data.client_hours > 0.5){
            progress.style.setProperty("--progress-color", "#FF9900");
        }
        if (data.Total/data.client_hours > 0.8){
            progress.style.setProperty("--progress-color", "#DF7F7F");
        }

        card.append(title);
        status.append(document.createElement("br"))
        status.append(progress);

        card.append(status);

        zone1.prepend(card);
    }
    // Else it is an unknown client
    else{
        const card = document.createElement('div');
        card.className = "card";

        // Add title name
        const title = document.createElement("h1");
        title.className = "card-title";
        title.append(data.AFFAIRES)

        // Add total hours
        const status = document.createElement("p");
        status.className = "card-status";
        status.append("Temps chargés : "+data.Total+"h")

        card.append(title);
        card.append(status);
        zone1.prepend(card);
    }


}

function search_bar() {
    // Declare variables
    var input, filter, cards;
    input = document.getElementById('search-bar');
    filter = input.value.toUpperCase();
    cards = document.getElementsByClassName('card');

    // Loop through all list items, and hide those who don't match the search query
    for (var card of cards){
        if (card.getElementsByClassName('card-title')[0].textContent.toUpperCase().indexOf(filter) > -1) {
            card.style.display = "";
        }
        else {
            card.style.display = "none";
        }
    }
}

// This function add the data to the database
function add_agreementfiit_to_db(){
    let file = document.getElementById("agreement-fiit").files[0];
    let formData = new FormData();
    formData.append("files", file);
    const request = new Request("http://127.0.0.1:5000/uploadfiles", {
        method: "POST",
        body: formData,
        mode: "cors",
        cache: "default",
    });
    
    fetch(request).then(function(response) {
        return response.json();
    }).then(function(response) {
        console.log(response)
    });
}

function add_new_task(){
    // get the text content
    const textContent = document.getElementById('new-task-content').innerText;

    // vanish text content
    document.getElementById('new-task-content').innerText = "";


    console.log(textContent)
    const task = document.createElement('div');
    task.className = "task";

    // Add check box
    const checkbox = document.createElement("input");
    checkbox.className = "task-status";
    checkbox.type = "checkbox";

    // Add task content
    const content = document.createElement("p");
    content.className = "task-content";
    content.append(textContent)



    task.append(checkbox);
    task.append(content);
    tasks.prepend(task);
    updateTaskNumber();
}

//update task number
function updateTaskNumber(){
    var taskNumber = document.getElementById('tasks');
    taskNumber = taskNumber.childElementCount;
    document.getElementById('task-quantity').innerText = taskNumber;
}
