import { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog, DialogContent, DialogActions,
    Button, Rating, TextField, Divider, CircularProgress, Chip
} from '@mui/material';
import {
    Star, Close, DirectionsCar, Business, Person, CheckCircle
} from '@mui/icons-material';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useRole from '../../hooks/useRole';
import toast from 'react-hot-toast';

const ReviewSection = ({ icon, title, color, rating, setRating, review, setReview, placeholder, optional }) => (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
            {icon}
            <span className="font-semibold text-gray-800">{title}</span>
            {optional && (
                <span className="ml-auto text-xs text-gray-400 font-medium bg-gray-200 px-2 py-0.5 rounded-full">
                    Optional
                </span>
            )}
        </div>
        <Rating
            value={rating}
            onChange={(_, v) => setRating(v)}
            size="large"
            sx={{ mb: 1.5, color }}
        />
        {!optional && !rating && (
            <p className="text-xs text-red-500 mb-1">Please select a star rating</p>
        )}
        <TextField
            fullWidth
            multiline
            rows={2}
            placeholder={placeholder}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: 'white' } }}
        />
    </div>
);

ReviewSection.propTypes = {
    icon: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    rating: PropTypes.number,
    setRating: PropTypes.func.isRequired,
    review: PropTypes.string.isRequired,
    setReview: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
    optional: PropTypes.bool,
};

const ReviewModal = ({ open, onClose, booking, onReviewed }) => {
    const axiosPublic = useAxiosPublic();
    const role = useRole();
    const [submitting, setSubmitting] = useState(false);

    const hasDriver = !!booking?.driver_id;

    const [vehicleRating, setVehicleRating] = useState(5);
    const [vehicleReview, setVehicleReview] = useState('');
    const [agencyRating, setAgencyRating] = useState(null);
    const [agencyReview, setAgencyReview] = useState('');
    const [driverRating, setDriverRating] = useState(null);
    const [driverReview, setDriverReview] = useState('');

    if (!booking) return null;

    const handleSubmit = async () => {
        if (!vehicleRating) {
            toast.error('Please rate the vehicle before submitting');
            return;
        }
        setSubmitting(true);
        try {
            await axiosPublic.post('reviewRoutes/booking', {
                booking_id: booking.booking_id,
                vehicle_type: booking.vehicle_type?.toLowerCase() || 'car',
                vehicle_id: booking.vehicle_id,
                agency_id: booking.agency_id,
                driver_id: hasDriver ? booking.driver_id : null,
                user_id: role?.user_id,
                vehicle_rating: vehicleRating,
                vehicle_review: vehicleReview,
                agency_rating: agencyRating,
                agency_review: agencyReview,
                driver_rating: hasDriver ? driverRating : null,
                driver_review: hasDriver ? driverReview : null,
            });
            toast.success('Thank you for your review!');
            onReviewed();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>

            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-xl p-2">
                            <Star sx={{ color: 'white', fontSize: 28 }} />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg leading-tight">Rate Your Experience</h2>
                            {booking.brand && booking.model && (
                                <p className="text-white/80 text-sm">{booking.brand} {booking.model}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasDriver && (
                            <Chip label="With Driver" size="small"
                                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '11px' }} />
                        )}
                        <button onClick={onClose} disabled={submitting}
                            className="text-white/70 hover:text-white transition-colors disabled:opacity-40">
                            <Close />
                        </button>
                    </div>
                </div>
            </div>

            <DialogContent sx={{ p: 3 }}>
                <p className="text-gray-500 text-sm mb-4">
                    Vehicle rating is required. Agency and driver ratings are optional.
                    Written reviews are always optional.
                </p>

                <div className="space-y-3">
                    <ReviewSection
                        icon={<DirectionsCar sx={{ color: '#f58300' }} />}
                        title={`${booking.brand || ''} ${booking.model || ''}`.trim() || 'Vehicle'}
                        color="#f58300"
                        rating={vehicleRating}
                        setRating={setVehicleRating}
                        review={vehicleReview}
                        setReview={setVehicleReview}
                        placeholder="How was the vehicle condition, comfort, and features?"
                    />

                    {booking.agency_id && (
                        <>
                            <Divider />
                            <ReviewSection
                                icon={<Business sx={{ color: '#2563eb' }} />}
                                title={booking.agency_name || 'Agency'}
                                color="#2563eb"
                                rating={agencyRating}
                                setRating={setAgencyRating}
                                review={agencyReview}
                                setReview={setAgencyReview}
                                placeholder="How was the agency's service, communication, and support?"
                                optional
                            />
                        </>
                    )}

                    {hasDriver && (
                        <>
                            <Divider />
                            <ReviewSection
                                icon={<Person sx={{ color: '#7c3aed' }} />}
                                title={booking.driver_name || 'Driver'}
                                color="#7c3aed"
                                rating={driverRating}
                                setRating={setDriverRating}
                                review={driverReview}
                                setReview={setDriverReview}
                                placeholder="How was the driver's professionalism, punctuality, and driving?"
                                optional
                            />
                        </>
                    )}
                </div>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={onClose} disabled={submitting} variant="outlined"
                    sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 2.5 }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    variant="contained"
                    startIcon={submitting
                        ? <CircularProgress size={16} color="inherit" />
                        : <CheckCircle />
                    }
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3,
                        backgroundColor: '#f58300',
                        '&:hover': { backgroundColor: '#e07b00' },
                        boxShadow: 'none',
                        flexGrow: 1,
                    }}
                >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ReviewModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    booking: PropTypes.shape({
        booking_id: PropTypes.string,
        vehicle_id: PropTypes.string,
        vehicle_type: PropTypes.string,
        agency_id: PropTypes.string,
        driver_id: PropTypes.string,
        brand: PropTypes.string,
        model: PropTypes.string,
        agency_name: PropTypes.string,
        driver_name: PropTypes.string,
    }),
    onReviewed: PropTypes.func.isRequired,
};

export default ReviewModal;
