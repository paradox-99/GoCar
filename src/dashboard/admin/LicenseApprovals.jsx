import React, { useState, useMemo, useEffect } from 'react';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TablePagination,
    IconButton, Chip, Typography, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Grid, Card, CardContent,
    Alert, AlertTitle, Avatar, Divider, tableCellClasses, Stack, Checkbox, Collapse,
    LinearProgress, Badge as MuiBadge
} from '@mui/material';
import {
    Info, Search, Download, Person, Business, 
    Close, Analytics, Visibility, CheckCircle, 
    Cancel, Warning, ContentCopy, History,
    CheckCircleOutline, CancelOutlined, AccessTime, Event,
    Work, Star, DirectionsCar, ErrorOutline
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import toast from 'react-hot-toast';
import moment from 'moment';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer,
    LineChart, Line, Cell, PieChart, Pie, Legend
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

const LicenseStatusBadge = ({ status }) => {
    switch (status) {
        case 'Verified':
            return <Chip icon={<CheckCircleOutline />} label="Valid" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 'bold' }} />;
        case 'Unverified':
            return <Chip icon={<AccessTime />} label="Pending" size="small" sx={{ bgcolor: '#fff7ed', color: '#9a3412', fontWeight: 'bold' }} />;
        case 'Expired':
            return <Chip icon={<ErrorOutline />} label="Expired" size="small" sx={{ bgcolor: '#fef2f2', color: '#991b1b', fontWeight: 'bold' }} />;
        case 'Rejected':
            return <Chip icon={<CancelOutlined />} label="Rejected" size="small" variant="outlined" sx={{ color: '#991b1b', fontWeight: 'bold', borderColor: '#ef4444' }} />;
        default:
            return <Chip label={status || 'No License'} size="small" />;
    }
};

const LicenseApprovals = () => {
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(0); // 0: User, 1: Driver
    
    // Pagination & Filters
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [expiryFilter, setExpiryFilter] = useState('All');
    const [accountStatusFilter, setAccountStatusFilter] = useState('All');
    const [verifiedFilter, setVerifiedFilter] = useState('All');
    const [quickFilter, setQuickFilter] = useState('Pending Approval');
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

    // UI States
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isBulkApproveOpen, setIsBulkApproveOpen] = useState(false);
    const [isBulkRejectOpen, setIsBulkRejectOpen] = useState(false);
    
    const [rejectReason, setRejectReason] = useState('Invalid License Number');
    const [otherReason, setOtherReason] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [newExpireDate, setNewExpireDate] = useState('');

    const currentType = activeTab === 0 ? 'user' : 'driver';

    // Queries
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-license-stats'],
        queryFn: async () => {
            const res = await axiosPublic.get('licenseRoutes/admin/stats');
            return res.data;
        }
    });

    const { data: listData, isLoading: listLoading } = useQuery({
        queryKey: ['admin-license-list', currentType, page, rowsPerPage, search, statusFilter, expiryFilter, accountStatusFilter, verifiedFilter, quickFilter, dateRange],
        queryFn: async () => {
            const params = {
                type: currentType,
                page: page + 1,
                limit: rowsPerPage,
                search,
                status: statusFilter,
                expiryStatus: expiryFilter,
                accountStatus: accountStatusFilter,
                verified: verifiedFilter,
                quickFilter,
                ...dateRange
            };
            const res = await axiosPublic.get('licenseRoutes/admin/list', { params });
            return res.data;
        }
    });

    const { data: analyticsData } = useQuery({
        queryKey: ['admin-license-analytics'],
        queryFn: async () => {
            const res = await axiosPublic.get('licenseRoutes/admin/analytics');
            return res.data;
        },
        enabled: showAnalytics
    });

    // Mutations
    const updateMutation = useMutation({
        mutationFn: async (payload) => {
            return await axiosPublic.patch('licenseRoutes/admin/update', payload);
        },
        onSuccess: (data) => {
            toast.success(data.data.message || 'Updated successfully');
            queryClient.invalidateQueries(['admin-license-list']);
            queryClient.invalidateQueries(['admin-license-stats']);
            setIsApproveOpen(false);
            setIsRejectOpen(false);
            setIsDetailOpen(false);
        }
    });

    const bulkUpdateMutation = useMutation({
        mutationFn: async (payload) => {
            return await axiosPublic.patch('licenseRoutes/admin/bulk-update', payload);
        },
        onSuccess: (data) => {
            toast.success(data.data.message || 'Bulk update successful');
            queryClient.invalidateQueries(['admin-license-list']);
            queryClient.invalidateQueries(['admin-license-stats']);
            setSelectedIds([]);
            setIsBulkApproveOpen(false);
            setIsBulkRejectOpen(false);
        }
    });

    // Handlers
    const handleApprove = () => {
        updateMutation.mutate({
            id: selectedItem[currentType === 'user' ? 'user_id' : 'driver_id'],
            type: currentType,
            status: 'Valid',
            expire_date: newExpireDate || selectedItem.expire_date
        });
    };

    const handleReject = () => {
        const finalReason = rejectReason === 'Other' ? otherReason : rejectReason;
        updateMutation.mutate({
            id: selectedItem[currentType === 'user' ? 'user_id' : 'driver_id'],
            type: currentType,
            status: 'Rejected',
            reason: finalReason
        });
    };

    const handleBulkApprove = () => {
        bulkUpdateMutation.mutate({
            ids: selectedIds,
            type: currentType,
            status: 'Valid'
        });
    };

    const handleBulkReject = () => {
        const finalReason = rejectReason === 'Other' ? otherReason : rejectReason;
        bulkUpdateMutation.mutate({
            ids: selectedIds,
            type: currentType,
            status: 'Rejected',
            reason: finalReason
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(listData?.data?.map(item => item[currentType === 'user' ? 'user_id' : 'driver_id']) || []);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const getExpiryColor = (date) => {
        if (!date) return 'text.secondary';
        const days = moment(date).diff(moment(), 'days');
        if (days < 0) return '#ef4444';
        if (days <= 7) return '#ef4444';
        if (days <= 30) return '#f59e0b';
        return '#10b981';
    };

    const getRowStyle = (item) => {
        const days = item.expire_date ? moment(item.expire_date).diff(moment(), 'days') : null;
        if (item.license_status === 'Unverified') return { borderLeft: '4px solid #F97316' };
        if (item.license_status === 'Expired' || (days !== null && days < 0)) return { borderLeft: '4px solid #ef4444', bgcolor: '#f9fafb' };
        if (days !== null && days <= 7) return { borderLeft: '4px solid #ef4444' };
        if (days !== null && days <= 30) return { borderLeft: '4px solid #f59e0b' };
        if (item.license_status === 'Rejected') return { borderLeft: '4px solid #94a3b8', bgcolor: '#f9fafb' };
        return {};
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', mx: 'auto' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937' }}>License Approvals</Typography>
                <Button 
                    variant="outlined" 
                    startIcon={<Analytics />} 
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    sx={{ color: '#F97316', borderColor: '#F97316' }}
                >
                    {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                </Button>
            </Stack>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Pending', value: statsData?.stats?.pending || 0, color: '#F97316', filter: 'Pending Approval' },
                    { label: 'Approved / Valid', value: statsData?.stats?.valid || 0, color: '#10b981', filter: 'Valid' },
                    { label: 'Rejected', value: statsData?.stats?.rejected || 0, color: '#ef4444', filter: 'Rejected' },
                    { label: 'Expired', value: statsData?.stats?.expired || 0, color: '#ef4444', filter: 'Expired' },
                    { label: 'Expiring Soon', value: statsData?.stats?.expiring_soon || 0, color: '#f59e0b', filter: 'Expiring in 30 Days' },
                    { label: 'No License', value: statsData?.stats?.no_license || 0, color: '#94a3b8', filter: 'No License Number' },
                ].map((s, i) => (
                    <Grid item xs={12} sm={6} md={2} key={i}>
                        <Card 
                            sx={{ cursor: 'pointer', transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }, borderLeft: `4px solid ${s.color}` }}
                            onClick={() => setQuickFilter(s.filter)}
                        >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Typography variant="caption" color="textSecondary" fontWeight="bold" textTransform="uppercase">{s.label}</Typography>
                                <Typography variant="h5" fontWeight="bold" sx={{ color: s.color, mt: 1 }}>{s.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Banners */}
            <Collapse in={!statsLoading}>
                <Stack spacing={1} mb={4}>
                    {(statsData?.banners?.user_expired > 0 || statsData?.banners?.driver_expired > 0) && (
                        <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }} onClick={() => setQuickFilter('Expired')} icon={<ErrorOutline />}>
                            🔴 <strong>{parseInt(statsData?.banners?.user_expired) + parseInt(statsData?.banners?.driver_expired)}</strong> licenses have already expired ({statsData?.banners?.user_expired} users + {statsData?.banners?.driver_expired} drivers). Immediate action required.
                        </Alert>
                    )}
                    {(statsData?.banners?.user_expiring > 0 || statsData?.banners?.driver_expiring > 0) && (
                        <Alert severity="warning" variant="filled" sx={{ borderRadius: 2 }} onClick={() => setQuickFilter('Expiring in 30 Days')} icon={<Warning />}>
                            ⚠️ <strong>{parseInt(statsData?.banners?.user_expiring) + parseInt(statsData?.banners?.driver_expiring)}</strong> licenses are expiring within the next 30 days ({statsData?.banners?.user_expiring} users + {statsData?.banners?.driver_expiring} drivers). Review Now.
                        </Alert>
                    )}
                    {(statsData?.banners?.user_pending > 0 || statsData?.banners?.driver_pending > 0) && (
                        <Alert severity="info" variant="filled" sx={{ borderRadius: 2, bgcolor: '#F97316' }} onClick={() => setQuickFilter('Pending Approval')} icon={<AccessTime />}>
                            🟠 <strong>{parseInt(statsData?.banners?.user_pending) + parseInt(statsData?.banners?.driver_pending)}</strong> licenses are awaiting approval ({statsData?.banners?.user_pending} users + {statsData?.banners?.driver_pending} drivers). Review Queue.
                        </Alert>
                    )}
                </Stack>
            </Collapse>

            {/* Analytics Panel */}
            <Collapse in={showAnalytics}>
                <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2}>Status Distribution</Typography>
                            <Box sx={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={analyticsData?.distribution} 
                                            innerRadius={60} 
                                            outerRadius={80} 
                                            paddingAngle={5} 
                                            dataKey="value"
                                        >
                                            {analyticsData?.distribution?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.name === 'Valid' ? '#10b981' : entry.name === 'Pending' ? '#F97316' : entry.name === 'Expired' ? '#ef4444' : '#94a3b8'} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2}>Expiring Forecast (Next 12 Months)</Typography>
                            <Box sx={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsData?.forecast}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <ChartTooltip />
                                        <Bar dataKey="count" fill="#F97316" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2}>Experience Distribution</Typography>
                            <Box sx={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsData?.experience} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="range" type="category" axisLine={false} tickLine={false} width={80} />
                                        <ChartTooltip />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Collapse>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, v) => { setActiveTab(v); setPage(0); setSelectedIds([]); }} TabIndicatorProps={{ style: { backgroundColor: '#F97316' } }}>
                    <Tab label="👤 User Licenses" sx={{ fontWeight: 'bold', '&.Mui-selected': { color: '#F97316' } }} />
                    <Tab label="🚗 Driver Licenses" sx={{ fontWeight: 'bold', '&.Mui-selected': { color: '#F97316' } }} />
                </Tabs>
            </Box>

            {/* Filter Controls */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField 
                            fullWidth size="small" 
                            placeholder={activeTab === 0 ? "Search users..." : "Search drivers..."} 
                            value={search} onChange={e => setSearch(e.target.value)} 
                            InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'gray' }}/> }} 
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
                                <MenuItem value="All">All Status</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Valid">Valid</MenuItem>
                                <MenuItem value="Expired">Expired</MenuItem>
                                <MenuItem value="Rejected">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Expiry</InputLabel>
                            <Select value={expiryFilter} label="Expiry" onChange={e => setExpiryFilter(e.target.value)}>
                                <MenuItem value="All">All Expiry</MenuItem>
                                <MenuItem value="Valid">Valid</MenuItem>
                                <MenuItem value="Expiring Soon">Expiring Soon</MenuItem>
                                <MenuItem value="Expired">Expired</MenuItem>
                                <MenuItem value="No Expiry Set">No Expiry Set</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>{activeTab === 0 ? "Account Status" : "Driver Status"}</InputLabel>
                            <Select value={accountStatusFilter} label="Account Status" onChange={e => setAccountStatusFilter(e.target.value)}>
                                <MenuItem value="All">All Status</MenuItem>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Suspended">Suspended</MenuItem>
                                <MenuItem value="Banned">Banned</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} md={1.5}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Verified</InputLabel>
                            <Select value={verifiedFilter} label="Verified" onChange={e => setVerifiedFilter(e.target.value)}>
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="Verified">Verified</MenuItem>
                                <MenuItem value="Unverified">Unverified</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={1.5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="outlined" fullWidth sx={{ color: '#F97316', borderColor: '#F97316' }}><Download /></Button>
                    </Grid>
                </Grid>

                <Stack direction="row" spacing={1} mt={2} sx={{ overflowX: 'auto', pb: 1 }}>
                    {['All', 'Pending Approval', 'Valid', 'Expired', 'Expiring in 7 Days', 'Expiring in 30 Days', 'Rejected', 'No License Number'].map(pill => (
                        <Chip 
                            key={pill} label={pill} 
                            onClick={() => setQuickFilter(pill)}
                            sx={{ 
                                fontWeight: 'bold', 
                                bgcolor: quickFilter === pill ? (pill.includes('Expired') || pill.includes('7 Days') ? '#ef4444' : pill === 'Pending Approval' ? '#F97316' : pill === 'Valid' ? '#10b981' : '#F97316') : 'transparent',
                                color: quickFilter === pill ? '#fff' : 'inherit',
                                border: '1px solid',
                                borderColor: quickFilter === pill ? 'transparent' : '#ddd'
                            }}
                        />
                    ))}
                </Stack>
            </Paper>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#fff7ed', border: '1px solid #ffedd5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="bold">{selectedIds.length} licenses selected</Typography>
                    <Stack direction="row" spacing={2}>
                        <Button size="small" variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => setIsBulkApproveOpen(true)}>Approve Selected</Button>
                        <Button size="small" variant="contained" color="error" startIcon={<Cancel />} onClick={() => setIsBulkRejectOpen(true)}>Reject Selected</Button>
                        <Button size="small" onClick={() => setSelectedIds([])}>Deselect All</Button>
                    </Stack>
                </Paper>
            )}

            {/* Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell padding="checkbox">
                                <Checkbox 
                                    checked={selectedIds.length > 0 && selectedIds.length === listData?.data?.length}
                                    onChange={handleSelectAll} 
                                    sx={{ color: 'white' }}
                                />
                            </StyledTableCell>
                            <StyledTableCell>{activeTab === 0 ? "User" : "Driver"}</StyledTableCell>
                            <StyledTableCell>{activeTab === 0 ? "Role" : "Agency"}</StyledTableCell>
                            <StyledTableCell>License Number</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                            <StyledTableCell>Expiry Date</StyledTableCell>
                            <StyledTableCell>{activeTab === 0 ? "Experience" : "Performance"}</StyledTableCell>
                            <StyledTableCell>Verified</StyledTableCell>
                            <StyledTableCell align="right">Action</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listLoading ? (
                            <TableRow><TableCell colSpan={9} align="center"><LinearProgress sx={{ my: 4, width: '50%', mx: 'auto' }}/></TableCell></TableRow>
                        ) : listData?.data?.map((item) => {
                            const itemId = item[currentType === 'user' ? 'user_id' : 'driver_id'];
                            const isSelected = selectedIds.includes(itemId);
                            const rowStyle = getRowStyle(item);
                            const days = item.expire_date ? moment(item.expire_date).diff(moment(), 'days') : null;

                            return (
                                <TableRow key={itemId} hover sx={rowStyle}>
                                    <TableCell padding="checkbox">
                                        <Checkbox checked={isSelected} onChange={() => handleSelectOne(itemId)} />
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar src={item.photo} alt={item.name} />
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {item.name}
                                                    {(item.accountstatus === 'Suspended' || item.accountstatus === 'Banned') && 
                                                        <Tooltip title={item.accountstatus}><Warning sx={{ fontSize: 14, color: '#ef4444', ml: 0.5 }} /></Tooltip>
                                                    }
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">{item.email}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {activeTab === 0 ? (
                                            <Chip label={item.userrole} size="small" sx={{ 
                                                bgcolor: item.userrole === 'admin' ? '#fef2f2' : item.userrole === 'agency' ? '#fff7ed' : '#eff6ff',
                                                color: item.userrole === 'admin' ? '#ef4444' : item.userrole === 'agency' ? '#F97316' : '#3b82f6',
                                                fontWeight: 'bold'
                                            }} />
                                        ) : (
                                            <Chip 
                                                label={item.agency_name || "Independent"} 
                                                size="small" 
                                                sx={{ bgcolor: item.agency_name ? '#fff7ed' : '#f3f4f6', color: item.agency_name ? '#F97316' : '#4b5563' }} 
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{item.license_number || 'Not Provided'}</Typography>
                                            {item.license_number && <IconButton size="small" onClick={() => { navigator.clipboard.writeText(item.license_number); toast.success('Copied!'); }}><ContentCopy fontSize="inherit"/></IconButton>}
                                        </Stack>
                                    </TableCell>
                                    <TableCell><LicenseStatusBadge status={item.license_status} /></TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: getExpiryColor(item.expire_date), fontWeight: 'bold' }}>
                                                {item.expire_date ? moment(item.expire_date).format('MMM DD, YYYY') : 'Not Set'}
                                                {days !== null && days < 0 && <Warning sx={{ fontSize: 14, ml: 0.5 }} />}
                                                {days !== null && days >= 0 && days <= 30 && <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: days <= 7 ? '#ef4444' : '#f59e0b', display: 'inline-block', ml: 0.5 }} />}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {activeTab === 0 ? (
                                            <Typography variant="body2">{item.experience ? `${item.experience} Years` : '—'}</Typography>
                                        ) : (
                                            <Box>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <Star sx={{ color: '#fbbf24', fontSize: 16 }} />
                                                    <Typography variant="body2" fontWeight="bold">{item.rating || '0.0'}</Typography>
                                                </Stack>
                                                <Typography variant="caption" color="textSecondary">{item.completed_bookings || 0} Trips</Typography>
                                            </Box>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {item.verified ? <CheckCircle sx={{ color: '#10b981' }} /> : <Cancel sx={{ color: '#ef4444' }} />}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" justifyContent="flex-end">
                                            <IconButton size="small" sx={{ color: '#3b82f6' }} onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }}><Visibility fontSize="small" /></IconButton>
                                            <IconButton 
                                                size="small" color="success" 
                                                disabled={item.license_status === 'Verified' || !item.license_number}
                                                onClick={() => { setSelectedItem(item); setIsApproveOpen(true); }}
                                            ><CheckCircleOutline fontSize="small" /></IconButton>
                                            <IconButton 
                                                size="small" color="error" 
                                                disabled={item.license_status === 'Rejected' || !item.license_number}
                                                onClick={() => { setSelectedItem(item); setIsRejectOpen(true); }}
                                            ><CancelOutlined fontSize="small" /></IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]} component="div" count={listData?.total || 0} rowsPerPage={rowsPerPage} page={page}
                    onPageChange={(e, v) => setPage(v)} onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </TableContainer>

            {/* Detail Modal */}
            <Dialog open={isDetailOpen} onClose={() => setIsDetailOpen(false)} maxWidth="md" fullWidth>
                {selectedItem && (
                    <>
                        <DialogTitle sx={{ bgcolor: '#F97316', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            License Detail View
                            <IconButton onClick={() => setIsDetailOpen(false)} sx={{ color: 'white' }}><Close /></IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4} className="text-center">
                                    <Avatar src={selectedItem.photo} sx={{ width: 120, height: 120, mx: 'auto', mb: 2, border: '4px solid #F97316' }} />
                                    <Typography variant="h6" fontWeight="bold">{selectedItem.name}</Typography>
                                    <Chip label={selectedItem.accountstatus} size="small" color={selectedItem.accountstatus === 'Active' ? 'success' : 'error'} sx={{ mt: 1 }} />
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Typography variant="subtitle2" color="textSecondary" textTransform="uppercase" fontWeight="bold" gutterBottom>License Information</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="caption" color="textSecondary">License Number</Typography>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>{selectedItem.license_number || 'N/A'}</Typography>
                                                    {selectedItem.license_number && <IconButton size="small" onClick={() => { navigator.clipboard.writeText(selectedItem.license_number); toast.success('Copied!'); }}><ContentCopy fontSize="small"/></IconButton>}
                                                </Stack>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="caption" color="textSecondary">Current Status</Typography>
                                                <Box mt={0.5}><LicenseStatusBadge status={selectedItem.license_status} /></Box>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="caption" color="textSecondary">Expiry Status</Typography>
                                                <Stack direction="row" alignItems="center" spacing={2} mt={1}>
                                                    <Box flex={1}>
                                                        <Typography variant="body2" fontWeight="bold" color={getExpiryColor(selectedItem.expire_date)}>
                                                            {selectedItem.expire_date ? moment(selectedItem.expire_date).format('MMM DD, YYYY') : 'Not Set'}
                                                        </Typography>
                                                        {selectedItem.expire_date && (
                                                            <Typography variant="caption" display="block">
                                                                {moment(selectedItem.expire_date).diff(moment(), 'days') < 0 
                                                                    ? `Expired ${Math.abs(moment(selectedItem.expire_date).diff(moment(), 'days'))} days ago`
                                                                    : `${moment(selectedItem.expire_date).diff(moment(), 'days')} days remaining`}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    <Box sx={{ width: '100px' }}>
                                                        {selectedItem.expire_date && (
                                                            <LinearProgress 
                                                                variant="determinate" 
                                                                value={Math.max(0, Math.min(100, (moment(selectedItem.expire_date).diff(moment(), 'days') / 365) * 100))} 
                                                                sx={{ height: 8, borderRadius: 5, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: getExpiryColor(selectedItem.expire_date) } }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    <Divider sx={{ my: 3 }} />
                                    
                                    <Typography variant="subtitle2" color="textSecondary" textTransform="uppercase" fontWeight="bold" gutterBottom>Holder Information</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}><Typography variant="caption" color="textSecondary">Full Name</Typography><Typography variant="body2">{selectedItem.name}</Typography></Grid>
                                        <Grid item xs={6}><Typography variant="caption" color="textSecondary">Email</Typography><Typography variant="body2">{selectedItem.email}</Typography></Grid>
                                        <Grid item xs={6}><Typography variant="caption" color="textSecondary">Phone</Typography><Typography variant="body2">{selectedItem.phone}</Typography></Grid>
                                        <Grid item xs={6}><Typography variant="caption" color="textSecondary">NID</Typography><Typography variant="body2">{selectedItem.nid || '—'}</Typography></Grid>
                                        <Grid item xs={6}><Typography variant="caption" color="textSecondary">Location</Typography><Typography variant="body2">{selectedItem.city || '—'}, {selectedItem.area || '—'}</Typography></Grid>
                                        <Grid item xs={6}><Typography variant="caption" color="textSecondary">{activeTab === 0 ? "Role" : "Agency"}</Typography><Typography variant="body2">{activeTab === 0 ? selectedItem.userrole : (selectedItem.agency_name || 'Independent')}</Typography></Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 2, bgcolor: '#f9fafb' }}>
                            <Button onClick={() => setIsDetailOpen(false)}>Close</Button>
                            <Box flex={1} />
                            <Button 
                                variant="contained" color="success" 
                                disabled={selectedItem.license_status === 'Verified'} 
                                onClick={() => setIsApproveOpen(true)}
                                startIcon={<CheckCircle />}
                            >Approve</Button>
                            <Button 
                                variant="contained" color="error" 
                                disabled={selectedItem.license_status === 'Rejected'} 
                                onClick={() => setIsRejectOpen(true)}
                                startIcon={<Cancel />}
                            >Reject</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Approve Dialog */}
            <Dialog open={isApproveOpen} onClose={() => setIsApproveOpen(false)}>
                <DialogTitle>Approve License?</DialogTitle>
                <DialogContent>
                    <Typography mb={2}>Are you sure you want to approve the license for <strong>{selectedItem?.name}</strong>?</Typography>
                    <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                        <Typography variant="body2"><strong>Number:</strong> {selectedItem?.license_number}</Typography>
                        <Typography variant="body2"><strong>Expiry:</strong> {selectedItem?.expire_date ? moment(selectedItem?.expire_date).format('MMM DD, YYYY') : 'Not Set'}</Typography>
                    </Box>
                    <TextField 
                        fullWidth size="small" type="date" label="Update Expiry Date (Optional)" 
                        value={newExpireDate} onChange={e => setNewExpireDate(e.target.value)}
                        InputLabelProps={{ shrink: true }} sx={{ mt: 3 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsApproveOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleApprove}>Approve Now</Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectOpen} onClose={() => setIsRejectOpen(false)}>
                <DialogTitle>Reject License?</DialogTitle>
                <DialogContent>
                    <Typography mb={2}>Rejecting license for <strong>{selectedItem?.name}</strong>. Please select a reason:</Typography>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Reason</InputLabel>
                        <Select value={rejectReason} label="Reason" onChange={e => setRejectReason(e.target.value)}>
                            <MenuItem value="Invalid License Number">Invalid License Number</MenuItem>
                            <MenuItem value="License Already Expired">License Already Expired</MenuItem>
                            <MenuItem value="Document Not Verifiable">Document Not Verifiable</MenuItem>
                            <MenuItem value="Suspicious/Fraudulent Submission">Suspicious/Fraudulent Submission</MenuItem>
                            <MenuItem value="Incomplete Information">Incomplete Information</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                    </FormControl>
                    {rejectReason === 'Other' && <TextField fullWidth multiline rows={3} placeholder="Please specify reason..." value={otherReason} onChange={e => setOtherReason(e.target.value)} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsRejectOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleReject}>Confirm Reject</Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Dialogs */}
            <Dialog open={isBulkApproveOpen} onClose={() => setIsBulkApproveOpen(false)}>
                <DialogTitle>Bulk Approve Licenses?</DialogTitle>
                <DialogContent>
                    <Typography>Approve <strong>{selectedIds.length}</strong> selected licenses? This will set them all to 'Valid'.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsBulkApproveOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleBulkApprove}>Bulk Approve</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isBulkRejectOpen} onClose={() => setIsBulkRejectOpen(false)}>
                <DialogTitle>Bulk Reject Licenses?</DialogTitle>
                <DialogContent>
                    <Typography mb={2}>Reject <strong>{selectedIds.length}</strong> selected licenses? Select a shared reason:</Typography>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Reason</InputLabel>
                        <Select value={rejectReason} label="Reason" onChange={e => setRejectReason(e.target.value)}>
                            <MenuItem value="Invalid License Number">Invalid License Number</MenuItem>
                            <MenuItem value="Document Not Verifiable">Document Not Verifiable</MenuItem>
                            <MenuItem value="Incomplete Information">Incomplete Information</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsBulkRejectOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleBulkReject}>Bulk Reject</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default LicenseApprovals;
