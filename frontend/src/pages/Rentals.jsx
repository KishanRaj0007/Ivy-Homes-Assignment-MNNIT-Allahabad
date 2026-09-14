import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Rentals() {
  const { token } = useContext(AuthContext);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://ivy-backend-app.onrender.com/api/v1/rentals?page=1', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setRentals(data.results || []);
      setLoading(false);
    });
  }, [token]);

  if (loading) return <div style={{ padding: '20px' }}>Loading Rentals...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Available Rentals</h2>
      {rentals.map(r => (
        <div key={r.listing_id} style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0', borderRadius: '8px' }}>
          <h3>{r.title}</h3>
          <p><strong>Location:</strong> {r.locality}</p>
          <p><strong>Rent:</strong> ₹{r.price.toLocaleString('en-IN')}/month | <strong>Deposit:</strong> ₹{r.deposit.toLocaleString('en-IN')}</p>
          <p><strong>Area:</strong> {r.carpet_area} sqft</p>
        </div>
      ))}
    </div>
  );
}