import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Divider, Avatar, Chip, Button, CircularProgress } from '@mui/material';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import moment from 'moment';
import { Person, Email, Phone, CalendarToday, History, ReportProblem, VerifiedUser } from '@mui/icons-material';
import toast from 'react-hot-toast';

const AdminUserDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const axiosPublic = useAxiosPublic();
    
    const [userData, setUserData] = useState(location.state?.user || null);
    const [userBookings, setUserBookings] = useState([]);
    const [loading, setLoading] = useState(!location.state?.user);
    const [bookingsLoading, setBookingsLoading] = useState(true);

    useEffect(() => {
        if (!userData && id) {
            fetchUser();
        }
        if (id) {
            fetchUserBookings();
        }
    }, [id]);

    const fetchUser = async () => {
        try {
            const response = await axiosPublic.get(`userRoute/user-by-id/${id}`);
            setUserData(response.data);
        } catch (error) {
            toast.error('Failed to fetch user details');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserBookings = async () => {
        try {
            const response = await axiosPublic.get(`bookingRoutes/userBookings/${id}`);
            setUserBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch user bookings', error);
        } finally {
            setBookingsLoading(false);
        }
    };

    if (loading) return <Box className="flex justify-center items-center h-screen"><CircularProgress /></Box>;
    if (!userData) return <Box className="p-6 text-center"><Typography>User not found.</Typography></Box>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Link to="/dashboard/admin/users" className="text-primary hover:underline flex items-center gap-1 mb-6">
                ◀ Back to Users
            </Link>

            <Grid container spacing={4}>
                {/* User Profile Card */}
                <Grid item xs={12} lg={4}>
                    <Paper className="p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <Avatar 
                            src={userData.photo} 
                            sx={{ width: 120, height: 120, border: '4px solid #f0f0f0', mb: 2 }}
                        />
                        <Typography variant="h5" fontWeight="bold">{userData.name}</Typography>
                        <Chip 
                            label={userData.userrole?.toUpperCase()} 
                            color="primary" 
                            size="small" 
                            className="mt-1 mb-4"
                        />
                        
                        <Divider className="w-full my-4" />
                        
                        <Box className="w-full space-y-4">
                            <Box className="flex items-center gap-3">
                                <Email color="disabled" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary" className="block">Email Address</Typography>
                                    <Typography variant="body2">{userData.email}</Typography>
                                </Box>
                            </Box>
                            <Box className="flex items-center gap-3">
                                <Phone color="disabled" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary" className="block">Phone Number</Typography>
                                    <Typography variant="body2">{userData.phone}</Typography>
                                </Box>
                            </Box>
                            <Box className="flex items-center gap-3">
                                <CalendarToday color="disabled" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary" className="block">Member Since</Typography>
                                    <Typography variant="body2">{moment(userData.created_at).format('DD MMM YYYY')}</Typography>
                                </Box>
                            </Box>
                            <Box className="flex items-center gap-3">
                                <VerifiedUser color={userData.verified ? "success" : "disabled"} />
                                <Box>
                                    <Typography variant="caption" color="textSecondary" className="block">Verification Status</Typography>
                                    <Typography variant="body2">{userData.verified ? "Verified Account" : "Unverified"}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Button 
                            variant="outlined" 
                            color="error" 
                            fullWidth 
                            className="mt-8"
                            sx={{ borderRadius: '8px' }}
                        >
                            Deactivate Account
                        </Button>
                    </Paper>
                </Grid>

                {/* Main Content Area */}
                <Grid item xs={12} lg={8}>
                    {/* Stats Overview */}
                    <Grid container spacing={3} className="mb-6">
                        <Grid item xs={12} sm={4}>
                            <Paper className="p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <Typography color="textSecondary" variant="caption" fontWeight="bold">TOTAL BOOKINGS</Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary">{userBookings.length}</Typography>
                            </Paper>
                        </Grid>
                        {/* More stats can be added here */}
                    </Grid>

                    {/* Booking History */}
                    <Paper className="p-6 rounded-xl shadow-sm border border-gray-100">
                        <Typography variant="h6" fontWeight="bold" className="flex items-center gap-2 mb-6">
                            <History color="primary" /> Booking History
                        </Typography>

                        {bookingsLoading ? (
                            <Box className="flex justify-center p-10"><CircularProgress size={30} /></Box>
                        ) : userBookings.length === 0 ? (
                            <Typography className="text-center py-10 text-gray-500">No bookings found for this user.</Typography>
                        ) : (
                            <div className="space-y-4">
                                {userBookings.map((booking) => (
                                    <Box key={booking.booking_id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex justify-between items-center">
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">{booking.brand} {booking.model}</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {moment(booking.start_ts).format('DD MMM')} - {moment(booking.end_ts).format('DD MMM YYYY')}
                                            </Typography>
                                        </Box>
                                        <Box className="text-right">
                                            <Chip 
                                                label={booking.status} 
                                                size="small" 
                                                color={booking.status === 'Completed' ? 'success' : 'default'}
                                                className="mb-1"
                                            />
                                            <Typography variant="body2" fontWeight="bold" className="block">৳{booking.total_cost}</Typography>
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

export default AdminUserDetail;
