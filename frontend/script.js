const dialog = document.getElementById("dialog-box")
const zone1 = document.getElementById("zone1");

const loading = document.getElementById("loading")


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
        loading.close();
        try{
            response.forEach(element => {
                create_card(element);
            });
        }
        catch(error){
            console.log(error);
        }
        add_timetable_to_db(response)
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

fetch_database();

clients = [
    {name:"Bonduelle",
hours:50,},
{name:"MON ABRI / LOGIS",
hours:50,},
{name:"MON ABRI / hdn",
hours:50,},
{name:"JUNIA",
hours:50,},
{name:"ADEO/LM",
hours:50,},
{name:"DECATHLON",
hours:50,},
{name:"Camaieu (FIB NC7)",
hours:50,},
{name:"NORAUTO",
hours:50,},
{name:"MIDAS",
hours:50,},
{name:"KIABI",
hours:50,},
{name:"DRIVECO",
hours:50,},
{name:"Square Habitat",
hours:50,},
{name:"Sitour",
hours:50,},
{name:"Rabot Dutilleul",
hours:50,},
{name:"GENERIX",
hours:50,},
{name:"FORMASUP NPC",
hours:50,},
{name:"Pronal",
hours:50,},
{name:"Eurodatacar",
hours:50,},
{name:"Polyfont",
hours:50,},
{name:"IRCEM ",
hours:50,},
{name:"EUROTUNNEL",
hours:50,},
{name:"Ecobureautique",
hours:50,},
{name:"SORELI",
hours:50,},
{name:"Camif",
hours:50,},
{name:"Tikamoon",
hours:50,},
{name:"Weldom",
hours:50,},
{name:"Zodio",
hours:50,},
{name:"Alice délice",
hours:50,},
{name:"ADVENS",
hours:50,},
{name:"Cofidis",
hours:50,},
{name:"Crédit Mutuel Nord Europe",
hours:50,},
{name:"ICL",
hours:50,},
{name:"Alma",
hours:50,},
{name:"Centre Feron Vrau",
hours:50,},
{name:"BPCE",
hours:50,},
{name:"Francelot",
hours:50,},
{name:"Gedimat",
hours:50,},
{name:"Vesuvius ",
hours:50,},
{name:"EDHEC",
hours:50,},
{name:"GAPAS",
hours:50,},
{name:"Beck Technologies",
hours:50,},
{name:"Lesaffre",
hours:50,},
{name:"CIVAD",
hours:50,},
{name:"TRENOIS DECAMPS",
hours:50,},
{name:"Agepar",
hours:50,},
{name:"Société du Canal Seine Nord Europe 31.12.2020",
hours:50,},
{name:"TRANSITIONS PRO (ex FONGECIF)",
hours:50,},
{name:"Centre Oscar Lambret",
hours:50,},
{name:"LAC",
hours:50,},
{name:"VIAPOST",
hours:50,},
{name:"ROCHEFORT",
hours:50,},
{name:"MEO",
hours:50,},
{name:"Clayrton's",
hours:50,},
{name:"Resto du Cœur",
hours:50,},
{name:"GMD",
hours:50,},
{name:"M2W",
hours:50,},
{name:"SAFE DEMO",
hours:50,},
{name:"TERRITOIRES 62",
hours:50,},
{name:"INAPA",
hours:50,},
{name:"ATOS",
hours:50,},
{name:"DOUBLET",
hours:50,},
{name:"DEVCOT",
hours:50,},
{name:"STA - Société de Transmissions Automatiques (Gaël Lamant - Paris)",
hours:50,},
{name:"IESEG",
hours:50,},
{name:"ASSOCIATION DIOCESAINE D'ARRAS",
hours:50,},
{name:"UPHF - Université Polytechnique Hauts-de-France",
hours:50,},
{name:"ASTRADEC",
hours:50,},
{name:"TG GRISET",
hours:50,},
{name:"NICODEME",
hours:50,},
{name:"KREA",
hours:50,},
{name:"SFMG",
hours:50,},
{name:"THEYS",
hours:50,},
{name:"ARELI",
hours:50,},
{name:"Nicols",
hours:50,},
{name:"SECO",
hours:50,},
{name:"CORSICA SOLE",
hours:50,},
{name:"Crédit municipal de Lille",
hours:50,},
{name:"EXEL",
hours:50,},
{name:"INSA HAUTS-DE-FRANCE",
hours:50,},
{name:"CRFPE",
hours:50,},
{name:"SOLARONICS",
hours:50,},
{name:"ORFITE",
hours:50,},
{name:"ESJ",
hours:50,},
{name:"BDL",
hours:50,},
{name:"Financière Gérard Faivre",
hours:50,},
{name:"Bouygues",
hours:50,},
{name:"SOLUTION FINANCE",
hours:50,},
{name:"BARENTZ FRANCE",
hours:50,},
{name:"STEREOGRAPH",
hours:50,},
{name:"ABM PHARMA NORD",
hours:50,},
{name:"EAR",
hours:50,},
{name:"Logs",
hours:50,},
{name:"Nextedia",
hours:50,},
{name:"GBS",
hours:50,},
{name:"Van Marcke",
hours:50,},
{name:"Société européénne de développement d'assurance",
hours:50,},
{name:"MINDSTON",
hours:50,},
{name:"Ecole Centrale Lille",
hours:50,},
{name:"SOREHAL",
hours:50,},
{name:"Triselec",
hours:50,},
{name:"Oney",
hours:50,},
{name:"Cabre",
hours:50,},
{name:"Scell it",
hours:50,},
{name:"Light Online",
hours:50,},
{name:"Tetrosyl",
hours:50,},
{name:"QHF",
hours:50,},
]

function create_card(data){
    var is_client = false;
    clients.forEach(client => {
        if (data.AFFAIRES.toUpperCase().includes(client.name.toUpperCase())){
            is_client = true;
            data.client = client.name;
            data.client_hours = client.hours;
        }
    });
    if (is_client){
        const card = document.createElement('div');
        card.className = "card";

        // Add title name
        const title = document.createElement("h1");
        title.className = "card-title";
        title.append(data.client)

        // Add total hours
        const status = document.createElement("p");
        status.className = "card-status";
        status.append("Avancement "+Math.round((data.Total/data.client_hours)*100)+"%")

        // Add progress bar
        const progress = document.createElement("progress");
        progress.className = "card-progress";
        progress.max = data.client_hours;
        progress.value = data.Total;

        card.append(title);
        card.append(status);
        card.append(progress);
        zone1.prepend(card);
    }
}

// This function add the data to the database
function add_client_to_db(data){
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const request = new Request("http://127.0.0.1:5000/upload_client_to_db/", {
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

