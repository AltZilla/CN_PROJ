import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import MapView from './pages/MapView';
import UploadView from './pages/UploadView';
import Dashboard from './pages/Dashboard';
import WardIssues from './pages/WardIssues';
import 'leaflet/dist/leaflet.css';

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadView />} />
          <Route path="/ward/:id" element={<WardIssues />} />
          <Route path="/wards/:wardSlug" element={<WardIssues />} />
        </Routes>
      </div>
    </Router>
  );
}
