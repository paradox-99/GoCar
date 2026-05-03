import React, { useState, useMemo } from 'react';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
    IconButton, Chip, Typography, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Grid, Card, CardContent,
    Alert, AlertTitle, Switch, FormControlLabel, Avatar, Collapse, Divider, tableCellClasses
} from '@mui/material';
import {
    Info, Edit, Block, Search, Download, CheckCircle, Cancel, DirectionsCar, TwoWheeler,
    Close, Star, AccountCircle, Assignment, EventNote, Timeline, VerifiedUser, Warning
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import toast from 'react-hot-toast';
import moment from 'moment';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#F97316",
        color: theme.palette.common.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 13,
    },
}));

const StatusBadge = ({ status }) => {
    let color = "default";
    if (status === 'Available') color = "success";
    else if (status === 'Booked') color = "info";
    else if (status === 'Maintenance') color = "warning";
    else if (status === 'Inactive') color = "default";
    return <Chip label={status || 'Inactive'} color={color} size="small" />;
};

const isExpired = (date) => date && moment(date).isBefore(moment());
const isExpiringSoon = (date) => date && moment(date).isBetween(moment(), moment().add(30, 'days'));

const Vehicles = () => {
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(0); // 0 = Cars, 1 = Bikes
    
    // Pagination & Search & Filters
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterVerified, setFilterVerified] = useState('All');
    const [filterAgency, setFilterAgency] = useState('All');
    const [filterFuel, setFilterFuel] = useState('All');
    const [filterBrand, setFilterBrand] = useState('All');
    const [showAlert, setShowAlert] = useState(true);

    // Modals
    const [detailModal, setDetailModal] = useState({ open: false, type: 'car', id: null, vehicle: null });
    const [editModal, setEditModal] = useState({ open: false, type: 'car', vehicle: null });
    const [deactivateModal, setDeactivateModal] = useState({ open: false, type: 'car', vehicle: null });

    // Queries
    const { data: cars = [], isLoading: carsLoading } = useQuery({
        queryKey: ['admin-cars'],
        queryFn: async () => {
            const res = await axiosPublic.get('adminVehicleRoutes/cars', { withCredentials: true });
            return res.data || [];
        }
    });

    const { data: bikes = [], isLoading: bikesLoading } = useQuery({
        queryKey: ['admin-bikes'],
        queryFn: async () => {
            const res = await axiosPublic.get('adminVehicleRoutes/bikes', { withCredentials: true });
            return res.data || [];
        }
    });

    // Mutations
    const updateCarMutation = useMutation({
        mutationFn: async (updatedData) => {
            return await axiosPublic.patch(`adminVehicleRoutes/update-car/${updatedData.car_id}`, updatedData, { withCredentials: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-cars']);
            toast.success('Car updated successfully');
            setEditModal({ open: false, type: 'car', vehicle: null });
            setDeactivateModal({ open: false, type: 'car', vehicle: null });
        },
        onError: (err) => toast.error(err.message || 'Update failed')
    });

    const updateBikeMutation = useMutation({
        mutationFn: async (updatedData) => {
            return await axiosPublic.patch(`adminVehicleRoutes/update-bike/${updatedData.bike_id}`, updatedData, { withCredentials: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-bikes']);
            toast.success('Bike updated successfully');
            setEditModal({ open: false, type: 'bike', vehicle: null });
            setDeactivateModal({ open: false, type: 'bike', vehicle: null });
        },
        onError: (err) => toast.error(err.message || 'Update failed')
    });

    // Data Processing for Current Tab
    const activeData = activeTab === 0 ? cars : bikes;
    const agencies = useMemo(() => [...new Set(activeData.map(v => v.agency_name).filter(Boolean))], [activeData]);
    const brands = useMemo(() => [...new Set(activeData.map(v => v.brand).filter(Boolean))], [activeData]);

    const filteredData = useMemo(() => {
        return activeData.filter(v => {
            const term = search.toLowerCase();
            const matchesSearch = !search || 
                (v.brand && v.brand.toLowerCase().includes(term)) || 
                (v.model && v.model.toLowerCase().includes(term)) || 
                (v.agency_name && v.agency_name.toLowerCase().includes(term));
            
            const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
            const matchesVerified = filterVerified === 'All' || (filterVerified === 'Yes' ? v.verified : !v.verified);
            const matchesAgency = filterAgency === 'All' || v.agency_name === filterAgency;
            const matchesFuel = filterFuel === 'All' || v.fuel === filterFuel;
            const matchesBrand = filterBrand === 'All' || v.brand === filterBrand;

            return matchesSearch && matchesStatus && matchesVerified && matchesAgency && matchesFuel && matchesBrand;
        });
    }, [activeData, search, filterStatus, filterVerified, filterAgency, filterFuel, filterBrand]);

    const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const stats = useMemo(() => ({
        total: filteredData.length,
        available: filteredData.filter(v => v.status === 'Available').length,
        booked: filteredData.filter(v => v.status === 'Booked').length,
        maintenance: filteredData.filter(v => v.status === 'Maintenance').length,
        unverified: filteredData.filter(v => !v.verified).length,
    }), [filteredData]);

    const docAlerts = useMemo(() => {
        const carExpLic = cars.filter(c => isExpired(c.expire_date)).length;
        const carExpIns = cars.filter(c => isExpired(c.insurance_ending_date)).length;
        const bikeExpLic = bikes.filter(b => isExpired(b.expire_date)).length;
        const bikeExpIns = bikes.filter(b => isExpired(b.insurance_ending_date)).length;
        return { carExpLic, carExpIns, bikeExpLic, bikeExpIns };
    }, [cars, bikes]);

    const hasAlerts = docAlerts.carExpLic > 0 || docAlerts.carExpIns > 0 || docAlerts.bikeExpLic > 0 || docAlerts.bikeExpIns > 0;

    const handleExportCSV = () => {
        const headers = activeTab === 0 
            ? ["Brand", "Model", "Type", "Agency", "Seats", "Transmission", "Fuel", "Rental Price", "Status", "Verified"]
            : ["Brand", "Model", "Type", "Agency", "Engine CC", "Helmets", "Fuel", "Rental Price", "Status", "Verified"];
        
        const rows = filteredData.map(v => {
            if (activeTab === 0) {
                return [`"${v.brand}"`, `"${v.model}"`, `"${v.car_type}"`, `"${v.agency_name || ''}"`, `"${v.seats}"`, `"${v.transmission_type}"`, `"${v.fuel}"`, `"${v.rental_price}"`, `"${v.status}"`, `"${v.verified ? 'Yes' : 'No'}"`];
            } else {
                return [`"${v.brand}"`, `"${v.model}"`, `"${v.car_type}"`, `"${v.agency_name || ''}"`, `"${v.engine_capacity}"`, `"${v.helmet_count}"`, `"${v.fuel}"`, `"${v.rental_price}"`, `"${v.status}"`, `"${v.verified ? 'Yes' : 'No'}"`];
            }
        });
        
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTab === 0 ? 'cars' : 'bikes'}_export.csv`;
        a.click();
    };

    const handleChangeTab = (e, val) => {
        setActiveTab(val);
        setPage(0);
        setSearch('');
        setFilterStatus('All');
        setFilterVerified('All');
        setFilterAgency('All');
        setFilterFuel('All');
        setFilterBrand('All');
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', mx: 'auto', fontFamily: 'sans-serif' }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Registered Vehicles</Typography>

            {hasAlerts && (
                <Collapse in={showAlert}>
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} action={<IconButton size="small" onClick={() => setShowAlert(false)}><Close /></IconButton>}>
                        <AlertTitle sx={{ fontWeight: 'bold' }}>Documentation Alerts</AlertTitle>
                        {docAlerts.carExpLic > 0 && <Box>• {docAlerts.carExpLic} cars have expired licenses</Box>}
                        {docAlerts.carExpIns > 0 && <Box>• {docAlerts.carExpIns} cars have expired insurance</Box>}
                        {docAlerts.bikeExpLic > 0 && <Box>• {docAlerts.bikeExpLic} bikes have expired licenses</Box>}
                        {docAlerts.bikeExpIns > 0 && <Box>• {docAlerts.bikeExpIns} bikes have expired insurance</Box>}
                    </Alert>
                </Collapse>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleChangeTab} TabIndicatorProps={{ style: { backgroundColor: '#F97316' } }}>
                    <Tab label="🚗 Cars" sx={{ fontWeight: 'bold', '&.Mui-selected': { color: '#F97316' } }} />
                    <Tab label="🏍️ Bikes" sx={{ fontWeight: 'bold', '&.Mui-selected': { color: '#F97316' } }} />
                </Tabs>
            </Box>

            {/* Stat Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2.4}><Card sx={{ borderLeft: '4px solid #3b82f6', boxShadow: 1 }}><CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}><Typography variant="caption" color="textSecondary" fontWeight="bold">TOTAL {activeTab === 0 ? 'CARS' : 'BIKES'}</Typography><Typography variant="h5" fontWeight="bold">{stats.total}</Typography></CardContent></Card></Grid>
                <Grid item xs={12} sm={6} md={2.4}><Card sx={{ borderLeft: '4px solid #10b981', boxShadow: 1 }}><CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}><Typography variant="caption" color="textSecondary" fontWeight="bold">AVAILABLE NOW</Typography><Typography variant="h5" fontWeight="bold">{stats.available}</Typography></CardContent></Card></Grid>
                <Grid item xs={12} sm={6} md={2.4}><Card sx={{ borderLeft: '4px solid #0284c7', boxShadow: 1 }}><CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}><Typography variant="caption" color="textSecondary" fontWeight="bold">CURRENTLY BOOKED</Typography><Typography variant="h5" fontWeight="bold">{stats.booked}</Typography></CardContent></Card></Grid>
                <Grid item xs={12} sm={6} md={2.4}><Card sx={{ borderLeft: '4px solid #f59e0b', boxShadow: 1 }}><CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}><Typography variant="caption" color="textSecondary" fontWeight="bold">UNDER MAINTENANCE</Typography><Typography variant="h5" fontWeight="bold">{stats.maintenance}</Typography></CardContent></Card></Grid>
                <Grid item xs={12} sm={6} md={2.4}><Card sx={{ borderLeft: '4px solid #f59e0b', boxShadow: 1, cursor: 'pointer', '&:hover': { bgcolor: '#fffbeb' } }} onClick={() => setFilterVerified('No')}><CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}><Typography variant="caption" fontWeight="bold" color="#f59e0b">PENDING VERIFICATION</Typography><Typography variant="h5" fontWeight="bold" color="#f59e0b">{stats.unverified}</Typography></CardContent></Card></Grid>
            </Grid>

            {/* Filters Bar */}
            <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField size="small" placeholder="Search brand, model, agency..." value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} /> }} sx={{ flexGrow: 1, minWidth: '200px' }} />
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="Available">Available</MenuItem>
                        <MenuItem value="Booked">Booked</MenuItem>
                        <MenuItem value="Maintenance">Maintenance</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>Verified</InputLabel>
                    <Select value={filterVerified} label="Verified" onChange={e => setFilterVerified(e.target.value)}>
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Agency</InputLabel>
                    <Select value={filterAgency} label="Agency" onChange={e => setFilterAgency(e.target.value)}>
                        <MenuItem value="All">All Agencies</MenuItem>
                        {agencies.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Fuel Type</InputLabel>
                    <Select value={filterFuel} label="Fuel Type" onChange={e => setFilterFuel(e.target.value)}>
                        <MenuItem value="All">All Fuels</MenuItem>
                        <MenuItem value="Petrol">Petrol</MenuItem>
                        <MenuItem value="Diesel">Diesel</MenuItem>
                        <MenuItem value="Electric">Electric</MenuItem>
                        <MenuItem value="Hybrid">Hybrid</MenuItem>
                        <MenuItem value="CNG">CNG</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Brand</InputLabel>
                    <Select value={filterBrand} label="Brand" onChange={e => setFilterBrand(e.target.value)}>
                        <MenuItem value="All">All Brands</MenuItem>
                        {brands.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                    </Select>
                </FormControl>

                <Button variant="outlined" startIcon={<Download />} onClick={handleExportCSV} sx={{ color: '#F97316', borderColor: '#F97316' }}>Export CSV</Button>
            </Paper>

            {/* Tables */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1, overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Vehicle</StyledTableCell>
                            <StyledTableCell>Agency</StyledTableCell>
                            <StyledTableCell>Type</StyledTableCell>
                            {activeTab === 0 ? (
                                <>
                                    <StyledTableCell>Seats</StyledTableCell>
                                    <StyledTableCell>Transmission</StyledTableCell>
                                </>
                            ) : (
                                <>
                                    <StyledTableCell>Engine</StyledTableCell>
                                    <StyledTableCell>Helmets</StyledTableCell>
                                </>
                            )}
                            <StyledTableCell>Fuel</StyledTableCell>
                            <StyledTableCell>Rent/Hr</StyledTableCell>
                            <StyledTableCell>Rating</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                            <StyledTableCell>Verified</StyledTableCell>
                            <StyledTableCell align="center">Action</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(carsLoading || bikesLoading) ? (
                            <TableRow><TableCell colSpan={11} align="center" sx={{ py: 10 }}>Loading data...</TableCell></TableRow>
                        ) : paginatedData.map((row) => {
                            const hasWarning = isExpired(row.expire_date) || isExpired(row.insurance_ending_date) || isExpiringSoon(row.expire_date) || isExpiringSoon(row.insurance_ending_date);
                            const vehicleId = row.car_id || row.bike_id;
                            
                            return (
                                <TableRow key={vehicleId} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar src={row.images?.[0] || ''} variant="rounded" sx={{ width: 50, height: 40 }} />
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {row.brand} {row.model}
                                                    {hasWarning && <Tooltip title="Documentation Warning"><Warning sx={{ fontSize: 16, color: '#ef4444', ml: 0.5, verticalAlign: 'middle' }}/></Tooltip>}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">Built: {row.build_year}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>{row.agency_name || 'Independent'}</Typography>
                                    </TableCell>
                                    <TableCell>{row.car_type}</TableCell>
                                    
                                    {activeTab === 0 ? (
                                        <>
                                            <TableCell><Box display="flex" alignItems="center" gap={0.5}><AccountCircle fontSize="small" color="action"/> {row.seats}</Box></TableCell>
                                            <TableCell>
                                                <Chip label={row.transmission_type || 'Unknown'} size="small" variant="outlined" color={row.transmission_type?.toLowerCase().includes('auto') ? 'secondary' : 'default'} />
                                            </TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell>{row.engine_capacity}cc</TableCell>
                                            <TableCell><Box display="flex" alignItems="center" gap={0.5}><TwoWheeler fontSize="small" color="action"/> {row.helmet_count}</Box></TableCell>
                                        </>
                                    )}

                                    <TableCell>
                                        <Chip label={row.fuel || 'Unknown'} size="small" sx={{ bgcolor: '#f1f5f9' }} />
                                        {row.mileage && <Typography variant="caption" display="block" color="textSecondary">{row.mileage} km/L</Typography>}
                                    </TableCell>
                                    <TableCell>৳{row.rental_price}</TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <Star sx={{ fontSize: 16, color: '#f59e0b' }} />
                                            <Typography variant="body2" fontWeight="bold">{row.rating || '0.0'}</Typography>
                                        </Box>
                                        <Typography variant="caption" color="textSecondary">({row.review_count || 0} reviews)</Typography>
                                    </TableCell>
                                    <TableCell><StatusBadge status={row.status} /></TableCell>
                                    <TableCell align="center">
                                        {row.verified ? <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} /> : <Cancel sx={{ color: '#ef4444', fontSize: 20 }} />}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" justifyContent="center" gap={0.5}>
                                            <IconButton size="small" color="info" onClick={() => setDetailModal({ open: true, type: activeTab === 0 ? 'car' : 'bike', id: vehicleId, vehicle: row })}><Info fontSize="small" /></IconButton>
                                            <IconButton size="small" color="warning" onClick={() => setEditModal({ open: true, type: activeTab === 0 ? 'car' : 'bike', vehicle: row })}><Edit fontSize="small" /></IconButton>
                                            <IconButton size="small" color="error" onClick={() => setDeactivateModal({ open: true, type: activeTab === 0 ? 'car' : 'bike', vehicle: row })}><Block fontSize="small" /></IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {!carsLoading && !bikesLoading && paginatedData.length === 0 && (
                            <TableRow><TableCell colSpan={11} align="center" sx={{ py: 5 }}>No vehicles match the selected filters.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[8, 25, 50]}
                    component="div"
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </TableContainer>

            {/* View Detail Modal Integration */}
            <VehicleDetailModal 
                open={detailModal.open} 
                onClose={() => setDetailModal({ ...detailModal, open: false })} 
                type={detailModal.type} 
                id={detailModal.id} 
                vehicle={detailModal.vehicle} 
            />

            {/* Edit Manage Modal */}
            <EditManageModal 
                open={editModal.open} 
                onClose={() => setEditModal({ ...editModal, open: false })} 
                type={editModal.type} 
                vehicle={editModal.vehicle} 
                onSave={(data) => editModal.type === 'car' ? updateCarMutation.mutate(data) : updateBikeMutation.mutate(data)} 
            />

            {/* Deactivate Modal */}
            <DeactivateModal 
                open={deactivateModal.open} 
                onClose={() => setDeactivateModal({ ...deactivateModal, open: false })} 
                type={deactivateModal.type} 
                vehicle={deactivateModal.vehicle} 
                onConfirm={(data) => deactivateModal.type === 'car' ? updateCarMutation.mutate(data) : updateBikeMutation.mutate(data)} 
            />

        </Box>
    );
};

// --- Sub-components (Modals) ---

const EditManageModal = ({ open, onClose, type, vehicle, onSave }) => {
    const [formData, setFormData] = useState({});

    React.useEffect(() => {
        if (vehicle) {
            setFormData({
                [type === 'car' ? 'car_id' : 'bike_id']: vehicle[type === 'car' ? 'car_id' : 'bike_id'],
                status: vehicle.status || 'Available',
                verified: !!vehicle.verified,
                rental_price: vehicle.rental_price || 0,
                next_available_at: vehicle.next_available_at ? moment(vehicle.next_available_at).format('YYYY-MM-DDTHH:mm') : '',
                admin_note: ''
            });
        }
    }, [vehicle, type]);

    if (!vehicle) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Edit color="warning" /> Manage {vehicle.brand} {vehicle.model}
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select value={formData.status || 'Available'} label="Status" onChange={e => setFormData({ ...formData, status: e.target.value })}>
                            <MenuItem value="Available">Available</MenuItem>
                            <MenuItem value="Booked">Booked</MenuItem>
                            <MenuItem value="Maintenance">Maintenance</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <FormControlLabel control={<Switch checked={formData.verified} onChange={e => setFormData({ ...formData, verified: e.target.checked })} color="success" />} label="Verified Vehicle" />

                    <TextField label="Rental Price (BDT/Hr)" type="number" fullWidth size="small" value={formData.rental_price} onChange={e => setFormData({ ...formData, rental_price: e.target.value })} />

                    <TextField label="Next Available At" type="datetime-local" fullWidth size="small" InputLabelProps={{ shrink: true }} value={formData.next_available_at} onChange={e => setFormData({ ...formData, next_available_at: e.target.value })} />

                    <TextField label="Admin Note (Optional)" multiline rows={3} fullWidth placeholder="Add reason for the update..." value={formData.admin_note} onChange={e => setFormData({ ...formData, admin_note: e.target.value })} />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button variant="contained" onClick={() => onSave(formData)} sx={{ bgcolor: '#F97316', '&:hover': { bgcolor: '#ea580c' } }}>Save Changes</Button>
            </DialogActions>
        </Dialog>
    );
};

const DeactivateModal = ({ open, onClose, type, vehicle, onConfirm }) => {
    const [reason, setReason] = useState('');
    if (!vehicle) return null;
    const hasActiveBooking = vehicle.status === 'Booked';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Block /> Deactivate Vehicle
            </DialogTitle>
            <DialogContent dividers>
                <Typography mb={2}>Are you sure you want to deactivate <strong>{vehicle.brand} {vehicle.model}</strong>?</Typography>
                {hasActiveBooking && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <AlertTitle>Warning</AlertTitle>
                        This vehicle is currently <strong>Booked</strong>. Deactivating will affect the customer.
                    </Alert>
                )}
                <TextField required fullWidth multiline rows={3} label="Reason for Deactivation" value={reason} onChange={e => setReason(e.target.value)} error={!reason} helperText="Required" />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button variant="contained" color="error" disabled={!reason.trim()} onClick={() => onConfirm({ 
                    [type === 'car' ? 'car_id' : 'bike_id']: vehicle[type === 'car' ? 'car_id' : 'bike_id'], 
                    status: 'Inactive', 
                    admin_note: reason 
                })}>Confirm Deactivation</Button>
            </DialogActions>
        </Dialog>
    );
};

const VehicleDetailModal = ({ open, onClose, type, id, vehicle }) => {
    const [tab, setTab] = useState(0);
    const axiosPublic = useAxiosPublic();

    const { data: details, isLoading } = useQuery({
        queryKey: [`admin-${type}-details`, id],
        queryFn: async () => {
            if (!id) return null;
            const res = await axiosPublic.get(`adminVehicleRoutes/${type}-details/${id}`, { withCredentials: true });
            return res.data;
        },
        enabled: open && !!id
    });

    if (!vehicle) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ bgcolor: '#F97316', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={vehicle.images?.[0]} sx={{ width: 60, height: 60 }} variant="rounded" />
                <Box>
                    <Typography variant="h6" fontWeight="bold">{vehicle.brand} {vehicle.model}</Typography>
                    <Typography variant="caption">{id}</Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0, minHeight: 400 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                    <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" TabIndicatorProps={{ style: { backgroundColor: '#F97316' } }}>
                        <Tab label="Overview" />
                        <Tab label="Documentation" />
                        <Tab label="Booking History" />
                        {type === 'car' && <Tab label="Damage Reports" />}
                        <Tab label="Reviews" />
                    </Tabs>
                </Box>

                <Box p={3}>
                    {isLoading ? <Typography align="center" mt={4}>Loading details...</Typography> : details && (
                        <>
                            {/* Implementation for each tab can be filled out with similar styled UI */}
                            {tab === 0 && <OverviewTab data={details.overview} type={type} />}
                            {tab === 1 && <DocumentationTab data={details.documentation} />}
                            {tab === 2 && <BookingsTab data={details.bookings} />}
                            {tab === 3 && type === 'car' && <DamagesTab data={details.damages} />}
                            {(tab === 3 && type === 'bike') || (tab === 4 && type === 'car') ? <ReviewsTab data={details.reviews} /> : null}
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

// Extracted Tab Contents (Simple rendering for brevity in admin context)
const OverviewTab = ({ data, type }) => (
    <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
            <Box display="flex" gap={1} overflow="auto" mb={2}>
                {data.images?.map((img, i) => <img key={i} src={img} alt="Vehicle" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8 }} />)}
            </Box>
            <Typography variant="body1"><strong>Description:</strong> {data.about || 'No description available.'}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
            <Card variant="outlined"><CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Brand</Typography><Typography variant="body1">{data.brand}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Model</Typography><Typography variant="body1">{data.model}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Type</Typography><Typography variant="body1">{data.car_type}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Build Year</Typography><Typography variant="body1">{data.build_year}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Fuel</Typography><Typography variant="body1">{data.fuel}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Rental Price</Typography><Typography variant="body1">৳{data.rental_price}/Hr</Typography></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Status</Typography><Box mt={0.5}><StatusBadge status={data.status} /></Box></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Verified</Typography><Box mt={0.5}>{data.verified ? <Chip size="small" color="success" label="Verified" icon={<VerifiedUser/>}/> : <Chip size="small" color="error" label="Unverified" />}</Box></Grid>
                </Grid>
            </CardContent></Card>
        </Grid>
    </Grid>
);

const DocumentationTab = ({ data }) => {
    if (!data) return <Typography color="textSecondary">No documentation records found.</Typography>;
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderColor: isExpired(data.expire_date) ? '#ef4444' : isExpiringSoon(data.expire_date) ? '#f59e0b' : 'divider' }}>
                    <CardContent>
                        <Typography variant="h6" mb={2}>Registration License</Typography>
                        <Typography variant="body2"><strong>Number:</strong> {data.license_number}</Typography>
                        <Typography variant="body2" color={isExpired(data.expire_date) ? 'error' : 'textPrimary'}><strong>Expires:</strong> {moment(data.expire_date).format('LL')}</Typography>
                        <Typography variant="body2"><strong>Authority:</strong> {data.issuing_authority}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderColor: isExpired(data.insurance_ending_date) ? '#ef4444' : 'divider' }}>
                    <CardContent>
                        <Typography variant="h6" mb={2}>Insurance</Typography>
                        <Typography variant="body2"><strong>Number:</strong> {data.insurance_number}</Typography>
                        <Typography variant="body2"><strong>Provider:</strong> {data.insurance_provider}</Typography>
                        <Typography variant="body2" color={isExpired(data.insurance_ending_date) ? 'error' : 'textPrimary'}><strong>Expires:</strong> {moment(data.insurance_ending_date).format('LL')}</Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

const BookingsTab = ({ data }) => {
    if (!data || data.length === 0) return <Typography color="textSecondary">No bookings history.</Typography>;
    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead><TableRow><TableCell>Booking ID</TableCell><TableCell>User</TableCell><TableCell>Dates</TableCell><TableCell>Amount</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                <TableBody>
                    {data.map(b => (
                        <TableRow key={b.booking_id}>
                            <TableCell>{b.booking_id}</TableCell>
                            <TableCell>{b.user_name}</TableCell>
                            <TableCell>{moment(b.start_ts).format('MMM DD')} - {moment(b.end_ts).format('MMM DD, YYYY')}</TableCell>
                            <TableCell>৳{b.total_cost}</TableCell>
                            <TableCell><Chip label={b.status} size="small" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const DamagesTab = ({ data }) => {
    if (!data || data.length === 0) return <Typography color="textSecondary">No damage reports.</Typography>;
    return (
        <Grid container spacing={2}>
            {data.map(d => (
                <Grid item xs={12} md={6} key={d.damage_id}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold">{d.damage_type}</Typography>
                            <Typography variant="caption" color="textSecondary">{moment(d.report_date).format('LL')}</Typography>
                            <Typography variant="body2" mt={1}>{d.description}</Typography>
                            <Box mt={1} display="flex" gap={1}>
                                <Chip label={d.severity} size="small" color={d.severity === 'Severe' ? 'error' : d.severity === 'Moderate' ? 'warning' : 'success'} />
                                <Chip label={`Est. ৳${d.estimated_cost}`} size="small" variant="outlined" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

const ReviewsTab = ({ data }) => {
    if (!data || data.length === 0) return <Typography color="textSecondary">No reviews yet.</Typography>;
    return (
        <Box display="flex" flexDirection="column" gap={2}>
            {data.map((r, i) => (
                <Box key={i} p={2} bgcolor="#f8fafc" borderRadius={2} border="1px solid #e2e8f0">
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="subtitle2" fontWeight="bold">{r.user_name}</Typography>
                        <Typography variant="caption" color="textSecondary">{moment(r.date).format('LL')}</Typography>
                    </Box>
                    <Box display="flex" mb={1}>{[...Array(5)].map((_, idx) => <Star key={idx} sx={{ fontSize: 16, color: idx < r.rating ? '#faaf00' : '#cbd5e1' }} />)}</Box>
                    <Typography variant="body2">{r.review}</Typography>
                </Box>
            ))}
        </Box>
    );
};

export default Vehicles;