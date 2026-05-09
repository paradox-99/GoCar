import React, { useState, useMemo, useEffect } from 'react';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TablePagination,
    IconButton, Chip, Typography, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Grid, Card, CardContent,
    Alert, AlertTitle, Avatar, Divider, tableCellClasses, Stack, Checkbox, Collapse,
    Badge as MuiBadge, Switch, FormControlLabel, useTheme, Zoom, Fade, Tooltip as MuiTooltip
} from '@mui/material';
import {
    Visibility, CheckCircle, Cancel, Search, Download, Business, Person, DirectionsCar,
    TwoWheeler, Badge, Warning, Close, FilterList, AccessTime, History,
    CalendarToday, MoreVert, DoneAll, Block, VerifiedUser, Shield,
    Description, Event, LocalShipping, LocalGasStation, EventSeat, Settings,
    PostAdd, PhotoCamera, ContactPhone, LocationOn, CreditCard, AccountBox,
    CheckCircleOutline, CancelOutlined, Info, List as ListIcon, Assignment,
    Engineering, Stars
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import toast from 'react-hot-toast';
import moment from 'moment';

// Styled Components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#F9FAFB',
        color: '#4B5563',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        borderBottom: '2px solid #E5E7EB'
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 13,
        padding: '12px 16px'
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:hover': {
        backgroundColor: '#F9FAFB',
    },
    '&.selected': {
        backgroundColor: '#FFF7ED',
    },
    transition: 'all 0.2s ease-in-out'
}));

const TabBadge = styled(MuiBadge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#EF4444',
        color: 'white',
        fontSize: 10,
        height: 18,
        minWidth: 18,
        padding: '0 4px',
        fontWeight: 'bold'
    },
}));

const StatCard = ({ title, value, subLabel, color, icon, onClick, active }) => (
    <Card 
        onClick={onClick}
        sx={{ 
            cursor: 'pointer', 
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
            borderLeft: `6px solid ${color}`,
            borderRadius: 3,
            bgcolor: active ? `${color}08` : 'white',
            borderColor: active ? color : 'divider',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="caption" color="textSecondary" fontWeight="bold" textTransform="uppercase" letterSpacing={0.5}>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight="800" sx={{ mt: 0.5, color: color }}>
                        {value}
                    </Typography>
                    {subLabel && <Typography variant="caption" color="textSecondary">{subLabel}</Typography>}
                </Box>
                <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 44, height: 44 }}>
                    {icon}
                </Avatar>
            </Box>
        </CardContent>
    </Card>
);

const VerificationQueue = () => {
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const theme = useTheme();

    // Tabs & Filters State
    const [activeTab, setActiveTab] = useState(0); // 0: Agencies, 1: Drivers, 2: Cars, 3: Bikes, 4: Licenses
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [pendingOnly, setPendingOnly] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [verifiedFilter, setVerifiedFilter] = useState('All');
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [quickFilter, setQuickFilter] = useState('Pending');
    const [sortBy, setSortBy] = useState('oldest');

    // UI States
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isBulkApproveOpen, setIsBulkApproveOpen] = useState(false);
    const [isBulkRejectOpen, setIsBulkRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectNotes, setRejectNotes] = useState('');
    const [showAlertBanner, setShowAlertBanner] = useState(true);
    const [detailTab, setDetailTab] = useState(0);

    // Categories Configuration
    const categories = [
        { id: 'agencies', label: 'Agencies', icon: <Business />, accent: '#F97316' },
        { id: 'drivers', label: 'Drivers', icon: <Person />, accent: '#0D9488' },
        { id: 'cars', label: 'Cars', icon: <DirectionsCar />, accent: '#2563EB' },
        { id: 'bikes', label: 'Bikes', icon: <TwoWheeler />, accent: '#7C3AED' },
        { id: 'licenses', label: 'Licenses', icon: <Badge />, accent: '#D97706' }
    ];

    const currentCategory = categories[activeTab];

    // Queries
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['verification-stats'],
        queryFn: async () => {
            const res = await axiosPublic.get('verification/stats');
            return res.data;
        },
        refetchInterval: 30000 // Refetch every 30s
    });

    const { data: listData, isLoading: listLoading } = useQuery({
        queryKey: ['verification-list', activeTab, page, rowsPerPage, search, pendingOnly, statusFilter, verifiedFilter, dateRange, quickFilter, sortBy],
        queryFn: async () => {
            const params = {
                category: currentCategory.id,
                page: page + 1,
                limit: rowsPerPage,
                search,
                pendingOnly,
                status: statusFilter,
                verified: verifiedFilter,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                sortBy: quickFilter === 'Oldest First' ? 'oldest' : 'newest'
            };
            const res = await axiosPublic.get('verification/list', { params });
            return res.data;
        },
        keepPreviousData: true
    });

    // Mutations
    const approveMutation = useMutation({
        mutationFn: async ({ id, category, data }) => {
            let endpoint = '';
            if (category === 'agencies') endpoint = `agencyRoutes/admin/update/${id}`;
            else if (category === 'drivers') endpoint = `driverRoutes/verify/${id}`;
            else if (category === 'cars') endpoint = `adminVehicleRoutes/update-car/${id}`;
            else if (category === 'bikes') endpoint = `adminVehicleRoutes/update-bike/${id}`;
            else if (category === 'licenses') endpoint = `licenseRoutes/admin/update`;

            if (category === 'licenses') {
                return await axiosPublic.patch(endpoint, { id: data.id, type: data.type, status: 'Valid', expire_date: data.expire_date });
            }
            
            return await axiosPublic.patch(endpoint, data);
        },
        onSuccess: () => {
            toast.success('Approved successfully');
            queryClient.invalidateQueries(['verification-list']);
            queryClient.invalidateQueries(['verification-stats']);
            setIsApproveOpen(false);
            setIsDetailOpen(false);
            setSelectedItem(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Approval failed')
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ id, category, reason, notes }) => {
            // Rejection logic typically involves status update
            let endpoint = '';
            let payload = { status: 'Rejected', admin_note: `${reason}: ${notes}` };
            
            if (category === 'agencies') endpoint = `agencyRoutes/admin/update/${id}`;
            else if (category === 'drivers') endpoint = `driverRoutes/update-status/${id}`; // Adjust based on actual driver routes
            else if (category === 'cars') endpoint = `adminVehicleRoutes/update-car/${id}`;
            else if (category === 'bikes') endpoint = `adminVehicleRoutes/update-bike/${id}`;
            else if (category === 'licenses') endpoint = `licenseRoutes/admin/update`;

            if (category === 'licenses') {
                return await axiosPublic.patch(endpoint, { id: id, type: selectedItem.type, status: 'Rejected', reason: `${reason}: ${notes}` });
            }
            
            if (category === 'drivers') {
                payload = { verified: false, accountstatus: 'Suspended', admin_note: `${reason}: ${notes}` };
                return await axiosPublic.patch(`driverRoutes/update-status/${id}`, payload);
            }

            return await axiosPublic.patch(endpoint, { ...payload, verified: false });
        },
        onSuccess: () => {
            toast.error('Item rejected');
            queryClient.invalidateQueries(['verification-list']);
            queryClient.invalidateQueries(['verification-stats']);
            setIsRejectOpen(false);
            setIsDetailOpen(false);
            setSelectedItem(null);
            setRejectReason('');
            setRejectNotes('');
        }
    });

    const bulkUpdateMutation = useMutation({
        mutationFn: async ({ ids, category, status, reason }) => {
            // Simplified bulk update
            const promises = ids.map(id => {
                if (status === 'Approved') {
                    const data = category === 'agencies' ? { status: 'Active', verified: true } : { verified: true };
                    return approveMutation.mutateAsync({ id, category, data });
                } else {
                    return rejectMutation.mutateAsync({ id, category, reason: 'Bulk Rejection', notes: reason });
                }
            });
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success('Bulk action completed');
            queryClient.invalidateQueries(['verification-list']);
            queryClient.invalidateQueries(['verification-stats']);
            setSelectedIds([]);
            setIsBulkApproveOpen(false);
            setIsBulkRejectOpen(false);
        }
    });

    // Helpers
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setPage(0);
        setSelectedIds([]);
        setQuickFilter('Pending');
        setPendingOnly(true);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const ids = listData?.data?.map(item => item.agency_id || item.driver_id || item.car_id || item.bike_id || item.id) || [];
            setSelectedIds(ids);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectItem = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const getWaitingTime = (date) => {
        const days = moment().diff(moment(date), 'days');
        const hrs = moment().diff(moment(date), 'hours');
        
        if (hrs < 24) return <Typography variant="caption" sx={{ color: '#6B7280' }}>{hrs} hrs ago</Typography>;
        if (days <= 3) return <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 'bold' }}>{days} days ago</Typography>;
        return <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 'bold' }}>{days} days ago ⚠️</Typography>;
    };

    const getStatusBadge = (status, category) => {
        const s = status?.toLowerCase();
        if (s === 'active' || s === 'verified' || s === 'valid') 
            return <Chip size="small" icon={<CheckCircle sx={{ fontSize: 14 }}/>} label="Active" sx={{ bgcolor: '#DEF7EC', color: '#03543F', fontWeight: 'bold' }} />;
        if (s === 'pending' || s === 'unverified')
            return <Chip size="small" icon={<AccessTime sx={{ fontSize: 14 }}/>} label="Pending" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 'bold' }} />;
        if (s === 'rejected')
            return <Chip size="small" icon={<Cancel sx={{ fontSize: 14 }}/>} label="Rejected" sx={{ bgcolor: '#FDE2E2', color: '#9B1C1C', fontWeight: 'bold' }} />;
        if (s === 'suspended')
            return <Chip size="small" icon={<Block sx={{ fontSize: 14 }}/>} label="Suspended" sx={{ bgcolor: '#FFFBEB', color: '#B45309', fontWeight: 'bold' }} />;
        return <Chip size="small" label={status} />;
    };

    const getDocIndicator = (isPresent, label) => (
        <MuiTooltip title={label}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: isPresent ? '#10B981' : '#EF4444' }}>
                {isPresent ? <CheckCircleOutline sx={{ fontSize: 18 }} /> : <CancelOutlined sx={{ fontSize: 18 }} />}
            </Box>
        </MuiTooltip>
    );

    const getDocExpiryStyle = (date) => {
        if (!date) return { color: '#9CA3AF' };
        const days = moment(date).diff(moment(), 'days');
        if (days < 0) return { color: '#EF4444', fontWeight: 'bold' };
        if (days <= 30) return { color: '#F59E0B', fontWeight: 'bold' };
        return { color: '#10B981' };
    };

    // Rejection Reasons
    const rejectionReasons = {
        agencies: ["Incomplete documentation", "Invalid trade license", "Expired insurance", "Duplicate agency registration", "Failed verification check", "Other"],
        drivers: ["Invalid NID", "Invalid or expired license", "Incomplete profile information", "Failed background check", "Duplicate account", "Other"],
        cars: ["Missing documentation", "Expired vehicle license", "Expired insurance", "Vehicle not roadworthy", "Fraudulent information", "Other"],
        bikes: ["Missing documentation", "Expired vehicle license", "Expired insurance", "Vehicle not roadworthy", "Fraudulent information", "Other"],
        licenses: ["Invalid license number", "License already expired", "Document not verifiable", "Suspicious submission", "Incomplete information", "Other"]
    };

    return (
        <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: '1600px', mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: '800', color: '#111827', mb: 1 }}>Verification & Approvals</Typography>
                    <Typography variant="body2" color="textSecondary">Manage all pending verifications from a central location.</Typography>
                </Box>
                <Button variant="contained" startIcon={<Download />} sx={{ bgcolor: '#F97316', '&:hover': { bgcolor: '#EA580C' }, borderRadius: 2, px: 3 }}>
                    Download Report
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard 
                        title="Total Pending" 
                        value={stats?.total_pending || 0} 
                        subLabel="Requires your attention" 
                        color="#F97316" 
                        icon={<Assignment />}
                        active={false}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard 
                        title="Pending Agencies" 
                        value={stats?.pending_agencies || 0} 
                        color="#F97316" 
                        icon={<Business />}
                        onClick={() => setActiveTab(0)}
                        active={activeTab === 0}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard 
                        title="Pending Drivers" 
                        value={stats?.pending_drivers || 0} 
                        color="#0D9488" 
                        icon={<Person />}
                        onClick={() => setActiveTab(1)}
                        active={activeTab === 1}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard 
                        title="Pending Cars" 
                        value={stats?.pending_cars || 0} 
                        color="#2563EB" 
                        icon={<DirectionsCar />}
                        onClick={() => setActiveTab(2)}
                        active={activeTab === 2}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard 
                        title="Pending Bikes" 
                        value={stats?.pending_bikes || 0} 
                        color="#7C3AED" 
                        icon={<TwoWheeler />}
                        onClick={() => setActiveTab(3)}
                        active={activeTab === 3}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard 
                        title="Pending Licenses" 
                        value={stats?.pending_licenses || 0} 
                        color="#D97706" 
                        icon={<Badge />}
                        onClick={() => setActiveTab(4)}
                        active={activeTab === 4}
                    />
                </Grid>
            </Grid>

            {/* Global Alert Banner */}
            <Collapse in={showAlertBanner && (stats?.total_pending > 0)}>
                <Alert 
                    severity="warning" 
                    icon={false}
                    sx={{ 
                        mb: 4, 
                        borderRadius: 3, 
                        bgcolor: '#FFF7ED', 
                        border: '1px solid #FFEDD5',
                        '& .MuiAlert-message': { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: '#9A3412', fontWeight: '600' }}>
                            🟠 You have {stats?.total_pending} pending approvals waiting for review.
                        </Typography>
                        <Stack direction="row" spacing={1} ml={2}>
                            <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => setActiveTab(0)}>Agencies: {stats?.pending_agencies}</Typography>
                            <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => setActiveTab(1)}>Drivers: {stats?.pending_drivers}</Typography>
                            <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => setActiveTab(2)}>Cars: {stats?.pending_cars}</Typography>
                            <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => setActiveTab(3)}>Bikes: {stats?.pending_bikes}</Typography>
                            <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => setActiveTab(4)}>Licenses: {stats?.pending_licenses}</Typography>
                        </Stack>
                    </Box>
                    <IconButton size="small" onClick={() => setShowAlertBanner(false)}><Close fontSize="inherit" /></IconButton>
                </Alert>
            </Collapse>

            {/* Tabs */}
            <Paper sx={{ mb: 4, borderRadius: 3, overflow: 'hidden', borderBottom: '1px solid #E5E7EB' }}>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{ 
                        '& .MuiTabs-indicator': { height: 4, bgcolor: currentCategory.accent, borderRadius: '4px 4px 0 0' },
                        bgcolor: 'white'
                    }}
                >
                    {categories.map((cat, index) => (
                        <Tab 
                            key={cat.id}
                            icon={
                                <TabBadge badgeContent={index === 0 ? stats?.pending_agencies : index === 1 ? stats?.pending_drivers : index === 2 ? stats?.pending_cars : index === 3 ? stats?.pending_bikes : stats?.pending_licenses} invisible={!(index === 0 ? stats?.pending_agencies : index === 1 ? stats?.pending_drivers : index === 2 ? stats?.pending_cars : index === 3 ? stats?.pending_bikes : stats?.pending_licenses) || (index === 0 ? stats?.pending_agencies : index === 1 ? stats?.pending_drivers : index === 2 ? stats?.pending_cars : index === 3 ? stats?.pending_bikes : stats?.pending_licenses) <= 0}>
                                    {cat.icon}
                                </TabBadge>
                            }
                            iconPosition="start"
                            label={cat.label} 
                            sx={{ 
                                py: 3, 
                                fontWeight: 'bold', 
                                color: '#6B7280',
                                '&.Mui-selected': { color: cat.accent }
                            }}
                        />
                    ))}
                </Tabs>
            </Paper>

            {/* Filters Bar */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField 
                            fullWidth size="small" 
                            placeholder={`Search ${currentCategory.label.toLowerCase()}...`}
                            value={search} onChange={e => setSearch(e.target.value)}
                            InputProps={{ 
                                startAdornment: <Search sx={{ mr: 1, color: '#9CA3AF' }} />,
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControlLabel
                            control={<Switch checked={pendingOnly} onChange={e => { setPendingOnly(e.target.checked); setQuickFilter(e.target.checked ? 'Pending' : 'All'); }} color="warning" />}
                            label={<Typography variant="body2" fontWeight="600">Pending Only</Typography>}
                        />
                    </Grid>
                    {!pendingOnly && (
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status Filter</InputLabel>
                                <Select value={statusFilter} label="Status Filter" onChange={e => setStatusFilter(e.target.value)} sx={{ borderRadius: 2 }}>
                                    <MenuItem value="All">All Items</MenuItem>
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Pending">Pending</MenuItem>
                                    <MenuItem value="Rejected">Rejected</MenuItem>
                                    {activeTab === 0 && <MenuItem value="Suspended">Suspended</MenuItem>}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}
                    <Grid item xs={12} md={pendingOnly ? 4 : 2} sx={{ display: 'flex', gap: 1 }}>
                         <TextField 
                            type="date" size="small" fullWidth 
                            value={dateRange.startDate} onChange={e => setDateRange({...dateRange, startDate: e.target.value})}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        <TextField 
                            type="date" size="small" fullWidth 
                            value={dateRange.endDate} onChange={e => setDateRange({...dateRange, endDate: e.target.value})}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="outlined" startIcon={<Download />} sx={{ color: '#F97316', borderColor: '#F97316', borderRadius: 2 }}>Export CSV</Button>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['Pending', 'Approved / Verified', 'Rejected', 'Today', 'This Week', 'Oldest First'].map(pill => (
                        <Chip 
                            key={pill} label={pill} 
                            onClick={() => {
                                setQuickFilter(pill);
                                if (pill === 'Pending') setPendingOnly(true);
                                else if (pill === 'Approved / Verified' || pill === 'Rejected') setPendingOnly(false);
                            }}
                            sx={{ 
                                borderRadius: '12px',
                                fontWeight: '600',
                                bgcolor: quickFilter === pill ? '#F97316' : '#F3F4F6',
                                color: quickFilter === pill ? 'white' : '#4B5563',
                                '&:hover': { bgcolor: quickFilter === pill ? '#EA580C' : '#E5E7EB' }
                            }}
                        />
                    ))}
                </Box>
            </Paper>

            {/* Bulk Actions Floating Bar */}
            <Fade in={selectedIds.length > 0}>
                <Paper 
                    sx={{ 
                        position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', 
                        zIndex: 1000, p: 2, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4,
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                        border: '1px solid #E5E7EB', bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)'
                    }}
                >
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#111827' }}>
                        <DoneAll sx={{ verticalAlign: 'middle', mr: 1, color: '#F97316' }} />
                        {selectedIds.length} items selected
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button variant="contained" size="small" color="success" sx={{ borderRadius: 2 }} onClick={() => setIsBulkApproveOpen(true)}>Approve All</Button>
                        <Button variant="contained" size="small" color="error" sx={{ borderRadius: 2 }} onClick={() => setIsBulkRejectOpen(true)}>Reject All</Button>
                        <Button variant="outlined" size="small" sx={{ borderRadius: 2 }} onClick={() => setSelectedIds([])}>Deselect</Button>
                    </Stack>
                </Paper>
            </Fade>

            {/* Table Area */}
            <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 'none', border: '1px solid #E5E7EB' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell padding="checkbox" sx={{ bgcolor: 'white' }}>
                                <Checkbox size="small" checked={selectedIds.length > 0 && selectedIds.length === listData?.data?.length} onChange={handleSelectAll} />
                            </StyledTableCell>
                            {activeTab === 0 && (
                                <>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Agency</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Owner</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Location</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Fleet</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Documents</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>License Expiry</StyledTableCell>
                                </>
                            )}
                            {activeTab === 1 && (
                                <>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Driver</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Agency</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>NID</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>License</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Experience</StyledTableCell>
                                </>
                            )}
                            {(activeTab === 2 || activeTab === 3) && (
                                <>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Vehicle</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Agency</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Specs</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Rental Price</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Documentation</StyledTableCell>
                                </>
                            )}
                            {activeTab === 4 && (
                                <>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Person</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Type</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Agency/Role</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>License Number</StyledTableCell>
                                    <StyledTableCell sx={{ bgcolor: 'white' }}>Expiry Date</StyledTableCell>
                                </>
                            )}
                            <StyledTableCell sx={{ bgcolor: 'white' }}>Status</StyledTableCell>
                            <StyledTableCell sx={{ bgcolor: 'white' }}>Submitted</StyledTableCell>
                            <StyledTableCell align="center" sx={{ bgcolor: 'white' }}>Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listLoading ? (
                            <TableRow><TableCell colSpan={10} align="center" sx={{ py: 10 }}><Fade in><Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}><Info sx={{ color: '#F97316', fontSize: 40 }} /><Typography color="textSecondary">Loading approval queue...</Typography></Box></Fade></TableCell></TableRow>
                        ) : listData?.data?.length === 0 ? (
                            <TableRow><TableCell colSpan={10} align="center" sx={{ py: 10 }}><Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}><CheckCircleOutline sx={{ color: '#10B981', fontSize: 48 }} /><Typography variant="h6" fontWeight="bold">Queue is empty!</Typography><Typography variant="body2" color="textSecondary">Great job! All pending verifications have been processed.</Typography></Box></TableCell></TableRow>
                        ) : listData?.data?.map((row) => {
                            const id = row.agency_id || row.driver_id || row.car_id || row.bike_id || row.id;
                            const isSelected = selectedIds.includes(id);
                            
                            return (
                                <StyledTableRow key={id} className={isSelected ? 'selected' : ''}>
                                    <StyledTableCell padding="checkbox">
                                        <Checkbox size="small" checked={isSelected} onChange={() => handleSelectItem(id)} />
                                    </StyledTableCell>
                                    
                                    {/* Agency Tab Content */}
                                    {activeTab === 0 && (
                                        <>
                                            <StyledTableCell>
                                                <Typography variant="body2" fontWeight="bold">{row.agency_name}</Typography>
                                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>{row.email}</Typography>
                                                <Typography variant="caption" color="textSecondary">{row.phone_number}</Typography>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Typography variant="body2">{row.owner_name}</Typography>
                                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>{row.owner_email}</Typography>
                                                <Chip size="small" label={row.owner_status} sx={{ height: 16, fontSize: '10px' }} />
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Typography variant="body2">{row.city}</Typography>
                                                <Typography variant="caption" color="textSecondary">{row.area}</Typography>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Stack direction="row" spacing={1}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{row.car_count} <DirectionsCar sx={{ fontSize: 14 }} /></Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{row.bike_count} <TwoWheeler sx={{ fontSize: 14 }} /></Box>
                                                </Stack>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Stack direction="row" spacing={1}>
                                                    {getDocIndicator(row.license, 'License')}
                                                    {getDocIndicator(row.tin, 'TIN')}
                                                    {getDocIndicator(row.insurancenumber, 'Insurance')}
                                                    {getDocIndicator(row.tradelicenseexpire, 'Trade License')}
                                                </Stack>
                                            </StyledTableCell>
                                            <StyledTableCell sx={getDocExpiryStyle(row.tradelicenseexpire)}>
                                                {row.tradelicenseexpire ? moment(row.tradelicenseexpire).format('MMM DD, YYYY') : 'Not Set'}
                                            </StyledTableCell>
                                        </>
                                    )}

                                    {/* Drivers Tab Content */}
                                    {activeTab === 1 && (
                                        <>
                                            <StyledTableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar src={row.photo} sx={{ width: 32, height: 32 }} />
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">{row.name}</Typography>
                                                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>{row.email}</Typography>
                                                    </Box>
                                                </Box>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                {row.agency_id ? (
                                                    <Chip label={row.agency_name} size="small" sx={{ bgcolor: '#FFF7ED', color: '#F97316', fontWeight: 'bold' }} />
                                                ) : (
                                                    <Chip label="Independent" size="small" variant="outlined" />
                                                )}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                    {row.nid ? `****${row.nid.slice(-4)}` : <Typography color="error" variant="caption">Not Provided</Typography>}
                                                </Typography>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{row.license_number || 'N/A'}</Typography>
                                                    <Typography variant="caption" sx={getDocExpiryStyle(row.expire_date)}>{row.expire_date ? moment(row.expire_date).format('MMM DD, YYYY') : 'No Expiry'}</Typography>
                                                </Box>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Typography variant="body2">{row.experience_year} Years</Typography>
                                            </StyledTableCell>
                                        </>
                                    )}

                                    {/* Cars/Bikes Tab Content */}
                                    {(activeTab === 2 || activeTab === 3) && (
                                        <>
                                            <StyledTableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar variant="rounded" src={row.images?.[0]} sx={{ width: 44, height: 44 }} />
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">{row.brand} {row.model}</Typography>
                                                        <Typography variant="caption" color="textSecondary">{row.build_year} • {row.car_type}</Typography>
                                                    </Box>
                                                </Box>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Chip label={row.agency_name} size="small" sx={{ bgcolor: '#FFF7ED', color: '#F97316', fontWeight: 'bold' }} />
                                                {row.agency_verified && <MuiTooltip title="Verified Agency"><Shield sx={{ fontSize: 14, color: '#10B981', ml: 0.5, verticalAlign: 'middle' }} /></MuiTooltip>}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Stack spacing={0.5}>
                                                    {activeTab === 2 ? (
                                                        <Stack direction="row" spacing={1}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 11 }}><EventSeat sx={{ fontSize: 12 }} /> {row.seats}</Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 11 }}><Settings sx={{ fontSize: 12 }} /> {row.transmission_type?.charAt(0)}</Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 11 }}><LocalGasStation sx={{ fontSize: 12 }} /> {row.fuel?.charAt(0)}</Box>
                                                        </Stack>
                                                    ) : (
                                                        <Stack direction="row" spacing={1}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 11 }}><Engineering sx={{ fontSize: 12 }} /> {row.engine_capacity}cc</Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 11 }}><Stars sx={{ fontSize: 12 }} /> ABS</Box>
                                                        </Stack>
                                                    )}
                                                </Stack>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Typography variant="body2" fontWeight="bold">৳{row.rental_price}/hr</Typography>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Stack direction="row" spacing={1}>
                                                    {getDocIndicator(row.doc_license, 'License')}
                                                    {getDocIndicator(row.insurance_number, 'Insurance')}
                                                    {getDocIndicator(row.fitness_certificate, 'Fitness')}
                                                </Stack>
                                            </StyledTableCell>
                                        </>
                                    )}

                                    {/* Licenses Tab Content */}
                                    {activeTab === 4 && (
                                        <>
                                            <StyledTableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar src={row.photo} sx={{ width: 32, height: 32 }} />
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">{row.name}</Typography>
                                                        <Typography variant="caption" color="textSecondary">{row.email}</Typography>
                                                    </Box>
                                                </Box>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Chip label={row.type} size="small" sx={{ bgcolor: row.type === 'user' ? '#EFF6FF' : '#F0FDFA', color: row.type === 'user' ? '#1E40AF' : '#0F766E', fontWeight: 'bold', textTransform: 'capitalize' }} />
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                {row.type === 'driver' ? (
                                                    <Chip label={row.agency_name || 'Independent'} size="small" sx={{ bgcolor: '#FFF7ED', color: '#F97316' }} />
                                                ) : (
                                                    <Typography variant="caption" color="textSecondary">{row.accountstatus}</Typography>
                                                )}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{row.license_number || 'N/A'}</Typography>
                                            </StyledTableCell>
                                            <StyledTableCell sx={getDocExpiryStyle(row.expire_date)}>
                                                {row.expire_date ? moment(row.expire_date).format('MMM DD, YYYY') : 'Not Set'}
                                            </StyledTableCell>
                                        </>
                                    )}

                                    <StyledTableCell>
                                        {getStatusBadge(row.status || (row.verified ? 'Verified' : 'Pending'), currentCategory.id)}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Box>
                                            <Typography variant="body2">{moment(row.created_at).format('MMM DD, YYYY')}</Typography>
                                            {getWaitingTime(row.created_at)}
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Stack direction="row" spacing={0.5} justifyContent="center">
                                            <IconButton size="small" sx={{ color: '#3B82F6' }} onClick={() => { setSelectedItem(row); setIsDetailOpen(true); }}><Visibility fontSize="small" /></IconButton>
                                            <IconButton 
                                                size="small" sx={{ color: '#10B981' }} 
                                                onClick={() => { setSelectedItem(row); setIsApproveOpen(true); }}
                                                disabled={row.status === 'Active' || row.verified === true || row.license_status === 'Verified'}
                                            ><CheckCircleOutline fontSize="small" /></IconButton>
                                            <IconButton 
                                                size="small" sx={{ color: '#EF4444' }} 
                                                onClick={() => { setSelectedItem(row); setIsRejectOpen(true); }}
                                                disabled={row.status === 'Rejected' || row.license_status === 'Rejected'}
                                            ><CancelOutlined fontSize="small" /></IconButton>
                                        </Stack>
                                    </StyledTableCell>
                                </StyledTableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={listData?.total || 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, v) => setPage(v)}
                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    sx={{ bgcolor: 'white' }}
                />
            </TableContainer>

            {/* Detail Modal */}
            <Dialog open={isDetailOpen} onClose={() => setIsDetailOpen(false)} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 4 } }}>
                {selectedItem && (
                    <>
                        <DialogTitle sx={{ bgcolor: currentCategory.accent, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {selectedItem.photo || selectedItem.images ? (
                                    <Avatar src={selectedItem.photo || selectedItem.images?.[0]} sx={{ width: 56, height: 56, border: '2px solid white' }} />
                                ) : (
                                    <Avatar sx={{ width: 56, height: 56, bgcolor: 'white', color: currentCategory.accent }}>{selectedItem.agency_name?.charAt(0) || selectedItem.name?.charAt(0)}</Avatar>
                                )}
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">{selectedItem.agency_name || selectedItem.name || `${selectedItem.brand} ${selectedItem.model}`}</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.9 }}>Verification ID: {selectedItem.agency_id || selectedItem.driver_id || selectedItem.car_id || selectedItem.bike_id || selectedItem.id}</Typography>
                                </Box>
                            </Box>
                            <IconButton onClick={() => setIsDetailOpen(false)} sx={{ color: 'white' }}><Close /></IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ p: 0 }}>
                            <Tabs value={detailTab} onChange={(e, v) => setDetailTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                                <Tab label="Overview" />
                                {activeTab === 0 && <Tab label="Owner" />}
                                {activeTab === 0 && <Tab label="Fleet" />}
                                {(activeTab === 0 || activeTab === 2 || activeTab === 3) && <Tab label="Documentation" />}
                                {activeTab === 1 && <Tab label="License" />}
                                {activeTab === 1 && <Tab label="Profile" />}
                                {activeTab === 4 && <Tab label="History" />}
                            </Tabs>
                            
                            <Box sx={{ p: 4, minHeight: 400 }}>
                                {detailTab === 0 && (
                                    <Grid container spacing={4}>
                                        <Grid item xs={12} md={7}>
                                            <Typography variant="subtitle2" color="textSecondary" textTransform="uppercase" fontWeight="bold" gutterBottom>General Information</Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}><Typography variant="caption" color="textSecondary">Name/Entity</Typography><Typography variant="body2" fontWeight="600">{selectedItem.agency_name || selectedItem.name || `${selectedItem.brand} ${selectedItem.model}`}</Typography></Grid>
                                                <Grid item xs={6}><Typography variant="caption" color="textSecondary">Contact</Typography><Typography variant="body2">{selectedItem.email || selectedItem.phone || 'N/A'}</Typography></Grid>
                                                <Grid item xs={6}><Typography variant="caption" color="textSecondary">Type/Category</Typography><Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{selectedItem.car_type || selectedItem.type || currentCategory.label}</Typography></Grid>
                                                <Grid item xs={6}><Typography variant="caption" color="textSecondary">Submitted At</Typography><Typography variant="body2">{moment(selectedItem.created_at).format('LLLL')}</Typography></Grid>
                                                <Grid item xs={12}><Typography variant="caption" color="textSecondary">Address/Location</Typography><Typography variant="body2">{selectedItem.full_address || `${selectedItem.city || ''} ${selectedItem.area || ''}` || 'Not Set'}</Typography></Grid>
                                            </Grid>
                                            
                                            <Box sx={{ mt: 4 }}>
                                                <Typography variant="subtitle2" color="textSecondary" textTransform="uppercase" fontWeight="bold" gutterBottom>Verification Status</Typography>
                                                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                                    <Paper variant="outlined" sx={{ p: 2, flex: 1, borderRadius: 2 }}>
                                                        <Typography variant="caption" color="textSecondary" display="block">Legal Status</Typography>
                                                        {getStatusBadge(selectedItem.status || 'Pending')}
                                                    </Paper>
                                                    <Paper variant="outlined" sx={{ p: 2, flex: 1, borderRadius: 2 }}>
                                                        <Typography variant="caption" color="textSecondary" display="block">Identity Verified</Typography>
                                                        {selectedItem.verified ? <Chip size="small" label="Verified" color="success" /> : <Chip size="small" label="Unverified" color="error" />}
                                                    </Paper>
                                                </Stack>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={5}>
                                            {selectedItem.images?.length > 0 && (
                                                <Box sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                                                    <img src={selectedItem.images[0]} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                                                    <Box sx={{ p: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
                                                        {selectedItem.images.map((img, i) => (
                                                            <Avatar key={i} variant="rounded" src={img} sx={{ width: 48, height: 48, cursor: 'pointer', border: '1px solid #E5E7EB' }} />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}
                                            {activeTab === 0 && (
                                                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#F9FAFB', mt: 2 }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Fleet Summary</Typography>
                                                    <Stack spacing={1}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2">Total Cars</Typography><Typography variant="body2" fontWeight="bold">{selectedItem.car_count}</Typography></Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2">Total Bikes</Typography><Typography variant="body2" fontWeight="bold">{selectedItem.bike_count}</Typography></Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2">Avg Rating</Typography><Typography variant="body2" fontWeight="bold">⭐ {selectedItem.rating || 'N/A'}</Typography></Box>
                                                    </Stack>
                                                </Paper>
                                            )}
                                        </Grid>
                                    </Grid>
                                )}
                                
                                {detailTab === 1 && (
                                    <Box>
                                        {activeTab === 0 ? (
                                            <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                                <Avatar src={selectedItem.owner_photo} sx={{ width: 120, height: 120, border: '4px solid #F97316' }} />
                                                <Box>
                                                    <Typography variant="h5" fontWeight="bold">{selectedItem.owner_name}</Typography>
                                                    <Typography variant="body1" color="textSecondary">{selectedItem.owner_email}</Typography>
                                                    <Typography variant="body2" sx={{ mt: 1 }}>Phone: {selectedItem.owner_phone}</Typography>
                                                    <Typography variant="body2">Account Status: <Chip size="small" label={selectedItem.owner_status} color="success" /></Typography>
                                                    <Button variant="outlined" size="small" sx={{ mt: 2, borderRadius: 2 }}>View Profile</Button>
                                                </Box>
                                            </Box>
                                        ) : activeTab === 1 ? (
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="subtitle2" color="textSecondary" fontWeight="bold" gutterBottom>Driver License</Typography>
                                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                                                        <Typography variant="caption" color="textSecondary">License Number</Typography>
                                                        <Typography variant="h6" sx={{ fontFamily: 'monospace', mb: 2 }}>{selectedItem.license_number || 'N/A'}</Typography>
                                                        <Typography variant="caption" color="textSecondary">Expiry Date</Typography>
                                                        <Typography variant="body1" sx={getDocExpiryStyle(selectedItem.expire_date)}>{selectedItem.expire_date ? moment(selectedItem.expire_date).format('LL') : 'Not Provided'}</Typography>
                                                        <Divider sx={{ my: 2 }} />
                                                        <Typography variant="caption" color="textSecondary">Experience</Typography>
                                                        <Typography variant="body1" fontWeight="bold">{selectedItem.experience_year} Years</Typography>
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        ) : null}
                                    </Box>
                                )}

                                {(detailTab === 2 || detailTab === 3) && (
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold" mb={3}>Submitted Documents Checklist</Typography>
                                        <Grid container spacing={3}>
                                            {[
                                                { label: 'Operating License', value: selectedItem.license || selectedItem.doc_license, icon: <Badge /> },
                                                { label: 'TIN / Tax Identification', value: selectedItem.tin, icon: <CreditCard /> },
                                                { label: 'Vehicle Insurance', value: selectedItem.insurancenumber || selectedItem.insurance_number, icon: <Shield /> },
                                                { label: 'Fitness Certificate', value: selectedItem.fitness_certificate, icon: <Assignment /> },
                                                { label: 'Trade License Expiry', value: selectedItem.tradelicenseexpire || selectedItem.doc_expiry, icon: <CalendarToday />, isDate: true }
                                            ].map((doc, i) => (
                                                <Grid item xs={12} md={6} key={i}>
                                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, borderColor: !doc.value ? '#FECACA' : '#E5E7EB', bgcolor: !doc.value ? '#FEF2F2' : 'white' }}>
                                                        <Avatar sx={{ bgcolor: doc.value ? '#DCFCE7' : '#FEE2E2', color: doc.value ? '#166534' : '#991B1B' }}>{doc.icon}</Avatar>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="caption" color="textSecondary" fontWeight="bold">{doc.label}</Typography>
                                                            <Typography variant="body2" fontWeight="600">
                                                                {doc.isDate ? (doc.value ? moment(doc.value).format('LL') : 'No Date Set') : (doc.value || 'Not Provided')}
                                                            </Typography>
                                                        </Box>
                                                        {doc.value ? <CheckCircle sx={{ color: '#10B981' }} /> : <Cancel sx={{ color: '#EF4444' }} />}
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, bgcolor: '#F9FAFB' }}>
                            <Button onClick={() => setIsDetailOpen(false)} color="inherit">Close</Button>
                            <Box sx={{ flex: 1 }} />
                            <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => setIsApproveOpen(true)} sx={{ borderRadius: 2 }}>Approve / Verify</Button>
                            <Button variant="contained" color="error" startIcon={<Cancel />} onClick={() => setIsRejectOpen(true)} sx={{ borderRadius: 2 }}>Reject</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Approval Confirmation */}
            <Dialog open={isApproveOpen} onClose={() => setIsApproveOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 4 } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" /> Approve {currentCategory.label.slice(0, -1)}: {selectedItem?.agency_name || selectedItem?.name || `${selectedItem?.brand} ${selectedItem?.model}`}?
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>Confirming verification for this entity will update its status to active and grant platform access.</Typography>
                    
                    {/* Context Warnings */}
                    <Box sx={{ mt: 2 }}>
                        {activeTab === 0 && !selectedItem?.insurancenumber && (
                            <Alert severity="warning" sx={{ mb: 1, borderRadius: 2 }}>⚠️ Missing documents: Insurance</Alert>
                        )}
                        {activeTab === 0 && !selectedItem?.tin && (
                            <Alert severity="warning" sx={{ mb: 1, borderRadius: 2 }}>⚠️ Missing documents: TIN</Alert>
                        )}
                        {selectedItem?.tradelicenseexpire && moment(selectedItem.tradelicenseexpire).diff(moment(), 'days') <= 30 && (
                            <Alert severity="warning" sx={{ mb: 1, borderRadius: 2 }}>⚠️ Trade license expires in {moment(selectedItem.tradelicenseexpire).diff(moment(), 'days')} days.</Alert>
                        )}
                        {(activeTab === 2 || activeTab === 3) && !selectedItem?.doc_license && (
                            <Alert severity="warning" sx={{ mb: 1, borderRadius: 2 }}>⚠️ Missing vehicle license document.</Alert>
                        )}
                        {activeTab === 4 && !selectedItem?.expire_date && (
                            <Alert severity="warning" sx={{ mb: 1, borderRadius: 2 }}>⚠️ Expiry date not set.</Alert>
                        )}
                    </Box>

                    {activeTab === 4 && (
                        <TextField 
                            fullWidth type="date" label="Set Expiry Date" size="small" 
                            InputLabelProps={{ shrink: true }} sx={{ mt: 3 }}
                            value={selectedItem?.expire_date ? moment(selectedItem.expire_date).format('YYYY-MM-DD') : ''}
                            onChange={(e) => setSelectedItem({...selectedItem, expire_date: e.target.value})}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsApproveOpen(false)}>Cancel</Button>
                    <Button 
                        variant="contained" color="success" sx={{ borderRadius: 2 }}
                        onClick={() => {
                            const id = selectedItem.agency_id || selectedItem.driver_id || selectedItem.car_id || selectedItem.bike_id || selectedItem.id;
                            const data = activeTab === 0 ? { status: 'Active', verified: true } : 
                                         activeTab === 1 ? { verified: true } :
                                         activeTab === 2 || activeTab === 3 ? { verified: true, status: 'Available' } :
                                         { id, type: selectedItem.type, expire_date: selectedItem.expire_date };
                            approveMutation.mutate({ id, category: currentCategory.id, data });
                        }}
                    >
                        ✓ Confirm Approval
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={isRejectOpen} onClose={() => setIsRejectOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 4 } }}>
                <DialogTitle sx={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Cancel /> Reject {currentCategory.label.slice(0, -1)}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#FEE2E2', borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight="bold">{selectedItem?.agency_name || selectedItem?.name || `${selectedItem?.brand} ${selectedItem?.model}`}</Typography>
                        <Typography variant="caption">{currentCategory.label.slice(0, -1)} • Submitted {moment(selectedItem?.created_at).fromNow()}</Typography>
                    </Box>
                    
                    <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                        <InputLabel>Rejection Reason</InputLabel>
                        <Select value={rejectReason} label="Rejection Reason" onChange={e => setRejectReason(e.target.value)} sx={{ borderRadius: 2 }}>
                            {rejectionReasons[currentCategory.id].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <TextField 
                        fullWidth multiline rows={4} label="Additional Notes" 
                        placeholder={rejectReason === 'Other' ? "Please specify reason..." : "Describe the issue in detail..."}
                        value={rejectNotes} onChange={e => setRejectNotes(e.target.value)}
                        required={rejectReason === 'Other'}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsRejectOpen(false)}>Cancel</Button>
                    <Button 
                        variant="contained" color="error" sx={{ borderRadius: 2 }}
                        disabled={!rejectReason || (rejectReason === 'Other' && !rejectNotes.trim())}
                        onClick={() => {
                            const id = selectedItem.agency_id || selectedItem.driver_id || selectedItem.car_id || selectedItem.bike_id || selectedItem.id;
                            rejectMutation.mutate({ id, category: currentCategory.id, reason: rejectReason, notes: rejectNotes });
                        }}
                    >
                        ✗ Reject Item
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Approve Dialog */}
            <Dialog open={isBulkApproveOpen} onClose={() => setIsBulkApproveOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 4 } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" /> Bulk Approve {selectedIds.length} {currentCategory.label}?
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        You are about to approve the following items:
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 2, mb: 3 }}>
                        {selectedIds.slice(0, 5).map(id => {
                            const item = listData?.data?.find(i => (i.agency_id || i.driver_id || i.car_id || i.bike_id || i.id) === id);
                            return <Typography key={id} variant="caption" display="block">• {item?.agency_name || item?.name || `${item?.brand} ${item?.model}`}</Typography>;
                        })}
                        {selectedIds.length > 5 && <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>+ {selectedIds.length - 5} more</Typography>}
                    </Box>

                    {/* Warning Count */}
                    {(() => {
                        const itemsWithWarnings = selectedIds.filter(id => {
                            const item = listData?.data?.find(i => (i.agency_id || i.driver_id || i.car_id || i.bike_id || i.id) === id);
                            if (activeTab === 0 && (!item?.license || !item?.tin || !item?.insurancenumber)) return true;
                            if ((activeTab === 2 || activeTab === 3) && !item?.doc_license) return true;
                            if (item?.expire_date && moment(item.expire_date).isBefore(moment())) return true;
                            return false;
                        }).length;

                        if (itemsWithWarnings > 0) {
                            return (
                                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                                    ⚠️ <strong>{itemsWithWarnings}</strong> of these items have incomplete documentation or expired dates. Approve anyway?
                                </Alert>
                            );
                        }
                        return null;
                    })()}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsBulkApproveOpen(false)}>Cancel</Button>
                    <Button 
                        variant="contained" color="success" sx={{ borderRadius: 2 }}
                        onClick={() => bulkUpdateMutation.mutate({ ids: selectedIds, category: currentCategory.id, status: 'Approved' })}
                    >
                        ✓ Bulk Approve Selected
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Reject Dialog */}
            <Dialog open={isBulkRejectOpen} onClose={() => setIsBulkRejectOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 4 } }}>
                <DialogTitle sx={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Cancel /> Bulk Reject {selectedIds.length} {currentCategory.label}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Select a shared reason for rejecting these {selectedIds.length} items:
                    </Typography>
                    
                    <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                        <InputLabel>Shared Rejection Reason</InputLabel>
                        <Select value={rejectReason} label="Shared Rejection Reason" onChange={e => setRejectReason(e.target.value)} sx={{ borderRadius: 2 }}>
                            {rejectionReasons[currentCategory.id].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <TextField 
                        fullWidth multiline rows={3} label="Additional Notes (Optional)" 
                        value={rejectNotes} onChange={e => setRejectNotes(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsBulkRejectOpen(false)}>Cancel</Button>
                    <Button 
                        variant="contained" color="error" sx={{ borderRadius: 2 }}
                        disabled={!rejectReason}
                        onClick={() => bulkUpdateMutation.mutate({ ids: selectedIds, category: currentCategory.id, status: 'Rejected', reason: rejectReason })}
                    >
                        ✗ Bulk Reject
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default VerificationQueue;
