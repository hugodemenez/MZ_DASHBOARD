const ctx = document.getElementById('timeline');

const data = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [{
    label: '',
    data: [1, 19, 3, 5, 2, 3],
    borderWidth: 1
    }]
}

const timeline = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            scales : {
                x:{
                    position:"top",
                },
            },
            indexAxis: 'y',
        }
    }
);