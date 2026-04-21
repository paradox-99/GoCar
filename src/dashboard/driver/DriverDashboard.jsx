import React, { useEffect, useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAuth from "../../hooks/useAuth";
import { Box, Typography, Paper, Grid, Avatar, Chip, Divider, Switch, FormControlLabel } from "@mui/material";
import { DirectionsCar, History, Star, Payment } from "@mui/icons-material";
import NotificationMenu from "../../components/NotificationMenu";

const DriverDashboard = () => {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.email) return;
        axiosPublic.get(`/driverRoutes/profile/${user.email}`, { withCredentials: true })
            .then((res) => {
                setProfile(res.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [axiosPublic, user?.email]);

    if (loading) return <div className="p-10">Loading your profile...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={profile?.photo} sx={{ width: 64, height: 64, border: '3px solid #F58300' }} />
                    <Box>
                        <Typography variant="h4" fontWeight="bold">Driver Core</Typography>
                        <Typography color="textSecondary">{profile?.name} • {profile?.verified ? "✅ Verified Pro" : "⏳ Verification Pending"}</Typography>
                    </Box>
                </Box>
                <NotificationMenu color="primary" />
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper className="p-6 rounded-2xl shadow-sm border border-gray-100">
                        <Box className="flex justify-between items-center mb-4">
                            <Typography variant="h6" fontWeight="bold">Online Status</Typography>
                            <FormControlLabel
                                control={<Switch checked={profile?.availability || false} color="primary" />}
                                label={profile?.availability ? "Accepting Jobs" : "Offline"}
                                labelPlacement="start"
                            />
                        </Box>
                        <Divider />
                        <Grid container spacing={4} sx={{ mt: 2 }}>
                            <Grid item xs={6} md={3}>
                                <Typography variant="caption" color="textSecondary">HOURLY RATE</Typography>
                                <Typography variant="h6" fontWeight="bold">৳ {profile?.rental_price}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="caption" color="textSecondary">EXPERIENCE</Typography>
                                <Typography variant="h6" fontWeight="bold">{profile?.experience_years || 0} Years</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="caption" color="textSecondary">TOTAL TRIPS</Typography>
                                <Typography variant="h6" fontWeight="bold">0</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="caption" color="textSecondary">RATING</Typography>
                                <Box className="flex items-center gap-1">
                                    <Star sx={{ color: '#ffb400' }} />
                                    <Typography variant="h6" fontWeight="bold">5.0</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <Paper className="p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <History sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h6" fontWeight="bold">Trip History</Typography>
                                <Typography variant="body2" color="textSecondary">Review your past completed journeys</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper className="p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <Payment sx={{ fontSize: 40, color: '#00c853', mb: 1 }} />
                                <Typography variant="h6" fontWeight="bold">Earnings</Typography>
                                <Typography variant="body2" color="textSecondary">৳ 0.00 Total earned this week</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper className="p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Vehicle Assigned</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box className="flex flex-col items-center py-8">
                            <DirectionsCar sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
                            <Typography color="textSecondary">No vehicle currently assigned</Typography>
                            <Chip label="Standby Mode" size="small" sx={{ mt: 2 }} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default DriverDashboard;
