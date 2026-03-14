import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { HiMapPin, HiCog6Tooth, HiStar } from "react-icons/hi2";

const AgencyCard = ({ agency }) => {

     const { agency_id, agency_Name, image, total_vehicles, area } = agency
     const navigate = useNavigate();

     // Mock rating for now - can be replaced with real data
     const rating = 4.5;
     const reviews = 120;

     return (
          <div 
               className='bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group'
               onClick={() => navigate(`/agency/${agency_id}`)}
          >
               {/* Image Section */}
               <div className="relative overflow-hidden h-48 bg-gradient-to-br from-orange-50 to-orange-100">
                    <img 
                         src={image} 
                         alt={agency_Name}
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
               </div>

               {/* Content Section */}
               <div className="p-6">
                    {/* Agency Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                         {agency_Name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                         <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                   <HiStar
                                        key={i}
                                        className={`w-4 h-4 ${
                                             i < Math.floor(rating)
                                                  ? 'text-primary'
                                                  : 'text-gray-300'
                                        }`}
                                   />
                              ))}
                         </div>
                         <span className="text-sm text-gray-600">
                              {rating} ({reviews} reviews)
                         </span>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-3 mb-5 pb-5 border-b border-gray-200">
                         {/* Location */}
                         <div className="flex items-start gap-3">
                              <HiMapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <div>
                                   <p className="text-xs text-gray-500 font-semibold uppercase">Location</p>
                                   <p className="text-sm text-gray-700 font-medium">{area}</p>
                              </div>
                         </div>

                         {/* Vehicles */}
                         <div className="flex items-start gap-3">
                              <HiCog6Tooth className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <div>
                                   <p className="text-xs text-gray-500 font-semibold uppercase">Vehicles</p>
                                   <p className="text-sm text-gray-700 font-medium">{total_vehicles} cars available</p>
                              </div>
                         </div>
                    </div>

                    {/* View Button */}
                    <button className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity duration-300">
                         View Agency
                    </button>
               </div>
          </div>
     );
};

AgencyCard.propTypes = {
     agency: PropTypes.object.isRequired,
}

export default AgencyCard;