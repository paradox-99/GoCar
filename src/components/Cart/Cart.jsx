import PropTypes from "prop-types";
import { BsFuelPumpFill } from "react-icons/bs";
import { FaCarSide } from "react-icons/fa";
import { PiSeatFill } from "react-icons/pi";
import { TbManualGearboxFilled } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";

const Cart = ({ car, carBookingInfo }) => {

     console.log(carBookingInfo);
     

     return (
          <div className="max-w-80 p-5 rounded-lg border-2 border-[#F9F9F9] shadow-lg">
               <figure className="h-44">
                    <img src={car?.photo} alt="photo" className="rounded-lg h-[176px] w-[276px]" />
               </figure>
               <div className="pt-5 flex justify-between items-center pb-3">
                    <h2 className="text-2xl font-bold">{car?.brand} {car?.model}</h2>
                    {/* <p className="text-xl font-semibold flex items-center gap-2">
            <FaStar className="text-primary" /> <span>{car?.vehicle_info?.rating}</span>
          </p> */}
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
                         <TbManualGearboxFilled className="text-primary" />
                         <span className="pl-2 border-l-2 border-l-primary border-secondary">
                              {car?.gear}
                         </span>
                    </p>
               </div>
               <hr className="h-[3px] bg-secondary" />
               <div className="flex justify-between items-center py-3">
                    <div>
                         <p className="text-lg font-semibold">Hourly rate - </p>
                         <h2 className="text-xl font-semibold text-center">
                              <span className="text-primary">৳</span>
                              <span className="">{car?.rental_price}</span>
                         </h2>
                    </div>
                    <div>
                         <Link to={`/details/${car.brand}_${car.model}`} state={{car, carBookingInfo}} className="bg-primary hover:bg-transparent hover:border-2 border-primary hover:text-primary duration-500 active:scale-75 shadow-inner shadow-secondary border-2 px-3 py-2 text-white rounded-lg font-semibold">
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