import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useRole from '../../hooks/useRole';
import toast from 'react-hot-toast';
import { Box, TextField, Button, Typography, Paper, Grid, MenuItem, InputAdornment } from '@mui/material';
import { ReportProblem, CameraAlt, AttachMoney, Description } from '@mui/icons-material';

const DamageReportForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();
    const role = useRole();
    const bookingData = location.state?.booking;

    const [loading, setLoading] = useState(false);
    const [damageType, setDamageType] = useState('Scratches');
    const [severity, setSeverity] = useState('Minor');
    const [description, setDescription] = useState('');
    const [estimatedCost, setEstimatedCost] = useState('0');
    const [photoUrl, setPhotoUrl] = useState(''); // Simple text input for photo URL for now

    if (!bookingData) {
        return <div className="p-6">No booking context. <Link to="/dashboard" className="underline">Go Back</Link></div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const damageData = {
            booking_id: bookingData.booking_id,
            car_id: bookingData.vehicle_id || bookingData.car_id,
            reported_by: role?.user_id,
            damage_type: damageType,
            severity: severity.toLowerCase(),
            description: description,
            photos: photoUrl,
            estimated_cost: parseInt(estimatedCost)
        };

        try {
            const response = await axiosPublic.post('/returnDamageRoutes/damage', damageData);
            if (response.status === 201) {
                toast.success('Damage report submitted successfully.');
                // Navigate back to wherever they came from
                navigate(-1);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    const damageTypes = ['Scratches', 'Dents', 'Broken Glass', 'Engine Issue', 'Interior Damage', 'Accident', 'Other'];
    const severities = ['Minor', 'Moderate', 'Severe', 'Critical'];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <Box className="mb-6">
                    <Typography variant="h4" fontWeight="bold" gutterBottom>Report Vehicle Damage</Typography>
                    <Typography variant="body1" color="textSecondary">
                        Provide accurate details about the damage for Booking #{bookingData.booking_id}.
                    </Typography>
                </Box>

                <Paper className="p-8 rounded-xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Damage Type"
                                    value={damageType}
                                    onChange={(e) => setDamageType(e.target.value)}
                                    required
                                >
                                    {damageTypes.map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Severity"
                                    value={severity}
                                    onChange={(e) => setSeverity(e.target.value)}
                                    required
                                >
                                    {severities.map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Damage Description"
                                    placeholder="Describe exactly what happened and where the damage is..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Estimated Repair Cost"
                                    type="number"
                                    value={estimatedCost}
                                    onChange={(e) => setEstimatedCost(e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">৳</InputAdornment>,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Photo URL"
                                    placeholder="Paste image link here"
                                    value={photoUrl}
                                    onChange={(e) => setPhotoUrl(e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><CameraAlt fontSize="small" /></InputAdornment>,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} className="flex gap-4 mt-4">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    sx={{
                                        background: '#ef4444',
                                        '&:hover': { background: '#dc2626' },
                                        fontWeight: 'bold',
                                        px: 6
                                    }}
                                >
                                    {loading ? 'Submitting...' : 'Submit Report'}
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="large" 
                                    onClick={() => navigate(-1)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </div>
        </div>
    );
};

export default DamageReportForm;
