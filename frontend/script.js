
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const processFileBtn = document.getElementById('processFileBtn');
    const hexInput = document.getElementById('hexInput');
    const processHexBtn = document.getElementById('processHexBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultsDiv = document.getElementById('results');
    const signalTypeSpan = document.getElementById('signalType');
    const coordinatesList = document.getElementById('coordinates-list');

    const map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let plottedLayers = []; // Will hold all markers and layers to be cleared

    function clearMap() {
        plottedLayers.forEach(layer => map.removeLayer(layer));
        plottedLayers = [];
        resultsDiv.textContent = 'No data processed yet.';
        signalTypeSpan.textContent = 'N/A';
        coordinatesList.innerHTML = '';
        fileInput.value = '';
        hexInput.value = '';
        map.setView([20, 0], 2); // Reset map view
    }

    function processAndDisplayData(data) {
        clearMap(); // Clear previous results before adding new ones

        if (data.error) {
            resultsDiv.textContent = `Error: ${data.error}`;
            signalTypeSpan.textContent = 'Error';
            return;
        }

        if (data.length === 0) {
            resultsDiv.textContent = 'No valid coordinates found in the data.';
            signalTypeSpan.textContent = 'None';
            return;
        }

        const signalTypes = {};
        data.forEach(point => {
            if (!signalTypes[point.type]) {
                signalTypes[point.type] = [];
            }
            signalTypes[point.type].push(point); // Store the whole point object
        });

        const detectedTypes = Object.keys(signalTypes);
        signalTypeSpan.textContent = detectedTypes.join(', ') || 'None';

        const allPoints = [];
        const colors = { 'A': 'blue', 'B': 'red' }; // Define colors per type

        for (const type in signalTypes) {
            const points = signalTypes[type];
            if (points.length > 0) {
                points.forEach(point => {
                    const latLng = [point.lat, point.lng];
                    allPoints.push(latLng);
                    const marker = L.circleMarker(latLng, {
                        radius: 5,
                        fillColor: colors[type] || 'grey',
                        color: '#000',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).addTo(map);
                    marker.bindPopup(`<b>Signal ${type}</b><br>Lat: ${point.lat.toFixed(5)}<br>Lng: ${point.lng.toFixed(5)}`);
                    plottedLayers.push(marker);
                });
            }
        }

        if (allPoints.length > 0) {
            const bounds = L.latLngBounds(allPoints);
            map.fitBounds(bounds.pad(0.1));
        }

        resultsDiv.textContent = `Processed ${data.length} data points. Found signal types: ${detectedTypes.join(', ')}`;

        data.forEach(point => {
            const li = document.createElement('li');
            li.textContent = `Type: ${point.type}, Lat: ${point.lat.toFixed(5)}, Lng: ${point.lng.toFixed(5)}`;
            coordinatesList.appendChild(li);
        });
    }

    async function handleDataProcessing(url, body) {
        resultsDiv.textContent = 'Processing...';
        signalTypeSpan.textContent = 'Detecting...';
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: body
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An unknown error occurred.');
            }

            const data = await response.json();
            processAndDisplayData(data);

        } catch (error) {
            resultsDiv.textContent = `Error: ${error.message}`;
            signalTypeSpan.textContent = 'Error';
            console.error('Error processing data:', error);
        }
    }

    processFileBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) {
            resultsDiv.textContent = 'Please select a file first.';
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        handleDataProcessing('/process_file', formData);
    });

    processHexBtn.addEventListener('click', () => {
        const hexData = hexInput.value.trim();
        if (!hexData) {
            resultsDiv.textContent = 'Please enter hex data.';
            return;
        }
        const formData = new FormData();
        formData.append('hex_data', hexData);
        handleDataProcessing('/process_hex', formData);
    });

    clearBtn.addEventListener('click', clearMap);
});
