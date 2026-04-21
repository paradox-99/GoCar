import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { People, Business, DirectionsCar, EventNote, MonetizationOn } from '@mui/icons-material';
import { FaUserTie } from 'react-icons/fa';
import NotificationMenu from '../../components/NotificationMenu';

const AdminDashboard = () => {
    const axiosPublic = useAxiosPublic();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const response = await axiosPublic.get('agencyRoutes/admin-stats');
            return response.data;
        }
    });

    if (isLoading) return <Box className="flex justify-center items-center h-screen"><CircularProgress /></Box>;

    const statCards = [
        { title: 'Total Users', value: stats?.total_users, icon: <People color="primary" />, color: 'bg-blue-50' },
        { title: 'Total Agencies', value: stats?.total_agencies, icon: <Business color="secondary" />, color: 'bg-purple-50' },
        { title: 'Total Drivers', value: stats?.total_drivers, icon: <FaUserTie color="#F58300" />, color: 'bg-orange-50' },
        { title: 'Fleet Size', value: stats?.total_vehicles, icon: <DirectionsCar sx={{ color: '#00c853' }} />, color: 'bg-green-50' },
        { title: 'Total Bookings', value: stats?.total_bookings, icon: <EventNote color="info" />, color: 'bg-blue-50' },
        { title: 'Total Revenue', value: `৳${stats?.total_revenue || 0}`, icon: <MonetizationOn color="error" />, color: 'bg-red-50' },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 8 }}>
                <Typography variant="h4" fontWeight="bold" className="font-outfit">Platform Overview</Typography>
                <NotificationMenu color="primary" />
            </Box>
            
            <Grid container spacing={4}>
                {statCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                        <Paper className={`p-6 rounded-2xl shadow-sm border border-transparent hover:border-gray-200 transition-all ${card.color}`}>
                            <Box className="flex justify-between items-start mb-4">
                                <Box className="p-2 bg-white rounded-xl shadow-xs">
                                    {card.icon}
                                </Box>
                            </Box>
                            <Typography variant="h5" fontWeight="bold" className="mb-1">{card.value}</Typography>
                            <Typography variant="body2" color="textSecondary" fontWeight="medium">{card.title}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Placeholder for charts or recent activity */}
            <Grid container spacing={4} className="mt-8">
                <Grid item xs={12} md={8}>
                    <Paper className="p-8 rounded-2xl shadow-sm min-h-[400px] flex items-center justify-center border border-gray-100">
                        <Typography color="textSecondary">Activity Charts Coming Soon...</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper className="p-8 rounded-2xl shadow-sm min-h-[400px] flex items-center justify-center border border-gray-100">
                        <Typography color="textSecondary">Recent Notifications</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default AdminDashboard;