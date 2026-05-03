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
    Switch, FormControlLabel, Alert, AlertTitle, Collapse, Card, CardContent
} from '@mui/material';
import { 
    FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage, 
    Info, Edit, Block, Search, Download, CheckCircle, 
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
        fontWeight: 'bold',
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
        color = "error";
        label = "Suspended";
    }
    else if (lowerStatus === 'rejected') color = "error";
    else if (lowerStatus === 'inactive') color = "default";
    
    return <Chip label={label} color={color} size="small" sx={{ fontWeight: 500, textTransform: 'capitalize' }} />;
};

const Agencies = () => {
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
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

    const activeAgencies = useMemo(() => {
        if (!data?.agencies) return 0;
        return data.agencies.filter(a => a.status?.toLowerCase() === 'active').length;
    }, [data]);

    const suspendedAgencies = useMemo(() => {
        if (!data?.agencies) return 0;
        return data.agencies.filter(a => a.status?.toLowerCase() === 'suspend' || a.status?.toLowerCase() === 'suspended').length;
    }, [data]);

    const unverifiedAgencies = useMemo(() => {
        if (!data?.agencies) return 0;
        return data.agencies.filter(a => !a.verified).length;
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
                `"${a.agency_name}"`, `"${a.email}"`, `"${a.phone_number}"`, `"${a.owner_name}"`, `"${a.city}"`, `"${a.status}"`, `"${a.verified ? 'Yes' : 'No'}"`, `"${a.tradelicenseexpire}"`, `"${moment(a.created_at).format('YYYY-MM-DD')}"`
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
        if (expiry.isBefore(today)) return { color: '#ef4444', fontWeight: 'bold' };
        if (expiry.isBefore(today.clone().add(30, 'days'))) return { color: '#f59e0b', fontWeight: 'bold' };
        return {};
    };

    return (
        <Box sx={{ p: 6, maxWidth: '1536px', mx: 'auto', fontFamily: 'sans-serif', color: '#1f2937' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1f2937' }}>Registered Agencies</Typography>

            {expiredCount > 0 && (
                <Collapse in={showAlert}>
                    <Alert 
                        severity="error" 
                        sx={{ mb: 3, borderRadius: 2, border: '1px solid #fecaca', backgroundColor: '#fef2f2' }}
                        action={<IconButton size="small" onClick={() => setShowAlert(false)}><Close fontSize="inherit"/></IconButton>}
                    >
                        <AlertTitle sx={{ fontWeight: 'bold' }}>Action Required</AlertTitle>
                        {expiredCount} agencies on this page have expired trade licenses. Please review and update their status.
                    </Alert>
                </Collapse>
            )}

            {/* Stats Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderLeft: 4, borderColor: '#3b82f6', boxShadow: 1 }}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Total Agencies</Typography>
                            <Typography variant="h5" fontWeight="bold">{data?.totalCount || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderLeft: 4, borderColor: '#10b981', boxShadow: 1 }}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Active (This Page)</Typography>
                            <Typography variant="h5" fontWeight="bold">{activeAgencies}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderLeft: 4, borderColor: '#f59e0b', boxShadow: 1, cursor: 'pointer', transition: 'all 0.2s', '&:hover':{ bgcolor: '#fffbeb' } }} onClick={() => setVerifiedFilter('No')}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Unverified (This Page)</Typography>
                            <Typography variant="h5" fontWeight="bold">{unverifiedAgencies}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderLeft: 4, borderColor: '#ef4444', boxShadow: 1, cursor: 'pointer', transition: 'all 0.2s', '&:hover':{ bgcolor: '#fef2f2' } }} onClick={() => setStatusFilter('Suspended')}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Suspended (This Page)</Typography>
                            <Typography variant="h5" fontWeight="bold" color="error">{suspendedAgencies}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Top Bar / Filters */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <TextField
                    size="small"
                    placeholder="Search agency name, email, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} /> }}
                    sx={{ flexGrow: 1, minWidth: '250px' }}
                />
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                        <MenuItem value="All">All Status</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                        <MenuItem value="Suspend">Suspended</MenuItem>
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
                    variant="outlined" 
                    startIcon={<Download />} 
                    onClick={handleExportCSV}
                    sx={{ color: '#F97316', borderColor: '#F97316', '&:hover': { bgcolor: '#fff7ed', borderColor: '#F97316' } }}
                >
                    Export CSV
                </Button>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <Table sx={{ minWidth: 1000 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#F97316' }}>
                            <StyledTableCell sx={{ color: 'white' }}>Agency Profile</StyledTableCell>
                            <StyledTableCell sx={{ color: 'white' }}>Contact</StyledTableCell>
                            <StyledTableCell sx={{ color: 'white' }}>Fleet</StyledTableCell>
                            <StyledTableCell sx={{ color: 'white' }}>Rating</StyledTableCell>
                            <StyledTableCell sx={{ color: 'white' }}>Licensed Until</StyledTableCell>
                            <StyledTableCell sx={{ color: 'white' }}>Status</StyledTableCell>
                            <StyledTableCell sx={{ color: 'white' }} align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 10 }}>Loading agencies...</TableCell></TableRow>
                        ) : data?.agencies.map((row) => (
                            <TableRow key={row.agency_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#f1f5f9', color: '#F97316', fontWeight: 'bold' }}>
                                            {row.agency_name?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Typography variant="body2" fontWeight="bold" color="textPrimary">{row.agency_name}</Typography>
                                                {row.verified && <Tooltip title="Verified Agency"><VerifiedUser sx={{ fontSize: 16, color: '#10b981' }} /></Tooltip>}
                                            </Box>
                                            <Typography variant="caption" color="textSecondary">{row.owner_name}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{row.email}</Typography>
                                    <Typography variant="caption" color="textSecondary">{row.phone_number}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Tooltip title="Cars"><Chip icon={<DirectionsCar sx={{ fontSize: '14px !important' }}/>} label={row.cars || 0} size="small" variant="outlined" /></Tooltip>
                                        <Tooltip title="Bikes"><Chip icon={<TwoWheeler sx={{ fontSize: '14px !important' }}/>} label={row.bikes || 0} size="small" variant="outlined" /></Tooltip>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Star sx={{ fontSize: 16, color: '#f59e0b' }} />
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{row.rating || '0.0'}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={getExpiryStyle(row.tradelicenseexpire)}>
                                    {row.tradelicenseexpire ? moment(row.tradelicenseexpire).format('MMM DD, YYYY') : 'N/A'}
                                </TableCell>
                                <TableCell><StatusBadge status={row.status} /></TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <Tooltip title="Agency Details">
                                            <IconButton size="small" onClick={() => setDetailAgency(row)} sx={{ color: '#3b82f6' }}><Info fontSize="small" /></IconButton>
                                        </Tooltip>
                                        <Tooltip title="Verify & Update">
                                            <IconButton size="small" onClick={() => setVerifyAgency({...row})} sx={{ color: '#F97316' }}><Shield fontSize="small" /></IconButton>
                                        </Tooltip>
                                        <Tooltip title="Suspend Agency">
                                            <IconButton size="small" onClick={() => setSuspendAgency(row)} sx={{ color: '#ef4444' }}><Block fontSize="small" /></IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && (!data?.agencies || data.agencies.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                    <Typography color="textSecondary">No agencies match your current filters.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50]}
                                colSpan={7}
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
                <DialogTitle sx={{ backgroundColor: '#F97316', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 50, height: 50, bgcolor: 'white', color: '#F97316', fontWeight: 'bold' }}>
                        {detailAgency?.agency_name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">{detailAgency?.agency_name}</Typography>
                        <Typography variant="caption">{detailAgency?.agency_id}</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2, p: 0 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto" TabIndicatorProps={{ style: { backgroundColor: '#F97316' } }}>
                            <Tab label="Overview" icon={<Business />} iconPosition="start" />
                            <Tab label="Documents" icon={<VpnKey />} iconPosition="start" />
                            <Tab label="Fleet" icon={<DirectionsCar />} iconPosition="start" />
                            <Tab label="Owner" icon={<Person />} iconPosition="start" />
                            <Tab label="Reviews" icon={<RateReview />} iconPosition="start" />
                        </Tabs>
                    </Box>
                    <Box sx={{ p: 3, minHeight: 400 }}>
                        {detailQuery.isLoading ? (
                            <Typography align="center" sx={{ mt: 5 }}>Loading details...</Typography>
                        ) : detailQuery.data && (
                            <>
                                {tabValue === 0 && (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="h6" color="#F97316" gutterBottom>{detailQuery.data.overview.agency_name}</Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Typography variant="body2"><strong>Email:</strong> {detailQuery.data.overview.email}</Typography>
                                                <Typography variant="body2"><strong>Phone:</strong> {detailQuery.data.overview.phone_number}</Typography>
                                                <Typography variant="body2"><strong>Address:</strong> {detailQuery.data.overview.full_address}</Typography>
                                                <Typography variant="body2"><strong>City/Area:</strong> {detailQuery.data.overview.city}, {detailQuery.data.overview.area}</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">Statistics</Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Rating</Typography><Typography variant="h6">⭐ {detailQuery.data.overview.rating}</Typography></Grid>
                                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Reviews</Typography><Typography variant="h6">{detailQuery.data.overview.review_count}</Typography></Grid>
                                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Total Cars</Typography><Typography variant="h6">{detailQuery.data.overview.car_count}</Typography></Grid>
                                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Total Bikes</Typography><Typography variant="h6">{detailQuery.data.overview.bike_count}</Typography></Grid>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                )}
                                {tabValue === 1 && (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="caption" color="textSecondary">License Number</Typography>
                                                    <Typography variant="h6">{detailQuery.data.overview.license || 'N/A'}</Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="caption" color="textSecondary">TIN</Typography>
                                                    <Typography variant="h6">{detailQuery.data.overview.tin || 'N/A'}</Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="caption" color="textSecondary">Insurance Number</Typography>
                                                    <Typography variant="h6">{detailQuery.data.overview.insurancenumber || 'N/A'}</Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Card variant="outlined" sx={{ borderColor: moment(detailQuery.data.overview.tradelicenseexpire).isBefore(moment()) ? '#fecaca' : '#e2e8f0', bgcolor: moment(detailQuery.data.overview.tradelicenseexpire).isBefore(moment()) ? '#fef2f2' : 'white' }}>
                                                <CardContent>
                                                    <Typography variant="caption" color="textSecondary">Trade License Expiry</Typography>
                                                    <Typography variant="h6" sx={getExpiryStyle(detailQuery.data.overview.tradelicenseexpire)}>
                                                        {detailQuery.data.overview.tradelicenseexpire ? moment(detailQuery.data.overview.tradelicenseexpire).format('LL') : 'N/A'}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                                        <Grid item xs={6}><Typography variant="caption" color="textSecondary">Verified Status</Typography><Box mt={0.5}>{detailQuery.data.overview.verified ? <Chip icon={<VerifiedUser/>} label="Verified" color="success" /> : <Chip icon={<GppMaybe/>} label="Unverified" color="warning" />}</Box></Grid>
                                        <Grid item xs={6}><Typography variant="caption" color="textSecondary">Current Status</Typography><Box mt={0.5}><StatusBadge status={detailQuery.data.overview.status}/></Box></Grid>
                                    </Grid>
                                )}
                                {tabValue === 2 && (
                                    <TableContainer sx={{ maxHeight: 300 }}>
                                        <Table stickyHeader size="small">
                                            <TableHead><TableRow><TableCell>Vehicle</TableCell><TableCell>Type</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                                            <TableBody>
                                                {detailQuery.data.fleet.map(v => (
                                                    <TableRow key={v.id}>
                                                        <TableCell>{v.brand} {v.model}</TableCell>
                                                        <TableCell sx={{ textTransform: 'capitalize' }}>{v.type}</TableCell>
                                                        <TableCell><Chip label={v.status} size="small" variant="outlined"/></TableCell>
                                                    </TableRow>
                                                ))}
                                                {detailQuery.data.fleet.length === 0 && (
                                                    <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3 }}><Typography color="textSecondary">No vehicles found.</Typography></TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                                {tabValue === 3 && (
                                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                                        <Avatar sx={{ width: 100, height: 100, bgcolor: '#F97316', fontSize: 40, boxShadow: 2 }}>{detailQuery.data.overview.owner_name?.charAt(0)}</Avatar>
                                        <Box>
                                            <Typography variant="h5" fontWeight="bold">{detailQuery.data.overview.owner_name}</Typography>
                                            <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>Email: {detailQuery.data.overview.owner_email}</Typography>
                                            <Typography variant="body1" color="textSecondary">Phone: {detailQuery.data.overview.owner_phone}</Typography>
                                            <Typography variant="body1" color="textSecondary">NID: {detailQuery.data.overview.owner_nid}</Typography>
                                        </Box>
                                    </Box>
                                )}
                                {tabValue === 4 && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {detailQuery.data.reviews.length === 0 ? <Typography align="center" color="textSecondary" sx={{ mt: 3 }}>No reviews yet</Typography> : 
                                            detailQuery.data.reviews.map((r, i) => (
                                                <Box key={i} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#f8fafc' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight="bold">{r.user_name}</Typography>
                                                        <Typography variant="caption" color="textSecondary">{moment(r.date).format('LL')}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', mb: 1 }}>{[...Array(5)].map((_, idx) => <Star key={idx} sx={{ fontSize: 16, color: idx < r.rating ? '#faaf00' : '#cbd5e1' }} />)}</Box>
                                                    <Typography variant="body2" color="textPrimary">{r.review}</Typography>
                                                </Box>
                                            ))
                                        }
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}><Button onClick={() => setDetailAgency(null)} color="inherit">Close</Button></DialogActions>
            </Dialog>

            {/* Verify/Approve Modal */}
            <Dialog open={!!verifyAgency} onClose={() => setVerifyAgency(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Shield color="primary" /> Manage Agency: {verifyAgency?.agency_name}
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Agency Status</InputLabel>
                            <Select 
                                value={verifyAgency?.status || ''} 
                                label="Agency Status"
                                onChange={(e) => setVerifyAgency({...verifyAgency, status: e.target.value})}
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Inactive">Inactive</MenuItem>
                                <MenuItem value="Suspend">Suspended</MenuItem>
                            </Select>
                        </FormControl>
                        
                        <FormControlLabel
                            control={<Switch checked={!!verifyAgency?.verified} onChange={(e) => setVerifyAgency({...verifyAgency, verified: e.target.checked})} color="success" />}
                            label="Verified Agency"
                        />

                        <TextField
                            label="Expiration Date"
                            type="date"
                            fullWidth
                            size="small"
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
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setVerifyAgency(null)} color="inherit">Cancel</Button>
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
            <Dialog open={!!suspendAgency} onClose={() => { setSuspendAgency(null); setSuspendReason(''); }} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning /> Confirm Agency Suspension
                </DialogTitle>
                <DialogContent dividers>
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
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => { setSuspendAgency(null); setSuspendReason(''); }} color="inherit">Cancel</Button>
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
