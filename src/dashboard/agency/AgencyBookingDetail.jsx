import { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Box, Button, Typography, Paper, Grid, Divider, CircularProgress, Chip } from '@mui/material';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import toast from 'react-hot-toast';
import { Person, DirectionsCar, Event, Payment, Description, Share } from '@mui/icons-material';

const AgencyBookingDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();
    
    const [bookingData, setBookingData] = useState(location.state?.booking || null);
    const [loading, setLoading] = useState(!location.state?.booking);
    const [updating, setUpdating] = useState(false);

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

    if (loading) return <Box className="flex justify-center items-center h-screen"><CircularProgress /></Box>;
    if (!bookingData) return <Box className="p-6 text-center"><Typography>Booking not found.</Typography><Link to="/dashboard/agency/bookings">Back</Link></Box>;

    const statusColors = {
        'Requested': 'warning',
        'Confirmed': 'success',
        'Running': 'primary',
        'Completed': 'info',
        'Cancelled': 'error',
        'Overdue': 'error'
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <Link to="/dashboard/agency/bookings" className="text-primary hover:underline flex items-center gap-1">
                    ◀ Back to All Bookings
                </Link>
                <div className="flex gap-2">
                    {bookingData.status === 'Requested' && (
                        <Button 
                            variant="contained" 
                            color="success" 
                            onClick={() => handleUpdateStatus('Confirmed')}
                            disabled={updating}
                        >
                            Confirm Booking
                        </Button>
                    )}
                    {['Requested', 'Confirmed'].includes(bookingData.status) && (
                        <Button 
                            variant="outlined" 
                            color="error" 
                            onClick={() => handleUpdateStatus('Cancelled')}
                            disabled={updating}
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
                    >
                        Report Damage
                    </Button>
                </div>
            </div>

            <Grid container spacing={4}>
                {/* Main Content */}
                <Grid item xs={12} lg={8}>
                    {/* Booking Header Card */}
                    <Paper className="p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <Box className="flex justify-between items-start mb-4">
                            <Box>
                                <Typography variant="h5" fontWeight="bold">Booking #{bookingData.booking_id}</Typography>
                                <Typography color="textSecondary" variant="body2">
                                    Booked on {moment(bookingData.booking_ts).format('DD MMM YYYY, hh:mm A')}
                                </Typography>
                            </Box>
                            <Chip 
                                label={bookingData.status} 
                                color={statusColors[bookingData.status] || 'default'} 
                                fontWeight="bold"
                            />
                        </Box>
                        
                        <Divider className="my-4" />
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary" className="flex items-center gap-1">
                                    <Event fontSize="small" /> Schedule
                                </Typography>
                                <Box className="mt-2 p-3 bg-blue-50 rounded-lg">
                                    <Typography variant="body2"><strong>From:</strong> {moment(bookingData.start_ts).format('DD MMM YYYY, hh:mm A')}</Typography>
                                    <Typography variant="body2"><strong>To:</strong> {moment(bookingData.end_ts).format('DD MMM YYYY, hh:mm A')}</Typography>
                                    <Typography variant="caption" className="text-blue-600 font-bold block mt-1">Duration: {bookingData.total_rent_hours} Hours</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary" className="flex items-center gap-1">
                                    <Payment fontSize="small" /> Financials
                                </Typography>
                                <Box className="mt-2 p-3 bg-orange-50 rounded-lg">
                                    <Typography variant="body2"><strong>Total Cost:</strong> ৳{bookingData.total_cost}</Typography>
                                    <Typography variant="body2"><strong>Driver Cost:</strong> ৳{bookingData.driver_cost || 0}</Typography>
                                    <Typography variant="caption" className="text-orange-700 font-bold block mt-1">
                                        Payment status: {bookingData.initial_payment ? 'Initial Paid' : 'Unpaid'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Vehicle Card */}
                    <Paper className="p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <Typography variant="h6" fontWeight="bold" className="flex items-center gap-2 mb-4">
                            <DirectionsCar color="primary" /> Vehicle Details
                        </Typography>
                        <Box className="flex gap-6 flex-col md:flex-row">
                            <img 
                                src={bookingData.images || bookingData.car_image} 
                                className="w-full md:w-48 h-32 object-cover rounded-lg border"
                                alt={bookingData.model}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={6} md={4}>
                                    <Typography variant="caption" color="textSecondary">Model</Typography>
                                    <Typography variant="body2" fontWeight="bold">{bookingData.brand} {bookingData.model}</Typography>
                                </Grid>
                                <Grid item xs={6} md={4}>
                                    <Typography variant="caption" color="textSecondary">Type</Typography>
                                    <Typography variant="body2" fontWeight="bold">{bookingData.car_type || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6} md={4}>
                                    <Typography variant="caption" color="textSecondary">Fuel</Typography>
                                    <Typography variant="body2" fontWeight="bold">{bookingData.fuel || 'N/A'}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>

                    {/* Trip Purpose Card */}
                    <Paper className="p-6 rounded-xl shadow-sm border border-gray-100">
                        <Typography variant="h6" fontWeight="bold" className="flex items-center gap-2 mb-4">
                            <Description color="primary" /> Trip Information
                        </Typography>
                        <Box className="space-y-4">
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">Purpose</Typography>
                                <Typography variant="body1">{bookingData.booking_purpose}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">Destination</Typography>
                                <Typography variant="body1">{bookingData.estimated_destination}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Sidebar Info */}
                <Grid item xs={12} lg={4}>
                    {/* Customer Card */}
                    <Paper className="p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <Typography variant="h6" fontWeight="bold" className="flex items-center gap-2 mb-4">
                            <Person color="primary" /> Customer Info
                        </Typography>
                        <Box className="flex flex-col items-center mb-4">
                            {bookingData.user_photo && (
                                <img 
                                    src={bookingData.user_photo} 
                                    className="w-20 h-20 rounded-full object-cover border-2 border-primary mb-2"
                                    alt={bookingData.user_name}
                                />
                            )}
                            <Typography variant="h6" textAlign="center">{bookingData.user_name}</Typography>
                            <Typography variant="body2" color="textSecondary" textAlign="center">{bookingData.user_email}</Typography>
                        </Box>
                        <Divider className="my-4" />
                        <Typography variant="body2"><strong>Phone:</strong> {bookingData.user_phone}</Typography>
                        <Typography variant="body2" className="mt-2"><strong>Address:</strong> {bookingData.user_address || 'N/A'}</Typography>
                    </Paper>

                    {/* Driver Card */}
                    {bookingData.driver_id && (
                        <Paper className="p-6 rounded-xl shadow-sm border border-gray-100">
                            <Typography variant="h6" fontWeight="bold" className="flex items-center gap-2 mb-4">
                                <Share color="primary" /> Assigned Driver
                            </Typography>
                            <Box className="flex gap-4 items-center">
                                {bookingData.driver_photo && (
                                    <img 
                                        src={bookingData.driver_photo} 
                                        className="w-12 h-12 rounded-full object-cover"
                                        alt={bookingData.driver_name}
                                    />
                                )}
                                <Box>
                                    <Typography variant="body1" fontWeight="bold">{bookingData.driver_name}</Typography>
                                    <Typography variant="body2" color="textSecondary">{bookingData.driver_phone}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </div>
    );
};

export default AgencyBookingDetail;
