import pymongo
from flask import Flask, jsonify
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

    # # Insert a document into the collection
    # data = {"name": "John", "age": 30, "city": "New York"}
    # inserted_document = users.insert_one(data)
    # print("Inserted document ID:", inserted_document.inserted_id)

except Exception as e:
    print("Error in connecting to Database on MongoDB", e)

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
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    app.run(debug=True,port=5000)
