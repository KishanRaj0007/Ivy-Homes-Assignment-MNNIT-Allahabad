import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';

export default function Listings() {
  const { token, logout } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  
  // Filter states
  const [bhk, setBhk] = useState('');
  const [locality, setLocality] = useState('');
  const [furnishing, setFurnishing] = useState('');

  useEffect(() => {
    fetchListings();
  }, [page, bhk, locality, furnishing]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ page });
      if (bhk) queryParams.append('bhk', bhk);
      if (locality) queryParams.append('locality', locality.toLowerCase());
      if (furnishing) queryParams.append('furnishing', furnishing.toLowerCase());

      console.log("Fetching from BFF with params:", queryParams.toString());

      const response = await fetch(`http://localhost:8080/api/v1/listings?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        console.error("Token expired. Logging out.");
        logout();
        return;
      }

      const data = await response.json();
      console.log("RAW DATA FROM BFF:", data); // <-- THIS WILL REVEAL THE ISSUE

      if (data.error) {
        console.error("BFF returned an error:", data.error);
      }

      // Safeguard in case the API doesn't wrap properties in "results" like the docs claim
      const rawArray = data.results || data || []; 
      
      const activeListings = Array.isArray(rawArray) 
        ? rawArray.filter(item => item.is_live === true)
        : [];
      
      console.log("Filtered Active Listings:", activeListings);
      setListings(activeListings);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Property Listings</h2>
        <button onClick={logout} style={{ padding: '5px 15px' }}>Logout</button>
      </div>

      {/* Filters Section */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <input 
          type="text" 
          placeholder="Locality (e.g. whitefield)" 
          value={locality} 
          onChange={(e) => setLocality(e.target.value)} 
        />
        <select value={bhk} onChange={(e) => setBhk(e.target.value)}>
          <option value="">Any BHK</option>
          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4 BHK</option>
        </select>
        <select value={furnishing} onChange={(e) => setFurnishing(e.target.value)}>
          <option value="">Any Furnishing</option>
          <option value="unfurnished">Unfurnished</option>
          <option value="semi-furnished">Semi-furnished</option>
          <option value="fully-furnished">Fully-furnished</option>
        </select>
      </div>

      {/* Results Section */}
      {loading ? (
        <p>Loading properties...</p>
      ) : (
        <div>
          {listings.length === 0 ? <p>No active properties found for these filters.</p> : null}
          {listings.map(property => (
            <PropertyCard key={property.listing_id} property={property} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
          Previous Page
        </button>
        <span>Page {page}</span>
        {/* We disable 'Next' if we received less than the enforced 50 limit, meaning we hit the end */}
        <button onClick={() => setPage(p => p + 1)} disabled={listings.length < 50 && listings.length > 0 && !loading}>
          Next Page
        </button>
      </div>
    </div>
  );
}