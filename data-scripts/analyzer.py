import json
from datetime import datetime, timezone, timedelta

def load_data():
    with open("offline_data.json", "r", encoding="utf-8") as f:
        return json.load(f)

def parse_date(date_str):
    """Parses timestamps, converting them strictly to aware datetime objects."""
    # The docs claim 'Z' suffix for UTC, but we must check what it actually is.
    if date_str.endswith("Z"):
        date_str = date_str.replace("Z", "+00:00")
    return datetime.fromisoformat(date_str)

def main():
    print("Initiating Phase 2: Data Interrogation...\n")
    data = load_data()
    listings = data["listings"]
    rentals = data["rentals"]
    projects = data["projects"]

    answers = {}

    # Q1: Total listing records retrievable
    answers["total_listing_records"] = len(listings)

    # Q2: Unique properties
    # A property is unique based on its physical location and size, regardless of how many duplicate records exist.
    unique_props = set()
    for L in listings:
        key = (L.get("latitude"), L.get("longitude"), L.get("carpet_area"), L.get("floor"), L.get("apartment_name"))
        unique_props.add(key)
    answers["unique_properties"] = len(unique_props)

    # Q3: Active listings (The docs lied, we must check 'is_live' manually)
    answers["active_listings"] = sum(1 for L in listings if L.get("is_live") is True)

    # Q4: Corrupt listing IDs
    # Finding records that describe something physically impossible.
    corrupt = []
    print("--- Corrupt Data Discoveries ---")
    for L in listings:
        reasons = []
        if L.get("floor", 0) > L.get("total_floors", 999):
            reasons.append(f"Floor {L.get('floor')} > Total {L.get('total_floors')}")
        if L.get("carpet_area", 0) > L.get("super_built_up_area", 999999):
            reasons.append(f"Carpet {L.get('carpet_area')} > Super {L.get('super_built_up_area')}")
        if L.get("price", 1) <= 0:
            reasons.append("Negative or zero price")
            
        if reasons:
            corrupt.append(L["listing_id"])
            if len(corrupt) <= 5: # Just print the first 5 so we don't flood the terminal
                print(f"ID {L['listing_id']} is corrupt: {', '.join(reasons)}")
                
    answers["corrupt_listing_ids"] = sorted(list(set(corrupt)))
    print(f"Total Corrupt Found: {len(answers['corrupt_listing_ids'])}\n")

    # Q5: Total monthly rent in assigned locality
    # Assigned locality is 'perungudi'
    total_rent = sum(R.get("price", 0) for R in rentals if R.get("locality", "").lower() == "perungudi")
    answers["total_monthly_rent"] = total_rent

    # Q7: Costliest project
    costliest = max(projects, key=lambda x: x.get("price_max", 0))
    answers["costliest_project"] = {
        "project_id": costliest["project_id"],
        "price_max_inr": costliest["price_max"]
    }

    # Q8: Listings last 7 days
    # Reference: 2026-09-10T00:00:00+05:30 (IST)
    ref_time = datetime.fromisoformat("2026-09-10T00:00:00+05:30")
    start_time = ref_time - timedelta(days=7)
    
    last_7_days = 0
    for L in listings:
        try:
            posted = parse_date(L["posted_at"])
            if start_time <= posted < ref_time:
                last_7_days += 1
        except Exception:
            pass
    answers["listings_last_7_days"] = last_7_days

    # Q9: Fake listing IDs (Honeypots)
    print("--- Fake Listing Discoveries (Honeypots) ---")
    contact_counts = {}
    for L in listings:
        contact = L.get("posted_by_contact")
        contact_counts[contact] = contact_counts.get(contact, 0) + 1
        
    # Any contact posting an absurd amount of properties is likely a fake/bot account.
    fake_contacts = [c for c, count in contact_counts.items() if count > 20 and c is not None]
    print(f"Found {len(fake_contacts)} suspicious contacts posting 20+ properties.")
    
    fake_ids = [L["listing_id"] for L in listings if L.get("posted_by_contact") in fake_contacts]
    answers["fake_listing_ids"] = sorted(list(set(fake_ids)))
    print(f"Total Fake Listings Found: {len(answers['fake_listing_ids'])}\n")

    # Q6: Avg price per sqft 2BHK (Excluding Corrupt & Fake)
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
    # Count how many listings actually belong to each project
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

    # Save and display results
    with open("calculated_answers.json", "w") as f:
        json.dump(answers, f, indent=2)

    print("Phase 2 Complete. All 10 questions answered and saved to 'calculated_answers.json'.\n")
    for key, value in answers.items():
        # Truncate long lists for terminal output
        if isinstance(value, list) and len(value) > 3:
            print(f"{key}: [{value[0]}, {value[1]}, {value[2]}, ... ({len(value)} total)]")
        else:
            print(f"{key}: {value}")

if __name__ == "__main__":
    main()