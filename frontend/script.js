const zone1 = document.getElementById("zone1")
const p = document.createElement("p")
//zone1.prepend("ts",p)


document.getElementById("dialog-box")

function open_dialog_box(){
    document.getElementById("dialog-box").show();
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
    });
}



