import PropTypes from "prop-types";
import { HiStar, HiCheckBadge } from "react-icons/hi2";

const DriverCart = ({ driver, setSelectedDriver, handleClose, handleViewDetails }) => {

     const handleSelect = (e) => {
          e.stopPropagation();
          setSelectedDriver(driver);
          handleClose();
     }

     const handleClick = () => {
          if (handleViewDetails) {
               handleViewDetails(driver);
          }
     }

     return (
          <div 
               onClick={handleClick} 
               className='group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col w-[260px]'
          >
               <div className="relative h-36 bg-gray-50 overflow-hidden">
                    <img 
                         src={driver.photo} 
                         alt={driver.name} 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                         <HiStar className="w-4 h-4 text-orange-500" />
                         <span className="text-sm font-bold text-gray-800">{Number(driver.rating).toFixed(1)}</span>
                    </div>
               </div>
               
               <div className="p-4 flex flex-col flex-grow">
                    <div className="flex items-center gap-1 mb-1">
                         <h2 className="text-lg font-bold text-gray-800 truncate">{driver.name}</h2>
                         <HiCheckBadge className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-4">
                         {driver.experience_year} years experience
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                         <div>
                              <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Rate</span>
                              <div className="flex items-baseline gap-1">
                                   <span className="text-xl font-bold text-orange-600">৳{driver.rental_price}</span>
                                   <span className="text-sm text-gray-500">/hr</span>
                              </div>
                         </div>
                         
                         <button 
                              onClick={handleSelect}
                              className="px-4 py-2 bg-orange-50 text-orange-600 font-bold rounded-lg hover:bg-orange-500 hover:text-white transition-colors duration-300"
                         >
                              Select
                         </button>
                    </div>
               </div>
          </div>
     );
};

DriverCart.propTypes = {
     driver: PropTypes.object.isRequired,
     setSelectedDriver: PropTypes.func,
     handleClose: PropTypes.func,
     handleViewDetails: PropTypes.func,
}

export default DriverCart;