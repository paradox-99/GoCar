import React, { useState, useMemo, useEffect } from 'react';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TablePagination,
    IconButton, Chip, Typography, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Grid, Card, CardContent,
    Alert, AlertTitle, Avatar, Divider, tableCellClasses, Stack, Collapse,
    LinearProgress, Checkbox, ToggleButton, ToggleButtonGroup, Badge as MuiBadge,
    Autocomplete, CircularProgress
} from '@mui/material';
import {
    Delete, Search, Download, Person, Groups, Campaign, Close, Analytics, 
    Visibility, TrendingUp, TrendingDown, EmojiFlags, CheckCircle, Info,
    Send, History, Warning, ContentCopy, DoneAll, Message, FilterList,
    Verified, PersonAdd, GroupAdd, Public
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

const StatusBadge = ({ isRead }) => (
    <Chip 
        label={isRead ? "Read" : "Unread"} 
        size="small"
        icon={isRead ? <DoneAll sx={{ fontSize: '14px !important' }} /> : undefined}
        sx={{ 
            bgcolor: isRead ? '#ecfdf5' : 'transparent',
            color: isRead ? '#10b981' : '#ef4444',
            border: isRead ? 'none' : '1px solid #ef4444',
            fontWeight: 'bold',
            fontSize: '11px',
            '& .MuiChip-icon': { color: 'inherit' }
        }} 
    />
);

const AdminNotifications = () => {
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(0); // 0: History, 1: Send
    
    // History State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');
    const [accountFilter, setAccountFilter] = useState('All');
    const [quickFilter, setQuickFilter] = useState('All');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedNotifs, setSelectedNotifs] = useState([]);
    
    // Send State
    const [sendType, setSendType] = useState('individual'); // individual, group, broadcast
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [groupFilters, setGroupFilters] = useState({
        role: 'All',
        status: 'All',
        verified: 'All',
        license: 'All'
    });
    const [excludeSuspended, setExcludeSuspended] = useState(true);
    const [message, setMessage] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);
    
    // UI States
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

    // Queries
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-notification-stats'],
        queryFn: async () => {
            const res = await axiosPublic.get('notificationRoutes/admin/stats');
            return res.data;
        }
    });

    const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
        queryKey: ['admin-notifications', page, rowsPerPage, search, statusFilter, roleFilter, accountFilter, quickFilter, dateRange],
        queryFn: async () => {
            const params = {
                page: page + 1,
                limit: rowsPerPage,
                search,
                status: statusFilter,
                role: roleFilter,
                accountStatus: accountFilter,
                quickFilter,
                ...dateRange
            };
            const res = await axiosPublic.get('notificationRoutes/admin/list', { params });
            return res.data;
        }
    });

    const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
        queryKey: ['admin-notification-analytics'],
        queryFn: async () => {
            const res = await axiosPublic.get('notificationRoutes/admin/analytics');
            return res.data;
        },
        enabled: showAnalytics
    });

    const { data: userSearchResults, isLoading: userSearchLoading } = useQuery({
        queryKey: ['admin-search-recipients', userSearchQuery],
        queryFn: async () => {
            if (!userSearchQuery) return [];
            const res = await axiosPublic.get(`notificationRoutes/admin/search-recipients?query=${userSearchQuery}`);
            return res.data;
        },
        enabled: userSearchQuery.length > 2
    });

    // Mutations
    const sendMutation = useMutation({
        mutationFn: async (payload) => {
            return await axiosPublic.post('notificationRoutes/admin/send', payload);
        },
        onSuccess: (res) => {
            toast.success(res.data.message);
            queryClient.invalidateQueries(['admin-notifications']);
            queryClient.invalidateQueries(['admin-notification-stats']);
            resetSendForm();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to send notification')
    });

    const deleteMutation = useMutation({
        mutationFn: async (ids) => {
            return await axiosPublic.post('notificationRoutes/admin/delete-bulk', { notificationIds: ids });
        },
        onSuccess: () => {
            toast.success('Notifications deleted successfully');
            queryClient.invalidateQueries(['admin-notifications']);
            queryClient.invalidateQueries(['admin-notification-stats']);
            setSelectedNotifs([]);
            setIsDeleteOpen(false);
            setIsBulkDeleteOpen(false);
        }
    });

    const resetSendForm = () => {
        setSendType('individual');
        setSelectedUser(null);
        setGroupFilters({ role: 'All', status: 'All', verified: 'All', license: 'All' });
        setMessage('');
        setShowTemplates(false);
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedNotifs(notificationsData?.notifications.map(n => n.notif_id) || []);
        } else {
            setSelectedNotifs([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedNotifs(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleExportCSV = () => {
        if (!notificationsData?.notifications) return;
        const headers = ["ID", "Recipient", "Email", "Message", "Status", "Sent At"];
        const rows = notificationsData.notifications.map(n => [
            n.notif_id,
            `"${n.user_name || 'Broadcast'}"`,
            n.user_email || 'N/A',
            `"${n.message.replace(/"/g, '""')}"`,
            n.is_read ? 'Read' : 'Unread',
            moment(n.created_at).format('YYYY-MM-DD HH:mm:ss')
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notifications_export_${moment().format('YYYY-MM-DD')}.csv`;
        a.click();
    };

    const templates = [
        { title: "🎉 Welcome Message", text: "Welcome to goCar, {user_name}! Start exploring vehicles near you." },
        { title: "⚠️ License Expiry Warning", text: "Your driving license is expiring soon. Please update your license details." },
        { title: "✅ Booking Confirmed", text: "Your booking has been confirmed. Check your bookings for details." },
        { title: "❌ Booking Cancelled", text: "Your booking has been cancelled. Contact support if you have questions." },
        { title: "💳 Payment Reminder", text: "You have a pending payment for your booking. Please complete the payment." },
        { title: "🔧 Account Suspended", text: "Your account has been suspended. Contact support for assistance." },
        { title: "⭐ Review Reminder", text: "How was your recent experience with goCar? Leave a review to help others." },
    ];

    const quickFilterPills = [
        { label: "All", value: 'All' },
        { label: "Unread Only", value: 'Unread Only' },
        { label: "Read Only", value: 'Read Only' },
        { label: "Sent Today", value: 'Sent Today' },
        { label: "Sent This Week", value: 'Sent This Week' },
        { label: "Sent This Month", value: 'Sent This Month' },
        { label: "Broadcast", value: 'Broadcast' },
        { label: "Individual", value: 'Individual' },
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', mx: 'auto' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>Notifications Management</Typography>
                <Button 
                    variant="outlined" 
                    startIcon={<Analytics />} 
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    sx={{ borderColor: '#F97316', color: '#F97316', '&:hover': { borderColor: '#ea580c', bgcolor: '#fff7ed' } }}
                >
                    {showAnalytics ? "Hide Analytics" : "Show Analytics"}
                </Button>
            </Stack>

            {/* Unread Alert Banner */}
            {stats?.unreadRate > 50 && (
                <Alert 
                    severity="warning" 
                    sx={{ mb: 3, borderRadius: 2, border: '1px solid #fde68a' }} 
                    onClose={() => {}}
                >
                    <AlertTitle sx={{ fontWeight: 'bold' }}>Low Read Rate Alert</AlertTitle>
                    <strong>{stats.unreadRate}%</strong> of notifications are unread. Users may not be receiving or opening notifications.
                </Alert>
            )}

            {/* Stat Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Sent', value: stats?.totalSent || 0, color: '#F97316', icon: <Campaign /> },
                    { label: 'Read', value: stats?.readCount || 0, sub: `${stats?.readRate || 0}% read rate`, color: '#10b981', icon: <DoneAll /> },
                    { label: 'Unread', value: stats?.unreadCount || 0, sub: `${stats?.unreadRate || 0}% unread rate`, color: '#ef4444', icon: <Info /> },
                    { label: 'Sent Today', value: stats?.sentToday || 0, color: '#3b82f6', icon: <History /> },
                    { label: 'Total Recipients', value: stats?.totalRecipients || 0, color: '#8b5cf6', icon: <Person /> },
                ].map((s, i) => (
                    <Grid item xs={12} sm={6} md={2.4} key={i}>
                        <Card 
                            sx={{ 
                                cursor: 'pointer', 
                                transition: '0.2s', 
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
                                borderLeft: `4px solid ${s.color}`
                            }}
                            onClick={() => {
                                setActiveTab(0);
                                if (s.label === 'Unread') setQuickFilter('Unread Only');
                                if (s.label === 'Read') setQuickFilter('Read Only');
                                if (s.label === 'Sent Today') setQuickFilter('Sent Today');
                            }}
                        >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold">{s.label}</Typography>
                                    <Box sx={{ color: s.color, opacity: 0.8 }}>{s.icon}</Box>
                                </Stack>
                                <Typography variant="h5" fontWeight="bold" sx={{ color: s.color, mt: 1 }}>{s.value}</Typography>
                                {s.sub && <Typography variant="caption" sx={{ color: s.color, opacity: 0.8, display: 'block', mt: 0.5 }}>{s.sub}</Typography>}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} TabIndicatorProps={{ style: { backgroundColor: '#F97316' } }}>
                    <Tab label="📋 Notification History" sx={{ fontWeight: 'bold', '&.Mui-selected': { color: '#F97316' } }} />
                    <Tab label="📤 Send Notification" sx={{ fontWeight: 'bold', '&.Mui-selected': { color: '#F97316' } }} />
                </Tabs>
            </Box>

            {/* Analytics Panel */}
            <Collapse in={showAnalytics}>
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Notification Analytics</Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="subtitle2" gutterBottom color="textSecondary">Notifications Sent per Day (Last 30 Days)</Typography>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsData?.sentTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="day" tickFormatter={(v) => moment(v).format('MMM DD')} />
                                        <YAxis />
                                        <ChartTooltip />
                                        <Bar dataKey="count" fill="#F97316" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom color="textSecondary">Read vs Unread Ratio</Typography>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analyticsData?.readStatus}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {analyticsData?.readStatus?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.name === 'Read' ? '#10b981' : '#ef4444'} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom color="textSecondary">Read Rate Trend (Last 12 Months)</Typography>
                            <Box sx={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analyticsData?.readRateTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis domain={[0, 100]} unit="%" />
                                        <ChartTooltip />
                                        <Line type="monotone" dataKey="rate" stroke="#F97316" strokeWidth={3} dot={{ r: 6, fill: '#F97316' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom color="textSecondary">Top 5 Most Notified Users</Typography>
                            <Stack spacing={2}>
                                {analyticsData?.topUsers?.map((u, i) => (
                                    <Box key={i} sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ bgcolor: '#F97316', width: 32, height: 32, fontSize: 14 }}>{u.name.charAt(0)}</Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">{u.name}</Typography>
                                                <Typography variant="caption" color="textSecondary">{u.total} notifications</Typography>
                                            </Box>
                                        </Stack>
                                        <Chip label={`${u.readRate}% Read`} size="small" sx={{ bgcolor: u.readRate > 50 ? '#ecfdf5' : '#fef2f2', color: u.readRate > 50 ? '#10b981' : '#ef4444' }} />
                                    </Box>
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>
                </Paper>
            </Collapse>

            {/* Content Tabs */}
            {activeTab === 0 ? (
                /* HISTORY TAB */
                <Box>
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <TextField 
                                    fullWidth size="small" 
                                    placeholder="Search message, recipient..." 
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
                                        <MenuItem value="Read">Read</MenuItem>
                                        <MenuItem value="Unread">Unread</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Role</InputLabel>
                                    <Select value={roleFilter} label="Role" onChange={e => setRoleFilter(e.target.value)}>
                                        <MenuItem value="All">All Roles</MenuItem>
                                        <MenuItem value="Customer">Customer</MenuItem>
                                        <MenuItem value="Agency Owner">Agency Owner</MenuItem>
                                        <MenuItem value="Admin">Admin</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Account</InputLabel>
                                    <Select value={accountFilter} label="Account" onChange={e => setAccountFilter(e.target.value)}>
                                        <MenuItem value="All">All Status</MenuItem>
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Suspended">Suspended</MenuItem>
                                        <MenuItem value="Banned">Banned</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3} sx={{ textAlign: 'right' }}>
                                <Button variant="contained" startIcon={<Download />} onClick={handleExportCSV} sx={{ bgcolor: '#F97316', '&:hover': { bgcolor: '#ea580c' }, textTransform: 'none', borderRadius: 2 }}>Export CSV</Button>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
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
                                                color: quickFilter === pill.value ? '#fff' : 'inherit',
                                                borderColor: quickFilter === pill.value ? '#F97316' : '#ddd',
                                                border: '1px solid',
                                                '&:hover': { bgcolor: quickFilter === pill.value ? '#ea580c' : '#f8fafc' }
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
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
                        </Grid>
                    </Paper>

                    {/* Bulk Action Bar */}
                    {selectedNotifs.length > 0 && (
                        <Paper sx={{ p: 2, mb: 3, bgcolor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight="bold" color="#ef4444">
                                {selectedNotifs.length} notifications selected
                            </Typography>
                            <Stack direction="row" spacing={2}>
                                <Button size="small" variant="contained" color="error" startIcon={<Delete />} onClick={() => setIsBulkDeleteOpen(true)}>Delete Selected</Button>
                                <Button size="small" variant="outlined" color="inherit" onClick={() => setSelectedNotifs([])}>Deselect All</Button>
                            </Stack>
                        </Paper>
                    )}

                    {/* History Table */}
                    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 25px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell padding="checkbox">
                                        <Checkbox 
                                            indeterminate={selectedNotifs.length > 0 && selectedNotifs.length < (notificationsData?.notifications.length || 0)}
                                            checked={selectedNotifs.length > 0 && selectedNotifs.length === (notificationsData?.notifications.length || 0)}
                                            onChange={handleSelectAll}
                                            sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>ID</StyledTableCell>
                                    <StyledTableCell>Recipient</StyledTableCell>
                                    <StyledTableCell sx={{ width: '40%' }}>Message</StyledTableCell>
                                    <StyledTableCell>Sent At</StyledTableCell>
                                    <StyledTableCell>Status</StyledTableCell>
                                    <StyledTableCell align="right">Action</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {notificationsLoading ? (
                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 10 }}><LinearProgress sx={{ width: '200px', mx: 'auto', mb: 2 }} /><Typography>Loading notifications...</Typography></TableCell></TableRow>
                                ) : notificationsData?.notifications.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 10 }}>No notifications found matching filters.</TableCell></TableRow>
                                ) : notificationsData?.notifications.map((row) => (
                                    <TableRow 
                                        key={row.notif_id} 
                                        hover
                                        sx={{ 
                                            borderLeft: `5px solid ${!row.is_read ? '#f59e0b' : row.category === 'broadcast' ? '#3b82f6' : 'transparent'}`,
                                            bgcolor: !row.is_read ? '#fffbeb' : 'inherit'
                                        }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox 
                                                checked={selectedNotifs.includes(row.notif_id)}
                                                onChange={() => handleSelectOne(row.notif_id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={`Click to copy: ${row.notif_id}`}>
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ cursor: 'pointer', fontFamily: 'monospace', color: '#64748b' }}
                                                    onClick={() => { navigator.clipboard.writeText(row.notif_id); toast.success('ID Copied'); }}
                                                >
                                                    {row.notif_id.substring(0, 8)}...
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            {row.category === 'broadcast' ? (
                                                <Chip label="📢 Broadcast" size="small" sx={{ bgcolor: '#eff6ff', color: '#3b82f6', fontWeight: 'bold' }} />
                                            ) : (
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar src={row.user_photo} sx={{ width: 32, height: 32 }} />
                                                    <Box>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <Typography variant="body2" fontWeight="bold">{row.user_name}</Typography>
                                                            {(row.accountstatus === 'Suspended' || row.accountstatus === 'Banned') && <Warning sx={{ fontSize: 14, color: '#ef4444' }} />}
                                                        </Stack>
                                                        <Typography variant="caption" color="textSecondary" display="block">{row.user_email}</Typography>
                                                        <Chip 
                                                            label={row.userrole} 
                                                            size="small" 
                                                            sx={{ 
                                                                height: 16, fontSize: '9px', mt: 0.5,
                                                                bgcolor: row.userrole === 'Admin' ? '#fef2f2' : row.userrole === 'Agency Owner' ? '#f5f3ff' : '#ecfdf5',
                                                                color: row.userrole === 'Admin' ? '#ef4444' : row.userrole === 'Agency Owner' ? '#8b5cf6' : '#10b981'
                                                            }} 
                                                        />
                                                    </Box>
                                                </Stack>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                                <Message sx={{ fontSize: 16, color: '#94a3b8', mt: 0.3 }} />
                                                <Typography variant="body2" sx={{ color: '#334155' }}>
                                                    {row.message.length > 80 ? `${row.message.substring(0, 80)}...` : row.message}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color="textSecondary" display="block">
                                                {moment(row.created_at).calendar(null, {
                                                    sameDay: '[Today, ] h:mm A',
                                                    lastDay: '[Yesterday, ] h:mm A',
                                                    lastWeek: 'MMM DD, h:mm A',
                                                    sameElse: 'MMM DD, YYYY h:mm A'
                                                })}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge isRead={row.is_read} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                                <Tooltip title="View Details">
                                                    <IconButton size="small" onClick={() => { setSelectedNotif(row); setIsDetailOpen(true); }} sx={{ color: '#F97316' }}>
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" onClick={() => { setSelectedNotif(row); setIsDeleteOpen(true); }} sx={{ color: '#ef4444' }}>
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
                                Showing {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, notificationsData?.total || 0)} of {notificationsData?.total || 0} notifications
                                {notificationsData?.notifications.length > 0 && (
                                    <Box component="span" sx={{ ml: 2 }}>
                                        · ✓ {notificationsData.notifications.filter(n => n.is_read).length} Read · {notificationsData.notifications.filter(n => !n.is_read).length} Unread
                                    </Box>
                                )}
                            </Typography>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50]}
                                component="div"
                                count={notificationsData?.total || 0}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={(e, v) => setPage(v)}
                                onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            />
                        </Box>
                    </TableContainer>
                </Box>
            ) : (
                /* SEND NOTIFICATION TAB */
                <Grid container spacing={4}>
                    <Grid item xs={12} md={7}>
                        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            {/* Section 1: Recipient Selection */}
                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <GroupAdd sx={{ color: '#F97316' }} /> Section 1: Recipient Selection
                            </Typography>
                            <Box sx={{ mb: 4, mt: 2 }}>
                                <ToggleButtonGroup
                                    value={sendType}
                                    exclusive
                                    onChange={(e, val) => val && setSendType(val)}
                                    fullWidth
                                    sx={{ 
                                        '& .MuiToggleButton-root': { 
                                            borderRadius: '12px', 
                                            textTransform: 'none', 
                                            fontWeight: 'bold',
                                            m: 0.5,
                                            border: '1px solid #e2e8f0 !important'
                                        },
                                        '& .Mui-selected': { 
                                            bgcolor: '#fff7ed !important', 
                                            color: '#F97316 !important', 
                                            borderColor: '#F97316 !important' 
                                        }
                                    }}
                                >
                                    <ToggleButton value="individual"><Person sx={{ mr: 1 }} /> Individual User</ToggleButton>
                                    <ToggleButton value="group"><Groups sx={{ mr: 1 }} /> User Group</ToggleButton>
                                    <ToggleButton value="broadcast"><Campaign sx={{ mr: 1 }} /> Broadcast</ToggleButton>
                                </ToggleButtonGroup>

                                {sendType === 'individual' && (
                                    <Box sx={{ mt: 3 }}>
                                        <Autocomplete
                                            fullWidth
                                            options={userSearchResults || []}
                                            getOptionLabel={(option) => `${option.name} (${option.email})`}
                                            onInputChange={(e, val) => setUserSearchQuery(val)}
                                            onChange={(e, val) => setSelectedUser(val)}
                                            loading={userSearchLoading}
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params} 
                                                    label="Search Individual User" 
                                                    placeholder="Name, email, or phone..."
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
                                                        endAdornment: (
                                                            <React.Fragment>
                                                                {userSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                                {params.InputProps.endAdornment}
                                                            </React.Fragment>
                                                        ),
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <Box component="li" {...props} sx={{ p: 1 }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar src={option.photo} sx={{ width: 40, height: 40 }} />
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold">{option.name}</Typography>
                                                            <Typography variant="caption" color="textSecondary">{option.email} · {option.phone}</Typography>
                                                            <Stack direction="row" spacing={1} mt={0.5}>
                                                                <Chip label={option.userrole} size="small" sx={{ height: 16, fontSize: '9px' }} />
                                                                <Chip label={option.accountstatus} size="small" color={option.accountstatus === 'Active' ? 'success' : 'error'} sx={{ height: 16, fontSize: '9px' }} />
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            )}
                                        />
                                        {selectedUser && (
                                            <Card variant="outlined" sx={{ mt: 2, borderRadius: 2, bgcolor: '#f8fafc' }}>
                                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar src={selectedUser.photo} sx={{ width: 60, height: 60, border: '2px solid #fff' }} />
                                                        <Box flex={1}>
                                                            <Typography variant="subtitle1" fontWeight="bold">{selectedUser.name}</Typography>
                                                            <Typography variant="body2" color="textSecondary">{selectedUser.email}</Typography>
                                                            <Typography variant="caption" color="textSecondary">{selectedUser.phone}</Typography>
                                                        </Box>
                                                        <Stack spacing={1}>
                                                            <Chip label={selectedUser.userrole} size="small" color="primary" variant="outlined" />
                                                            <Chip label={selectedUser.accountstatus} size="small" color="success" />
                                                        </Stack>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </Box>
                                )}

                                {sendType === 'group' && (
                                    <Box sx={{ mt: 3 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Filter by Role</InputLabel>
                                                    <Select value={groupFilters.role} label="Filter by Role" onChange={e => setGroupFilters({...groupFilters, role: e.target.value})}>
                                                        <MenuItem value="All">All Roles</MenuItem>
                                                        <MenuItem value="Customer">Customer</MenuItem>
                                                        <MenuItem value="Agency Owner">Agency Owner</MenuItem>
                                                        <MenuItem value="Admin">Admin</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Account Status</InputLabel>
                                                    <Select value={groupFilters.status} label="Account Status" onChange={e => setGroupFilters({...groupFilters, status: e.target.value})}>
                                                        <MenuItem value="All">All Status</MenuItem>
                                                        <MenuItem value="Active">Active</MenuItem>
                                                        <MenuItem value="Suspended">Suspended</MenuItem>
                                                        <MenuItem value="Banned">Banned</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Verified Status</InputLabel>
                                                    <Select value={groupFilters.verified} label="Verified Status" onChange={e => setGroupFilters({...groupFilters, verified: e.target.value})}>
                                                        <MenuItem value="All">All</MenuItem>
                                                        <MenuItem value="Verified">Verified Only</MenuItem>
                                                        <MenuItem value="Unverified">Unverified Only</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>License Status</InputLabel>
                                                    <Select value={groupFilters.license} label="License Status" onChange={e => setGroupFilters({...groupFilters, license: e.target.value})}>
                                                        <MenuItem value="All">All</MenuItem>
                                                        <MenuItem value="Verified">Valid</MenuItem>
                                                        <MenuItem value="Pending">Pending</MenuItem>
                                                        <MenuItem value="Expired">Expired</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                                            Group filters will match users based on selected criteria. 
                                            Preview count will be shown before sending.
                                        </Alert>
                                    </Box>
                                )}

                                {sendType === 'broadcast' && (
                                    <Box sx={{ mt: 3 }}>
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fffbeb', borderColor: '#fef3c7', borderRadius: 2 }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Campaign sx={{ color: '#f59e0b', fontSize: 40 }} />
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold" color="#92400e">📢 Broadcast Warning</Typography>
                                                    <Typography variant="caption" color="#b45309">
                                                        This notification will be sent to <strong>ALL</strong> active users. 
                                                        Please review your message carefully before sending.
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                        <Stack direction="row" alignItems="center" sx={{ mt: 2 }}>
                                            <Checkbox checked={excludeSuspended} onChange={e => setExcludeSuspended(e.target.checked)} />
                                            <Typography variant="body2">Exclude suspended/banned users (Recommended)</Typography>
                                        </Stack>
                                    </Box>
                                )}
                            </Box>

                            <Divider sx={{ my: 4 }} />

                            {/* Section 2: Message Composition */}
                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Message sx={{ color: '#F97316' }} /> Section 2: Message Composition
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    placeholder="Write your notification message here..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value.substring(0, 500))}
                                    helperText={`${message.length} / 500 characters`}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                                
                                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                    <Chip 
                                        label="{user_name}" 
                                        size="small" 
                                        onClick={() => setMessage(prev => prev + '{user_name}')}
                                        sx={{ cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' }} 
                                    />
                                    <Chip 
                                        label="{booking_id}" 
                                        size="small" 
                                        onClick={() => setMessage(prev => prev + '{booking_id}')}
                                        sx={{ cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' }} 
                                    />
                                </Stack>

                                <Button 
                                    variant="text" 
                                    startIcon={showTemplates ? <Close /> : <FilterList />} 
                                    onClick={() => setShowTemplates(!showTemplates)}
                                    sx={{ mt: 2, textTransform: 'none', color: '#F97316' }}
                                >
                                    {showTemplates ? "Hide Templates" : "Use a Template"}
                                </Button>

                                <Collapse in={showTemplates}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1.5, mt: 1 }}>
                                        {templates.map((t, i) => (
                                            <Paper 
                                                key={i} 
                                                variant="outlined" 
                                                sx={{ 
                                                    p: 1.5, 
                                                    cursor: 'pointer', 
                                                    borderRadius: 2,
                                                    transition: '0.2s',
                                                    '&:hover': { bgcolor: '#fff7ed', borderColor: '#F97316' }
                                                }}
                                                onClick={() => { setMessage(t.text); setShowTemplates(false); }}
                                            >
                                                <Typography variant="caption" fontWeight="bold" display="block" color="#F97316">{t.title}</Typography>
                                                <Typography variant="caption" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.text}</Typography>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Collapse>
                            </Box>

                            <Box sx={{ mt: 6 }}>
                                <Button 
                                    variant="contained" 
                                    fullWidth 
                                    size="large" 
                                    startIcon={sendMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                    disabled={
                                        (sendType === 'individual' && !selectedUser) ||
                                        message.length === 0 ||
                                        sendMutation.isPending
                                    }
                                    onClick={() => sendMutation.mutate({
                                        type: sendType,
                                        recipientId: selectedUser?.user_id,
                                        filters: groupFilters,
                                        message,
                                        excludeSuspended
                                    })}
                                    sx={{ 
                                        bgcolor: '#F97316', 
                                        height: 56,
                                        borderRadius: 3,
                                        fontWeight: 'bold',
                                        fontSize: 16,
                                        '&:hover': { bgcolor: '#ea580c' } 
                                    }}
                                >
                                    {sendMutation.isPending ? "Sending..." : "Send Notification"}
                                </Button>
                                <Typography variant="caption" align="center" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                                    {sendType === 'individual' ? `Sending to: ${selectedUser?.name || 'Selection required'}` :
                                     sendType === 'group' ? 'Sending to group matching filters' :
                                     `Sending to ALL ${excludeSuspended ? 'active' : ''} users`}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* LIVE PREVIEW */}
                    <Grid item xs={12} md={5}>
                        <Box sx={{ position: 'sticky', top: 100 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="textSecondary">Live Message Preview</Typography>
                            <Paper 
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 4, 
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                    border: '1px solid #e2e8f0',
                                    minHeight: 200,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Stack direction="row" spacing={2} mb={2}>
                                    <Avatar sx={{ bgcolor: '#F97316' }}>G</Avatar>
                                    <Box flex={1}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="subtitle2" fontWeight="bold">goCar Admin</Typography>
                                            <Typography variant="caption" color="textSecondary">Just now</Typography>
                                        </Stack>
                                        <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap', color: '#334155' }}>
                                            {message.replace(/{user_name}/g, selectedUser?.name || 'User') || "Message preview will appear here..."}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F97316' }} />
                                </Stack>
                                <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #e2e8f0' }}>
                                    <Typography variant="caption" color="textSecondary">
                                        Note: {`{user_name}`} will be replaced with recipient's actual name.
                                    </Typography>
                                </Box>
                            </Paper>

                            <Card variant="outlined" sx={{ mt: 3, borderRadius: 3, bgcolor: '#f1f5f9' }}>
                                <CardContent>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Recipient Summary</Typography>
                                    <Stack spacing={1.5}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption">Recipient Type:</Typography>
                                            <Chip label={sendType.toUpperCase()} size="small" sx={{ fontWeight: 'bold' }} />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption">Category:</Typography>
                                            <Typography variant="caption" fontWeight="bold">Notification</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption">Delivery Method:</Typography>
                                            <Typography variant="caption" fontWeight="bold">In-App Notification</Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>
                </Grid>
            )}

            {/* MODALS */}
            <NotificationDetailModal 
                open={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                notif={selectedNotif} 
                onDelete={() => { setIsDetailOpen(false); setIsDeleteOpen(true); }}
            />

            <DeleteConfirmationDialog 
                open={isDeleteOpen} 
                onClose={() => setIsDeleteOpen(false)} 
                notif={selectedNotif}
                onConfirm={() => deleteMutation.mutate([selectedNotif.notif_id])}
                isLoading={deleteMutation.isPending}
            />

            <Dialog open={isBulkDeleteOpen} onClose={() => setIsBulkDeleteOpen(false)}>
                <DialogTitle sx={{ color: '#ef4444', fontWeight: 'bold' }}>Bulk Delete Notifications</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete <strong>{selectedNotifs.length}</strong> notifications? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsBulkDeleteOpen(false)} color="inherit">Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="error" 
                        onClick={() => deleteMutation.mutate(selectedNotifs)}
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// --- Sub Components ---

const NotificationDetailModal = ({ open, onClose, notif, onDelete }) => {
    if (!notif) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F97316', color: 'white' }}>
                <Typography variant="h6">Notification Details</Typography>
                <IconButton onClick={onClose} sx={{ color: 'white' }}><Close /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Chip 
                            label={notif.category === 'broadcast' ? 'BROADCAST' : 'INDIVIDUAL'} 
                            size="small" 
                            sx={{ fontWeight: 'bold', bgcolor: notif.category === 'broadcast' ? '#eff6ff' : '#fff7ed', color: notif.category === 'broadcast' ? '#3b82f6' : '#F97316' }} 
                        />
                        <Typography variant="caption" color="textSecondary">{moment(notif.created_at).format('LLLL')}</Typography>
                    </Stack>
                    
                    <Typography variant="subtitle2" gutterBottom color="textSecondary">Message Content</Typography>
                    <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 3, position: 'relative' }}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{notif.message}</Typography>
                        <IconButton 
                            size="small" 
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                            onClick={() => { navigator.clipboard.writeText(notif.message); toast.success('Message Copied'); }}
                        >
                            <ContentCopy fontSize="inherit" />
                        </IconButton>
                    </Paper>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" gutterBottom color="textSecondary">Recipient Information</Typography>
                {notif.category === 'broadcast' ? (
                    <Alert severity="info">This was a broadcast notification sent to multiple users.</Alert>
                ) : (
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                        <Avatar src={notif.user_photo} sx={{ width: 64, height: 64, border: '3px solid #F97316' }} />
                        <Box flex={1}>
                            <Typography variant="h6" fontWeight="bold">{notif.user_name}</Typography>
                            <Typography variant="body2" color="textSecondary">{notif.user_email}</Typography>
                            <Stack direction="row" spacing={1} mt={1}>
                                <Chip label={notif.userrole} size="small" variant="outlined" />
                                <Chip label={notif.accountstatus} size="small" color={notif.accountstatus === 'Active' ? 'success' : 'error'} />
                                {notif.verified && <Chip icon={<Verified />} label="Verified" size="small" color="primary" />}
                            </Stack>
                        </Box>
                    </Box>
                )}

                <Box sx={{ mt: 4, p: 2, bgcolor: '#f9fafb', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Current Status:</Typography>
                    <StatusBadge isRead={notif.is_read} />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#f9fafb' }}>
                <Button variant="outlined" color="inherit" onClick={onClose}>Close</Button>
                <Button variant="contained" color="error" startIcon={<Delete />} onClick={onDelete}>Delete Notification</Button>
            </DialogActions>
        </Dialog>
    );
};

const DeleteConfirmationDialog = ({ open, onClose, notif, onConfirm, isLoading }) => {
    if (!notif) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ color: '#ef4444', fontWeight: 'bold' }}>Delete Notification?</DialogTitle>
            <DialogContent>
                <Typography variant="body2" mb={2}>Are you sure you want to delete this notification?</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight="bold" display="block">Recipient:</Typography>
                    <Typography variant="body2" mb={1}>{notif.user_name || 'Broadcast'}</Typography>
                    <Typography variant="caption" fontWeight="bold" display="block">Message Preview:</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        "{notif.message.substring(0, 60)}..."
                    </Typography>
                </Paper>
                <Alert severity="warning" sx={{ mt: 3 }}>
                    ⚠️ This will permanently remove this notification from the recipient's list.
                </Alert>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button 
                    variant="contained" 
                    color="error" 
                    onClick={onConfirm} 
                    disabled={isLoading}
                >
                    {isLoading ? "Deleting..." : "Confirm Delete"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AdminNotifications;
