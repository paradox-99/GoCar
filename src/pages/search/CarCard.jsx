import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { BsFuelPumpFill } from "react-icons/bs";
import { FaStar, FaCheckCircle } from "react-icons/fa";
import { PiSeatFill } from "react-icons/pi";
import { TbManualGearbox } from "react-icons/tb";

const CarCard = ({ car, carBookingInfo, to, state }) => {
    const available = car?.status === "Available";
    const image = Array.isArray(car?.images) ? car.images[0] : car?.images;
    const id = car?.car_id || car?.vehicle_id;

    return (
        <Link
            to={to ?? `/details/${id}`}
            state={state ?? { carBookingInfo }}
            className="group block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
        >
            {/* Image */}
            <div className="relative aspect-video overflow-hidden bg-gray-100">
                <img
                    src={image}
                    alt={`${car?.brand} ${car?.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className={`absolute top-2.5 right-2.5 text-xs font-semibold px-2 py-0.5 rounded-full ${available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {available ? "Available" : "Unavailable"}
                </span>
                {car?.verified && (
                    <span className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-white/90 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                        <FaCheckCircle className="text-xs" /> Verified
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                {/* Title row */}
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-base leading-snug">
                        {car?.brand} {car?.model}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">{car?.build_year}</span>
                </div>

                <p className="text-xs text-gray-400 mb-3">{car?.car_type}</p>

                {/* Specs row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-gray-500 text-sm mb-4">
                    <span className="flex items-center gap-1.5">
                        <BsFuelPumpFill className="text-primary text-xs" />
                        {car?.fuel}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <PiSeatFill className="text-primary text-xs" />
                        {car?.seats} seats
                    </span>
                    <span className="flex items-center gap-1.5">
                        <TbManualGearbox className="text-primary text-xs" />
                        {car?.transmission_type}
                    </span>
                    <span className="flex items-center gap-1">
                        <FaStar className="text-yellow-400 text-xs" />
                        <span className="text-gray-600">{parseFloat(car?.rating || 0).toFixed(1)}</span>
                        <span className="text-gray-400 text-xs">({car?.rating_count ?? 0})</span>
                    </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 pt-3 border-t border-gray-100">
                    <span className="text-primary text-xl font-extrabold">৳{car?.rental_price}</span>
                    <span className="text-gray-400 text-sm">/hour</span>
                </div>
            </div>
        </Link>
    );
};

CarCard.propTypes = {
    car: PropTypes.object.isRequired,
    carBookingInfo: PropTypes.object,
    to: PropTypes.string,
    state: PropTypes.object,
};

export default CarCard;
