import importlib
from subprocess import call
from bson import ObjectId  # Import ObjectId for generating unique identifiers
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import pymongo
from werkzeug.utils import secure_filename
from gridfs import GridFS
from pymongo import MongoClient
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib

app = Flask(__name__)
CORS(app)

# Configure upload folder
app.config['UPLOAD_FOLDER'] = 'uploads'

# Check and install dependencies
def check_install_dependency(module_name):
    try:
        importlib.import_module(module_name)
    except ImportError:
        print(f"{module_name} not found. Installing...")
        call(["pip", "install", module_name])

check_install_dependency("pymongo")
check_install_dependency("flask")
check_install_dependency("flask_cors")

try:
    # Connect to MongoDB
    client = pymongo.MongoClient("mongodb://localhost:27017/")

    # Access a specific database (EventVista in our case)
    my_database = client["EventVista"]

    # Access a specific collection within the database (Users in our case)
    users = my_database["Users"]
    events = my_database["Events"]  # Add a collection for storing events

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
                return jsonify({"message": "Login successful", "role": user.get('role')}), 200
            else:
                return jsonify({"error": "Incorrect password"}), 401

        except Exception as e:
            return jsonify({"error": "Error processing login request"}), 500

    @app.route('/api/forgot_password', methods=['POST'])
    def forgot_password():
        try:
            data = request.json
            email = data.get('email')
            password = 'Password@123'
            body = f'Password is {password}'
            filter = {'email': email}  # Fix syntax error here
            update = {'$set': {'password': password}}
            result = users.update_one(filter, update)
            if result.modified_count > 0:
                send_email(body, email)  # Pass recipient's email address here
                return jsonify({"message": "Password reset successful. Check your email."}), 200
            else:
                return jsonify({"error": "User not found"}), 404
        except Exception as e:
            return jsonify({"error": "Error resetting password"}), 500
    
    @app.route('/api/add_event', methods=['POST'])
    def add_event():
        try:
            # Retrieve form data including images
            data = request.form.to_dict()
            event_id = str(ObjectId())

            # Save images to GridFS
            grid_fs = GridFS(my_database)
            image_ids = []
            for i, image_file in enumerate(request.files.getlist('image')):
                image_id = grid_fs.put(image_file, filename=f'{event_id}_image_{i}.jpg')
                image_ids.append(image_id)

            # Save poster image
            poster_file = request.files.get('poster')
            if poster_file:
                poster_id = grid_fs.put(poster_file, filename=f'{event_id}_poster.jpg')
                data['poster'] = poster_id

            # Save other event details to the database
            data['event_id'] = event_id
            data['images'] = image_ids
            events.insert_one(data)

            return jsonify({"message": "Event added successfully", "event_id": event_id}), 200
        except Exception as e:
            return jsonify({"error": "Error adding event"}), 500

    @app.route('/api/update_event/<event_id>', methods=['PUT'])  # Route for updating events
    def update_event(event_id):
        try:
            data = request.json
            # Update the event details in the database
            result = events.update_one({"event_id": event_id}, {"$set": data})
            if result.modified_count > 0:
                return jsonify({"message": "Event updated successfully"}), 200
            else:
                return jsonify({"error": "Event not found"}), 404
        except Exception as e:
            return jsonify({"error": "Error updating event"}), 500

    @app.route('/api/delete_event/<event_id>', methods=['DELETE'])  # Route for deleting events
    def delete_event(event_id):
        try:
            # Delete the event from the database
            result = events.delete_one({"event_id": event_id})
            if result.deleted_count > 0:
                return jsonify({"message": "Event deleted successfully"}), 200
            else:
                return jsonify({"error": "Event not found"}), 404
        except Exception as e:
            return jsonify({"error": "Error deleting event"}), 500
        
    @app.route('/api/get_events', methods=['GET'])
    def get_events():
        try:
            # Fetch all events from the MongoDB collection
            event_data = events.find()
            event_list = []
            
            for data in event_data:
                data['_id'] = str(data['_id'])
                event_list.append(data)
            
            return jsonify(event_list)
        except Exception as e:
            return jsonify({"error": "Error Fetching events from MongoDB server"}), 500


    def send_email(body, to_email):
        from_email = 'python.project.smtp@gmail.com'
        password = 'wimgovktbckwfnkx'
        
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = 'Here is your temporary password'

        msg.attach(MIMEText(body, 'plain'))

        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(from_email, password)
            text = msg.as_string()
            server.sendmail(from_email, to_email, text)
            server.quit()
        
        except:
            return None

                
    if __name__ == '__main__':
        app.run(debug=True,port=5000)

except Exception as e:
    print("Error in connecting to Database on MongoDB", e)
