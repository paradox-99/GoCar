import { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog, DialogContent, DialogActions,
    Button, Chip, CircularProgress, Divider
} from '@mui/material';
import {
    LocalGasStation, Speed, AttachMoney, Notes,
    CheckCircle, Close, AssignmentReturn, HourglassBottom,
    Payment
} from '@mui/icons-material';
import moment from 'moment';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import toast from 'react-hot-toast';

const ReturnDetailsModal = ({ open, onClose, booking, onConfirmed }) => {
    const axiosPublic = useAxiosPublic();
    const [confirming, setConfirming] = useState(false);
    const [paying, setPaying] = useState(false);

    if (!booking || !booking.return_id) return null;

    const baseRemaining = Math.round(booking.total_cost / 2);
    const additionalFees =
        (booking.late_fee || 0) +
        (booking.return_fuel_charge || 0) +
        (booking.cleaning_charge || 0);
    const totalDue = baseRemaining + additionalFees;

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            await axiosPublic.patch(`returnRoutes/confirm/${booking.booking_id}`);
            toast.success('Return confirmed! Please complete the final payment.');
            onConfirmed();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to confirm return');
        } finally {
            setConfirming(false);
        }
    };

    const handleConfirmAndPay = async () => {
        setPaying(true);
        try {
            // First confirm the return
            await axiosPublic.patch(`returnRoutes/confirm/${booking.booking_id}`);

            // Then initiate final payment
            const paymentData = {
                booking_id: booking.booking_id,
                initial_cost: totalDue,
                payment_for: 'final',
                name: booking.user_name,
                email: booking.user_email,
                phone: booking.user_phone,
                address: booking.agency_address || 'Not Provided'
            };
            const response = await axiosPublic.post('paymentRoutes/payment', paymentData);
            if (response.data?.url) {
                window.location.replace(response.data.url);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to process. Please try again.');
            setPaying(false);
        }
    };

    const isConfirmed = booking.return_confirmed;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>

            {/* Header */}
            <div className={`px-6 py-5 ${isConfirmed ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-600 to-blue-700'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-xl p-2">
                            <AssignmentReturn sx={{ color: 'white', fontSize: 28 }} />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg leading-tight">Return Details</h2>
                            {booking.brand && booking.model && (
                                <p className="text-white/80 text-sm">{booking.brand} {booking.model}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {isConfirmed ? (
                            <Chip label="Confirmed" size="small"
                                icon={<CheckCircle sx={{ color: 'white !important', fontSize: '16px' }} />}
                                sx={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700 }} />
                        ) : (
                            <Chip label="Awaiting Confirmation" size="small"
                                icon={<HourglassBottom sx={{ color: 'white !important', fontSize: '16px' }} />}
                                sx={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700 }} />
                        )}
                        <button onClick={onClose} disabled={confirming || paying}
                            className="text-white/70 hover:text-white transition-colors ml-1">
                            <Close />
                        </button>
                    </div>
                </div>
            </div>

            <DialogContent sx={{ p: 3 }}>
                {!isConfirmed && (
                    <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <p className="text-amber-700 text-sm font-medium">
                            The agency has recorded your vehicle return. Please review the details below.
                            After confirming, complete the final payment to close your booking.
                        </p>
                    </div>
                )}

                {isConfirmed && booking.final_payment && (
                    <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-green-700 text-sm font-medium flex items-center gap-2">
                            <CheckCircle fontSize="small" />
                            Return confirmed and payment completed. Booking closed.
                        </p>
                    </div>
                )}

                {isConfirmed && !booking.final_payment && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-blue-700 text-sm font-medium flex items-center gap-2">
                            <Payment fontSize="small" />
                            Return confirmed. Final payment of <strong className="mx-1">৳{totalDue}</strong> is pending.
                        </p>
                    </div>
                )}

                {/* Vehicle condition */}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Returned Condition</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                        <div className="flex items-center gap-2 text-orange-500 text-xs font-bold uppercase mb-2">
                            <LocalGasStation fontSize="small" /> Fuel Level
                        </div>
                        <p className="font-extrabold text-gray-800 text-2xl">
                            {booking.return_fuel_level}
                            <span className="text-sm font-normal text-gray-500">%</span>
                        </p>
                        <div className="mt-2 h-2 bg-orange-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-400 rounded-full" style={{ width: `${booking.return_fuel_level}%` }} />
                        </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase mb-2">
                            <Speed fontSize="small" /> Odometer
                        </div>
                        <p className="font-extrabold text-gray-800 text-2xl">
                            {booking.return_odometer?.toLocaleString()}
                            <span className="text-sm font-normal text-gray-500"> km</span>
                        </p>
                    </div>
                </div>

                {/* Payment breakdown */}
                <Divider sx={{ my: 2 }}>
                    <span className="text-xs text-gray-400 uppercase font-bold px-2">Payment Summary</span>
                </Divider>

                <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                        <span className="text-sm text-gray-600">Remaining Rental (50%)</span>
                        <span className="font-bold text-gray-800">৳{baseRemaining}</span>
                    </div>

                    {(booking.late_fee || 0) > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                            <div className="flex items-center gap-2">
                                <AttachMoney sx={{ color: '#ef4444', fontSize: 16 }} />
                                <span className="text-sm text-red-600 font-medium">Late Return Fee</span>
                            </div>
                            <span className="font-bold text-red-600">+ ৳{booking.late_fee}</span>
                        </div>
                    )}

                    {(booking.return_fuel_charge || 0) > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                            <div className="flex items-center gap-2">
                                <LocalGasStation sx={{ color: '#f59e0b', fontSize: 16 }} />
                                <span className="text-sm text-amber-600 font-medium">Fuel Charge</span>
                            </div>
                            <span className="font-bold text-amber-600">+ ৳{booking.return_fuel_charge}</span>
                        </div>
                    )}

                    {(booking.cleaning_charge || 0) > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                            <div className="flex items-center gap-2">
                                <AttachMoney sx={{ color: '#8b5cf6', fontSize: 16 }} />
                                <span className="text-sm text-purple-600 font-medium">Cleaning Fee</span>
                            </div>
                            <span className="font-bold text-purple-600">+ ৳{booking.cleaning_charge}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center py-3 bg-gray-50 rounded-xl px-3">
                        <span className="font-bold text-gray-700">Total Due</span>
                        <span className="font-extrabold text-gray-900 text-xl">৳{totalDue}</span>
                    </div>
                </div>

                {/* Notes */}
                {booking.return_notes && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                            <Notes fontSize="small" /> Agency Notes
                        </div>
                        <p className="text-gray-700 text-sm italic">&quot;{booking.return_notes}&quot;</p>
                    </div>
                )}

                <p className="text-xs text-gray-400 mt-4 text-right">
                    Return submitted: {moment(booking.return_time).format('DD MMM YYYY, hh:mm A')}
                </p>
            </DialogContent>

            {/* Actions */}
            {!isConfirmed && (
                <DialogActions sx={{ px: 3, pb: 3, gap: 1, flexWrap: 'wrap' }}>
                    <Button onClick={onClose} disabled={confirming || paying} variant="outlined"
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 2.5 }}>
                        Later
                    </Button>
                    <Button onClick={handleConfirm} disabled={confirming || paying} variant="outlined" color="success"
                        startIcon={confirming && !paying ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 2.5 }}>
                        {confirming && !paying ? 'Confirming...' : 'Confirm Only'}
                    </Button>
                    <Button onClick={handleConfirmAndPay} disabled={confirming || paying} variant="contained"
                        startIcon={paying ? <CircularProgress size={16} color="inherit" /> : <Payment />}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 2.5, backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' }, boxShadow: 'none', flexGrow: 1 }}>
                        {paying ? 'Redirecting...' : `Confirm & Pay ৳${totalDue}`}
                    </Button>
                </DialogActions>
            )}

            {/* If confirmed but not paid — show pay button */}
            {isConfirmed && !booking.final_payment && (
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={onClose} variant="outlined"
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3 }}>
                        Close
                    </Button>
                    <Button
                        onClick={async () => {
                            setPaying(true);
                            try {
                                const paymentData = {
                                    booking_id: booking.booking_id,
                                    initial_cost: totalDue,
                                    payment_for: 'final',
                                    name: booking.user_name,
                                    email: booking.user_email,
                                    phone: booking.user_phone,
                                    address: booking.agency_address || 'Not Provided'
                                };
                                const response = await axiosPublic.post('paymentRoutes/payment', paymentData);
                                if (response.data?.url) window.location.replace(response.data.url);
                            } catch (err) {
                                toast.error('Failed to initiate payment. Please try again.');
                                setPaying(false);
                            }
                        }}
                        disabled={paying}
                        variant="contained"
                        startIcon={paying ? <CircularProgress size={16} color="inherit" /> : <Payment />}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 3, backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' }, boxShadow: 'none' }}>
                        {paying ? 'Redirecting...' : `Pay Final ৳${totalDue}`}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

ReturnDetailsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    booking: PropTypes.shape({
        booking_id: PropTypes.string,
        brand: PropTypes.string,
        model: PropTypes.string,
        total_cost: PropTypes.number,
        final_payment: PropTypes.bool,
        return_id: PropTypes.string,
        return_time: PropTypes.string,
        return_fuel_level: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        return_odometer: PropTypes.number,
        late_fee: PropTypes.number,
        return_fuel_charge: PropTypes.number,
        cleaning_charge: PropTypes.number,
        return_notes: PropTypes.string,
        return_confirmed: PropTypes.bool,
        user_name: PropTypes.string,
        user_email: PropTypes.string,
        user_phone: PropTypes.string,
        agency_address: PropTypes.string
    }),
    onConfirmed: PropTypes.func.isRequired
};

export default ReturnDetailsModal;
