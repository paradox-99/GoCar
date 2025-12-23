import PropTypes from "prop-types";
import { BsFuelPumpFill } from "react-icons/bs";
import { FaCarSide, FaStar } from "react-icons/fa";
import { PiSeatFill } from "react-icons/pi";
import { Link, useNavigate } from "react-router-dom";

const Cart = ({ car, carBookingInfo }) => {

     let Availability = false;

     if (car?.status === "Available") {
          Availability = true;
     }

     console.log(carBookingInfo);
     

     return (
          <div className="w-[395px] p-5 rounded-lg border-2 border-[#F9F9F9] shadow-lg">
               <figure className="h-[231px]">
                    <img src={car?.images} alt="photo" className="rounded-lg h-[231px] w-[351px]" />
               </figure>
               <div className="pt-5 flex justify-between items-start pb-3">
                    <h2 className="text-lg font-bold">{car?.brand} {car?.model}</h2>
                    <div className="flex flex-col items-end">
                         
                         {/* Availability Status */}
                         <p className="text-sm mt-1 flex items-center gap-1">
                              <span
                                   className={`w-3 h-3 rounded-full ${Availability ? "bg-green-500" : "bg-red-500"}`}
                              ></span>
                              {Availability ? "Available" : "Unavailable"}
                         </p>
                    </div>

               </div>
               <div className="grid grid-cols-2 gap-3 font-medium py-4 ">
                    <p className="flex gap-1 lg:gap-2 items-center">
                         <FaCarSide className="text-primary" />
                         <span className="pl-2 border-l-2 border-l-primary border-secondary">
                              {car?.brand}
                         </span>
                    </p>
                    <p className="flex gap-1 lg:gap-2 items-center">
                         <BsFuelPumpFill className="text-primary" />
                         <span className="pl-2 border-l-2 border-l-primary border-secondary">
                              {car?.fuel}
                         </span>
                    </p>
                    <p className="flex gap-1 lg:gap-2 items-center">
                         <PiSeatFill className="text-primary" />
                         <span className="pl-2 border-l-2 border-l-primary border-secondary">
                              {car?.seats}
                         </span>
                    </p>
                    <p className="flex gap-1 lg:gap-2 items-center">
                         <FaStar className="text-primary" />
                         <span className="pl-2 border-l-2 border-l-primary border-secondary">
                              {car?.rating}
                         </span>
                    </p>
               </div>
               <hr className="h-[3px] bg-secondary" />
               <div className="flex justify-between items-center py-3">
                    <div>
                         <h2 className=" font-semibold text-center">
                              <span className="text-primary text-2xl">৳{car?.rental_price}</span>
                              <span className="text-gray-500">/hour</span>
                         </h2>
                    </div>
                    <div>
                         <Link to={`/details/${car.vehicle_id}`} state={{ carBookingInfo }} className="bg-primary hover:bg-transparent hover:border-2 border-primary hover:text-primary duration-500 active:scale-75 shadow-inner shadow-secondary border-2 px-3 py-2 text-white rounded-lg font-semibold">
                              Details
                         </Link>
                    </div>
               </div>
          </div>
     );
};

Cart.propTypes = {
     car: PropTypes.object.isRequired,
     carBookingInfo: PropTypes.object.isRequired,
}

export default Cart;