import { useState } from "react";
import { Button } from "@mui/material";
import moment from "moment";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import useRole from "../../hooks/useRole";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import PickupDetailsModal from "./PickupDetailsModal";
import ReturnDetailsModal from "./ReturnDetailsModal";
import { useQueryClient } from "@tanstack/react-query";

const BookingCard = ({ booking }) => {
  const navigate = useNavigate();
  const role = useRole();
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  const getStatusBadge = (status) => {
    const lowerStatus = status?.toLowerCase() || "pending";
    
    if (lowerStatus === "pending") {
      return "bg-yellow-100 text-yellow-700";
    } else if (lowerStatus === "requested") {
      return "bg-yellow-100 text-yellow-700";
    } else if (lowerStatus === "confirmed") {
      return "bg-green-100 text-green-700";
    } else if (lowerStatus === "running") {
      return "bg-blue-100 text-blue-700 font-bold animate-pulse";
    } else if (lowerStatus === "completed") {
      return "bg-blue-100 text-blue-700";
    } else if (lowerStatus === "cancelled") {
      return "bg-red-100 text-red-700";
    } else if (lowerStatus === "overdue") {
      return "bg-red-100 text-red-700 border border-red-200";
    }
    return "bg-gray-100 text-gray-700";
  };


  const startDate = moment(booking.start_ts);
  const endDate = moment(booking.end_ts);
  const rentalType = booking.driver_id ? "With Driver" : "Self-drive";
  const isOverdue = (booking.status === 'Requested' || booking.status === 'Confirmed') && moment().isAfter(startDate);

  const handleNavigateDetail = () => {
    if (role?.userrole === "driver") {
      navigate(`/dashboard/driver/trips/${booking.booking_id}`, { state: { booking } });
    } else {
      navigate(`/dashboard/user/bookings/${booking.booking_id}`, { state: { booking } });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image Section */}
      <div className="flex justify-center items-center h-48 bg-gray-50">
        <img
          src={booking.images || booking.car_image}
          alt={`${booking.brand} ${booking.model}`}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x200?text=Vehicle+Image";
          }}
        />
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {booking.brand} {booking.model}
          </h3>
          <p className="text-sm text-gray-600">
            Agency: {booking.agency_name || "Not specified"}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">From:</span>
            <span className="font-semibold text-gray-800">
              {startDate.format("DD-MM-YYYY hh:mm A")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">To:</span>
            <span className="font-semibold text-gray-800">
              {endDate.format("DD-MM-YYYY hh:mm A")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-semibold text-gray-800">{booking.total_rent_hours} hrs</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rental Type:</span>
            <span className="font-semibold text-gray-800">{rentalType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status:</span>
            <span className={`px-3 py-1 rounded text-xs font-bold ${getStatusBadge(isOverdue ? "Overdue" : booking.status)}`}>
              {isOverdue ? "Overdue" : (booking.status || "Pending")}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="bg-gray-50 p-3 rounded mb-4 border border-gray-100">
          <div className="flex justify-between">
            <span className="text-gray-600 font-semibold">Total Cost:</span>
            <span className="text-lg font-bold text-orange-600">৳{booking.total_cost || "0"}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          {booking.status === 'Confirmed' && !booking.initial_payment && (
            <Button
              variant="contained"
              fullWidth
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const paymentData = {
                    booking_id: booking.booking_id,
                    initial_cost: booking.total_cost * 0.5,
                    payment_for: 'initial',
                    name: booking.user_name,
                    email: booking.user_email,
                    phone: booking.user_phone,
                    address: booking.user_address || 'Not Provided'
                  };
                  const response = await axiosPublic.post('/paymentRoutes/payment', paymentData);
                  if (response.data?.url) {
                    window.location.replace(response.data.url);
                  }
                } catch (err) {
                  console.error("Payment Error:", err);
                }
              }}
              sx={{
                background: "#4caf50",
                py: 1,
                fontWeight: 600,
                fontSize: "14px",
                textTransform: "none",
                "&:hover": { background: "#388e3c" }
              }}
            >
              Pay Initial 50% (৳{booking.total_cost * 0.5})
            </Button>
          )}

          {/* View Pickup Details button: shown for Confirmed bookings where agency has initiated pickup */}
          {booking.status === 'Confirmed' && booking.initial_payment && booking.pickup_id && (
            <Button
              variant="contained"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                setPickupModalOpen(true);
              }}
              sx={{
                background: booking.pickup_confirmed ? "#16a34a" : "#2563eb",
                py: 1,
                fontWeight: 700,
                fontSize: "14px",
                textTransform: "none",
                "&:hover": {
                  background: booking.pickup_confirmed ? "#15803d" : "#1d4ed8"
                }
              }}
            >
              {booking.pickup_confirmed ? "✓ Pickup Confirmed" : "View Pickup Details"}
            </Button>
          )}

          {/* View Return Details: shown for Running bookings where agency has submitted return */}
          {booking.status === 'Running' && booking.return_id && (
            <Button
              variant="contained"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                setReturnModalOpen(true);
              }}
              sx={{
                background: "#7c3aed",
                py: 1,
                fontWeight: 700,
                fontSize: "14px",
                textTransform: "none",
                "&:hover": { background: "#6d28d9" }
              }}
            >
              View Return Details
            </Button>
          )}

          {/* Pay Final Fee: shown for Completed bookings where final payment is still pending */}
          {booking.status === 'Completed' && !booking.final_payment && (
            <Button
              variant="contained"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                setReturnModalOpen(true);
              }}
              sx={{
                background: "#2563eb",
                py: 1,
                fontWeight: 700,
                fontSize: "14px",
                textTransform: "none",
                "&:hover": { background: "#1d4ed8" }
              }}
            >
              Pay Final Fee ৳{Math.round(booking.total_cost / 2) + (booking.late_fee || 0) + (booking.return_fuel_charge || 0) + (booking.cleaning_charge || 0)}
            </Button>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={handleNavigateDetail}
            sx={{
              background: "#f58300",
              py: 1,
              fontWeight: 600,
              fontSize: "14px",
              textTransform: "none",
              "&:hover": { background: "#e07b00" }
            }}
          >
            View Trip Details
          </Button>
        </div>
      </div>

      {/* Pickup Details Modal */}
      {booking.pickup_id && (
        <PickupDetailsModal
          open={pickupModalOpen}
          onClose={() => setPickupModalOpen(false)}
          pickup={booking}
          bookingId={booking.booking_id}
          vehicleName={booking.brand && booking.model ? `${booking.brand} ${booking.model}` : null}
          onConfirmed={() => {
            queryClient.invalidateQueries(['userBookings']);
          }}
        />
      )}

      {/* Return Details Modal */}
      {booking.return_id && (
        <ReturnDetailsModal
          open={returnModalOpen}
          onClose={() => setReturnModalOpen(false)}
          booking={booking}
          onConfirmed={() => {
            queryClient.invalidateQueries(['userBookings']);
          }}
        />
      )}
    </div>
  );
};

BookingCard.propTypes = {
  booking: PropTypes.shape({
    booking_id: PropTypes.string,
    start_ts: PropTypes.string,
    end_ts: PropTypes.string,
    driver_id: PropTypes.string,
    status: PropTypes.string,
    initial_payment: PropTypes.bool,
    images: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    car_image: PropTypes.string,
    brand: PropTypes.string,
    model: PropTypes.string,
    agency_name: PropTypes.string,
    total_rent_hours: PropTypes.number,
    total_cost: PropTypes.number,
    user_name: PropTypes.string,
    user_email: PropTypes.string,
    user_phone: PropTypes.string,
    user_address: PropTypes.string,
    pickup_id: PropTypes.string,
    pickup_time: PropTypes.string,
    pickup_fuel_level: PropTypes.number,
    pickup_odometer: PropTypes.number,
    pickup_early_fee: PropTypes.number,
    pickup_fuel_charge: PropTypes.number,
    pickup_notes: PropTypes.string,
    pickup_confirmed: PropTypes.bool,
    return_id: PropTypes.string,
    return_time: PropTypes.string,
    return_fuel_level: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    return_odometer: PropTypes.number,
    late_fee: PropTypes.number,
    return_fuel_charge: PropTypes.number,
    cleaning_charge: PropTypes.number,
    return_notes: PropTypes.string,
    return_confirmed: PropTypes.bool,
    final_payment: PropTypes.bool,
  }).isRequired,
};

export default BookingCard;
