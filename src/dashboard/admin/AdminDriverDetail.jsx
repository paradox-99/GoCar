import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Divider, Avatar, Chip, Button, CircularProgress } from '@mui/material';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import moment from 'moment';
import { Person, Email, Phone, CalendarToday, Verified, History, Badge, MonetizationOn } from '@mui/icons-material';
import toast from 'react-hot-toast';

const AdminDriverDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const axiosPublic = useAxiosPublic();
    
    const [driver, setDriver] = useState(location.state?.driver || null);
    const [driverBookings, setDriverBookings] = useState([]);
    const [loading, setLoading] = useState(!location.state?.driver);
    const [bookingsLoading, setBookingsLoading] = useState(true);

    useEffect(() => {
        if (!driver && id) {
            fetchDriver();
        }
        if (id) {
            fetchDriverBookings();
        }
    }, [id]);

    const fetchDriver = async () => {
        try {
            const response = await axiosPublic.get(`driverRoutes/profile-by-id/${id}`);
            setDriver(response.data);
        } catch (error) {
            toast.error('Failed to fetch driver details');
        } finally {
            setLoading(false);
        }
    };

    const fetchDriverBookings = async () => {
        try {
            const response = await axiosPublic.get(`bookingRoutes/getDriverBookings/${id}`);
            setDriverBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch driver bookings', error);
        } finally {
            setBookingsLoading(false);
        }
    };

    if (loading) return <Box className="flex justify-center items-center h-screen"><CircularProgress /></Box>;
    if (!driver) return <Box className="p-6 text-center"><Typography>Driver not found.</Typography></Box>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Link to="/dashboard/admin/drivers" className="text-primary hover:underline flex items-center gap-1 mb-6">
                ◀ Back to Drivers
            </Link>

            <Grid container spacing={4}>
                {/* Driver Profile Card */}
                <Grid item xs={12} lg={4}>
                    <Paper className="p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <Avatar 
                            src={driver.photo} 
                            sx={{ width: 120, height: 120, border: '4px solid #f0f0f0', mb: 2 }}
                        />
                        <Typography variant="h5" fontWeight="bold">{driver.name}</Typography>
                        <Chip 
                            label={driver.verified ? "Verified Professional" : "Pending Verification"} 
                            color={driver.verified ? "success" : "warning"} 
                            size="small" 
                            className="mt-1 mb-6"
                        />
                        
                        <Divider className="w-full my-4" />
                        
                        <Box className="w-full space-y-4">
                            <Box className="flex items-center gap-3">
                                <Email color="disabled" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary" className="block text-xs">Email Address</Typography>
                                    <Typography variant="body2">{driver.email}</Typography>
                                </Box>
                            </Box>
                            <Box className="flex items-center gap-3">
                                <Phone color="disabled" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary" className="block text-xs">Phone Number</Typography>
                                    <Typography variant="body2">{driver.phone}</Typography>
                                </Box>
                            </Box>
                            <Box className="flex items-center gap-3">
                                <Badge color="disabled" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary" className="block text-xs">License Number</Typography>
                                    <Typography variant="body2">{driver.license_number || 'N/A'}</Typography>
                                </Box>
                            </Box>
                            <Box className="flex items-center gap-3">
                                <CalendarToday color="disabled" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary" className="block text-xs">Experience</Typography>
                                    <Typography variant="body2">{driver.experience_year} Years</Typography>
                                </Box>
                            </Box>
                            <Box className="flex items-center gap-3">
                                <MonetizationOn color="disabled" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary" className="block text-xs">Daily Rate</Typography>
                                    <Typography variant="body2" fontWeight="bold">৳{driver.rental_price}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Box className="w-full mt-8 pt-6 border-t">
                            <Typography variant="subtitle2" fontWeight="bold" className="mb-4">Affiliated Agency</Typography>
                            <Typography variant="body2" color="textSecondary">Works with: <strong>{driver.agency_name || 'Independent'}</strong></Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Main Content Area */}
                <Grid item xs={12} lg={8}>
                    {/* Performance Overview */}
                    <Grid container spacing={3} className="mb-6">
                        <Grid item xs={12} sm={4}>
                            <Paper className="p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <Typography color="textSecondary" variant="caption" fontWeight="bold">TOTAL TRIPS</Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary">{driverBookings.length}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Paper className="p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <Typography color="textSecondary" variant="caption" fontWeight="bold">RATING</Typography>
                                <Typography variant="h4" fontWeight="bold" color="secondary">{driver.rating || 'N/A'}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Trip History */}
                    <Paper className="p-6 rounded-xl shadow-sm border border-gray-100">
                        <Typography variant="h6" fontWeight="bold" className="flex items-center gap-2 mb-6">
                            <History color="primary" /> Recent Trips
                        </Typography>

                        {bookingsLoading ? (
                            <Box className="flex justify-center p-10"><CircularProgress size={30} /></Box>
                        ) : driverBookings.length === 0 ? (
                            <Typography className="text-center py-10 text-gray-500">No trip history found.</Typography>
                        ) : (
                            <div className="space-y-4">
                                {driverBookings.map((trip) => (
                                    <Box key={trip.booking_id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex justify-between items-center">
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">{trip.brand} {trip.model}</Typography>
                                            <Typography variant="caption" color="textSecondary" className="block">
                                                {moment(trip.start_ts).format('DD MMM')} - {moment(trip.end_ts).format('DD MMM YYYY')}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">Client: {trip.user_name}</Typography>
                                        </Box>
                                        <Box className="text-right">
                                            <Chip 
                                                label={trip.status} 
                                                size="small" 
                                                variant="outlined"
                                                className="mb-1"
                                            />
                                            <Typography variant="body2" fontWeight="bold" color="primary" className="block">৳{trip.driver_cost}</Typography>
                                        </Box>
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

export default AdminDriverDetail;
