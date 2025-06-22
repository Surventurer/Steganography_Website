import io
import traceback
from flask import Flask, request, send_file, jsonify
from PIL import Image
from stegano import lsb

# Initialize the Flask app
app = Flask(__name__)

ALLOWED_EXTENSIONS = {'png', 'jpeg', 'jpg', 'tiff'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/api/image/encode", methods=["POST"])
def encode_image():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided."}), 400
        
        file = request.files['image']
        message = request.form.get('message', '')

        if file.filename == '':
            return jsonify({"error": "No selected file."}), 400

        if not message:
            return jsonify({"error": "No message provided."}), 400

        if file and allowed_file(file.filename):
            try:
                image = Image.open(file.stream)
                # Convert to RGB if it's not, as RGBA can sometimes cause issues with stegano
                if image.mode != 'RGB':
                    image = image.convert('RGB')
            except Exception as e:
                return jsonify({"error": f"Invalid image file: {e}"}), 400
            
            try:
                secret_image = lsb.hide(image, message)
                
                # Save the image to an in-memory buffer
                buffer = io.BytesIO()
                secret_image.save(buffer, format="PNG")
                buffer.seek(0)
                
                return send_file(
                    buffer,
                    mimetype='image/png',
                    as_attachment=True,
                    download_name='encoded_image.png'
                )
            except ValueError:
                 return jsonify({"error": "Message is too long to be hidden in this image."}), 400
            except Exception as e:
                traceback.print_exc()
                return jsonify({"error": f"Failed to encode message: {e}"}), 500
        else:
            return jsonify({"error": "Invalid file type. Please use PNG, JPG, JPEG, or TIFF."}), 400

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500


@app.route("/api/image/decode", methods=["POST"])
def decode_image():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided."}), 400
            
        file = request.files['image']

        if file.filename == '':
            return jsonify({"error": "No selected file."}), 400
            
        if file and allowed_file(file.filename):
            try:  
                image = Image.open(file.stream)
            except Exception as e:
                return jsonify({"error": f"Invalid image file: {e}"}), 400

            try:
                revealed_message = lsb.reveal(image)
                if revealed_message:
                    return jsonify({"message": revealed_message}), 200
                else:
                    return jsonify({"message": None, "error": "No hidden message found in this image."}), 200
            except Exception as e:
                traceback.print_exc()
                return jsonify({"error": f"Failed to decode image: {e}"}), 500
        else:
            return jsonify({"error": "Invalid file type. Please use PNG, JPG, JPEG, or TIFF."}), 400

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500


@app.route("/api/hello")
def hello_world():
    """A sample endpoint to verify the backend is running."""
    return {"message": "Hello from your Python backend!"}

# This part is for local development and is ignored by App Hosting.
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)
