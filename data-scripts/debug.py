import json

def main():
    with open("offline_data.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print("--- RAW LISTING SAMPLE ---")
    print(json.dumps(data["listings"][0], indent=2))
    
    print("\n--- RAW RENTAL SAMPLE ---")
    print(json.dumps(data["rentals"][0], indent=2))
    
    print("\n--- RAW PROJECT SAMPLE ---")
    print(json.dumps(data["projects"][0], indent=2))

if __name__ == "__main__":
    main()