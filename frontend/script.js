document.addEventListener('DOMContentLoaded', () => {
    // --- Hidden Console Message ---
    console.log(
        "%c GeoSignal Parser v1.0 Initialized - Happy Hacking! ",
        "color: #58a6ff; font-size: 16px; font-weight: bold;"
    );
    console.log("Ohhh so we are peeking under the hood, are we? Welcome, fellow signal enthusiast!");

    // --- Easter Egg Codes ---
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    const godModeCode = ['i', 'd', 'd', 'q', 'd'];
    let godModeIndex = 0;

    document.addEventListener('keyup', (event) => {
        // Konami Code Logic
        if (event.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                konamiIndex = 0;
                launchRocket();
            }
        } else {
            konamiIndex = 0;
        }

        // God Mode Logic
        if (event.key === godModeCode[godModeIndex]) {
            godModeIndex++;
            if (godModeIndex === godModeCode.length) {
                godModeIndex = 0;
                activateGodMode();
            }
        } else {
            godModeIndex = 0;
        }
    });

    function launchRocket() {
        if (document.querySelector('.konami-rocket')) return;
        const rocket = document.createElement('div');
        rocket.textContent = '🚀';
        rocket.className = 'konami-rocket';
        document.body.appendChild(rocket);
        setTimeout(() => rocket.remove(), 4000);
    }

    function activateGodMode() {
        const godModeText = document.getElementById('god-mode-text');
        const elementsToGlow = document.querySelectorAll('.container, button, .help-icon');
        
        // Flash the text
        if(godModeText) {
            godModeText.classList.remove('hidden');
            godModeText.classList.add('god-mode-text-active');
        }

        elementsToGlow.forEach(el => {
            el.classList.add('god-mode-glow');
        });

        // Remove the effect after the animation finishes
        setTimeout(() => {
            if(godModeText) {
                godModeText.classList.add('hidden');
                godModeText.classList.remove('god-mode-text-active');
            }
            elementsToGlow.forEach(el => {
                el.classList.remove('god-mode-glow');
            });
        }, 4000); 
    }

    // --- Dynamic Title variables ---
    const originalTitle = document.title;
    let titleTimeout;

    // --- Element References ---
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
    const homeLink = document.getElementById('homeLink');
    const runningBanner = document.getElementById('running-banner');
    const filterContainer = document.getElementById('filter-container');
    const filterCheckboxes = document.getElementById('filter-checkboxes');
    const dashboardHeader = document.getElementById('dashboardHeader');
    const toggleDashboardBtn = document.getElementById('toggleDashboardBtn');
    const dashboardContent = document.getElementById('dashboardContent');
    
    let processedData = [];
    let layerGroups = {};

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

    // --- Galaxy Animation ---
    initGalaxyAnimation();

    // --- Splash Screen Logic ---
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.classList.add('hidden');
        }
        if (mainContainer) {
            mainContainer.classList.remove('content-hidden');
        }
    }, 2500);

    // --- Map Initialization ---
    const map = L.map('map').setView([20, 0], 2);
    L.tileLayer('./tiles/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; Your Local Source',
        maxZoom: 18,
    }).addTo(map);

    // --- UI Functions ---
    function clearMap() {
        for (const type in layerGroups) {
            layerGroups[type].forEach(layer => map.removeLayer(layer));
        }
        layerGroups = {};
        
        resultsDiv.textContent = 'No data processed yet.';
        signalTypeSpan.textContent = 'N/A';
        coordinatesList.innerHTML = '';
        fileInput.value = '';
        hexInput.value = '';
        
        filterContainer.classList.add('hidden');
        filterCheckboxes.innerHTML = '';
        
        map.setView([20, 0], 2);
        processedData = [];
        clearTimeout(titleTimeout);
        document.title = originalTitle;
    }

    function createFilters(signalTypes) {
        filterCheckboxes.innerHTML = '';
        const types = Object.keys(signalTypes);

        if (types.length > 1) {
            types.forEach(type => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'filter-option';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `filter-${type}`;
                checkbox.value = type;
                checkbox.checked = true;

                checkbox.addEventListener('change', (event) => {
                    const signalType = event.target.value;
                    const layers = layerGroups[signalType] || [];
                    if (event.target.checked) {
                        layers.forEach(layer => layer.addTo(map));
                    } else {
                        layers.forEach(layer => map.removeLayer(layer));
                    }
                });

                const label = document.createElement('label');
                label.htmlFor = `filter-${type}`;
                label.textContent = `Signal ${type}`;

                optionDiv.appendChild(checkbox);
                optionDiv.appendChild(label);
                filterCheckboxes.appendChild(optionDiv);
            });
            filterContainer.classList.remove('hidden');
        }
    }
        // Add variables for the charts
    let signalTypeChart = null;
    let latitudeChart = null;

    // --- Charting Functions ---

    function createSignalTypeChart(data) {
        const ctx = document.getElementById('signalTypeChart').getContext('2d');
        const signalCounts = data.reduce((acc, point) => {
            acc[point.type] = (acc[point.type] || 0) + 1;
            return acc;
        }, {});

        // Destroy the old chart if it exists
        if (signalTypeChart) {
            signalTypeChart.destroy();
        }

        signalTypeChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(signalCounts),
                datasets: [{
                    label: 'Signal Types',
                    data: Object.values(signalCounts),
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)', // Blue for Signal A
                        'rgba(255, 99, 132, 0.7)'  // Red for Signal B
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e0e0e0' // Style legend text for dark mode
                        }
                    }
                }
            }
        });
    }

    function createLatitudeChart(data) {
        const ctx = document.getElementById('latitudeChart').getContext('2d');
        const latitudeBands = data.reduce((acc, point) => {
            const band = Math.round(point.lat / 10) * 10; // Group by 10 degrees of latitude
            acc[band] = (acc[band] || 0) + 1;
            return acc;
        }, {});

        // Destroy the old chart if it exists
        if (latitudeChart) {
            latitudeChart.destroy();
        }
        
        latitudeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(latitudeBands).sort((a, b) => a - b),
                datasets: [{
                    label: 'Signal Count',
                    data: Object.values(latitudeBands),
                    backgroundColor: 'rgba(0, 191, 255, 0.6)',
                    borderColor: 'rgba(0, 191, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#e0e0e0' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#e0e0e0' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }


    function processAndDisplayData(data) {
        clearMap();

        if (data.error) {
            resultsDiv.textContent = `Error: ${data.error}`;
            signalTypeSpan.textContent = 'Error';
            document.title = '❌ Error!';
            titleTimeout = setTimeout(() => { document.title = originalTitle; }, 4000);
            return;
        }

        if (data.length === 0) {
            const noResultsMessages = [
                "Scanned the data stream... it's empty. Spooky.",
                "Signal lost. Nothing but static.",
                "Are you sure there's data in there? We can't find it."
            ];
            const randomIndex = Math.floor(Math.random() * noResultsMessages.length);
            resultsDiv.textContent = noResultsMessages[randomIndex];
            signalTypeSpan.textContent = 'None';
            document.title = '🤷 No Signals Found';
            titleTimeout = setTimeout(() => { document.title = originalTitle; }, 4000);
            return;
        }

        document.title = '✅ Signals Found!';
        titleTimeout = setTimeout(() => { document.title = originalTitle; }, 4000);

        processedData = data;

        // Generate the charts with the new data
        createSignalTypeChart(data);
        createLatitudeChart(data);

        const signalTypes = {};
        data.forEach(point => {
            if (!signalTypes[point.type]) {
                signalTypes[point.type] = [];
            }
            signalTypes[point.type].push(point);
        });

        createFilters(signalTypes);

        const detectedTypes = Object.keys(signalTypes);
        signalTypeSpan.textContent = detectedTypes.join(', ');

        const allPoints = [];
        const colors = { 'A': 'blue', 'B': 'red' };

        for (const type in signalTypes) {
            layerGroups[type] = [];
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
                    
                    layerGroups[type].push(marker);
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
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Latitude,Longitude\n";

            signalTypes[type].forEach(point => {
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
        clearTimeout(titleTimeout);
        document.title = '🛰️ Finding Signals...';
        
        const loadingMessages = [
            "Triangulating signal position...",
            "Asking the satellites nicely...",
            "Reticulating splines...",
            "Bending spacetime to find coordinates...",
            "Don't worry, the bits are flowing...",
            "Calibrating the flux capacitor..."
        ];
        const randomIndex = Math.floor(Math.random() * loadingMessages.length);
        resultsDiv.textContent = loadingMessages[randomIndex];
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
            document.title = '❌ Error!';
            titleTimeout = setTimeout(() => { document.title = originalTitle; }, 4000);
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

    if (dashboardHeader) {
        dashboardHeader.addEventListener('click', () => {
            dashboardContent.classList.toggle('collapsed');
            const isCollapsed = dashboardContent.classList.contains('collapsed');
            toggleDashboardBtn.textContent = isCollapsed ? 'Show' : 'Hide';
            toggleDashboardBtn.title = isCollapsed ? 'Show Dashboard' : 'Collapse Dashboard';
        });
    }

    homeLink.addEventListener('click', (event) => {
        event.preventDefault(); 
        if (mainContainer) mainContainer.classList.add('content-hidden');
        if (splashScreen) splashScreen.classList.remove('hidden');
        
        if (runningBanner) {
            runningBanner.classList.remove('hidden');
            runningBanner.classList.add('animate-banner');
            setTimeout(() => {
                runningBanner.classList.add('hidden');
                runningBanner.classList.remove('animate-banner');
            }, 7000);
        }
        setTimeout(() => {
            if (splashScreen) splashScreen.classList.add('hidden');
            if (mainContainer) mainContainer.classList.remove('content-hidden');
        }, 2500);
    });
});

function initGalaxyAnimation() {
    if (typeof THREE === 'undefined') {
        console.error('THREE.js is not loaded.');
        return;
    }

    const canvas = document.getElementById('galaxy-canvas');
    if (!canvas) {
        console.error('galaxy-canvas not found');
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const parameters = {
        count: 100000,
        size: 0.01,
        radius: 5,
        branches: 3,
        spin: 1,
        randomness: 0.5,
        randomnessPower: 3,
        insideColor: '#ff6030',
        outsideColor: '#1b3984'
    };

    let geometry = null;
    let material = null;
    let points = null;

    const generateGalaxy = () => {
        if (points !== null) {
            geometry.dispose();
            material.dispose();
            scene.remove(points);
        }

        geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(parameters.count * 3);
        const colors = new Float32Array(parameters.count * 3);

        const colorInside = new THREE.Color(parameters.insideColor);
        const colorOutside = new THREE.Color(parameters.outsideColor);

        for (let i = 0; i < parameters.count; i++) {
            const i3 = i * 3;
            const radius = Math.random() * parameters.radius;
            const spinAngle = radius * parameters.spin;
            const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

            const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
            const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
            const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, radius / parameters.radius);

            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        material = new THREE.PointsMaterial({
            size: parameters.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });

        points = new THREE.Points(geometry, material);
        scene.add(points);
    };

    generateGalaxy();
    camera.position.x = -1;
    camera.position.y = -1;
    camera.position.z = 1;


    let animationId;
    const clock = new THREE.Clock();

    const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        if(points) {
            points.rotation.y = elapsedTime * 0.1;
        }
        camera.position.y += 0.0005;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
        animationId = window.requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });


}
