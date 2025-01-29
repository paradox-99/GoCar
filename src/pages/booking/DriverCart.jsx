import PropTypes from "prop-types";

const DriverCart = ({ driver, setSelectedDriver, handleClose }) => {

     const handleClick = () => {
          setSelectedDriver(driver);
          handleClose();
     }

     return (
          <div onClick={handleClick} className='shadow-md p-4 w-[300px] flex items-center gap-3 hover:cursor-pointer'>
               <img src={driver.image} alt="" className="w-28 h-28 rounded-lg" />
               <div>
                    <h2 className="text-lg font-medium">{driver.name}</h2>
                    <h2 className=""><span className="font-semibold">Experience:</span> {driver.experience}</h2>
                    <h2 className=""><span className="font-semibold">Phone:</span> {driver.phone}</h2>
                    <h2 className=""><span className="font-semibold">Hiring price:</span> {driver.hiring_price}</h2>
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