import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ListingDetail() {
  const { id } = useParams();
  const { token, favorites, toggleFavorite } = useContext(AuthContext);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(`https://ivy-backend-app.onrender.com/api/v1/listings/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setProperty(data);
      } catch (error) {
        console.error("Failed to load details");
      }
      setLoading(false);
    };
    fetchDetail();
  }, [id, token]);

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (!property || property.error) return <div style={{ padding: '20px' }}>Property not found.</div>;

  const isFav = favorites.some(fav => fav.listing_id === property.listing_id);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/listings" style={{ textDecoration: 'none', color: '#007bff', marginBottom: '20px', display: 'block' }}>
        &larr; Back to Listings
      </Link>
      
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <h2>{property.title || property.apartment_name}</h2>
        <p><strong>Posted By:</strong> {property.posted_by_name} ({property.posted_by_contact})</p>
        <p><strong>Description:</strong> {property.description}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
          <div><strong>Price:</strong> ₹{property.price.toLocaleString('en-IN')}</div>
          <div><strong>Carpet Area:</strong> {property.carpet_area} sqft</div>
          <div><strong>Furnishing:</strong> {property.furnishing}</div>
          <div><strong>Facing:</strong> {property.facing_direction}</div>
          <div><strong>Floor:</strong> {property.floor} of {property.total_floors}</div>
          <div><strong>Status:</strong> {property.is_live ? 'Active' : 'Inactive'}</div>
        </div>

        <button 
          onClick={() => toggleFavorite(property)}
          style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', background: isFav ? '#dc3545' : '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
          {isFav ? 'Remove from Favorites' : 'Save to Favorites'}
        </button>
      </div>
    </div>
  );
}