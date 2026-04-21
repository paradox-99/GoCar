import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import toast from 'react-hot-toast';

const DriverTripDetail = () => {
     const location = useLocation();
     const navigate = useNavigate();
     const axiosPublic = useAxiosPublic();
     const bookingData = location.state?.booking;

     const [isLoading, setIsLoading] = useState(false);

     if (!bookingData) {
          return (
               <div className="p-6 bg-white min-h-screen">
                    <div className="mb-4">
                         <Link to="/dashboard/driver/trips" className="text-primary underline">◀ Back to trips</Link>
                    </div>
                    <div className="text-center py-16">
                         <p className="text-gray-500 text-lg">No trip data found.</p>
                    </div>
               </div>
          );
     }

     const handleUpdateStatus = async (newStatus) => {
          setIsLoading(true);
          try {
               const response = await axiosPublic.patch(`bookingRoutes/updateStatus/${bookingData.booking_id}`, { status: newStatus });
               if (response.status === 200) {
                    toast.success(`Status updated to ${newStatus}`);
                    // In a real app, you'd re-fetch or update local state
                    navigate('/dashboard/driver/trips');
               }
          } catch (error) {
               toast.error(error?.response?.data?.message || 'Failed to update status');
          } finally {
               setIsLoading(false);
          }
     };

     const showPickupButton = bookingData.status === 'Confirmed';
     const showReturnButton = bookingData.status === 'Running';

     return (
          <div className="p-6 bg-gray-50 min-h-screen">
               <div className="mb-4">
                    <Link to="/dashboard/driver/trips" className="text-primary underline hover:text-blue-700">◀ Back to trips</Link>
               </div>

               {/* Header */}
               <div className="bg-primary text-white py-6 px-6 rounded-lg mb-6 flex justify-between items-start">
                    <div>
                         <h1 className="text-3xl font-bold mb-2">Trip Details</h1>
                         <p className="text-blue-100">Booking ID: {bookingData.booking_id}</p>
                    </div>
                    <div className="flex gap-2">
                         {showPickupButton && (
                              <Link
                                   to={`/dashboard/driver/trips/${bookingData.booking_id}/pickup`}
                                   state={{ booking: bookingData }}
                                   className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                              >
                                   Log Pickup
                              </Link>
                         )}
                         {showReturnButton && (
                              <Link
                                   to={`/dashboard/driver/trips/${bookingData.booking_id}/return`}
                                   state={{ booking: bookingData }}
                                   className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                              >
                                   Log Return
                              </Link>
                         )}
                         <Link
                              to="/dashboard/report-damage"
                              state={{ booking: bookingData }}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-1"
                         >
                              Report Damage
                         </Link>
                    </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Section */}
                    <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
                         <h2 className="text-xl font-semibold mb-4 text-gray-800">Customer Details</h2>
                         {bookingData.user_photo && (
                              <img
                                   src={bookingData.user_photo}
                                   alt={bookingData.user_name}
                                   className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-gray-100"
                              />
                         )}
                         <div className="space-y-4">
                              <div>
                                   <p className="text-gray-600 text-sm">Name</p>
                                   <p className="font-semibold text-gray-800 text-lg">{bookingData.user_name || 'N/A'}</p>
                              </div>
                              <div>
                                   <p className="text-gray-600 text-sm">Phone</p>
                                   <p className="font-semibold text-gray-800">{bookingData.user_phone || 'N/A'}</p>
                              </div>
                              <div>
                                   <p className="text-gray-600 text-sm">Email</p>
                                   <p className="font-semibold text-gray-800">{bookingData.user_email || 'N/A'}</p>
                              </div>
                              <div>
                                   <p className="text-gray-600 text-sm">Pickup Address</p>
                                   <p className="font-semibold text-gray-800">{bookingData.user_address || 'N/A'}</p>
                              </div>
                         </div>
                    </div>

                    {/* Vehicle & Trip Info Section */}
                    <div className="lg:col-span-2 space-y-6">
                         {/* Trip Schedule */}
                         <div className="bg-white rounded-lg shadow-md p-6">
                              <h2 className="text-xl font-semibold mb-4 text-gray-800">Schedule & Destination</h2>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                   <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <p className="text-blue-600 text-xs uppercase font-bold mb-1">Pickup Schedule</p>
                                        <p className="text-lg font-bold text-gray-800">
                                             {bookingData.start_ts ? moment(bookingData.start_ts).format('DD MMM YYYY, hh:mm A') : 'N/A'}
                                        </p>
                                   </div>
                                   <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <p className="text-blue-600 text-xs uppercase font-bold mb-1">Return Schedule</p>
                                        <p className="text-lg font-bold text-gray-800">
                                             {bookingData.end_ts ? moment(bookingData.end_ts).format('DD MMM YYYY, hh:mm A') : 'N/A'}
                                        </p>
                                   </div>
                              </div>
                              <div className="space-y-4">
                                   <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-gray-600 text-sm">Estimated Destination</p>
                                        <p className="font-semibold text-gray-800">{bookingData.estimated_destination || 'N/A'}</p>
                                   </div>
                                   <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-gray-600 text-sm">Purpose</p>
                                        <p className="font-semibold text-gray-800">{bookingData.booking_purpose || 'N/A'}</p>
                                   </div>
                              </div>
                         </div>

                         {/* Vehicle Info */}
                         <div className="bg-white rounded-lg shadow-md p-6">
                              <h2 className="text-xl font-semibold mb-4 text-gray-800">Vehicle Information</h2>
                              <div className="flex flex-col md:flex-row gap-6">
                                   {bookingData.images && (
                                        <img
                                             src={bookingData.images}
                                             alt={bookingData.model}
                                             className="w-full md:w-48 h-32 object-cover rounded-lg"
                                        />
                                   )}
                                   <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div>
                                             <p className="text-gray-600 text-sm">Vehicle</p>
                                             <p className="font-semibold text-gray-800">{bookingData.brand} {bookingData.model}</p>
                                        </div>
                                        <div>
                                             <p className="text-gray-600 text-sm">Type</p>
                                             <p className="font-semibold text-gray-800">{bookingData.car_type || 'N/A'}</p>
                                        </div>
                                        <div>
                                             <p className="text-gray-600 text-sm">Fuel Type</p>
                                             <p className="font-semibold text-gray-800">{bookingData.fuel || 'N/A'}</p>
                                        </div>
                                        <div>
                                             <p className="text-gray-600 text-sm">Seats</p>
                                             <p className="font-semibold text-gray-800">{bookingData.seats || 'N/A'}</p>
                                        </div>
                                        <div>
                                             <p className="text-gray-600 text-sm">Transmission</p>
                                             <p className="font-semibold text-gray-800">{bookingData.transmission_type || 'N/A'}</p>
                                        </div>
                                        <div>
                                             <p className="text-gray-600 text-sm">Mileage (Ref)</p>
                                             <p className="font-semibold text-gray-800">{bookingData.mileage || 'N/A'} km</p>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         {/* Agency Info */}
                         <div className="bg-white rounded-lg shadow-md p-6">
                              <h2 className="text-xl font-semibold mb-4 text-gray-800">Agency Information</h2>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <div>
                                        <p className="text-gray-600 text-sm">Agency</p>
                                        <p className="font-semibold text-gray-800">{bookingData.agency_name || 'N/A'}</p>
                                   </div>
                                   <div>
                                        <p className="text-gray-600 text-sm">Agency Phone</p>
                                        <p className="font-semibold text-gray-800">{bookingData.agency_phone || 'N/A'}</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
};

export default DriverTripDetail;
