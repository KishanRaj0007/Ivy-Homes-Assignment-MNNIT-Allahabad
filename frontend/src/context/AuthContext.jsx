import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [favorites, setFavorites] = useState([]);

  // Load favorites when the user changes
  useEffect(() => {
    if (user) {
      const storedFavs = JSON.parse(localStorage.getItem(`favs_${user.email}`)) || [];
      setFavorites(storedFavs);
    } else {
      setFavorites([]);
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.access_token) {
        setToken(data.access_token);
        const userData = { email }; // The assignment uses same password for demo1, demo2, demo3
        setUser(userData);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const toggleFavorite = (property) => {
    if (!user) return;
    setFavorites((prevFavs) => {
      const isFavorited = prevFavs.find(fav => fav.listing_id === property.listing_id);
      const newFavs = isFavorited 
        ? prevFavs.filter(fav => fav.listing_id !== property.listing_id)
        : [...prevFavs, property];
      
      localStorage.setItem(`favs_${user.email}`, JSON.stringify(newFavs));
      return newFavs;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, favorites, toggleFavorite }}>
      {children}
    </AuthContext.Provider>
  );
};