import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Projects() {
  const { token } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://ivy-backend-app.onrender.com/api/v1/projects?page=1', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setProjects(data.results || []);
      setLoading(false);
    });
  }, [token]);

  if (loading) return <div style={{ padding: '20px' }}>Loading Projects...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Builder Projects</h2>
      {projects.map(p => {
        // FIXING THE LIE: The API says INR, but gives Crores/Lakhs[cite: 1, 3]!
        const trueMinPrice = (p.price_min * 100000).toLocaleString('en-IN'); 
        const trueMaxPrice = (p.price_max * 10000000).toLocaleString('en-IN');

        return (
          <div key={p.project_id} style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0', borderRadius: '8px', background: '#f9f9f9' }}>
            <h3>{p.apartment_name} by {p.developer_name}</h3>
            <p><strong>Location:</strong> {p.locality} ({p.project_status})</p>
            <p><strong>Actual Price Range:</strong> ₹{trueMinPrice} - ₹{trueMaxPrice}</p>
            <p><strong>Reported Listings:</strong> {p.total_listings} <em>(Note: Investigation shows this count is often inaccurate)</em></p>
          </div>
        );
      })}
    </div>
  );
}