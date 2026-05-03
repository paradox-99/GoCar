import { Link } from 'react-router-dom';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { 
    Box, IconButton, Paper, styled, Table, TableBody, TableCell, 
    tableCellClasses, TableContainer, TableFooter, TableHead, 
    TablePagination, TableRow, Chip, TextField, MenuItem, 
    Select, FormControl, InputLabel, Button, Tooltip, 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Tabs, Tab, Avatar, Typography, Divider, Grid,
    Switch, FormControlLabel, Card, CardContent
} from '@mui/material';
import { 
    FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage, 
    Info, Edit, Block, Search, Download, CheckCircle, 
    Cancel, AccountCircle, DirectionsCar, Assessment, VpnKey,
    CheckCircleOutline, CancelOutlined
} from '@mui/icons-material';
import { useTheme } from '@emotion/react';
import { useState, useCallback, useMemo } from 'react';
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

const StatusChip = ({ status }) => {
    const lowerStatus = status?.toLowerCase();
    let color = "default";
    if (lowerStatus === 'active') color = "success";
    if (lowerStatus === 'suspended') color = "warning";
    if (lowerStatus === 'banned') color = "error";
    
    return <Chip label={status || 'Active'} color={color} size="small" sx={{ fontWeight: 500, textTransform: 'capitalize' }} />;
};

const Users = () => {
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [verifiedFilter, setVerifiedFilter] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');

    // Modals state
    const [detailUser, setDetailUser] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [confirmBan, setConfirmBan] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', page, rowsPerPage, search, statusFilter, verifiedFilter, roleFilter],
        queryFn: async () => {
            const params = {
                page,
                limit: rowsPerPage,
                search,
                status: statusFilter,
                verified: verifiedFilter,
                role: roleFilter
            };
            const response = await axiosPublic.get(`userRoute/users/admin`, { params, withCredentials: true });
            return response.data;
        },
    });

    const userDetailsQuery = useQuery({
        queryKey: ['user-details', detailUser?.user_id],
        queryFn: async () => {
            const response = await axiosPublic.get(`userRoute/users/admin/details/${detailUser.user_id}`);
            return response.data;
        },
        enabled: !!detailUser
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedData) => {
            return await axiosPublic.patch(`userRoute/users/admin/update/${updatedData.user_id}`, updatedData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success('User updated successfully');
            setEditUser(null);
            setConfirmBan(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    });

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleExportCSV = () => {
        if (!data?.users) return;
        const headers = ["Name", "Email", "Phone", "Role", "Status", "Verified", "Joined"];
        const csvRows = [
            headers.join(','),
            ...data.users.map(u => [
                `"${u.name}"`, `"${u.email}"`, `"${u.phone}"`, `"${u.userrole}"`, `"${u.accountstatus}"`, `"${u.verified ? 'Yes' : 'No'}"`, `"${moment(u.created_at).format('YYYY-MM-DD')}"`
            ].join(','))
        ];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${moment().format('YYYYMMDD')}.csv`;
        a.click();
    };

    const handleQuickSuspend = (user) => {
        const newStatus = user.accountstatus === 'Suspended' ? 'Active' : 'Suspended';
        updateMutation.mutate({ user_id: user.user_id, accountstatus: newStatus, userrole: user.userrole, verified: user.verified });
    };

    // Calculate Summary Stats from data (assuming total counts might be included in data, but if paginated, we only have data.totalCount. Let's assume the API might not return all these specific counts unless we have them. Wait, if it's paginated, we can't reliably show active/suspended without a specific API endpoint. But we can show it based on the current page if needed, or if backend returns total stats.)
    // If backend doesn't return full stats, we can just use the counts we have, or mock it for now like in AdminDrivers (if drivers wasn't paginated backend). Wait, in AdminDrivers it was fetching ALL drivers (`admin-all-drivers`). Here it's `userRoute/users/admin` with `page, limit`. So we only have the current page. Let's just use `data?.totalCount` for total, and display N/A or derive from the current array if needed.
    const activeUsers = data?.users?.filter(u => u.accountstatus === 'Active').length || 0;
    const agencyOwners = data?.users?.filter(u => u.userrole === 'agency').length || 0;
    const suspendedUsers = data?.users?.filter(u => u.accountstatus === 'Suspended' || u.accountstatus === 'Banned').length || 0;

    return (
        <Box sx={{ p: 6, maxWidth: '1536px', mx: 'auto', fontFamily: 'sans-serif', color: '#1f2937' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1f2937' }}>User Management</Typography>

            {/* Stats Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderLeft: 4, borderColor: '#3b82f6', boxShadow: 1 }}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Total Users</Typography>
                            <Typography variant="h5" fontWeight="bold">{data?.totalCount || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderLeft: 4, borderColor: '#10b981', boxShadow: 1 }}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Active (This Page)</Typography>
                            <Typography variant="h5" fontWeight="bold">{activeUsers}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderLeft: 4, borderColor: '#f59e0b', boxShadow: 1, cursor: 'pointer', transition: 'all 0.2s', '&:hover':{ bgcolor: '#fffbeb' } }} onClick={() => setRoleFilter('Agency Owner')}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Agency Owners (This Page)</Typography>
                            <Typography variant="h5" fontWeight="bold">{agencyOwners}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderLeft: 4, borderColor: '#ef4444', boxShadow: 1, cursor: 'pointer', transition: 'all 0.2s', '&:hover':{ bgcolor: '#fef2f2' } }} onClick={() => setStatusFilter('Suspended')}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">Suspended (This Page)</Typography>
                            <Typography variant="h5" fontWeight="bold" color="error">{suspendedUsers}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Top Bar / Filters */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <TextField
                    size="small"
                    placeholder="Search name, email, phone..."
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
                        <MenuItem value="Suspended">Suspended</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
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
                    <InputLabel>Role</InputLabel>
                    <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
                        <MenuItem value="All">All Roles</MenuItem>
                        <MenuItem value="Customer">Customer</MenuItem>
                        <MenuItem value="Agency Owner">Agency Owner</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
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
                            <StyledTableCell sx={{ color: 'white' }}>User Name</StyledTableCell>
                            <StyledTableCell sx={{ color: 'white' }}>Contact Info</StyledTableCell>
                            <StyledTableCell sx={{ color: 'white' }}>Role</StyledTableCell>
                            <StyledTableCell sx={{ color: 'white' }}>Joined</StyledTableCell>
                            <StyledTableCell sx={{ color: 'white' }}>Status</StyledTableCell>
                            <StyledTableCell sx={{ color: 'white' }} align="center">Verified</StyledTableCell>
                            <StyledTableCell sx={{ color: 'white' }} align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 10 }}>Loading users...</TableCell></TableRow>
                        ) : data?.users.map((row) => (
                            <TableRow key={row.user_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar src={row.photo} alt={row.name} sx={{ width: 40, height: 40 }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold" color="textPrimary">{row.name}</Typography>
                                            <Typography variant="caption" color="textSecondary">{row.user_id}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{row.email}</Typography>
                                    <Typography variant="caption" color="textSecondary">{row.phone}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip label={row.userrole} size="small" variant="outlined" sx={{ textTransform: 'capitalize', fontWeight: 500, color: '#4b5563' }} />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{moment(row.created_at).format('MMM DD, YYYY')}</Typography>
                                </TableCell>
                                <TableCell><StatusChip status={row.accountstatus} /></TableCell>
                                <TableCell align="center">
                                    {row.verified ? <CheckCircleOutline color="success" /> : <CancelOutlined color="error" />}
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <Tooltip title="View Details">
                                            <IconButton size="small" onClick={() => setDetailUser(row)} sx={{ color: '#3b82f6' }}><Info fontSize="small" /></IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit Account">
                                            <IconButton size="small" onClick={() => setEditUser({...row})} sx={{ color: '#F97316' }}><Edit fontSize="small" /></IconButton>
                                        </Tooltip>
                                        <Tooltip title={row.accountstatus === 'Suspended' ? "Active" : "Suspend Account"}>
                                            <IconButton size="small" onClick={() => setConfirmBan(row)} sx={{ color: '#ef4444' }}><Block fontSize="small" /></IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && (!data?.users || data.users.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                    <Typography color="textSecondary">No users match your current filters.</Typography>
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

            {/* User Detail Modal */}
            <Dialog open={!!detailUser} onClose={() => setDetailUser(null)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ backgroundColor: '#F97316', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={detailUser?.photo} alt={detailUser?.name} sx={{ width: 50, height: 50, border: '2px solid white' }} />
                    <Box>
                        <Typography variant="h6" fontWeight="bold">{detailUser?.name}</Typography>
                        <Typography variant="caption">{detailUser?.user_id}</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2, p: 0 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto" TabIndicatorProps={{ style: { backgroundColor: '#F97316' } }}>
                            <Tab label="Profile" icon={<AccountCircle />} iconPosition="start" />
                            <Tab label="License" icon={<VpnKey />} iconPosition="start" />
                            <Tab label="Bookings" icon={<DirectionsCar />} iconPosition="start" />
                            <Tab label="Activity" icon={<Assessment />} iconPosition="start" />
                        </Tabs>
                    </Box>
                    <Box sx={{ p: 3, minHeight: 400 }}>
                        {userDetailsQuery.isLoading ? (
                            <Typography align="center" sx={{ mt: 5 }}>Loading details...</Typography>
                        ) : detailUser && (
                            <>
                                {tabValue === 0 && (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={4} className="text-center">
                                            <Avatar src={detailUser.photo} sx={{ width: 150, height: 150, mx: 'auto', mb: 2, boxShadow: 3 }} />
                                            <StatusChip status={detailUser.accountstatus} />
                                            <Box mt={1}>
                                                {detailUser.verified ? <Chip icon={<CheckCircle />} label="Verified" color="success" size="small" /> : <Chip icon={<Cancel />} label="Unverified" color="error" size="small" />}
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={8}>
                                            <Typography variant="h6" gutterBottom color="#F97316">Personal Information</Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}><Typography variant="caption" color="textSecondary">Email</Typography><Typography>{detailUser.email}</Typography></Grid>
                                                <Grid item xs={6}><Typography variant="caption" color="textSecondary">Phone</Typography><Typography>{detailUser.phone}</Typography></Grid>
                                                <Grid item xs={6}><Typography variant="caption" color="textSecondary">Gender</Typography><Typography>{detailUser.gender || 'N/A'}</Typography></Grid>
                                                <Grid item xs={6}><Typography variant="caption" color="textSecondary">DOB</Typography><Typography>{detailUser.dob ? moment(detailUser.dob).format('LL') : 'N/A'}</Typography></Grid>
                                                <Grid item xs={6}><Typography variant="caption" color="textSecondary">NID</Typography><Typography>{detailUser.nid || 'N/A'}</Typography></Grid>
                                                <Grid item xs={6}><Typography variant="caption" color="textSecondary">Registered On</Typography><Typography>{moment(detailUser.created_at).format('LL')}</Typography></Grid>
                                                <Grid item xs={12}><Typography variant="caption" color="textSecondary">Address</Typography><Typography>{detailUser.address || 'N/A'}</Typography></Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                )}
                                {tabValue === 1 && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom color="#F97316">Driver License Info</Typography>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined">
                                                    <CardContent>
                                                        <Typography variant="caption" color="textSecondary">License Number</Typography>
                                                        <Typography variant="h6">{detailUser.license_number || 'N/A'}</Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined">
                                                    <CardContent>
                                                        <Typography variant="caption" color="textSecondary">License Status</Typography>
                                                        <Box mt={0.5}><Chip label={detailUser.license_status || 'N/A'} color={detailUser.license_status === 'Valid' ? 'success' : 'default'} /></Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined">
                                                    <CardContent>
                                                        <Typography variant="caption" color="textSecondary">Expiry Date</Typography>
                                                        <Typography variant="h6">{detailUser.expire_date ? moment(detailUser.expire_date).format('LL') : 'N/A'}</Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined">
                                                    <CardContent>
                                                        <Typography variant="caption" color="textSecondary">Experience</Typography>
                                                        <Typography variant="h6">{detailUser.experience ? `${detailUser.experience} Years` : 'N/A'}</Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                )}
                                {tabValue === 2 && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom color="#F97316">Recent Bookings</Typography>
                                        {userDetailsQuery.data?.bookings?.length > 0 ? (
                                            <TableContainer sx={{ maxHeight: 300 }}>
                                                <Table stickyHeader size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Vehicle</TableCell>
                                                            <TableCell>Date</TableCell>
                                                            <TableCell>Total</TableCell>
                                                            <TableCell>Status</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {userDetailsQuery.data.bookings.map((b) => (
                                                            <TableRow key={b.booking_id}>
                                                                <TableCell>{b.brand} {b.model}</TableCell>
                                                                <TableCell>{moment(b.booking_ts).format('MMM DD, YYYY')}</TableCell>
                                                                <TableCell>৳{b.total_cost}</TableCell>
                                                                <TableCell><StatusChip status={b.status} /></TableCell>
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
                                {tabValue === 3 && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom color="#F97316">Platform Activity</Typography>
                                        <Grid container spacing={3} sx={{ mt: 1 }}>
                                            <Grid item xs={12} sm={4}>
                                                <Card sx={{ bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                                                    <CardContent sx={{ textAlign: 'center' }}>
                                                        <Typography variant="h3" color="primary" fontWeight="bold">{userDetailsQuery.data?.activity.total_bookings}</Typography>
                                                        <Typography variant="subtitle2" color="textSecondary">Total Bookings</Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Card sx={{ bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
                                                    <CardContent sx={{ textAlign: 'center' }}>
                                                        <Typography variant="h3" color="error" fontWeight="bold">{userDetailsQuery.data?.activity.cancellation_count}</Typography>
                                                        <Typography variant="subtitle2" color="textSecondary">Cancellations</Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Card sx={{ bgcolor: '#fffbeb', border: '1px solid #fde68a' }}>
                                                    <CardContent sx={{ textAlign: 'center' }}>
                                                        <Typography variant="h3" color="warning.main" fontWeight="bold">{userDetailsQuery.data?.activity.damage_reports_count}</Typography>
                                                        <Typography variant="subtitle2" color="textSecondary">Damage Reports</Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Edit color="primary" /> Manage User: {editUser?.name}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Account Status</InputLabel>
                                <Select 
                                    value={editUser?.accountstatus || ''} 
                                    label="Account Status"
                                    onChange={(e) => setEditUser({...editUser, accountstatus: e.target.value})}
                                >
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                    <MenuItem value="Suspended">Suspended</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>User Role</InputLabel>
                                <Select 
                                    value={editUser?.userrole || ''} 
                                    label="User Role"
                                    onChange={(e) => setEditUser({...editUser, userrole: e.target.value})}
                                >
                                    <MenuItem value="user">Customer</MenuItem>
                                    <MenuItem value="agency">Agency Owner</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={!!editUser?.verified} onChange={(e) => setEditUser({...editUser, verified: e.target.checked})} color="success" />}
                                label="Verified Account"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setEditUser(null)} color="inherit">Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={() => updateMutation.mutate(editUser)}
                        sx={{ bgcolor: '#F97316', '&:hover': { bgcolor: '#ea580c' } }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Quick Suspend Confirmation */}
            <Dialog open={!!confirmBan} onClose={() => setConfirmBan(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#dc2626' }}>
                    <Block /> {confirmBan?.accountstatus === 'Suspended' ? 'Reactivate' : 'Suspend / Ban'} User
                </DialogTitle>
                <DialogContent dividers>
                    <Typography>
                        Are you sure you want to {confirmBan?.accountstatus === 'Suspended' ? 'reactivate' : 'suspend'} <strong>{confirmBan?.name}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setConfirmBan(null)} color="inherit">Cancel</Button>
                    <Button 
                        variant="contained" 
                        color={confirmBan?.accountstatus === 'Suspended' ? 'success' : 'error'}
                        onClick={() => handleQuickSuspend(confirmBan)}
                    >
                        {confirmBan?.accountstatus === 'Suspended' ? 'Confirm Reactivation' : 'Confirm Suspension'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Users;