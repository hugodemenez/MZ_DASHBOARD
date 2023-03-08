const dialog = document.getElementById("dialog-box")
const zone1 = document.getElementById("zone1");


function open_dialog_box(){
    dialog.showModal();
}

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
    
    fetch(request).then(function(response) {
        return response.json();
    }).then(function(response) {
        try{
            response.forEach(element => {
                create_card(element);
            });
        }
        catch(error){
            console.log(error);
        }
        add_element_to_db(response)
    });
}

function add_element_to_db(data){
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
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const request = new Request("http://127.0.0.1:5000/read_timetable_from_db/", {
        method: "GET",
        mode: "cors",
        cache: "default",
    });
    
    fetch(request).then(function(response) {
        return response.json();
    }).then(function(response) {
        console.log(response)
        try{
            
            response.forEach(element => {
                create_card(element)
            });
        }
        catch(error){
            console.log(error);
        }
    });
}

fetch_database();

dossiers = [
    "DECATHLON",
    "ADVENS",
]

function create_card(data){
    dossiers.forEach(dossier => {
        if (data.AFFAIRES.includes(dossier)){
            const card = document.createElement('div');
            card.className = "card";

            // Add title name
            const title = document.createElement("h1");
            title.className = "card-title";
            title.append(dossier)

            // Add total hours
            const status = document.createElement("p");
            status.className = "card-status";
            status.append(data.Total)


            card.append(title);
            card.append(status);
            zone1.prepend(card);
        }
        }
    );
}

