const dialog = document.getElementById("dialog-box")
const modal_overlay = document.querySelector(".modal-overlay")
const zone1 = document.getElementById("zone1");
const tasks = document.getElementById("tasks");
const loading = document.querySelector(".loading")
const clients = []


function group_timetable(timetable){
    const groupped_list = timetable.reduce((result, item) => {
        const key = item["AFFAIRES"];
        if (!result[key]) {
        result[key] = [];
        }
        result[key].push(item);
        return result;
    }, {});

    var list = [];
    for (value in (groupped_list)){
        total_client_work = groupped_list[value][0];
        total_client_work["users"] = [];
        total = 0;
        for (i of groupped_list[value]){
            total_client_work["users"].push(i["username"]);
            var total = parseInt(total) + parseInt(i["Total"]);
        }
        delete total_client_work['username'];
        total_client_work["Total"] = total;

        list.push(total_client_work);
    }
    return list;
}

// Function to remove overlay when dialog is closed
dialog.addEventListener('close', function() {
    modal_overlay.style.display = ""
});

// Function to open the dialog box
function toogle_dialog_box(){
    if (dialog.open){
        dialog.close();
        modal_overlay.style.display = ""
    }
    else{
        modal_overlay.style.display = "block"
        dialog.showModal();
    }
}

// This function close the dialog box and create cards 
// from data fetched from the server, then add the data to the database
function submit_dialog_box(){
    dialog.close();
    const content = {
        "username": document.getElementById("username").value,
        "password": document.getElementById("password").value
    }
    if (content.username=="test"){
        content.username="hugo.demenez"
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
    loading.style.display = "block";
    fetch(request).then(function(response) {
        return response.json();
    }).then(function(response) {
        // clean response
        response = response.filter(
            function(item){
                return !(item.AFFAIRES.toUpperCase().includes("TOTAL"));
            }
        )
        response.forEach(element => {
            element["username"]=document.getElementById("username").value;
        })
        // Upload the data to the database
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
    loading.style.display = "none";
    fetch(request).then(function(response) {
        return response.json();
    }).then(function(response) {
        showToast("Contenu ajouté à la base de données");
        location.reload();
    });
}

function fetch_database(){
    // fetch tasks
    fetch(get_tasks())
    .then(function(tasks_response) {
        return tasks_response
    })
    .then(function(tasks_response) {
        // if request is successful (code 200)
        if (tasks_response.status==200){
            tasks_response.json().then(function(tasks){
                tasks.forEach(task => {
                    create_task(task);
                });
            })
        }
    })
    .catch(error =>{
        showToast("Erreur de connexion au serveur, n'oubliez pas de lancer le terminal à partir du fichier .bat","error")
        setInterval(reloader => {location.reload()},5000);
    });

    // fetch clients
    fetch(get_clients()).then(function(clients_response) {
        return clients_response
    }).then(function(clients_response) {
        // if request is successful (code 200)
        if (clients_response.status==200){
            clients_response.json().then(function(client){
                client.forEach(element => {
                    clients.push(element);
                });
            })
            fetch(get_timetable()).then(data => {
                data.json().then(x =>{
                    group_timetable(x).forEach(element => {create_card(element)});
                })})
        }
        // if request is successful but no client in database (code 204)
        if (clients_response.status==204){
                fetch(get_timetable()).then(function(timetable_response) {
                    return timetable_response
                }).then(function(timetable_response) {
                    if (timetable_response.status==200){
                        timetable_response.json().then(function(data){
                            group_timetable(data).forEach(element => {
                            create_card(element)
                        });
                    });
                }
            });
        }
    });
}

// get clients request
function get_clients(){
    const clients_request = new Request("http://127.0.0.1:5000/getClients/", {
        method: "GET",
        mode: "cors",
        cache: "default",
    });
    return clients_request;
}

// get timetable request
function get_timetable(){
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const request = new Request("http://127.0.0.1:5000/read_timetable_from_db/", {
        method: "GET",
        mode: "cors",
        cache: "default",
    });
    return request;
}

// get tasks request
function get_tasks(){
    const tasks_request = new Request("http://127.0.0.1:5000/get_tasks/", {
        method: "GET",
        mode: "cors",
        cache: "default",
    });
    return tasks_request;
}

// This function create a card from the provided data
function create_card(data){
    var is_client = false;
    clients.forEach(client => {
        // Format client name (agreement fiit find word beofre space)
        if (client.name.includes(" ")){
            client.name = client.name.substring(0,client.name.indexOf(' '));
        }

        if (data.AFFAIRES.toUpperCase().includes(client.name.toUpperCase())){
            is_client = true;
            data.client = client.name;
            data.client_hours = client.hours;
        }
    });

    if(data.AFFAIRES.includes("-")){
        data.AFFAIRES = data.AFFAIRES.split("-").slice(1,3).join(", ")
    }

    // Create card
    const card = document.createElement('div');
    card.className = "card";

    // Add user number
    var index = 0;
    for (user of data.users){

        const img = document.createElement("img");
        img.className = "card-user";
        img.src = "./assets/avatar/"+user+".png";
        img.title = user;
        if (index>0){
            img.style.transform = "translateX(-20px)";
        }
        card.append(img);
        index += 1;
    }


    // Add title name
    const title = document.createElement("h1");
    title.className = "card-title";
    title.append(data.AFFAIRES)

    // If it is a known client
    if (is_client){
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
    }
    // Else it is an unknown client
    else{
        // Add total hours
        const status = document.createElement("p");
        status.className = "card-status";
        status.append("Temps chargés : "+data.Total+"h");
        card.append(title);
        card.append(status);
    }

    // card.dataset.values = JSON.stringify(data);
    zone1.prepend(card);

}

// This function allows to search in the cards
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
    let files = document.getElementById("agreement-fiit").files;
    let formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    const request = new Request("http://127.0.0.1:5000/uploadfiles", {
        method: "POST",
        body: formData,
        mode: "cors",
        cache: "default",
    });
    
    fetch(request).then(function(response) {
        return response.json();
    }).then(function(response) {
        location.reload()
        showToast("Agreement FI'IT ajouté !")
    });
}

// This function add a new task and push data to database
function add_new_task(){
    const task_content = document.getElementById('new-task-content');

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const request = new Request("http://127.0.0.1:5000/upload_task_to_db/", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
            "content":task_content.innerText
        }),
        mode: "cors",
        cache: "default",
    });
    
    fetch(request).then(function(response) {
        return response;
    }).then(function(response) {
        if (response.status == 200){
            create_task({
                content:task_content.innerText
            })
            //success toast
            showToast("Tâche ajoutée !","success")
        }
        else{
            //error toast
            showToast("La tâche existe déjà !","error")
        }

        // vanish text content
        task_content.innerText = "";
    });
}

// This function create a task from the provided data
function create_task(data){
    // get the text content
    const textContent = data.content;

    const task = document.createElement('div');
    task.className = "task";

    // Add task content
    const content = document.createElement("p");
    content.className = "task-content";
    content.append(textContent)

    // Add check box
    const checkbox = document.createElement("input");
    checkbox.className = "task-status";
    checkbox.type = "checkbox";
    checkbox.onclick = function(){
        content.style.textDecoration = "line-through";
        delete_task(data.content);
        // fix once checked
        checkbox.onclick = function(){
            return false;}
    }
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

//delete task
function delete_task(taskContent){
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const request = new Request("http://127.0.0.1:5000/delete_task_from_db/", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
            "content":taskContent
        }),
        mode: "cors",
        cache: "default",
    });
    
    fetch(request).then(function(response) {
        return response;
    }).then(function(response) {
        if (response.status == 200){
            //success toast
            showToast("Tâche supprimée !");
        }
        else{
            //error toast
            showToast("Erreur dans la base de données !");
        }
    });
}

// Toast creation
function showToast(message,status) {
    const toast = document.querySelector('.toast');
    toast.innerHTML="";


    const closeButton = document.createElement("button");
    closeButton.className = "toast-close";
    closeButton.innerHTML = "X";
    closeButton.onclick = function(){
        toast.style.display = 'none';
    };
    toast.append(closeButton)


    if (status == 'success') {
        const title = document.createElement("h1");
        title.innerHTML = "Succès";
        toast.append(title);
        toast.style.border = "solid var(--vert-ok-mz) 2px";
    }
    else if (status == 'error') {
        const title = document.createElement("h1");
        title.innerHTML = "Erreur";
        toast.append(title);
        toast.style.border = "solid var(--rouge-erreur-mz) 2px";
    }
    else{
        const title = document.createElement("h1");
        title.innerHTML = "Notification";
        toast.append(title);
        toast.style.border = "solid var(--orange-majeur-mz) 2px";
    }
    const content = document.createElement("p");
    content.innerHTML = message;
    toast.append(content);
    toast.style.display = 'block';
    setTimeout(function() {
        toast.style.display = 'none';
    }, 6000);

}
