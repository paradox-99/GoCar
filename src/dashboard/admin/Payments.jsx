import React, { useState, useMemo, useEffect } from 'react';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
    IconButton, Chip, Typography, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Grid, Card, CardContent,
    Alert, AlertTitle, Avatar, Collapse, Divider, tableCellClasses, Stack, Stepper, Step, StepLabel,
    Checkbox, FormControlLabel, Switch, CircularProgress
} from '@mui/material';
import {
    Info, Receipt, Search, Download, CheckCircle, DirectionsCar, TwoWheeler,
    Close, Warning, History, Payments as PaymentsIcon, Build, MyLocation, AccountCircle, Assignment, AccessTime,
    ContentCopy, Star, Person, Business, FileDownload, FilterList, AccessAlarms, FiberManualRecord,
    KeyboardArrowDown, KeyboardArrowUp, TrendingUp, PieChart as PieChartIcon, BarChart as BarChartIcon, Timeline
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import toast from 'react-hot-toast';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

const PaymentMethodBadge = ({ method }) => {
    let color = "default";
    let sx = { fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px' };
    const m = method?.toLowerCase();
    
    if (m === 'bkash') { sx.bgcolor = "#D12053"; sx.color = "white"; }
    else if (m === 'nagad') { sx.bgcolor = "#F97316"; sx.color = "white"; }
    else if (m === 'card') { sx.bgcolor = "#2563eb"; sx.color = "white"; }
    else if (m === 'cash') { sx.bgcolor = "#10b981"; sx.color = "white"; }
    
    return <Chip label={method} size="small" sx={sx} />;
};

const PaymentForBadge = ({ type }) => {
    let color = "default";
    const t = type?.toLowerCase();
    
    if (t.includes('initial')) color = "primary";
    else if (t.includes('final')) color = "success";
    else if (t.includes('late')) color = "error";
    else if (t.includes('fuel')) color = "warning";
    else if (t.includes('cleaning')) color = "secondary";
    else if (t.includes('driver')) color = "info";
    
    return <Chip label={type} size="small" color={color} variant="filled" sx={{ fontWeight: 'bold', fontSize: '10px' }} />;
};

const Payments = () => {
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    
    // Pagination & Filters
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [methodFilter, setMethodFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [vehicleFilter, setVehicleFilter] = useState('All');
    const [amountRange, setAmountRange] = useState('All');
    const [dateRange, setDateRange] = useState({ start_date: '', end_date: '' });
    
    // Quick Filters
    const [quickFilter, setQuickFilter] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    // Modals
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Queries
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-payment-stats'],
        queryFn: async () => {
            const res = await axiosPublic.get('paymentRoutes/admin/stats');
            return res.data;
        }
    });

    const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
        queryKey: ['admin-payments', page, rowsPerPage, search, methodFilter, typeFilter, vehicleFilter, amountRange, dateRange, quickFilter],
        queryFn: async () => {
            const params = {
                page,
                limit: rowsPerPage,
                search,
                method: methodFilter,
                payment_for: typeFilter,
                vehicle_type: vehicleFilter,
                amount_range: amountRange,
                ...dateRange,
                quick_filter: quickFilter
            };
            const res = await axiosPublic.get('paymentRoutes/admin/filtered', { params });
            return res.data;
        }
    });

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['admin-payment-analytics'],
        queryFn: async () => {
            const res = await axiosPublic.get('paymentRoutes/admin/analytics');
            return res.data;
        },
        enabled: showAnalytics
    });

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const generateReceipt = async (paymentId) => {
        try {
            const res = await axiosPublic.get(`paymentRoutes/admin/details/${paymentId}`);
            const data = res.data.payment;
            
            const doc = new jsPDF();
            
            // Header
            doc.setFillColor(249, 115, 22); // Orange #F97316
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text('goCar', 20, 25);
            doc.setFontSize(10);
            doc.text('PAYMENT RECEIPT', 160, 25);
            
            // Content
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Receipt No: ${data.payment_id}`, 20, 60);
            doc.setFont('helvetica', 'normal');
            doc.text(`Date: ${moment(data.date).format('LLL')}`, 20, 70);
            
            doc.line(20, 75, 190, 75);
            
            // Customer & Vehicle Info
            doc.setFont('helvetica', 'bold');
            doc.text('Customer Details:', 20, 90);
            doc.setFont('helvetica', 'normal');
            doc.text(`Name: ${data.user_name}`, 20, 100);
            doc.text(`Phone: ${data.user_phone}`, 20, 110);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Vehicle Details:', 120, 90);
            doc.setFont('helvetica', 'normal');
            doc.text(`Vehicle: ${data.brand} ${data.model}`, 120, 100);
            doc.text(`Agency: ${data.agency_name}`, 120, 110);
            
            // Payment Info
            const tableData = [
                ['Description', 'Details'],
                ['Payment For', data.payment_for.toUpperCase()],
                ['Booking ID', data.booking_id],
                ['Payment Method', data.method_type.toUpperCase()],
                ['Transaction ID', data.trx_id || 'CASH'],
                ['Total Amount', `BDT ${data.amount.toLocaleString()}`]
            ];
            
            doc.autoTable({
                startY: 130,
                head: [tableData[0]],
                body: tableData.slice(1),
                theme: 'striped',
                headStyles: { fillColor: [249, 115, 22] }
            });
            
            const finalY = doc.lastAutoTable.finalY || 180;
            
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(`TOTAL PAID: BDT ${data.amount.toLocaleString()}`, 120, finalY + 20);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text('Thank you for choosing goCar!', 20, finalY + 40);
            
            doc.save(`receipt_${data.payment_id}.pdf`);
            toast.success('Receipt generated successfully');
        } catch (err) {
            toast.error('Failed to generate receipt');
        }
    };

    const exportCSV = () => {
        if (!paymentsData?.payments) return;
        const headers = ["Payment ID", "Booking ID", "Customer", "Amount", "Method", "Type", "Trx ID", "Date"];
        const rows = paymentsData.payments.map(p => [
            p.payment_id, p.booking_id, p.user_name, p.amount, p.method_type, p.payment_for, p.trx_id || 'N/A', moment(p.date).format('YYYY-MM-DD HH:mm')
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'payment_history.csv'; a.click();
    };

    const quickFilterPills = [
        { label: "Today", value: 'Today' },
        { label: "Yesterday", value: 'Yesterday' },
        { label: "This Week", value: 'Week' },
        { label: "This Month", value: 'Month' },
        { label: "bKash Only", value: 'bKash' },
        { label: "Nagad Only", value: 'Nagad' },
        { label: "Cash Only", value: 'Cash' },
        { label: "Initial Payments", value: 'Initial' },
        { label: "Final Payments", value: 'Final' },
        { label: "Extra Charges", value: 'Extra' },
    ];

    const COLORS = ['#F97316', '#3b82f6', '#10b981', '#ef4444', '#a855f7', '#f59e0b', '#06b6d4'];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', mx: 'auto' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>Payment History</Typography>
                <Button 
                    startIcon={showAnalytics ? <KeyboardArrowUp /> : <KeyboardArrowDown />} 
                    variant="outlined" 
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    sx={{ color: '#F97316', borderColor: '#F97316', '&:hover': { borderColor: '#ea580c', bgcolor: '#fff7ed' } }}
                >
                    {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                </Button>
            </Stack>

            {/* Pending Payment Alerts */}
            <Stack spacing={1} sx={{ mb: 3 }}>
                {stats?.pending_final > 0 && (
                    <Alert severity="warning" sx={{ borderRadius: 2 }} icon={<AccessAlarms />}>
                        <AlertTitle sx={{ fontWeight: 'bold' }}>Pending Final Payments</AlertTitle>
                        {stats.pending_final} completed bookings have unpaid final payments. 
                        <Button size="small" sx={{ ml: 2, fontWeight: 'bold' }} onClick={() => setQuickFilter('PendingFinal')}>Review Now →</Button>
                    </Alert>
                )}
                {stats?.pending_initial > 0 && (
                    <Alert severity="error" sx={{ borderRadius: 2 }} icon={<Warning />}>
                        <AlertTitle sx={{ fontWeight: 'bold' }}>Unpaid Initial Bookings</AlertTitle>
                        {stats.pending_initial} bookings have not received initial payment.
                        <Button size="small" sx={{ ml: 2, fontWeight: 'bold' }} onClick={() => setQuickFilter('PendingInitial')}>Review Now →</Button>
                    </Alert>
                )}
            </Stack>

            {/* Analytics Panel */}
            <Collapse in={showAnalytics}>
                <Paper sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: '#fdfcfb' }}>
                    {analyticsLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress color="warning" /></Box> : (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Card variant="outlined" sx={{ height: '350px' }}>
                                    <CardContent>
                                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">Daily Revenue (Last 30 Days)</Typography>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <AreaChart data={analytics?.dailyRevenue}>
                                                <defs>
                                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="day" tickFormatter={(v) => moment(v).format('DD MMM')} />
                                                <YAxis />
                                                <RechartsTooltip formatter={(v) => `৳${v.toLocaleString()}`} />
                                                <Area type="monotone" dataKey="revenue" stroke="#F97316" fillOpacity={1} fill="url(#colorRev)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card variant="outlined" sx={{ height: '350px' }}>
                                    <CardContent>
                                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">Method Breakdown</Typography>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <PieChart>
                                                <Pie
                                                    data={analytics?.methodBreakdown}
                                                    dataKey="revenue"
                                                    nameKey="method_type"
                                                    cx="50%" cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                >
                                                    {analytics?.methodBreakdown?.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip formatter={(v) => `৳${v.toLocaleString()}`} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                            {/* More charts can be added here */}
                        </Grid>
                    )}
                </Paper>
            </Collapse>

            {/* Stat Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Revenue', value: `৳${stats?.total_revenue?.toLocaleString() || 0}`, color: '#10b981', filter: null },
                    { label: "Today's Collection", value: `৳${stats?.today_collection?.toLocaleString() || 0}`, color: '#10b981', filter: 'Today' },
                    { label: 'This Month', value: `৳${stats?.this_month_collection?.toLocaleString() || 0}`, color: '#3b82f6', filter: 'Month' },
                    { label: 'Total Transactions', value: stats?.total_transactions || 0, color: '#64748b', filter: null },
                    { label: 'Pending Final', value: stats?.pending_final || 0, color: '#f59e0b', filter: 'PendingFinal' },
                    { label: 'Pending Initial', value: stats?.pending_initial || 0, color: '#ef4444', filter: 'PendingInitial' },
                ].map((s, i) => (
                    <Grid item xs={6} sm={4} md={2} key={i}>
                        <Card 
                            sx={{ 
                                cursor: 'pointer', transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
                                borderLeft: `4px solid ${s.color}`
                            }}
                            onClick={() => s.filter && setQuickFilter(s.filter)}
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
                    <Grid item xs={12} md={3}>
                        <TextField 
                            fullWidth size="small" 
                            placeholder="Search ID, Customer, Trx..." 
                            value={search} onChange={e => setSearch(e.target.value)}
                            InputProps={{ startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} /> }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Method</InputLabel>
                            <Select value={methodFilter} label="Method" onChange={e => setMethodFilter(e.target.value)}>
                                <MenuItem value="All">All Methods</MenuItem>
                                {['bKash', 'Nagad', 'Card', 'Cash'].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Payment For</InputLabel>
                            <Select value={typeFilter} label="Payment For" onChange={e => setTypeFilter(e.target.value)}>
                                <MenuItem value="All">All Types</MenuItem>
                                {['Initial Payment', 'Final Payment', 'Late Fee', 'Fuel Charge', 'Cleaning Charge', 'Driver Cost'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Amount Range</InputLabel>
                            <Select value={amountRange} label="Amount Range" onChange={e => setAmountRange(e.target.value)}>
                                <MenuItem value="All">All Amounts</MenuItem>
                                <MenuItem value="Under 1000">Under 1000</MenuItem>
                                <MenuItem value="1000–5000">1000–5000</MenuItem>
                                <MenuItem value="5000–10000">5000–10000</MenuItem>
                                <MenuItem value="Above 10000">Above 10000</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3} sx={{ textAlign: 'right' }}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button variant="contained" startIcon={<Download />} onClick={exportCSV} sx={{ bgcolor: '#F97316', '&:hover': { bgcolor: '#ea580c' }, textTransform: 'none', borderRadius: 2 }}>Export CSV</Button>
                        </Stack>
                    </Grid>
                    
                    {/* Secondary Filter Row */}
                    <Grid item xs={12} sm={6} md={4}>
                         <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                            {quickFilterPills.map((pill) => (
                                <Chip 
                                    key={pill.value} label={pill.label} 
                                    onClick={() => setQuickFilter(quickFilter === pill.value ? null : pill.value)}
                                    color={quickFilter === pill.value ? "primary" : "default"}
                                    variant={quickFilter === pill.value ? "filled" : "outlined"}
                                    sx={{ 
                                        borderRadius: '16px', fontWeight: 600,
                                        bgcolor: quickFilter === pill.value ? '#F97316' : 'transparent',
                                        borderColor: quickFilter === pill.value ? '#F97316' : '#ddd',
                                        '&:hover': { bgcolor: quickFilter === pill.value ? '#ea580c' : '#f5f5f5' }
                                    }}
                                />
                            ))}
                        </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption">Date Range:</Typography>
                            <TextField type="date" size="small" value={dateRange.start_date} onChange={e => setDateRange({...dateRange, start_date: e.target.value})} />
                            <TextField type="date" size="small" value={dateRange.end_date} onChange={e => setDateRange({...dateRange, end_date: e.target.value})} />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Vehicle</InputLabel>
                            <Select value={vehicleFilter} label="Vehicle" onChange={e => setVehicleFilter(e.target.value)}>
                                <MenuItem value="All">All Vehicles</MenuItem>
                                <MenuItem value="Car">Cars</MenuItem>
                                <MenuItem value="Bike">Bikes</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 25px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Payment ID</StyledTableCell>
                            <StyledTableCell>Booking ID</StyledTableCell>
                            <StyledTableCell>Customer</StyledTableCell>
                            <StyledTableCell>Vehicle</StyledTableCell>
                            <StyledTableCell>Payment For</StyledTableCell>
                            <StyledTableCell align="right">Amount</StyledTableCell>
                            <StyledTableCell>Method</StyledTableCell>
                            <StyledTableCell>Trx ID</StyledTableCell>
                            <StyledTableCell>Date & Time</StyledTableCell>
                            <StyledTableCell align="right">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paymentsLoading ? (
                            <TableRow><TableCell colSpan={10} align="center" sx={{ py: 10 }}>Loading payments...</TableCell></TableRow>
                        ) : paymentsData?.payments.length === 0 ? (
                            <TableRow><TableCell colSpan={10} align="center" sx={{ py: 10 }}>No transactions found.</TableCell></TableRow>
                        ) : paymentsData?.payments.map((row) => (
                            <TableRow 
                                key={row.payment_id} 
                                hover
                                sx={{ 
                                    borderLeft: `5px solid ${
                                        row.payment_for.includes('late') ? '#ef4444' : 
                                        row.payment_for.includes('initial') ? '#3b82f6' : 
                                        row.payment_for.includes('final') ? '#10b981' : 'transparent'
                                    }`
                                }}
                            >
                                <TableCell>
                                    <Tooltip title={row.payment_id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleCopy(row.payment_id)}>
                                            <Typography variant="body2" fontWeight="bold">{row.payment_id.substring(0, 8)}...</Typography>
                                            <ContentCopy sx={{ fontSize: 14, color: 'gray' }} />
                                        </Box>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Click to copy Booking ID">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleCopy(row.booking_id)}>
                                            <Typography variant="body2" sx={{ color: '#F97316', fontWeight: 'bold' }}>{row.booking_id.substring(0, 8)}...</Typography>
                                            <Assignment sx={{ fontSize: 14, color: '#F97316' }} />
                                        </Box>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="bold">{row.user_name}</Typography>
                                    <Typography variant="caption" color="textSecondary">{row.user_phone}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">{row.brand} {row.model}</Typography>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <Chip label={row.vehicle_type} size="small" variant="outlined" sx={{ height: 16, fontSize: '9px', textTransform: 'uppercase' }} />
                                            <Typography variant="caption" sx={{ color: '#F97316' }}>{row.agency_name}</Typography>
                                        </Stack>
                                    </Box>
                                </TableCell>
                                <TableCell><PaymentForBadge type={row.payment_for} /></TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" fontWeight="bold" sx={{ color: row.amount >= 5000 ? '#ea580c' : '#10b981' }}>
                                        {row.amount > 0 ? '+' : ''}৳{row.amount.toLocaleString()}
                                    </Typography>
                                </TableCell>
                                <TableCell><PaymentMethodBadge method={row.method_type} /></TableCell>
                                <TableCell>
                                    {row.trx_id ? (
                                        <Tooltip title={row.trx_id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleCopy(row.trx_id)}>
                                                <Typography variant="caption" fontWeight="bold">{row.trx_id.substring(0, 10)}...</Typography>
                                                <ContentCopy sx={{ fontSize: 12 }} />
                                            </Box>
                                        </Tooltip>
                                    ) : (
                                        <Typography variant="caption" color="textSecondary">N/A</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{moment(row.date).format('MMM DD, YYYY')}</Typography>
                                    <Typography variant="caption" color="textSecondary">{moment(row.date).format('hh:mm A')}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                                        <Tooltip title="View Details"><IconButton size="small" onClick={() => { setSelectedPaymentId(row.payment_id); setIsDetailOpen(true); }} sx={{ color: '#F97316' }}><Info fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Download Receipt"><IconButton size="small" onClick={() => generateReceipt(row.payment_id)} sx={{ color: '#3b82f6' }}><Receipt fontSize="small" /></IconButton></Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                        Showing {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, paymentsData?.totalCount || 0)} of {paymentsData?.totalCount || 0} transactions · Subtotal: BDT {paymentsData?.subtotal?.toLocaleString() || 0}
                    </Typography>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        component="div"
                        count={paymentsData?.totalCount || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, v) => setPage(v)}
                        onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    />
                </Box>
            </TableContainer>

            {/* Payment Detail Modal */}
            <PaymentDetailModal 
                open={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                paymentId={selectedPaymentId} 
            />
        </Box>
    );
};

// --- Sub Components ---

const PaymentDetailModal = ({ open, onClose, paymentId }) => {
    const axiosPublic = useAxiosPublic();
    const { data: details, isLoading } = useQuery({
        queryKey: ['admin-payment-details', paymentId],
        queryFn: async () => {
            const res = await axiosPublic.get(`paymentRoutes/admin/details/${paymentId}`);
            return res.data;
        },
        enabled: open && !!paymentId
    });

    if (!paymentId) return null;

    const p = details?.payment;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: '#F97316', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PaymentsIcon /> 
                    <Typography variant="h6">Payment Transaction Details</Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'white' }}><Close /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {isLoading ? <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box> : (
                    <Stack spacing={4}>
                        {/* Summary Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                            <Box>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary">Transaction ID</Typography>
                                <Typography variant="h6" fontWeight="bold">{p.trx_id || 'CASH TRANSACTION'}</Typography>
                                <Typography variant="body2" color="textSecondary">{moment(p.date).format('LLLL')}</Typography>
                            </Box>
                            <Box textAlign="right">
                                <Typography variant="caption" fontWeight="bold" color="textSecondary">Amount Paid</Typography>
                                <Typography variant="h4" fontWeight="bold" color="#10b981">৳{p.amount.toLocaleString()}</Typography>
                                <Stack direction="row" spacing={1} mt={1} justifyContent="flex-end">
                                    <PaymentMethodBadge method={p.method_type} />
                                    <PaymentForBadge type={p.payment_for} />
                                </Stack>
                            </Box>
                        </Box>

                        <Grid container spacing={3}>
                            {/* Booking Info */}
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>Booking Reference</Typography>
                                        <Stack spacing={1}>
                                            <DetailRow label="Booking ID" value={p.booking_id} copy />
                                            <DetailRow label="Vehicle" value={`${p.brand} ${p.model} (${p.vehicle_type})`} />
                                            <DetailRow label="Agency" value={p.agency_name} color="#F97316" />
                                            <DetailRow label="Booking Status" value={<Chip label={p.booking_status} size="small" />} />
                                            <DetailRow label="Trip" value={`${moment(p.start_ts).format('MMM DD')} - ${moment(p.end_ts).format('MMM DD')}`} />
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Customer Info */}
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>Customer Profile</Typography>
                                        <Stack spacing={1}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                <Avatar src={p.user_photo} />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">{p.user_name}</Typography>
                                                    <Typography variant="caption" color="textSecondary">{p.user_email}</Typography>
                                                </Box>
                                            </Box>
                                            <DetailRow label="Phone" value={p.user_phone} />
                                            <DetailRow label="Account Status" value={<Chip label={p.user_status} size="small" color="success" />} />
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Payment Context Breakdown */}
                        <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>Payment Context Breakdown</Typography>
                            {p.payment_for.toLowerCase().includes('initial') && (
                                <Grid container spacing={2}>
                                    <Grid item xs={4}><StatBox label="Total Booking Cost" value={`৳${p.total_cost.toLocaleString()}`} /></Grid>
                                    <Grid item xs={4}><StatBox label="Initial Amount" value={`৳${p.amount.toLocaleString()}`} color="#3b82f6" /></Grid>
                                    <Grid item xs={4}><StatBox label="Remaining Balance" value={`৳${(p.total_cost - p.amount).toLocaleString()}`} color="#ef4444" /></Grid>
                                </Grid>
                            )}
                            {p.payment_for.toLowerCase().includes('final') && (
                                <Grid container spacing={2}>
                                    <Grid item xs={4}><StatBox label="Total Booking Cost" value={`৳${p.total_cost.toLocaleString()}`} /></Grid>
                                    <Grid item xs={4}><StatBox label="Final Amount" value={`৳${p.amount.toLocaleString()}`} color="#10b981" /></Grid>
                                    <Grid item xs={4}><StatBox label="Total Collected" value={`৳${details.all_booking_payments.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`} color="#10b981" /></Grid>
                                </Grid>
                            )}
                            {p.payment_for.toLowerCase().includes('late') && (
                                <Grid container spacing={2}>
                                    <Grid item xs={4}><StatBox label="Late Hours" value={p.late_hours || 'N/A'} color="#ef4444" /></Grid>
                                    <Grid item xs={4}><StatBox label="Late Fee Rate" value="Per Policy" /></Grid>
                                    <Grid item xs={4}><StatBox label="Late Fee Paid" value={`৳${p.amount.toLocaleString()}`} color="#ef4444" /></Grid>
                                </Grid>
                            )}
                            {p.payment_for.toLowerCase().includes('fuel') && (
                                <Grid container spacing={2}>
                                    <Grid item xs={4}><StatBox label="Pickup Fuel" value={`${p.pickup_fuel}%`} /></Grid>
                                    <Grid item xs={4}><StatBox label="Return Fuel" value={`${p.return_fuel}%`} /></Grid>
                                    <Grid item xs={4}><StatBox label="Fuel Charge" value={`৳${p.amount.toLocaleString()}`} color="#f59e0b" /></Grid>
                                </Grid>
                            )}
                            {p.payment_for.toLowerCase().includes('driver') && (
                                <Grid container spacing={2}>
                                    <Grid item xs={4}><StatBox label="Driver Name" value={p.driver_name || 'N/A'} /></Grid>
                                    <Grid item xs={4}><StatBox label="Hourly Rate" value={`৳${p.driver_rate}/hr`} /></Grid>
                                    <Grid item xs={4}><StatBox label="Total Driver Paid" value={`৳${p.amount.toLocaleString()}`} color="#06b6d4" /></Grid>
                                </Grid>
                            )}
                        </Box>

                        {/* All Payments for this Booking */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>All Payments for this Booking</Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Payment For</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Method</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Trx ID</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {details.all_booking_payments.map((pay) => (
                                            <TableRow key={pay.payment_id} sx={{ bgcolor: pay.payment_id === p.payment_id ? '#fff7ed' : 'inherit' }}>
                                                <TableCell>{pay.payment_for}</TableCell>
                                                <TableCell fontWeight="bold">৳{pay.amount.toLocaleString()}</TableCell>
                                                <TableCell>{pay.method_type}</TableCell>
                                                <TableCell>{pay.trx_id?.substring(0, 8)}...</TableCell>
                                                <TableCell>{moment(pay.date).format('MMM DD, YY')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" fontWeight="bold">Booking Total: ৳{p.total_cost.toLocaleString()}</Typography>
                                <Typography variant="caption" fontWeight="bold" color="success.main">Collected: ৳{details.all_booking_payments.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</Typography>
                                <Typography variant="caption" fontWeight="bold" color="error.main">Remaining: ৳{Math.max(0, p.total_cost - details.all_booking_payments.reduce((acc, curr) => acc + curr.amount, 0)).toLocaleString()}</Typography>
                            </Box>
                        </Box>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
        </Dialog>
    );
};

const DetailRow = ({ label, value, color, copy }) => {
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };
    
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', pb: 0.5 }}>
            <Typography variant="caption" color="textSecondary">{label}:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" fontWeight="bold" sx={{ color: color || 'inherit' }}>{value}</Typography>
                {copy && <IconButton size="small" onClick={() => handleCopy(value)}><ContentCopy sx={{ fontSize: 10 }} /></IconButton>}
            </Box>
        </Box>
    );
};

const StatBox = ({ label, value, color }) => (
    <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block">{label}</Typography>
        <Typography variant="body2" fontWeight="bold" sx={{ color: color || 'inherit' }}>{value}</Typography>
    </Box>
);

export default Payments;
