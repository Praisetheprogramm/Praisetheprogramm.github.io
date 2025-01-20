const ctx = document.getElementById('myChart').getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Voreingestellte Zahl 1', 'Voreingestellte Zahl 2', 'Eingegebene Zahl'],
                datasets: [{
                    label: 'Werte',
                    data: [10, 20, 0], // Die letzte Zahl wird durch die Benutzereingabe ersetzt
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