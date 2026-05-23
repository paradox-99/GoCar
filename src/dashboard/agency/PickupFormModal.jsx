import { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Grid, CircularProgress, Divider, Chip
} from '@mui/material';
import {
    LocalGasStation, Speed, AttachMoney, Notes,
    DirectionsCar, CheckCircle, Close
} from '@mui/icons-material';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import toast from 'react-hot-toast';

const PickupFormModal = ({ open, onClose, bookingId, vehicleName, onSuccess }) => {
    const axiosPublic = useAxiosPublic();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        fuel_level: '',
        odometer_reading: '',
        early_fee: '',
        fuel_charge: '',
        pickup_notes: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (form.fuel_level === '') {
            newErrors.fuel_level = 'Fuel level is required';
        } else if (isNaN(Number(form.fuel_level)) || Number(form.fuel_level) < 0 || Number(form.fuel_level) > 100) {
            newErrors.fuel_level = 'Must be between 0 and 100';
        }
        if (form.odometer_reading === '') {
            newErrors.odometer_reading = 'Odometer reading is required';
        } else if (isNaN(Number(form.odometer_reading)) || Number(form.odometer_reading) < 0) {
            newErrors.odometer_reading = 'Must be a positive number';
        }
        if (form.early_fee !== '' && (isNaN(Number(form.early_fee)) || Number(form.early_fee) < 0)) {
            newErrors.early_fee = 'Must be a positive number';
        }
        if (form.fuel_charge !== '' && (isNaN(Number(form.fuel_charge)) || Number(form.fuel_charge) < 0)) {
            newErrors.fuel_charge = 'Must be a positive number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClose = () => {
        if (!loading) {
            setForm({ fuel_level: '', odometer_reading: '', early_fee: '', fuel_charge: '', pickup_notes: '' });
            setErrors({});
            onClose();
        }
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            await axiosPublic.post('pickupRoutes/create', {
                booking_id: bookingId,
                fuel_level: parseFloat(form.fuel_level),
                odometer_reading: parseInt(form.odometer_reading, 10),
                early_fee: form.early_fee !== '' ? parseInt(form.early_fee, 10) : 0,
                fuel_charge: form.fuel_charge !== '' ? parseInt(form.fuel_charge, 10) : 0,
                pickup_notes: form.pickup_notes.trim() || null
            });
            toast.success('Pickup initiated! Waiting for customer confirmation.');
            handleClose();
            onSuccess();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to initiate pickup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>

            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-xl p-2">
                            <DirectionsCar sx={{ color: 'white', fontSize: 28 }} />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg leading-tight">Initiate Vehicle Pickup</h2>
                            {vehicleName && (
                                <p className="text-orange-100 text-sm">{vehicleName}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        <Close />
                    </button>
                </div>
            </div>

            <DialogContent sx={{ p: 3 }}>
                <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-blue-700 text-sm font-medium">
                        Record the vehicle condition before handing over to the customer.
                        The customer will review and confirm these details.
                    </p>
                </div>

                <Grid container spacing={2.5}>
                    {/* Required fields */}
                    <Grid item xs={12}>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Required Information
                        </p>
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            label="Fuel Level (%)"
                            type="number"
                            fullWidth
                            required
                            value={form.fuel_level}
                            onChange={handleChange('fuel_level')}
                            error={!!errors.fuel_level}
                            helperText={errors.fuel_level}
                            inputProps={{ min: 0, max: 100, step: 0.5 }}
                            InputProps={{
                                startAdornment: (
                                    <LocalGasStation sx={{ color: '#F58300', mr: 1, fontSize: 20 }} />
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                                '& .Mui-focused fieldset': { borderColor: '#F58300 !important' },
                                '& label.Mui-focused': { color: '#F58300' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            label="Odometer (km)"
                            type="number"
                            fullWidth
                            required
                            value={form.odometer_reading}
                            onChange={handleChange('odometer_reading')}
                            error={!!errors.odometer_reading}
                            helperText={errors.odometer_reading}
                            inputProps={{ min: 0 }}
                            InputProps={{
                                startAdornment: (
                                    <Speed sx={{ color: '#3b82f6', mr: 1, fontSize: 20 }} />
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                                '& .Mui-focused fieldset': { borderColor: '#F58300 !important' },
                                '& label.Mui-focused': { color: '#F58300' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 0.5 }}>
                            <Chip label="Optional Charges" size="small" sx={{ fontSize: '11px', color: 'gray' }} />
                        </Divider>
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            label="Early Pickup Fee (৳)"
                            type="number"
                            fullWidth
                            value={form.early_fee}
                            onChange={handleChange('early_fee')}
                            error={!!errors.early_fee}
                            helperText={errors.early_fee || 'If picked up earlier'}
                            inputProps={{ min: 0 }}
                            InputProps={{
                                startAdornment: (
                                    <AttachMoney sx={{ color: '#f59e0b', mr: 1, fontSize: 20 }} />
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                                '& .Mui-focused fieldset': { borderColor: '#F58300 !important' },
                                '& label.Mui-focused': { color: '#F58300' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            label="Fuel Charge (৳)"
                            type="number"
                            fullWidth
                            value={form.fuel_charge}
                            onChange={handleChange('fuel_charge')}
                            error={!!errors.fuel_charge}
                            helperText={errors.fuel_charge || 'Extra fuel cost'}
                            inputProps={{ min: 0 }}
                            InputProps={{
                                startAdornment: (
                                    <LocalGasStation sx={{ color: '#ef4444', mr: 1, fontSize: 20 }} />
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                                '& .Mui-focused fieldset': { borderColor: '#F58300 !important' },
                                '& label.Mui-focused': { color: '#F58300' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Pickup Notes"
                            multiline
                            rows={3}
                            fullWidth
                            value={form.pickup_notes}
                            onChange={handleChange('pickup_notes')}
                            placeholder="Note any vehicle conditions, special instructions, or handover remarks..."
                            inputProps={{ maxLength: 500 }}
                            helperText={`${form.pickup_notes.length}/500`}
                            InputProps={{
                                startAdornment: (
                                    <Notes sx={{ color: '#6b7280', mr: 1, fontSize: 20, alignSelf: 'flex-start', mt: 1.5 }} />
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                                '& .Mui-focused fieldset': { borderColor: '#F58300 !important' },
                                '& label.Mui-focused': { color: '#F58300' }
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    variant="outlined"
                    sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    variant="contained"
                    startIcon={loading
                        ? <CircularProgress size={16} color="inherit" />
                        : <CheckCircle />
                    }
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        backgroundColor: '#F58300',
                        '&:hover': { backgroundColor: '#d17000' },
                        boxShadow: 'none'
                    }}
                >
                    {loading ? 'Submitting...' : 'Submit Pickup'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

PickupFormModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    bookingId: PropTypes.string.isRequired,
    vehicleName: PropTypes.string,
    onSuccess: PropTypes.func.isRequired
};

export default PickupFormModal;
