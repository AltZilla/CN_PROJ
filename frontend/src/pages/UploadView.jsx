import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  InputLabel,
  Select,
  FormControl
} from '@mui/material';
import PageHeader from '../components/PageHeader';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

function LocationSelector({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    }
  });

  if (!position) return null;

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: e => {
          setPosition(e.target.getLatLng());
        }
      }}
    />
  );
}

export default function UploadView() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    photo: null,
  });
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([13.0481, 80.2214]); // Kodambakkam, Chennai

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setMapCenter([coords.latitude, coords.longitude]);
          setMarkerPosition({ lat: coords.latitude, lng: coords.longitude });
        },
        () => {
          // Default Kodambakkam if no permission
        }
      );
    }
  }, []);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setFormData(prev => ({ ...prev, photo: files[0] || null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.photo && !markerPosition) {
      alert('Please upload a photo or select a location on the map.');
      return;
    }

    try {
      if (formData.photo) {
        // Issue with photo upload
        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('description', formData.description);
        payload.append('category', formData.priority);
        payload.append('photo', formData.photo);
        // Optional lat/lng override
        if (markerPosition) {
          payload.append('lat', markerPosition.lat);
          payload.append('lng', markerPosition.lng);
        }

        const response = await fetch('http://localhost:8080/issues/upload', {
          method: 'POST',
          headers: {
            'x-api-key': 'dev-key',
          },
          body: payload,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Upload failed');
        }
      } else {
        // Issue without photo
        const payload = {
          title: formData.title,
          description: formData.description,
          category: formData.priority,
          lat: markerPosition.lat,
          lng: markerPosition.lng,
        };

        const response = await fetch('http://localhost:8080/issues', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'dev-key',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }
      }

      alert('Issue reported successfully!');
      setFormData({ title: '', description: '', priority: 'medium', photo: null });
      setMarkerPosition(null);
    } catch (err) {
      alert(err.message || 'Failed to report issue');
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#fff', minHeight: '100vh', color: '#222' }}>
      <PageHeader
        title="Report Issue"
        summary={{ titleText: 'Help us improve', subText: 'Choose option and provide details' }}
      />
      <Paper sx={{ p: 4, maxWidth: 700, mx: 'auto', mt: 4, bgcolor: '#fafafa' }}>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <TextField
            fullWidth
            required
            label="Issue Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            required
            label="Description"
            name="description"
            multiline
            minRows={4}
            value={formData.description}
            onChange={handleChange}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              {priorities.map(p => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle1">Option 1: Upload Image (with GPS Info)</Typography>
            <Button variant="contained" component="label" sx={{ mt: 1 }}>
              Upload Image (optional)
              <input
                type="file"
                name="photo"
                hidden
                onChange={handleChange}
                accept="image/*"
              />
            </Button>
            {formData.photo && <Typography variant="body2" sx={{ mt: 1 }}>{formData.photo.name}</Typography>}
          </Box>
          <Typography sx={{ mt: 3, mb: 1 }}>
            Option 2: Select Location on Map (if no image)
          </Typography>
          <Box sx={{ height: 300, borderRadius: 1, overflow: 'hidden', mb: 3 }}>
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <LocationSelector position={markerPosition} setPosition={setMarkerPosition} />
            </MapContainer>
          </Box>
          <Button variant="contained" type="submit" sx={{ mt: 2 }}>
            Submit Issue
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
