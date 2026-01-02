import { Button } from "@mui/material";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const BookingCard = ({ booking }) => {
  const navigate = useNavigate();
  const getStatusBadge = (status) => {
    const lowerStatus = status?.toLowerCase() || "pending";
    
    if (lowerStatus === "pending") {
      return "bg-yellow-100 text-yellow-700";
    } else if (lowerStatus === "confirmed") {
      return "bg-green-100 text-green-700";
    } else if (lowerStatus === "completed") {
      return "bg-blue-100 text-blue-700";
    } else if (lowerStatus === "cancelled") {
      return "bg-red-100 text-red-700";
    }
    return "bg-gray-100 text-gray-700";
  };


  const startDate = moment(booking.start_ts);
  const endDate = moment(booking.end_ts);
  const rentalType = booking.driver_id ? "With Driver" : "Self-drive";

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image Section */}
      <div className="flex justify-center items-center">
        <img
          src={booking.car_image || booking.images}
          alt={`${booking.brand} ${booking.model}`}
          className=" w-[300px]"
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
            <span className="text-gray-600">Car:</span>
            <span className="font-semibold text-gray-800">{booking.brand} {booking.model} {booking.model}</span>
          </div>
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
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusBadge(booking.status)}`}>
              {booking.status || "Pending"}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="bg-gray-50 p-3 rounded mb-4 border border-gray-100">
          <div className="flex justify-between">
            <span className="text-gray-600 font-semibold">Total Cost:</span>
            <span className="text-lg font-bold text-orange-600">৳{booking.total_cost || "0"}</span>
          </div>
          {booking.remaining_amount && booking.remaining_amount > 0 && (
            <div className="text-sm text-gray-600 mt-2">Remaining: <span className="font-bold text-red-600">৳{booking.remaining_amount}</span></div>
          )}
        </div>

        {/* Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(`/dashboard/user/bookings/${booking.booking_id}`, { state: { booking } })}
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
          Details
        </Button>
      </div>
    </div>
  );
};

export default BookingCard;
