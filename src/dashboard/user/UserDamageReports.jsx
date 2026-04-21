import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useRole from '../../hooks/useRole';
import Loader from '../../components/Loader';
import moment from 'moment';
import { Box, Typography, Paper, Grid, Chip, Divider, IconButton, Tooltip } from '@mui/material';
import { ReportProblem, DirectionsCar, CalendarToday, Info } from '@mui/icons-material';

const UserDamageReports = () => {
    const axiosPublic = useAxiosPublic();
    const role = useRole();

    const { data: reports, isLoading } = useQuery({
        queryKey: ['user-damage-reports', role?.user_id],
        queryFn: async () => {
            const response = await axiosPublic.get(`returnDamageRoutes/user-reports/${role?.user_id}`);
            return response.data;
        },
        enabled: !!role?.user_id
    });

    if (isLoading) return <Box className="flex justify-center items-center py-20"><Loader /></Box>;

    const severityColors = {
        'minor': 'success',
        'moderate': 'warning',
        'severe': 'error',
        'critical': 'error'
    };

    const statusColors = {
        'reported': 'info',
        'under-review': 'warning',
        'resolved': 'success',
        'rejected': 'error'
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Box className="mb-8">
                <Typography variant="h4" fontWeight="bold">My Damage Reports</Typography>
                <Typography color="textSecondary">View the status and details of damages you've reported.</Typography>
            </Box>

            {!reports || reports.length === 0 ? (
                <Paper className="p-10 text-center rounded-xl shadow-sm">
                    <Typography variant="h6" color="textSecondary">You haven't reported any vehicle damages yet.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {reports.map((report) => (
                        <Grid item xs={12} key={report.damage_id}>
                            <Paper className="p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <Grid container spacing={3} alignItems="center">
                                    {/* Vehicle Info */}
                                    <Grid item xs={12} md={3}>
                                        <Box className="flex gap-4 items-center">
                                            {report.car_images && (
                                                <img 
                                                    src={report.car_images[0]} 
                                                    className="w-16 h-16 rounded-lg object-cover border"
                                                    alt={report.model}
                                                />
                                            )}
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">{report.brand} {report.model}</Typography>
                                                <Typography variant="caption" color="textSecondary" className="block">Booking ID: {report.booking_id}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* Damage Details */}
                                    <Grid item xs={12} md={4}>
                                        <Box className="flex items-center gap-2 mb-1">
                                            <Typography variant="body2" fontWeight="bold">{report.damage_type}</Typography>
                                            <Chip 
                                                label={report.severity} 
                                                size="small" 
                                                color={severityColors[report.severity] || 'default'}
                                                variant="outlined"
                                            />
                                        </Box>
                                        <Typography variant="body2" className="text-gray-600 line-clamp-2 italic">
                                            "{report.description || 'No description provided'}"
                                        </Typography>
                                    </Grid>

                                    {/* Status & Date */}
                                    <Grid item xs={12} md={3}>
                                        <Box className="flex flex-col items-start md:items-center">
                                            <Chip 
                                                label={report.status?.toUpperCase()} 
                                                color={statusColors[report.status] || 'default'}
                                                className="font-bold mb-1"
                                            />
                                            <Box className="flex items-center gap-1 text-gray-400">
                                                <CalendarToday sx={{ fontSize: 14 }} />
                                                <Typography variant="caption">
                                                    {moment(report.report_date).format('DD MMM YYYY')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* Actions */}
                                    <Grid item xs={12} md={2} className="text-right">
                                        <Tooltip title="Estimated Repair Cost">
                                            <Box className="p-2 bg-gray-100 rounded-lg inline-block">
                                                <Typography variant="caption" color="textSecondary" className="block">Est. Cost</Typography>
                                                <Typography variant="body2" fontWeight="bold">৳{report.estimated_cost}</Typography>
                                            </Box>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default UserDamageReports;
