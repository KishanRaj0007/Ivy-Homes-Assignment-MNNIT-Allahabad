import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import { Link } from 'react-router-dom';

export default function Favourites() {
  const { favorites, user } = useContext(AuthContext);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Saved Listings ({user?.email})</h2>
        <Link to="/listings" style={{ textDecoration: 'none', color: '#007bff' }}>Back to Listings</Link>
      </div>
      
      {favorites.length === 0 ? (
        <p>You have no saved properties yet.</p>
      ) : (
        favorites.map(property => (
          <PropertyCard key={property.listing_id} property={property} />
        ))
      )}
    </div>
  );
}