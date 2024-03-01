import importlib
from subprocess import call

def check_install_dependency(module_name):
    try:
        importlib.import_module(module_name)
    except ImportError:
        print(f"{module_name} not found. Installing...")
        call(["pip", "install", module_name])

# Check and install dependencies
check_install_dependency("pymongo")
check_install_dependency("flask")
check_install_dependency("flask_cors")

# Import the modules after checking/installing dependencies
import pymongo
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

try:
    # Connect to MongoDB
    client = pymongo.MongoClient("mongodb://localhost:27017/")

    # Access a specific database (EventVista in our case)
    my_database = client["EventVista"]

    # Access a specific collection within the database (Users in our case)
    users = my_database["Users"]

    @app.route('/api/get_data', methods=['GET'])
    def get_data():
        try:
            # Fetch data from the MongoDB collection
            user_data = users.find()
            user_list = []
            
            for data in user_data:
                data['_id'] = str(data['_id'])
                user_list.append(data)
            
            return jsonify(user_list)
        except Exception as e:
            return jsonify({"error": "Error Fetching data from MongoDB server"}), 500
        
    @app.route('/api/send_data', methods=['POST'])
    def send_data():
        try:
            data = request.json
            inserted_document = users.insert_one(data)
            return jsonify({"message": "Data inserted successfully"}), 200
        
        except Exception as e:
            return jsonify({"error": "Error sending data to MongoDB server"}), 500
        
    @app.route('/api/login', methods=['POST'])
    def login():
        try:
            data=request.json
            email = data.get('email')
            password = data.get('password')
            
             # Check if email and password are provided
            if not email or not password:
                return jsonify({"error": "Email and password are required"}), 400
            # Query the database to find a user with the provided email
            user = users.find_one({"email": email})

            # If no user found with the provided email
            if not user:
                return jsonify({"error": "User not found"}), 404

            # Compare the provided password with the stored password hash
            if user.get('password') == password:
                return jsonify({"message": "Login successful"}), 200
            else:
                return jsonify({"error": "Incorrect password"}), 401

        except Exception as e:
            return jsonify({"error": "Error processing login request"}), 500

    if __name__ == '__main__':
        app.run(debug=True,port=5000)

except Exception as e:
    print("Error in connecting to Database on MongoDB", e)
