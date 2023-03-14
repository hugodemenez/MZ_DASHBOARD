const tasks = document.getElementById("tasks");

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

// This function add the data to the database
function change_avatar(content){
    var file = document.getElementById(content.id).files[0];
    file = new File([file], content.id+".png", {
        type: file.type,
    });
    let formData = new FormData();
    formData.append("file", file);
    const request = new Request("http://127.0.0.1:5000/changeAvatar", {
        method: "POST",
        body: formData,
    });
    
    fetch(request).then(function(response) {
        return response.json();
    }).then(function(response) {
        location.reload()
        showToast("Avatar enregistré !")
    });



    
}