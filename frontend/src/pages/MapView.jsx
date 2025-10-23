import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Box, Container, Paper, Typography, Chip, Stack, Fade } from '@mui/material';
import { LocationOn, Info } from '@mui/icons-material';
import PageHeader from '../components/PageHeader';

const iconUrls = {
  red: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  blue: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  yellow: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  green: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadow: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
};

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

const statusColors = {
  open: 'red',
  assigned: 'blue',
  in_progress: 'yellow',
  resolved: 'green',
};

const statusLabels = {
  open: { label: 'Open', color: '#ef4444', bg: '#fee2e2' },
  assigned: { label: 'Assigned', color: '#3b82f6', bg: '#dbeafe' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: '#fef3c7' },
  resolved: { label: 'Resolved', color: '#10b981', bg: '#d1fae5' },
};

export default function MapView() {
  const [geojson, setGeojson] = useState(null);
  const [wardZones, setWardZones] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/geo/divisions').then(res => res.json()),
      fetch('http://localhost:8080/geo/ward-zones').then(res => res.json()),
      fetch('http://localhost:8080/issues?limit=100').then(res => res.json())
    ])
    .then(([geoData, wardData, issuesData]) => {
      setGeojson(geoData);
      setWardZones(wardData);
      setIssues(issuesData.items || issuesData);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
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

  const issuesByStatus = issues.reduce((acc, issue) => {
    acc[issue.status] = (acc[issue.status] || 0) + 1;
    return acc;
  }, {});

  const transparentStyle = {
    fillColor: 'transparent',
    weight: 0,
    opacity: 0,
    fillOpacity: 0,
  };

  const highlightStyle = {
    fillColor: '#667eea',
    weight: 3,
    color: '#667eea',
    fillOpacity: 0.2,
  };

  const onEachWard = (feature, layer) => {
    const rawName = feature.properties && feature.properties.Name;
    const wardName = rawName ? getWardName(rawName) : 'Unknown Ward';
    const wardId = rawName ? rawName.trim() : 'N/A';

    const popupContent = `
      <div style="font-family: system-ui; padding: 4px;">
        <strong style="font-size: 14px; color: #1f2937;">${wardName}</strong><br/>
        <span style="font-size: 12px; color: #6b7280;">Ward ID: ${wardId}</span><br/>
        <span style="font-size: 11px; color: #9ca3af; margin-top: 4px; display: block;">Click to view issues</span>
      </div>
    `;
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
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pt: 4,
        pb: 8,
        px: 4
      }}>
        <Container maxWidth="xl">
          <PageHeader 
            title="CIVIC MAP"
            summary={{ 
              titleText: 'Explore Chennai', 
              subText: 'Interactive map showing all civic issues across wards' 
            }}
          />
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: -4, pb: 4 }}>
        {/* Legend Card */}
        <Fade in={!loading}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 2.5, 
              mb: 3, 
              border: '1px solid #e5e7eb',
              borderRadius: 2,
              bgcolor: '#fff'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info sx={{ fontSize: 18, color: '#6b7280' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                  Legend:
                </Typography>
              </Box>
              {Object.entries(statusLabels).map(([key, { label, color, bg }]) => (
                <Chip
                  key={key}
                  label={`${label} (${issuesByStatus[key] || 0})`}
                  size="small"
                  sx={{ 
                    bgcolor: bg,
                    color: color,
                    fontWeight: 600,
                    border: `1px solid ${color}30`
                  }}
                />
              ))}
              <Chip
                icon={<LocationOn />}
                label="Click ward to view issues"
                size="small"
                variant="outlined"
                sx={{ ml: 'auto', fontWeight: 500 }}
              />
            </Stack>
          </Paper>
        </Fade>

        {/* Map Container */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          <MapContainer
            center={[13.0827, 80.2707]}
            zoom={12}
            style={{ 
              height: '75vh', 
              minHeight: 500, 
              width: '100%',
            }}
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
                  <Box sx={{ minWidth: 200, fontFamily: 'system-ui' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1f2937' }}>
                      {issue.title}
                    </Typography>
                    <Stack spacing={0.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Status:</Typography>
                        <Chip 
                          label={statusLabels[issue.status]?.label || issue.status} 
                          size="small"
                          sx={{ 
                            height: 20,
                            fontSize: 11,
                            bgcolor: statusLabels[issue.status]?.bg,
                            color: statusLabels[issue.status]?.color
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Priority:</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                          {issue.priority}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Paper>
      </Container>
    </Box>
  );
}