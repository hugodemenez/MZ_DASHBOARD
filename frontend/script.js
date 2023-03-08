document.getElementById("dialog-box")

function open_dialog_box(){
    document.getElementById("dialog-box").showModal();
}

function close_dialog_box(){
    document.getElementById("dialog-box").close();
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
        console.log(response);
        const zone1 = document.getElementById("zone1");
        try{
            const p = document.createElement("p");
            response.forEach(element => {
                const card = document.createElement('div');
                card.className = "card";
                card.append(element.AFFAIRES,p);
                zone1.prepend(card,p);
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
        const zone1 = document.getElementById("zone1");
        try{
            const p = document.createElement("p");
            response.forEach(element => {
                const card = document.createElement('div');
                card.className = "card";
                card.append(element.AFFAIRES,p);
                zone1.prepend(card,p);
            });
        }
        catch(error){
            console.log(error);
        }
    });
}

const data = [
    {
        "AFFAIRES": "CSF220087 - OSCAR LAMBRET-31/12-CSF-AUDITLEGAL-2022",
        "Total": 7
    },
    {
        "AFFAIRES": "CSF230149 - MZ GENERIX-31/03-CSF-AUDITLEGAL-2023",
        "Total": 3
    },
    {
        "AFFAIRES": "E003ABS-NR - ABSENCES NON REMUNEREES",
        "Total": 448
    },
    {
        "AFFAIRES": "E003ABSEN - ABSENCES",
        "Total": 7
    },
    {
        "AFFAIRES": "E003CONGES - CONGES",
        "Total": 35
    },
    {
        "AFFAIRES": "E003DOC007 - E003DOC_Temps documentation",
        "Total": 21
    },
    {
        "AFFAIRES": "E003FOR002 - E003FOR_Particip form interne",
        "Total": 30.5
    },
    {
        "AFFAIRES": "E003SS-AFF - E003 SANS AFFECTATION",
        "Total": 4
    },
    {
        "AFFAIRES": "EBE220059 - MZ TICKET FOR THE MOON-31/12-EBE-AUDITLEGAL-2022",
        "Total": 10
    },
    {
        "AFFAIRES": "EBE220065 - RABOT DUTILLEUL CONSTRUCTION-31/12-EBE-AUDITLEGAL-2022",
        "Total": 19
    },
    {
        "AFFAIRES": "EBE220066 - IRCEM-31/12-EBE-AUDITLEGAL-2022",
        "Total": 56.5
    },
    {
        "AFFAIRES": "EBE220234 - MZ MOBIVIA-30/09-EBE-AUDITLEGAL-2022",
        "Total": 139
    },
    {
        "AFFAIRES": "EBE220235 - MZ MOBIVIA CONSO-30/09-EBE-AUDITLEGAL-2022",
        "Total": 2
    },
    {
        "AFFAIRES": "EBE220236 - MZ NORAUTO FRANCE-30/09-EBE-AUDITLEGAL-2022",
        "Total": 7
    },
    {
        "AFFAIRES": "EBE220275 - GETLINK-31/12-EBE-AUDITLEGAL-2022",
        "Total": 17
    },
    {
        "AFFAIRES": "JPV220004 - ADVENS-31/12-JPV-AUDITLEGAL-2022",
        "Total": 1
    },
    {
        "AFFAIRES": "JPV220826 - EDHEC B SCHOOL-31/08-JPV-AUDITLEGAL-2022",
        "Total": 12
    },
    {
        "AFFAIRES": "JPV221501 - SAS DECATHLON FRANCE-31/12-JPV-AUDITLEGAL-2022",
        "Total": 77
    },
    {
        "AFFAIRES": "Total Temps",
        "Total": 896
    }
]


fetch_database();



