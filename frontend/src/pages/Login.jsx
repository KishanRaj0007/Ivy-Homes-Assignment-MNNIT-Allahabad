import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('demo1@ivy.homes');
  const [password, setPassword] = useState('8317045e1a');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const success = await login(email, password);
    
    if (success) {
      navigate('/listings');
    } else {
      setError('Login failed. Check backend connection.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Ivy Homes Portal</h2>
      
      {/* Informational Banner about Render */}
      <div style={{ 
        background: '#e3f2fd', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px', 
        fontSize: '0.9em', 
        lineHeight: '1.5',
        color: '#0277bd',
        border: '1px solid #81d4fa'
      }}>
        <strong>ℹ️ Notice:</strong> The Spring Boot backend proxy is deployed on Render's free tier, which spins down after periods of inactivity. 
        <strong> The very first login attempt may take up to 50 seconds to wake the server up.</strong> Thank you for your patience!
      </div>

      {error && <p style={{ color: '#dc3545', fontWeight: 'bold' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          disabled={isLoading}
          style={{ padding: '8px' }}
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          disabled={isLoading}
          style={{ padding: '8px' }}
        />
        <button 
          type="submit" 
          style={{ 
            padding: '12px', 
            cursor: isLoading ? 'wait' : 'pointer',
            background: isLoading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold'
          }} 
          disabled={isLoading}
        >
          {isLoading ? 'Waking up server (Please wait...)' : 'Log In'}
        </button>
      </form>
    </div>
  );
}