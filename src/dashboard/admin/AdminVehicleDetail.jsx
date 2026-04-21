import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Divider, Chip, Button, CircularProgress, ImageList, ImageListItem } from '@mui/material';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import moment from 'moment';
import { DirectionsCar, EventNote, Settings, Security, LocalParking, History, Info } from '@mui/icons-material';
import toast from 'react-hot-toast';

const AdminVehicleDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const axiosPublic = useAxiosPublic();
    
    const [vehicle, setVehicle] = useState(location.state?.vehicle || null);
    const [vehicleBookings, setVehicleBookings] = useState([]);
    const [loading, setLoading] = useState(!location.state?.vehicle);
    const [bookingsLoading, setBookingsLoading] = useState(true);

    useEffect(() => {
        if (!vehicle && id) {
            fetchVehicle();
        }
        if (id) {
            fetchVehicleBookings();
        }
    }, [id]);

    const fetchVehicle = async () => {
        try {
            const response = await axiosPublic.get(`carRoutes/getCarDetails/${id}`);
            setVehicle(response.data);
        } catch (error) {
            toast.error('Failed to fetch vehicle details');
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicleBookings = async () => {
        try {
            const response = await axiosPublic.get(`bookingRoutes/getCarBookings/${id}`);
            setVehicleBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch vehicle bookings', error);
        } finally {
            setBookingsLoading(false);
        }
    };

    if (loading) return <Box className="flex justify-center items-center h-screen"><CircularProgress /></Box>;
    if (!vehicle) return <Box className="p-6 text-center"><Typography>Vehicle not found.</Typography></Box>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Link to="/dashboard/admin/vehicles" className="text-primary hover:underline flex items-center gap-1 mb-6">
                ◀ Back to Vehicles
            </Link>

            <Grid container spacing={4}>
                {/* Vehicle Images & Basic Info */}
                <Grid item xs={12} lg={7}>
                    <Paper className="p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <Box className="flex justify-between items-start mb-4">
                            <Box>
                                <Typography variant="h4" fontWeight="bold">{vehicle.brand} {vehicle.model}</Typography>
                                <Typography variant="subtitle1" color="textSecondary">{vehicle.car_type} • {vehicle.build_year}</Typography>
                            </Box>
                            <Chip 
                                label={vehicle.status?.toUpperCase()} 
                                color={vehicle.status === 'Available' ? 'success' : 'warning'} 
                                variant="filled"
                            />
                        </Box>

                        <Divider className="my-4" />

                        {/* Image Gallery */}
                        {vehicle.images && vehicle.images.length > 0 && (
                            <ImageList sx={{ width: '100%', height: 400, borderRadius: '12px' }} cols={2} rowHeight={200}>
                                {vehicle.images.map((img, index) => (
                                    <ImageListItem key={index}>
                                        <img src={img} alt={`Vehicle ${index}`} loading="lazy" style={{ objectFit: 'cover' }} />
                                    </ImageListItem>
                                ))}
                            </ImageList>
                        )}

                        <Grid container spacing={3} className="mt-6">
                            <Grid item xs={6} md={3}>
                                <Box className="text-center p-3 bg-gray-50 rounded-lg">
                                    <Settings color="primary" fontSize="small" />
                                    <Typography variant="caption" className="block text-gray-500">Transmission</Typography>
                                    <Typography variant="body2" fontWeight="bold">{vehicle.transmission_type || 'Manual'}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Box className="text-center p-3 bg-gray-50 rounded-lg">
                                    <LocalParking color="primary" fontSize="small" />
                                    <Typography variant="caption" className="block text-gray-500">Fuel Type</Typography>
                                    <Typography variant="body2" fontWeight="bold">{vehicle.fuel}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Box className="text-center p-3 bg-gray-50 rounded-lg">
                                    <Security color="primary" fontSize="small" />
                                    <Typography variant="caption" className="block text-gray-500">Verified</Typography>
                                    <Typography variant="body2" fontWeight="bold">{vehicle.verified ? 'Yes' : 'No'}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Box className="text-center p-3 bg-gray-50 rounded-lg">
                                    <Typography variant="caption" color="primary" fontWeight="bold">Rental</Typography>
                                    <Typography variant="caption" className="block text-gray-500">per Day</Typography>
                                    <Typography variant="body2" fontWeight="bold">৳{vehicle.rental_price}</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Technical Specs */}
                    <Paper className="p-6 rounded-xl shadow-sm border border-gray-100">
                        <Typography variant="h6" fontWeight="bold" className="mb-4">Technical Specifications</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><Typography variant="body2" color="textSecondary">License Plate</Typography></Grid>
                            <Grid item xs={6} className="text-right"><Typography variant="body2" fontWeight="bold">{vehicle.license_number || 'N/A'}</Typography></Grid>
                            
                            <Grid item xs={6}><Typography variant="body2" color="textSecondary">Mileage</Typography></Grid>
                            <Grid item xs={6} className="text-right"><Typography variant="body2" fontWeight="bold">{vehicle.mileage} km</Typography></Grid>
                            
                            <Grid item xs={6}><Typography variant="body2" color="textSecondary">Engine Capacity</Typography></Grid>
                            <Grid item xs={6} className="text-right"><Typography variant="body2" fontWeight="bold">{vehicle.engine_capacity || 'N/A'}</Typography></Grid>
                            
                            <Grid item xs={6}><Typography variant="body2" color="textSecondary">Seats</Typography></Grid>
                            <Grid item xs={6} className="text-right"><Typography variant="body2" fontWeight="bold">{vehicle.seats}</Typography></Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Agency & History */}
                <Grid item xs={12} lg={5}>
                    {/* Agency Info */}
                    <Paper className="p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <Typography variant="h6" fontWeight="bold" className="mb-4">Provider Agency</Typography>
                        <Box className="flex items-center gap-4">
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>{vehicle.agency_name?.charAt(0)}</Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">{vehicle.agency_name}</Typography>
                                <Typography variant="caption" color="textSecondary">{vehicle.email}</Typography>
                            </Box>
                        </Box>
                        <Button 
                            component={Link} 
                            to={`/dashboard/admin/agencies/${vehicle.agency_id}`}
                            variant="outlined" 
                            fullWidth 
                            className="mt-4"
                            sx={{ borderRadius: '8px' }}
                        >
                            View Agency Details
                        </Button>
                    </Paper>

                    {/* Booking History */}
                    <Paper className="p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                        <Typography variant="h6" fontWeight="bold" className="flex items-center gap-2 mb-4">
                            <History color="primary" /> Recent Trips
                        </Typography>

                        {bookingsLoading ? (
                            <Box className="flex justify-center p-10"><CircularProgress size={30} /></Box>
                        ) : vehicleBookings.length === 0 ? (
                            <Typography className="text-center py-10 text-gray-500">No booking history available.</Typography>
                        ) : (
                            <div className="space-y-4">
                                {vehicleBookings.map((booking) => (
                                    <Box key={booking.booking_id} className="p-4 border rounded-lg hover:bg-gray-50">
                                        <Box className="flex justify-between items-start mb-2">
                                            <Typography variant="subtitle2" fontWeight="bold">{booking.name}</Typography>
                                            <Chip label={booking.status} size="small" variant="outlined" />
                                        </Box>
                                        <Typography variant="caption" color="textSecondary" className="block">
                                            Trip Date: {moment(booking.start_ts).format('DD MMM')} - {moment(booking.end_ts).format('DD MMM YYYY')}
                                        </Typography>
                                        <Typography variant="caption" color="primary" fontWeight="bold">Earned: ৳{booking.total_cost}</Typography>
                                    </Box>
                                ))}
                            </div>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default AdminVehicleDetail;
