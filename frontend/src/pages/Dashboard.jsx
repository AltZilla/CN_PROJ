import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, Grid, Card, CardContent, Chip, LinearProgress } from '@mui/material';
import { TrendingUp, CheckCircle, Warning, PendingActions } from '@mui/icons-material';
import IssueCard from '../components/IssueCard';
import PageHeader from '../components/PageHeader';

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/issues?limit=10&sort=createdAt:desc')
      .then(res => res.json())
      .then(data => {
        setIssues(data.items || data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Calculate stats
  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <Card 
      elevation={0}
      sx={{ 
        border: '1px solid #e5e7eb',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
          borderColor: color,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
          </Box>
          <Box 
            sx={{ 
              bgcolor: bgColor, 
              borderRadius: 2, 
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon sx={{ color, fontSize: 28 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box 
      sx={{ 
        bgcolor: '#f8fafc',
        minHeight: '100vh',
        pb: 6
      }}
    >
      <Box sx={{ 
        bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pt: 4,
        pb: 8,
        px: 4
      }}>
        <PageHeader 
          title="Dashboard" 
          summary={{ 
            titleText: 'Overview of issues', 
            subText: 'Monitor and track civic issues in real-time' 
          }} 
        />
      </Box>

      <Box sx={{ px: 4, mt: -4 }}>
        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Issues" 
              value={stats.total} 
              icon={TrendingUp}
              color="#667eea"
              bgColor="#eef2ff"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Open Issues" 
              value={stats.open} 
              icon={Warning}
              color="#ef4444"
              bgColor="#fee2e2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="In Progress" 
              value={stats.inProgress} 
              icon={PendingActions}
              color="#f59e0b"
              bgColor="#fef3c7"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Resolved" 
              value={stats.resolved} 
              icon={CheckCircle}
              color="#10b981"
              bgColor="#d1fae5"
            />
          </Grid>
        </Grid>

        {/* Recent Issues Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            maxWidth: 1200, 
            mx: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: 3,
            bgcolor: '#fff'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Recent Issues
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Latest reported civic issues
              </Typography>
            </Box>
            {loading && (
              <Chip label="Loading..." size="small" color="primary" variant="outlined" />
            )}
          </Box>

          {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

          <List sx={{ '& > *:not(:last-child)': { mb: 2 } }}>
            {issues.length === 0 && !loading ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No issues reported yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Issues will appear here once they are reported
                </Typography>
              </Box>
            ) : (
              issues.map(issue => <IssueCard key={issue._id} issue={issue} />)
            )}
          </List>
        </Paper>
      </Box>
    </Box>
  );
}