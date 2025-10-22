import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Box, Container } from '@mui/material';
import PageHeader from '../components/PageHeader';

// URLs for colored leaf-like marker icons, replace with your own if preferred
const iconUrls = {
  red: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  blue: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  yellow: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  green: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadow: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
};

// Create leaflet icon by color
function createColoredIcon(color) {
  return new L.Icon({
    iconUrl: iconUrls[color] || iconUrls.red,
    shadowUrl: iconUrls.shadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

// Status to marker color mapping
const statusColors = {
  open: 'red',
  assigned: 'blue',
  in_progress: 'yellow',
  resolved: 'green',
};

export default function MapView() {
  const [geojson, setGeojson] = useState(null);
  const [wardZones, setWardZones] = useState([]);
  const [issues, setIssues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8080/geo/divisions')
      .then(res => res.json())
      .then(setGeojson)
      .catch(console.error);

    fetch('http://localhost:8080/geo/ward-zones')
      .then(res => res.json())
      .then(data => setWardZones(data))
      .catch(console.error);

    fetch('http://localhost:8080/issues?limit=100')
      .then(res => res.json())
      .then(data => setIssues(data.items || data))
      .catch(console.error);
  }, []);

  const getWardName = (id) => {
    if (!wardZones || typeof wardZones !== 'object') return 'Unknown Ward';
    try {
      const idx = String(id).trim();
      return wardZones[idx] || 'Unknown Ward';
    } catch {
      return 'Unknown Ward';
    }
  };

  const transparentStyle = {
    fillColor: 'transparent',
    weight: 0,
    opacity: 0,
    fillOpacity: 0,
  };

  const highlightStyle = {
    fillColor: '#3388ff',
    weight: 2,
    color: '#3388ff',
    fillOpacity: 0.3,
  };

  const onEachWard = (feature, layer) => {
    const rawName = feature.properties && feature.properties.Name;
    const wardName = rawName ? getWardName(rawName) : 'Unknown Ward';
    const wardId = rawName ? rawName.trim() : 'N/A';

    const popupContent = `Ward ID: ${wardId} <br/> Ward Name: ${wardName}`;
    layer.bindPopup(popupContent);

    layer.on({
      mouseover: e => {
        e.target.setStyle(highlightStyle);
        e.target.openPopup();
      },
      mouseout: e => {
        e.target.setStyle(transparentStyle);
        e.target.closePopup();
      },
      click: () => {
        const wardSlug = wardName.toLowerCase().replace(/\s+/g, '-');
        navigate(`/wards/${wardSlug}`);
      }
    });
  };

  return (
    <Box sx={{ bgcolor: '#f5f6fa', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl" sx={{ pt: 3 }}>
        <PageHeader 
          title="CIVIC MAP"
          summary={{ titleText: 'Explore Chennai', subText: 'Click a ward to view its issues' }}
        />
        <Box
          sx={{
            width: { xs: '100vw', sm: '95vw', md: '92vw', lg: '88vw', xl: '86vw' },
            maxWidth: '1400px',
            mx: 'auto',
            borderRadius: 2,
            boxShadow: '0 4px 40px 5px #0002',
            overflow: 'hidden',
            mt: 2,
          }}
        >
          <MapContainer
            center={[13.0827, 80.2707]}
            zoom={12}
            style={{ height: '78vh', minHeight: 500, width: '100%' }}
          >
            <TileLayer
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              attribution='&copy; OpenStreetMap contributors'
            />
            {geojson && (
              <GeoJSON
                data={geojson}
                style={transparentStyle}
                onEachFeature={onEachWard}
              />
            )}
            {issues.map(issue => issue.lat && issue.lng && (
              <Marker
                key={issue._id}
                position={[issue.lat, issue.lng]}
                icon={createColoredIcon(statusColors[issue.status] || 'red')}
              >
                <Popup>
                  <strong>{issue.title}</strong><br />
                  Status: {issue.status}<br />
                  Priority: {issue.priority}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Box>
      </Container>
    </Box>
  );
}
