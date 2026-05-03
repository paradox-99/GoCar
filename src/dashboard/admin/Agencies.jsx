import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
    Box, IconButton, Paper, styled, Table, TableBody, TableCell, 
    tableCellClasses, TableContainer, TableFooter, TableHead, 
    TablePagination, TableRow, Chip, TextField, MenuItem, 
    Select, FormControl, InputLabel, Button, Tooltip, 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Tabs, Tab, Avatar, Typography, Divider, Grid,
    Switch, FormControlLabel, Alert, Collapse
} from '@mui/material';
import { 
    FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage, 
    Info, Edit, Block, Search, FileDownload, CheckCircle, 
    Cancel, AccountCircle, DirectionsCar, Assessment, VpnKey,
    VerifiedUser, Shield, GppMaybe, Star, TwoWheeler, Business,
    Person, RateReview, Warning, Close
} from '@mui/icons-material';
import { useTheme } from '@emotion/react';
import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import toast from 'react-hot-toast';

function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0}>
                {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
            </IconButton>
            <IconButton onClick={handleBackButtonClick} disabled={page === 0}>
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1}>
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1}>
                {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
            </IconButton>
        </Box>
    );
}

TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#F97316",
        color: theme.palette.common.white,
        fontSize: 15,
        fontWeight: 600,
        textTransform: 'uppercase'
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StatusBadge = ({ status }) => {
    const lowerStatus = status?.toLowerCase();
    let color = "default";
    let label = status || 'Pending';
    
    if (lowerStatus === 'active') color = "success";
    else if (lowerStatus === 'pending') color = "warning";
    else if (lowerStatus === 'suspend' || lowerStatus === 'suspended') {
        color = "warning";
        label = "Suspended";
    }
    else if (lowerStatus === 'rejected') color = "error";
    
    return <Chip label={label} color={color} size="small" sx={{ fontWeight: 600, textTransform: 'capitalize' }} />;
};

const Agencies = () => {
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [verifiedFilter, setVerifiedFilter] = useState('All');
    const [cityFilter, setCityFilter] = useState('All');
    
    const [detailAgency, setDetailAgency] = useState(null);
    const [verifyAgency, setVerifyAgency] = useState(null);
    const [suspendAgency, setSuspendAgency] = useState(null);
    const [suspendReason, setSuspendReason] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [showAlert, setShowAlert] = useState(true);

    // Queries
    const { data, isLoading } = useQuery({
        queryKey: ['admin-agencies', page, rowsPerPage, search, statusFilter, verifiedFilter, cityFilter],
        queryFn: async () => {
            const params = {
                page,
                limit: rowsPerPage,
                search,
                status: statusFilter,
                verified: verifiedFilter,
                city: cityFilter
            };
            const response = await axiosPublic.get(`agencyRoutes/admin/filtered`, { params });
            return response.data;
        },
    });

    const { data: cities } = useQuery({
        queryKey: ['agency-cities'],
        queryFn: async () => {
            const response = await axiosPublic.get(`agencyRoutes/admin/cities`);
            return response.data;
        }
    });

    const detailQuery = useQuery({
        queryKey: ['agency-admin-details', detailAgency?.agency_id],
        queryFn: async () => {
            const response = await axiosPublic.get(`agencyRoutes/admin/details/${detailAgency.agency_id}`);
            return response.data;
        },
        enabled: !!detailAgency
    });

    // Mutations
    const updateMutation = useMutation({
        mutationFn: async (updatedData) => {
            return await axiosPublic.patch(`agencyRoutes/admin/update/${updatedData.agency_id}`, updatedData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-agencies']);
            toast.success('Agency updated successfully');
            setVerifyAgency(null);
            setSuspendAgency(null);
            setSuspendReason('');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    });

    const expiredCount = useMemo(() => {
        if (!data?.agencies) return 0;
        return data.agencies.filter(a => moment(a.tradelicenseexpire).isBefore(moment())).length;
    }, [data]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleExportCSV = () => {
        if (!data?.agencies) return;
        const headers = ["Agency Name", "Email", "Phone", "Owner", "City", "Status", "Verified", "License Expire", "Registered"];
        const csvRows = [
            headers.join(','),
            ...data.agencies.map(a => [
                a.agency_name, a.email, a.phone_number, a.owner_name, a.city, a.status, a.verified ? 'Yes' : 'No', a.tradelicenseexpire, moment(a.created_at).format('YYYY-MM-DD')
            ].join(','))
        ];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agencies_export_${moment().format('YYYYMMDD')}.csv`;
        a.click();
    };

    const getExpiryStyle = (date) => {
        if (!date) return {};
        const expiry = moment(date);
        const today = moment();
        if (expiry.isBefore(today)) return { color: '#ef4444', fontWeight: 600 };
        if (expiry.isBefore(today.clone().add(30, 'days'))) return { color: '#f59e0b', fontWeight: 600 };
        return {};
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#333' }}>Registered Agencies</Typography>

            {expiredCount > 0 && (
                <Collapse in={showAlert}>
                    <Alert 
                        severity="error" 
                        sx={{ mb: 3, borderRadius: '12px' }}
                        action={<IconButton size="small" onClick={() => setShowAlert(false)}><Close fontSize="inherit"/></IconButton>}
                    >
                        {expiredCount} agencies have expired trade licenses. Please review and update their status.
                    </Alert>
                </Collapse>
            )}

            {/* Top Bar / Filters */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <TextField
                    size="small"
                    placeholder="Search agency name, email, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <Search sx={{ color: 'gray', mr: 1 }} /> }}
                    sx={{ flexGrow: 1, minWidth: '250px' }}
                />
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                        <MenuItem value="All">All Status</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Suspend">Suspended</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Verified</InputLabel>
                    <Select value={verifiedFilter} label="Verified" onChange={(e) => setVerifiedFilter(e.target.value)}>
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>City</InputLabel>
                    <Select value={cityFilter} label="City" onChange={(e) => setCityFilter(e.target.value)}>
                        <MenuItem value="All">All Cities</MenuItem>
                        {cities?.map(city => <MenuItem key={city} value={city}>{city}</MenuItem>)}
                    </Select>
                </FormControl>

                <Button 
                    variant="contained" 
                    startIcon={<FileDownload />} 
                    onClick={handleExportCSV}
                    sx={{ bgcolor: '#F97316', '&:hover': { bgcolor: '#ea580c' }, textTransform: 'none', px: 3, borderRadius: '8px' }}
                >
                    Export CSV
                </Button>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 25px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Agency Name</StyledTableCell>
                            <StyledTableCell>Owner</StyledTableCell>
                            <StyledTableCell>Email/Phone</StyledTableCell>
                            <StyledTableCell>Fleet</StyledTableCell>
                            <StyledTableCell>Rating</StyledTableCell>
                            <StyledTableCell>Licensed Until</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                            <StyledTableCell align="right">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={8} align="center" sx={{ py: 10 }}>Loading agencies...</TableCell></TableRow>
                        ) : data?.agencies.map((row) => (
                            <TableRow key={row.agency_id} hover>
                                <StyledTableCell sx={{ fontWeight: 600 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {row.agency_name}
                                        {row.verified && <Tooltip title="Verified Agency"><VerifiedUser sx={{ fontSize: 16, color: '#F97316' }} /></Tooltip>}
                                    </Box>
                                </StyledTableCell>
                                <StyledTableCell>{row.owner_name}</StyledTableCell>
                                <StyledTableCell>
                                    <Typography variant="body2">{row.email}</Typography>
                                    <Typography variant="caption" color="textSecondary">{row.phone_number}</Typography>
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Tooltip title="Cars"><Chip icon={<DirectionsCar sx={{ fontSize: '14px !important' }}/>} label={row.cars || 0} size="small" variant="outlined" /></Tooltip>
                                        <Tooltip title="Bikes"><Chip icon={<TwoWheeler sx={{ fontSize: '14px !important' }}/>} label={row.bikes || 0} size="small" variant="outlined" /></Tooltip>
                                    </Box>
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Star sx={{ fontSize: 16, color: '#faaf00' }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.rating || '0.0'}</Typography>
                                    </Box>
                                </StyledTableCell>
                                <StyledTableCell sx={getExpiryStyle(row.tradelicenseexpire)}>
                                    {row.tradelicenseexpire ? moment(row.tradelicenseexpire).format('MMM DD, YYYY') : 'N/A'}
                                </StyledTableCell>
                                <StyledTableCell><StatusBadge status={row.status} /></StyledTableCell>
                                <StyledTableCell align="right">
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                        <Tooltip title="Agency Details">
                                            <IconButton size="small" onClick={() => setDetailAgency(row)} sx={{ color: '#F97316' }}><Info /></IconButton>
                                        </Tooltip>
                                        <Tooltip title="Verify & Update">
                                            <IconButton size="small" onClick={() => setVerifyAgency({...row})} sx={{ color: '#3b82f6' }}><Shield /></IconButton>
                                        </Tooltip>
                                        <Tooltip title="Suspend Agency">
                                            <IconButton size="small" onClick={() => setSuspendAgency(row)} sx={{ color: '#ef4444' }}><Block /></IconButton>
                                        </Tooltip>
                                    </Box>
                                </StyledTableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[8, 25, 50]}
                                colSpan={8}
                                count={data?.totalCount || 0}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                ActionsComponent={TablePaginationActions}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

            {/* Agency Detail Modal */}
            <Dialog open={!!detailAgency} onClose={() => setDetailAgency(null)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#F97316', color: 'white', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Business /> Agency Comprehensive Profile
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} textColor="primary" indicatorColor="primary" variant="fullWidth">
                        <Tab label="Overview" icon={<Business />} iconPosition="start" />
                        <Tab label="Documents" icon={<VpnKey />} iconPosition="start" />
                        <Tab label="Fleet" icon={<DirectionsCar />} iconPosition="start" />
                        <Tab label="Owner" icon={<Person />} iconPosition="start" />
                        <Tab label="Reviews" icon={<RateReview />} iconPosition="start" />
                    </Tabs>
                    <Box sx={{ p: 3, minHeight: '300px' }}>
                        {detailQuery.isLoading ? (
                            <Typography align="center">Loading details...</Typography>
                        ) : detailQuery.data && (
                            <>
                                {tabValue === 0 && (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="h6" color="primary" gutterBottom>{detailQuery.data.overview.agency_name}</Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Typography variant="body2"><strong>Email:</strong> {detailQuery.data.overview.email}</Typography>
                                                <Typography variant="body2"><strong>Phone:</strong> {detailQuery.data.overview.phone_number}</Typography>
                                                <Typography variant="body2"><strong>Address:</strong> {detailQuery.data.overview.full_address}</Typography>
                                                <Typography variant="body2"><strong>City/Area:</strong> {detailQuery.data.overview.city}, {detailQuery.data.overview.area}</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px' }}>
                                                <Typography variant="subtitle2" gutterBottom>Statistics</Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}><Typography variant="caption">Rating</Typography><Typography variant="h6">⭐ {detailQuery.data.overview.rating}</Typography></Grid>
                                                    <Grid item xs={6}><Typography variant="caption">Reviews</Typography><Typography variant="h6">{detailQuery.data.overview.review_count}</Typography></Grid>
                                                    <Grid item xs={6}><Typography variant="caption">Total Cars</Typography><Typography variant="h6">{detailQuery.data.overview.car_count}</Typography></Grid>
                                                    <Grid item xs={6}><Typography variant="caption">Total Bikes</Typography><Typography variant="h6">{detailQuery.data.overview.bike_count}</Typography></Grid>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                )}
                                {tabValue === 1 && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}><Typography variant="caption">License Number</Typography><Typography variant="body1">{detailQuery.data.overview.license}</Typography></Grid>
                                        <Grid item xs={6}><Typography variant="caption">TIN</Typography><Typography variant="body1">{detailQuery.data.overview.tin}</Typography></Grid>
                                        <Grid item xs={6}><Typography variant="caption">Insurance Number</Typography><Typography variant="body1">{detailQuery.data.overview.insurancenumber || 'N/A'}</Typography></Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption">Trade License Expiry</Typography>
                                            <Typography variant="body1" sx={getExpiryStyle(detailQuery.data.overview.tradelicenseexpire)}>
                                                {moment(detailQuery.data.overview.tradelicenseexpire).format('LL')}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                                        <Grid item xs={6}><Typography variant="caption">Verified Status</Typography><Box>{detailQuery.data.overview.verified ? <Chip icon={<VerifiedUser/>} label="Verified" color="success" size="small"/> : <Chip icon={<GppMaybe/>} label="Unverified" color="warning" size="small"/>}</Box></Grid>
                                        <Grid item xs={6}><Typography variant="caption">Current Status</Typography><Box><StatusBadge status={detailQuery.data.overview.status}/></Box></Grid>
                                    </Grid>
                                )}
                                {tabValue === 2 && (
                                    <Table size="small">
                                        <TableHead><TableRow><TableCell>Vehicle</TableCell><TableCell>Type</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                                        <TableBody>
                                            {detailQuery.data.fleet.map(v => (
                                                <TableRow key={v.id}>
                                                    <TableCell>{v.brand} {v.model}</TableCell>
                                                    <TableCell sx={{ textTransform: 'capitalize' }}>{v.type}</TableCell>
                                                    <TableCell><Chip label={v.status} size="small" variant="outlined"/></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                                {tabValue === 3 && (
                                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                        <Avatar sx={{ width: 80, height: 80, bgcolor: '#F97316' }}>{detailQuery.data.overview.owner_name?.charAt(0)}</Avatar>
                                        <Box>
                                            <Typography variant="h6">{detailQuery.data.overview.owner_name}</Typography>
                                            <Typography variant="body2" color="textSecondary">{detailQuery.data.overview.owner_email}</Typography>
                                            <Typography variant="body2" color="textSecondary">{detailQuery.data.overview.owner_phone}</Typography>
                                            <Typography variant="body2" color="textSecondary">NID: {detailQuery.data.overview.owner_nid}</Typography>
                                        </Box>
                                    </Box>
                                )}
                                {tabValue === 4 && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {detailQuery.data.reviews.length === 0 ? <Typography align="center" color="textSecondary">No reviews yet</Typography> : 
                                            detailQuery.data.reviews.map((r, i) => (
                                                <Box key={i} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="subtitle2">{r.user_name}</Typography>
                                                        <Typography variant="caption" color="textSecondary">{moment(r.date).format('LL')}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', mb: 1 }}>{[...Array(5)].map((_, idx) => <Star key={idx} sx={{ fontSize: 14, color: idx < r.rating ? '#faaf00' : '#cbd5e1' }} />)}</Box>
                                                    <Typography variant="body2">{r.review}</Typography>
                                                </Box>
                                            ))
                                        }
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions><Button onClick={() => setDetailAgency(null)}>Close</Button></DialogActions>
            </Dialog>

            {/* Verify/Approve Modal */}
            <Dialog open={!!verifyAgency} onClose={() => setVerifyAgency(null)}>
                <DialogTitle>Verification & Status Update: {verifyAgency?.agency_name}</DialogTitle>
                <DialogContent sx={{ minWidth: 400, pt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Agency Status</InputLabel>
                            <Select 
                                value={verifyAgency?.status || ''} 
                                label="Agency Status"
                                onChange={(e) => setVerifyAgency({...verifyAgency, status: e.target.value})}
                            >
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Suspend">Suspended</MenuItem>
                                <MenuItem value="Rejected">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                        
                        <FormControlLabel
                            control={<Switch checked={!!verifyAgency?.verified} onChange={(e) => setVerifyAgency({...verifyAgency, verified: e.target.checked})} />}
                            label="Mark as Verified Agency"
                        />

                        <TextField
                            label="Expiration Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={verifyAgency?.expire_date ? moment(verifyAgency.expire_date).format('YYYY-MM-DD') : ''}
                            onChange={(e) => setVerifyAgency({...verifyAgency, expire_date: e.target.value})}
                        />

                        <TextField
                            label="Admin Note (Optional)"
                            multiline
                            rows={3}
                            fullWidth
                            placeholder="Add a note or reason for the update..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setVerifyAgency(null)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={() => updateMutation.mutate(verifyAgency)}
                        sx={{ bgcolor: '#F97316', '&:hover': { bgcolor: '#ea580c' } }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Suspend Confirmation Dialog */}
            <Dialog open={!!suspendAgency} onClose={() => { setSuspendAgency(null); setSuspendReason(''); }}>
                <DialogTitle sx={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning /> Confirm Agency Suspension
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Are you sure you want to suspend <strong>{suspendAgency?.agency_name}</strong>? 
                        This will prevent the agency from accepting new bookings and listing vehicles.
                    </Typography>
                    <TextField
                        required
                        fullWidth
                        label="Reason for Suspension"
                        multiline
                        rows={3}
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        error={!suspendReason && suspendReason !== ''}
                        helperText="A reason is required for suspension"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setSuspendAgency(null); setSuspendReason(''); }}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="error"
                        disabled={!suspendReason.trim()}
                        onClick={() => updateMutation.mutate({ 
                            agency_id: suspendAgency.agency_id, 
                            status: 'Suspend', 
                            verified: suspendAgency.verified,
                            expire_date: suspendAgency.expire_date,
                            admin_note: suspendReason 
                        })}
                    >
                        Confirm Suspension
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Agencies;
