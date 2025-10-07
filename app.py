import struct
from flask import Flask, request, jsonify, send_from_directory
import os
from parsers import SignalAParser, SignalBParser

app = Flask(__name__, static_folder='frontend', static_url_path='')

# A "factory" or registry of parsers
PARSERS = {
    0x2020: SignalAParser(),
    0x2021: SignalBParser(),
}

def parse_binary_data(data):
    """Parses a byte string for signal data and returns a list of coordinates."""
    coordinates = []
    # Process the file in 16-byte chunks
    for i in range(0, len(data), 16):
        chunk = data[i:i+16]
        if len(chunk) < 16:
            continue # Skip incomplete chunks

        # Read the sync word (first 2 bytes, big-endian)
        sync_word = struct.unpack('>H', chunk[0:2])[0]

        # Find the appropriate parser for the sync word
        parser = PARSERS.get(sync_word)
        
        if parser:
            try:
                parsed_data = parser.parse(chunk)
                coordinates.append(parsed_data)
            except (struct.error, IndexError):
                # Handle cases where a chunk might be malformed for its type
                print(f"Skipping malformed chunk for sync word {hex(sync_word)}")
                continue
        else:
            # Handle unknown signal type
            print(f"Unknown signal type with sync word: {hex(sync_word)}")

    return coordinates

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/tiles/<int:z>/<int:x>/<int:y>.png')
def serve_tile(z, x, y):
    """Serve map tiles from the local 'tiles' directory."""
    # The 'tiles' directory should be inside the 'frontend' directory.
    tile_path = os.path.join(app.static_folder, 'tiles', str(z), str(x))
    return send_from_directory(tile_path, f'{y}.png')

@app.route('/process_file', methods=['POST'])
def process_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        file_content = file.read()
        coordinates = parse_binary_data(file_content)

        if not coordinates:
            return jsonify({"error": "No valid data points found in the file."}), 400

        return jsonify(coordinates)

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/process_hex', methods=['POST'])
def process_hex():
    hex_string = request.form.get('hex_data')
    if not hex_string:
        return jsonify({"error": "No hex data provided."}), 400

    try:
        # Clean up the hex string (remove spaces, newlines, etc.)
        hex_string = ''.join(hex_string.split())
        # Convert hex string to bytes
        byte_data = bytes.fromhex(hex_string)
        
        coordinates = parse_binary_data(byte_data)

        if not coordinates:
            return jsonify({"error": "No valid data points found in the hex string."}), 400

        return jsonify(coordinates)
    except ValueError:
        return jsonify({"error": "Invalid hex string format."}), 400
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)