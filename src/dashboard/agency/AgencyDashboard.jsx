import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAuth from '../../hooks/useAuth';
import { Box, Typography, Grid, Paper, CircularProgress, Divider } from '@mui/material';
import { DirectionsCar, People, CardTravel, MonetizationOn } from '@mui/icons-material';
import NotificationMenu from '../../components/NotificationMenu';

const AgencyDashboard = () => {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['agency-stats', user?.email],
        queryFn: async () => {
             // Get user info to get DB ID
            const userRes = await axiosPublic.get(`userRoute/getUserInfo/${user.email}`);
            const userId = userRes.data[0]?.user_id || userRes.data[0]?._id;
            const res = await axiosPublic.get(`agencyRoutes/agency-info/${userId}`);
            // This is a simplified version, you might need a specific agency-stats endpoint later
            return res.data;
        },
        enabled: !!user?.email
    });

    if (isLoading) return <Box className="flex justify-center items-center h-screen"><CircularProgress /></Box>;

    const dashboardCards = [
        { title: 'My Fleet', value: stats?.car_count || 0, icon: <DirectionsCar color="primary" />, color: 'bg-blue-50' },
        { title: 'Total Drivers', value: stats?.driver_count || 0, icon: <People color="secondary" />, color: 'bg-purple-50' },
        { title: 'Active Bookings', value: 'Check Bookings', icon: <CardTravel sx={{ color: '#F58300' }} />, color: 'bg-orange-50' },
        { title: 'Monthly Revenue', value: '৳ 0', icon: <MonetizationOn sx={{ color: '#00c853' }} />, color: 'bg-green-50' },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" className="font-outfit">Agency Command Center</Typography>
                    <Typography color="textSecondary">Welcome back, {stats?.agency_name || 'Partner'}</Typography>
                </Box>
                <NotificationMenu color="primary" />
            </Box>

            <Grid container spacing={3}>
                {dashboardCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper className={`p-6 rounded-2xl shadow-sm border border-transparent hover:border-gray-200 transition-all ${card.color}`}>
                            <Box className="flex justify-between items-start mb-4">
                                <Box className="p-3 bg-white rounded-xl shadow-xs">
                                    {card.icon}
                                </Box>
                            </Box>
                            <Typography variant="h5" fontWeight="bold" className="mb-1">{card.value}</Typography>
                            <Typography variant="body2" color="textSecondary" fontWeight="medium">{card.title}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4} className="mt-8">
                <Grid item xs={12} md={7}>
                    <Paper className="p-6 rounded-2xl shadow-sm border border-gray-100">
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Notifications Feed</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Typography color="textSecondary" className="py-10 text-center">Your recent activities and notifications will appear here.</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Paper className="p-6 rounded-2xl shadow-sm border border-gray-100">
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Quick Actions</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box className="flex flex-col gap-2">
                            <Typography variant="body2" className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">➕ Add New Vehicle</Typography>
                            <Typography variant="body2" className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">📅 Manage Bookings</Typography>
                            <Typography variant="body2" className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">🚗 Assign Drivers</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default AgencyDashboard;