import { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog, DialogContent, DialogActions,
    Button, TextField, Grid, CircularProgress, Divider, Chip
} from '@mui/material';
import {
    LocalGasStation, Speed, AttachMoney, Notes,
    DirectionsCar, CheckCircle, Close, AssignmentReturn
} from '@mui/icons-material';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import toast from 'react-hot-toast';

const ReturnFormModal = ({ open, onClose, bookingId, vehicleName, onSuccess }) => {
    const axiosPublic = useAxiosPublic();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        fuel_level: '',
        odometer_reading: '',
        late_fee: '',
        fuel_charge: '',
        cleaning_charge: '',
        return_notes: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (form.fuel_level === '') {
            newErrors.fuel_level = 'Required';
        } else if (isNaN(Number(form.fuel_level)) || Number(form.fuel_level) < 0 || Number(form.fuel_level) > 100) {
            newErrors.fuel_level = 'Must be 0–100';
        }
        if (form.odometer_reading === '') {
            newErrors.odometer_reading = 'Required';
        } else if (isNaN(Number(form.odometer_reading)) || Number(form.odometer_reading) < 0) {
            newErrors.odometer_reading = 'Must be positive';
        }
        ['late_fee', 'fuel_charge', 'cleaning_charge'].forEach(field => {
            if (form[field] !== '' && (isNaN(Number(form[field])) || Number(form[field]) < 0)) {
                newErrors[field] = 'Must be positive';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClose = () => {
        if (!loading) {
            setForm({ fuel_level: '', odometer_reading: '', late_fee: '', fuel_charge: '', cleaning_charge: '', return_notes: '' });
            setErrors({});
            onClose();
        }
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await axiosPublic.post('returnRoutes/create', {
                booking_id: bookingId,
                fuel_level: parseFloat(form.fuel_level),
                odometer_reading: parseInt(form.odometer_reading, 10),
                late_fee: form.late_fee !== '' ? parseInt(form.late_fee, 10) : 0,
                fuel_charge: form.fuel_charge !== '' ? parseInt(form.fuel_charge, 10) : 0,
                cleaning_charge: form.cleaning_charge !== '' ? parseInt(form.cleaning_charge, 10) : 0,
                return_notes: form.return_notes.trim() || null
            });
            toast.success('Return submitted! Waiting for customer confirmation.');
            handleClose();
            onSuccess();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to submit return');
        } finally {
            setLoading(false);
        }
    };

    const totalAdditional =
        (form.late_fee !== '' ? parseInt(form.late_fee) || 0 : 0) +
        (form.fuel_charge !== '' ? parseInt(form.fuel_charge) || 0 : 0) +
        (form.cleaning_charge !== '' ? parseInt(form.cleaning_charge) || 0 : 0);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-xl p-2">
                            <AssignmentReturn sx={{ color: 'white', fontSize: 28 }} />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg leading-tight">Submit Vehicle Return</h2>
                            {vehicleName && <p className="text-blue-100 text-sm">{vehicleName}</p>}
                        </div>
                    </div>
                    <button onClick={handleClose} disabled={loading} className="text-white/70 hover:text-white transition-colors">
                        <Close />
                    </button>
                </div>
            </div>

            <DialogContent sx={{ p: 3 }}>
                <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-blue-700 text-sm font-medium">
                        Record the returned vehicle condition. The customer will review and confirm these details before final payment.
                    </p>
                </div>

                <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Vehicle Condition</p>
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            label="Fuel Level (%)" type="number" fullWidth required
                            value={form.fuel_level} onChange={handleChange('fuel_level')}
                            error={!!errors.fuel_level} helperText={errors.fuel_level}
                            inputProps={{ min: 0, max: 100, step: 0.5 }}
                            InputProps={{ startAdornment: <LocalGasStation sx={{ color: '#F58300', mr: 1, fontSize: 20 }} /> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, '& .Mui-focused fieldset': { borderColor: '#2563eb !important' }, '& label.Mui-focused': { color: '#2563eb' } }}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            label="Odometer (km)" type="number" fullWidth required
                            value={form.odometer_reading} onChange={handleChange('odometer_reading')}
                            error={!!errors.odometer_reading} helperText={errors.odometer_reading}
                            inputProps={{ min: 0 }}
                            InputProps={{ startAdornment: <Speed sx={{ color: '#3b82f6', mr: 1, fontSize: 20 }} /> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, '& .Mui-focused fieldset': { borderColor: '#2563eb !important' }, '& label.Mui-focused': { color: '#2563eb' } }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 0.5 }}>
                            <Chip label="Additional Charges" size="small" sx={{ fontSize: '11px', color: 'gray' }} />
                        </Divider>
                    </Grid>

                    <Grid item xs={4}>
                        <TextField
                            label="Late Return Fee (৳)" type="number" fullWidth
                            value={form.late_fee} onChange={handleChange('late_fee')}
                            error={!!errors.late_fee} helperText={errors.late_fee || 'Optional'}
                            inputProps={{ min: 0 }}
                            InputProps={{ startAdornment: <AttachMoney sx={{ color: '#ef4444', mr: 0.5, fontSize: 18 }} /> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Grid>

                    <Grid item xs={4}>
                        <TextField
                            label="Fuel Charge (৳)" type="number" fullWidth
                            value={form.fuel_charge} onChange={handleChange('fuel_charge')}
                            error={!!errors.fuel_charge} helperText={errors.fuel_charge || 'Optional'}
                            inputProps={{ min: 0 }}
                            InputProps={{ startAdornment: <LocalGasStation sx={{ color: '#f59e0b', mr: 0.5, fontSize: 18 }} /> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Grid>

                    <Grid item xs={4}>
                        <TextField
                            label="Cleaning Fee (৳)" type="number" fullWidth
                            value={form.cleaning_charge} onChange={handleChange('cleaning_charge')}
                            error={!!errors.cleaning_charge} helperText={errors.cleaning_charge || 'Optional'}
                            inputProps={{ min: 0 }}
                            InputProps={{ startAdornment: <AttachMoney sx={{ color: '#8b5cf6', mr: 0.5, fontSize: 18 }} /> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Grid>

                    {totalAdditional > 0 && (
                        <Grid item xs={12}>
                            <div className="flex justify-between items-center bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                                <span className="text-sm font-semibold text-red-600">Total Additional Charges</span>
                                <span className="font-extrabold text-red-700 text-lg">৳{totalAdditional}</span>
                            </div>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <TextField
                            label="Return Notes" multiline rows={3} fullWidth
                            value={form.return_notes} onChange={handleChange('return_notes')}
                            placeholder="Vehicle condition, damage notes, or any handover remarks..."
                            inputProps={{ maxLength: 500 }}
                            helperText={`${form.return_notes.length}/500`}
                            InputProps={{ startAdornment: <Notes sx={{ color: '#6b7280', mr: 1, fontSize: 20, alignSelf: 'flex-start', mt: 1.5 }} /> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={handleClose} disabled={loading} variant="outlined"
                    sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3 }}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading} variant="contained"
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                    sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3, backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' }, boxShadow: 'none' }}>
                    {loading ? 'Submitting...' : 'Submit Return'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ReturnFormModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    bookingId: PropTypes.string.isRequired,
    vehicleName: PropTypes.string,
    onSuccess: PropTypes.func.isRequired
};

export default ReturnFormModal;
