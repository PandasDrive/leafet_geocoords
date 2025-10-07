import struct
from flask import Flask, request, jsonify, send_from_directory
import os
from parsers import SignalAParser, SignalBParser

app = Flask(__name__, static_folder='frontend', static_url_path='')

# A "factory" or registry of parsers
PARSERS = {
    0x2020: SignalAParser(),
    0x2021: SignalBParser(),
    # To add a new signal type, just add a new entry here
    # e.g., 0x2022: SignalCParser(),
}

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
        coordinates = []
        
        # Process the file in 16-byte chunks
        for i in range(0, len(file_content), 16):
            chunk = file_content[i:i+16]
            if len(chunk) < 16:
                continue # Skip incomplete chunks

            # Read the sync word (first 2 bytes, big-endian)
            sync_word = struct.unpack('>H', chunk[0:2])[0]

            # Find the appropriate parser for the sync word
            parser = PARSERS.get(sync_word)
            
            if parser:
                try:
                    data = parser.parse(chunk)
                    coordinates.append(data)
                except (struct.error, IndexError):
                    # Handle cases where a chunk might be malformed for its type
                    print(f"Skipping malformed chunk for sync word {hex(sync_word)}")
                    continue
            else:
                # Handle unknown signal type
                print(f"Unknown signal type with sync word: {hex(sync_word)}")

        if not coordinates:
            return jsonify({"error": "No valid data points found in the file."}), 400

        return jsonify(coordinates)

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)