import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Stack, Typography, Card, CardContent } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import IssueCard from '../components/IssueCard';
import FiltersPanel from '../components/FiltersPanel';
import PageHeader from '../components/PageHeader';

export default function WardIssues() {
  const { wardSlug } = useParams();
  const [issues, setIssues] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const limit = 10;

  // Fetch for infinite scroll
  const fetchIssues = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/issues?ward=${encodeURIComponent(wardSlug)}&page=${reset ? 1 : page}&limit=${limit}`
      );
      const data = await res.json();
      // (Assume the backend returns just an array. If it returns { items: [...] }, update accordingly.)
      const newIssues = Array.isArray(data) ? data : data.items || [];
      if (reset) {
        setIssues(newIssues);
        setPage(2);
      } else {
        setIssues(prev => [...prev, ...newIssues]);
        setPage(p => p + 1);
      }
      setHasMore(newIssues.length === limit);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [wardSlug, page]);

  // Reset issues on wardSlug/filter change
  useEffect(() => {
    setIssues([]);
    setPage(1);
    setHasMore(true);
    setError('');
    fetchIssues(true);
    // eslint-disable-next-line
  }, [wardSlug, statusFilter, priorityFilter]);

  // Filter issues on client side
  const filteredIssues = issues.filter(issue => {
    const statusMatch = statusFilter === 'all' || issue.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || issue.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  if (loading && page === 1)
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="body1" color="text.secondary">Loading issues...</Typography>
      </Container>
    );
  if (error)
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="body1" color="error">Error: {error}</Typography>
      </Container>
    );

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <PageHeader
          title="CIVIC ISSUES"
          summary={{
            titleText: wardSlug,
            subText: `${filteredIssues.length} ${filteredIssues.length === 1 ? 'issue' : 'issues'} reported`
          }}
        />
        <FiltersPanel
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          setStatusFilter={setStatusFilter}
          setPriorityFilter={setPriorityFilter}
        />
        {filteredIssues.length === 0 ? (
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No issues match the selected filters
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <InfiniteScroll
            dataLength={filteredIssues.length}
            next={fetchIssues}
            hasMore={hasMore}
            loader={<Typography sx={{ textAlign: 'center', my: 2 }}>Loading more...</Typography>}
            endMessage={
              <Typography sx={{ textAlign: 'center', my: 2 }} color="text.secondary">
                No more issues to load.
              </Typography>
            }
          >
            <Stack spacing={3}>
              {filteredIssues.map(issue => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </Stack>
          </InfiniteScroll>
        )}
      </Container>
    </Box>
  );
}
