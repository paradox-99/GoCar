import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import toast from 'react-hot-toast';
import { Box, TextField, Button, Typography, Paper, Slider, InputAdornment, Grid, Divider } from '@mui/material';
import { Speed, LocalGasStation, NoteAdd, ReceiptLong, CleaningServices, AccessTime } from '@mui/icons-material';

const DriverReturn = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();
    const bookingData = location.state?.booking;

    const [loading, setLoading] = useState(false);
    const [fuelLevel, setFuelLevel] = useState(100);
    const [odometer, setOdometer] = useState('');
    const [lateFee, setLateFee] = useState('0');
    const [fuelCharge, setFuelCharge] = useState('0');
    const [cleaningCharge, setCleaningCharge] = useState('0');
    const [notes, setNotes] = useState('');

    if (!bookingData) {
        return (
            <div className="p-6">
                <Typography variant="h6">No trip information found.</Typography>
                <Link to="/dashboard/driver/trips" className="text-primary underline">Back to Trips</Link>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!odometer) {
            toast.error('Please enter the final odometer reading');
            return;
        }

        setLoading(true);
        const returnData = {
            booking_id: bookingData.booking_id,
            fuel_level: fuelLevel,
            odometer_reading: parseInt(odometer),
            late_fee: parseFloat(lateFee),
            fuel_charge: parseFloat(fuelCharge),
            cleaning_charge: parseFloat(cleaningCharge),
            return_notes: notes
        };

        try {
            const response = await axiosPublic.post('/returnDamageRoutes/return', returnData);
            if (response.status === 201) {
                toast.success('Trip completed successfully! Final report recorded.');
                navigate('/dashboard/driver/trips');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to record return');
        } finally {
            setLoading(false);
        }
    };

    const totalExtra = parseFloat(lateFee || 0) + parseFloat(fuelCharge || 0) + parseFloat(cleaningCharge || 0);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-4">
                <Link to={`/dashboard/driver/trips/${bookingData.booking_id}`} state={{ booking: bookingData }} className="text-primary hover:underline">
                    ◀ Back to details
                </Link>
            </div>

            <Typography variant="h4" fontWeight="bold" gutterBottom>Complete Trip & Log Return</Typography>
            <Typography variant="body1" color="textSecondary" className="mb-8">
                Record final vehicle state and any extra charges for <strong>{bookingData.user_name}</strong>'s trip.
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                    <Paper className="p-8 rounded-xl shadow-sm border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom className="flex items-center gap-2">
                                            <Speed color="primary" /> Final Odometer (km)
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            placeholder="Enter mileage at return"
                                            value={odometer}
                                            onChange={(e) => setOdometer(e.target.value)}
                                            required
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">km</InputAdornment>,
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom className="flex items-center gap-2">
                                            <LocalGasStation color="primary" /> Final Fuel Level (%)
                                        </Typography>
                                        <Box className="px-4 py-2 bg-gray-50 rounded-lg">
                                            <Slider
                                                value={fuelLevel}
                                                onChange={(e, newValue) => setFuelLevel(newValue)}
                                                valueLabelDisplay="auto"
                                                step={1}
                                                min={0}
                                                max={100}
                                                sx={{
                                                    color: fuelLevel < 20 ? '#ef4444' : fuelLevel < 50 ? '#f59e0b' : '#10b981'
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom className="flex items-center gap-1">
                                            <AccessTime fontSize="small" color="action" /> Late Fee
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            size="small"
                                            value={lateFee}
                                            onChange={(e) => setLateFee(e.target.value)}
                                            placeholder="0"
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom className="flex items-center gap-1 text-sm">
                                            <LocalGasStation fontSize="small" color="action" /> Fuel Charge
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            size="small"
                                            value={fuelCharge}
                                            onChange={(e) => setFuelCharge(e.target.value)}
                                            placeholder="0"
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom className="flex items-center gap-1">
                                            <CleaningServices fontSize="small" color="action" /> Cleaning
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            size="small"
                                            value={cleaningCharge}
                                            onChange={(e) => setCleaningCharge(e.target.value)}
                                            placeholder="0"
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom className="flex items-center gap-2">
                                            <NoteAdd color="primary" /> Return Notes
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            placeholder="Describe return condition or reason for extra charges..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={loading}
                                sx={{
                                    background: '#f58300',
                                    '&:hover': { background: '#e07b00' },
                                    py: 2,
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    fontSize: '1.2rem',
                                    mt: 4
                                }}
                            >
                                {loading ? 'Processing...' : 'Finish Trip & Submit Return'}
                            </Button>
                        </form>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper className="p-6 rounded-xl shadow-sm border border-gray-100 bg-white">
                        <Typography variant="h6" fontWeight="bold" gutterBottom className="flex items-center gap-2">
                            <ReceiptLong color="primary" /> Charge Summary
                        </Typography>
                        <Box className="space-y-3 mt-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Late Fee:</span>
                                <span>৳{lateFee || 0}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Fuel Charge:</span>
                                <span>৳{fuelCharge || 0}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Cleaning Charge:</span>
                                <span>৳{cleaningCharge || 0}</span>
                            </div>
                            <Divider className="my-2" />
                            <div className="flex justify-between font-bold text-lg text-primary">
                                <span>Extra Amount:</span>
                                <span>৳{totalExtra}</span>
                            </div>
                        </Box>

                        <Box className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-100">
                             <Typography variant="caption" className="text-orange-800 leading-tight block">
                                 Note: These charges will be added to the customer's final payment and must be collected or handled as per agency policy.
                             </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default DriverReturn;
