import React from 'react';
import { Box, Typography } from '@mui/material';

export default function PageHeader({ title, summary }) {
  return (
    <Box sx={{ mb: 5 }}>
      <Typography 
        variant="overline" 
        sx={{ color: '#6b7280', fontWeight: 600, letterSpacing: 1.2, fontSize: '0.75rem' }}
      >
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827', mt: 0.5, mb: 1 }}>
        {summary.titleText}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {summary.subText}
      </Typography>
    </Box>
  );
}
