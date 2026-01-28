import serial
import json
import time
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# UART configuration
# On RPi Zero 2 W, /dev/serial0 usually points to the primary UART (GPIO 14/15)
# Ensure 'dtoverlay=disable-bt' or 'dtoverlay=miniuart-bt' is in /boot/config.txt 
# if you want to use the high-performance PL011 UART on these pins.
SERIAL_PORT = '/dev/serial0' 
BAUD_RATE = 115200

try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=0.1)
    print(f"UART initialized on {SERIAL_PORT}")
except Exception as e:
    print(f"Error opening serial port: {e}")
    ser = None

@app.route('/waypoint', methods=['POST'])
def send_waypoint():
    if not ser:
        return jsonify({"error": "Serial port not available"}), 500
    
    data = request.json
    # Send as JSON string for easier parsing on ESP32
    message = json.dumps(data) + "\n"
    
    try:
        ser.write(message.encode('utf-8'))
        print(f"Sent: {message.strip()}")
        return jsonify({"status": "sent", "data": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/status', methods=['GET'])
def get_status():
    if not ser:
        return jsonify({"error": "Serial port not available"}), 500
        
    response = {"reached": False, "last_msg": None}
    
    if ser.in_waiting > 0:
        line = ser.readline().decode('utf-8', errors='ignore').strip()
        print(f"Received from ESP32: {line}")
        if "REACHED" in line:
            response["reached"] = True
            response["last_msg"] = line
            
    return jsonify(response), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
