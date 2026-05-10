import React, { useState, useMemo } from 'react';
import {
    Box, Typography, Paper, Grid, Card, CardContent, Button, Stack,
    IconButton, Divider, MenuItem, Select, FormControl, TextField,
    Chip, useTheme, Avatar, Tooltip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress,
    Fade, Tab, Tabs, InputAdornment, Badge, Checkbox
} from '@mui/material';
import {
    Warning, Info, CheckCircle, ErrorOutline, Search, FilterList,
    Download, Visibility, Edit, Forward, MoreVert, Close, 
    CalendarToday, DirectionsCar, MonetizationOn, History, 
    Business, Person, Assignment, Payments, Settings
} from '@mui/icons-material';
import moment from 'moment';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import toast from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
    Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

// --- Theme Colors ---
const COLORS = {
    orange: '#F97316',
    red: '#EF4444',
    amber: '#F59E0B',
    green: '#22C55E',
    purple: '#A855F7',
    grey: '#94a3b8'
};

const SEVERITY_MAP = {
    'Low': { label: 'Minor', color: COLORS.green, icon: '●' },
    'Medium': { label: 'Moderate', color: COLORS.amber, icon: '●●' },
    'High': { label: 'Severe', color: COLORS.red, icon: '●●●' }
};

const STATUS_MAP = {
    'Pending': { label: 'Open', color: COLORS.red, icon: '🔴' },
    'On-Review': { label: 'Under Review', color: COLORS.amber, icon: '🟡' },
    'Resolved': { label: 'Resolved', color: COLORS.green, icon: '✓' }
};

const AdminDamageReports = () => {
    const theme = useTheme();
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();

    // --- State ---
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Open');
    const [severityFilter, setSeverityFilter] = useState('All');
    const [damageTypeFilter, setDamageTypeFilter] = useState('All');
    const [selectedReports, setSelectedReports] = useState([]);
    const [detailId, setDetailId] = useState(null);
    const [updateId, setUpdateId] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showRepeats, setShowRepeats] = useState(false);

    // --- Data Fetching ---
    const { data: statsData } = useQuery({
        queryKey: ['damage-stats'],
        queryFn: async () => {
            const res = await axiosPublic.get('/admin-damage/stats');
            return res.data;
        }
    });

    const { data: reportsData, isLoading } = useQuery({
        queryKey: ['damage-reports', page, rowsPerPage, search, statusFilter, severityFilter, damageTypeFilter],
        queryFn: async () => {
            const res = await axiosPublic.get('/admin-damage/list', {
                params: {
                    page,
                    limit: rowsPerPage,
                    search,
                    status: statusFilter,
                    severity: severityFilter,
                    damage_type: damageTypeFilter
                }
            });
            return res.data;
        }
    });

    const { data: analyticsData } = useQuery({
        queryKey: ['damage-analytics'],
        queryFn: async () => {
            const res = await axiosPublic.get('/admin-damage/analytics');
            return res.data;
        },
        enabled: showAnalytics
    });

    // --- Mutations ---
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await axiosPublic.put(`/admin-damage/update/${id}`, data);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries(['damage-reports']);
            queryClient.invalidateQueries(['damage-stats']);
            setUpdateId(null);
        }
    });

    // --- Handlers ---
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedReports(reportsData?.reports.map(r => r.damage_id));
        } else {
            setSelectedReports([]);
        }
    };

    const handleSelect = (id) => {
        setSelectedReports(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleAdvanceStatus = (report) => {
        const nextStatusMap = { 'Pending': 'Under Review', 'On-Review': 'Resolved' };
        const next = nextStatusMap[report.status];
        if (next) {
            updateStatusMutation.mutate({ 
                id: report.damage_id, 
                data: { status: next, estimated_cost: report.estimated_cost, admin_notes: 'Quick status advance' } 
            });
        }
    };

    // --- Sub-components (defined below) ---

    return (
        <Box p={4} bgcolor="#f8fafc" minHeight="100vh">
            {/* 1. Header & Stats */}
            <Box mb={4}>
                <Typography variant="h4" fontWeight="900" sx={{ color: '#1e293b', mb: 1 }}>Damage Reports</Typography>
                <Typography variant="body2" color="textSecondary">Manage, track, and resolve all vehicle damage reports across the platform.</Typography>
            </Box>

            <Grid container spacing={3} mb={4}>
                <StatCard title="Total Reports" value={statsData?.stats?.total_reports} icon={<Assignment />} color={COLORS.orange} onClick={() => setStatusFilter('All')} />
                <StatCard title="Open Reports" value={statsData?.stats?.open_reports} sub="Unresolved" icon={<ErrorOutline />} color={COLORS.red} onClick={() => setStatusFilter('Open')} />
                <StatCard title="Under Review" value={statsData?.stats?.under_review} icon={<History />} color={COLORS.amber} onClick={() => setStatusFilter('Under Review')} />
                <StatCard title="Resolved" value={statsData?.stats?.resolved} icon={<CheckCircle />} color={COLORS.green} onClick={() => setStatusFilter('Resolved')} />
                <StatCard title="Total Est. Cost" value={`৳${statsData?.stats?.total_cost?.toLocaleString()}`} sub="Across all reports" icon={<MonetizationOn />} color={COLORS.red} />
                <StatCard title="Repeat Vehicles" value={statsData?.stats?.repeat_offenders} sub="Damaged 2+ times" icon={<DirectionsCar />} color={COLORS.purple} onClick={() => setShowRepeats(true)} />
            </Grid>

            {/* 2. Alert Banners */}
            <Stack spacing={2} mb={4}>
                {statsData?.banners?.severe_open > 0 && (
                    <Alert severity="error" icon={<Warning />} sx={{ borderRadius: 4, bgcolor: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', fontWeight: '600' }}
                        action={<Button color="inherit" size="small" onClick={() => { setSeverityFilter('Severe'); setStatusFilter('Open'); }}>Review Now →</Button>}>
                        🔴 {statsData.banners.severe_open} severe damage reports are still Open and require immediate attention.
                    </Alert>
                )}
                {statsData?.banners?.stale_review > 0 && (
                    <Alert severity="warning" sx={{ borderRadius: 4, bgcolor: '#fffbeb', border: '1px solid #fef3c7', color: '#92400e', fontWeight: '600' }}
                        action={<Button color="inherit" size="small" onClick={() => setStatusFilter('Under Review')}>Review Now →</Button>}>
                        ⚠️ {statsData.banners.stale_review} reports have been Under Review for more than 7 days without resolution.
                    </Alert>
                )}
                {statsData?.banners?.missing_cost > 0 && (
                    <Alert severity="info" icon={<MonetizationOn />} sx={{ borderRadius: 4, bgcolor: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', fontWeight: '600' }}
                        action={<Button color="inherit" size="small" onClick={() => { /* Apply missing cost filter */ }}>Update Now →</Button>}>
                        🟠 {statsData.banners.missing_cost} damage reports are missing cost estimates.
                    </Alert>
                )}
            </Stack>

            {/* 3. Filters & Table */}
            <Paper sx={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #f1f5f9', mb: 4 }}>
                <Box p={3} borderBottom="1px solid #f1f5f9">
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <TextField fullWidth placeholder="Search by ID, vehicle, reporter..." size="small" value={search} onChange={(e) => setSearch(e.target.value)}
                                InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />, sx: { borderRadius: 3 } }} />
                        </Grid>
                        <Grid item xs={6} md={1.5}>
                            <FormControl fullWidth size="small">
                                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ borderRadius: 3 }}>
                                    <MenuItem value="All">All Status</MenuItem>
                                    <MenuItem value="Open">Open</MenuItem>
                                    <MenuItem value="Under Review">Under Review</MenuItem>
                                    <MenuItem value="Resolved">Resolved</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} md={1.5}>
                            <FormControl fullWidth size="small">
                                <Select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} sx={{ borderRadius: 3 }}>
                                    <MenuItem value="All">All Severity</MenuItem>
                                    <MenuItem value="Minor">Minor</MenuItem>
                                    <MenuItem value="Moderate">Moderate</MenuItem>
                                    <MenuItem value="Severe">Severe</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Stack direction="row" spacing={1}>
                                <Button variant="outlined" startIcon={<FilterList />} sx={{ borderRadius: 3, textTransform: 'none', color: '#64748b', borderColor: '#e2e8f0' }}>Filters</Button>
                                <Button variant="outlined" startIcon={<Download />} sx={{ borderRadius: 3, textTransform: 'none', color: '#64748b', borderColor: '#e2e8f0' }}>Export</Button>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={3} textAlign="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button onClick={() => setShowAnalytics(!showAnalytics)} variant={showAnalytics ? 'contained' : 'outlined'} sx={{ borderRadius: 3, bgcolor: showAnalytics ? COLORS.orange : 'transparent' }}>{showAnalytics ? 'Hide Analytics' : 'Show Analytics'}</Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>

                <Box p={2} bgcolor="#f8fafc" display="flex" gap={1} overflow="auto">
                    {['All Reports', 'Open', 'Under Review', 'Resolved', 'Severe Only'].map(pill => (
                        <Chip key={pill} label={pill} onClick={() => setStatusFilter(pill === 'All Reports' ? 'All' : pill === 'Severe Only' ? 'All' : pill)} 
                            sx={{ borderRadius: 3, bgcolor: (statusFilter === pill || (pill === 'All Reports' && statusFilter === 'All')) ? COLORS.orange : '#fff', color: (statusFilter === pill || (pill === 'All Reports' && statusFilter === 'All')) ? '#fff' : '#64748b', border: '1px solid #e2e8f0', '&:hover': { bgcolor: COLORS.orange, color: '#fff' } }} />
                    ))}
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell padding="checkbox"><Checkbox checked={selectedReports.length === reportsData?.reports.length} onChange={handleSelectAll} /></TableCell>
                                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Report ID</TableCell>
                                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Vehicle</TableCell>
                                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Agency</TableCell>
                                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Booking</TableCell>
                                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Reported By</TableCell>
                                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Severity</TableCell>
                                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Est. Cost</TableCell>
                                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Status</TableCell>
                                <TableCell align="right" sx={{ fontWeight: '700', color: '#475569' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={11} align="center" sx={{ py: 10 }}><LinearProgress color="warning" sx={{ width: '50%', mx: 'auto', borderRadius: 2 }} /></TableCell></TableRow>
                            ) : reportsData?.reports.map((report) => (
                                <ReportRow key={report.damage_id} report={report} onDetail={() => setDetailId(report.damage_id)} onUpdate={() => setUpdateId(report.damage_id)} onAdvance={() => handleAdvanceStatus(report)} onSelect={() => handleSelect(report.damage_id)} selected={selectedReports.includes(report.damage_id)} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination rowsPerPageOptions={[10, 25, 50]} component="div" count={reportsData?.total || 0} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, p) => setPage(p)} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))} />
            </Paper>

            {/* 4. Analytics Panel */}
            {showAnalytics && <AnalyticsPanel data={analyticsData} />}

            {/* 5. Modals */}
            <DetailModal id={detailId} onClose={() => setDetailId(null)} />
            <UpdateModal id={updateId} onClose={() => setUpdateId(null)} onSave={(data) => updateStatusMutation.mutate({ id: updateId, data })} isLoading={updateStatusMutation.isLoading} />
        </Box>
    );
};

// --- Sub-components ---

const StatCard = ({ title, value, sub, icon, color, onClick }) => (
    <Grid item xs={6} md={2}>
        <Card onClick={onClick} sx={{ borderRadius: 5, border: '1px solid #f1f5f9', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s', '&:hover': onClick ? { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' } : {} }}>
            <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Box sx={{ bgcolor: `${color}15`, color: color, p: 1, borderRadius: 3, display: 'flex' }}>{icon}</Box>
                    <Typography variant="caption" fontWeight="700" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Typography>
                </Box>
                <Typography variant="h5" fontWeight="900" sx={{ color: '#1e293b' }}>{value}</Typography>
                {sub && <Typography variant="caption" color="textSecondary">{sub}</Typography>}
            </CardContent>
        </Card>
    </Grid>
);

const ReportRow = ({ report, onDetail, onUpdate, onAdvance, onSelect, selected }) => {
    const sev = SEVERITY_MAP[report.severity];
    const stat = STATUS_MAP[report.status];
    const isSevereOpen = report.severity === 'High' && report.status === 'Pending';

    return (
        <TableRow hover sx={{ borderLeft: isSevereOpen ? `4px solid ${COLORS.red}` : report.vehicle_damage_count > 1 ? `4px solid ${COLORS.purple}` : 'none' }}>
            <TableCell padding="checkbox"><Checkbox checked={selected} onClick={onSelect} /></TableCell>
            <TableCell>
                <Tooltip title={report.damage_id}>
                    <Typography variant="body2" fontWeight="700" sx={{ color: COLORS.orange, cursor: 'pointer' }}>#{report.damage_id.substring(0, 8)}</Typography>
                </Tooltip>
            </TableCell>
            <TableCell>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar src={report.car_image} variant="rounded" sx={{ width: 40, height: 40, bgcolor: '#f1f5f9' }} />
                    <Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <Typography variant="body2" fontWeight="700">{report.brand} {report.model}</Typography>
                            {report.vehicle_damage_count > 1 && <Tooltip title="Repeat Offender"><Box component="span" sx={{ color: COLORS.purple, fontSize: 16 }}>🔁</Box></Tooltip>}
                        </Box>
                        <Typography variant="caption" color="textSecondary">{report.car_type}</Typography>
                    </Box>
                </Box>
            </TableCell>
            <TableCell><Typography variant="body2" sx={{ color: COLORS.orange }}>{report.agency_name}</Typography></TableCell>
            <TableCell>
                <Typography variant="body2" fontWeight="600">#{report.booking_id.substring(0, 8)}</Typography>
                <Typography variant="caption" color="textSecondary">{moment(report.start_ts).format('MMM DD')} → {moment(report.end_ts).format('MMM DD')}</Typography>
            </TableCell>
            <TableCell>
                <Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="body2" fontWeight="600">{report.reporter_name}</Typography>
                        <Chip label={report.reporter_role === 'user' ? 'Customer' : report.reporter_role} size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#f1f5f9' }} />
                    </Box>
                    <Typography variant="caption" color="textSecondary">{report.reporter_phone}</Typography>
                </Box>
            </TableCell>
            <TableCell>
                <Typography variant="body2">{moment(report.report_date).format('MMM DD, YYYY')}</Typography>
                <Typography variant="caption" color="textSecondary">{moment(report.report_date).fromNow()}</Typography>
            </TableCell>
            <TableCell>
                <Chip icon={<span style={{ color: sev.color }}>{sev.icon}</span>} label={sev.label} size="small" sx={{ bgcolor: `${sev.color}15`, color: sev.color, fontWeight: 'bold' }} />
            </TableCell>
            <TableCell>
                <Typography variant="body2" fontWeight="700" color={!report.estimated_cost ? COLORS.red : 'inherit'}>
                    {report.estimated_cost ? `৳${report.estimated_cost.toLocaleString()}` : 'Not Set'}
                </Typography>
            </TableCell>
            <TableCell>
                <Chip label={stat.label} size="small" sx={{ bgcolor: `${stat.color}15`, color: stat.color, fontWeight: 'bold' }} />
            </TableCell>
            <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title="View Detail"><IconButton size="small" onClick={onDetail}><Visibility fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Edit Status"><IconButton size="small" onClick={onUpdate}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Advance Status"><IconButton size="small" onClick={onAdvance} disabled={report.status === 'Resolved'}><Forward fontSize="small" /></IconButton></Tooltip>
                </Stack>
            </TableCell>
        </TableRow>
    );
};

const DetailModal = ({ id, onClose }) => {
    const axiosPublic = useAxiosPublic();
    const [tab, setTab] = useState(0);

    const { data: detail, isLoading } = useQuery({
        queryKey: ['damage-detail', id],
        queryFn: async () => {
            const res = await axiosPublic.get(`/admin-damage/detail/${id}`);
            return res.data;
        },
        enabled: !!id
    });

    if (!id) return null;

    const report = detail?.report;
    const stats = detail?.reporterStats;

    return (
        <Dialog open={!!id} onClose={onClose} maxWidth="lg" fullWidth scroll="paper" PaperProps={{ sx: { borderRadius: 6 } }}>
            <DialogTitle sx={{ p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" fontWeight="800">Damage Report #{id}</Typography>
                    <Typography variant="caption" color="textSecondary">Reported on {moment(report?.report_date).format('MMMM DD, YYYY')}</Typography>
                </Box>
                <IconButton onClick={onClose}><Close /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
                {isLoading ? (
                    <Box p={10} textAlign="center"><LinearProgress color="warning" /></Box>
                ) : (
                    <Box>
                        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ px: 3, borderBottom: '1px solid #f1f5f9', '& .MuiTab-root': { py: 2, fontWeight: '700' } }}>
                            <Tab label="Report Overview" icon={<Assignment fontSize="small" />} iconPosition="start" />
                            <Tab label="Vehicle Info" icon={<DirectionsCar fontSize="small" />} iconPosition="start" />
                            <Tab label="Booking Context" icon={<CalendarToday fontSize="small" />} iconPosition="start" />
                            <Tab label="Reporter Info" icon={<Person fontSize="small" />} iconPosition="start" />
                            <Tab label="Cost & Resolution" icon={<MonetizationOn fontSize="small" />} iconPosition="start" />
                        </Tabs>

                        <Box p={4} sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {tab === 0 && <ReportOverviewTab report={report} />}
                            {tab === 1 && <VehicleInfoTab report={report} history={detail?.history} />}
                            {tab === 2 && <BookingContextTab report={report} />}
                            {tab === 3 && <ReporterInfoTab report={report} stats={stats} />}
                            {tab === 4 && <CostResolutionTab report={report} payments={detail?.payments} />}
                        </Box>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

const ReportOverviewTab = ({ report }) => {
    const sev = SEVERITY_MAP[report.severity];
    const stat = STATUS_MAP[report.status];
    
    return (
        <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
                <Box display="flex" gap={2} mb={4}>
                    <Chip label={sev.label} sx={{ bgcolor: sev.color, color: '#fff', fontWeight: 'bold' }} />
                    <Chip label={stat.label} sx={{ bgcolor: stat.color, color: '#fff', fontWeight: 'bold' }} />
                </Box>
                
                <Box mb={4}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>DAMAGE TYPE</Typography>
                    <Typography variant="h5" fontWeight="800" color="primary">{report.damage_type}</Typography>
                </Box>

                <Box mb={4}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>DESCRIPTION</Typography>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: '#f8fafc' }}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{report.description}</Typography>
                    </Paper>
                </Box>

                <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>PHOTOS GALLERY</Typography>
                    {report.photos ? (
                        <Grid container spacing={2}>
                            {report.photos.split(',').map((url, i) => (
                                <Grid item xs={4} key={i}>
                                    <Avatar src={url} variant="rounded" sx={{ width: '100%', height: 200, cursor: 'pointer' }} onClick={() => window.open(url)} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : <Typography color="textSecondary">No photos attached</Typography>}
                </Box>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 5, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>ESTIMATED REPAIR COST</Typography>
                        <Typography variant="h4" fontWeight="900" color={COLORS.red}>
                            {report.estimated_cost ? `৳${report.estimated_cost.toLocaleString()}` : 'Not Set'}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={2}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="textSecondary">Days since report</Typography>
                                <Typography variant="body2" fontWeight="700">{moment().diff(moment(report.report_date), 'days')} days</Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

const VehicleInfoTab = ({ report, history }) => (
    <Box>
        <Grid container spacing={4} mb={6}>
            <Grid item xs={12} md={4}>
                <Avatar src={report.images?.[0]} variant="rounded" sx={{ width: '100%', height: 200, mb: 2 }} />
            </Grid>
            <Grid item xs={12} md={8}>
                <Typography variant="h5" fontWeight="800" gutterBottom>{report.brand} {report.model} ({report.build_year})</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">TYPE</Typography><Typography fontWeight="700">{report.car_type}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">AGENCY</Typography><Typography fontWeight="700" color="primary">{report.agency_name}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">STATUS</Typography><Chip label={report.car_status} size="small" /></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">RATING</Typography><Typography fontWeight="700">⭐ {report.car_rating}</Typography></Grid>
                </Grid>
            </Grid>
        </Grid>

        <Typography variant="h6" fontWeight="800" mb={3}>Vehicle Damage History</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 4 }}>
            <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Severity</TableCell>
                        <TableCell>Cost</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {history?.map(h => (
                        <TableRow key={h.damage_id} sx={{ bgcolor: h.damage_id === report.damage_id ? '#fff7ed' : 'transparent' }}>
                            <TableCell>{moment(h.report_date).format('MMM DD, YYYY')}</TableCell>
                            <TableCell>{h.damage_type}</TableCell>
                            <TableCell><Chip label={SEVERITY_MAP[h.severity]?.label} size="small" variant="outlined" /></TableCell>
                            <TableCell>৳{h.estimated_cost?.toLocaleString()}</TableCell>
                            <TableCell><Chip label={STATUS_MAP[h.status]?.label} size="small" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Box>
);

const BookingContextTab = ({ report }) => (
    <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>BOOKING ID</Typography>
            <Typography variant="h6" fontWeight="800" gutterBottom>#{report.booking_id}</Typography>
            <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between">
                    <Typography color="textSecondary">Trip Period</Typography>
                    <Typography fontWeight="700">{moment(report.start_ts).format('MMM DD')} - {moment(report.end_ts).format('MMM DD, YYYY')}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                    <Typography color="textSecondary">Total Duration</Typography>
                    <Typography fontWeight="700">{report.total_rent_hours} Hours</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                    <Typography color="textSecondary">Purpose</Typography>
                    <Typography fontWeight="700">{report.booking_purpose}</Typography>
                </Box>
            </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>CUSTOMER</Typography>
            <Box display="flex" alignItems="center" gap={2} mb={4}>
                <Avatar sx={{ bgcolor: COLORS.orange }}>{report.customer_name?.[0]}</Avatar>
                <Box>
                    <Typography fontWeight="800">{report.customer_name}</Typography>
                    <Typography variant="caption" color="textSecondary">{report.customer_phone}</Typography>
                </Box>
            </Box>
            {report.driver_name && (
                <>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>DRIVER</Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: COLORS.purple }}>{report.driver_name?.[0]}</Avatar>
                        <Box>
                            <Typography fontWeight="800">{report.driver_name}</Typography>
                            <Typography variant="caption" color="textSecondary">{report.driver_phone}</Typography>
                        </Box>
                    </Box>
                </>
            )}
        </Grid>
    </Grid>
);

const ReporterInfoTab = ({ report, stats }) => (
    <Box>
        <Box display="flex" alignItems="center" gap={3} mb={6}>
            <Avatar src={report.reporter_photo} sx={{ width: 100, height: 100 }} />
            <Box>
                <Typography variant="h5" fontWeight="900">{report.reporter_name}</Typography>
                <Typography color="textSecondary">{report.reporter_email}</Typography>
                <Stack direction="row" spacing={1} mt={1}>
                    <Chip label={report.reporter_role} size="small" />
                    <Chip label={report.reporter_verified ? "Verified" : "Unverified"} size="small" color={report.reporter_verified ? "success" : "default"} />
                </Stack>
            </Box>
        </Box>
        <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary">REPORTS SUBMITTED</Typography>
                    <Typography variant="h4" fontWeight="900">{stats?.total_reports}</Typography>
                </Paper>
            </Grid>
        </Grid>
    </Box>
);

const CostResolutionTab = ({ report, payments }) => (
    <Box>
        <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
                <Typography variant="h6" fontWeight="800" mb={3}>Resolution Process</Typography>
                <TextField fullWidth multiline rows={6} placeholder="Describe how the damage was resolved..." sx={{ mb: 3 }} />
                <Button variant="contained" size="large" sx={{ bgcolor: COLORS.green, '&:hover': { bgcolor: '#16a34a' }, borderRadius: 3, px: 6 }}>
                    Mark as Resolved
                </Button>
            </Grid>
            <Grid item xs={12} md={5}>
                <Card variant="outlined" sx={{ borderRadius: 5 }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>LINKED PAYMENTS</Typography>
                        {payments?.length > 0 ? (
                            <Stack spacing={2}>
                                {payments.map(p => (
                                    <Box key={p.payment_id} display="flex" justifyContent="space-between" p={2} bgcolor="#f8fafc" borderRadius={3}>
                                        <Box>
                                            <Typography variant="body2" fontWeight="700">৳{p.amount.toLocaleString()}</Typography>
                                            <Typography variant="caption" color="textSecondary">{p.payment_for}</Typography>
                                        </Box>
                                        <Chip label={moment(p.date).format('MMM DD')} size="small" />
                                    </Box>
                                ))}
                            </Stack>
                        ) : <Typography color="textSecondary">No damage payments recorded yet</Typography>}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </Box>
);

const UpdateModal = ({ id, onClose, onSave, isLoading }) => {
    const [status, setStatus] = useState('Open');
    const [cost, setCost] = useState('');
    const [notes, setNotes] = useState('');

    return (
        <Dialog open={!!id} onClose={onClose} PaperProps={{ sx: { borderRadius: 6, width: 450 } }}>
            <DialogTitle sx={{ fontWeight: '800' }}>Update Report Status</DialogTitle>
            <DialogContent>
                <Stack spacing={3} mt={1}>
                    <FormControl fullWidth>
                        <Typography variant="caption" color="textSecondary" gutterBottom>STATUS</Typography>
                        <Select value={status} onChange={(e) => setStatus(e.target.value)} size="small" sx={{ borderRadius: 3 }}>
                            <MenuItem value="Open">Open</MenuItem>
                            <MenuItem value="Under Review">Under Review</MenuItem>
                            <MenuItem value="Resolved">Resolved</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField fullWidth label="Estimated Cost (BDT)" type="number" value={cost} onChange={(e) => setCost(e.target.value)} size="small" InputProps={{ sx: { borderRadius: 3 } }} />
                    <TextField fullWidth label="Admin Notes" multiline rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} size="small" InputProps={{ sx: { borderRadius: 3 } }} />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
                <Button variant="contained" onClick={() => onSave({ status, estimated_cost: cost, admin_notes: notes })} disabled={isLoading} sx={{ bgcolor: COLORS.orange, borderRadius: 3, px: 4 }}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const AnalyticsPanel = ({ data }) => {
    if (!data) return <LinearProgress color="warning" sx={{ mb: 4, borderRadius: 2 }} />;

    return (
        <Grid container spacing={3} mb={4}>
            <Grid item xs={12}>
                <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" fontWeight="800" mb={4}>Damage Reports Over Time</Typography>
                    <Box height={300}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.reportsOverTime}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <ChartTooltip />
                                <Legend />
                                <Bar dataKey="minor" stackId="a" fill={COLORS.green} name="Minor" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="moderate" stackId="a" fill={COLORS.amber} name="Moderate" />
                                <Bar dataKey="severe" stackId="a" fill={COLORS.red} name="Severe" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" fontWeight="800" mb={4}>Reports by Severity</Typography>
                    <Box height={300}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data.severityDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count" nameKey="severity">
                                    <Cell fill={COLORS.green} />
                                    <Cell fill={COLORS.amber} />
                                    <Cell fill={COLORS.red} />
                                </Pie>
                                <ChartTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" fontWeight="800" mb={4}>Status Distribution</Typography>
                    <Box height={300}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data.statusDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count" nameKey="status">
                                    <Cell fill={COLORS.red} />
                                    <Cell fill={COLORS.amber} />
                                    <Cell fill={COLORS.green} />
                                </Pie>
                                <ChartTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default AdminDamageReports;
