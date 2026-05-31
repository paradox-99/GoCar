import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, Chip, Avatar, Typography, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Grid, Card, CardContent, Alert, AlertTitle, Switch, FormControlLabel, Badge } from '@mui/material';
import { 
    Info, Edit, Block, Search, Download, CheckCircle, Cancel, Person, 
    CorporateFare, WarningAmber, Star, CheckCircleOutline, CancelOutlined
} from '@mui/icons-material';
import toast from 'react-hot-toast';

// --- Helper Functions ---
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

const exportToCSV = (data, filename) => {
    if (!data || !data.length) return;
    const headers = ['Driver Name', 'Email', 'Phone', 'Agency', 'License Status', 'Verified', 'Account Status', 'Availability'];
    const csvRows = [headers.join(',')];
    data.forEach(row => {
        const values = [
            `"${row.name || ''}"`,
            `"${row.email || ''}"`,
            `"${row.phone || ''}"`,
            `"${row.agency_name || 'Independent'}"`,
            `"${row.license_status || ''}"`,
            `"${row.verified ? 'Yes' : 'No'}"`,
            `"${row.accountstatus || ''}"`,
            `"${row.availability ? 'Available' : 'Unavailable'}"`
        ];
        csvRows.push(values.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
};

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'active': return 'success';
        case 'suspended': return 'warning';
        case 'banned': return 'error';
        case 'inactive': return 'default';
        default: return 'default';
    }
};

const getLicenseColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'valid': return 'success';
        case 'expired': return 'error';
        case 'pending': return 'warning';
        case 'rejected': return 'error';
        default: return 'default';
    }
};

const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
};

const isExpiringSoon = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const expiry = new Date(dateString);
    const diffTime = Math.abs(expiry - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return expiry >= today && diffDays <= 30;
};


// --- Modals ---

// 1. Driver Info Modal
const DriverInfoModal = ({ open, onClose, driver, axiosPublic }) => {
    const [tabIndex, setTabIndex] = useState(0);

    const { data: bookings = [] } = useQuery({
        queryKey: ['driverBookings', driver?.driver_id],
        queryFn: async () => {
            const res = await axiosPublic.get(`bookingRoutes/getDriverBookings/${driver.driver_id}`, { withCredentials: true });
            return res.data;
        },
        enabled: !!driver && open
    });

    const { data: reviews = [] } = useQuery({
        queryKey: ['driverReviews', driver?.driver_id],
        queryFn: async () => {
            const res = await axiosPublic.get(`reviewRoutes/received/driver/${driver.driver_id}`, { withCredentials: true });
            return res.data;
        },
        enabled: !!driver && open
    });

    if (!driver) return null;

    const completedBookings = bookings.filter(b => b.status === 'Completed');
    const totalEarned = completedBookings.reduce((sum, b) => sum + (Number(b.driver_cost) || 0), 0);
    const avgEarnings = completedBookings.length ? (totalEarned / completedBookings.length).toFixed(2) : 0;

    // Monthly earnings for simple bar chart
    const monthlyEarnings = {};
    completedBookings.forEach(b => {
        const month = new Date(b.end_ts).toLocaleString('default', { month: 'short' });
        monthlyEarnings[month] = (monthlyEarnings[month] || 0) + (Number(b.driver_cost) || 0);
    });
    const maxEarning = Math.max(...Object.values(monthlyEarnings), 1);

    const expiredLicense = isExpired(driver.expire_date);
    const expiringLicense = isExpiringSoon(driver.expire_date);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#F97316', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={driver.photo} alt={driver.name} sx={{ width: 50, height: 50, border: '2px solid white' }} />
                <Box>
                    <Typography variant="h6" fontWeight="bold">{driver.name}</Typography>
                    <Typography variant="caption">{driver.driver_id}</Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2, p: 0 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                    <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} variant="scrollable" scrollButtons="auto" TabIndicatorProps={{ style: { backgroundColor: '#F97316' } }}>
                        <Tab label="Profile" />
                        <Tab label="License & Docs" />
                        <Tab label="Agency" />
                        <Tab label="Bookings" />
                        <Tab label="Earnings" />
                        <Tab label="Reviews" />
                    </Tabs>
                </Box>

                <Box sx={{ p: 3, minHeight: 400 }}>
                    {tabIndex === 0 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4} className="text-center">
                                <Avatar src={driver.photo} sx={{ width: 150, height: 150, mx: 'auto', mb: 2, boxShadow: 3 }} />
                                <Chip label={driver.accountstatus} color={getStatusColor(driver.accountstatus)} size="small" sx={{ mr: 1 }} />
                                {driver.verified ? <Chip icon={<CheckCircle />} label="Verified" color="success" size="small" /> : <Chip icon={<Cancel />} label="Unverified" color="error" size="small" />}
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <Typography variant="h6" gutterBottom color="#F97316">Personal Information</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Email</Typography><Typography>{driver.email}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Phone</Typography><Typography>{driver.phone}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Gender</Typography><Typography>{driver.gender || 'N/A'}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Date of Birth</Typography><Typography>{formatDate(driver.dob)}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">NID</Typography><Typography>{driver.nid || 'N/A'}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Registered On</Typography><Typography>{formatDate(driver.created_at)}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Experience</Typography><Typography>{driver.experience_year || 0} Years</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Rental Rate</Typography><Typography>৳{driver.rental_price || 0}/hr</Typography></Grid>
                                    <Grid item xs={12}><Typography variant="caption" color="textSecondary">Address</Typography><Typography>{driver.display_name || 'N/A'}</Typography></Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}

                    {tabIndex === 1 && (
                        <Box>
                            {(expiredLicense || expiringLicense) && (
                                <Alert severity={expiredLicense ? "error" : "warning"} sx={{ mb: 3 }}>
                                    <AlertTitle>{expiredLicense ? "License Expired" : "License Expiring Soon"}</AlertTitle>
                                    This driver's license {expiredLicense ? `expired on ${formatDate(driver.expire_date)}` : `will expire on ${formatDate(driver.expire_date)}`}.
                                </Alert>
                            )}
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="caption" color="textSecondary">License Number</Typography>
                                            <Typography variant="h6">{driver.license_number || 'N/A'}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="caption" color="textSecondary">License Status</Typography>
                                            <Box mt={0.5}><Chip label={driver.license_status || 'Pending'} color={getLicenseColor(driver.license_status)} /></Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="caption" color="textSecondary">Expiry Date</Typography>
                                            <Typography variant="h6" color={expiredLicense ? 'error.main' : 'text.primary'}>{formatDate(driver.expire_date)}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="caption" color="textSecondary">Experience</Typography>
                                            <Typography variant="h6">{driver.experience_year} Years</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                {driver.license_status === 'Pending' && (
                                    <Grid item xs={12}>
                                        <Card variant="outlined" sx={{ bgcolor: '#fffbeb', borderColor: '#fde68a' }}>
                                            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">Action Required</Typography>
                                                    <Typography variant="body2" color="textSecondary">This driver's license is pending verification.</Typography>
                                                </Box>
                                                <Box>
                                                    <Button variant="outlined" color="error" sx={{ mr: 1 }} onClick={() => toast.error('Please use the Edit modal to change status')}>Reject</Button>
                                                    <Button variant="contained" color="success" onClick={() => toast.success('Please use the Edit modal to change status')}>Approve</Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}

                    {tabIndex === 2 && (
                        <Box className="flex flex-col items-center justify-center h-full text-center py-10">
                            {driver.agency_id ? (
                                <>
                                    <CorporateFare sx={{ fontSize: 80, color: '#F97316', mb: 2 }} />
                                    <Typography variant="h5" gutterBottom>{driver.agency_name}</Typography>
                                    <Chip label="Agency Affiliated" color="primary" sx={{ mb: 3 }} />
                                    <Typography color="textSecondary">Agency ID: {driver.agency_id}</Typography>
                                </>
                            ) : (
                                <>
                                    <Person sx={{ fontSize: 80, color: '#9CA3AF', mb: 2 }} />
                                    <Typography variant="h5" gutterBottom>Independent Driver</Typography>
                                    <Chip label="Independent" sx={{ backgroundColor: '#E5E7EB', mb: 3 }} />
                                    <Typography color="textSecondary">This driver works independently and is not affiliated with any agency.</Typography>
                                </>
                            )}
                        </Box>
                    )}

                    {tabIndex === 3 && (
                        <Box>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={3}><Card sx={{ textAlign: 'center', p: 2 }}><Typography variant="h5">{bookings.length}</Typography><Typography variant="caption">Total Trips</Typography></Card></Grid>
                                <Grid item xs={3}><Card sx={{ textAlign: 'center', p: 2, bgcolor: '#f0fdf4' }}><Typography variant="h5" color="success.main">{completedBookings.length}</Typography><Typography variant="caption">Completed</Typography></Card></Grid>
                                <Grid item xs={3}><Card sx={{ textAlign: 'center', p: 2, bgcolor: '#fef2f2' }}><Typography variant="h5" color="error.main">{bookings.filter(b => b.status === 'Cancelled').length}</Typography><Typography variant="caption">Cancelled</Typography></Card></Grid>
                                <Grid item xs={3}><Card sx={{ textAlign: 'center', p: 2, bgcolor: '#fffbeb' }}><Typography variant="h5" color="warning.main">{bookings.filter(b => ['Running', 'Confirmed'].includes(b.status)).length}</Typography><Typography variant="caption">Ongoing</Typography></Card></Grid>
                            </Grid>
                            {bookings.length > 0 ? (
                                <TableContainer sx={{ maxHeight: 300 }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                <TableCell>Vehicle</TableCell>
                                                <TableCell>Start</TableCell>
                                                <TableCell>End</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {bookings.map(b => (
                                                <TableRow key={b.booking_id}>
                                                    <TableCell sx={{ fontSize: '12px' }}>{b.booking_id.substring(0,8)}...</TableCell>
                                                    <TableCell>{b.vehicle_type}</TableCell>
                                                    <TableCell>{formatDate(b.start_ts)}</TableCell>
                                                    <TableCell>{formatDate(b.end_ts)}</TableCell>
                                                    <TableCell><Chip label={b.status} size="small" color={b.status === 'Completed' ? 'success' : b.status === 'Cancelled' ? 'error' : 'warning'} /></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography textAlign="center" color="textSecondary" sx={{ mt: 5 }}>No bookings found.</Typography>
                            )}
                        </Box>
                    )}

                    {tabIndex === 4 && (
                        <Box>
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} sm={6}>
                                    <Card sx={{ bgcolor: '#F97316', color: 'white', textAlign: 'center' }}>
                                        <CardContent>
                                            <Typography variant="h4 font-bold">৳ {totalEarned.toLocaleString()}</Typography>
                                            <Typography variant="subtitle2">Total Earned</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Card sx={{ textAlign: 'center' }}>
                                        <CardContent>
                                            <Typography variant="h4 font-bold text-gray-800">৳ {avgEarnings}</Typography>
                                            <Typography variant="subtitle2" color="textSecondary">Average Per Trip</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                            <Typography variant="h6" gutterBottom>Earnings by Month</Typography>
                            {Object.keys(monthlyEarnings).length > 0 ? (
                                <Box className="flex items-end gap-4 h-48 border-b border-gray-200 pb-2 mt-4 px-2">
                                    {Object.entries(monthlyEarnings).map(([month, amount]) => (
                                        <Box key={month} className="flex flex-col items-center flex-1 group relative">
                                            <Tooltip title={`৳ ${amount.toLocaleString()}`} placement="top">
                                                <Box 
                                                    className="w-full bg-[#F97316] rounded-t-sm transition-all duration-300 group-hover:bg-orange-600" 
                                                    style={{ height: `${(amount / maxEarning) * 100}%`, minHeight: '4px' }}
                                                />
                                            </Tooltip>
                                            <Typography variant="caption" sx={{ mt: 1 }}>{month}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography textAlign="center" color="textSecondary" sx={{ mt: 5 }}>No earnings data yet.</Typography>
                            )}
                        </Box>
                    )}

                    {tabIndex === 5 && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, p: 3, bgcolor: '#f9fafb', borderRadius: 2 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" fontWeight="bold">{driver.rating || '0.0'}</Typography>
                                    <Box className="flex text-yellow-400 justify-center"><Star/><Star/><Star/><Star/><Star sx={{ color: '#e5e7eb' }}/></Box>
                                </Box>
                                <Box>
                                    <Typography variant="h6">Overall Rating</Typography>
                                    <Typography variant="body2" color="textSecondary">Based on {reviews.length} reviews</Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                                {reviews.length > 0 ? reviews.map((r, i) => (
                                    <Card key={i} sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography fontWeight="bold">{r.user_name}</Typography>
                                                <Box display="flex" alignItems="center" gap={0.5}>
                                                    <Star sx={{ color: '#fbbf24', fontSize: 16 }} />
                                                    <Typography variant="body2" fontWeight="bold">{r.rating}</Typography>
                                                </Box>
                                            </Box>
                                            <Typography variant="body2" color="textSecondary" gutterBottom>{formatDate(r.created_at)}</Typography>
                                            <Typography variant="body2">{r.comment}</Typography>
                                        </CardContent>
                                    </Card>
                                )) : <Typography textAlign="center" color="textSecondary">No reviews available.</Typography>}
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

// 2. Edit Modal
const DriverEditModal = ({ open, onClose, driver, onSave, isSaving }) => {
    const [formData, setFormData] = useState({
        accountstatus: '',
        license_status: '',
        expire_date: '',
        verified: false,
        availability: false,
        rental_price: 0,
        note: ''
    });

    // Reset form when modal opens with new driver
    React.useEffect(() => {
        if (driver) {
            setFormData({
                accountstatus: driver.accountstatus || 'Active',
                license_status: driver.license_status || 'Pending',
                expire_date: driver.expire_date ? new Date(driver.expire_date).toISOString().split('T')[0] : '',
                verified: driver.verified || false,
                availability: driver.availability || false,
                rental_price: driver.rental_price || 0,
                note: ''
            });
        }
    }, [driver]);

    if (!driver) return null;

    const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleToggle = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.checked }));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Edit color="primary" /> Manage Driver: {driver.name}
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Account Status</InputLabel>
                            <Select name="accountstatus" value={formData.accountstatus} onChange={handleChange} label="Account Status">
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Inactive">Inactive</MenuItem>
                                <MenuItem value="Suspended">Suspended</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>License Status</InputLabel>
                            <Select name="license_status" value={formData.license_status} onChange={handleChange} label="License Status">
                                <MenuItem value="Verified">Verified</MenuItem>
                                <MenuItem value="Unverified">Unverified</MenuItem>
                                <MenuItem value="Expired">Expired</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            fullWidth size="small" type="date" label="License Expiry" 
                            name="expire_date" value={formData.expire_date} onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            fullWidth size="small" type="number" label="Rental Price (Per Hr)" 
                            name="rental_price" value={formData.rental_price} onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControlLabel control={<Switch checked={formData.verified} onChange={handleToggle} name="verified" color="success" />} label="Verified" />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControlLabel control={<Switch checked={formData.availability} onChange={handleToggle} name="availability" color="primary" />} label="Available for Hire" />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField 
                            fullWidth multiline rows={3} label="Admin Note / Reason for Update" 
                            name="note" value={formData.note} onChange={handleChange}
                            placeholder="Add notes about this status change..."
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button variant="contained" onClick={() => onSave({ ...driver, ...formData })} disabled={isSaving} sx={{ bgcolor: '#F97316', '&:hover': { bgcolor: '#ea580c' } }}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// 3. Ban/Suspend Confirmation Modal
const DriverBanModal = ({ open, onClose, driver, onConfirm, isSaving }) => {
    const [reason, setReason] = useState('');
    
    // Check if driver has active bookings (mock warning for now, ideally fetch real count)
    const hasActiveBooking = driver?.availability === false && driver?.accountstatus === 'Active'; 

    if (!driver) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#dc2626' }}>
                <Block /> Suspend / Ban Driver
            </DialogTitle>
            <DialogContent dividers>
                <Typography mb={2}>
                    Are you sure you want to suspend/ban <strong>{driver.name}</strong>?
                </Typography>
                
                {hasActiveBooking && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <AlertTitle>Warning</AlertTitle>
                        This driver might be currently assigned to a booking. Suspending them may require reassignment.
                    </Alert>
                )}

                <TextField 
                    fullWidth multiline rows={3} label="Reason (Required)" 
                    value={reason} onChange={(e) => setReason(e.target.value)}
                    required error={reason.trim() === ''}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button variant="contained" color="error" onClick={() => onConfirm(driver, reason)} disabled={isSaving || reason.trim() === ''}>
                    {isSaving ? 'Processing...' : 'Confirm Action'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};


// --- Main Component ---
const AdminDrivers = () => {
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [search, setSearch] = useState('');
    
    // Filters
    const [filterAccount, setFilterAccount] = useState('All');
    const [filterLicense, setFilterLicense] = useState('All');
    const [filterAgency, setFilterAgency] = useState('All');
    const [filterAvailability, setFilterAvailability] = useState('All');
    const [showAlert, setShowAlert] = useState(true);

    // Modals
    const [infoModal, setInfoModal] = useState({ open: false, driver: null });
    const [editModal, setEditModal] = useState({ open: false, driver: null });
    const [banModal, setBanModal] = useState({ open: false, driver: null });

    const { data: drivers = [], isLoading } = useQuery({
        queryKey: ['admin-all-drivers'],
        queryFn: async () => {
            const response = await axiosPublic.get(`driverRoutes/admin-all-drivers`, { withCredentials: true });
            return response.data;
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedDriver) => {
            const response = await axiosPublic.patch(`driverRoutes/updateDriverInfo/${updatedDriver.driver_id}`, updatedDriver, { withCredentials: true });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-all-drivers']);
            toast.success('Driver updated successfully');
            setEditModal({ open: false, driver: null });
            setBanModal({ open: false, driver: null });
        },
        onError: (err) => toast.error(err.message || 'Update failed')
    });

    const handleSaveEdit = (driverData) => updateMutation.mutate(driverData);
    
    const handleConfirmBan = (driver, reason) => {
        // Send Suspend status
        updateMutation.mutate({ ...driver, accountstatus: 'Suspended', note: reason });
    };

    // Filter Logic
    const filteredDrivers = useMemo(() => {
        return drivers.filter(d => {
            // Search
            const searchStr = search.toLowerCase();
            const matchesSearch = !searchStr || 
                d.name?.toLowerCase().includes(searchStr) || 
                d.email?.toLowerCase().includes(searchStr) || 
                d.phone?.toLowerCase().includes(searchStr) ||
                d.license_number?.toLowerCase().includes(searchStr);

            // Filters
            const matchesAccount = filterAccount === 'All' || (d.accountstatus || 'Inactive').toLowerCase() === filterAccount.toLowerCase();
            const matchesLicense = filterLicense === 'All' || (d.license_status || 'Pending').toLowerCase() === filterLicense.toLowerCase();
            const matchesAgency = filterAgency === 'All' || 
                (filterAgency === 'Independent' && !d.agency_id) || 
                (filterAgency === 'Agency-Affiliated' && !!d.agency_id);
            const matchesAvailability = filterAvailability === 'All' || 
                (filterAvailability === 'Available' && d.availability) || 
                (filterAvailability === 'Unavailable' && !d.availability);

            return matchesSearch && matchesAccount && matchesLicense && matchesAgency && matchesAvailability;
        });
    }, [drivers, search, filterAccount, filterLicense, filterAgency, filterAvailability]);

    // Stats
    const activeAvailable = drivers.filter(d => d.accountstatus === 'Active' && d.availability).length;
    const pendingLicenses = drivers.filter(d => d.license_status === 'Pending').length;
    
    const expiredCount = drivers.filter(d => isExpired(d.expire_date)).length;
    const expiringSoonCount = drivers.filter(d => isExpiringSoon(d.expire_date)).length;

    if (isLoading) return <Box className="flex justify-center items-center h-[70vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316]"></div></Box>;

    return (
        <div className="p-6 max-w-7xl mx-auto font-sans text-gray-800">
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, color: '#1f2937' }}>Registered Drivers</Typography>

            {/* Top Expiry Banner */}
            {(expiredCount > 0 || expiringSoonCount > 0) && showAlert && (
                <Alert 
                    severity="warning" 
                    onClose={() => setShowAlert(false)} 
                    icon={<WarningAmber fontSize="inherit" />}
                    sx={{ mb: 4, bgcolor: '#fffbeb', border: '1px solid #fef3c7', '& .MuiAlert-message': { width: '100%' } }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography>
                            <strong>Action Required:</strong> {expiredCount} drivers have expired licenses &middot; {expiringSoonCount} drivers expiring within 30 days.
                        </Typography>
                        <Button size="small" onClick={() => setFilterLicense('Expired')} sx={{ color: '#d97706' }}>Filter Expired</Button>
                    </Box>
                </Alert>
            )}

            {/* Stats Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderLeft: 4, borderColor: '#3b82f6', boxShadow: 1 }}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Total Drivers</Typography>
                            <Typography variant="h5" fontWeight="bold">{drivers.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderLeft: 4, borderColor: '#10b981', boxShadow: 1 }}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Active & Available</Typography>
                            <Typography variant="h5" fontWeight="bold">{activeAvailable}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderLeft: 4, borderColor: '#f59e0b', boxShadow: 1, cursor: 'pointer', transition: 'all 0.2s', '&:hover':{ bgcolor: '#fffbeb' } }} onClick={() => setFilterLicense('Pending')}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Pending Licenses</Typography>
                            <Typography variant="h5" fontWeight="bold">{pendingLicenses}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderLeft: 4, borderColor: '#ef4444', boxShadow: 1, cursor: 'pointer', transition: 'all 0.2s', '&:hover':{ bgcolor: '#fef2f2' } }} onClick={() => setFilterLicense('Expired')}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Expired Licenses</Typography>
                            <Typography variant="h5" fontWeight="bold" color="error">{expiredCount}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Top Bar Controls */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth size="small" placeholder="Search name, email, phone..."
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            InputProps={{ startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} /> }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Account Status</InputLabel>
                            <Select value={filterAccount} label="Account Status" onChange={e => setFilterAccount(e.target.value)}>
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Suspended">Suspended</MenuItem>
                                <MenuItem value="Inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>License</InputLabel>
                            <Select value={filterLicense} label="License" onChange={e => setFilterLicense(e.target.value)}>
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="Verified">Verified</MenuItem>
                                <MenuItem value="Unverified">Unverified</MenuItem>
                                <MenuItem value="Expired">Expired</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={4} md={1.5}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Agency</InputLabel>
                            <Select value={filterAgency} label="Agency" onChange={e => setFilterAgency(e.target.value)}>
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="Independent">Independent</MenuItem>
                                <MenuItem value="Agency-Affiliated">Affiliated</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                            variant="outlined" startIcon={<Download />} 
                            onClick={() => exportToCSV(filteredDrivers, 'drivers_export')}
                            sx={{ color: '#F97316', borderColor: '#F97316', '&:hover': { bgcolor: '#fff7ed', borderColor: '#F97316' } }}
                        >
                            Export CSV
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Main Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Table sx={{ minWidth: 1000 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#F97316' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Driver Name</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact Info</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Affiliation</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>License Status</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Performance</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Account Status</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Verified</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0 ? filteredDrivers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : filteredDrivers).map((driver) => {
                            
                            const cellExpired = isExpired(driver.expire_date);
                            const cellExpiring = !cellExpired && isExpiringSoon(driver.expire_date);
                            
                            return (
                                <TableRow key={driver.driver_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Badge 
                                                color={driver.availability ? "success" : "default"} 
                                                variant="dot"
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                sx={{ '& .MuiBadge-badge': { width: 10, height: 10, borderRadius: '50%', border: '2px solid white' } }}
                                            >
                                                <Avatar src={driver.photo} alt={driver.name} sx={{ width: 40, height: 40 }} />
                                            </Badge>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold" color="textPrimary">{driver.name}</Typography>
                                                <Typography variant="caption" color="textSecondary">{driver.driver_id}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Typography variant="body2">{driver.email}</Typography>
                                        <Typography variant="caption" color="textSecondary">{driver.phone}</Typography>
                                    </TableCell>
                                    
                                    <TableCell>
                                        {driver.agency_id ? (
                                            <Chip icon={<CorporateFare fontSize="small"/>} label={driver.agency_name} size="small" sx={{ bgcolor: '#fff7ed', color: '#ea580c', fontWeight: 500, border: '1px solid #ffedd5' }} />
                                        ) : (
                                            <Chip icon={<Person fontSize="small"/>} label="Independent" size="small" sx={{ bgcolor: '#f3f4f6', color: '#4b5563', fontWeight: 500 }} />
                                        )}
                                    </TableCell>

                                    <TableCell sx={{ bgcolor: cellExpired ? '#fef2f2' : cellExpiring ? '#fffbeb' : 'inherit' }}>
                                        <Chip 
                                            label={driver.license_status || 'Pending'} 
                                            size="small" 
                                            color={getLicenseColor(driver.license_status)} 
                                            variant={driver.license_status === 'Rejected' ? 'outlined' : 'filled'}
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                        {(cellExpired || cellExpiring) && (
                                            <Typography variant="caption" display="block" color={cellExpired ? 'error' : 'warning.main'} sx={{ mt: 0.5 }}>
                                                {formatDate(driver.expire_date)}
                                            </Typography>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <Star sx={{ color: '#fbbf24', fontSize: 18 }} />
                                            <Typography variant="body2" fontWeight="bold">{driver.rating || '0.0'}</Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Chip label={driver.accountstatus || 'Inactive'} size="small" color={getStatusColor(driver.accountstatus)} sx={{ fontWeight: 500 }} />
                                    </TableCell>

                                    <TableCell align="center">
                                        {driver.verified ? <CheckCircleOutline color="success" /> : <CancelOutlined color="error" />}
                                    </TableCell>

                                    <TableCell align="center">
                                        <Box display="flex" justifyContent="center" gap={1}>
                                            <Tooltip title="View Details">
                                                <IconButton size="small" sx={{ color: '#3b82f6' }} onClick={() => setInfoModal({ open: true, driver })}>
                                                    <Info fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Manage Profile">
                                                <IconButton size="small" sx={{ color: '#F97316' }} onClick={() => setEditModal({ open: true, driver })}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={driver.accountstatus === 'Suspended' || driver.accountstatus === 'Banned' ? "Unsuspend" : "Suspend/Ban"}>
                                                <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => setBanModal({ open: true, driver })}>
                                                    <Block fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {filteredDrivers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                    <Typography color="textSecondary">No drivers match your current filters.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[8, 25, 50]}
                    component="div"
                    count={filteredDrivers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, p) => setPage(p)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </TableContainer>

            {/* Modals Rendering */}
            <DriverInfoModal 
                open={infoModal.open} 
                onClose={() => setInfoModal({ open: false, driver: null })} 
                driver={infoModal.driver} 
                axiosPublic={axiosPublic} 
            />
            
            <DriverEditModal 
                open={editModal.open} 
                onClose={() => setEditModal({ open: false, driver: null })} 
                driver={editModal.driver} 
                onSave={handleSaveEdit}
                isSaving={updateMutation.isLoading}
            />

            <DriverBanModal
                open={banModal.open}
                onClose={() => setBanModal({ open: false, driver: null })}
                driver={banModal.driver}
                onConfirm={handleConfirmBan}
                isSaving={updateMutation.isLoading}
            />

        </div>
    );
};

export default AdminDrivers;
