import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import toast from 'react-hot-toast';
import { Box, TextField, Button, Typography, Paper, Slider, InputAdornment } from '@mui/material';
import { Speed, LocalGasStation, NoteAdd } from '@mui/icons-material';

const DriverPickup = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();
    const bookingData = location.state?.booking;

    const [loading, setLoading] = useState(false);
    const [fuelLevel, setFuelLevel] = useState(50);
    const [odometer, setOdometer] = useState('');
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
            toast.error('Please enter the current odometer reading');
            return;
        }

        setLoading(true);
        const pickupData = {
            booking_id: bookingData.booking_id,
            fuel_level: fuelLevel,
            odometer_reading: parseInt(odometer),
            pickup_notes: notes
        };

        try {
            const response = await axiosPublic.post('/returnDamageRoutes/pickup', pickupData);
            if (response.status === 201) {
                toast.success('Pickup recorded successfully! Trip is now ongoing.');
                navigate('/dashboard/driver/trips');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to record pickup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-4">
                <Link to={`/dashboard/driver/trips/${bookingData.booking_id}`} state={{ booking: bookingData }} className="text-primary hover:underline">
                    ◀ Back to details
                </Link>
            </div>

            <Typography variant="h4" fontWeight="bold" gutterBottom>Log Trip Pickup</Typography>
            <Typography variant="body1" color="textSecondary" className="mb-8">
                Confirm vehicle condition at the start of the trip for <strong>{bookingData.user_name}</strong>.
            </Typography>

            <Paper className="max-w-2xl p-8 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Odometer Section */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom className="flex items-center gap-2">
                            <Speed color="primary" /> Odometer Reading (km)
                        </Typography>
                        <TextField
                            fullWidth
                            type="number"
                            placeholder="Enter current mileage"
                            value={odometer}
                            onChange={(e) => setOdometer(e.target.value)}
                            required
                            InputProps={{
                                endAdornment: <InputAdornment position="end">km</InputAdornment>,
                            }}
                        />
                        <Typography variant="caption" color="textSecondary">
                            Check the dashboard for the exact reading.
                        </Typography>
                    </Box>

                    {/* Fuel Level Section */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom className="flex items-center gap-2">
                            <LocalGasStation color="primary" /> Current Fuel Level (%)
                        </Typography>
                        <Box className="px-4 py-6 bg-gray-50 rounded-lg">
                            <Slider
                                value={fuelLevel}
                                onChange={(e, newValue) => setFuelLevel(newValue)}
                                valueLabelDisplay="on"
                                step={1}
                                min={0}
                                max={100}
                                sx={{
                                    color: fuelLevel < 20 ? '#ef4444' : fuelLevel < 50 ? '#f59e0b' : '#10b981'
                                }}
                            />
                            <div className="flex justify-between mt-2 text-xs font-semibold">
                                <span className="text-red-500">Empty</span>
                                <span className="text-green-500">Full</span>
                            </div>
                        </Box>
                    </Box>

                    {/* Notes Section */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom className="flex items-center gap-2">
                            <NoteAdd color="primary" /> Pickup Notes
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Describe vehicle condition (any pre-existing scratches, cleanliness, etc.)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </Box>

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
                            fontSize: '1.1rem'
                        }}
                    >
                        {loading ? 'Recording...' : 'Confirm Pickup & Start Trip'}
                    </Button>
                </form>
            </Paper>
        </div>
    );
};

export default DriverPickup;
