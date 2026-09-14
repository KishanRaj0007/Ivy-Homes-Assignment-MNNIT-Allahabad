import requests
import json
import time
import math

BASE_URL = "https://solve.ivy.homes"
API_KEY = "IVY26-EAC7A0516D5D"
EMAIL = "demo1@ivy.homes"
PASSWORD = "8317045e1a"

def login():
    """Authenticates and returns the fresh access token."""
    url = f"{BASE_URL}/auth/login"
    payload = {"email": EMAIL, "password": PASSWORD}
    headers = {"X-API-Key": API_KEY}
    
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Login failed: {response.text}")
        
    data = response.json()
    return data.get("access_token", data.get("token"))

def fetch_all(endpoint):
    """Paginates safely by calculating exact pages from the 'total' field."""
    results = []
    page = 1
    server_enforced_limit = 50
    target_pages = 1 # Will be updated after the first request
    
    token = login()
    
    while page <= target_pages:
        url = f"{BASE_URL}{endpoint}"
        headers = {
            "Authorization": f"Bearer {token}",
            "X-API-Key": API_KEY
        }
        params = {"page": page, "limit": 200} # We ask for 200, it gives 50
        
        print(f"Fetching {endpoint} page {page} of {target_pages}... (Total so far: {len(results)})", end='\r')
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 401:
            print(f"\nToken expired at page {page}. Re-authenticating...")
            token = login()
            continue
            
        if response.status_code != 200:
            print(f"\nServer error {response.status_code} on page {page}.")
            break
            
        data = response.json()
        current_results = data.get("results", [])
        
        # On the very first page, read the total and calculate our stopping point
        if page == 1:
            total_records = data.get("total", 0)
            target_pages = math.ceil(total_records / server_enforced_limit)
            print(f"\n[INFO] {endpoint} reports {total_records} total records. Calculating {target_pages} pages to fetch.")
            
        if not current_results:
            break
            
        results.extend(current_results)
        page += 1
        time.sleep(0.1)
        
    print(f"\nFinished {endpoint} successfully.")
    return results

def main():
    print("Initiating smart extraction...\n")
    
    dataset = {
        "listings": fetch_all("/v1/listings"),
        "rentals": fetch_all("/v1/rentals"),
        "projects": fetch_all("/v1/projects")
    }
    
    print("\nSaving data to offline_data.json...")
    with open("offline_data.json", "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)
        
    print("\nExtraction complete. You have the true dataset.")
    print(f"Total Listings downloaded: {len(dataset['listings'])}")
    print(f"Total Rentals downloaded: {len(dataset['rentals'])}")
    print(f"Total Projects downloaded: {len(dataset['projects'])}")

if __name__ == "__main__":
    main()