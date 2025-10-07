document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const processBtn = document.getElementById('processBtn');
    const resultsDiv = document.getElementById('results');

    // Initialize Leaflet map
    const map = L.map('map').setView([20, 0], 2); // Default view

    // To use this application offline, you must host your own map tiles.
    // The URL below is a placeholder for your local tile server.
    // You should place your tiles in a directory (e.g., 'tiles') and update the path accordingly.
    // Example for tiles at the root of the server: '/tiles/{z}/{x}/{y}.png'
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let polylines = [];
    let markers = [];

    processBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            resultsDiv.textContent = 'Please select a file first.';
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        resultsDiv.textContent = 'Processing...';

        // Clear previous results
        polylines.forEach(polyline => map.removeLayer(polyline));
        markers.forEach(marker => map.removeLayer(marker));
        polylines = [];
        markers = [];

        try {
            const response = await fetch('/process_data', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An unknown error occurred.');
            }

            const data = await response.json();

            if (data.error) {
                resultsDiv.textContent = `Error: ${data.error}`;
            } else if (data.length > 0) {
                const pointsA = data.filter(p => p.type === 'A').map(p => [p.lat, p.lng]);
                const pointsB = data.filter(p => p.type === 'B').map(p => [p.lat, p.lng]);

                if (pointsA.length > 0) {
                    const polylineA = L.polyline(pointsA, {color: 'blue'}).addTo(map);
                    polylines.push(polylineA);
                    const startMarkerA = L.marker(pointsA[0]).addTo(map).bindPopup('Start A');
                    const endMarkerA = L.marker(pointsA[pointsA.length - 1]).addTo(map).bindPopup('End A');
                    markers.push(startMarkerA, endMarkerA);
                }

                if (pointsB.length > 0) {
                    const polylineB = L.polyline(pointsB, {color: 'red'}).addTo(map);
                    polylines.push(polylineB);
                    const startMarkerB = L.marker(pointsB[0]).addTo(map).bindPopup('Start B');
                    const endMarkerB = L.marker(pointsB[pointsB.length - 1]).addTo(map).bindPopup('End B');
                    markers.push(startMarkerB, endMarkerB);
                }

                if (polylines.length > 0) {
                    const group = new L.featureGroup(polylines);
                    map.fitBounds(group.getBounds());
                }

                resultsDiv.textContent = `Processed ${data.length} data points.`;
            } else {
                resultsDiv.textContent = 'No coordinates found in the file.';
            }

        } catch (error) {
            resultsDiv.textContent = `Error: ${error.message}`;
            console.error('Error processing file:', error);
        }
    });
});
