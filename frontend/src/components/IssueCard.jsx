import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Stack, IconButton } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { useAuth } from '../context/AuthContext';  // import your auth hook

const statusConfig = {
  open: { color: '#10b981', label: 'Open', bg: '#ecfdf5' },
  in_progress: { color: '#f59e0b', label: 'In Progress', bg: '#fffbeb' },
  closed: { color: '#6b7280', label: 'Closed', bg: '#f3f4f6' },
};

const priorityConfig = {
  low: { color: '#3b82f6', label: 'Low' },
  medium: { color: '#f59e0b', label: 'Medium' },
  high: { color: '#ef4444', label: 'High' },
};

export default function IssueCard({ issue }) {
  const { user } = useAuth();  // get login user from context

  const statusInfo = statusConfig[issue.status] || statusConfig.open;
  const priorityInfo = priorityConfig[issue.priority] || priorityConfig.medium;

  const [upvotes, setUpvotes] = useState(issue.upvotes || 0);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const handleUpvote = async () => {
    if (!user) {
      alert('Please login to upvote.');
      return;
    }
    setIsUpvoting(true);
    try {
      const res = await fetch(`http://localhost:8080/issues/${issue._id}/upvote`, {
        method: 'POST',
        headers: {
          'x-api-key': 'dev-key',
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to upvote (no error body)');
      }
      const data = await res.json();
      setUpvotes(data.upvotes || 0);
    } catch (err) {
      console.error('Upvote error:', err.message || err);
      alert(err.message || 'Error upvoting issue');
    } finally {
      setIsUpvoting(false);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        mb: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#d1d5db',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Typography 
          variant="h6" 
          sx={{ fontWeight: 600, color: '#111827', mb: 2, fontSize: '1.125rem' }}
        >
          {issue.title}
        </Typography>

        <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: statusInfo.bg,
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusInfo.color }} />
            <Typography variant="caption" sx={{ fontWeight: 500, color: statusInfo.color, fontSize: '0.8rem' }}>
              {statusInfo.label}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              border: `1px solid ${priorityInfo.color}20`,
              bgcolor: `${priorityInfo.color}08`,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 500, color: priorityInfo.color, fontSize: '0.8rem' }}>
              {priorityInfo.label} Priority
            </Typography>
          </Box>
        </Stack>

        {/* Description */}
        <Typography 
          variant="body2" 
          sx={{ color: '#4b5563', lineHeight: 1.7, mb: 3, whiteSpace: 'pre-wrap' }}
        >
          {issue.description}
        </Typography>

        {/* Image */}
        {issue.photoUrl && (
          <Box 
            sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', border: '1px solid #e5e7eb' }}
          >
            <Box
              component="img"
              src={issue.photoUrl}
              alt="Issue photo"
              sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }}
            />
          </Box>
        )}

        {/* Upvote Button and Count */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <IconButton 
            aria-label="upvote issue" 
            onClick={handleUpvote} 
            disabled={isUpvoting || !user} 
            size="small"
            color="primary"
          >
            <ThumbUpIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {upvotes} {upvotes === 1 ? 'upvote' : 'upvotes'}
          </Typography>
        </Stack>

        {/* Footer */}
        <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
          Reported {new Date(issue.createdAt).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}
