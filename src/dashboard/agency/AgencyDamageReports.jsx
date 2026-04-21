import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Divider, Button, Avatar, MenuItem, Select, FormControl, InputLabel, Skeleton } from '@mui/material';
import { IoAlertCircleOutline, IoCheckmarkDoneOutline, IoTimeOutline, IoHammerOutline } from 'react-icons/io5';
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import moment from 'moment';
import toast from 'react-hot-toast';

const AgencyDamageReports = () => {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        if (!user?.email) return;
        try {
             // Often agencies are identified by their owner_id (user_id)
            const userRes = await axiosPublic.get(`userRoute/getUserInfo/${user.email}`);
            const userId = userRes.data[0]?.user_id || userRes.data[0]?._id;
            
            // First get agency_id for this owner
            const agencyRes = await axiosPublic.get(`agencyRoutes/agency-info/${userId}`);
            const agencyId = agencyRes.data?.agency_id;

            if (agencyId) {
                const res = await axiosPublic.get(`returnDamageRoutes/agency-reports/${agencyId}`);
                setReports(res.data);
            }
        } catch (error) {
            console.error('Error fetching agency reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [user]);

    const handleStatusUpdate = async (damageId, newStatus) => {
        try {
            await axiosPublic.patch(`returnDamageRoutes/damage-status/${damageId}`, { status: newStatus });
            toast.success(`Report status updated to ${newStatus}`);
            fetchReports();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'reported': return 'error';
            case 'under_review': return 'warning';
            case 'resolved': return 'success';
            default: return 'default';
        }
    };

    if (loading) return <Box sx={{ p: 4 }}><Skeleton variant="rectangular" height={400} /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Vehicle Damage Reports</Typography>
                    <Typography variant="body1" color="text.secondary">Review and manage damage reports from customers.</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                    <IoAlertCircleOutline size={32} />
                </Avatar>
            </Box>

            {reports.length === 0 ? (
                <Card sx={{ p: 10, textAlign: 'center', borderRadius: 4 }}>
                    <IoCheckmarkDoneOutline size={64} color="#4caf50" />
                    <Typography variant="h6" sx={{ mt: 2 }}>No pending damage reports</Typography>
                    <Typography color="text.secondary">All your vehicles are in good shape!</Typography>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {reports.map((report) => (
                        <Grid item xs={12} key={report.damage_id}>
                            <Card elevation={3} sx={{ borderRadius: 4 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Avatar children={report.reported_by_name?.[0]} />
                                            <Box>
                                                <Typography variant="h6" fontWeight="bold">{report.brand} {report.model}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Reported by: <b>{report.reported_by_name}</b> • {moment(report.report_date).fromNow()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Chip 
                                            label={report.status?.toUpperCase()} 
                                            color={getStatusColor(report.status)} 
                                            icon={<IoTimeOutline />}
                                        />
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={8}>
                                            <Typography variant="subtitle2" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <IoHammerOutline /> Damage Details
                                            </Typography>
                                            <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                                                <Typography variant="body2"><strong>Type:</strong> {report.damage_type} • <strong>Severity:</strong> <span style={{ color: report.severity === 'major' ? 'red' : 'orange', fontWeight: 'bold' }}>{report.severity}</span></Typography>
                                                <Typography variant="body2" sx={{ mt: 1 }}><strong>Description:</strong> {report.description}</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Manage Status</Typography>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={report.status}
                                                    onChange={(e) => handleStatusUpdate(report.damage_id, e.target.value)}
                                                >
                                                    <MenuItem value="reported">Reported (New)</MenuItem>
                                                    <MenuItem value="under_review">Under Review</MenuItem>
                                                    <MenuItem value="resolved">Resolved / Repaired</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
                                                Estimated Cost: ৳ {Number(report.estimated_cost).toLocaleString()}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default AgencyDamageReports;
