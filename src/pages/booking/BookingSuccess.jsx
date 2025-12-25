import { Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const BookingSuccess = () => {
     const navigate = useNavigate();
     const location = useLocation();
     const { bookingData } = location?.state || {};

     const handleGoHome = () => {
          navigate("/");
     };

     const handleViewBookings = () => {
          navigate("/dashboard/user-bookings");
     };

     return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 pt-24 pb-12">
               <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                         {/* Success Icon Section */}
                         <div className="bg-gradient-to-r from-green-400 to-green-500 p-8 flex justify-center">
                              <div className="relative">
                                   <div className="absolute inset-0 bg-green-300 rounded-full animate-pulse"></div>
                                   <CheckCircleIcon sx={{ fontSize: 80, color: 'white', position: 'relative', zIndex: 10 }} />
                              </div>
                         </div>

                         {/* Content Section */}
                         <div className="p-8">
                              <h1 className="text-3xl font-bold text-gray-800 text-center mb-3">
                                   Request Sent!
                              </h1>
                              <p className="text-gray-600 text-center mb-6 text-lg">
                                   Your booking request has been sent successfully
                              </p>

                              {/* Details Card */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                                   <div className="space-y-4">
                                        <div className="border-b pb-3">
                                             <p className="text-gray-600 text-sm font-semibold mb-1">Vehicle</p>
                                             <p className="text-gray-800 font-semibold">
                                                  {bookingData?.car?.brand} {bookingData?.car?.model}
                                             </p>
                                        </div>
                                        <div className="border-b pb-3">
                                             <p className="text-gray-600 text-sm font-semibold mb-1">Booking Purpose</p>
                                             <p className="text-gray-800 font-semibold">
                                                  {bookingData?.booking_purpose || "Not specified"}
                                             </p>
                                        </div>
                                        <div className="border-b pb-3">
                                             <p className="text-gray-600 text-sm font-semibold mb-1">Estimated Destination</p>
                                             <p className="text-gray-800 font-semibold">
                                                  {bookingData?.estimated_destination || "Not specified"}
                                             </p>
                                        </div>
                                        <div>
                                             <p className="text-gray-600 text-sm font-semibold mb-1">Status</p>
                                             <div className="flex items-center gap-2">
                                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                  <p className="text-gray-800 font-semibold">Pending Approval</p>
                                             </div>
                                        </div>
                                   </div>
                              </div>

                              {/* Message */}
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                                   <p className="text-gray-700 text-sm text-center">
                                        <span className="font-semibold">What's next?</span><br />
                                        The vehicle owner will review your request and contact you soon.
                                   </p>
                              </div>

                              {/* Buttons */}
                              <div className="flex flex-col gap-3">
                                   <Button
                                        onClick={handleViewBookings}
                                        variant="contained"
                                        fullWidth
                                        sx={{
                                             background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                             py: 1.5,
                                             fontSize: "16px",
                                             fontWeight: 700,
                                             borderRadius: "8px",
                                             textTransform: "none",
                                             "&:hover": {
                                                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                             }
                                        }}
                                   >
                                        View My Bookings
                                   </Button>
                                   <Button
                                        onClick={handleGoHome}
                                        variant="outlined"
                                        fullWidth
                                        sx={{
                                             borderColor: "#d1d5db",
                                             color: "#666",
                                             py: 1.5,
                                             fontSize: "16px",
                                             fontWeight: 600,
                                             borderRadius: "8px",
                                             textTransform: "none",
                                             "&:hover": {
                                                  borderColor: "#9ca3af",
                                                  backgroundColor: "#f9fafb"
                                             }
                                        }}
                                   >
                                        Back to Home
                                   </Button>
                              </div>

                              {/* Booking ID */}
                              <div className="mt-8 pt-6 border-t border-gray-200">
                                   <p className="text-gray-600 text-xs text-center">
                                        Booking Reference: <span className="font-mono font-semibold text-gray-800">{bookingData?._id || "REF-" + Date.now()}</span>
                                   </p>
                              </div>
                         </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 text-center">
                         <p className="text-gray-600 text-sm">
                              Questions? <a href="/" className="text-orange-600 font-semibold hover:text-orange-700">Contact Support</a>
                         </p>
                    </div>
               </div>
          </div>
     );
};

export default BookingSuccess;
