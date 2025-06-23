import io
import os
import traceback
from flask import Flask, request, send_file, jsonify
from PIL import Image
from stegano import lsb, exifHeader

app = Flask(__name__)

ALLOWED_EXTENSIONS = {'png', 'jpeg', 'jpg', 'tiff', 'jfif', 'pjp', 'pjep','tif'}

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

        # Encode based on extension
        if ext in ['png', 'tiff', 'tif']:
            if image.mode != 'RGB':
                image = image.convert('RGB')

            try:
                secret_image = lsb.hide(image, message)
                buffer = io.BytesIO()
                format_used = 'TIFF' if ext == 'tiff' else 'PNG'
                mimetype = 'image/tiff' if ext == 'tiff' else 'image/png'
                download_name = f"encoded_image.{ext}"

                secret_image.save(buffer, format=format_used)
                buffer.seek(0)

                return send_file(buffer, mimetype=mimetype, as_attachment=True, download_name=download_name)
            except ValueError:
                return jsonify({"error": "Message is too long to be hidden in this image."}), 400
            except Exception as e:
                traceback.print_exc()
                return jsonify({"error": f"Failed to encode message: {e}"}), 500

        elif ext in ['jpg', 'jpeg','jfif', 'pjp', 'pjep']:
            try:
                # Save input to disk temporarily because exifHeader requires a path
                temp_input_path = f"/tmp/input_image.{ext}"
                temp_output_path = f"/tmp/output_image.{ext}"
                file.stream.seek(0)
                with open(temp_input_path, 'wb') as f:
                    f.write(file.read())
                print(temp_input_path,temp_output_path)

                exifHeader.hide(temp_input_path, temp_output_path, secret_message=message)

                return send_file(
                    temp_output_path,
                    mimetype='image/jpeg',
                    as_attachment=True,
                    download_name=f"encoded_image.{ext}"
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


@app.route("/api/hello")
def hello_world():
    return {"message": "Hello from your Python backend!"}


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)
