import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function PropertyCard({ property }) {
  const { favorites, toggleFavorite } = useContext(AuthContext);
  
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(property.price);

  const isFav = favorites.some(fav => fav.listing_id === property.listing_id);

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', margin: '10px 0' }}>
      <h3>{property.apartment_name || 'Independent Property'}</h3>
      <p><strong>Location:</strong> <span style={{ textTransform: 'capitalize' }}>{property.locality}</span></p>
      <p><strong>Details:</strong> {property.bedroom} BHK • {property.property_type}</p>
      <p><strong>Price:</strong> {formattedPrice}</p>
      <p><strong>Area:</strong> {property.carpet_area} sqft</p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <Link to={`/listings/${property.listing_id}`} style={{ padding: '5px 10px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          View Details
        </Link>
        <button 
          onClick={() => toggleFavorite(property)}
          style={{ padding: '5px 10px', cursor: 'pointer', background: isFav ? '#dc3545' : '#e0e0e0', color: isFav ? 'white' : 'black', border: 'none', borderRadius: '4px' }}>
          {isFav ? 'Remove Favorite' : 'Save to Favorites'}
        </button>
      </div>
    </div>
  );
}