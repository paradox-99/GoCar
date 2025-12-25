import PropTypes from "prop-types";

const DriverCart = ({ driver, setSelectedDriver, handleClose }) => {

     const handleClick = () => {
          setSelectedDriver(driver);
          handleClose();
     }

     return (
          <div 
               onClick={handleClick} 
               className='border border-gray-200 rounded-lg p-5 w-[250px] hover:shadow-lg hover:border-orange-300 transition-all duration-300 hover:cursor-pointer bg-white'
          >
               <img 
                    src={driver.photo} 
                    alt={driver.name} 
                    className="w-full h-32 rounded-lg mb-4"
               />
               <div className="space-y-3">
                    <h2 className="text-lg font-bold text-gray-800">{driver.name}</h2>
                    <div className="space-y-2 text-sm text-gray-600">
                         <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Experience:</span>
                              <span className="text-gray-800 font-medium">{driver.experience_year} years</span>
                         </div>
                         <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Rating:</span>
                              <span className="text-gray-800 font-medium">{driver.rating}</span>
                         </div>
                         <div className="flex justify-between items-center pt-2 border-t">
                              <span className="font-semibold text-gray-700">Rate:</span>
                              <span className="text-lg font-bold text-orange-600">{driver.hiring_price} Tk/hr</span>
                         </div>
                    </div>
               </div>
          </div>
     );
};

DriverCart.propTypes = {
     driver: PropTypes.object.isRequired,
     setSelectedDriver: PropTypes.func,
     handleClose: PropTypes.func,
}

export default DriverCart;