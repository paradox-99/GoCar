import React, { useState, useMemo, useEffect } from 'react';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
    IconButton, Chip, Typography, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Grid, Card, CardContent,
    Alert, AlertTitle, Avatar, Collapse, Divider, tableCellClasses, Stack, Stepper, Step, StepLabel,
    Checkbox, FormControlLabel, Switch
} from '@mui/material';
import {
    Info, Edit, Cancel as CancelIcon, Search, Download, CheckCircle, DirectionsCar, TwoWheeler,
    Close, Warning, History, Payments, Build, MyLocation, AccountCircle, Assignment, AccessTime,
    ContentCopy, Star, Person, Business, FileDownload, FilterList, AccessAlarms, FiberManualRecord
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import toast from 'react-hot-toast';
import moment from 'moment';

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

const BookingStatusBadge = ({ status }) => {
    let color = "default";
    let sx = { fontWeight: 'bold', textTransform: 'capitalize' };
    
    switch (status) {
        case 'Requested': color = "warning"; break;
        case 'Confirmed': color = "info"; break;
        case 'Running': color = "secondary"; sx.bgcolor = "#06b6d4"; break; // Cyan/Teal
        case 'Completed': color = "success"; break;
        case 'Cancelled': color = "error"; break;
        case 'Overdue': color = "error"; break;
        default: color = "default";
    }
    
    return <Chip label={status} color={color} size="small" sx={sx} />;
};

const Bookings = () => {
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(0); // 0 = Cars, 1 = Bikes
    
    // Pagination & Filters
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [driverFilter, setDriverFilter] = useState('All');
    const [cancelledByFilter, setCancelledByFilter] = useState('All');
    const [dateRange, setDateRange] = useState({ created_start: '', created_end: '', trip_start: '', trip_end: '' });
    
    // Quick Filters
    const [quickFilter, setQuickFilter] = useState(null);

    // Modals
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [cancelData, setCancelData] = useState({ reason: '', cancelledBy: 'Admin' });

    // Queries
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-booking-stats', activeTab],
        queryFn: async () => {
            const res = await axiosPublic.get(`bookingRoutes/admin/stats?vehicle_type=${activeTab === 0 ? 'Car' : 'Bike'}`);
            return res.data;
        }
    });

    const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
        queryKey: ['admin-bookings', activeTab, page, rowsPerPage, search, statusFilter, paymentFilter, driverFilter, cancelledByFilter, dateRange, quickFilter],
        queryFn: async () => {
            const params = {
                vehicle_type: activeTab === 0 ? 'Car' : 'Bike',
                page,
                limit: rowsPerPage,
                search,
                status: quickFilter === 'Overdue' ? 'Running' : statusFilter,
                payment_status: paymentFilter,
                driver_status: driverFilter,
                cancelled_by: cancelledByFilter,
                ...dateRange,
                quick_filter: quickFilter
            };
            const res = await axiosPublic.get('bookingRoutes/admin/filtered', { params });
            return res.data;
        }
    });

    // Mutations
    const updateBookingMutation = useMutation({
        mutationFn: async (updatedData) => {
            return await axiosPublic.patch(`bookingRoutes/admin/update/${updatedData.booking_id}`, updatedData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-bookings']);
            queryClient.invalidateQueries(['admin-booking-stats']);
            toast.success('Booking updated successfully');
            setIsEditOpen(false);
            setIsCancelOpen(false);
        },
        onError: (err) => toast.error(err.message || 'Update failed')
    });

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const handleExportCSV = () => {
        if (!bookingsData?.bookings) return;
        const headers = ["Booking ID", "Customer", "Vehicle", "Trip Start", "Trip End", "Cost", "Status", "Payment Initial", "Payment Final", "Booked At"];
        const rows = bookingsData.bookings.map(b => [
            b.booking_id, 
            `"${b.user_name}"`, 
            `"${b.brand} ${b.model}"`, 
            moment(b.start_ts).format('YYYY-MM-DD HH:mm'), 
            moment(b.end_ts).format('YYYY-MM-DD HH:mm'), 
            b.total_cost, 
            b.status, 
            b.initial_payment ? 'Paid' : 'Unpaid', 
            b.final_payment ? 'Paid' : 'Unpaid', 
            moment(b.booking_ts).format('YYYY-MM-DD HH:mm')
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings_export_${activeTab === 0 ? 'cars' : 'bikes'}.csv`;
        a.click();
    };

    const overdueCount = stats?.overdue_count || 0;

    const quickFilterPills = [
        { label: "Today's Bookings", value: 'Today' },
        { label: "This Week", value: 'Week' },
        { label: "Unpaid Bookings", value: 'Unpaid' },
        { label: "With Driver", value: 'WithDriver' },
        { label: "Cancelled by User", value: 'CancelledByUser' },
        { label: "Has Damage Report", value: 'HasDamage' },
        { label: "Overdue Returns", value: 'Overdue' },
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', mx: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>Bookings Management</Typography>

            {/* Overdue Alert */}
            {overdueCount > 0 && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} icon={<AccessAlarms />}>
                    <AlertTitle sx={{ fontWeight: 'bold' }}>Overdue Returns Warning</AlertTitle>
                    {overdueCount} bookings are overdue — vehicles not yet returned. 
                    <Button size="small" sx={{ ml: 2, fontWeight: 'bold' }} onClick={() => setQuickFilter('Overdue')}>View Overdue</Button>
                </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs value={activeTab} onChange={(e, v) => { setActiveTab(v); setPage(0); }} TabIndicatorProps={{ style: { backgroundColor: '#F97316' } }}>
                    <Tab label="🚗 Car Bookings" sx={{ fontWeight: 'bold', '&.Mui-selected': { color: '#F97316' } }} />
                    <Tab label="🏍️ Bike Bookings" sx={{ fontWeight: 'bold', '&.Mui-selected': { color: '#F97316' } }} />
                </Tabs>
            </Box>

            {/* Stat Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Bookings', value: stats?.total_bookings || 0, color: '#64748b', status: 'All' },
                    { label: 'Running', value: stats?.running || 0, color: '#3b82f6', status: 'Running' },
                    { label: 'Requested', value: stats?.requested || 0, color: '#F97316', status: 'Requested' },
                    { label: 'Completed', value: stats?.completed || 0, color: '#10b981', status: 'Completed' },
                    { label: 'Cancelled', value: stats?.cancelled || 0, color: '#ef4444', status: 'Cancelled' },
                    { label: 'Total Revenue', value: `৳${stats?.total_revenue?.toLocaleString() || 0}`, color: '#000', status: 'Completed' },
                    { label: 'Overdue', value: stats?.overdue || 0, color: '#ef4444', status: 'Overdue' },
                    { label: 'Cancelled by User', value: stats?.cancelled_by_user || 0, color: '#ef4444', status: 'CancelledByUser' },
                    { label: 'Cancelled by Agency', value: stats?.cancelled_by_agency || 0, color: '#ef4444', status: 'CancelledByAgency' },
                    { label: 'Cancelled by Admin', value: stats?.cancelled_by_admin || 0, color: '#ef4444', status: 'CancelledByAdmin' },
                ].map((s, i) => (
                    <Grid item xs={6} sm={4} md={2} key={i}>
                        <Card 
                            sx={{ 
                                cursor: 'pointer', 
                                transition: '0.2s', 
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
                                borderLeft: `4px solid ${s.color}`
                            }}
                            onClick={() => s.status !== 'All' ? setStatusFilter(s.status) : setStatusFilter('All')}
                        >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Typography variant="caption" color="textSecondary" fontWeight="bold">{s.label}</Typography>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: s.color }}>{s.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Filters Bar */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField 
                            fullWidth size="small" 
                            placeholder="Search ID, Customer, Vehicle..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                            InputProps={{ startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} /> }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
                                <MenuItem value="All">All Status</MenuItem>
                                {['Requested', 'Confirmed', 'Running', 'Completed', 'Cancelled', 'Overdue'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Payment</InputLabel>
                            <Select value={paymentFilter} label="Payment" onChange={e => setPaymentFilter(e.target.value)}>
                                <MenuItem value="All">All Payments</MenuItem>
                                <MenuItem value="Initial Paid">Initial Paid</MenuItem>
                                <MenuItem value="Initial Not Paid">Initial Not Paid</MenuItem>
                                <MenuItem value="Final Paid">Final Paid</MenuItem>
                                <MenuItem value="Final Not Paid">Final Not Paid</MenuItem>
                                <MenuItem value="Fully Paid">Fully Paid</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Driver</InputLabel>
                            <Select value={driverFilter} label="Driver" onChange={e => setDriverFilter(e.target.value)}>
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="With Driver">With Driver</MenuItem>
                                <MenuItem value="Without Driver">Without Driver</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2} sx={{ textAlign: 'right' }}>
                        <Button variant="contained" startIcon={<Download />} onClick={handleExportCSV} sx={{ bgcolor: '#F97316', '&:hover': { bgcolor: '#ea580c' }, textTransform: 'none', borderRadius: 2 }}>Export CSV</Button>
                    </Grid>
                    
                    {/* Date Filters Row */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" display="block" color="textSecondary">Created Between</Typography>
                        <Stack direction="row" spacing={1}>
                            <TextField type="date" size="small" value={dateRange.created_start} onChange={e => setDateRange({...dateRange, created_start: e.target.value})} />
                            <TextField type="date" size="small" value={dateRange.created_end} onChange={e => setDateRange({...dateRange, created_end: e.target.value})} />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" display="block" color="textSecondary">Trip Start/End</Typography>
                        <Stack direction="row" spacing={1}>
                            <TextField type="date" size="small" value={dateRange.trip_start} onChange={e => setDateRange({...dateRange, trip_start: e.target.value})} />
                            <TextField type="date" size="small" value={dateRange.trip_end} onChange={e => setDateRange({...dateRange, trip_end: e.target.value})} />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Cancelled By</InputLabel>
                            <Select value={cancelledByFilter} label="Cancelled By" onChange={e => setCancelledByFilter(e.target.value)}>
                                <MenuItem value="All">All</MenuItem>
                                {['User', 'Agency', 'Admin'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                         <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1, mt: 1 }}>
                            {quickFilterPills.map((pill) => (
                                <Chip 
                                    key={pill.value}
                                    label={pill.label} 
                                    onClick={() => setQuickFilter(quickFilter === pill.value ? null : pill.value)}
                                    color={quickFilter === pill.value ? "primary" : "default"}
                                    variant={quickFilter === pill.value ? "filled" : "outlined"}
                                    sx={{ 
                                        borderRadius: '16px', 
                                        fontWeight: 600,
                                        bgcolor: quickFilter === pill.value ? '#F97316' : 'transparent',
                                        borderColor: quickFilter === pill.value ? '#F97316' : '#ddd',
                                        '&:hover': { bgcolor: quickFilter === pill.value ? '#ea580c' : '#f5f5f5' }
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
                            <StyledTableCell>Booking ID</StyledTableCell>
                            <StyledTableCell>Customer</StyledTableCell>
                            <StyledTableCell>Vehicle</StyledTableCell>
                            <StyledTableCell>Driver</StyledTableCell>
                            <StyledTableCell>Trip Period</StyledTableCell>
                            <StyledTableCell>Destination</StyledTableCell>
                            <StyledTableCell>Cost</StyledTableCell>
                            <StyledTableCell>Payment</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                            <StyledTableCell align="right">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bookingsLoading ? (
                            <TableRow><TableCell colSpan={10} align="center" sx={{ py: 10 }}>Loading bookings...</TableCell></TableRow>
                        ) : bookingsData?.bookings.length === 0 ? (
                            <TableRow><TableCell colSpan={10} align="center" sx={{ py: 10 }}>No bookings found matching filters.</TableCell></TableRow>
                        ) : bookingsData?.bookings.map((row) => (
                            <TableRow 
                                key={row.booking_id} 
                                hover
                                sx={{ 
                                    borderLeft: `5px solid ${
                                        row.status === 'Running' ? '#06b6d4' : 
                                        row.status === 'Cancelled' ? '#ef4444' : 
                                        row.status === 'Requested' ? '#F97316' : 'transparent'
                                    }`,
                                    opacity: row.status === 'Cancelled' ? 0.8 : 1
                                }}
                            >
                                <TableCell>
                                    <Tooltip title={row.booking_id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleCopy(row.booking_id)}>
                                            <Typography variant="body2" fontWeight="bold">{row.booking_id.substring(0, 8)}...</Typography>
                                            <ContentCopy sx={{ fontSize: 14, color: 'gray' }} />
                                            {row.damage_count > 0 && <Tooltip title={`${row.damage_count} Damage Reports`}><Warning sx={{ fontSize: 16, color: '#ef4444' }} /></Tooltip>}
                                        </Box>
                                    </Tooltip>
                                    <Typography variant="caption" color="textSecondary">{moment(row.booking_ts).format('MMM DD, hh:mm A')}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="bold">{row.user_name}</Typography>
                                    <Typography variant="caption" color="textSecondary">{row.user_phone}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar src={row.images?.[0]} variant="rounded" sx={{ width: 40, height: 30 }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{row.brand} {row.model}</Typography>
                                            <Typography variant="caption" sx={{ color: '#F97316' }}>{row.agency_name}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {row.driver_id ? (
                                        <Chip label={row.driver_name} size="small" variant="outlined" sx={{ borderColor: '#F97316', color: '#F97316', fontWeight: 600 }} />
                                    ) : (
                                        <Chip label="Self Drive" size="small" variant="outlined" />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{moment(row.start_ts).format('MMM DD, hh:mm A')}</Typography>
                                    <Typography variant="body2">→ {moment(row.end_ts).format('MMM DD, hh:mm A')}</Typography>
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold">{row.total_rent_hours} hrs</Typography>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title={row.estimated_destination}>
                                        <Typography variant="body2">{row.estimated_destination?.substring(0, 25)}{row.estimated_destination?.length > 25 ? '...' : ''}</Typography>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="bold">৳{row.total_cost?.toLocaleString()}</Typography>
                                    {row.driver_cost > 0 && <Typography variant="caption" color="textSecondary">Driver: ৳{row.driver_cost}</Typography>}
                                </TableCell>
                                <TableCell>
                                    <Stack spacing={0.5}>
                                        <Chip label={`Initial: ${row.initial_payment ? 'Paid' : 'Unpaid'}`} size="small" color={row.initial_payment ? "success" : "error"} variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                                        <Chip label={`Final: ${row.final_payment ? 'Paid' : 'Unpaid'}`} size="small" color={row.final_payment ? "success" : "error"} variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                                    </Stack>
                                </TableCell>
                                <TableCell><BookingStatusBadge status={row.status} /></TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                                        <Tooltip title="View Details"><IconButton size="small" onClick={() => { setSelectedBookingId(row.booking_id); setIsDetailOpen(true); }} sx={{ color: '#F97316' }}><Info fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Update Status"><IconButton size="small" onClick={() => { setSelectedBookingId(row.booking_id); setIsEditOpen(true); }} sx={{ color: '#3b82f6' }}><Edit fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Cancel Booking">
                                            <IconButton 
                                                size="small" 
                                                disabled={row.status === 'Completed' || row.status === 'Cancelled'} 
                                                onClick={() => { setSelectedBookingId(row.booking_id); setIsCancelOpen(true); }} 
                                                sx={{ color: '#ef4444' }}
                                            >
                                                <CancelIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[8, 25, 50]}
                    component="div"
                    count={bookingsData?.totalCount || 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, v) => setPage(v)}
                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </TableContainer>

            {/* Modals */}
            <BookingDetailModal 
                open={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                bookingId={selectedBookingId} 
            />
            
            <EditBookingModal 
                open={isEditOpen} 
                onClose={() => setIsEditOpen(false)} 
                bookingId={selectedBookingId}
                onSave={(data) => updateBookingMutation.mutate(data)}
            />

            <CancelConfirmationDialog 
                open={isCancelOpen} 
                onClose={() => setIsCancelOpen(false)} 
                bookingId={selectedBookingId}
                onConfirm={(data) => updateBookingMutation.mutate({ booking_id: selectedBookingId, status: 'Cancelled', ...data })}
            />
        </Box>
    );
};

// --- Sub Components ---

const BookingDetailModal = ({ open, onClose, bookingId }) => {
    const [tab, setTab] = useState(0);
    const axiosPublic = useAxiosPublic();
    const { data: details, isLoading } = useQuery({
        queryKey: ['admin-booking-details', bookingId],
        queryFn: async () => {
            const res = await axiosPublic.get(`bookingRoutes/admin/details/${bookingId}`);
            return res.data;
        },
        enabled: open && !!bookingId
    });

    if (!bookingId) return null;

    const copyWithToast = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const statusSteps = ['Requested', 'Confirmed', 'Running', 'Completed', 'Cancelled', 'Overdue'];
    const activeStep = statusSteps.indexOf(details?.overview?.status);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
            <DialogTitle sx={{ bgcolor: '#F97316', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Assignment /> 
                    <Box>
                        <Typography variant="h6">Booking ID: {bookingId}</Typography>
                        <Typography variant="caption">Booked At: {moment(details?.overview?.booking_ts).format('LLL')}</Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'white' }}><Close /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" TabIndicatorProps={{ style: { backgroundColor: '#F97316' } }}>
                    <Tab label="Overview" icon={<Info />} iconPosition="start" />
                    <Tab label="Customer & Driver" icon={<Person />} iconPosition="start" />
                    <Tab label="Vehicle" icon={<DirectionsCar />} iconPosition="start" />
                    <Tab label="Pickup Log" icon={<MyLocation />} iconPosition="start" />
                    <Tab label="Return Log" icon={<History />} iconPosition="start" />
                    <Tab label="Payments" icon={<Payments />} iconPosition="start" />
                    <Tab label="Damages" icon={<Build />} iconPosition="start" />
                </Tabs>
                <Box sx={{ p: 3, minHeight: '400px' }}>
                    {isLoading ? <Typography align="center" mt={4}>Loading details...</Typography> : (
                        <>
                            {tab === 0 && (
                                <Box>
                                    {/* Timeline Visual */}
                                    <Box sx={{ mb: 4, px: 2 }}>
                                        {details?.overview?.status === 'Cancelled' ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, p: 2, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fee2e2' }}>
                                                <CancelIcon color="error" />
                                                <Typography color="error" fontWeight="bold">BOOKING CANCELLED</Typography>
                                                <Divider orientation="vertical" flexItem />
                                                <Typography variant="body2">By: {details?.overview?.cancelled_by} | Reason: {details?.overview?.cancel_reason}</Typography>
                                            </Box>
                                        ) : (
                                            <Stepper activeStep={activeStep} alternativeLabel>
                                                {statusSteps.map((label) => (
                                                    <Step key={label}>
                                                        <StepLabel 
                                                            StepIconProps={{ 
                                                                sx: { 
                                                                    '&.Mui-active': { color: '#F97316' }, 
                                                                    '&.Mui-completed': { color: '#10b981' } 
                                                                } 
                                                            }}
                                                        >
                                                            {label}
                                                        </StepLabel>
                                                    </Step>
                                                ))}
                                            </Stepper>
                                        )}
                                    </Box>

                                    <Grid container spacing={4}>
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={2}>
                                                <Typography variant="subtitle1" fontWeight="bold" color="primary">Trip Details</Typography>
                                                <DetailRow label="Purpose" value={details?.overview?.booking_purpose} />
                                                <DetailRow label="Destination" value={details?.overview?.estimated_destination} />
                                                <DetailRow label="Vehicle Type" value={<Chip label={details?.overview?.vehicle_type} size="small" color="primary" />} />
                                                <DetailRow label="Period" value={`${moment(details?.overview?.start_ts).format('MMM DD, hh:mm A')} to ${moment(details?.overview?.end_ts).format('MMM DD, hh:mm A')}`} />
                                                <DetailRow label="Duration" value={`${details?.overview?.total_rent_hours} Hours`} />
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={2}>
                                                <Typography variant="subtitle1" fontWeight="bold" color="primary">Costing</Typography>
                                                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                                    <Stack direction="row" justifyContent="space-between" mb={1}>
                                                        <Typography>Vehicle Rent</Typography>
                                                        <Typography>৳{(details?.overview?.total_cost - details?.overview?.driver_cost)?.toLocaleString()}</Typography>
                                                    </Stack>
                                                    <Stack direction="row" justifyContent="space-between" mb={1}>
                                                        <Typography>Driver Cost</Typography>
                                                        <Typography>৳{details?.overview?.driver_cost?.toLocaleString() || 0}</Typography>
                                                    </Stack>
                                                    <Divider sx={{ my: 1 }} />
                                                    <Stack direction="row" justifyContent="space-between">
                                                        <Typography fontWeight="bold">Total Amount</Typography>
                                                        <Typography variant="h5" fontWeight="bold" color="#F97316">৳{details?.overview?.total_cost?.toLocaleString()}</Typography>
                                                    </Stack>
                                                </Box>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {tab === 1 && (
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom color="primary">Customer Profile</Typography>
                                                <Stack spacing={2}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar src={details?.overview?.user_photo} sx={{ width: 60, height: 60 }} />
                                                        <Box>
                                                            <Typography variant="subtitle1" fontWeight="bold">{details?.overview?.user_name}</Typography>
                                                            <Typography variant="body2" color="textSecondary">{details?.overview?.user_email}</Typography>
                                                        </Box>
                                                    </Box>
                                                    <DetailRow label="Phone" value={details?.overview?.user_phone} />
                                                    <DetailRow label="Status" value={<Chip label={details?.overview?.user_status} size="small" color={details?.overview?.user_status === 'Active' ? 'success' : 'error'} />} />
                                                    <DetailRow label="Verified" value={details?.overview?.user_verified ? <CheckCircle color="success" /> : <Warning color="warning" />} />
                                                    <Button variant="outlined" size="small" fullWidth sx={{ mt: 1 }}>View Full Profile</Button>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom color="primary">Driver Profile</Typography>
                                                {details?.overview?.driver_id ? (
                                                    <Stack spacing={2}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Avatar src={details?.overview?.driver_photo} sx={{ width: 60, height: 60 }} />
                                                            <Box>
                                                                <Typography variant="subtitle1" fontWeight="bold">{details?.overview?.driver_name}</Typography>
                                                                <Box display="flex" alignItems="center" gap={0.5}>
                                                                    <Star sx={{ fontSize: 16, color: '#f59e0b' }} />
                                                                    <Typography variant="body2" fontWeight="bold">{details?.overview?.driver_rating}</Typography>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                        <DetailRow label="Phone" value={details?.overview?.driver_phone} />
                                                        <DetailRow label="Email" value={details?.overview?.driver_email} />
                                                        <DetailRow label="License" value={<Chip label={details?.overview?.license_status} size="small" color="success" />} />
                                                        <Button variant="outlined" size="small" fullWidth sx={{ mt: 1 }}>View Driver Details</Button>
                                                    </Stack>
                                                ) : (
                                                    <Box sx={{ py: 4, textAlign: 'center' }}>
                                                        <Typography color="textSecondary">Self Drive Booking</Typography>
                                                        <Typography variant="caption">No driver assigned to this trip.</Typography>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            )}

                            {tab === 2 && (
                                <Box>
                                    <Grid container spacing={4}>
                                        <Grid item xs={12} md={5}>
                                            <img src={details?.overview?.images?.[0]} style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} alt="Vehicle" />
                                        </Grid>
                                        <Grid item xs={12} md={7}>
                                            <Typography variant="h5" fontWeight="bold">{details?.overview?.brand} {details?.overview?.model}</Typography>
                                            <Typography color="primary" gutterBottom>{details?.overview?.agency_name}</Typography>
                                            <Divider sx={{ my: 2 }} />
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}><DetailRow label="Rental Price" value={`৳${details?.overview?.rental_price}/Hr`} /></Grid>
                                                <Grid item xs={6}><DetailRow label="Type" value={details?.overview?.car_type} /></Grid>
                                                {details?.overview?.vehicle_type === 'Car' ? (
                                                    <>
                                                        <Grid item xs={6}><DetailRow label="Seats" value={details?.overview?.seats} /></Grid>
                                                        <Grid item xs={6}><DetailRow label="Fuel" value={details?.overview?.fuel} /></Grid>
                                                        <Grid item xs={6}><DetailRow label="Transmission" value={details?.overview?.transmission_type} /></Grid>
                                                        <Grid item xs={12}><DetailRow label="Features" value={details?.overview?.car_features?.join(', ')} /></Grid>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Grid item xs={6}><DetailRow label="Engine" value={`${details?.overview?.engine_capacity}cc`} /></Grid>
                                                        <Grid item xs={6}><DetailRow label="Helmets" value={details?.overview?.helmet_count} /></Grid>
                                                        <Grid item xs={6}><DetailRow label="ABS" value={details?.overview?.abs ? 'Yes' : 'No'} /></Grid>
                                                        <Grid item xs={6}><DetailRow label="Disk Brake" value={details?.overview?.disk_brake ? 'Yes' : 'No'} /></Grid>
                                                    </>
                                                )}
                                            </Grid>
                                            <Button variant="outlined" size="small" sx={{ mt: 3 }}>View Vehicle Profile</Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {tab === 3 && (
                                <Box>
                                    {details?.pickup ? (
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={4}><StatBox label="Pickup Time" value={moment(details.pickup.pickup_time).format('LLL')} /></Grid>
                                            <Grid item xs={12} md={4}><StatBox label="Fuel Level" value={`${details.pickup.fuel_level}%`} /></Grid>
                                            <Grid item xs={12} md={4}><StatBox label="Odometer" value={`${details.pickup.odometer_reading} km`} /></Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" gutterBottom>Pickup Notes</Typography>
                                                <Typography p={2} bgcolor="#f8fafc" borderRadius={1}>{details.pickup.pickup_notes || 'No notes provided.'}</Typography>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Alert severity="warning">Pickup not recorded yet.</Alert>
                                    )}
                                </Box>
                            )}

                            {tab === 4 && (
                                <Box>
                                    {details?.return ? (
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={4}><StatBox label="Return Time" value={moment(details.return.return_time).format('LLL')} /></Grid>
                                            <Grid item xs={12} md={4}><StatBox label="Fuel Level" value={`${details.return.fuel_level}%`} /></Grid>
                                            <Grid item xs={12} md={4}><StatBox label="Odometer" value={`${details.return.odometer_reading} km`} /></Grid>
                                            <Grid item xs={12} md={4}><StatBox label="Distance Traveled" value={`${details.return.odometer_reading - (details.pickup?.odometer_reading || 0)} km`} color="#10b981" /></Grid>
                                            <Grid item xs={12} md={4}><StatBox label="Late Hours" value={details.return.late_hours || 0} color={details.return.late_hours > 0 ? '#ef4444' : 'inherit'} /></Grid>
                                            <Grid item xs={12} md={4}>
                                                <Box sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fee2e2' }}>
                                                    <Typography variant="caption" fontWeight="bold" color="error">Extra Charges</Typography>
                                                    <Typography variant="h6" fontWeight="bold" color="error">৳{(details.return.late_fee + details.return.fuel_charge + details.return.cleaning_charge)?.toLocaleString()}</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" gutterBottom>Return Notes</Typography>
                                                <Typography p={2} bgcolor="#f8fafc" borderRadius={1}>{details.return.return_notes || 'No notes provided.'}</Typography>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Alert severity="warning">Return not recorded yet.</Alert>
                                    )}
                                </Box>
                            )}

                            {tab === 5 && (
                                <Box>
                                    {details?.payments?.length > 0 ? (
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Payment ID</TableCell>
                                                        <TableCell>Date</TableCell>
                                                        <TableCell>Amount</TableCell>
                                                        <TableCell>Method</TableCell>
                                                        <TableCell>Trx ID</TableCell>
                                                        <TableCell>Description</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {details.payments.map((p) => (
                                                        <TableRow key={p.payment_id}>
                                                            <TableCell><Typography variant="caption" fontWeight="bold">{p.payment_id}</Typography></TableCell>
                                                            <TableCell>{moment(p.payment_ts).format('MMM DD, hh:mm A')}</TableCell>
                                                            <TableCell fontWeight="bold">৳{p.amount?.toLocaleString()}</TableCell>
                                                            <TableCell><Chip label={p.method_type} size="small" variant="outlined" color="primary" /></TableCell>
                                                            <TableCell>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    {p.trx_id} 
                                                                    <IconButton size="small" onClick={() => copyWithToast(p.trx_id)}><ContentCopy sx={{ fontSize: 14 }} /></IconButton>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>{p.payment_for}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Alert severity="info">No payments recorded yet.</Alert>
                                    )}
                                    
                                    <Box sx={{ mt: 4, p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" fontWeight="bold">Payment Status</Typography>
                                                <Stack direction="row" spacing={2} mt={1}>
                                                    <Chip label={`Initial: ${details?.overview?.initial_payment ? 'Paid' : 'Unpaid'}`} color={details?.overview?.initial_payment ? 'success' : 'error'} />
                                                    <Chip label={`Final: ${details?.overview?.final_payment ? 'Paid' : 'Unpaid'}`} color={details?.overview?.final_payment ? 'success' : 'error'} />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} sm={6} textAlign="right">
                                                <Typography variant="h6" color="textSecondary">Paid So Far: ৳{details?.payments?.reduce((acc, curr) => acc + curr.amount, 0)?.toLocaleString()}</Typography>
                                                <Typography variant="h5" fontWeight="bold" color="#F97316">Remaining: ৳{(details?.overview?.total_cost - details?.payments?.reduce((acc, curr) => acc + curr.amount, 0))?.toLocaleString()}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                            )}

                            {tab === 6 && (
                                <Box>
                                    {details?.damages?.length > 0 ? (
                                        <Grid container spacing={3}>
                                            {details.damages.map((d) => (
                                                <Grid item xs={12} key={d.damage_id}>
                                                    <Card variant="outlined">
                                                        <CardContent>
                                                            <Stack direction="row" justifyContent="space-between" mb={2}>
                                                                <Box>
                                                                    <Typography variant="subtitle1" fontWeight="bold">{d.damage_type}</Typography>
                                                                    <Typography variant="caption" color="textSecondary">{moment(d.report_date).format('LLL')} | Reported by: {d.reported_by_name}</Typography>
                                                                </Box>
                                                                <Chip 
                                                                    label={d.severity} 
                                                                    color={d.severity === 'Severe' ? 'error' : d.severity === 'Moderate' ? 'warning' : 'success'} 
                                                                />
                                                            </Stack>
                                                            <Typography variant="body2" mb={2}>{d.description}</Typography>
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                <Typography fontWeight="bold">Est. Cost: ৳{d.estimated_cost?.toLocaleString()}</Typography>
                                                                <Chip label={d.status} variant="outlined" />
                                                            </Stack>
                                                            {d.photos?.length > 0 && (
                                                                <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto' }}>
                                                                    {d.photos.map((img, i) => <img key={i} src={img} style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 4 }} alt="Damage" />)}
                                                                </Box>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Alert severity="success">No damage reported for this booking.</Alert>
                                    )}
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
        </Dialog>
    );
};

const EditBookingModal = ({ open, onClose, bookingId, onSave }) => {
    const axiosPublic = useAxiosPublic();
    const [formData, setFormData] = useState({ status: '', initial_payment: false, final_payment: false, driver_id: '', admin_note: '' });
    
    const { data: booking } = useQuery({
        queryKey: ['admin-edit-booking', bookingId],
        queryFn: async () => {
            const res = await axiosPublic.get(`bookingRoutes/getBooking/${bookingId}`);
            return res.data;
        },
        enabled: open && !!bookingId
    });

    const { data: drivers } = useQuery({
        queryKey: ['admin-available-drivers'],
        queryFn: async () => {
            const res = await axiosPublic.get('driverRoutes/admin-all-drivers');
            return res.data;
        },
        enabled: open
    });

    useEffect(() => {
        if (booking) {
            setFormData({
                booking_id: booking.booking_id,
                status: booking.status,
                initial_payment: booking.initial_payment,
                final_payment: booking.final_payment,
                driver_id: booking.driver_id || '',
                admin_note: ''
            });
        }
    }, [booking]);

    if (!bookingId) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Update Booking Status & Payments</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    <Alert severity="info" sx={{ mb: 1 }}>Changing status may affect vehicle availability and trigger automated notifications.</Alert>
                    
                    <FormControl fullWidth>
                        <InputLabel>Booking Status</InputLabel>
                        <Select value={formData.status} label="Booking Status" onChange={e => setFormData({...formData, status: e.target.value})}>
                            {['Requested', 'Confirmed', 'Running', 'Completed', 'Cancelled', 'Overdue'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <Stack direction="row" spacing={4}>
                        <FormControlLabel control={<Switch checked={formData.initial_payment} onChange={e => setFormData({...formData, initial_payment: e.target.checked})} color="success" />} label="Initial Payment Received" />
                        <FormControlLabel control={<Switch checked={formData.final_payment} onChange={e => setFormData({...formData, final_payment: e.target.checked})} color="success" />} label="Final Payment Received" />
                    </Stack>

                    <FormControl fullWidth>
                        <InputLabel>Assign Driver</InputLabel>
                        <Select value={formData.driver_id} label="Assign Driver" onChange={e => setFormData({...formData, driver_id: e.target.value})}>
                            <MenuItem value="">Self Drive (No Driver)</MenuItem>
                            {drivers?.map(d => (
                                <MenuItem key={d.driver_id} value={d.driver_id}>
                                    <Box display="flex" justifyContent="space-between" width="100%">
                                        <Typography>{d.name} ({d.experience_year} yrs)</Typography>
                                        <Typography variant="caption" color={d.availability ? 'success.main' : 'error.main'}>{d.availability ? 'Available' : 'Busy'} | ⭐{d.rating}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField label="Admin Note" multiline rows={3} fullWidth placeholder="Add internal notes for this update..." value={formData.admin_note} onChange={e => setFormData({...formData, admin_note: e.target.value})} />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={() => onSave(formData)} sx={{ bgcolor: '#F97316', '&:hover': { bgcolor: '#ea580c' } }}>Save Changes</Button>
            </DialogActions>
        </Dialog>
    );
};

const CancelConfirmationDialog = ({ open, onClose, bookingId, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [cancelledBy, setCancelledBy] = useState('Admin');
    
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}><Warning /> Confirm Cancellation</DialogTitle>
            <DialogContent dividers>
                <Typography mb={2}>Are you sure you want to cancel booking <strong>#{bookingId}</strong>?</Typography>
                <Stack spacing={3} mt={2}>
                    <FormControl fullWidth>
                        <InputLabel>Cancelled By</InputLabel>
                        <Select value={cancelledBy} label="Cancelled By" onChange={e => setCancelledBy(e.target.value)}>
                            <MenuItem value="Admin">Admin</MenuItem>
                            <MenuItem value="Agency">Agency</MenuItem>
                            <MenuItem value="User">User</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField 
                        required 
                        fullWidth 
                        multiline 
                        rows={3} 
                        label="Reason for Cancellation" 
                        placeholder="Please provide a detailed reason..." 
                        value={reason} 
                        onChange={e => setReason(e.target.value)}
                        error={!reason.trim()}
                        helperText={!reason.trim() ? "Reason is required for cancellation" : ""}
                    />
                    <Alert severity="warning">⚠️ This action will mark the vehicle and driver as available immediately.</Alert>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Back</Button>
                <Button variant="contained" color="error" disabled={!reason.trim()} onClick={() => onConfirm({ cancelReason: reason, cancelledBy })}>Confirm Cancellation</Button>
            </DialogActions>
        </Dialog>
    );
};

// --- Helper UI Components ---

const DetailRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', pb: 1 }}>
        <Typography variant="body2" color="textSecondary">{label}:</Typography>
        <Typography variant="body2" fontWeight="bold">{value}</Typography>
    </Box>
);

const StatBox = ({ label, value, color }) => (
    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Typography variant="caption" color="textSecondary" fontWeight="bold">{label}</Typography>
        <Typography variant="body1" fontWeight="bold" sx={{ color: color || 'inherit' }}>{value}</Typography>
    </Box>
);

export default Bookings;