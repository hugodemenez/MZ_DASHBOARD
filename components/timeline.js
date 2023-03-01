const ctx = document.getElementById('timeline');

const data = {
    labels: ['Value', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [{
    label: '',
    data: [[8,10], [8.2,15], [10,15], [10,15], [10,15], [10,15]],
    borderWidth: 1
    }]
}

const timeline = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            plugins:{
                legend:{
                    display:false,
                },
            },
            scales : {
                y:{
                    display:false,
                },
                x:{
                    position:"top",
                    ticks:{
                        borderDash :[1,8],
                        // Include a dollar sign in the ticks
                        callback: function(value, index, ticks) {
                            if (value<10){
                                return '0'+value+':00'
                            }
                            else{
                                return value+':00'
                            }
                        }
                    }
                },
            },
            indexAxis: 'y',
        }
    }
);