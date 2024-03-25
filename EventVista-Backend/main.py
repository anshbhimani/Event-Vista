import importlib
from subprocess import call
from bson import ObjectId  # Import ObjectId for generating unique identifiers
from bson.binary import Binary
from flask import Flask, jsonify, request, make_response, stream_with_context,Response
from flask_cors import CORS
from pymongo import MongoClient
from gridfs import GridFS
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
    fs = GridFS(my_database)  # Initialize GridFS
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
            user_id = str(ObjectId())
            data = request.json
            if data['role'] == 'Organizer':
                data['organizer_id'] = user_id
                
            elif data['role'] == 'Attendant':
                data['attendant_id'] = user_id
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
                print("User Not Found!!")
                return jsonify({"error": "User not found"}), 404

            # Compare the provided password with the stored password hash
            if user.get('password') == password:
                if user.get('role') == 'Organizer':
                    return jsonify({"message": "Login successful", "role": user.get('role'), "Organizer_ID": user.get('organizer_id'), "Organizer_Name": user.get('name')}), 200
                elif user.get('role') == 'Attendant':
                    return jsonify({"message": "Login successful", "role": user.get('role'), "Attendant_ID": user.get('attendant_id'), "Attendant_Name": user.get('name')}), 200
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
            poster_id = str(ObjectId())
            event_images = []
            
            # Save event images as binary data in GridFS
            images = request.files.getlist('image')
            if images:
                print("Found images!!")
                for image in images:
                    image_id = fs.put(image, filename=image.filename)
                    event_images.append(image_id)
                    
            # Convert ObjectId objects to string representation
            event_images_str = [str(image_id) for image_id in event_images]
            
            # Save event_images to data dictionary
            data['event_images'] = event_images_str
                    
            # Save poster image as binary data
            poster_file = request.files.get('poster')
            if poster_file:
                print("Found Poster")
                poster_id = fs.put(poster_file.read(), filename="poster.jpg")
                data['poster'] = str(poster_id)

            # Save other event details to the database
            data['_id'] = event_id
            data['event_id'] = event_id
            
            events.insert_one(data)

            return jsonify({"message": "Event added successfully", "event_id": event_id}), 200
        except Exception as e:
            return jsonify({"error": "Error adding event"}), 500


    @app.route('/api/delete_event/<event_id>', methods=['DELETE'])  # Route for deleting events
    def delete_event(event_id):
        try:
             # Retrieve the event document
            event = events.find_one({"event_id": event_id})
            if not event:
                return jsonify({"error": "Event not found"}), 404
            
            if 'poster' in event:
                # Retrieve the poster ID
                poster_id = event['poster']
                # Delete the poster from GridFS
                fs.delete(ObjectId(poster_id))
                
            if 'event_images' in event:
                event_images = event['event_images']
                
                for images in event_images:
                    fs.delete(ObjectId(images))
                
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
                        
                event_list.append(data)
            
            return jsonify(event_list)
        except Exception as e:
            print(e)
            return jsonify({"error": "Error Fetching events from MongoDB server"}), 500
        
    @app.route('/api/get_admin_events', methods=['GET'])
    def get_admin_events():
        try: 
            admin_id = request.args.get('organizer_id')
            # Fetch all events from the MongoDB collection
            event_data = events.find()
            event_list = []
            
            for data in event_data:
                data['_id'] = str(data['_id'])
                
                if 'poster' in data:
                    data['poster'] = str(data['poster'])
                        
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
            event_images = []
            
            # Save event images as binary data in GridFS
            images = request.files.getlist('image')
            for image in images:
                image_id = fs.put(image, filename=image.filename)
                event_images.append(image_id)
                
            # Convert event_images to list of strings (IDs)
            data['event_images'] = [str(image_id) for image_id in event_images]

            # Save poster image as binary data
            poster_file = request.files.get('poster')
            if poster_file:
                poster_id = data['poster']
                # Delete the poster from GridFS
                fs.delete(ObjectId(poster_id))
                print("Found Poster")
                poster_id = fs.put(poster_file.read(), filename="poster.jpg")
                data['poster'] = str(poster_id)            

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
            # poster_data = event['poster']
            
            # Retrieve the poster ID from the event data
            poster_id = event['poster']

            # Retrieve the poster data from GridFS using the poster ID
            poster_file = fs.get(ObjectId(poster_id))

            # Create a response containing the poster data
            response = make_response(poster_file.read())

            response.headers.set('Content-Type', 'image/jpeg')
            return response
        except Exception as e:
            return jsonify({"error": "Error retrieving event poster"}), 500

    @app.route('/api/get_event_image_count/<event_id>',methods=['GET'])
    def get_number_of_event_images(event_id):
        try:
            event = events.find_one({"event_id": event_id})

            if not event:
                return jsonify({"error": "Event not found"}), 404

            event_images = event.get('event_images', [])
            image_count = len(event_images)

            return jsonify(image_count), 200
        except Exception as e:
            return jsonify({"error": "Error retrieving event image count"}), 500
            
    @app.route('/api/get_event_image/<event_id>/<int:image_index>', methods=['GET'])
    def get_event_image(event_id,image_index):
        try:
            # Query the MongoDB collection to get the document containing the event
            event = events.find_one({"event_id": event_id})

            if not event:
                return jsonify({"error": "Event not found"}), 404

            event_images = event.get('event_images',[])
            
            if not event_images:
                return jsonify({"error": "No images found for this event"}), 404
                
            event_images = event.get('event_images', [])
        
            if not event_images or image_index >= len(event_images):
                return jsonify({"error": "Image not found for this event"}), 404

            image_id = event_images[image_index]
            # Retrieve the image data from GridFS using the image ID
            image_file = fs.get(ObjectId(image_id))
            image_data = image_file.read()
            return Response(image_data, mimetype='image/jpeg')
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

    @app.route('/api/send_interested/<event_id>/<toggle>', methods=['POST'])
    def send_interested(event_id, toggle):
        try:
            # converting the toggle variable to bool
            toggle = toggle.lower() == 'true'
            data = request.json
            attendeeId = data.get('attendeeId', '')

            event = events.find_one({"event_id": event_id})

            if not event:
                return jsonify({"error": "Event not found"}), 404

            interested_users = event.get('interested_users', [])
            
            if toggle:
                if attendeeId not in interested_users:
                    interested_users.append(attendeeId)
            else:
                if attendeeId in interested_users:
                    interested_users.remove(attendeeId)

            # Update the event with the new interested_users array
            events.update_one({"event_id": event_id}, {"$set": {"interested_users": interested_users}})
            interested_audience = len(interested_users)

            return jsonify({"message": "Successfully updated interested", "interested_audience": interested_audience}), 200
        except Exception as e:
            print("Error in sending interested : ", e.with_traceback)
            return jsonify({"error": f"Error in sending interested data: {e}"}), 500


    @app.route('/api/get_interested/<event_id>', methods=['GET'])
    def get_number_of_interested_audience(event_id):
        try:
            event = events.find_one({"event_id": event_id})

            if not event:
                return jsonify({"error": "Event not found"}), 404

            interested_users = event.get('interested_users', [])
            number_of_interested = len(interested_users)

            return jsonify(number_of_interested)
        except Exception as e:
            print("Error:", e)
            return jsonify({"error": "Error fetching interested audience"}), 500

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