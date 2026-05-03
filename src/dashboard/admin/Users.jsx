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
    Switch, FormControlLabel
} from '@mui/material';
import { 
    FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage, 
    Info, Edit, Block, Search, FileDownload, CheckCircle, 
    Cancel, AccountCircle, DirectionsCar, Assessment, VpnKey 
} from '@mui/icons-material';
import { useTheme } from '@emotion/react';
import { useState, useCallback } from 'react';
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

const StatusChip = ({ status }) => {
    const lowerStatus = status?.toLowerCase();
    let color = "default";
    if (lowerStatus === 'active') color = "success";
    if (lowerStatus === 'suspended') color = "warning";
    if (lowerStatus === 'banned') color = "error";
    
    return <Chip label={status || 'Active'} color={color} size="small" sx={{ fontWeight: 600, textTransform: 'capitalize' }} />;
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
                u.name, u.email, u.phone, u.userrole, u.accountstatus, u.verified ? 'Yes' : 'No', moment(u.created_at).format('YYYY-MM-DD')
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

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#333' }}>User Management</Typography>

            {/* Top Bar / Filters */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <TextField
                    size="small"
                    placeholder="Search name, email, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <Search sx={{ color: 'gray', mr: 1 }} /> }}
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
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell>Email</StyledTableCell>
                            <StyledTableCell>Phone</StyledTableCell>
                            <StyledTableCell>Role</StyledTableCell>
                            <StyledTableCell>Joined</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                            <StyledTableCell align="center">Verified</StyledTableCell>
                            <StyledTableCell align="right">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={8} align="center" sx={{ py: 10 }}>Loading users...</TableCell></TableRow>
                        ) : data?.users.map((row) => (
                            <TableRow key={row.user_id} hover>
                                <StyledTableCell sx={{ fontWeight: 500 }}>{row.name}</StyledTableCell>
                                <StyledTableCell>{row.email}</StyledTableCell>
                                <StyledTableCell>{row.phone}</StyledTableCell>
                                <StyledTableCell>
                                    <Chip label={row.userrole} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                                </StyledTableCell>
                                <StyledTableCell>{moment(row.created_at).format('MMM DD, YYYY')}</StyledTableCell>
                                <StyledTableCell><StatusChip status={row.accountstatus} /></StyledTableCell>
                                <StyledTableCell align="center">
                                    {row.verified ? <CheckCircle color="success" /> : <Cancel color="error" />}
                                </StyledTableCell>
                                <StyledTableCell align="right">
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                        <Tooltip title="View Details">
                                            <IconButton size="small" onClick={() => setDetailUser(row)} sx={{ color: '#F97316' }}><Info /></IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit Account">
                                            <IconButton size="small" onClick={() => setEditUser({...row})} sx={{ color: '#3b82f6' }}><Edit /></IconButton>
                                        </Tooltip>
                                        <Tooltip title={row.accountstatus === 'Suspended' ? "Active" : "Suspend Account"}>
                                            <IconButton size="small" onClick={() => setConfirmBan(row)} sx={{ color: '#ef4444' }}><Block /></IconButton>
                                        </Tooltip>
                                    </Box>
                                </StyledTableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50]}
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

            {/* User Detail Modal */}
            <Dialog open={!!detailUser} onClose={() => setDetailUser(null)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#F97316', color: 'white', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AccountCircle /> User Detailed Information
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} textColor="primary" indicatorColor="primary" variant="fullWidth">
                        <Tab label="Profile" icon={<AccountCircle />} iconPosition="start" />
                        <Tab label="License" icon={<VpnKey />} iconPosition="start" />
                        <Tab label="Bookings" icon={<DirectionsCar />} iconPosition="start" />
                        <Tab label="Activity" icon={<Assessment />} iconPosition="start" />
                    </Tabs>
                    <Box sx={{ p: 3 }}>
                        {userDetailsQuery.isLoading ? (
                            <Typography align="center">Loading details...</Typography>
                        ) : detailUser && (
                            <>
                                {tabValue === 0 && (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                                            <Avatar src={detailUser.photo} sx={{ width: 120, height: 120, mx: 'auto', mb: 2, border: '4px solid #F97316' }} />
                                            <StatusChip status={detailUser.accountstatus} />
                                        </Grid>
                                        <Grid item xs={12} md={8}>
                                            <Typography variant="h6" gutterBottom>{detailUser.name}</Typography>
                                            <Typography variant="body2" color="textSecondary">Email: {detailUser.email}</Typography>
                                            <Typography variant="body2" color="textSecondary">Phone: {detailUser.phone}</Typography>
                                            <Typography variant="body2" color="textSecondary">Gender: {detailUser.gender || 'N/A'}</Typography>
                                            <Typography variant="body2" color="textSecondary">DOB: {moment(detailUser.dob).format('LL')}</Typography>
                                            <Typography variant="body2" color="textSecondary">NID: {detailUser.nid || 'N/A'}</Typography>
                                            <Divider sx={{ my: 1.5 }} />
                                            <Typography variant="body2">Address: {detailUser.address || 'N/A'}</Typography>
                                        </Grid>
                                    </Grid>
                                )}
                                {tabValue === 1 && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom>Driver License Info</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}><Typography variant="body2" color="textSecondary">License No:</Typography><Typography variant="body1">{detailUser.license_number || 'N/A'}</Typography></Grid>
                                            <Grid item xs={6}><Typography variant="body2" color="textSecondary">Status:</Typography><Chip label={detailUser.license_status || 'N/A'} size="small" /></Grid>
                                            <Grid item xs={6}><Typography variant="body2" color="textSecondary">Expiry Date:</Typography><Typography variant="body1">{detailUser.expire_date ? moment(detailUser.expire_date).format('LL') : 'N/A'}</Typography></Grid>
                                            <Grid item xs={6}><Typography variant="body2" color="textSecondary">Experience:</Typography><Typography variant="body1">{detailUser.experience ? `${detailUser.experience} Years` : 'N/A'}</Typography></Grid>
                                        </Grid>
                                    </Box>
                                )}
                                {tabValue === 2 && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom>Recent Bookings</Typography>
                                        <Table size="small">
                                            <TableHead><TableRow><TableCell>Vehicle</TableCell><TableCell>Date</TableCell><TableCell>Total</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                                            <TableBody>
                                                {userDetailsQuery.data?.bookings.map((b) => (
                                                    <TableRow key={b.booking_id}>
                                                        <TableCell>{b.brand} {b.model}</TableCell>
                                                        <TableCell>{moment(b.booking_ts).format('MMM DD')}</TableCell>
                                                        <TableCell>৳{b.total_cost}</TableCell>
                                                        <TableCell><StatusChip status={b.status} /></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                )}
                                {tabValue === 3 && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={4} sx={{ textAlign: 'center' }}><Typography variant="h4" color="primary">{userDetailsQuery.data?.activity.total_bookings}</Typography><Typography variant="body2">Total Bookings</Typography></Grid>
                                        <Grid item xs={4} sx={{ textAlign: 'center' }}><Typography variant="h4" color="error">{userDetailsQuery.data?.activity.cancellation_count}</Typography><Typography variant="body2">Cancellations</Typography></Grid>
                                        <Grid item xs={4} sx={{ textAlign: 'center' }}><Typography variant="h4" color="warning.main">{userDetailsQuery.data?.activity.damage_reports_count}</Typography><Typography variant="body2">Damage Reports</Typography></Grid>
                                    </Grid>
                                )}
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions><Button onClick={() => setDetailUser(null)}>Close</Button></DialogActions>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
                <DialogTitle>Edit User Account: {editUser?.name}</DialogTitle>
                <DialogContent sx={{ minWidth: 350, pt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <FormControl fullWidth>
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
                        <FormControl fullWidth>
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
                        <FormControlLabel
                            control={<Switch checked={!!editUser?.verified} onChange={(e) => setEditUser({...editUser, verified: e.target.checked})} />}
                            label="Verified Account"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditUser(null)}>Cancel</Button>
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
            <Dialog open={!!confirmBan} onClose={() => setConfirmBan(null)}>
                <DialogTitle>Confirm Status Change</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to {confirmBan?.accountstatus === 'Suspended' ? 'Active' : 'Suspend'} <strong>{confirmBan?.name}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmBan(null)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="error"
                        onClick={() => handleQuickSuspend(confirmBan)}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Users;