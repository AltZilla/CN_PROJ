import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List } from '@mui/material';
import IssueCard from '../components/IssueCard';
import PageHeader from '../components/PageHeader';

export default function Dashboard() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/issues?limit=10&sort=createdAt:desc')
      .then(res => res.json())
      .then(data => setIssues(data.items || data))
      .catch(console.error);
  }, []);

  return (
    <Box 
      sx={{ 
        p: 4, 
        bgcolor: '#fff',          // white background
        color: '#222',            // dark text color
        minHeight: '100vh',
      }}
    >
      <PageHeader 
        title="Dashboard" 
        summary={{ titleText: 'Overview of issues', subText: 'Recent reported issues & overview' }} 
      />

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Recent Issues</Typography>
        <Paper 
          elevation={3} 
          sx={{ p: 3, maxWidth: 800, mx: 'auto', bgcolor: '#fafafa' }}  // light gray inside paper
        >
          <List>
            {issues.length === 0 ? (
              <Typography>No issues reported yet.</Typography>
            ) : (
              issues.map(issue => <IssueCard key={issue._id} issue={issue} />)
            )}
          </List>
        </Paper>
      </Box>
    </Box>
  );
}
