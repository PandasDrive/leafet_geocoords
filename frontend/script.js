document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const mainContainer = document.querySelector('.container');
    const fileInput = document.getElementById('fileInput');
    const processFileBtn = document.getElementById('processFileBtn');
    const hexInput = document.getElementById('hexInput');
    const processHexBtn = document.getElementById('processHexBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultsDiv = document.getElementById('results');
    const signalTypeSpan = document.getElementById('signalType');
    const coordinatesList = document.getElementById('coordinates-list');
    const loader = document.getElementById('loader');
    const modal = document.getElementById('help-modal');
    const helpText = document.getElementById('help-text');
    const closeButton = document.querySelector('.close-button');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    let processedData = []; // Variable to store the processed data

    const helpContent = {
        'help-file': 'Upload a .sff or .fbf file containing signal data. The file will be processed to extract and display geographical coordinates.',
        'help-hex': 'Paste the hexadecimal representation of the signal data here. This is an alternative to uploading a file.'
    };

    document.querySelectorAll('.help-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const helpKey = icon.getAttribute('data-help');
            helpText.textContent = helpContent[helpKey];
            modal.style.display = 'block';
        });
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // --- Splash Screen Logic ---
    // After a delay, fade out the splash screen and fade in the main content
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.classList.add('hidden');
        }
        if (mainContainer) {
            mainContainer.classList.remove('content-hidden');
        }
    }, 2500); // Time for the animation to play

    // --- Map Initialization ---
    const map = L.map('map').setView([20, 0], 2);
    // To use this application offline, you must host your own map tiles.
    // The URL below is a placeholder for your local tile server.
    // You should place your tiles in a directory (e.g., 'tiles') and update the path accordingly.
    // Example for tiles at the root of the server: '/tiles/{z}/{x}/{y}.png'
    L.tileLayer('./tiles/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; Your Local Source',
        maxZoom: 18,
    }).addTo(map);

    let plottedLayers = [];

    // --- UI Functions ---
    function clearMap() {
        plottedLayers.forEach(layer => map.removeLayer(layer));
        plottedLayers = [];
        resultsDiv.textContent = 'No data processed yet.';
        signalTypeSpan.textContent = 'N/A';
        coordinatesList.innerHTML = '';
        fileInput.value = '';
        hexInput.value = '';
        map.setView([20, 0], 2); // Reset map view
        processedData = []; // Clear the data on map clear
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

        processedData = data; // Store the data

        const signalTypes = {};
        data.forEach(point => {
            if (!signalTypes[point.type]) {
                signalTypes[point.type] = [];
            }
            signalTypes[point.type].push(point);
        });

        const detectedTypes = Object.keys(signalTypes);
        signalTypeSpan.textContent = detectedTypes.join(', ');

        const allPoints = [];
        const colors = { 'A': 'blue', 'B': 'red' };

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
                    
                    marker.bindTooltip(`Lat: ${point.lat.toFixed(5)}, Lng: ${point.lng.toFixed(5)}`);
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

    // --- New Function to Export to CSV ---
    function exportToCsv() {
        if (processedData.length === 0) {
            alert('No data to export.');
            return;
        }

        const signalTypes = {};
        processedData.forEach(point => {
            if (!signalTypes[point.type]) {
                signalTypes[point.type] = [];
            }
            signalTypes[point.type].push(point);
        });

        for (const type in signalTypes) {
            const points = signalTypes[type];
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Latitude,Longitude\n"; // CSV Header

            points.forEach(point => {
                const row = `${point.lat},${point.lng}`;
                csvContent += row + "\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `signal_${type}_data.csv`);
            document.body.appendChild(link); 
            link.click();
            document.body.removeChild(link);
        }
    }

    async function handleDataProcessing(url, body) {
        resultsDiv.textContent = 'Processing...';
        signalTypeSpan.textContent = 'Detecting...';
        loader.classList.remove('hidden');

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
        } finally {
            loader.classList.add('hidden');
        }
    }

    // --- Event Listeners ---
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
    exportCsvBtn.addEventListener('click', exportToCsv);
});