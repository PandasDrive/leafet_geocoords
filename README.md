# GeoSignal Parser

A tool for extracting, identifying, and mapping geolocation coordinates from raw binary signal data.

This application provides a user interface to parse geolocation data from proprietary binary files (`.fbf`, `.sff`) or raw hexadecimal input. It automatically identifies the signal structure, extracts the latitude and longitude coordinates, and offers options to export the data as a CSV file or visualize it on an interactive map.

---

## Features

✔️ **Flexible Input:** Accepts data by either uploading `.fbf` / `.sff` files or by pasting raw HEX data directly into a text area.

➡️ **Automatic Signal Identification:** Analyzes the input data to automatically determine the signal type from a library of known binary formats.

📍 **Coordinate Extraction:** Once the signal is identified, the tool uses the correct bit-level parser to accurately extract latitude and longitude coordinates.

📄 **CSV Export:** Provides a one-click option to download all extracted coordinates into a clean, easy-to-use `.csv` file.

🗺️ **Interactive Mapping:** Plots all extracted data points onto an interactive Leaflet map, providing instant geographical visualization of the signal data.

---

## Workflow

The data flows through the application in a simple, powerful sequence:

`[Hex Input / .fbf File]` → `[Signal Identification Engine]` → `[Specific Coordinate Parser]` → `[Extracted Lat/Lon Data]` → `[CSV Output OR Leaflet Map]`

---

## Technologies Used

* **Backend:** **Python** with **Flask** for serving the data processing logic and API.
* **Frontend:** **HTML**, **CSS**, and vanilla **JavaScript** for the user interface.
* **Mapping Library:** **Leaflet.js** for interactive map visualization.
* **Base Map:** **OpenStreetMap** provides the map tiles.

---

## Setup and Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/geosignal-parser.git](https://github.com/your-username/geosignal-parser.git)
    cd geosignal-parser
    ```
2.  **Create and activate a Python virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```
3.  **Install the required Python packages:**
    ```bash
    pip install -r requirements.txt
    ```

---

## Usage

1.  **Start the Backend Server:**
    Run the main Python application from the root directory. This will start a local Flask server.
    ```bash
    python app.py
    ```
2.  **Open the Frontend:**
    In your web browser, open the `index.html` file located in the `frontend` directory.

3.  **Input Your Data:**
    * **Option A:** Copy your hexadecimal data string and paste it into the large text area.
    * **Option B:** Click the "Upload File" button and select the `.fbf` or `.sff` file from your computer.

4.  **Process and View:**
    * Click the **"Process Data"** button. The backend will identify the signal and extract the coordinates.
    * Click **"Plot on Map"** to see the points rendered on the Leaflet map.
    * Click **"Export to CSV"** to download a `coordinates.csv` file with the results.

---

## How It Works

### Signal Identification

The core of the backend is the signal identification engine. It maintains a library of "signal profiles," which define the unique headers, sync words, or byte patterns for each supported signal type. When data is submitted, the engine compares the input against these profiles to find a match.

### Data Parsing

Once a signal profile is matched, the application invokes the specific parser associated with that profile. Each parser knows the exact bit offsets and data types (e.g., unsigned integer, float) for the latitude and longitude values within that signal's data structure. This modular approach allows for easy expansion to support new signal formats in the future.

---

## Future Improvements

* Support for more signal types and file formats.
* Add filtering and data querying options to the map.
* Implement a drag-and-drop interface for file uploads.
* Display additional metadata from the signal (e.g., timestamp, altitude) in the map popups.

# EXAMPLE: 2020000000000000205216001e338fff20210000000042f9e418424e07ae2020000000000000803d3e0028eb8eff202100000000bd8f5c29424e6a7f2020000000000000e0c86500d2a28eff202100000000be3d70a442506148202000000000000040548d007cb98eff202100000000be8f5c2942525c292020000000000000a0dfb40026818eff202100000000bed1eb854254570a2020000000000000006bda00d0a88eff202100000000bf0f5c29425651eb202000000000000060f601017ad08eff202100000000bf2f5c2942584cca2020000000000000c081290124f88eff