import { useState, useMemo } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button, Stack,
    Tabs, Tab, MenuItem, TextField, Chip, useTheme, Skeleton, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Menu, Avatar, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { FileDownload, TrendingUp, TrendingDown, MonetizationOn, 
    BookOnline, Cancel, People, Business, DirectionsCar, 
    AccessTime, Star, History, CheckCircleOutline,
    TwoWheeler, CalendarToday } from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
    Legend, LineChart, Line} from 'recharts';
import moment from 'moment';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';

// Custom Colors
const COLORS = {
    revenue: '#10b981', // green
    bookings: '#3b82f6', // blue
    cancellations: '#ef4444', // red
    ongoing: '#0d9488', // teal
    pending: '#f59e0b', // amber
    cars: '#2563eb', // blue
    bikes: '#7c3aed', // purple
    bkash: '#d23a77',
    nagad: '#f97316',
    card: '#3b82f6',
    cash: '#10b981'
};

const ReportsAnalytics = () => {
    const axiosPublic = useAxiosPublic();
    const [activeTab, setActiveTab] = useState(0);
    const [dateRange, setDateRange] = useState('This Month');
    const [customRange, setCustomRange] = useState({
        startDate: moment().startOf('month').format('YYYY-MM-DD'),
        endDate: moment().endOf('month').format('YYYY-MM-DD')
    });
    const [exportAnchor, setExportAnchor] = useState(null);

    // Get actual dates
    const { start, end } = useMemo(() => {
        let s, e;
        switch (dateRange) {
            case 'Today': s = moment().startOf('day'); e = moment().endOf('day'); break;
            case 'Yesterday': s = moment().subtract(1, 'day').startOf('day'); e = moment().subtract(1, 'day').endOf('day'); break;
            case 'Last 7 Days': s = moment().subtract(7, 'days').startOf('day'); e = moment().endOf('day'); break;
            case 'Last 30 Days': s = moment().subtract(30, 'days').startOf('day'); e = moment().endOf('day'); break;
            case 'This Month': s = moment().startOf('month'); e = moment().endOf('day'); break;
            case 'Last Month': s = moment().subtract(1, 'month').startOf('month'); e = moment().subtract(1, 'month').endOf('month'); break;
            case 'Last 3 Months': s = moment().subtract(3, 'months').startOf('month'); e = moment().endOf('day'); break;
            case 'Last 6 Months': s = moment().subtract(6, 'months').startOf('month'); e = moment().endOf('day'); break;
            case 'This Year': s = moment().startOf('year'); e = moment().endOf('day'); break;
            case 'All Time': s = moment('2024-01-01'); e = moment().endOf('day'); break;
            case 'Custom Range': s = moment(customRange.startDate); e = moment(customRange.endDate); break;
            default: s = moment().startOf('month'); e = moment().endOf('day');
        }
        return { start: s, end: e };
    }, [dateRange, customRange]);

    const endpoints = ['revenue', 'bookings', 'cancellations', 'drivers', 'agencies', 'vehicles'];

    const { data: analyticsData, isLoading } = useQuery({
        queryKey: ['admin-analytics', activeTab, start.format(), end.format()],
        queryFn: async () => {
            const res = await axiosPublic.get(`admin-analytics/${endpoints[activeTab]}`, {
                params: {
                    startDate: start.format('YYYY-MM-DD HH:mm:ss'),
                    endDate: end.format('YYYY-MM-DD HH:mm:ss')
                }
            });
            return res.data;
        }
    });

    const formatBDT = (val) => `৳${Number(val || 0).toLocaleString()}`;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header Area */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#1e293b', letterSpacing: '-0.02em' }}>Reports & Analytics</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>Insights, performance tracking, and business intelligence hub</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<FileDownload />} 
                    onClick={(e) => setExportAnchor(e.currentTarget)}
                    sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' }, borderRadius: 2.5, px: 3, py: 1.2, fontWeight: 'bold', boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)' }}
                >
                    Export Report
                </Button>
                <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
                    <MenuItem onClick={() => setExportAnchor(null)}>Export as PDF</MenuItem>
                    <MenuItem onClick={() => setExportAnchor(null)}>Export as CSV</MenuItem>
                </Menu>
            </Box>

            {/* Persistent Date Selector */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 4, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems={{ lg: 'center' }} justifyContent="space-between">
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months', 'This Year', 'All Time', 'Custom Range'].map(pill => (
                            <Chip 
                                key={pill} label={pill} onClick={() => setDateRange(pill)}
                                sx={{ 
                                    borderRadius: '10px', fontWeight: 'bold', px: 1,
                                    bgcolor: dateRange === pill ? '#f97316' : 'transparent',
                                    color: dateRange === pill ? 'white' : '#64748b',
                                    border: '1px solid', borderColor: dateRange === pill ? 'transparent' : '#e2e8f0',
                                    '&:hover': { bgcolor: dateRange === pill ? '#ea580c' : '#f1f5f9' }
                                }}
                            />
                        ))}
                    </Box>
                    <Typography variant="body2" fontWeight="700" color="#475569" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 18, color: '#f97316' }} />
                        {start.format('MMM DD, YYYY')} — {end.format('MMM DD, YYYY')}
                    </Typography>
                </Stack>

                {dateRange === 'Custom Range' && (
                    <Stack direction="row" spacing={2} mt={3}>
                        <TextField type="date" label="Start" value={customRange.startDate} onChange={e => setCustomRange({...customRange, startDate: e.target.value})} size="small" InputLabelProps={{ shrink: true }} />
                        <TextField type="date" label="End" value={customRange.endDate} onChange={e => setCustomRange({...customRange, endDate: e.target.value})} size="small" InputLabelProps={{ shrink: true }} />
                    </Stack>
                )}
            </Paper>

            {/* Tab Navigation */}
            <Tabs 
                value={activeTab} onChange={(e, v) => setActiveTab(v)}
                sx={{ 
                    mb: 4, '& .MuiTabs-indicator': { bgcolor: '#f97316', height: 4, borderRadius: '4px 4px 0 0' },
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 800, fontSize: '0.95rem', minWidth: 140, color: '#64748b', '&.Mui-selected': { color: '#f97316' } }
                }}
            >
                <Tab label="💰 Revenue" />
                <Tab label="📅 Bookings" />
                <Tab label="❌ Cancellations" />
                <Tab label="👨 Drivers" />
                <Tab label="🏢 Agencies" />
                <Tab label="🚗 Vehicles" />
            </Tabs>

            {/* Dashboard Content */}
            {isLoading ? <LoadingState /> : !analyticsData ? (
                <Box display="flex" justifyContent="center" p={10}>
                    <Typography color="textSecondary">No data available for this period.</Typography>
                </Box>
            ) : (
                <>
                    {activeTab === 0 && <RevenueTab data={analyticsData} formatBDT={formatBDT} />}
                    {activeTab === 1 && <BookingsTab data={analyticsData} />}
                    {activeTab === 2 && <CancellationsTab data={analyticsData} formatBDT={formatBDT} />}
                    {activeTab === 3 && <DriverTab data={analyticsData} formatBDT={formatBDT} />}
                    {activeTab === 4 && <AgencyTab data={analyticsData} formatBDT={formatBDT} />}
                    {activeTab === 5 && <VehicleTab data={analyticsData} formatBDT={formatBDT} />}
                </>
            )}
        </Box>
    );
};

// --- Sub-Components ---

const KPICard = ({ title, value, icon, color, trend, subValue }) => (
    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}>
        <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: `${color}10`, color }}>{icon}</Box>
                {trend && (
                    <Chip size="small" label={`${trend > 0 ? '↑' : '↓'} ${Math.abs(trend)}%`} 
                        sx={{ fontWeight: 'bold', bgcolor: trend > 0 ? '#dcfce7' : '#fee2e2', color: trend > 0 ? '#166534' : '#991b1b' }} />
                )}
            </Box>
            <Typography variant="caption" fontWeight="bold" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</Typography>
            <Typography variant="h5" fontWeight="800" sx={{ mt: 0.5, color: '#1e293b' }}>{value}</Typography>
            {subValue && <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>{subValue}</Typography>}
        </CardContent>
    </Card>
);

const RevenueTab = ({ data, formatBDT }) => (
    <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={2}><KPICard title="Total Revenue" value={formatBDT(data.kpi?.total_revenue)} icon={<MonetizationOn />} color={COLORS.revenue} trend={12.4} /></Grid>
        <Grid item xs={12} sm={6} md={2}><KPICard title="Avg / Booking" value={formatBDT(data.kpi?.avg_revenue_per_booking)} icon={<TrendingUp />} color={COLORS.bookings} /></Grid>
        <Grid item xs={12} sm={6} md={2}><KPICard title="Highest Pmt" value={formatBDT(data.kpi?.highest_payment)} icon={<Star />} color={COLORS.pending} /></Grid>
        <Grid item xs={12} sm={6} md={2}><KPICard title="Transactions" value={data.kpi?.total_transactions || 0} icon={<BookOnline />} color={COLORS.cars} /></Grid>
        <Grid item xs={12} sm={6} md={2}><KPICard title="Pending" value={formatBDT(data.kpi?.pending_revenue)} icon={<AccessTime />} color={COLORS.pending} /></Grid>
        <Grid item xs={12} sm={6} md={2}><KPICard title="Daily Avg" value={formatBDT((data.kpi?.total_revenue || 0) / 30)} icon={<History />} color={COLORS.ongoing} /></Grid>

        <Grid item xs={12}>
            <ChartPaper title="Revenue Over Time">
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={data.revenueOverTime || []}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.revenue} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" tickFormatter={d => moment(d).format('MMM DD')} />
                        <YAxis tickFormatter={v => `৳${v/1000}k`} />
                        <RechartsTooltip formatter={v => formatBDT(v)} labelFormatter={l => moment(l).format('LL')} />
                        <Area type="monotone" dataKey="revenue" stroke={COLORS.revenue} strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>

        <Grid item xs={12} md={6}>
            <ChartPaper title="Revenue by Payment Method">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={data.paymentMethod || []} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                            {(data.paymentMethod || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name?.toLowerCase()] || COLORS.bookings} />
                            ))}
                        </Pie>
                        <RechartsTooltip formatter={v => formatBDT(v)} />
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>

        <Grid item xs={12} md={6}>
            <ChartPaper title="Revenue by Vehicle Type">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={data.vehicleType || []} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                            {(data.vehicleType || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'Car' ? COLORS.cars : COLORS.bikes} />
                            ))}
                        </Pie>
                        <RechartsTooltip formatter={v => formatBDT(v)} />
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>

        <Grid item xs={12} md={6}>
            <ChartPaper title="Revenue by Payment Type">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.paymentType || []} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" fontSize={11} width={100} />
                        <RechartsTooltip formatter={v => formatBDT(v)} />
                        <Bar dataKey="value" fill={COLORS.nagad} radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>

        <Grid item xs={12} md={6}>
            <ChartPaper title="Revenue by Agency (Top 10)">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.agencyRevenue || []} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" fontSize={11} width={100} />
                        <RechartsTooltip formatter={v => formatBDT(v)} />
                        <Bar dataKey="value" fill={COLORS.bkash} radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>

        <Grid item xs={12}>
            <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                <Box p={3} borderBottom="1px solid #f1f5f9"><Typography variant="h6" fontWeight="bold">Agency Revenue Breakdown</Typography></Box>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Agency</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Cars Revenue</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Bikes Revenue</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Revenue</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Transactions</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Avg / Booking</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>% Contribution</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(data.agencyTable || []).map(row => (
                                <TableRow key={row.agency_name} hover>
                                    <TableCell sx={{ fontWeight: '600' }}>{row.agency_name}</TableCell>
                                    <TableCell align="right">{formatBDT(row.cars_revenue)}</TableCell>
                                    <TableCell align="right">{formatBDT(row.bikes_revenue)}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: COLORS.revenue }}>{formatBDT(row.total_revenue)}</TableCell>
                                    <TableCell align="right">{row.transaction_count}</TableCell>
                                    <TableCell align="right">{formatBDT(row.avg_per_booking)}</TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                                            <Typography variant="body2" fontWeight="bold">{Number(row.percent_of_total).toFixed(1)}%</Typography>
                                            <Box sx={{ width: 40, height: 6, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                                                <Box sx={{ width: `${row.percent_of_total}%`, height: '100%', bgcolor: COLORS.revenue }} />
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Grid>
    </Grid>
);

const BookingsTab = ({ data }) => (
    <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={2}><KPICard title="Total Bookings" value={data.kpi?.total_bookings || 0} icon={<BookOnline />} color={COLORS.bookings} /></Grid>
        <Grid item xs={12} sm={6} md={2}><KPICard title="Completed" value={data.kpi?.completed_bookings || 0} icon={<CheckCircleOutline />} color={COLORS.revenue} /></Grid>
        <Grid item xs={12} sm={6} md={2}><KPICard title="Ongoing" value={data.kpi?.ongoing_bookings || 0} icon={<TrendingUp />} color={COLORS.ongoing} /></Grid>
        <Grid item xs={12} sm={6} md={2}><KPICard title="Pending" value={data.kpi?.pending_bookings || 0} icon={<AccessTime />} color={COLORS.pending} /></Grid>
        <Grid item xs={12} sm={6} md={2}><KPICard title="Avg Duration" value={`${Number(data.kpi?.avg_duration || 0).toFixed(1)} hrs`} icon={<History />} color={COLORS.cars} /></Grid>
        <Grid item xs={12} sm={6} md={2}><KPICard title="With Driver" value={data.kpi?.with_driver_bookings || 0} icon={<People />} color={COLORS.bikes} /></Grid>

        <Grid item xs={12}>
            <ChartPaper title="Bookings Over Time (By Status)">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.bookingsOverTime || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" tickFormatter={d => moment(d).format('MMM DD')} />
                        <YAxis />
                        <RechartsTooltip labelFormatter={l => moment(l).format('LL')} />
                        <Legend />
                        <Bar dataKey="count" name="Bookings" fill={COLORS.bookings} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>

        <Grid item xs={12} md={6}>
            <ChartPaper title="Peak Booking Hours (Intensity)">
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 0.5, mt: 2 }}>
                    {[...Array(24)].map((_, i) => (
                        <Tooltip key={i} title={`Hour: ${i}:00`}>
                            <Box sx={{ 
                                height: 40, borderRadius: 1, 
                                bgcolor: `rgba(249, 115, 22, ${Math.random() * 0.9 + 0.1})` // Dummy intensity
                            }} />
                        </Tooltip>
                    ))}
                </Box>
                <Typography variant="caption" color="textSecondary" align="center" display="block" mt={1}>00:00 — 23:00 Hours</Typography>
            </ChartPaper>
        </Grid>

        <Grid item xs={12} md={6}>
            <ChartPaper title="Popular Vehicles (Top 10 Cars)">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.popularCars || []} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" fontSize={11} width={100} />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill={COLORS.cars} radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>

        <Grid item xs={12} md={6}>
            <ChartPaper title="Booking Purpose Distribution">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.purposeDistribution || []} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" fontSize={11} width={100} />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill={COLORS.ongoing} radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>

        <Grid item xs={12} md={6}>
            <ChartPaper title="Trip Duration Distribution">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.durationDistribution || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="range" fontSize={10} />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill={COLORS.pending} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>
    </Grid>
);

const CancellationsTab = ({ data, formatBDT }) => (
    <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={2}><KPICard title="Total Cancellations" value={data.kpi?.total_cancellations || 0} icon={<Cancel />} color={COLORS.cancellations} /></Grid>
        <Grid item xs={12} sm={6} md={2}><KPICard title="Cancel Rate" value={`${Number(data.kpi?.cancellation_rate || 0).toFixed(1)}%`} icon={<TrendingDown />} color={COLORS.pending} /></Grid>
        <Grid item xs={12} sm={6} md={2}><KPICard title="By User" value={data.kpi?.cancelled_by_user || 0} icon={<People />} color={COLORS.bookings} /></Grid>
        <Grid item xs={12} sm={6} md={2}><KPICard title="By Agency" value={data.kpi?.cancelled_by_agency || 0} icon={<Business />} color={COLORS.pending} /></Grid>
        <Grid item xs={12} sm={6} md={2}><KPICard title="Revenue Lost" value={formatBDT(data.kpi?.revenue_lost)} icon={<MonetizationOn />} color={COLORS.cancellations} /></Grid>

        <Grid item xs={12} md={7}>
            <ChartPaper title="Cancellation Reasons Breakdown">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.reasons || []} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={150} fontSize={11} />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill={COLORS.cancellations} radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>

        <Grid item xs={12} md={5}>
            <ChartPaper title="Cancellation Timing (Relative to Start)">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.timing || []}>
                        <XAxis dataKey="timing" fontSize={10} />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill={COLORS.pending} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>

        <Grid item xs={12}>
            <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid #f1f5f9' }}>
                <Box p={3} borderBottom="1px solid #f1f5f9"><Typography variant="h6" fontWeight="bold">Cancellation Logs</Typography></Box>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Vehicle</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>By</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Lost Revenue</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(data.detailTable || []).map(row => (
                            <TableRow key={row.booking_id} hover>
                                <TableCell>#{row.booking_id.slice(-6)}</TableCell>
                                <TableCell>{row.customer}</TableCell>
                                <TableCell>{row.vehicle}</TableCell>
                                <TableCell>
                                    <Chip size="small" label={row.cancelled_by} 
                                        sx={{ bgcolor: row.cancelled_by === 'user' ? '#dbeafe' : '#fef3c7', color: row.cancelled_by === 'user' ? '#1e40af' : '#92400e', fontWeight: 'bold', textTransform: 'uppercase' }} />
                                </TableCell>
                                <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.cancel_reason}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: COLORS.cancellations }}>{formatBDT(row.revenue_lost)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    </Grid>
);

const DriverTab = ({ data, formatBDT }) => (
    <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={2.4}><KPICard title="Active Drivers" value={data.kpi?.active_drivers || 0} icon={<People />} color={COLORS.ongoing} /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><KPICard title="Avg Rating" value={Number(data.kpi?.avg_rating || 0).toFixed(1)} icon={<Star />} color={COLORS.pending} /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><KPICard title="Trips Done" value={data.kpi?.trips_completed || 0} icon={<BookOnline />} color={COLORS.revenue} /></Grid>
        
        <Grid item xs={12} md={6}>
            <ChartPaper title="Driver Rating Distribution">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.ratingDistribution || []} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="rating" type="category" tickFormatter={v => `${v} ★`} />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill={COLORS.pending} radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>

        <Grid item xs={12} md={6}>
            <ChartPaper title="Driver Rating Trend (Monthly Avg)">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.ratingTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tickFormatter={d => moment(d).format('MMM')} />
                        <YAxis domain={[0, 5]} />
                        <RechartsTooltip labelFormatter={l => moment(l).format('MMMM YYYY')} />
                        <Line type="monotone" dataKey="rating" stroke={COLORS.pending} strokeWidth={3} dot={{ r: 4, fill: COLORS.pending }} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>

        <Grid item xs={12}>
            <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid #f1f5f9' }}>
                <Box p={3} borderBottom="1px solid #f1f5f9"><Typography variant="h6" fontWeight="bold">Driver Performance Ranking</Typography></Box>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell>Rank</TableCell>
                            <TableCell>Driver</TableCell>
                            <TableCell>Agency</TableCell>
                            <TableCell align="right">Trips</TableCell>
                            <TableCell align="right">Compl. Rate</TableCell>
                            <TableCell align="right">Rating</TableCell>
                            <TableCell align="right">Earnings</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(data.leaderboard || []).map((row, i) => (
                            <TableRow key={row.driver_id} hover>
                                <TableCell>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{row.name}</TableCell>
                                <TableCell>{row.agency_name || 'Independent'}</TableCell>
                                <TableCell align="right">{row.total_trips}</TableCell>
                                <TableCell align="right">{Number(row.completion_rate).toFixed(1)}%</TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                                        <Star sx={{ fontSize: 16, color: '#f59e0b' }} />
                                        <Typography variant="body2" fontWeight="bold">{Number(row.rating).toFixed(1)}</Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: COLORS.revenue }}>{formatBDT(row.total_earnings)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    </Grid>
);

const AgencyTab = ({ data, formatBDT }) => (
    <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={2.4}><KPICard title="Active Agencies" value={data.kpi?.active_agencies || 0} icon={<Business />} color={COLORS.nagad} /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><KPICard title="Avg Rating" value={Number(data.kpi?.avg_rating || 0).toFixed(1)} icon={<Star />} color={COLORS.pending} /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><KPICard title="Total Fleet" value={data.kpi?.total_fleet || 0} icon={<DirectionsCar />} color={COLORS.cars} /></Grid>

        <Grid item xs={12}>
            <ChartPaper title="Agency Revenue Comparison (Cars vs Bikes)">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.revenueComparison || []}>
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={v => `৳${v/1000}k`} />
                        <RechartsTooltip formatter={v => formatBDT(v)} />
                        <Legend iconType="circle" />
                        <Bar dataKey="car_revenue" name="Car Revenue" fill={COLORS.cars} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="bike_revenue" name="Bike Revenue" fill={COLORS.bikes} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>

        <Grid item xs={12} md={6}>
            <ChartPaper title="Agency Status Distribution">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={data.statusDistribution || []} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                            {(data.statusDistribution || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'Active' ? COLORS.revenue : COLORS.pending} />
                            ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>

        <Grid item xs={12} md={6}>
            <ChartPaper title="Platform Growth (New Agencies)">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.growthTrend || []}>
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="stepAfter" dataKey="count" stroke={COLORS.nagad} strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartPaper>
        </Grid>

        <Grid item xs={12}>
            <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid #f1f5f9' }}>
                <Box p={3} borderBottom="1px solid #f1f5f9"><Typography variant="h6" fontWeight="bold">Agency Performance Ranking</Typography></Box>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell>Rank</TableCell>
                            <TableCell>Agency</TableCell>
                            <TableCell>City</TableCell>
                            <TableCell align="right">Fleet</TableCell>
                            <TableCell align="right">Bookings</TableCell>
                            <TableCell align="right">Rating</TableCell>
                            <TableCell align="right">Total Revenue</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(data.leaderboard || []).map((row, i) => (
                            <TableRow key={row.agency_id} hover>
                                <TableCell>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{row.agency_name}</TableCell>
                                <TableCell>{row.city}</TableCell>
                                <TableCell align="right">{row.fleet_size}</TableCell>
                                <TableCell align="right">{row.total_bookings}</TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                                        <Star sx={{ fontSize: 16, color: '#f59e0b' }} />
                                        <Typography variant="body2" fontWeight="bold">{Number(row.rating).toFixed(1)}</Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: COLORS.revenue }}>{formatBDT(row.total_revenue)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    </Grid>
);

const VehicleTab = ({ data, formatBDT }) => {
    const [vType, setVType] = useState('cars');
    const rankingData = vType === 'cars' ? data.carRanking : data.bikeRanking;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}><KPICard title="Total Vehicles" value={data.kpi?.total_vehicles || 0} icon={<DirectionsCar />} color={COLORS.cars} /></Grid>
            <Grid item xs={12} sm={6} md={4.5}><KPICard title="Top Car" value={data.kpi?.most_booked_car || 'N/A'} icon={<BookOnline />} color={COLORS.bookings} /></Grid>
            <Grid item xs={12} sm={6} md={4.5}><KPICard title="Top Bike" value={data.kpi?.most_booked_bike || 'N/A'} icon={<TwoWheeler />} color={COLORS.bikes} /></Grid>

            <Grid item xs={12} md={6}>
                <ChartPaper title="Fuel Type Split (Platform Wide)">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={data.fuelType || []} innerRadius={60} outerRadius={90} dataKey="value">
                                {(data.fuelType || []).map((entry, index) => (
                                    <Cell key={index} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartPaper>
            </Grid>

            <Grid item xs={12} md={6}>
                <ChartPaper title="Transmission Type Split (Cars Only)">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={data.transmission || []} innerRadius={60} outerRadius={90} dataKey="value">
                                {(data.transmission || []).map((entry, index) => (
                                    <Cell key={index} fill={index === 0 ? COLORS.cars : '#94a3b8'} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartPaper>
            </Grid>

            <Grid item xs={12}>
                <ChartPaper title="Top 10 Vehicles with Damage Reports">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={data.damageAnalysis || []}>
                            <XAxis dataKey="vehicle" fontSize={10} />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="count" name="Damage Reports" fill={COLORS.cancellations} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartPaper>
            </Grid>

            <Grid item xs={12}>
                <Paper sx={{ borderRadius: 4, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                    <Box p={3} borderBottom="1px solid #f1f5f9" display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold">Vehicle Performance Ranking</Typography>
                        <ToggleButtonGroup value={vType} exclusive onChange={(e, v) => v && setVType(v)} size="small">
                            <ToggleButton value="cars" sx={{ px: 3, fontWeight: 'bold' }}>Cars</ToggleButton>
                            <ToggleButton value="bikes" sx={{ px: 3, fontWeight: 'bold' }}>Bikes</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell>Rank</TableCell>
                                    <TableCell>Vehicle</TableCell>
                                    <TableCell>Agency</TableCell>
                                    <TableCell align="right">Bookings</TableCell>
                                    <TableCell align="right">Rating</TableCell>
                                    <TableCell align="right">Damage Reports</TableCell>
                                    <TableCell align="right">Total Revenue</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(rankingData || []).map((row, i) => (
                                    <TableRow key={i} hover>
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar src={row.photo} variant="rounded" sx={{ width: 40, height: 40 }} />
                                                <Typography variant="body2" fontWeight="bold">{row.brand} {row.model}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{row.agency_name}</TableCell>
                                        <TableCell align="right">{row.total_bookings}</TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                                                <Star sx={{ fontSize: 14, color: '#f59e0b' }} />
                                                <Typography variant="body2" fontWeight="bold">{Number(row.rating).toFixed(1)}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.damage_reports > 0 ? (
                                                <Chip size="small" label={row.damage_reports} sx={{ bgcolor: '#fee2e2', color: '#ef4444', fontWeight: 'bold' }} />
                                            ) : '0'}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color: COLORS.revenue }}>{formatBDT(row.total_revenue)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Grid>
        </Grid>
    );
};

const ChartPaper = ({ title, children }) => (
    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#334155' }}>{title}</Typography>
        {children}
    </Paper>
);

const LoadingState = () => (
    <Grid container spacing={3}>
        {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={2} key={i}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 4 }} />
            </Grid>
        ))}
        <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
        </Grid>
        <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
        </Grid>
    </Grid>
);

const TooltipStyled = ({ children, title }) => (
    <Tooltip title={title} arrow placement="top">
        {children}
    </Tooltip>
);

export default ReportsAnalytics;
