import { useState } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import useRole from "../../hooks/useRole";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import PickupDetailsModal from "./PickupDetailsModal";
import ReturnDetailsModal from "./ReturnDetailsModal";
import ReviewModal from "./ReviewModal";
import DamageReportModal from "./DamageReportModal";
import { useQueryClient } from "@tanstack/react-query";
import { FiClock, FiCalendar, FiUser, FiArrowRight } from "react-icons/fi";
import { MdOutlineTimer } from "react-icons/md";
import { BsCurrencyDollar } from "react-icons/bs";

const STATUS_STYLES = {
  requested:  { bg: "bg-amber-100",  text: "text-amber-700",  label: "Requested" },
  pending:    { bg: "bg-amber-100",  text: "text-amber-700",  label: "Pending" },
  confirmed:  { bg: "bg-green-100",  text: "text-green-700",  label: "Confirmed" },
  running:    { bg: "bg-blue-100",   text: "text-blue-700",   label: "Running", pulse: true },
  completed:  { bg: "bg-violet-100", text: "text-violet-700", label: "Completed" },
  cancelled:  { bg: "bg-red-100",    text: "text-red-700",    label: "Cancelled" },
  overdue:    { bg: "bg-red-100",    text: "text-red-700",    label: "Overdue" },
};

const Btn = ({ onClick, gradient, children, outlined, disabled }) => {
  if (outlined) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold border-2 border-green-500 text-green-600 flex items-center justify-center gap-2 opacity-70 cursor-default"
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${gradient} hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm`}
    >
      {children}
    </button>
  );
};

const BookingCard = ({ booking }) => {
  const navigate = useNavigate();
  const role = useRole();
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [damageModalOpen, setDamageModalOpen] = useState(false);

  const startDate = moment(booking.start_ts);
  const endDate = moment(booking.end_ts);
  const rentalType = booking.driver_id ? "With Driver" : "Self-drive";
  const isOverdue = (booking.status === "Requested" || booking.status === "Confirmed") && moment().isAfter(startDate);
  const displayStatus = isOverdue ? "overdue" : (booking.status || "pending").toLowerCase();
  const statusStyle = STATUS_STYLES[displayStatus] || { bg: "bg-gray-100", text: "text-gray-700", label: booking.status };

  const handleNavigateDetail = () => {
    if (role?.userrole === "driver") {
      navigate(`/dashboard/driver/trips/${booking.booking_id}`, { state: { booking } });
    } else {
      navigate(`/dashboard/user/bookings/${booking.booking_id}`, { state: { booking } });
    }
  };

  const handlePay = async (e) => {
    e.stopPropagation();
    try {
      const paymentData = {
        booking_id: booking.booking_id,
        initial_cost: booking.total_cost * 0.5,
        payment_for: "initial",
        name: booking.user_name,
        email: booking.user_email,
        phone: booking.user_phone,
        address: booking.user_address || "Not Provided",
      };
      const response = await axiosPublic.post("/paymentRoutes/payment", paymentData);
      if (response.data?.url) window.location.replace(response.data.url);
    } catch (err) {
      console.error("Payment Error:", err);
    }
  };

  const finalFee = Math.round(booking.total_cost / 2)
    + (booking.late_fee || 0)
    + (booking.return_fuel_charge || 0)
    + (booking.cleaning_charge || 0);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={booking.images || booking.car_image}
          alt={`${booking.brand} ${booking.model}`}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = "https://via.placeholder.com/400x200?text=Vehicle"; }}
        />
        {/* Dark gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status badge */}
        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text} shadow ${statusStyle.pulse ? "animate-pulse" : ""}`}>
          {statusStyle.label}
        </span>

        {/* Car name over image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-white text-lg font-bold leading-tight drop-shadow">
            {booking.brand} {booking.model}
          </h3>
          <p className="text-white/75 text-xs">{booking.agency_name || "Agency not specified"}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Info grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
          <InfoRow icon={<FiCalendar />} label="From" value={startDate.format("DD MMM, hh:mm A")} />
          <InfoRow icon={<FiCalendar />} label="To" value={endDate.format("DD MMM, hh:mm A")} />
          <InfoRow icon={<MdOutlineTimer />} label="Duration" value={`${booking.total_rent_hours} hrs`} />
          <InfoRow icon={<FiUser />} label="Type" value={rentalType} />
        </div>

        {/* Price */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-gray-500 text-sm font-medium flex items-center gap-1">
            <BsCurrencyDollar className="text-orange-400" /> Total Cost
          </span>
          <span className="text-xl font-extrabold text-orange-500">৳{booking.total_cost || 0}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-auto">
          {booking.status === "Confirmed" && !booking.initial_payment && (
            <Btn gradient="from-green-500 to-emerald-500" onClick={handlePay}>
              💳 Pay 50% — ৳{booking.total_cost * 0.5}
            </Btn>
          )}

          {booking.status === "Confirmed" && booking.initial_payment && booking.pickup_id && (
            <Btn
              gradient={booking.pickup_confirmed ? "from-green-600 to-green-500" : "from-blue-600 to-blue-500"}
              onClick={(e) => { e.stopPropagation(); setPickupModalOpen(true); }}
            >
              {booking.pickup_confirmed ? "✓ Pickup Confirmed" : "View Pickup Details"}
            </Btn>
          )}

          {booking.status === "Running" && (
            <Btn gradient="from-red-500 to-rose-500" onClick={(e) => { e.stopPropagation(); setDamageModalOpen(true); }}>
              ⚠ Report Damage
            </Btn>
          )}

          {booking.status === "Running" && booking.return_id && (
            <Btn gradient="from-violet-600 to-purple-500" onClick={(e) => { e.stopPropagation(); setReturnModalOpen(true); }}>
              View Return Details
            </Btn>
          )}

          {booking.status === "Completed" && !booking.final_payment && (
            <Btn gradient="from-blue-600 to-blue-500" onClick={(e) => { e.stopPropagation(); setReturnModalOpen(true); }}>
              💳 Pay Final — ৳{finalFee}
            </Btn>
          )}

          {booking.status === "Completed" && booking.final_payment && (
            booking.reviewed ? (
              <Btn outlined disabled>
                ✓ Review Submitted
              </Btn>
            ) : (
              <Btn gradient="from-orange-500 to-amber-500" onClick={(e) => { e.stopPropagation(); setReviewModalOpen(true); }}>
                ★ Leave a Review
              </Btn>
            )
          )}

          <button
            onClick={handleNavigateDetail}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            View Trip Details <FiArrowRight />
          </button>
        </div>
      </div>

      {booking.pickup_id && (
        <PickupDetailsModal
          open={pickupModalOpen}
          onClose={() => setPickupModalOpen(false)}
          pickup={booking}
          bookingId={booking.booking_id}
          vehicleName={booking.brand && booking.model ? `${booking.brand} ${booking.model}` : null}
          onConfirmed={() => queryClient.invalidateQueries(["userBookings"])}
        />
      )}

      {booking.return_id && (
        <ReturnDetailsModal
          open={returnModalOpen}
          onClose={() => setReturnModalOpen(false)}
          booking={booking}
          onConfirmed={() => queryClient.invalidateQueries(["userBookings"])}
        />
      )}

      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        booking={booking}
        onReviewed={() => queryClient.invalidateQueries(["userBookings"])}
      />

      <DamageReportModal
        open={damageModalOpen}
        onClose={() => setDamageModalOpen(false)}
        booking={booking}
        onSubmitted={() => queryClient.invalidateQueries(["userBookings"])}
      />
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <span className="text-gray-400 mt-0.5 text-base flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-gray-700 font-semibold text-xs truncate">{value}</p>
    </div>
  </div>
);

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
    pickup_confirmed: PropTypes.bool,
    return_id: PropTypes.string,
    late_fee: PropTypes.number,
    return_fuel_charge: PropTypes.number,
    cleaning_charge: PropTypes.number,
    return_confirmed: PropTypes.bool,
    final_payment: PropTypes.bool,
    reviewed: PropTypes.bool,
  }).isRequired,
};

export default BookingCard;
