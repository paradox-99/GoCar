import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, TextField, Button, MenuItem, FormControl, InputLabel, Select, IconButton, Divider } from '@mui/material';
import { IoCameraOutline, IoDocumentTextOutline, IoAlertCircleOutline } from 'react-icons/io5';
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ReportDamage = () => {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        booking_id: '',
        damage_type: 'Other',
        severity: 'minor',
        description: '',
        photos: [],
        estimated_cost: 0
    });

    useEffect(() => {
        const fetchRecentBookings = async () => {
            if (!user?.email) return;
            try {
                const userRes = await axiosPublic.get(`userRoute/getUserInfo/${user.email}`);
                const userId = userRes.data[0]?.user_id || userRes.data[0]?._id;
                
                if (userId) {
                    const res = await axiosPublic.get(`bookingRoutes/user/${userId}`);
                    // Filter for active or recently completed bookings
                    setBookings(res.data);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
            }
        };
        fetchRecentBookings();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.booking_id) {
            toast.error('Please select a booking');
            return;
        }

        setLoading(true);
        try {
            const userRes = await axiosPublic.get(`userRoute/getUserInfo/${user.email}`);
            const userId = userRes.data[0]?.user_id || userRes.data[0]?._id;
            
            const selectedBooking = bookings.find(b => b.booking_id === formData.booking_id);
            
            const payload = {
                ...formData,
                reported_by: userId,
                car_id: selectedBooking?.vehicle_id
            };

            await axiosPublic.post('returnDamageRoutes/damage', payload);
            toast.success('Damage report submitted successfully');
            navigate('/dashboard/damage-history');
        } catch (error) {
            console.error('Error submitting report:', error);
            toast.error('Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <IoAlertCircleOutline size={32} color="#F58300" />
                <Typography variant="h4" fontWeight="bold">Report Damage</Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Please provide accurate details about the damage to help us process your report.
            </Typography>

            <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ bgcolor: 'secondary.main', p: 1 }} />
                <CardContent sx={{ p: 4 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Select Booking</InputLabel>
                                    <Select
                                        name="booking_id"
                                        value={formData.booking_id}
                                        onChange={handleChange}
                                        label="Select Booking"
                                    >
                                        {bookings.map((booking) => (
                                            <MenuItem key={booking.booking_id} value={booking.booking_id}>
                                                {booking.brand} {booking.model} - {new Date(booking.start_ts).toLocaleDateString()} ({booking.booking_id})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Damage Type</InputLabel>
                                    <Select
                                        name="damage_type"
                                        value={formData.damage_type}
                                        onChange={handleChange}
                                        label="Damage Type"
                                    >
                                        <MenuItem value="Scratch">Scratch</MenuItem>
                                        <MenuItem value="Dent">Dent</MenuItem>
                                        <MenuItem value="Mechanical">Mechanical</MenuItem>
                                        <MenuItem value="Electrical">Electrical</MenuItem>
                                        <MenuItem value="Interior">Interior</MenuItem>
                                        <MenuItem value="Tyre">Tyre / Wheel</MenuItem>
                                        <MenuItem value="Glass">Glass / Window</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Severity</InputLabel>
                                    <Select
                                        name="severity"
                                        value={formData.severity}
                                        onChange={handleChange}
                                        label="Severity"
                                    >
                                        <MenuItem value="minor">Minor (Scratches, small dents)</MenuItem>
                                        <MenuItem value="moderate">Moderate (Large dents, paint work)</MenuItem>
                                        <MenuItem value="major">Major (Structural or mechanical)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Description of Damage"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Explain how the damage occurred and specific details..."
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>Photos (Optional)</Typography>
                                <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 4, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                                    <IoCameraOutline size={48} color="#999" />
                                    <Typography color="text.secondary" sx={{ mt: 1 }}>Click to upload or drag photos here</Typography>
                                    <Typography variant="caption" color="text.disabled">PNG, JPG, up to 5MB per photo</Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                    <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        variant="contained" 
                                        color="primary" 
                                        disabled={loading}
                                        startIcon={<IoDocumentTextOutline />}
                                        sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                                    >
                                        {loading ? 'Submitting...' : 'Submit Damage Report'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ReportDamage;
