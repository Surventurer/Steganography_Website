from flask import Flask, render_template, request, send_file, send_from_directory, url_for
import os
import image

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_file():
    if ('inputImage' or "inputImage1") not in request.files:
        return "No file part"
    

    file = request.files[('inputImage' or "inputImage1")]

    if file.filename == '':
        return "No selected file"
    if file and allowed_file(file.filename):
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        global f
        f=file.filename
        file.save(filename)
        return "File uploaded successfully"
    else:
        return "Invalid file format"
    

@app.route('/', methods=['GET', 'POST'])
def encode():
    if request.method == 'POST':
        input_data = request.form.get('hiddenText')
        upload_file()
        image.encrypt_image("./uploads/"+f,input_data,"./uploads/"+f.split('.')[0]+"_encoded.png")
        print("aaaaaaaa")
        #download_file()
    return render_template('steganography-image.html')
@app.route('/download', methods=['GET', 'POST'])
def download_file():
    file_path = os.path.join('uploads', f.split('.')[0]+ "_encoded.png")
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        return "File not found"
    return render_template('steganography-image.html')

@app.route('/decode', methods=['GET', 'POST'])
def decode():
    print(request.method)
    if request.method == 'POST':
        a=upload_file()
        print(a,f)

@app.route('/home.html')
def home():
    return render_template('home.html')

@app.route('/steganography-image.html')
def steganography_image():
    return render_template('steganography-image.html')

if __name__ == '__main__':
    app.run(debug=True)
