import io
import os
import traceback
from flask import Flask, request, send_file, jsonify
from PIL import Image
from stegano import lsb, exifHeader
from text_steganography import TextSteganography

app = Flask(__name__)

ALLOWED_EXTENSIONS = {'png', 'jpeg', 'jpg', 'tiff', 'jfif', 'pjp', 'pjpeg', 'tif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/api/image/encode", methods=["POST"])
def encode_image():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided."}), 400

        file = request.files['image']
        message = request.form.get('message', '')
        filename = file.filename

        if filename == '':
            return jsonify({"error": "No selected file."}), 400
        if not message:
            return jsonify({"error": "No message provided."}), 400

        ext = os.path.splitext(filename)[1].lower().lstrip('.')

        if ext not in ALLOWED_EXTENSIONS:
            return jsonify({"error": "Invalid file type. Please use PNG, JPG, JPEG, or TIFF."}), 400

        # Open the image
        image = Image.open(file.stream)

        # Encode for LSB-compatible formats
        if ext in ['png', 'tiff', 'tif']:
            if image.mode != 'RGB':
                image = image.convert('RGB')

            try:
                secret_image = lsb.hide(image, message)
                buffer = io.BytesIO()
                format_used = 'TIFF' if ext in ['tiff', 'tif'] else 'PNG'
                mimetype = 'image/tiff' if ext in ['tiff', 'tif'] else 'image/png'
                download_name = f"encoded_image.{ext}"

                secret_image.save(buffer, format=format_used)
                buffer.seek(0)

                return send_file(buffer, mimetype=mimetype, as_attachment=True, download_name=download_name)
            except ValueError:
                return jsonify({"error": "Message is too long to be hidden in this image."}), 400
            except Exception as e:
                traceback.print_exc()
                return jsonify({"error": f"Failed to encode message: {e}"}), 500

        # Encode for JPEG-based formats
        elif ext in ['jpg', 'jpeg', 'jfif', 'pjp', 'pjpeg']:
            try:
                # Convert to valid JPEG
                image = image.convert("RGB")
                temp_input_path = "/tmp/input_cleaned.jpg"
                temp_output_path = "/tmp/output_image.jpg"

                image.save(temp_input_path, "JPEG")

                # Embed message using exifHeader
                exifHeader.hide(temp_input_path, temp_output_path, secret_message=message)

                return send_file(
                    temp_output_path,
                    mimetype='image/jpeg',
                    as_attachment=True,
                    download_name="encoded_image.jpg"
                )
            except Exception as e:
                traceback.print_exc()
                return jsonify({"error": f"Failed to encode message in JPEG: {e}"}), 500

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500


@app.route("/api/image/decode", methods=["POST"])
def decode_image():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided."}), 400

        file = request.files['image']
        filename = file.filename

        if filename == '':
            return jsonify({"error": "No selected file."}), 400

        ext = os.path.splitext(filename)[1].lower().lstrip('.')

        if ext not in ALLOWED_EXTENSIONS:
            return jsonify({"error": "Invalid file type. Please use PNG, JPG, JPEG, or TIFF."}), 400

        image = Image.open(file.stream)

        if ext in ['png', 'tiff','tif']:
            try:
                message = lsb.reveal(image)
                if message:
                    return jsonify({"message": message}), 200
                else:
                    return jsonify({"message": None, "error": "No hidden message found in this image."}), 200
            except Exception as e:
                traceback.print_exc()
                return jsonify({"error": f"Failed to decode message: {e}"}), 500

        elif ext in ['jpg', 'jpeg','jfif', 'pjp', 'pjep']:
            try:
                # Save to disk temporarily for exifHeader
                temp_path = f"/tmp/temp_decode_image.{ext}"
                file.stream.seek(0)
                with open(temp_path, 'wb') as f:
                    f.write(file.read())

                message = exifHeader.reveal(temp_path).decode('utf-8')
                if message:
                    return jsonify({"message": message}), 200
                else:
                    return jsonify({"message": None, "error": "No hidden message found in this image."}), 200
            except Exception as e:
                traceback.print_exc()
                return jsonify({"error": f"Failed to decode JPEG message: {e}"}), 500

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500


@app.route("/")
def home():
    """API information endpoint"""
    return jsonify({
        "message": "Text Steganography API - Original Algorithm",
        "version": "1.0",
        "endpoints": {
            "/check-capacity": "POST - Check cover text capacity",
            "/encode": "POST - Encode secret message into cover text",
            "/decode": "POST - Decode hidden message from steganographic text",
            "/info": "GET - Get API usage information"
        }
    })

@app.route('/info', methods=['GET'])
def info():
    """Get information about the API usage"""
    return jsonify({
        "api_name": "Text Steganography API",
        "description": "Hide and reveal secret messages in plain text using zero-width characters",
        "algorithm": "Original steganography algorithm preserved",
        "encoding": {
            "step1": "/check-capacity - Check cover text capacity first",
            "step2": "/encode - Encode secret message into cover text",
            "method": "POST",
            "workflow": "First check capacity, then encode based on returned limits"
        },
        "decoding": {
            "endpoint": "/decode", 
            "method": "POST",
            "required_fields": ["stego_text"],
            "description": "Extracts hidden message from steganographic text"
        },
        "capacity_rule": "Maximum characters = floor(word_count / 6)",
        "supported_characters": "ASCII characters 32-127"
    })

"""Text Steganography"""
steg = TextSteganography()

@app.route('/api/text/check-capacity', methods=['POST'])
def check_capacity():
    """Check cover text capacity - Step 1"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON data provided"
            }), 400
        
        cover_text = data.get('cover_text', '').strip()
        
        if not cover_text:
            return jsonify({
                "success": False,
                "error": "cover_text is required"
            }), 400
        
        # Count words exactly like original
        words = []
        for line in cover_text.split('\n'): 
            words += line.split()
        
        word_count = len(words)
        bt = int(word_count)
        max_display = int(bt/6)
        
        return jsonify({
            # "success": True,
            # "cover_text_length": len(cover_text),
            # "word_count": word_count,
            # "max_characters_display": max_display,
            "actual_max_characters": bt,
            # "message": f"Maximum number of characters that can be inserted: {max_display}",
            # "note": f"Actual encoding capacity: {bt} characters",
            # "next_step": "Use /encode endpoint with secret_message up to the capacity limit"
        }), 200
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500

@app.route('/api/text/encode', methods=['POST'])
def encode():
    """Encode secret message into cover text"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON data provided"
            }), 400
        
        cover_text = data.get('cover_text', '').strip()
        secret_message = data.get('secret_message', '').strip()
        
        if not cover_text:
            return jsonify({
                "success": False,
                "error": "cover_text is required"
            }), 400
        
        if not secret_message:
            return jsonify({
                "success": False,
                "error": "secret_message is required"  
            }), 400
        
        # Perform encoding using original algorithm
        result = steg.encode_message(cover_text, secret_message)
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500

@app.route('/api/text/decode', methods=['POST'])
def decode():
    """Decode hidden message from steganographic text"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON data provided"
            }), 400
        
        stego_text = data.get('stego_text', '').strip()
        
        if not stego_text:
            return jsonify({
                "success": False,
                "error": "stego_text is required"
            }), 400
        
        # Perform decoding using original algorithm
        result = steg.decode_message(stego_text)
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500

"""Audio Steganography"""

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        "success": False,
        "error": "Method not allowed"
    }), 405

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)
