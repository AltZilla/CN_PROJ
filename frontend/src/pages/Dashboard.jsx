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

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  };

  const StatCard = ({ title, value, icon: Icon, color, gradient }) => (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 16px 32px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: gradient,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <Icon sx={{ color: '#fff', fontSize: 28 }} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ bgcolor: '#f3f6fb', minHeight: '100vh', pb: 6 }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          pt: 6,
          pb: 10,
          px: 4,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <PageHeader
          title="Dashboard"
          summary={{
            titleText: 'Overview of civic issues',
            subText: 'Monitor and track issues in real-time',
          }}
        />
      </Box>

      {/* Stats */}
      <Box sx={{ px: 4, mt: -6 }}>
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Issues"
              value={stats.total}
              icon={TrendingUp}
              color="#667eea"
              gradient="linear-gradient(135deg,#667eea 0%,#5a67d8 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Open Issues"
              value={stats.open}
              icon={Warning}
              color="#ef4444"
              gradient="linear-gradient(135deg,#f87171 0%,#ef4444 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              icon={PendingActions}
              color="#f59e0b"
              gradient="linear-gradient(135deg,#fbbf24 0%,#f59e0b 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Resolved"
              value={stats.resolved}
              icon={CheckCircle}
              color="#10b981"
              gradient="linear-gradient(135deg,#34d399 0%,#10b981 100%)"
            />
          </Grid>
        </Grid>

        {/* Recent Issues */}
        <Paper
          elevation={2}
          sx={{
            p: 4,
            maxWidth: 1200,
            mx: 'auto',
            borderRadius: 3,
            bgcolor: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Recent Issues
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Latest reported civic issues
              </Typography>
            </Box>
            {loading && <Chip label="Loading..." size="small" color="primary" variant="outlined" />}
          </Box>

          {loading && <LinearProgress sx={{ mb: 3, borderRadius: 2 }} />}

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
