document.addEventListener('DOMContentLoaded', function() {
    // Variable para rastrear si Chart.js está disponible
    const isChartJsAvailable = typeof Chart !== 'undefined';
    if (!isChartJsAvailable) {
        console.warn('Chart.js no está disponible. Los gráficos no se mostrarán.');
    }

    // Función para mostrar errores en la página
    function mostrarError(mensaje) {
        console.error(mensaje);
        // Crear un elemento para mostrar el error si no existe
        if (!document.getElementById('error-container')) {
            const errorDiv = document.createElement('div');
            errorDiv.id = 'error-container';
            errorDiv.style.backgroundColor = '#ffebee';
            errorDiv.style.color = '#c62828';
            errorDiv.style.padding = '10px';
            errorDiv.style.margin = '10px 0';
            errorDiv.style.borderRadius = '4px';
            document.querySelector('main').prepend(errorDiv);
        }
        document.getElementById('error-container').textContent = mensaje;
    }

    // Fetch data from the PHP script
    fetch('process.php?json=1')
        .then(response => {
            if (!response.ok) {
                throw new Error('Respuesta del servidor no válida: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos recibidos del servidor:', data);

            // Actualización segura de elementos
            function actualizarElementoSeguro(id, valor) {
                const elemento = document.getElementById(id);
                if (elemento) {
                    elemento.textContent = valor;
                } else {
                    console.warn(`Elemento con ID '${id}' no encontrado en el DOM`);
                }
            }

            // Update the date container
            if (data.date) {
                actualizarElementoSeguro('date-container', data.date);
            }

            // Update the greeting container
            if (data.greeting) {
                actualizarElementoSeguro('greeting-container', data.greeting);
            }

            // Update the dynamic list
            if (data.listItems && Array.isArray(data.listItems)) {
                const dynamicList = document.getElementById('dynamic-list');
                if (dynamicList) {
                    dynamicList.innerHTML = ''; // Clear existing items
                    data.listItems.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item;
                        dynamicList.appendChild(li);
                    });
                }
            }

            // Update the sidebar content
            if (data.sidebarContent) {
                const sidebarContent = document.getElementById('sidebar-content');
                if (sidebarContent) {
                    sidebarContent.innerHTML = data.sidebarContent;
                }
            }

            // Update the current year in the footer
            if (data.currentYear) {
                actualizarElementoSeguro('current-year', data.currentYear);
            }

            // Update sensor values
            if (data.buttonState !== undefined) {
                const buttonState = document.getElementById('button-state');
                if (buttonState) {
                    buttonState.textContent = data.buttonState === '1' ? 'Activado' : 'Desactivado';
                    buttonState.style.color = data.buttonState === '1' ? 'green' : 'black';
                }
            }

            if (data.movementState !== undefined) {
                const movementState = document.getElementById('movement-state');
                if (movementState) {
                    movementState.textContent = data.movementState === '1' ? 'Detectado' : 'No detectado';
                    movementState.style.color = data.movementState === '1' ? 'green' : 'black';
                }
            }

            if (data.temperatureState !== undefined) {
                const temperatureValue = document.getElementById('temperature-value');
                if (temperatureValue) {
                    temperatureValue.textContent = data.temperatureState + ' °C';
                }
            }

            if (data.arduinoButton !== undefined) {
                const arduinoButtonState = document.getElementById('arduino-button-state');
                if (arduinoButtonState) {
                    arduinoButtonState.textContent = data.arduinoButton === '1' ? 'Presionado' : 'No presionado';
                }
            }
            

            // Procesar datos de ThingSpeak
            if (data.thingspeakData && isChartJsAvailable) {
                try {
                    renderThingspeakChart(data.thingspeakData);
                } catch (error) {
                    console.error('Error al renderizar el gráfico:', error);
                    const chartContainer = document.getElementById('potentiometer-chart');
                    if (chartContainer) {
                        chartContainer.textContent = 'Error al cargar el gráfico: ' + error.message;
                    }
                }
            } else if (data.thingspeakData && !isChartJsAvailable) {
                const chartContainer = document.getElementById('potentiometer-chart');
                if (chartContainer) {
                    chartContainer.textContent = 'Chart.js no está disponible para mostrar el gráfico';
                }
            }
        })
        .catch(error => {
            mostrarError('Error al cargar los datos: ' + error.message);
        });

    // Función para actualizar periódicamente los datos
    function actualizarDatos() {
        fetch('process.php?json=1')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la actualización: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Actualización de datos recibida');

                // Actualizar botón
                if (data.buttonState !== undefined) {
                    const buttonState = document.getElementById('button-state');
                    if (buttonState) {
                        buttonState.textContent = data.buttonState === '1' ? 'Activado' : 'Desactivado';
                        buttonState.style.color = data.buttonState === '1' ? 'green' : 'black';
                    }
                }

                // Actualizar movimiento
                if (data.movementState !== undefined) {
                    const movementState = document.getElementById('movement-state');
                    if (movementState) {
                        movementState.textContent = data.movementState === '1' ? 'Detectado' : 'No detectado';
                        movementState.style.color = data.movementState === '1' ? 'green' : 'black';
                    }
                }

                // Actualizar temperatura
                const temperatureValue = document.getElementById('temperature-value');
                if (temperatureValue) {
                    if (data.temperatureState) {
                        temperatureValue.textContent = data.temperatureState + ' °C';
                        temperatureValue.style.color = parseFloat(data.temperatureState) > 30 ? 'red' : 'green'; // Cambia de color si la temperatura es alta
                    } else {
                        temperatureValue.textContent = 'No detectado';
                        temperatureValue.style.color = 'gray';
                    }
                }

                // Actualizar estado del botón Arduino
                if (data.arduinoButton !== undefined) {
                    const arduinoButtonState = document.getElementById('arduino-button-state');
                    if (arduinoButtonState) {
                        arduinoButtonState.textContent = data.arduinoButton === '1' ? 'Presionado' : 'No presionado';
                        arduinoButtonState.style.color = data.arduinoButton === '1' ? 'purple' : 'black';
                    }
                }

                // Actualizar gráfico de ThingSpeak si hay datos nuevos
                if (data.thingspeakData && isChartJsAvailable) {
                    try {
                        renderThingspeakChart(data.thingspeakData);
                    } catch (error) {
                        console.error('Error al actualizar el gráfico:', error);
                    }
                }
            })
            .catch(error => {
                console.error('Error al actualizar datos:', error);
            });
    }


    // Actualizar datos cada 5 segundos
    const updateInterval = setInterval(actualizarDatos, 5000);

    // Limpiar intervalo si la página se descarga
    window.addEventListener('beforeunload', function() {
        clearInterval(updateInterval);
    });
});

// Función para renderizar el gráfico de ThingSpeak con Chart.js
function renderThingspeakChart(thingspeakData) {
    // Verificar que Chart.js esté disponible
    if (typeof Chart === 'undefined') {
        console.error('Chart.js no está disponible');
        return;
    }

    // Verificar que el contenedor exista
    const container = document.getElementById('potentiometer-chart');
    if (!container) {
        console.error('Contenedor del gráfico no encontrado');
        return;
    }

    // Verificar que los datos tengan la estructura correcta
    if (!thingspeakData.values || !Array.isArray(thingspeakData.values) || thingspeakData.values.length === 0) {
        container.textContent = 'No hay datos disponibles para mostrar en el gráfico';
        return;
    }

    container.innerHTML = ''; // Limpiar contenedor

    // Crear un canvas para el gráfico
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    try {
        // Preparar los datos para Chart.js con verificación de seguridad
        const labels = thingspeakData.values.map(item => {
            if (item && item.timestamp) {
                const date = new Date(item.timestamp);
                return date.toLocaleTimeString();
            }
            return 'Sin fecha';
        });

        const values = thingspeakData.values.map(item => {
            return item && item.value !== undefined ? item.value : null;
        });

        // Crear el gráfico con manejo de errores
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: (thingspeakData.field1_name || 'Potenciómetro'),
                    data: values,
                    borderColor: '#e32400',
                    backgroundColor: 'rgba(227, 36, 0, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Datos de ${thingspeakData.channel || 'ThingSpeak'}`
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error al crear el gráfico:', error);
        container.textContent = 'Error al crear el gráfico: ' + error.message;
    }
}

