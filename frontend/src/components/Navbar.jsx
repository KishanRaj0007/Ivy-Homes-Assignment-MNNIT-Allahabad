import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { logout, user } = useContext(AuthContext);

  if (!user) return null; // Don't show navbar on login screen

  return (
    <nav style={{ display: 'flex', gap: '20px', padding: '15px', background: '#333', color: 'white', alignItems: 'center' }}>
      <h3 style={{ margin: 0, paddingRight: '20px' }}>Ivy Homes</h3>
      <Link to="/listings" style={{ color: 'white', textDecoration: 'none' }}>Listings</Link>
      <Link to="/rentals" style={{ color: 'white', textDecoration: 'none' }}>Rentals</Link>
      <Link to="/projects" style={{ color: 'white', textDecoration: 'none' }}>Projects</Link>
      <Link to="/favourites" style={{ color: 'white', textDecoration: 'none' }}>Favourites</Link>
      <Link to="/insights" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Insights</Link>
      <button onClick={logout} style={{ marginLeft: 'auto', padding: '5px 15px', cursor: 'pointer' }}>Logout</button>
    </nav>
  );
}