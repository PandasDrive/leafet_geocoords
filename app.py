import struct
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='frontend', static_url_path='')

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/process_data', methods=['POST'])
def process_data():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        file_content = file.read()

        # 1. Check for 0x2020 sync word in the first 2 bytes
        if len(file_content) < 16:
            return jsonify({"error": "File is too small to contain valid data."}), 400

        sync_word = struct.unpack('<H', file_content[0:2])[0] # Unpack as little-endian unsigned short
        if sync_word != 0x2020:
            return jsonify({"error": f"Invalid sync word. Expected 0x2020, got {hex(sync_word)}"}), 400

        # 2. Extract Latitude (bytes 8-11) and Longitude (bytes 12-15)
        # Interpret as little-endian signed integer
        lat_int = struct.unpack('<i', file_content[8:12])[0]
        lon_int = struct.unpack('<i', file_content[12:16])[0]

        # 3. Apply fixed floating point of 5
        lat_float = lat_int / 100000.0
        lon_float = lon_int / 100000.0

        return jsonify({
            "latitude": lat_float,
            "longitude": lon_float
        })

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
