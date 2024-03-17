import importlib
from subprocess import call
from bson import ObjectId  # Import ObjectId for generating unique identifiers
from bson.binary import Binary
from flask import Flask, jsonify, request, make_response, send_file
from flask_cors import CORS
from gridfs import GridFS
from pymongo import MongoClient
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib

app = Flask(__name__)
CORS(app)

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
    client = MongoClient("mongodb://localhost:27017/")

    # Access a specific database (EventVista in our case)
    my_database = client["EventVista"]

    # Access a specific collection within the database
    users = my_database["Users"]
    events = my_database["Events"]

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
                return jsonify({"message": "Login successful", "role": user.get('role'), "Organizer_ID": user.get('organizer_id'), "Organizer_Name": user.get('name')}), 200
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

            fs = GridFS(my_database)  # Initialize GridFS
            
            # Save event images as binary data in GridFS
            images = request.files.getlist('image')
            image_ids = []
            for i, image_file in enumerate(images):
                image_data = Binary(image_file.read())
                fs.put(image_data, filename=f'Image_{event_id}_{i}')  # Store image in GridFS
                image_ids.append(str(fs.find_one({"filename": f'Image_{event_id}_{i}'}).id))  # Store ID
            
            # Save poster image as binary data
            poster_file = request.files.get('poster')
            if poster_file:
                poster_data = Binary(poster_file.read())
                data['poster'] = poster_data

            # Save other event details to the database
            data['_id'] = event_id
            data['event_id'] = event_id
            data['images'] = image_ids  # Store image IDs in the event document
            
            events.insert_one(data)

            return jsonify({"message": "Event added successfully", "event_id": event_id}), 200
        except Exception as e:
            return jsonify({"error": "Error adding event"}), 500


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
            organizer_id = request.args.get('organizer_id')
            # Fetch all events from the MongoDB collection
            event_data = events.find({'organizer_id': organizer_id})
            event_list = []
            
            for data in event_data:
                data['_id'] = str(data['_id'])
                
                if 'poster' in data:
                    data['poster'] = str(data['poster'])
                    
                if 'images' in data:
                    data['images'] = [str(image_id) for image_id in data['images']]
                        
                event_list.append(data)
            
            return jsonify(event_list)
        except Exception as e:
            print(e)
            return jsonify({"error": "Error Fetching events from MongoDB server"}), 500
        
    @app.route('/api/update_event/<event_id>', methods=['PUT'])  # Route for updating events
    def update_event(event_id):
        try:
            # Retrieve form data including images
            data = request.form.to_dict()

            fs = GridFS(my_database)  # Initialize GridFS

            # Save poster image as binary data
            poster_file = request.files.get('poster')
            if poster_file:
                poster_data = Binary(poster_file.read())
                data['poster'] = poster_data
                
            # Update event images if provided
            if 'image' in request.files:
                # Retrieve the list of new images
                new_images = request.files.getlist('image')
                
                image_ids = []
                for i, image_file in enumerate(new_images):
                    image_data = Binary(image_file.read())
                    fs.put(image_data, filename=f'Image_{event_id}_{i}')  # Store image in GridFS
                    image_ids.append(str(fs.find_one({"filename": f'Image_{event_id}_{i}'}).id))  # Store ID
                    
                data['images'] = image_ids  # Update image IDs in the event document

            # Update the event details in the database
            result = events.update_one({"event_id": event_id}, {"$set": data})
            if result.modified_count > 0:
                return jsonify({"message": "Event updated successfully"}), 200
            else:
                return jsonify({"error": "Event not found"}), 404
        except Exception as e:
            return jsonify({"error": "Error updating event"}), 500

    @app.route('/api/get_event_poster/<event_id>', methods=['GET'])
    def get_event_poster(event_id):
        try:
            # Query the MongoDB collection to get the document containing the event
            event = events.find_one({"event_id": event_id})

            if not event:
                return jsonify({"error": "Event not found"}), 404

            # Check if the event has a poster
            if 'poster' not in event:
                return jsonify({"error": "Poster not found for this event"}), 404

            # Retrieve the poster data from the database
            poster_data = event['poster']

            # Create a response containing the poster data
            response = make_response(poster_data)
            response.headers.set('Content-Type', 'image/jpeg')
            return response
        except Exception as e:
            return jsonify({"error": "Error retrieving event poster"}), 500

    @app.route('/api/get_event_image/<event_id>/<image_index>', methods=['GET'])
    def get_event_image(event_id, image_index):
        try:
            # Query the MongoDB collection to get the document containing the event
            event = events.find_one({"event_id": event_id})

            if not event:
                return jsonify({"error": "Event not found"}), 404

            # Check if the event has images
            if 'images' not in event:
                return jsonify({"error": "Images not found for this event"}), 404

            image_index = int(image_index)
            images = event['images']

            if image_index >= len(images):
                return jsonify({"error": "Image not found"}), 404

            fs = GridFS(my_database)  # Initialize GridFS

            # Retrieve the image from GridFS using the image ID
            image_id = images[image_index]
            image = fs.get(ObjectId(image_id))

            # Return the image file
            return send_file(image, mimetype='image/jpeg')
        except Exception as e:
            return jsonify({"error": "Error retrieving event image"}), 500
    
    @app.route('/api/get_attendee_events', methods=['GET'])
    def get_attendee_events():
        try:
            event_data = events.find()
            event_list = []

            for event in event_data:
                # Convert MongoDB document to dictionary
                event_dict = {}
                for key, value in event.items():
                    if isinstance(value, ObjectId):
                        event_dict[key] = str(value)  # Convert ObjectId to string
                    elif isinstance(value, bytes):
                        continue  # Exclude binary data
                    else:
                        event_dict[key] = value
                event_list.append(event_dict)

            return jsonify(event_list)
        except Exception as e:
            print("Error:", e)
            return jsonify({"error": "Error fetching event data from MongoDB"}), 500

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