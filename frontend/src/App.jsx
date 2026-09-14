import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import Favourites from './pages/Favourites';
import Rentals from './pages/Rentals';
import Projects from './pages/Projects';
import Insights from './pages/Insights';

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? <>{children}</> : <Navigate to="/" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/listings" element={<PrivateRoute><Listings /></PrivateRoute>} />
          <Route path="/listings/:id" element={<PrivateRoute><ListingDetail /></PrivateRoute>} />
          <Route path="/favourites" element={<PrivateRoute><Favourites /></PrivateRoute>} />
          <Route path="/rentals" element={<PrivateRoute><Rentals /></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
          <Route path="/insights" element={<PrivateRoute><Insights /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}