import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const AgencyCard = ({ agency }) => {

     const { agency_id, agency_Name, image, total_vehicles, area } = agency
     const navigate = useNavigate();

     return (
          <div className='flex border rounded-xl lg:w-[35%] shadow-xl px-5 py-2 justify-between cursor-pointer'
          onClick={() => navigate(`/agency/${agency_id}`)}
          >
               <div className="flex flex-col gap-2">
                    <p><span className="font-bold text-lg">Agency Name:</span> {agency_Name}</p>
                    <p><span className="font-bold text-lg">Address: </span>{area}</p>
                    <p><span className="font-bold text-lg">Vehicle: </span>{total_vehicles}</p>
               </div>
                    <img src={image} alt="" className="w-28 h-28 rounded-full"/>
          </div>
     );
};

AgencyCard.propTypes = {
     agency: PropTypes.object.isRequired,
}

export default AgencyCard;