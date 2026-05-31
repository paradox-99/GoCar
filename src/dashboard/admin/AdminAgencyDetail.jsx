import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Divider, Avatar, Chip, Button, CircularProgress } from '@mui/material';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import moment from 'moment';
import { Business,  Email, Phone, LocationOn, DirectionsCar, TwoWheeler} from '@mui/icons-material';
import toast from 'react-hot-toast';

const AdminAgencyDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const axiosPublic = useAxiosPublic();
    
    const [agency, setAgency] = useState(location.state?.agency || null);
    const [loading, setLoading] = useState(!location.state?.agency);

    useEffect(() => {
        if (!agency && id) {
            fetchAgency();
        }
    }, [id]);

    const fetchAgency = async () => {
        try {
            const response = await axiosPublic.get(`agencyRoutes/agency-by-id-detailed/${id}`);
            setAgency(response.data);
        } catch (error) {
            toast.error('Failed to fetch agency details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box className="flex justify-center items-center h-screen"><CircularProgress /></Box>;
    if (!agency) return <Box className="p-6 text-center"><Typography>Agency not found.</Typography></Box>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Link to="/dashboard/admin/agencies" className="text-primary hover:underline flex items-center gap-1 mb-6">
                ◀ Back to Agencies
            </Link>

            <Grid container spacing={4}>
                {/* Agency Info Side Card */}
                <Grid item xs={12} lg={4}>
                    <Paper className="p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <Avatar sx={{ bgcolor: 'primary.main', width: 100, height: 100, mb: 2 }}>
                            <Business sx={{ fontSize: 60 }} />
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold" textAlign="center">{agency.agency_name}</Typography>
                        <Chip 
                            label={agency.verified ? "Verified Agency" : "Pending Verification"} 
                            color={agency.verified ? "success" : "warning"} 
                            size="small" 
                            className="mt-2 mb-6"
                        />
                        
                        <Divider className="w-full my-4" />
                        
                        <Box className="w-full space-y-4">
                            <Box className="flex items-center gap-3">
                                <Email color="disabled" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary" className="block text-xs">Agency Email</Typography>
                                    <Typography variant="body2">{agency.email}</Typography>
                                </Box>
                            </Box>
                            <Box className="flex items-center gap-3">
                                <Phone color="disabled" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary" className="block text-xs">Contact Number</Typography>
                                    <Typography variant="body2">{agency.phone_number}</Typography>
                                </Box>
                            </Box>
                            <Box className="flex items-center gap-3">
                                <LocationOn color="disabled" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary" className="block text-xs">Location</Typography>
                                    <Typography variant="body2">{agency.agency_full_address || agency.city}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Box className="w-full mt-8 pt-6 border-t">
                            <Typography variant="subtitle2" fontWeight="bold" className="mb-4">Owner Information</Typography>
                            <Box className="flex items-center gap-3 mb-4">
                                <Avatar src={agency.owner_photo} sx={{ width: 48, height: 48 }} />
                                <Box>
                                    <Typography variant="body2" fontWeight="bold">{agency.owner_name}</Typography>
                                    <Typography variant="caption" color="textSecondary">{agency.owner_email}</Typography>
                                </Box>
                            </Box>
                            <Button 
                                component={Link} 
                                to={`/dashboard/admin/users/${agency.owner_id}`}
                                variant="outlined" 
                                fullWidth 
                                size="small"
                                sx={{ borderRadius: '8px' }}
                            >
                                View Owner Profile
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Main Content Area */}
                <Grid item xs={12} lg={8}>
                    {/* Fleet Stats Overview */}
                    <Typography variant="h6" fontWeight="bold" className="mb-4">Fleet Overview</Typography>
                    <Grid container spacing={3} className="mb-8">
                        <Grid item xs={12} sm={6}>
                            <Paper className="p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <Box className="p-3 bg-blue-50 rounded-lg">
                                    <DirectionsCar color="primary" />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">{agency.car_count || 0}</Typography>
                                    <Typography variant="body2" color="textSecondary">Cars in Fleet</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Paper className="p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <Box className="p-3 bg-orange-50 rounded-lg">
                                    <TwoWheeler sx={{ color: '#F58300' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">{agency.bike_count || 0}</Typography>
                                    <Typography variant="body2" color="textSecondary">Bikes in Fleet</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Agency Documentation */}
                    <Paper className="p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                        <Typography variant="h6" fontWeight="bold" className="mb-6">Legal Documentation</Typography>
                        <Grid container spacing={4}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="textSecondary" className="block mb-1">Trade License Number</Typography>
                                <Typography variant="body1" fontWeight="bold">{agency.license || 'Not provided'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="textSecondary" className="block mb-1">TIN Number</Typography>
                                <Typography variant="body1" fontWeight="bold">{agency.tin || 'Not provided'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="textSecondary" className="block mb-1">Insurance Policy Number</Typography>
                                <Typography variant="body1" fontWeight="bold">{agency.insurancenumber || 'Not provided'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="textSecondary" className="block mb-1">License Expiry Date</Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {agency.tradelicenseexpire ? moment(agency.tradelicenseexpire).format('DD MMM YYYY') : 'N/A'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Verification Actions */}
                    {!agency.verified && (
                        <Paper className="p-6 rounded-xl border border-orange-200 bg-orange-50 mb-8 flex justify-between items-center">
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" color="orange.900">Verification Pending</Typography>
                                <Typography variant="body2" color="orange.800">Please review the documentation before verifying this agency.</Typography>
                            </Box>
                            <Button 
                                variant="contained" 
                                sx={{ bgcolor: '#F58300', '&:hover': { bgcolor: '#e07b00' } }}
                            >
                                Verify Agency
                            </Button>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </div>
    );
};

export default AdminAgencyDetail;
