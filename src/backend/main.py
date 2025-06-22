from flask import Flask, request

# Initialize the Flask app
app = Flask(__name__)

# This is a sample route. You can add your own routes and logic here.
# For example, to handle a POST request to /api/process:
# @app.route("/api/process", methods=["POST"])
# def process_data():
#     data = request.json
#     # ... your Python logic here ...
#     return {"status": "success", "processed_data": data}

@app.route("/api/hello")
def hello_world():
    """A sample endpoint to verify the backend is running."""
    return {"message": "Hello from your Python backend!"}

# This part is for local development and is ignored by App Hosting.
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)
