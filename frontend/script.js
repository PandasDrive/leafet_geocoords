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
    L.tileLayer('./tiles/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; Your Local Source'
    }).addTo(map);

    let marker;

    processBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            resultsDiv.textContent = 'Please select a file first.';
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        resultsDiv.textContent = 'Processing...';

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
            } else {
                const { latitude, longitude } = data;
                resultsDiv.textContent = `Latitude: ${latitude}
Longitude: ${longitude}`;

                // Update map
                const latLng = [latitude, longitude];
                map.setView(latLng, 13);

                if (marker) {
                    marker.setLatLng(latLng);
                } else {
                    marker = L.marker(latLng).addTo(map);
                }
                marker.bindPopup(`Lat: ${latitude}, Lon: ${longitude}`).openPopup();
            }

        } catch (error) {
            resultsDiv.textContent = `Error: ${error.message}`;
            console.error('Error processing file:', error);
        }
    });
});
