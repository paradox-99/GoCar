import React, { useState, useMemo, useEffect } from 'react';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TablePagination,
    IconButton, Chip, Typography, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Grid, Card, CardContent,
    Alert, AlertTitle, Avatar, Divider, tableCellClasses, Stack, Rating as MuiRating, Collapse,
    LinearProgress
} from '@mui/material';
import { Delete, Search, Download, Star, StarBorder, Warning, Close, Analytics, Visibility, TrendingDown, EmojiFlags, CheckCircle, History } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import toast from 'react-hot-toast';
import moment from 'moment';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer,
    LineChart, Line, Cell
} from 'recharts';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#F97316",
        color: theme.palette.common.white,
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 13,
    },
}));

const RatingStars = ({ value }) => {
    return (
        <Box display="flex" alignItems="center" gap={0.5}>
            <MuiRating value={parseFloat(value)} precision={0.5} readOnly size="small" 
                emptyIcon={<StarBorder style={{ color: '#E5E7EB' }} fontSize="inherit" />}
                sx={{ color: '#F97316' }}
            />
            <Typography variant="body2" fontWeight="bold" sx={{ 
                ml: 1,
                color: value >= 4.5 ? '#10b981' : value >= 3.0 ? '#F97316' : '#ef4444'
            }}>
                {parseFloat(value).toFixed(1)}
            </Typography>
        </Box>
    );
};

const AdminReviews = () => {
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(0); // 0: Car, 1: Bike, 2: Agency, 3: Driver
    
    // Pagination & Filters
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [ratingFilter, setRatingFilter] = useState('All');
    const [rangeFilter, setRangeFilter] = useState('All');
    const [textFilter, setTextFilter] = useState('All');
    const [quickFilter, setQuickFilter] = useState('All');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // UI States
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');

    const tabTypes = ['car', 'bike', 'agency', 'driver'];
    const currentType = tabTypes[activeTab];

    // Queries
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-review-stats'],
        queryFn: async () => {
            const res = await axiosPublic.get('reviewRoutes/admin/stats');
            return res.data;
        }
    });

    const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
        queryKey: ['admin-reviews', currentType, page, rowsPerPage, search, ratingFilter, rangeFilter, textFilter, quickFilter, dateRange],
        queryFn: async () => {
            const params = {
                type: currentType,
                page: page + 1,
                limit: rowsPerPage,
                search,
                rating: ratingFilter,
                ratingRange: rangeFilter,
                hasReviewText: textFilter,
                quickFilter,
                ...dateRange
            };
            const res = await axiosPublic.get('reviewRoutes/admin/list', { params });
            return res.data;
        }
    });

    const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
        queryKey: ['admin-review-analytics', currentType],
        queryFn: async () => {
            const res = await axiosPublic.get(`reviewRoutes/admin/analytics?type=${currentType}`);
            return res.data;
        },
        enabled: showAnalytics
    });

    // Mutations
    const deleteReviewMutation = useMutation({
        mutationFn: async (data) => {
            return await axiosPublic.delete(`reviewRoutes/admin/${currentType}/${data.reviewId}`, {
                params: {
                    user_id: data.user_id,
                    entity_id: data.entity_id,
                    rating: data.rating
                },
                data: { reason: data.reason }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-reviews']);
            queryClient.invalidateQueries(['admin-review-stats']);
            queryClient.invalidateQueries(['admin-review-analytics']);
            toast.success('Review deleted successfully');
            setIsDeleteOpen(false);
            setDeleteReason('');
        },
        onError: (err) => toast.error(err.message || 'Delete failed')
    });

    const handleExportCSV = () => {
        if (!reviewsData?.reviews) return;
        const headers = ["Reviewer", "Entity", "Rating", "Review", "Date"];
        const rows = reviewsData.reviews.map(r => [
            `"${r.reviewer_name}"`,
            `"${currentType === 'car' || currentType === 'bike' ? `${r.brand} ${r.model}` : currentType === 'agency' ? r.agency_name : r.driver_name}"`,
            r.rating,
            `"${r.review || ''}"`,
            moment(r.date).format('YYYY-MM-DD')
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reviews_export_${currentType}.csv`;
        a.click();
    };

    const quickFilterPills = [
        { label: "All Reviews", value: 'All' },
        { label: "5 Star Only", value: '5Star' },
        { label: "4 Star & Above", value: '4Plus' },
        { label: "Below 3 Stars", value: 'Low', color: '#f59e0b' },
        { label: "1 Star Only", value: '1Star', color: '#ef4444' },
        { label: "This Week", value: 'Week' },
        { label: "This Month", value: 'Month' },
        { label: "With Comments", value: 'HasText' },
        { label: "No Comments", value: 'NoText' },
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', mx: 'auto' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>Reviews & Ratings</Typography>
                <Button 
                    variant="outlined" 
                    startIcon={<Analytics />} 
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    sx={{ borderColor: '#F97316', color: '#F97316', '&:hover': { borderColor: '#ea580c', bgcolor: '#fff7ed' } }}
                >
                    {showAnalytics ? "Hide Analytics" : "Show Analytics"}
                </Button>
            </Stack>

            {/* Alert Banner */}
            {stats?.lowRatedCount > 0 && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 3, borderRadius: 2, cursor: 'pointer' }} 
                    icon={<TrendingDown />}
                    onClick={() => { setRangeFilter('Below 2.0'); setQuickFilter('Low'); }}
                >
                    <AlertTitle sx={{ fontWeight: 'bold' }}>Low Rating Alert</AlertTitle>
                    {stats.lowRatedCount} entities have critically low ratings (below 3.0 ⭐). <strong>Review Now →</strong>
                </Alert>
            )}

            {/* Stat Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Reviews', value: stats?.totalReviews || 0, color: '#64748b', icon: <EmojiFlags /> },
                    { label: 'Avg Car Rating', value: stats?.avgCarRating.toFixed(1) || '0.0', color: '#F97316', icon: <Star />, tab: 0 },
                    { label: 'Avg Bike Rating', value: stats?.avgBikeRating.toFixed(1) || '0.0', color: '#F97316', icon: <Star />, tab: 1 },
                    { label: 'Avg Agency Rating', value: stats?.avgAgencyRating.toFixed(1) || '0.0', color: '#F97316', icon: <Star />, tab: 2 },
                    { label: 'Avg Driver Rating', value: stats?.avgDriverRating.toFixed(1) || '0.0', color: '#F97316', icon: <Star />, tab: 3 },
                    { label: 'Low Rated Entities', value: stats?.lowRatedCount || 0, color: '#ef4444', icon: <Warning />, filter: 'Low' },
                ].map((s, i) => (
                    <Grid item xs={6} sm={4} md={2} key={i}>
                        <Card 
                            sx={{ 
                                cursor: 'pointer', 
                                transition: '0.2s', 
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
                                borderLeft: `4px solid ${s.color}`
                            }}
                            onClick={() => {
                                if (s.tab !== undefined) setActiveTab(s.tab);
                                if (s.filter) setQuickFilter(s.filter);
                            }}
                        >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold">{s.label}</Typography>
                                    <Box sx={{ color: s.color, opacity: 0.8 }}>{s.icon}</Box>
                                </Stack>
                                <Typography variant="h5" fontWeight="bold" sx={{ color: s.color, mt: 1 }}>
                                    {s.label.includes('Avg') ? `⭐ ${s.value}` : s.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, v) => { setActiveTab(v); setPage(0); }} TabIndicatorProps={{ style: { backgroundColor: '#F97316' } }}>
                    <Tab label="🚗 Car Reviews" sx={{ fontWeight: 'bold', '&.Mui-selected': { color: '#F97316' } }} />
                    <Tab label="🏍️ Bike Reviews" sx={{ fontWeight: 'bold', '&.Mui-selected': { color: '#F97316' } }} />
                    <Tab label="🏢 Agency Reviews" sx={{ fontWeight: 'bold', '&.Mui-selected': { color: '#F97316' } }} />
                    <Tab label="👤 Driver Reviews" sx={{ fontWeight: 'bold', '&.Mui-selected': { color: '#F97316' } }} />
                </Tabs>
            </Box>

            {/* Analytics Panel */}
            <Collapse in={showAnalytics}>
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Rating Analytics - {currentType.toUpperCase()}</Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom color="textSecondary">Rating Distribution</Typography>
                            <Box sx={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsData?.distribution} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="rating" type="category" width={40} tickFormatter={(v) => `${v}★`} />
                                        <ChartTooltip />
                                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                            {analyticsData?.distribution?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.rating >= 4 ? '#10b981' : entry.rating >= 3 ? '#F97316' : '#ef4444'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom color="textSecondary">Rating Trend (Last 12 Months)</Typography>
                            <Box sx={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analyticsData?.trend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis domain={[0, 5]} />
                                        <ChartTooltip />
                                        <Line type="monotone" dataKey="avg_rating" stroke="#F97316" strokeWidth={3} dot={{ r: 6, fill: '#F97316' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Collapse>

            {/* Filters Bar */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField 
                            fullWidth size="small" 
                            placeholder={
                                currentType === 'car' ? "Search car or reviewer..." :
                                currentType === 'bike' ? "Search bike or reviewer..." :
                                currentType === 'agency' ? "Search agency or reviewer..." : "Search driver or reviewer..."
                            } 
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                            InputProps={{ startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} /> }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Rating</InputLabel>
                            <Select value={ratingFilter} label="Rating" onChange={e => setRatingFilter(e.target.value)}>
                                <MenuItem value="All">All Ratings</MenuItem>
                                {[5, 4, 3, 2, 1].map(r => <MenuItem key={r} value={r}>⭐ {r} Star{r > 1 ? 's' : ''}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Range</InputLabel>
                            <Select value={rangeFilter} label="Range" onChange={e => setRangeFilter(e.target.value)}>
                                <MenuItem value="All">All Ranges</MenuItem>
                                <MenuItem value="Below 2.0">Below 2.0</MenuItem>
                                <MenuItem value="2.0–3.0">2.0–3.0</MenuItem>
                                <MenuItem value="3.0–4.0">3.0–4.0</MenuItem>
                                <MenuItem value="Above 4.0">Above 4.0</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Content</InputLabel>
                            <Select value={textFilter} label="Content" onChange={e => setTextFilter(e.target.value)}>
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="With Written Review">With Written Review</MenuItem>
                                <MenuItem value="Rating Only">Rating Only</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} sx={{ textAlign: 'right' }}>
                        <Button variant="contained" startIcon={<Download />} onClick={handleExportCSV} sx={{ bgcolor: '#F97316', '&:hover': { bgcolor: '#ea580c' }, textTransform: 'none', borderRadius: 2 }}>Export CSV</Button>
                    </Grid>

                    {/* Date Filters Row */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TextField 
                                type="date" size="small" label="From" InputLabelProps={{ shrink: true }}
                                value={dateRange.start} 
                                onChange={e => setDateRange({...dateRange, start: e.target.value})} 
                            />
                            <TextField 
                                type="date" size="small" label="To" InputLabelProps={{ shrink: true }}
                                value={dateRange.end} 
                                onChange={e => setDateRange({...dateRange, end: e.target.value})} 
                            />
                        </Stack>
                    </Grid>

                    
                    <Grid item xs={12}>
                        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                            {quickFilterPills.map((pill) => (
                                <Chip 
                                    key={pill.value}
                                    label={pill.label} 
                                    onClick={() => setQuickFilter(quickFilter === pill.value ? 'All' : pill.value)}
                                    sx={{ 
                                        borderRadius: '16px', 
                                        fontWeight: 600,
                                        bgcolor: quickFilter === pill.value ? '#F97316' : 'transparent',
                                        color: quickFilter === pill.value ? '#fff' : (pill.color || 'inherit'),
                                        borderColor: quickFilter === pill.value ? '#F97316' : (pill.color || '#ddd'),
                                        border: '1px solid',
                                        '&:hover': { bgcolor: quickFilter === pill.value ? '#ea580c' : '#f8fafc' }
                                    }}
                                />
                            ))}
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 25px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Reviewer</StyledTableCell>
                            <StyledTableCell>{currentType.charAt(0).toUpperCase() + currentType.slice(1)}</StyledTableCell>
                            { (currentType === 'car' || currentType === 'bike' || currentType === 'driver') && <StyledTableCell>Agency</StyledTableCell> }
                            <StyledTableCell>Rating</StyledTableCell>
                            <StyledTableCell sx={{ width: '25%' }}>Review</StyledTableCell>
                            <StyledTableCell>Date</StyledTableCell>
                            <StyledTableCell align="right">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reviewsLoading ? (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 10 }}><LinearProgress sx={{ width: '200px', mx: 'auto', mb: 2 }} /><Typography>Loading reviews...</Typography></TableCell></TableRow>
                        ) : reviewsData?.reviews.length === 0 ? (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 10 }}>No reviews found matching filters.</TableCell></TableRow>
                        ) : reviewsData?.reviews.map((row) => (
                            <TableRow 
                                key={`${row.user_id}-${row.car_id || row.bike_id || row.agency_id || row.driver_id}`} 
                                hover
                                sx={{ 
                                    borderLeft: `5px solid ${row.rating >= 4.5 ? '#10b981' : row.rating <= 2.0 ? '#ef4444' : 'transparent'}`,
                                    opacity: !row.review ? 0.7 : 1,
                                    bgcolor: !row.review ? '#f9fafb' : 'inherit'
                                }}
                            >
                                <TableCell>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar src={row.reviewer_photo} sx={{ width: 40, height: 40, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{row.reviewer_name}</Typography>
                                            <Typography variant="caption" color="textSecondary">{row.reviewer_email}</Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    {currentType === 'car' || currentType === 'bike' ? (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Avatar src={row.images?.[0]} variant="rounded" sx={{ width: 45, height: 35 }} />
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">{row.brand} {row.model}</Typography>
                                                <Typography variant="caption" color="textSecondary">{row.car_type || row.bike_type}</Typography>
                                            </Box>
                                        </Stack>
                                    ) : currentType === 'agency' ? (
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">
                                                {row.agency_name} {row.verified && <CheckCircle sx={{ fontSize: 14, color: '#F97316', ml: 0.5 }} />}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">{row.city}</Typography>
                                        </Box>
                                    ) : (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Avatar src={row.driver_photo} sx={{ width: 35, height: 35 }} />
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">{row.driver_name}</Typography>
                                                <Chip label={row.license_status} size="small" sx={{ fontSize: 9, height: 16 }} color={row.license_status === 'Verified' ? 'success' : 'error'} />
                                            </Box>
                                        </Stack>
                                    )}
                                </TableCell>
                                { (currentType === 'car' || currentType === 'bike' || currentType === 'driver') && (
                                    <TableCell>
                                        <Typography variant="body2" color="#F97316" fontWeight="medium">
                                            {row.agency_name || <Chip label="Independent" size="small" variant="outlined" sx={{ fontSize: 10 }} />}
                                        </Typography>
                                    </TableCell>
                                )}
                                <TableCell>
                                    <RatingStars value={row.rating} />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontStyle: !row.review ? 'italic' : 'normal', color: !row.review ? 'text.disabled' : 'text.primary' }}>
                                        {row.review ? (row.review.length > 60 ? `${row.review.substring(0, 60)}...` : row.review) : 'No written review'}
                                        {row.review && row.review.length > 60 && (
                                            <Tooltip title="View Full Review">
                                                <IconButton size="small" onClick={() => { setSelectedReview(row); setIsDetailOpen(true); }} sx={{ ml: 0.5, color: '#F97316' }}>
                                                    <Visibility sx={{ fontSize: 14 }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{moment(row.date).format('MMM DD, YYYY')}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                        <Tooltip title="View Details">
                                            <IconButton size="small" onClick={() => { setSelectedReview(row); setIsDetailOpen(true); }} sx={{ color: '#F97316', bgcolor: '#fff7ed' }}>
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Review">
                                            <IconButton size="small" onClick={() => { setSelectedReview(row); setIsDeleteOpen(true); }} sx={{ color: '#ef4444', bgcolor: '#fef2f2' }}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #edf2f7' }}>
                    <Typography variant="caption" color="textSecondary">
                        Showing {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, reviewsData?.total || 0)} of {reviewsData?.total || 0} reviews 
                        {reviewsData?.reviews.length > 0 && ` · Avg Rating: ⭐ ${(reviewsData.reviews.reduce((acc, curr) => acc + parseFloat(curr.rating), 0) / reviewsData.reviews.length).toFixed(1)}`}
                    </Typography>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={reviewsData?.total || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, v) => setPage(v)}
                        onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    />
                </Box>
            </TableContainer>

            {/* Detail Modal */}
            <ReviewDetailModal 
                open={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                review={selectedReview}
                type={currentType}
                onDelete={() => { setIsDetailOpen(false); setIsDeleteOpen(true); }}
            />

            {/* Delete Confirmation */}
            <DeleteConfirmationDialog 
                open={isDeleteOpen} 
                onClose={() => setIsDeleteOpen(false)} 
                review={selectedReview}
                type={currentType}
                reason={deleteReason}
                setReason={setDeleteReason}
                onConfirm={() => {
                    deleteReviewMutation.mutate({
                        reviewId: selectedReview.car_id || selectedReview.bike_id || selectedReview.agency_id || selectedReview.driver_id,
                        user_id: selectedReview.user_id,
                        entity_id: selectedReview.car_id || selectedReview.bike_id || selectedReview.agency_id || selectedReview.driver_id,
                        rating: selectedReview.rating,
                        reason: deleteReason
                    });
                }}
                isLoading={deleteReviewMutation.isPending}
            />
        </Box>
    );
};

// --- Sub Components ---

const ReviewDetailModal = ({ open, onClose, review, type, onDelete }) => {
    if (!review) return null;

    const EntityInfo = () => {
        if (type === 'car' || type === 'bike') {
            return (
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar src={review.images?.[0]} variant="rounded" sx={{ width: 100, height: 70 }} />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">{review.brand} {review.model}</Typography>
                            <Typography variant="body2" color="primary">{review.agency_name}</Typography>
                            <Typography variant="caption" color="textSecondary">{review.car_type || review.bike_type}</Typography>
                        </Box>
                    </Box>
                    <Divider />
                    <Button variant="outlined" size="small" fullWidth>View Vehicle Profile</Button>
                </Stack>
            );
        }
        if (type === 'agency') {
            return (
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">{review.agency_name} {review.verified && <CheckCircle sx={{ fontSize: 16, color: '#F97316', ml: 0.5 }} />}</Typography>
                        <Typography variant="body2" color="textSecondary">{review.city}</Typography>
                    </Box>
                    <Divider />
                    <Button variant="outlined" size="small" fullWidth>View Agency Profile</Button>
                </Stack>
            );
        }
        if (type === 'driver') {
            return (
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar src={review.driver_photo} sx={{ width: 60, height: 60 }} />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">{review.driver_name}</Typography>
                            <Typography variant="body2" color="primary">{review.agency_name || 'Independent'}</Typography>
                            <Chip label={review.license_status} size="small" color="success" />
                        </Box>
                    </Box>
                    <Divider />
                    <Button variant="outlined" size="small" fullWidth>View Driver Profile</Button>
                </Stack>
            );
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F97316', color: 'white' }}>
                <Typography variant="h6">Review Details</Typography>
                <IconButton onClick={onClose} sx={{ color: 'white' }}><Close /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
                <Grid container spacing={4}>
                    {/* Section 1: Review */}
                    <Grid item xs={12} md={7}>
                        <Box sx={{ mb: 4 }}>
                            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                                <MuiRating value={parseFloat(review.rating)} readOnly size="large" sx={{ color: '#F97316' }} />
                                <Typography variant="h4" fontWeight="bold" sx={{ color: review.rating >= 4 ? '#10b981' : review.rating >= 3 ? '#F97316' : '#ef4444' }}>
                                    {parseFloat(review.rating).toFixed(1)}
                                </Typography>
                            </Stack>
                            <Typography variant="caption" color="textSecondary" display="block" mb={2}>
                                Submitted on {moment(review.date).format('LLLL')}
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, minHeight: '100px' }}>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontStyle: !review.review ? 'italic' : 'normal', color: !review.review ? 'text.disabled' : 'text.primary' }}>
                                    {review.review || "No written review — rating only"}
                                </Typography>
                            </Paper>
                        </Box>

                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Booking Context</Typography>
                            <Typography variant="body2" color="textSecondary" mb={2}>
                                Review submitted on {moment(review.date).format('MMM DD, YYYY')}. View customer's booking history for context.
                            </Typography>
                            <Button variant="contained" startIcon={<History />} sx={{ bgcolor: '#334155', '&:hover': { bgcolor: '#1e293b' }, textTransform: 'none' }}>View Reviewer's Bookings</Button>
                        </Box>
                    </Grid>

                    {/* Section 2: Reviewer & Entity */}
                    <Grid item xs={12} md={5}>
                        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">Reviewer Info</Typography>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar src={review.reviewer_photo} sx={{ width: 50, height: 50 }} />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">{review.reviewer_name}</Typography>
                                            <Typography variant="caption" color="textSecondary">{review.reviewer_email}</Typography>
                                        </Box>
                                    </Box>
                                    <Divider />
                                    <Button variant="outlined" size="small" fullWidth>View Full Profile</Button>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">Reviewed {type.charAt(0).toUpperCase() + type.slice(1)}</Typography>
                                <EntityInfo />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#f9fafb' }}>
                <Button variant="outlined" color="warning" startIcon={<EmojiFlags />}>Flag as Suspicious</Button>
                <Button variant="contained" color="error" startIcon={<Delete />} onClick={onDelete}>Delete Review</Button>
            </DialogActions>
        </Dialog>
    );
};

const DeleteConfirmationDialog = ({ open, onClose, review, reason, setReason, onConfirm, isLoading }) => {
    if (!review) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ color: '#ef4444', fontWeight: 'bold' }}>Delete Review?</DialogTitle>
            <DialogContent>
                <Typography variant="body2" mb={2}>Are you sure you want to delete this review by <strong>{review.reviewer_name}</strong>?</Typography>
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="caption" fontWeight="bold" display="block">⚠️ Deleting this review will:</Typography>
                    <Typography variant="caption" display="block">• Recalculate average rating</Typography>
                    <Typography variant="caption" display="block">• Reduce review count by 1</Typography>
                </Alert>
                <TextField 
                    fullWidth 
                    multiline 
                    rows={3} 
                    placeholder="Admin Reason (required)" 
                    label="Reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button 
                    variant="contained" 
                    color="error" 
                    onClick={onConfirm} 
                    disabled={!reason || isLoading}
                >
                    {isLoading ? "Deleting..." : "Confirm Delete"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const DetailRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="textSecondary">{label}:</Typography>
        <Typography variant="caption" fontWeight="bold">{value}</Typography>
    </Box>
);

const StatBox = ({ label, value, color }) => (
    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Typography variant="caption" fontWeight="bold" color="textSecondary">{label}</Typography>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ color }}>{value}</Typography>
    </Box>
);

export default AdminReviews;
