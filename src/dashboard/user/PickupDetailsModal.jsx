import { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Chip, CircularProgress, Divider
} from '@mui/material';
import {
    LocalGasStation, Speed, AttachMoney, Notes,
    CheckCircle, Close, DirectionsCar, HourglassBottom
} from '@mui/icons-material';
import moment from 'moment';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import toast from 'react-hot-toast';

const PickupDetailsModal = ({ open, onClose, pickup, bookingId, vehicleName, onConfirmed }) => {
    const axiosPublic = useAxiosPublic();
    const [confirming, setConfirming] = useState(false);

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            await axiosPublic.patch(`pickupRoutes/confirm/${bookingId}`);
            toast.success('Pickup confirmed! Your trip has started.');
            onConfirmed();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to confirm pickup');
        } finally {
            setConfirming(false);
        }
    };

    if (!pickup) return null;

    const totalCharges = (pickup.pickup_early_fee || 0) + (pickup.pickup_fuel_charge || 0);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
        >
            {/* Header */}
            <div className={`px-6 py-5 ${pickup.pickup_confirmed
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-xl p-2">
                            <DirectionsCar sx={{ color: 'white', fontSize: 28 }} />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg leading-tight">Pickup Details</h2>
                            {vehicleName && (
                                <p className="text-white/80 text-sm">{vehicleName}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {pickup.pickup_confirmed ? (
                            <Chip
                                label="Confirmed"
                                size="small"
                                icon={<CheckCircle sx={{ color: 'white !important', fontSize: '16px' }} />}
                                sx={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700 }}
                            />
                        ) : (
                            <Chip
                                label="Awaiting Your Confirmation"
                                size="small"
                                icon={<HourglassBottom sx={{ color: 'white !important', fontSize: '16px' }} />}
                                sx={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700 }}
                            />
                        )}
                        <button
                            onClick={onClose}
                            disabled={confirming}
                            className="text-white/70 hover:text-white transition-colors ml-1"
                        >
                            <Close />
                        </button>
                    </div>
                </div>
            </div>

            <DialogContent sx={{ p: 3 }}>
                {!pickup.pickup_confirmed && (
                    <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <p className="text-amber-700 text-sm font-medium">
                            The agency has prepared your vehicle. Please review the details below and confirm
                            to officially start your trip.
                        </p>
                    </div>
                )}

                {pickup.pickup_confirmed && (
                    <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-green-700 text-sm font-medium flex items-center gap-2">
                            <CheckCircle fontSize="small" />
                            You have confirmed this pickup. Your trip is underway!
                        </p>
                    </div>
                )}

                {/* Vehicle Condition Grid */}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Vehicle Condition at Handover
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                        <div className="flex items-center gap-2 text-orange-500 text-xs font-bold uppercase mb-2">
                            <LocalGasStation fontSize="small" />
                            Fuel Level
                        </div>
                        <p className="font-extrabold text-gray-800 text-2xl">
                            {pickup.pickup_fuel_level ?? pickup.fuel_level}
                            <span className="text-sm font-normal text-gray-500">%</span>
                        </p>
                        {/* Fuel bar */}
                        <div className="mt-2 h-2 bg-orange-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-orange-400 rounded-full"
                                style={{ width: `${pickup.pickup_fuel_level ?? pickup.fuel_level}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase mb-2">
                            <Speed fontSize="small" />
                            Odometer
                        </div>
                        <p className="font-extrabold text-gray-800 text-2xl">
                            {(pickup.pickup_odometer ?? pickup.odometer_reading)?.toLocaleString()}
                            <span className="text-sm font-normal text-gray-500"> km</span>
                        </p>
                    </div>
                </div>

                {/* Additional Charges */}
                {totalCharges > 0 && (
                    <>
                        <Divider sx={{ my: 2 }}>
                            <span className="text-xs text-gray-400 uppercase font-bold px-2">Additional Charges</span>
                        </Divider>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {(pickup.pickup_early_fee ?? 0) > 0 && (
                                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                                    <div className="flex items-center gap-2 text-yellow-600 text-xs font-bold uppercase mb-1">
                                        <AttachMoney fontSize="small" />
                                        Early Pickup Fee
                                    </div>
                                    <p className="font-bold text-yellow-700 text-xl">
                                        ৳{pickup.pickup_early_fee ?? 0}
                                    </p>
                                </div>
                            )}
                            {(pickup.pickup_fuel_charge ?? 0) > 0 && (
                                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                    <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase mb-1">
                                        <LocalGasStation fontSize="small" />
                                        Fuel Charge
                                    </div>
                                    <p className="font-bold text-red-600 text-xl">
                                        ৳{pickup.pickup_fuel_charge ?? 0}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-gray-600">Total Additional Charges</span>
                            <span className="font-extrabold text-gray-800">৳{totalCharges}</span>
                        </div>
                    </>
                )}

                {/* Notes */}
                {(pickup.pickup_notes ?? pickup.notes) && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                            <Notes fontSize="small" />
                            Agency Notes
                        </div>
                        <p className="text-gray-700 text-sm italic">
                            &quot;{pickup.pickup_notes ?? pickup.notes}&quot;
                        </p>
                    </div>
                )}

                <p className="text-xs text-gray-400 mt-4 text-right">
                    Pickup initiated: {moment(pickup.pickup_time).format('DD MMM YYYY, hh:mm A')}
                </p>
            </DialogContent>

            {!pickup.pickup_confirmed && (
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button
                        onClick={onClose}
                        disabled={confirming}
                        variant="outlined"
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3 }}
                    >
                        Review Later
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={confirming}
                        variant="contained"
                        color="success"
                        startIcon={confirming
                            ? <CircularProgress size={16} color="inherit" />
                            : <CheckCircle />
                        }
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            boxShadow: 'none'
                        }}
                    >
                        {confirming ? 'Confirming...' : 'Confirm Pickup'}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

PickupDetailsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    pickup: PropTypes.shape({
        pickup_id: PropTypes.string,
        pickup_time: PropTypes.string,
        pickup_fuel_level: PropTypes.number,
        pickup_odometer: PropTypes.number,
        pickup_early_fee: PropTypes.number,
        pickup_fuel_charge: PropTypes.number,
        pickup_notes: PropTypes.string,
        pickup_confirmed: PropTypes.bool,
        fuel_level: PropTypes.number,
        odometer_reading: PropTypes.number,
        early_fee: PropTypes.number,
        fuel_charge: PropTypes.number,
        notes: PropTypes.string,
        confirmed: PropTypes.bool
    }),
    bookingId: PropTypes.string.isRequired,
    vehicleName: PropTypes.string,
    onConfirmed: PropTypes.func.isRequired
};

export default PickupDetailsModal;
