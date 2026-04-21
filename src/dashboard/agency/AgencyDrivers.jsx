import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import { Box, Typography, Paper, Grid, Avatar, Chip, Button, Divider } from '@mui/material';
import { Phone, Email, Verified, Star, Badge } from '@mui/icons-material';

const AgencyDrivers = () => {
    const axiosPublic = useAxiosPublic();
    const { user } = useAuth();

    const { data: drivers, isLoading } = useQuery({
        queryKey: ['agency-drivers', user?.email],
        queryFn: async () => {
            const response = await axiosPublic.get(`driverRoutes/agencyDrivers/${user?.email}`);
            return response.data;
        },
        enabled: !!user?.email
    });

    if (isLoading) return <Box className="flex justify-center items-center py-20"><Loader /></Box>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Box className="flex justify-between items-center mb-8">
                <Box>
                    <Typography variant="h4" fontWeight="bold">My Drivers</Typography>
                    <Typography color="textSecondary">Manage and monitor your agency's professional drivers.</Typography>
                </Box>
                <Button variant="contained" sx={{ background: '#F58300', '&:hover': { background: '#e07b00' }}}>
                    Add New Driver
                </Button>
            </Box>

            {!drivers || drivers.length === 0 ? (
                <Paper className="p-10 text-center rounded-xl shadow-sm">
                    <Typography variant="h6" color="textSecondary">No drivers registered under your agency yet.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={4}>
                    {drivers.map((driver) => (
                        <Grid item xs={12} md={6} lg={4} key={driver.driver_id}>
                            <Paper className="p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col">
                                <Box className="flex justify-between items-start mb-4">
                                    <Avatar 
                                        src={driver.photo} 
                                        sx={{ width: 80, height: 80, border: '3px solid #f0f0f0' }}
                                    />
                                    <Box className="text-right">
                                        <Chip 
                                            label={driver.verified ? "Verified" : "Pending"} 
                                            color={driver.verified ? "success" : "warning"} 
                                            size="small" 
                                            icon={driver.verified ? <Verified /> : null}
                                            variant="outlined"
                                        />
                                        <Box className="flex items-center justify-end mt-1 text-yellow-600">
                                            <Star fontSize="small" />
                                            <Typography variant="body2" fontWeight="bold" className="ml-1">{driver.rating || 'N/A'}</Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Typography variant="h6" fontWeight="bold">{driver.name}</Typography>
                                <Typography variant="caption" color="textSecondary" gutterBottom>ID: {driver.driver_id}</Typography>
                                
                                <Divider className="my-3" />

                                <Box className="space-y-2 flex-grow">
                                    <Box className="flex items-center gap-2 text-gray-600">
                                        <Email sx={{ fontSize: 18 }} />
                                        <Typography variant="body2">{driver.email}</Typography>
                                    </Box>
                                    <Box className="flex items-center gap-2 text-gray-600">
                                        <Phone sx={{ fontSize: 18 }} />
                                        <Typography variant="body2">{driver.phone}</Typography>
                                    </Box>
                                    <Box className="flex items-center gap-2 text-gray-600">
                                        <Badge sx={{ fontSize: 18 }} />
                                        <Typography variant="body2">{driver.experience_year} Years Experience</Typography>
                                    </Box>
                                </Box>

                                <Box className="mt-6 flex justify-between items-center">
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">Hiring Price</Typography>
                                        <Typography variant="subtitle1" fontWeight="bold" color="primary">৳{driver.rental_price}/Day</Typography>
                                    </Box>
                                    <Button size="small" variant="outlined" sx={{ borderColor: '#F58300', color: '#F58300' }}>
                                        View Details
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default AgencyDrivers;
