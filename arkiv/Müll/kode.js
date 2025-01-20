// var ctx = document.getElementById('myPieChart').getContext('2d');
//     var myPieChart = new Chart(ctx, {
//         type: 'pie',
//         data: {
//             labels: ['Rot', 'Blau', 'Gelb'],
//             datasets: [{
//                 data: [10, 20, 30],
//                 backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
//             }]
//         },
//         options: {
//             responsive: true
//         }
//     });

const ctx = document.getElementById("myPieChart");

new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['elektronisk avfall', 'papiravfall', 'Bioavfall', 'restavfall', 'farlig avfall'],
        datasets: [{
            data: [1, 31, 28, 35, 0.5],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '','#FFEC78']
        }]
    },
    options: {
        responsive: true
    }
});

// document.addEventListener('DOMContentLoaded', () => {
//     const bars = document.querySelectorAll('.bar');
//     const infoBox = document.getElementById('info-box');

//     bars.forEach(bar => {
//         bar.addEventListener('mouseover', (event) => {
//             const info = event.target.getAttribute('data-info');
//             infoBox.textContent = info;
//             infoBox.style.display = 'block';
//             infoBox.style.left = `${event.pageX + 10}px`;
//             infoBox.style.top = `${event.pageY + 10}px`;
//         });

//         bar.addEventListener('mousemove', (event) => {
//             infoBox.style.left = `${event.pageX + 10}px`;
//             infoBox.style.top = `${event.pageY + 10}px`;
//         });

//         bar.addEventListener('mouseout', () => {
//             infoBox.style.display = 'none';
//         });
//     });
// });

document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('background-video');
    video.play();
});

const ctx = document.getElementById('myChart').getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Voreingestellte Zahl 1', 'Voreingestellte Zahl 2', 'Eingegebene Zahl'],
                datasets: [{
                    label: 'Werte',
                    data: [19, 11.2, 0], // Die letzte Zahl wird durch die Benutzereingabe ersetzt
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        function updateChart() {
            const userInput = document.getElementById('userInput').value;
            myChart.data.datasets[0].data[2] = userInput;
            myChart.update();
        }

