import { Button } from "@mui/material";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import useRole from "../../hooks/useRole";
import useAxiosPublic from "../../hooks/useAxiosPublic";

const BookingCard = ({ booking }) => {
  const navigate = useNavigate();
  const role = useRole();
  const axiosPublic = useAxiosPublic();

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
                    amount: booking.total_cost * 0.5,
                    name: booking.user_name,
                    email: booking.user_email,
                    phone: booking.user_phone,
                    address: booking.user_address || 'Not Provided'
                  };
                  const response = await axiosPublic.post('/paymentRoutes/existing-payment', paymentData);
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
                "&:hover": {
                  background: "#388e3c"
                }
              }}
            >
              Pay Initial 50% (৳{booking.total_cost * 0.5})
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
              "&:hover": {
                background: "#e07b00"
              }
            }}
          >
            View Trip Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
