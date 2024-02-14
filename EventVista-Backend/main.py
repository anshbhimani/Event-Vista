import pymongo

client = pymongo.MongoClient("mongodb://localhost:27017/")

# Access a specific database (EventVista in our case)
my_database = client["EventVista"]

# Access a specific collection within the database (Users in our case)
users = my_database["Users"]

data = {"name": "John", "age": 30, "city": "New York"}
# inserted_document = users.insert_one(data)
# print("Inserted document ID:", inserted_document.inserted_id)

# delete_document = users.delete_one(data)
# print("Deleted Document id:" + str(delete_document))