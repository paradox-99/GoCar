import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import toast from 'react-hot-toast';

const BookingDetails = () => {
     const location = useLocation();
     const navigate = useNavigate();
     const axios = useAxiosPublic();
     const bookingData = location.state?.booking;
     
     const [openDialog, setOpenDialog] = useState(false);
     const [isLoading, setIsLoading] = useState(false);
     const [message, setMessage] = useState({ type: '', text: '' });
     const [cancelReason, setCancelReason] = useState('');
     const axiosPublic = useAxiosPublic();

     if (!bookingData) {
          return (
               <div className="p-6 bg-white min-h-screen">
                    <div className="mb-4">
                         <Link to="/dashboard/user/bookings" className="text-primary underline">◀ Back to bookings</Link>
                    </div>
                    <div className="text-center py-16">
                         <p className="text-gray-500 text-lg">No booking data found.</p>
                    </div>
               </div>
          );
     }

     const handleCancelClick = () => {
          setOpenDialog(true);
     };

     const handleConfirmCancel = async () => {
          setIsLoading(true);
          setOpenDialog(false);
          setMessage({ type: '', text: '' });

          const data = {
               cancelReason: cancelReason || 'No reason provided',
               cancelledBy: 'user'
          };

          try {
               const response = await axiosPublic.put(`bookingRoutes/cancelBooking/${bookingData.booking_id}`, data);
               
               if (response.status === 200) {
                    toast.success('Booking cancelled successfully.');
               }

               setMessage({
                    type: 'success',
                    text: 'Booking cancelled successfully.'
               });
               setCancelReason('');
               setTimeout(() => {
                    navigate('/dashboard/user/bookings');
               }, 2000);
          } catch (error) {
               setMessage({
                    type: 'error',
                    text: error?.response?.data?.message || 'Failed to cancel booking. Please try again.'
               });
               setIsLoading(false);
          }
     };

     const handleCloseDialog = () => {
          setOpenDialog(false);
          setCancelReason('');
     };

     const canCancel = ['Requested', 'Confirmed'].includes(bookingData.status);

     return (
          <div className="p-6 bg-gray-50 min-h-screen">
               <div className="mb-4">
                    <Link to="/dashboard/user/bookings" className="text-primary underline hover:text-blue-700">◀ Back to bookings</Link>
               </div>

               {/* Success/Error Message */}
               {message.text && (
                    <div className={`mb-4 p-4 rounded-lg ${
                         message.type === 'success' 
                              ? 'bg-green-100 text-green-700 border border-green-300' 
                              : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                         {message.text}
                    </div>
               )}

               {/* Header */}
               <div className="bg-primary text-white py-6 px-6 rounded-lg mb-6 flex justify-between items-start">
                    <div>
                         <h1 className="text-3xl font-bold mb-2">Booking Details</h1>
                         <p className="text-blue-100">Booking ID: {bookingData.booking_id || bookingData._id || 'N/A'}</p>
                    </div>
                    {canCancel && (
                         <button
                              onClick={handleCancelClick}
                              disabled={isLoading}
                              className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                         >
                              {isLoading ? 'Cancelling...' : 'Cancel Booking'}
                         </button>
                    )}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Car Section */}
                    <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
                         <div className="p-6">
                              <h2 className="text-xl font-semibold mb-4 text-gray-800">Vehicle Details</h2>

                              {bookingData.images && (
                                   <img
                                        src={bookingData.images}
                                        alt={`${bookingData.brand} ${bookingData.model}`}
                                        className="w-full h-56 object-cover rounded-lg mb-4"
                                   />
                              )}

                              <div className="space-y-3">
                                   <div>
                                        <p className="text-gray-600 text-sm">Model</p>
                                        <p className="font-semibold text-gray-800">{bookingData.brand} {bookingData.model}</p>
                                   </div>

                                   <div>
                                        <p className="text-gray-600 text-sm">Car Type</p>
                                        <p className="font-semibold text-gray-800">{bookingData.car_type || 'N/A'}</p>
                                   </div>

                                   <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                             <p className="text-gray-600">Seats</p>
                                             <p className="font-semibold text-gray-800">{bookingData.seats || 'N/A'}</p>
                                        </div>
                                        <div>
                                             <p className="text-gray-600">Transmission</p>
                                             <p className="font-semibold text-gray-800">{bookingData.transmission_type || 'N/A'}</p>
                                        </div>
                                   </div>

                                   <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                             <p className="text-gray-600">Fuel</p>
                                             <p className="font-semibold text-gray-800">{bookingData.fuel || 'N/A'}</p>
                                        </div>
                                        <div>
                                             <p className="text-gray-600">Gear</p>
                                             <p className="font-semibold text-gray-800">{bookingData.gear || 'N/A'}</p>
                                        </div>
                                   </div>

                                   <div>
                                        <p className="text-gray-600 text-sm">Mileage</p>
                                        <p className="font-semibold text-gray-800">{bookingData.mileage || 'N/A'} km</p>
                                   </div>

                                   <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                        <p className="text-gray-600 text-sm">Rental Price</p>
                                        <p className="font-bold text-orange-600 text-lg">৳{bookingData.rental_price || '0'}/day</p>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Booking & Agency & Driver Section */}
                    <div className="lg:col-span-2 space-y-6">
                         {/* Booking Info */}
                         <div className="bg-white rounded-lg shadow-md p-6">
                              <h2 className="text-xl font-semibold mb-4 text-gray-800">Booking Information</h2>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                   <div>
                                        <p className="text-gray-600 text-sm">Booking ID</p>
                                        <p className="font-semibold text-gray-800">{bookingData.booking_id}</p>
                                   </div>

                                   <div>
                                        <p className="text-gray-600 text-sm">Status</p>
                                        <p className={`font-semibold px-3 py-1 rounded-full text-sm w-fit ${bookingData.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                  bookingData.status === 'Requested' ? 'bg-yellow-100 text-yellow-700' :
                                                       bookingData.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                             }`}>
                                             {bookingData.status}
                                        </p>
                                   </div>

                                   <div>
                                        <p className="text-gray-600 text-sm">Pickup Date & Time</p>
                                        <p className="font-semibold text-gray-800">
                                             {bookingData.start_ts ? moment(bookingData.start_ts).format('DD-MMM-YYYY hh:mm A') : 'N/A'}
                                        </p>
                                   </div>

                                   <div>
                                        <p className="text-gray-600 text-sm">Return Date & Time</p>
                                        <p className="font-semibold text-gray-800">
                                             {bookingData.end_ts ? moment(bookingData.end_ts).format('DD-MMM-YYYY hh:mm A') : 'N/A'}
                                        </p>
                                   </div>

                                   <div>
                                        <p className="text-gray-600 text-sm">Total Duration</p>
                                        <p className="font-semibold text-gray-800">{bookingData.total_rent_hours || 'N/A'} hours</p>
                                   </div>

                                   <div>
                                        <p className="text-gray-600 text-sm">Rental Type</p>
                                        <p className="font-semibold text-gray-800">{bookingData.driver_id ? 'With Driver' : 'Self Drive'}</p>
                                   </div>
                              </div>

                              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                   <p className="text-gray-600 text-sm mb-1">Total Cost</p>
                                   <p className="font-bold text-orange-600 text-2xl">৳{bookingData.total_cost || '0'}</p>
                                   {bookingData.remaining_amount && bookingData.remaining_amount > 0 && (
                                        <p className="text-red-600 text-sm mt-2">Remaining: ৳{bookingData.remaining_amount}</p>
                                   )}
                              </div>
                         </div>

                         {/* Agency & User Info */}
                         <div className="bg-white rounded-lg shadow-md p-6">
                              <h2 className="text-xl font-semibold mb-4 text-gray-800">Agency Information</h2>

                              <div className="md:grid md:grid-cols-2 md:gap-4">
                                   <div>
                                        <div className="space-y-2">
                                             <div>
                                                  <p className="text-gray-600 text-sm">Agency Name</p>
                                                  <p className="font-semibold text-gray-800">{bookingData.agency_name || 'N/A'}</p>
                                             </div>
                                             <div>
                                                  <p className="text-gray-600 text-sm">Phone</p>
                                                  <p className="font-semibold text-gray-800">{bookingData.agency_phone || 'N/A'}</p>
                                             </div>
                                        </div>
                                   </div>
                                   <div>
                                        <div className="space-y-2">
                                             <div>
                                                  <p className="text-gray-600 text-sm">Email</p>
                                                  <p className="font-semibold text-gray-800">{bookingData.agency_email || 'N/A'}</p>
                                             </div>
                                             <div>
                                                  <p className="text-gray-600 text-sm">Address</p>
                                                  <p className="font-semibold text-gray-800">{bookingData.agency_address || 'N/A'}</p>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         {/* Driver Info - Only show if driver is selected */}
                         {bookingData.driver_id && (
                              <div className="bg-white rounded-lg shadow-md p-6">
                                   <h2 className="text-xl font-semibold mb-4 text-gray-800">Driver Information</h2>

                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {bookingData.driver_photo && (
                                             <div className="flex justify-center md:col-span-1">
                                                  <img
                                                       src={bookingData.driver_photo}
                                                       alt={bookingData.driver_name}
                                                       className="w-40 h-40 object-cover rounded-lg"
                                                  />
                                             </div>
                                        )}

                                        <div className={bookingData.driver_photo ? 'md:col-span-2' : ''}>
                                             <div className="space-y-3">
                                                  <div>
                                                       <p className="text-gray-600 text-sm">Name</p>
                                                       <p className="font-semibold text-gray-800">{bookingData.driver_name || 'N/A'}</p>
                                                  </div>

                                                  <div>
                                                       <p className="text-gray-600 text-sm">Email</p>
                                                       <p className="font-semibold text-gray-800">{bookingData.driver_email || 'N/A'}</p>
                                                  </div>

                                                  <div>
                                                       <p className="text-gray-600 text-sm">Phone</p>
                                                       <p className="font-semibold text-gray-800">{bookingData.driver_phone || 'N/A'}</p>
                                                  </div>

                                                  <div className="grid grid-cols-2 gap-3">
                                                       <div>
                                                            <p className="text-gray-600 text-sm">Experience</p>
                                                            <p className="font-semibold text-gray-800">{bookingData.experience_year || 'N/A'} years</p>
                                                       </div>

                                                       <div>
                                                            <p className="text-gray-600 text-sm">Rating</p>
                                                            <p className="font-semibold text-yellow-600 text-lg">
                                                                 ⭐ {bookingData.rating || 'N/A'}
                                                            </p>
                                                       </div>
                                                  </div>

                                                  <div>
                                                       <p className="text-gray-600 text-sm">Address</p>
                                                       <p className="font-semibold text-gray-800">{bookingData.driver_address || 'N/A'}</p>
                                                  </div>
                                                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                                       <p className="text-gray-600 text-sm">Rental Price</p>
                                                       <p className="font-bold text-orange-600 text-lg">৳{bookingData.rental_price || '0'}/day</p>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         )}
                    </div>
               </div>

               {/* Confirmation Dialog */}
               <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle className="text-lg font-semibold">Cancel Booking</DialogTitle>
                    <DialogContent>
                         <p className="text-gray-700 mt-4">
                              Are you sure you want to cancel this booking? This action cannot be undone.
                         </p>
                         <p className="text-sm text-gray-600 mt-3">
                              Booking ID: <span className="font-semibold">{bookingData.booking_id}</span>
                         </p>
                         <div className="mt-4">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                   Reason for Cancellation (Optional)
                              </label>
                              <textarea
                                   value={cancelReason}
                                   onChange={(e) => setCancelReason(e.target.value)}
                                   placeholder="Please tell us why you're cancelling this booking..."
                                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                   rows="3"
                                   maxLength="250"
                              />
                              <p className="text-xs text-gray-500 mt-1">{cancelReason.length}/250 characters</p>
                         </div>
                    </DialogContent>
                    <DialogActions>
                         <Button 
                              onClick={handleCloseDialog} 
                              disabled={isLoading}
                              variant="outlined"
                         >
                              Keep Booking
                         </Button>
                         <Button 
                              onClick={handleConfirmCancel} 
                              disabled={isLoading}
                              variant="contained" 
                              color="error"
                         >
                              {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
                         </Button>
                    </DialogActions>
               </Dialog>
          </div>
     );
};

export default BookingDetails;
