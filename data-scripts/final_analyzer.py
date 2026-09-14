import json
from datetime import datetime, timezone, timedelta

def load_data():
    with open("offline_data.json", "r", encoding="utf-8") as f:
        return json.load(f)

def parse_listing_date(date_str):
    """Handles the undocumented missing 'Z' suffix by assuming UTC."""
    if not date_str.endswith("Z") and not "+" in date_str:
        date_str += "+00:00" # Force UTC
    elif date_str.endswith("Z"):
        date_str = date_str.replace("Z", "+00:00")
    return datetime.fromisoformat(date_str)

def main():
    data = load_data()
    listings = data["listings"]
    rentals = data["rentals"]
    projects = data["projects"]

    answers = {}

    # Q1 & Q3
    answers["total_listing_records"] = len(listings)
    answers["active_listings"] = sum(1 for L in listings if L.get("is_live") is True)

    # Q2: Unique properties based on location and specs
    unique_props = set()
    for L in listings:
        key = (L.get("latitude"), L.get("longitude"), L.get("carpet_area"), L.get("floor"), L.get("apartment_name"))
        unique_props.add(key)
    answers["unique_properties"] = len(unique_props)

    # Q4: Corrupt listing IDs
    # Based on the Chennai location, coordinates should be Lat ~13, Lng ~80.
    corrupt = []
    for L in listings:
        if L.get("latitude", 0) > 50: # Coordinates are swapped!
            corrupt.append(L["listing_id"])
        elif L.get("floor", 0) > L.get("total_floors", 999):
            corrupt.append(L["listing_id"])
        elif L.get("carpet_area", 0) > L.get("super_built_up_area", 999999):
            corrupt.append(L["listing_id"])
            
    answers["corrupt_listing_ids"] = sorted(list(set(corrupt)))

    # Q5: Total monthly rent in Perungudi
    answers["total_monthly_rent"] = sum(
        R.get("price", 0) for R in rentals if R.get("locality", "").lower() == "perungudi"
    )

    # Q7: Costliest project (Fixing the Crores unit lie)
    max_proj = None
    max_price_inr = 0
    for P in projects:
        # price_max is in Crores, so multiply by 10,000,000 to get INR
        actual_inr = int(P.get("price_max", 0) * 10000000)
        if actual_inr > max_price_inr:
            max_price_inr = actual_inr
            max_proj = P["project_id"]
            
    answers["costliest_project"] = {
        "project_id": max_proj,
        "price_max_inr": max_price_inr
    }

    # Q8: Listings last 7 days
    # Reference: 2026-09-10T00:00:00+05:30
    ref_time = datetime.fromisoformat("2026-09-10T00:00:00+05:30")
    start_time = ref_time - timedelta(days=7)
    
    last_7_days = 0
    for L in listings:
        try:
            posted = parse_listing_date(L["posted_at"])
            if start_time <= posted < ref_time:
                last_7_days += 1
        except Exception:
            pass
    answers["listings_last_7_days"] = last_7_days

    # Q9: Fake listing IDs (Honeypots)
    # Honeypots to generate enquiries often have ridiculously low prices (e.g., 1000 INR for an apartment)
    fake_ids = []
    for L in listings:
        if L.get("price", 99999999) < 100000: # Any sale property under 1 Lakh is clearly fake
            fake_ids.append(L["listing_id"])
    answers["fake_listing_ids"] = sorted(list(set(fake_ids)))

    # Q6: Avg price per sqft 2BHK
    valid_2bhks = [
        L for L in listings 
        if L.get("is_live") is True 
        and L.get("bedroom") == 2 
        and L["listing_id"] not in answers["corrupt_listing_ids"]
        and L["listing_id"] not in answers["fake_listing_ids"]
    ]
    
    if valid_2bhks:
        total_sqft_price = sum(L["price"] / L["carpet_area"] for L in valid_2bhks)
        answers["avg_price_per_sqft_2bhk"] = round(total_sqft_price / len(valid_2bhks), 2)
    else:
        answers["avg_price_per_sqft_2bhk"] = 0.0

    # Q10: Projects with wrong listing count
    actual_project_counts = {}
    for L in listings:
        pid = L.get("project_id")
        if pid:
            actual_project_counts[pid] = actual_project_counts.get(pid, 0) + 1
            
    wrong_count_projects = 0
    for P in projects:
        pid = P["project_id"]
        stated = P.get("total_listings", 0)
        actual = actual_project_counts.get(pid, 0)
        if stated != actual:
            wrong_count_projects += 1
            
    answers["projects_with_wrong_listing_count"] = wrong_count_projects

    print(json.dumps(answers, indent=2))
    
    # Save directly to our submission template
    with open("final_answers.json", "w") as f:
        json.dump(answers, f, indent=2)

if __name__ == "__main__":
    main()