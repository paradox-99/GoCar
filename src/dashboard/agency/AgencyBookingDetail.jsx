import { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
    Box,
    Button,
    Typography,
    Paper,
    Grid,
    Divider,
    CircularProgress,
    Chip,
    Avatar
} from '@mui/material';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import toast from 'react-hot-toast';
import {
    Person,
    DirectionsCar,
    Event,
    Payment,
    Share,
    ArrowBack,
    CheckCircle,
    Cancel,
    ReportProblem,
    LocationOn,
    AccessTime,
    LocalShipping,
    LocalGasStation,
    Speed,
    HourglassBottom
} from '@mui/icons-material';
import PickupFormModal from './PickupFormModal';

const AgencyBookingDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();
    
    const [bookingData, setBookingData] = useState(location.state?.booking || null);
    const [loading, setLoading] = useState(!location.state?.booking);
    const [updating, setUpdating] = useState(false);
    const [pickupModalOpen, setPickupModalOpen] = useState(false);

    useEffect(() => {
        if (!bookingData && id) {
            fetchBooking();
        }
    }, [id]);

    const fetchBooking = async () => {
        try {
            const response = await axiosPublic.get(`bookingRoutes/getBooking/${id}`);
            setBookingData(response.data);
        } catch (error) {
            toast.error('Failed to fetch booking details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        setUpdating(true);
        try {
            const response = await axiosPublic.patch(`bookingRoutes/updateStatus/${id}`, { status: newStatus });
            if (response.status === 200) {
                toast.success(`Booking ${newStatus} successfully!`);
                setBookingData({ ...bookingData, status: newStatus });
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <Box className="flex justify-center items-center h-screen"><CircularProgress sx={{ color: '#F58300' }} /></Box>;
    if (!bookingData) return (
        <Box className="p-20 text-center">
            <Typography variant="h5" fontWeight="bold">Booking not found.</Typography>
            <Button component={Link} to="/dashboard/agency/bookings" sx={{ mt: 2, color: '#F58300' }}>
                Back to Bookings
            </Button>
        </Box>
    );

    const getStatusConfig = (status) => {
        switch(status) {
            case 'Requested': return { color: 'warning', label: 'Pending Request' };
            case 'Confirmed': return { color: 'success', label: 'Upcoming Trip' };
            case 'Running': return { color: 'primary', label: 'In Progress' };
            case 'Completed': return { color: 'info', label: 'Trip Completed' };
            case 'Cancelled': return { color: 'error', label: 'Cancelled' };
            case 'Overdue': return { color: 'error', label: 'Overdue' };
            default: return { color: 'default', label: status };
        }
    };

    const statusConfig = getStatusConfig(bookingData.status);

    const hoursToPickup = bookingData.start_ts
        ? (new Date(bookingData.start_ts) - new Date()) / (1000 * 60 * 60)
        : Infinity;
    const canInitiatePickup =
        bookingData.status === 'Confirmed' &&
        bookingData.initial_payment === true &&
        hoursToPickup <= 2 &&
        !bookingData.pickup_id;

    const vehicleName = bookingData.brand && bookingData.model
        ? `${bookingData.brand} ${bookingData.model}`
        : null;

    return (
        <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Navigation & Actions Header */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <Button
                        onClick={() => navigate(-1)}
                        startIcon={<ArrowBack />}
                        sx={{
                            color: 'gray',
                            textTransform: 'none',
                            '&:hover': { color: '#F58300', background: 'transparent' }
                        }}
                    >
                        Back to Bookings
                    </Button>

                    <div className="flex flex-wrap gap-3">
                        {bookingData.status === 'Requested' && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircle />}
                                onClick={() => handleUpdateStatus('Confirmed')}
                                disabled={updating}
                                sx={{ borderRadius: '10px', textTransform: 'none', px: 3 }}
                            >
                                Confirm Booking
                            </Button>
                        )}

                        {/* Pickup button: visible 2 hrs before pickup, payment done, no existing pickup */}
                        {canInitiatePickup && (
                            <Button
                                variant="contained"
                                startIcon={<LocalShipping />}
                                onClick={() => setPickupModalOpen(true)}
                                disabled={updating}
                                sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    px: 3,
                                    fontWeight: 700,
                                    backgroundColor: '#F58300',
                                    '&:hover': { backgroundColor: '#d17000' },
                                    boxShadow: '0 4px 14px -4px rgba(245,131,0,0.5)'
                                }}
                            >
                                Initiate Pickup
                            </Button>
                        )}

                        {/* Pickup already submitted — show badge */}
                        {bookingData.pickup_id && !bookingData.pickup_confirmed && (
                            <Chip
                                icon={<HourglassBottom />}
                                label="Pickup Submitted — Awaiting Customer"
                                color="warning"
                                variant="outlined"
                                sx={{ fontWeight: 600, borderRadius: '10px', px: 1 }}
                            />
                        )}
                        {bookingData.pickup_id && bookingData.pickup_confirmed && (
                            <Chip
                                icon={<CheckCircle />}
                                label="Pickup Confirmed by Customer"
                                color="success"
                                variant="outlined"
                                sx={{ fontWeight: 600, borderRadius: '10px', px: 1 }}
                            />
                        )}

                        {['Requested', 'Confirmed'].includes(bookingData.status) && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<Cancel />}
                                onClick={() => handleUpdateStatus('Cancelled')}
                                disabled={updating}
                                sx={{ borderRadius: '10px', textTransform: 'none', px: 3 }}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            component={Link}
                            to="/dashboard/report-damage"
                            state={{ booking: bookingData }}
                            variant="outlined"
                            color="warning"
                            startIcon={<ReportProblem />}
                            sx={{ borderRadius: '10px', textTransform: 'none', px: 3 }}
                        >
                            Report Damage
                        </Button>
                    </div>
                </div>

                <Grid container spacing={4}>
                    {/* Main Details Column */}
                    <Grid item xs={12} lg={8}>
                        {/* Summary Card */}
                        <Paper elevation={0} className="p-6 rounded-3xl border border-gray-100 mb-6 overflow-hidden relative">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                            
                            <Box className="flex justify-between items-start mb-6 relative z-10">
                                <Box>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Typography variant="h4" fontWeight="900" className="text-gray-800">
                                            #{bookingData.booking_id}
                                        </Typography>
                                        <Chip 
                                            label={statusConfig.label} 
                                            color={statusConfig.color} 
                                            size="small"
                                            sx={{ fontWeight: 'bold', borderRadius: '6px' }}
                                        />
                                    </div>
                                    <Typography color="textSecondary" variant="body2" className="flex items-center gap-1">
                                        <AccessTime fontSize="inherit" />
                                        Booked on {moment(bookingData.booking_ts).format('DD MMM YYYY, hh:mm A')}
                                    </Typography>
                                </Box>
                                
                                <div className="text-right">
                                    <Typography variant="h4" fontWeight="900" sx={{ color: '#F58300' }}>
                                        ৳{bookingData.total_cost}
                                    </Typography>
                                    <Typography variant="caption" className="text-gray-400 font-bold uppercase tracking-wider">
                                        Total Revenue
                                    </Typography>
                                </div>
                            </Box>
                            
                            <Divider className="my-6" sx={{ borderStyle: 'dashed' }} />
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Box className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                        <Typography variant="subtitle2" className="text-blue-700 font-bold mb-3 flex items-center gap-2">
                                            <Event fontSize="small" /> Rental Period
                                        </Typography>
                                        <div className="space-y-2">
                                            <div>
                                                <Typography variant="caption" className="text-gray-400 block uppercase">Pickup</Typography>
                                                <Typography variant="body2" fontWeight="bold">{moment(bookingData.start_ts).format('DD MMM YYYY, hh:mm A')}</Typography>
                                            </div>
                                            <div>
                                                <Typography variant="caption" className="text-gray-400 block uppercase">Return</Typography>
                                                <Typography variant="body2" fontWeight="bold">{moment(bookingData.end_ts).format('DD MMM YYYY, hh:mm A')}</Typography>
                                            </div>
                                            <Chip 
                                                label={`${bookingData.total_rent_hours} Hours Total`} 
                                                size="small" 
                                                className="bg-blue-100 text-blue-700 font-bold mt-2" 
                                            />
                                        </div>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                                        <Typography variant="subtitle2" className="text-orange-700 font-bold mb-3 flex items-center gap-2">
                                            <Payment fontSize="small" /> Payment Details
                                        </Typography>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Typography variant="body2">Rent Cost</Typography>
                                                <Typography variant="body2" fontWeight="bold">৳{bookingData.total_cost - (bookingData.driver_cost || 0)}</Typography>
                                            </div>
                                            <div className="flex justify-between">
                                                <Typography variant="body2">Driver Fee</Typography>
                                                <Typography variant="body2" fontWeight="bold">৳{bookingData.driver_cost || 0}</Typography>
                                            </div>
                                            <Divider className="my-2" />
                                            <div className="flex justify-between items-center">
                                                <Typography variant="caption" className="font-bold uppercase text-gray-500">Status</Typography>
                                                <Chip 
                                                    label={bookingData.initial_payment ? 'Paid' : 'Unpaid'} 
                                                    size="small"
                                                    color={bookingData.initial_payment ? 'success' : 'error'}
                                                    variant="outlined"
                                                />
                                            </div>
                                        </div>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Pickup Info Card — shown after pickup is initiated */}
                        {bookingData.pickup_id && (
                            <Paper elevation={0} className={`p-6 rounded-3xl mb-6 border ${
                                bookingData.pickup_confirmed
                                    ? 'border-green-200 bg-green-50/40'
                                    : 'border-orange-200 bg-orange-50/40'
                            }`}>
                                <Typography variant="h6" fontWeight="bold" className="flex items-center gap-2 mb-5">
                                    <Avatar sx={{
                                        bgcolor: bookingData.pickup_confirmed ? '#16a34a' : '#F58300',
                                        width: 32, height: 32
                                    }}>
                                        {bookingData.pickup_confirmed
                                            ? <CheckCircle fontSize="small" />
                                            : <LocalShipping fontSize="small" />
                                        }
                                    </Avatar>
                                    Pickup Information
                                    <Chip
                                        label={bookingData.pickup_confirmed ? 'Customer Confirmed' : 'Awaiting Customer'}
                                        size="small"
                                        color={bookingData.pickup_confirmed ? 'success' : 'warning'}
                                        sx={{ ml: 'auto', fontWeight: 700 }}
                                    />
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={6} sm={3}>
                                        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                                            <LocalGasStation sx={{ color: '#F58300', fontSize: 20 }} />
                                            <p className="text-xs text-gray-400 uppercase font-bold mt-1">Fuel Level</p>
                                            <p className="font-extrabold text-gray-800 text-lg">{bookingData.pickup_fuel_level}%</p>
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                                            <Speed sx={{ color: '#3b82f6', fontSize: 20 }} />
                                            <p className="text-xs text-gray-400 uppercase font-bold mt-1">Odometer</p>
                                            <p className="font-extrabold text-gray-800 text-lg">{bookingData.pickup_odometer?.toLocaleString()} km</p>
                                        </div>
                                    </Grid>
                                    {bookingData.pickup_early_fee > 0 && (
                                        <Grid item xs={6} sm={3}>
                                            <div className="bg-white rounded-xl p-3 border border-yellow-100 text-center">
                                                <p className="text-xs text-yellow-600 uppercase font-bold">Early Fee</p>
                                                <p className="font-extrabold text-yellow-700 text-lg">৳{bookingData.pickup_early_fee}</p>
                                            </div>
                                        </Grid>
                                    )}
                                    {bookingData.pickup_fuel_charge > 0 && (
                                        <Grid item xs={6} sm={3}>
                                            <div className="bg-white rounded-xl p-3 border border-red-100 text-center">
                                                <p className="text-xs text-red-500 uppercase font-bold">Fuel Charge</p>
                                                <p className="font-extrabold text-red-600 text-lg">৳{bookingData.pickup_fuel_charge}</p>
                                            </div>
                                        </Grid>
                                    )}
                                </Grid>

                                {bookingData.pickup_notes && (
                                    <div className="mt-4 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Notes</p>
                                        <p className="text-sm text-gray-700 italic">&quot;{bookingData.pickup_notes}&quot;</p>
                                    </div>
                                )}

                                <p className="text-xs text-gray-400 mt-3 text-right">
                                    Submitted: {moment(bookingData.pickup_time).format('DD MMM YYYY, hh:mm A')}
                                </p>
                            </Paper>
                        )}

                        {/* Vehicle Info Card */}
                        <Paper elevation={0} className="p-6 rounded-3xl border border-gray-100 mb-6">
                            <Typography variant="h6" fontWeight="bold" className="flex items-center gap-2 mb-6">
                                <Avatar sx={{ bgcolor: '#F58300', width: 32, height: 32 }}><DirectionsCar fontSize="small" /></Avatar>
                                Vehicle Details
                            </Typography>
                            <Box className="flex gap-8 flex-col md:flex-row items-center md:items-start">
                                <div className="relative group">
                                    <img 
                                        src={bookingData.images || bookingData.car_image} 
                                        className="w-full md:w-64 h-40 object-cover rounded-2xl shadow-md group-hover:scale-[1.02] transition-transform"
                                        alt={bookingData.model}
                                    />
                                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg">
                                        {bookingData.car_type}
                                    </div>
                                </div>
                                <Grid container spacing={3} sx={{ mt: { xs: 2, md: 0 } }}>
                                    <Grid item xs={6} md={4}>
                                        <Typography variant="caption" color="textSecondary" className="uppercase tracking-tighter font-bold">Model</Typography>
                                        <Typography variant="body1" fontWeight="bold" className="text-gray-800">{bookingData.brand} {bookingData.model}</Typography>
                                    </Grid>
                                    <Grid item xs={6} md={4}>
                                        <Typography variant="caption" color="textSecondary" className="uppercase tracking-tighter font-bold">Fuel Type</Typography>
                                        <Typography variant="body1" fontWeight="bold" className="text-gray-800">{bookingData.fuel || 'N/A'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="caption" color="textSecondary" className="uppercase tracking-tighter font-bold">Trip Purpose</Typography>
                                        <Typography variant="body2" className="text-gray-700 italic">"{bookingData.booking_purpose}"</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box className="mt-4 p-4 bg-gray-50 rounded-xl flex items-start gap-3">
                                            <LocationOn className="text-red-500 mt-1" />
                                            <div>
                                                <Typography variant="caption" color="textSecondary" className="uppercase font-bold">Destination</Typography>
                                                <Typography variant="body2" className="text-gray-800 font-medium">{bookingData.estimated_destination}</Typography>
                                            </div>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Sidebar Info */}
                    <Grid item xs={12} lg={4}>
                        {/* Customer Card */}
                        <Paper elevation={0} className="p-6 rounded-3xl border border-gray-100 mb-6 bg-white">
                            <Typography variant="h6" fontWeight="bold" className="flex items-center gap-2 mb-6">
                                <Avatar sx={{ bgcolor: '#F58300', width: 32, height: 32 }}><Person fontSize="small" /></Avatar>
                                Customer
                            </Typography>
                            <Box className="flex flex-col items-center py-4">
                                {bookingData.user_photo ? (
                                    <Avatar 
                                        src={bookingData.user_photo} 
                                        sx={{ width: 100, height: 100, border: '4px solid #fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                        className="mb-4"
                                    />
                                ) : (
                                    <Avatar sx={{ width: 100, height: 100, bgcolor: '#f0f0f0', mb: 4 }}>{bookingData.user_name?.[0]}</Avatar>
                                )}
                                <Typography variant="h6" fontWeight="800" className="text-gray-800">{bookingData.user_name}</Typography>
                                <Typography variant="body2" color="textSecondary">{bookingData.user_email}</Typography>
                                <Chip label="Verified Member" size="small" variant="outlined" sx={{ mt: 1, color: '#F58300', borderColor: '#F58300' }} />
                            </Box>
                            
                            <Divider className="my-6" />
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                     <Box className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                        <Event fontSize="small" />
                                     </Box>
                                     <div>
                                         <Typography variant="caption" className="text-gray-400 font-bold uppercase">Phone</Typography>
                                         <Typography variant="body2" fontWeight="bold">{bookingData.user_phone}</Typography>
                                     </div>
                                </div>
                                <div className="flex items-center gap-3">
                                     <Box className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                        <LocationOn fontSize="small" />
                                     </Box>
                                     <div>
                                         <Typography variant="caption" className="text-gray-400 font-bold uppercase">Address</Typography>
                                         <Typography variant="body2" fontWeight="bold">{bookingData.user_address || 'N/A'}</Typography>
                                     </div>
                                </div>
                            </div>
                        </Paper>

                        {/* Driver Card */}
                        {bookingData.driver_id ? (
                            <Paper elevation={0} className="p-6 rounded-3xl border border-gray-100 bg-white">
                                <Typography variant="h6" fontWeight="bold" className="flex items-center gap-2 mb-6">
                                    <Avatar sx={{ bgcolor: '#F58300', width: 32, height: 32 }}><Share fontSize="small" /></Avatar>
                                    Assigned Driver
                                </Typography>
                                <Box className="flex gap-4 items-center p-3 rounded-2xl bg-gray-50 transition-hover hover:bg-gray-100 cursor-pointer">
                                    <Avatar 
                                        src={bookingData.driver_photo} 
                                        sx={{ width: 56, height: 56 }} 
                                    />
                                    <Box>
                                        <Typography variant="body1" fontWeight="bold">{bookingData.driver_name}</Typography>
                                        <Typography variant="body2" color="textSecondary">{bookingData.driver_phone}</Typography>
                                    </Box>
                                </Box>
                                <Button 
                                    fullWidth 
                                    variant="text" 
                                    size="small" 
                                    sx={{ mt: 2, color: 'gray', textTransform: 'none' }}
                                >
                                    Change Driver
                                </Button>
                            </Paper>
                        ) : (
                            <Paper elevation={0} className="p-6 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
                                <Avatar sx={{ bgcolor: '#f9fafb', color: '#d1d5db', mb: 2 }}><Person /></Avatar>
                                <Typography variant="body2" className="text-gray-400 font-medium">No Driver Assigned</Typography>
                                <Button size="small" sx={{ color: '#F58300', mt: 1, fontWeight: 'bold' }}>Assign Now</Button>
                            </Paper>
                        )}
                    </Grid>
                </Grid>
            </div>

            {/* Pickup Form Modal */}
            <PickupFormModal
                open={pickupModalOpen}
                onClose={() => setPickupModalOpen(false)}
                bookingId={bookingData.booking_id}
                vehicleName={vehicleName}
                onSuccess={() => {
                    setBookingData(prev => ({
                        ...prev,
                        pickup_id: 'pending',
                        pickup_confirmed: false
                    }));
                    fetchBooking();
                }}
            />
        </div>
    );
};

export default AgencyBookingDetail;

