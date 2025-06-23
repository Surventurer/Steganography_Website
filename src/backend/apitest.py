import requests
import json

# API endpoint
BASE_URL = "http://localhost:8080"

def test_check_capacity():
    """Test capacity checking functionality"""
    url = f"{BASE_URL}/api/text/check-capacity"
    
    data = {
        "cover_text": "This is a sample text that will hide our secret message inside it using steganography techniques."
    }
    
    try:
        response = requests.post(url, json=data)
        print("=== CHECK CAPACITY TEST ===")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            capacity_info = response.json()
            return capacity_info
        return None
        
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def test_encode():
    """Test encoding functionality"""
    url = f"{BASE_URL}/api/text/encode"
    
    data = {
        "cover_text": "This is a sample text that will hide our secret message inside it using steganography techniques.",
        "secret_message": "Hello World nic"
    }
    
    try:
        response = requests.post(url, json=data)
        print("=== ENCODE TEST ===")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            return response.json().get('stego_text')
        return None
        
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def test_decode(stego_text):
    """Test decoding functionality"""
    if not stego_text:
        print("No stego text to decode")
        return
        
    url = f"{BASE_URL}/api/text/decode"
    
    data = {
        "stego_text": stego_text
    }
    
    try:
        response = requests.post(url, json=data)
        print("\n=== DECODE TEST ===")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

def test_api_info():
    """Test API info endpoints"""
    try:
        # Test home endpoint
        response = requests.get(f"{BASE_URL}/")
        print("=== API HOME ===")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        # Test info endpoint
        response = requests.get(f"{BASE_URL}/info")
        print("\n=== API INFO ===")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    print("Testing Text Steganography API...")
    print("Make sure the Flask server is running on http://10.88.0.3:8080")
    print("-" * 50)
    
    # Test API info
    test_api_info()
    
    print("\n" + "-" * 50)
    
    # Step 1: Check capacity first
    capacity_info = test_check_capacity()
    
    print("\n" + "-" * 50)
    
    # Step 2: Test encoding
    stego_text = test_encode()
    
    print("\n" + "-" * 50)
    
    # Step 3: Test decoding
    test_decode(stego_text)