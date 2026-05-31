import { useState, useEffect } from 'react';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TablePagination, IconButton, Chip, Typography, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Grid, Card, CardContent, Alert, AlertTitle, Avatar, Divider, tableCellClasses, Stack, Checkbox, LinearProgress} from '@mui/material';
import { Delete, Search, Download, Person, Business, DirectionsCar, 
    Visibility,  Close, LocationOn, Map as MapIcon, Verified, Public } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

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

// Custom map markers
const createIcon = (color) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const icons = {
    blue: createIcon('blue'),
    orange: createIcon('orange'),
    green: createIcon('green'), // using green for teal
    red: createIcon('red'),
    violet: createIcon('violet')
};

const MapBoundsUpdater = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
        if (markers && markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [markers, map]);
    return null;
};

const AdminAddress = () => {
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(0); // 0: List, 1: Map
    
    // Filters & Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [cityFilter, setCityFilter] = useState('All');
    const [linkedToFilter, setLinkedToFilter] = useState('All');
    const [geomFilter, setGeomFilter] = useState('All');
    const [placeIdFilter, setPlaceIdFilter] = useState('All');
    const [quickFilter, setQuickFilter] = useState('All Addresses');
    const [mapFilter, setMapFilter] = useState('All');
    
    // UI States
    const [selectedAddresses, setSelectedAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

    // Queries
    const { data: stats } = useQuery({
        queryKey: ['admin-address-stats'],
        queryFn: async () => {
            const res = await axiosPublic.get('addressRoutes/admin/stats');
            return res.data;
        }
    });

    const { data: cities } = useQuery({
        queryKey: ['admin-address-cities'],
        queryFn: async () => {
            const res = await axiosPublic.get('addressRoutes/admin/cities');
            return res.data;
        }
    });

    const { data: addressData, isLoading } = useQuery({
        queryKey: ['admin-address-list', page, rowsPerPage, search, cityFilter, linkedToFilter, geomFilter, placeIdFilter, quickFilter],
        queryFn: async () => {
            const params = {
                page: page + 1, limit: rowsPerPage, search, city: cityFilter, 
                linkedTo: linkedToFilter, hasGeom: geomFilter, hasPlaceId: placeIdFilter, quickFilter
            };
            const res = await axiosPublic.get('addressRoutes/admin/list', { params });
            return res.data;
        }
    });

    const { data: mapData } = useQuery({
        queryKey: ['admin-address-map'],
        queryFn: async () => {
            const res = await axiosPublic.get('addressRoutes/admin/map');
            return res.data;
        },
        enabled: activeTab === 1
    });

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: async (ids) => {
            return await axiosPublic.post('addressRoutes/admin/delete-bulk', { addressIds: ids });
        },
        onSuccess: () => {
            toast.success('Addresses deleted successfully');
            queryClient.invalidateQueries(['admin-address-list']);
            queryClient.invalidateQueries(['admin-address-stats']);
            queryClient.invalidateQueries(['admin-address-map']);
            setSelectedAddresses([]);
            setIsDeleteOpen(false);
            setIsBulkDeleteOpen(false);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to delete addresses');
        }
    });

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedAddresses(addressData?.addresses.map(a => a.address_id) || []);
        } else {
            setSelectedAddresses([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedAddresses(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleExportCSV = () => {
        if (!addressData?.addresses) return;
        const headers = ["ID", "Display Name", "City", "Area", "Postcode", "Coordinates", "Has Geom", "Has Place ID"];
        const rows = addressData.addresses.map(a => [
            a.address_id,
            `"${a.display_name || ''}"`,
            `"${a.city || ''}"`,
            `"${a.area || ''}"`,
            a.postcode || '',
            `${a.latitude}, ${a.longitude}`,
            a.has_geom ? 'Yes' : 'No',
            a.place_id ? 'Yes' : 'No'
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `address_export.csv`;
        a.click();
    };

    const isOrphanedFilter = quickFilter === 'Orphaned' || linkedToFilter === 'Orphaned';

    const getRowColorClass = (row) => {
        const u = row.linked_users?.length > 0;
        const a = row.linked_agencies?.length > 0;
        const d = row.linked_drivers?.length > 0;
        const orphaned = !u && !a && !d;
        
        if (orphaned) return { border: '#ef4444', bg: '#fef2f2' };
        if (!row.has_geom) return { border: '#f59e0b', bg: '#fffbeb' };
        if (a) return { border: '#F97316', bg: 'inherit' };
        if (d) return { border: '#14b8a6', bg: 'inherit' };
        if (u) return { border: '#3b82f6', bg: 'inherit' };
        return { border: 'transparent', bg: 'inherit' };
    };

    const getFilteredMapPins = () => {
        if (!mapData) return [];
        if (mapFilter === 'All') return mapData;
        if (mapFilter === 'Users') return mapData.filter(m => m.types.includes('user'));
        if (mapFilter === 'Agencies') return mapData.filter(m => m.types.includes('agency'));
        if (mapFilter === 'Drivers') return mapData.filter(m => m.types.includes('driver'));
        if (mapFilter === 'Orphaned') return mapData.filter(m => m.type === 'orphaned');
        return mapData;
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', mx: 'auto' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>Address Management</Typography>
            </Stack>

            {/* Alert Banners */}
            {stats?.orphanedAddresses > 0 && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} action={
                    <Button color="inherit" size="small" onClick={() => { setActiveTab(0); setQuickFilter('Orphaned'); }}>
                        Clean up now →
                    </Button>
                }>
                    <AlertTitle>Orphaned Addresses Detected</AlertTitle>
                    🔴 <strong>{stats.orphanedAddresses}</strong> orphaned addresses found that are not linked to any user, agency, or driver.
                </Alert>
            )}

            {/* Stat Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Addresses', value: stats?.totalAddresses || 0, color: '#F97316' },
                    { label: 'User Addresses', value: stats?.userAddresses || 0, color: '#3b82f6' },
                    { label: 'Agency Addresses', value: stats?.agencyAddresses || 0, color: '#F97316' },
                    { label: 'Driver Addresses', value: stats?.driverAddresses || 0, color: '#14b8a6' },
                    { label: 'Orphaned Addresses', value: stats?.orphanedAddresses || 0, color: '#ef4444', filter: 'Orphaned' },
                    { label: 'Unique Cities', value: stats?.uniqueCities || 0, color: '#8b5cf6' },
                ].map((s, i) => (
                    <Grid item xs={12} sm={6} md={2} key={i}>
                        <Card 
                            sx={{ cursor: 'pointer', transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }, borderLeft: `4px solid ${s.color}` }}
                            onClick={() => { setActiveTab(0); if (s.filter) setQuickFilter(s.filter); else setQuickFilter('All Addresses'); }}
                        >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Typography variant="caption" color="textSecondary" fontWeight="bold">{s.label}</Typography>
                                <Typography variant="h5" fontWeight="bold" sx={{ color: s.color, mt: 1 }}>{s.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} TabIndicatorProps={{ style: { backgroundColor: '#F97316' } }}>
                    <Tab label="📋 Address List" sx={{ fontWeight: 'bold', '&.Mui-selected': { color: '#F97316' } }} />
                    <Tab label="🗺️ Map View" sx={{ fontWeight: 'bold', '&.Mui-selected': { color: '#F97316' } }} />
                </Tabs>
            </Box>

            {activeTab === 0 ? (
                /* LIST TAB */
                <Box>
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                                <TextField fullWidth size="small" placeholder="Search display name, city, area..." value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'gray' }}/> }} />
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>City</InputLabel>
                                    <Select value={cityFilter} label="City" onChange={e => setCityFilter(e.target.value)}>
                                        <MenuItem value="All">All Cities</MenuItem>
                                        {cities?.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Linked To</InputLabel>
                                    <Select value={linkedToFilter} label="Linked To" onChange={e => setLinkedToFilter(e.target.value)}>
                                        <MenuItem value="All">All</MenuItem>
                                        <MenuItem value="User">User</MenuItem>
                                        <MenuItem value="Agency">Agency</MenuItem>
                                        <MenuItem value="Driver">Driver</MenuItem>
                                        <MenuItem value="Orphaned">Orphaned</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Has Geometry</InputLabel>
                                    <Select value={geomFilter} label="Has Geometry" onChange={e => setGeomFilter(e.target.value)}>
                                        <MenuItem value="All">All</MenuItem>
                                        <MenuItem value="Has Geom">Has Geom</MenuItem>
                                        <MenuItem value="Missing Geom">Missing Geom</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Place ID</InputLabel>
                                    <Select value={placeIdFilter} label="Place ID" onChange={e => setPlaceIdFilter(e.target.value)}>
                                        <MenuItem value="All">All</MenuItem>
                                        <MenuItem value="Has Place ID">Has Place ID</MenuItem>
                                        <MenuItem value="Missing Place ID">Missing Place ID</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={1}>
                                <Button variant="outlined" fullWidth onClick={handleExportCSV} sx={{ color: '#F97316', borderColor: '#F97316' }}><Download /></Button>
                            </Grid>
                        </Grid>

                        <Stack direction="row" spacing={1} mt={2} sx={{ overflowX: 'auto', pb: 1 }}>
                            {['All Addresses', 'User Addresses', 'Agency Addresses', 'Driver Addresses', 'Orphaned', 'Missing Geom', 'Missing Place ID', 'Dhaka'].map(pill => (
                                <Chip 
                                    key={pill} label={pill} 
                                    onClick={() => setQuickFilter(quickFilter === pill ? 'All Addresses' : pill)}
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        bgcolor: quickFilter === pill ? (pill === 'Orphaned' ? '#ef4444' : '#F97316') : 'transparent',
                                        color: quickFilter === pill ? '#fff' : (pill === 'Orphaned' ? '#ef4444' : 'inherit'),
                                        border: '1px solid',
                                        borderColor: quickFilter === pill ? 'transparent' : (pill === 'Orphaned' ? '#ef4444' : '#ddd')
                                    }}
                                />
                            ))}
                        </Stack>
                    </Paper>

                    {/* Bulk Action Bar for Orphaned */}
                    {isOrphanedFilter && selectedAddresses.length > 0 && (
                        <Paper sx={{ p: 2, mb: 3, bgcolor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="bold" color="#ef4444">{selectedAddresses.length} orphaned addresses selected</Typography>
                            <Stack direction="row" spacing={2}>
                                <Button size="small" variant="contained" color="error" startIcon={<Delete />} onClick={() => setIsBulkDeleteOpen(true)}>Delete Selected</Button>
                                <Button size="small" onClick={() => setSelectedAddresses([])}>Deselect All</Button>
                            </Stack>
                        </Paper>
                    )}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {isOrphanedFilter && (
                                        <StyledTableCell padding="checkbox">
                                            <Checkbox 
                                                checked={selectedAddresses.length > 0 && selectedAddresses.length === addressData?.addresses?.length}
                                                onChange={handleSelectAll} sx={{ color: 'white' }}
                                            />
                                        </StyledTableCell>
                                    )}
                                    <StyledTableCell>ID</StyledTableCell>
                                    <StyledTableCell>City/Area</StyledTableCell>
                                    <StyledTableCell>Coordinates</StyledTableCell>
                                    <StyledTableCell>Linked To</StyledTableCell>
                                    <StyledTableCell>Status</StyledTableCell>
                                    <StyledTableCell align="right">Action</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={isOrphanedFilter ? 7 : 6} align="center"><LinearProgress sx={{ my: 4, width: '50%', mx: 'auto' }}/></TableCell></TableRow>
                                ) : addressData?.addresses?.map((row) => {
                                    const colors = getRowColorClass(row);
                                    const uCount = row.linked_users?.length || 0;
                                    const aCount = row.linked_agencies?.length || 0;
                                    const dCount = row.linked_drivers?.length || 0;
                                    const orphaned = uCount + aCount + dCount === 0;

                                    return (
                                        <TableRow key={row.address_id} hover sx={{ borderLeft: `4px solid ${colors.border}`, bgcolor: colors.bg }}>
                                            {isOrphanedFilter && (
                                                <TableCell padding="checkbox">
                                                    <Checkbox checked={selectedAddresses.includes(row.address_id)} onChange={() => handleSelectOne(row.address_id)} />
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748b' }}>{row.address_id.substring(0,8)}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">{row.city || '—'}, {row.area || '—'}</Typography>
                                                <Typography variant="caption" color="textSecondary" display="block">
                                                    {row.display_name ? (row.display_name.length > 50 ? row.display_name.substring(0, 50) + '...' : row.display_name) : 'No display name'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <LocationOn sx={{ fontSize: 14, color: '#F97316' }} />
                                                    <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => window.open(`https://maps.google.com/?q=${row.latitude},${row.longitude}`)}>
                                                        {parseFloat(row.latitude).toFixed(4)}, {parseFloat(row.longitude).toFixed(4)}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1}>
                                                    {orphaned && <Chip label="Orphaned" size="small" sx={{ bgcolor: '#fef2f2', color: '#ef4444', fontWeight: 'bold' }} />}
                                                    {uCount > 0 && <Chip icon={<Person />} label={uCount === 1 ? row.linked_users[0].name : `${uCount} Users`} size="small" sx={{ bgcolor: '#eff6ff', color: '#3b82f6' }} />}
                                                    {aCount > 0 && <Chip icon={<Business />} label={aCount === 1 ? row.linked_agencies[0].name : `${aCount} Agencies`} size="small" sx={{ bgcolor: '#fff7ed', color: '#F97316' }} />}
                                                    {dCount > 0 && <Chip icon={<DirectionsCar />} label={dCount === 1 ? row.linked_drivers[0].name : `${dCount} Drivers`} size="small" sx={{ bgcolor: '#f0fdfa', color: '#14b8a6' }} />}
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1}>
                                                    <Chip label="Geom" size="small" variant="outlined" color={row.has_geom ? "success" : "error"} />
                                                    <Chip label="Place ID" size="small" variant="outlined" color={row.place_id ? "success" : "error"} />
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" justifyContent="flex-end">
                                                    <IconButton size="small" color="info" onClick={() => window.open(`https://maps.google.com/?q=${row.latitude},${row.longitude}`)}><MapIcon fontSize="small" /></IconButton>
                                                    <IconButton size="small" sx={{ color: '#F97316' }} onClick={() => { setSelectedAddress(row); setIsDetailOpen(true); }}><Visibility fontSize="small" /></IconButton>
                                                    <IconButton size="small" color="error" disabled={!orphaned} onClick={() => { setSelectedAddress(row); setIsDeleteOpen(true); }}><Delete fontSize="small" /></IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]} component="div" count={addressData?.total || 0} rowsPerPage={rowsPerPage} page={page}
                            onPageChange={(e, v) => setPage(v)} onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        />
                    </TableContainer>
                </Box>
            ) : (
                /* MAP TAB */
                <Paper sx={{ height: '70vh', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: 10, left: 50, zIndex: 1000, bgcolor: 'white', p: 1, borderRadius: 2, boxShadow: 3 }}>
                        <Stack direction="row" spacing={1}>
                            {['All', 'Users', 'Agencies', 'Drivers', 'Orphaned'].map(f => (
                                <Button 
                                    key={f} size="small" variant={mapFilter === f ? "contained" : "outlined"}
                                    onClick={() => setMapFilter(f)}
                                    sx={{ 
                                        bgcolor: mapFilter === f ? (f === 'Orphaned' ? '#ef4444' : f === 'Users' ? '#3b82f6' : f === 'Drivers' ? '#14b8a6' : '#F97316') : 'transparent',
                                        color: mapFilter === f ? 'white' : 'inherit',
                                        borderColor: '#ccc'
                                    }}
                                >
                                    {f}
                                </Button>
                            ))}
                        </Stack>
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: 20, right: 10, zIndex: 1000, bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 3 }}>
                        <Typography variant="subtitle2" fontWeight="bold">Legend</Typography>
                        <Stack spacing={0.5} mt={1}>
                            <Box display="flex" alignItems="center" gap={1}><Box width={12} height={12} borderRadius="50%" bgcolor="#3b82f6"/> <Typography variant="caption">User</Typography></Box>
                            <Box display="flex" alignItems="center" gap={1}><Box width={12} height={12} borderRadius="50%" bgcolor="#F97316"/> <Typography variant="caption">Agency</Typography></Box>
                            <Box display="flex" alignItems="center" gap={1}><Box width={12} height={12} borderRadius="50%" bgcolor="#14b8a6"/> <Typography variant="caption">Driver</Typography></Box>
                            <Box display="flex" alignItems="center" gap={1}><Box width={12} height={12} borderRadius="50%" bgcolor="#ef4444"/> <Typography variant="caption">Orphaned</Typography></Box>
                            <Box display="flex" alignItems="center" gap={1}><Box width={12} height={12} borderRadius="50%" bgcolor="#8b5cf6"/> <Typography variant="caption">Multiple Types</Typography></Box>
                        </Stack>
                    </Box>

                    {mapData ? (
                        <MapContainer center={[23.8103, 90.4125]} zoom={7} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                            <MapBoundsUpdater markers={getFilteredMapPins()} />
                            {getFilteredMapPins().map(m => (
                                <Marker 
                                    key={m.id} position={[m.lat, m.lng]} 
                                    icon={m.type === 'multiple' ? icons.violet : m.type === 'user' ? icons.blue : m.type === 'agency' ? icons.orange : m.type === 'driver' ? icons.green : icons.red}
                                >
                                    <Popup>
                                        <Typography variant="subtitle2" fontWeight="bold">{m.name || `${m.lat}, ${m.lng}`}</Typography>
                                        <Typography variant="caption" display="block">{m.city}, {m.area}</Typography>
                                        <Stack direction="row" spacing={0.5} mt={1}>
                                            {m.types.includes('user') && <Chip label="User" size="small" sx={{ height: 16, fontSize: 10, bgcolor: '#eff6ff', color: '#3b82f6' }}/>}
                                            {m.types.includes('agency') && <Chip label="Agency" size="small" sx={{ height: 16, fontSize: 10, bgcolor: '#fff7ed', color: '#F97316' }}/>}
                                            {m.types.includes('driver') && <Chip label="Driver" size="small" sx={{ height: 16, fontSize: 10, bgcolor: '#f0fdfa', color: '#14b8a6' }}/>}
                                            {m.type === 'orphaned' && <Chip label="Orphaned" size="small" sx={{ height: 16, fontSize: 10, bgcolor: '#fef2f2', color: '#ef4444' }}/>}
                                        </Stack>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    ) : <LinearProgress />}
                </Paper>
            )}

            {/* Address Detail Modal */}
            <Dialog open={isDetailOpen} onClose={() => setIsDetailOpen(false)} maxWidth="md" fullWidth>
                {selectedAddress && (
                    <>
                        <DialogTitle sx={{ bgcolor: '#F97316', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            Address Details
                            <IconButton onClick={() => setIsDetailOpen(false)} sx={{ color: 'white' }}><Close /></IconButton>
                        </DialogTitle>
                        <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                            <Box sx={{ width: { xs: '100%', md: '40%' }, height: '300px', md: 'auto' }}>
                                <MapContainer center={[selectedAddress.latitude, selectedAddress.longitude]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                                    <Marker position={[selectedAddress.latitude, selectedAddress.longitude]} icon={icons.orange} />
                                </MapContainer>
                            </Box>
                            <Box sx={{ p: 3, flex: 1 }}>
                                <Typography variant="h6" fontWeight="bold">{selectedAddress.display_name || 'No Display Name'}</Typography>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">City</Typography><Typography variant="body2">{selectedAddress.city || '—'}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Area</Typography><Typography variant="body2">{selectedAddress.area || '—'}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Postcode</Typography><Typography variant="body2">{selectedAddress.postcode || '—'}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Coordinates</Typography><Typography variant="body2">{parseFloat(selectedAddress.latitude).toFixed(4)}, {parseFloat(selectedAddress.longitude).toFixed(4)}</Typography></Grid>
                                </Grid>

                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" fontWeight="bold" mb={1}>Linked Entities</Typography>
                                {(!selectedAddress.linked_users?.length && !selectedAddress.linked_agencies?.length && !selectedAddress.linked_drivers?.length) ? (
                                    <Alert severity="error">⚠️ Orphaned Address: This address is not linked to any user, agency, or driver. Consider deleting it.</Alert>
                                ) : (
                                    <Stack spacing={2}>
                                        {selectedAddress.linked_users?.length > 0 && (
                                            <Box>
                                                <Typography variant="caption" color="#3b82f6" fontWeight="bold">Users</Typography>
                                                {selectedAddress.linked_users.map(u => (
                                                    <Stack key={u.id} direction="row" spacing={1} alignItems="center" sx={{ bgcolor: '#f8fafc', p: 1, borderRadius: 1, mt: 0.5 }}>
                                                        <Avatar src={u.photo} sx={{ width: 24, height: 24 }} />
                                                        <Typography variant="body2">{u.name}</Typography>
                                                        <Chip label={u.role} size="small" sx={{ height: 16, fontSize: 10 }} />
                                                    </Stack>
                                                ))}
                                            </Box>
                                        )}
                                        {selectedAddress.linked_agencies?.length > 0 && (
                                            <Box>
                                                <Typography variant="caption" color="#F97316" fontWeight="bold">Agencies</Typography>
                                                {selectedAddress.linked_agencies.map(a => (
                                                    <Stack key={a.id} direction="row" spacing={1} alignItems="center" sx={{ bgcolor: '#fff7ed', p: 1, borderRadius: 1, mt: 0.5 }}>
                                                        <Business sx={{ fontSize: 20, color: '#F97316' }} />
                                                        <Typography variant="body2">{a.name}</Typography>
                                                        {a.verified && <Verified sx={{ fontSize: 14, color: '#10b981' }} />}
                                                    </Stack>
                                                ))}
                                            </Box>
                                        )}
                                        {selectedAddress.linked_drivers?.length > 0 && (
                                            <Box>
                                                <Typography variant="caption" color="#14b8a6" fontWeight="bold">Drivers</Typography>
                                                {selectedAddress.linked_drivers.map(d => (
                                                    <Stack key={d.id} direction="row" spacing={1} alignItems="center" sx={{ bgcolor: '#f0fdfa', p: 1, borderRadius: 1, mt: 0.5 }}>
                                                        <Avatar src={d.photo} sx={{ width: 24, height: 24 }} />
                                                        <Typography variant="body2">{d.name}</Typography>
                                                        <Chip label={d.license_status} size="small" color={d.license_status === 'Verified' ? 'success' : 'warning'} sx={{ height: 16, fontSize: 10 }} />
                                                    </Stack>
                                                ))}
                                            </Box>
                                        )}
                                    </Stack>
                                )}
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
                            <Button onClick={() => window.open(`https://maps.google.com/?q=${selectedAddress.latitude},${selectedAddress.longitude}`)} startIcon={<Public />}>Open in Google Maps</Button>
                            <Box flex={1} />
                            <Tooltip title={selectedAddress.linked_users?.length || selectedAddress.linked_agencies?.length || selectedAddress.linked_drivers?.length ? "Cannot delete — linked to entities" : ""}>
                                <span>
                                    <Button 
                                        color="error" variant="contained" 
                                        disabled={selectedAddress.linked_users?.length > 0 || selectedAddress.linked_agencies?.length > 0 || selectedAddress.linked_drivers?.length > 0}
                                        onClick={() => { setIsDetailOpen(false); setIsDeleteOpen(true); }}
                                    >
                                        Delete Address
                                    </Button>
                                </span>
                            </Tooltip>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Delete Dialogs */}
            <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                <DialogTitle color="error" fontWeight="bold">Delete Address?</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to permanently delete this orphaned address?</Typography>
                    {selectedAddress && (
                        <Paper sx={{ p: 2, mt: 2, bgcolor: '#fef2f2' }}>
                            <Typography variant="body2" fontWeight="bold">{selectedAddress.city}, {selectedAddress.area}</Typography>
                            <Typography variant="caption">{selectedAddress.display_name}</Typography>
                        </Paper>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={() => deleteMutation.mutate([selectedAddress.address_id])}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isBulkDeleteOpen} onClose={() => setIsBulkDeleteOpen(false)}>
                <DialogTitle color="error" fontWeight="bold">Bulk Delete Orphaned Addresses</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete {selectedAddresses.length} orphaned addresses? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsBulkDeleteOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={() => deleteMutation.mutate(selectedAddresses)}>Confirm Delete</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default AdminAddress;
