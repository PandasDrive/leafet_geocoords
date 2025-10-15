# GeoSignal Parser - Offline Version

## 📦 Overview

This is a **fully offline-capable** geospatial signal analysis tool that parses binary signal files and visualizes geographical coordinates on an interactive map. No internet connection required after initial setup!

## ✨ Features

### Core Functionality
- **Binary Signal Parsing**: Process `.sff` and `.fbf` files containing signal data
- **Multiple Signal Types**: Automatic detection and parsing of Signal A (0x2020) and Signal B (0x2021)
- **Hex Data Input**: Manually paste hexadecimal data for analysis
- **Interactive Mapping**: Leaflet-based offline map visualization
- **Real-time Analytics**: Chart.js dashboards with signal distribution and latitude analysis
- **3D Visualization**: Three.js powered galaxy animation background and Plotly 3D signal view

### Advanced Features
- **Signal Filtering**: Toggle visibility of different signal types
- **CSV Export**: Export parsed coordinates by signal type
- **Analytics Dashboard**: Real-time charts showing:
  - Signal type distribution (pie chart)
  - Signal count by latitude bands (bar chart)
- **Easter Eggs**: Hidden console codes for fun interactions

## 🚀 Quick Start

### Prerequisites
- Python 3.7 or higher
- No internet connection needed (all libraries are local)

### Installation

1. **Unzip the entire project** to your desired location

2. **Navigate to the project directory**:
   ```bash
   cd leafet_geocoords
   ```

3. **Activate the virtual environment**:
   
   **On Windows (PowerShell)**:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   
   **On Windows (Command Prompt)**:
   ```cmd
   venv\Scripts\activate.bat
   ```
   
   **On Linux/Mac**:
   ```bash
   source venv/bin/activate
   ```

4. **Run the application**:
   ```bash
   python app.py
   ```

5. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```

## 📁 Project Structure

```
leafet_geocoords/
├── app.py                      # Flask backend server
├── parsers.py                  # Signal parser classes (SignalAParser, SignalBParser)
├── requirements.txt            # Python dependencies
├── README.md                   # Original README
├── README_OFFLINE.md          # This file - offline setup guide
├── Gemini.md                   # Additional documentation
├── 3D_Dashboard.py            # 3D dashboard utilities
├── signal_a_sample.fbf        # Sample Signal A data file
├── signal_b_sample.fbf        # Sample Signal B data file
│
├── frontend/                   # Frontend web interface
│   ├── index.html             # Main application page
│   ├── about.html             # About page
│   ├── faq.html               # FAQ page
│   ├── script.js              # Application JavaScript logic
│   ├── style.css              # Application styling
│   │
│   └── libs/                  # 📦 OFFLINE LIBRARIES (No CDN needed!)
│       ├── leaflet/
│       │   ├── leaflet.js     # Leaflet 1.9.4 mapping library
│       │   ├── leaflet.css    # Leaflet styles
│       │   └── images/        # Map marker icons
│       │       ├── marker-icon.png
│       │       ├── marker-icon-2x.png
│       │       ├── marker-shadow.png
│       │       ├── layers.png
│       │       └── layers-2x.png
│       │
│       ├── chart/
│       │   └── chart.min.js   # Chart.js 4.4.0 for analytics
│       │
│       ├── plotly/
│       │   └── plotly.min.js  # Plotly.js 2.27.0 for 3D visualization
│       │
│       └── three/
│           └── three.min.js   # Three.js r128 for galaxy animation
│
└── venv/                       # Python virtual environment
    ├── Scripts/ (Windows)
    ├── bin/ (Linux/Mac)
    └── Lib/site-packages/
```

## 🔧 How It Works

### Backend (Python/Flask)

1. **app.py**: Main Flask application that:
   - Serves static frontend files
   - Provides `/process_file` endpoint for binary file uploads
   - Provides `/process_hex` endpoint for hex string input
   - Routes to About and FAQ pages

2. **parsers.py**: Parser architecture with:
   - `SignalParser`: Abstract base class
   - `SignalAParser`: Parses Signal A format (sync word: 0x2020)
     - Little-endian signed integers
     - Scaling factor: 1/100000
   - `SignalBParser`: Parses Signal B format (sync word: 0x2021)
     - Big-endian floats
     - Direct coordinate values

### Frontend (HTML/CSS/JavaScript)

1. **Splash Screen**: Animated globe with waveform visualization
2. **File Upload**: Process `.sff` and `.fbf` files
3. **Hex Input**: Alternative manual data entry
4. **Interactive Map**: Leaflet-powered map with:
   - Blue markers for Signal A
   - Red markers for Signal B
   - Tooltips and popups with coordinate details
5. **Analytics Dashboard**: Collapsible charts showing signal statistics
6. **3D View**: Plotly-based 3D signal visualization (expandable)

## 📊 Signal Formats

### Signal A (Sync Word: 0x2020)
- **Chunk Size**: 16 bytes
- **Format**: Little-endian signed integers
- **Structure**:
  - Bytes 0-1: Sync word (0x2020)
  - Bytes 2-7: Reserved/metadata
  - Bytes 8-11: Latitude (signed int)
  - Bytes 12-15: Longitude (signed int)
- **Scaling**: Divide by 100,000 to get decimal degrees

### Signal B (Sync Word: 0x2021)
- **Chunk Size**: 16 bytes
- **Format**: Big-endian floats
- **Structure**:
  - Bytes 0-1: Sync word (0x2021)
  - Bytes 2-5: Reserved/metadata
  - Bytes 6-9: Longitude (float)
  - Bytes 10-13: Latitude (float)
  - Bytes 14-15: Reserved
- **Scaling**: Direct float values (no conversion needed)

## 🎮 Easter Eggs

Try these keyboard sequences:
- **Konami Code**: ↑ ↑ ↓ ↓ ← → ← → B A
- **God Mode**: I D D Q D

## 📤 Export Options

### CSV Export
Click "Export as CSV" to download separate CSV files for each signal type:
- `signal_A_data.csv`
- `signal_B_data.csv`

Format: `Latitude,Longitude` (one coordinate per line)

## 🛠️ Troubleshooting

### Application won't start
- Ensure Python 3.7+ is installed: `python --version`
- Verify virtual environment is activated (you should see `(venv)` in your terminal)
- Check if port 5000 is available

### Map doesn't display
- Ensure `frontend/libs/` folder exists with all libraries
- Check browser console (F12) for JavaScript errors
- Verify all `.js` and `.css` files are present in `frontend/libs/`

### Files won't process
- Verify file format is `.sff` or `.fbf`
- Check that chunks are 16 bytes aligned
- Ensure sync words (0x2020 or 0x2021) are present

### Charts not showing
- Verify `chart.min.js` is loaded (check browser console)
- Ensure data has been processed successfully

## 🔒 Security Notes

- This application is designed for **offline/air-gapped environments**
- No external network requests after initial library downloads
- All processing happens locally in your browser and Python backend
- No data is transmitted externally

## 📝 Usage Examples

### Example 1: Upload a File
1. Click "Choose File" under "Option 1: Upload File"
2. Select a `.fbf` or `.sff` file (e.g., `signal_a_sample.fbf`)
3. Click "Process File"
4. View results on the map and in the analytics dashboard

### Example 2: Paste Hex Data
1. Copy hexadecimal signal data
2. Paste into the text area under "Option 2: Paste Hex Data"
3. Click "Process Hex"
4. Results will appear on the map

### Example 3: Filter Signals
1. After processing mixed signal data (A + B)
2. Use checkboxes under "Filter Layers" to show/hide signal types
3. Analyze specific signal patterns

### Example 4: Export Data
1. Process signal files
2. Click "Export as CSV"
3. Separate CSV files will download for each signal type
4. Open in Excel, QGIS, or other GIS tools

## 🌐 Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari (macOS)
- ⚠️ Internet Explorer (not recommended)

## 📦 Zipping for Transfer

To package this for transfer to another offline computer:

**Windows (PowerShell)**:
```powershell
Compress-Archive -Path leafet_geocoords -DestinationPath GeoSignalParser_Offline.zip
```

**Linux/Mac**:
```bash
zip -r GeoSignalParser_Offline.zip leafet_geocoords/
```

## 🚧 Known Limitations

1. **Map Tiles**: Currently requires local tile server or tiles directory
   - For fully offline maps, ensure `frontend/tiles/` contains pre-downloaded map tiles
   - Alternative: The map will show a gray background but markers will still work

2. **3D Dashboard**: Requires Plotly initialization (currently has placeholder)

3. **File Size**: Large signal files (>10MB) may take longer to process

## 🔮 Future Enhancements

- ✨ Add more signal type parsers
- 🗺️ Include offline map tiles package
- 📊 Enhanced 3D visualization controls
- 🔍 Advanced pattern recognition algorithms
- 📱 Mobile-responsive design improvements
- 💾 Local storage for session history

## 📧 Support

For issues or questions:
- Check the FAQ page in the application
- Review this README
- Examine the console output for error messages

## 📄 License

This project is for educational and analytical purposes.

---

**Version**: 1.0 Offline Edition  
**Last Updated**: October 2025  
**Python Version**: 3.7+  
**Status**: ✅ Fully Offline Capable

