import json
import os
from datetime import datetime

# Path to the kasidas.json file
kasidas_json_path = "kasidas.json"

# Function to load existing kasidas from the JSON file
def load_kasidas():
    if os.path.exists(kasidas_json_path):
        with open(kasidas_json_path, "r") as file:
            return json.load(file)
    return []

# Function to save the updated kasidas list to the JSON file
def save_kasidas(kasidas):
    with open(kasidas_json_path, "w") as file:
        json.dump(kasidas, file, indent=4)

# Function to add a new kasida
def add_kasida():
    # Load existing kasidas
    kasidas = load_kasidas()

    # Generate a new ID based on the last kasida
    new_id = kasidas[-1]["id"] + 1 if kasidas else 1

    # Collect input for the new kasida
    title = input("Enter the Kasida title: ")
    thumbnail = input("Enter the path to the thumbnail image: ")
    lyrics = input("Enter the Kasida lyrics: ")
    publish_date = input("Enter the publish date (YYYY-MM-DD): ")
    author = input("Enter the author name: ")
    youtube_link = input("Enter the YouTube link: ")

    # Validate the publish date format (YYYY-MM-DD)
    try:
        datetime.strptime(publish_date, "%Y-%m-%d")
    except ValueError:
        print("Invalid date format! Please use YYYY-MM-DD.")
        return

    # Create a new kasida entry
    new_kasida = {
        "id": new_id,
        "name": { "value": title, "filterby": True },
        "thumbnail": { "value": thumbnail, "filterby": False },
        "lyrics": { "value": lyrics, "filterby": False },
        "publishDate": { "value": publish_date, "filterby": True },
        "author": { "value": author, "filterby": True },
        "youtubeLink": { "value": youtube_link, "filterby": False }
    }

    # Append the new kasida to the list
    kasidas.append(new_kasida)

    # Save the updated kasidas list to the JSON file
    save_kasidas(kasidas)

    print(f"Kasida '{title}' has been added successfully!")

# Run the function to add a new kasida
if __name__ == "__main__":
    add_kasida()
