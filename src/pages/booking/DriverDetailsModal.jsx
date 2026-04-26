import PropTypes from 'prop-types';
import { Dialog, IconButton } from '@mui/material';
import { HiXMark, HiStar, HiCheckBadge } from 'react-icons/hi2';
import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from '../../hooks/useAxiosPublic';

const DriverDetailsModal = ({ driver, open, onClose, onSelect }) => {
     const axiosPublic = useAxiosPublic();

     const { data: reviews = [], isPending } = useQuery({
          queryKey: ['driver-reviews', driver?.driver_id],
          queryFn: async () => {
               if (!driver?.driver_id) return [];
               const res = await axiosPublic.get(`/reviewRoutes/received/driver/${driver.driver_id}`, {
                    headers: {
                         Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
               });
               return res.data;
          },
          enabled: !!driver?.driver_id
     });

     if (!driver) return null;

     return (
          <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
               <div className="relative">
                    {/* Close Button */}
                    <IconButton 
                         onClick={onClose}
                         sx={{ position: 'absolute', right: 8, top: 8, zIndex: 10, bgcolor: 'rgba(255,255,255,0.8)' }}
                    >
                         <HiXMark className="w-5 h-5 text-gray-700" />
                    </IconButton>

                    {/* Cover & Avatar */}
                    <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600 rounded-t"></div>
                    <div className="px-6 relative">
                         <img 
                              src={driver.photo} 
                              alt={driver.name}
                              className="w-24 h-24 rounded-full border-4 border-white absolute -top-12 object-cover bg-white"
                         />
                         <div className="pt-14 pb-4">
                              <div className="flex items-center justify-between mb-2">
                                   <div>
                                        <div className="flex items-center gap-1">
                                             <h2 className="text-2xl font-bold text-gray-800">{driver.name}</h2>
                                             <HiCheckBadge className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <p className="text-gray-500">{driver.experience_year} Years Experience</p>
                                   </div>
                                   <div className="text-right">
                                        <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Hourly Rate</p>
                                        <p className="text-2xl font-bold text-orange-600">৳{driver.rental_price}</p>
                                   </div>
                              </div>

                              <div className="flex items-center gap-4 text-sm mt-4 p-4 bg-gray-50 rounded-lg">
                                   <div className="flex flex-col">
                                        <span className="text-gray-500 font-semibold mb-1">Rating</span>
                                        <div className="flex items-center gap-1">
                                             <HiStar className="w-5 h-5 text-orange-500" />
                                             <span className="font-bold text-gray-800 text-lg">{Number(driver.rating).toFixed(1)}</span>
                                        </div>
                                   </div>
                                   <div className="w-px h-10 bg-gray-200"></div>
                                   <div className="flex flex-col">
                                        <span className="text-gray-500 font-semibold mb-1">Phone</span>
                                        <span className="font-medium text-gray-800">{driver.phone}</span>
                                   </div>
                                   <div className="w-px h-10 bg-gray-200"></div>
                                   <div className="flex flex-col">
                                        <span className="text-gray-500 font-semibold mb-1">Location</span>
                                        <span className="font-medium text-gray-800 line-clamp-1">{driver.display_name}</span>
                                   </div>
                              </div>
                         </div>
                    </div>

                    <div className="px-6 pb-6">
                         <h3 className="text-lg font-bold text-gray-800 mb-4">Reviews</h3>
                         <div className="max-h-48 overflow-y-auto pr-2 space-y-4 mb-6">
                              {isPending ? (
                                   <p className="text-gray-500 text-center py-4">Loading reviews...</p>
                              ) : reviews.length > 0 ? (
                                   reviews.map(review => (
                                        <div key={review.id || review.review_id} className="bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                                             <div className="flex justify-between items-start mb-2">
                                                  <div className="flex items-center gap-2">
                                                       <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                                            {review.name?.charAt(0) || 'U'}
                                                       </div>
                                                       <div>
                                                            <p className="font-semibold text-gray-800 text-sm">{review.name || 'User'}</p>
                                                            <div className="flex items-center">
                                                                 {[...Array(5)].map((_, i) => (
                                                                      <HiStar key={i} className={`w-3 h-3 ${i < review.rating ? 'text-orange-500' : 'text-gray-300'}`} />
                                                                 ))}
                                                            </div>
                                                       </div>
                                                  </div>
                                                  <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                                             </div>
                                             <p className="text-gray-600 text-sm">{review.review}</p>
                                        </div>
                                   ))
                              ) : (
                                   <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No reviews yet.</p>
                              )}
                         </div>

                         <button
                              onClick={() => {
                                   onSelect(driver);
                                   onClose();
                              }}
                              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors duration-300"
                         >
                              Select Driver
                         </button>
                    </div>
               </div>
          </Dialog>
     );
};

DriverDetailsModal.propTypes = {
     driver: PropTypes.object,
     open: PropTypes.bool.isRequired,
     onClose: PropTypes.func.isRequired,
     onSelect: PropTypes.func.isRequired
};

export default DriverDetailsModal;
