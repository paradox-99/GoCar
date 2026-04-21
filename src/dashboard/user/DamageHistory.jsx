import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Divider, IconButton, Tooltip, Skeleton } from '@mui/material';
import { IoEyeOutline, IoCalendarOutline, IoConstructOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import moment from 'moment';

const DamageHistory = () => {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            if (!user?.email) return;
            try {
                const userRes = await axiosPublic.get(`userRoute/getUserInfo/${user.email}`);
                const userId = userRes.data[0]?.user_id || userRes.data[0]?._id;
                
                if (userId) {
                    const res = await axiosPublic.get(`returnDamageRoutes/user-reports/${userId}`);
                    setReports(res.data);
                }
            } catch (error) {
                console.error('Error fetching damage reports:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [user]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'reported': return 'warning';
            case 'under_review': return 'info';
            case 'resolved': return 'success';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    if (loading) return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Damage Report History</Typography>
            <Grid container spacing={3}>
                {[1, 2, 3].map(i => (
                    <Grid item xs={12} key={i}><Skeleton variant="rectangular" height={160} sx={{ borderRadius: 4 }} /></Grid>
                ))}
            </Grid>
        </Box>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Damage Report History</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Track the status of your reported damages.
            </Typography>

            {reports.length === 0 ? (
                <Box sx={{ py: 10, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 4 }}>
                    <IoCheckmarkCircleOutline size={64} color="#ccc" />
                    <Typography variant="h6" sx={{ mt: 2 }}>No damage reports found</Typography>
                    <Typography color="text.secondary">All your previous rentals were trouble-free!</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {reports.map((report) => (
                        <Grid item xs={12} key={report.damage_id}>
                            <Card elevation={2} sx={{ borderRadius: 4, overflow: 'hidden', transition: '0.3s', '&:hover': { boxShadow: 4 } }}>
                                <Grid container>
                                    <Grid item xs={12} md={3}>
                                        <Box 
                                            component="img"
                                            src={report.car_images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                                            sx={{ width: '100%', height: '100%', objectCover: 'cover', minHeight: 160 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={9}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                <Box>
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {report.brand} {report.model}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mt: 0.5 }}>
                                                        <IoCalendarOutline />
                                                        <Typography variant="caption">
                                                            Reported {moment(report.report_date).format('MMM DD, YYYY at hh:mm A')}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Chip 
                                                    label={report.status?.toUpperCase().replace('_', ' ')} 
                                                    color={getStatusColor(report.status)} 
                                                    size="small" 
                                                    fontWeight="bold"
                                                />
                                            </Box>
                                            
                                            <Divider sx={{ mb: 2 }} />
                                            
                                            <Grid container spacing={2}>
                                                <Grid item xs={6} md={3}>
                                                    <Typography variant="caption" color="text.secondary" display="block">DAMAGE TYPE</Typography>
                                                    <Typography variant="body2" fontWeight="bold">{report.damage_type}</Typography>
                                                </Grid>
                                                <Grid item xs={6} md={3}>
                                                    <Typography variant="caption" color="text.secondary" display="block">SEVERITY</Typography>
                                                    <Typography variant="body2" sx={{ color: report.severity === 'major' ? 'error.main' : 'warning.main', fontWeight: 'bold', textTransform: 'capitalize' }}>
                                                        {report.severity}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="caption" color="text.secondary" display="block">DESCRIPTION</Typography>
                                                    <Typography variant="body2" className="line-clamp-2">
                                                        {report.description || 'No description provided'}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Grid>
                                </Grid>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default DamageHistory;
