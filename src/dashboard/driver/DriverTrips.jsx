import useRole from '../../hooks/useRole';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Loader from "../../components/Loader";
import moment from 'moment';
import BookingCard from '../user/BookingCard'; // Reusing BookingCard if appropriate, or could split it

const DriverTrips = () => {
     const role = useRole();
     const axiosPublic = useAxiosPublic();
     const [activeTab, setActiveTab] = useState('Confirmed'); // Drivers mostly care about Confirmed/Running

     const { data: bookings, isLoading } = useQuery({
          queryKey: ['driverBookings', role?.id || role?.driver_id],
          enabled: !!(role?.id || role?.driver_id),
          queryFn: async () => {
               const id = role?.id || role?.driver_id;
               const response = await axiosPublic.get(`bookingRoutes/getDriverBookings/${id}`);
               return response.data;
          },
     });

     // Filter bookings by status
     const getFilteredBookings = () => {
          if (!bookings) return [];
          
          const now = moment();
          
          return bookings.filter(booking => {
               const startDate = moment(booking.start_ts);
               const endDate = moment(booking.end_ts);
               
               if (activeTab === 'Upcoming') {
                    return startDate.isAfter(now) && (booking.status === 'Confirmed');
               } else if (activeTab === 'Current') {
                    return now.isBetween(startDate, endDate) && (booking.status === 'Running');
               } else if (activeTab === 'Past') {
                    return endDate.isBefore(now) || (booking.status === 'Completed') || (booking.status === 'Cancelled');
               }
               return booking.status === activeTab;
          });
     };

     const filteredBookings = getFilteredBookings();
     const tabs = ['Confirmed', 'Upcoming', 'Current', 'Past'];
     const tabColors = {
          'Confirmed': '#2563eb',
          'Upcoming': '#3b82f6',
          'Current': '#22c55e',
          'Past': '#8b5cf6'
     };

     return (
          <div className="bg-white min-h-screen">
               {/* Header */}
               <div className="bg-primary text-white py-8 px-6">
                    <h1 className="text-4xl font-bold">My Trips</h1>
                    <p className="text-blue-100 mt-2">Manage your assigned driving trips and schedules</p>
               </div>

               <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-2 mb-8">
                         {tabs.map((tab) => (
                              <button
                                   key={tab}
                                   onClick={() => setActiveTab(tab)}
                                   className={`px-6 py-2 rounded font-semibold transition-all ${
                                        activeTab === tab
                                             ? 'text-white'
                                             : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                   }`}
                                   style={{
                                        backgroundColor: activeTab === tab ? tabColors[tab] : undefined
                                   }}
                              >
                                   {tab}
                              </button>
                         ))}
                    </div>

                    {/* Bookings Grid */}
                    {isLoading ? (
                         <div className="flex justify-center items-center py-20">
                              <Loader />
                         </div>
                    ) : filteredBookings.length === 0 ? (
                         <div className="text-center py-16">
                              <p className="text-gray-500 text-lg">No {activeTab.toLowerCase()} trips found.</p>
                         </div>
                    ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {filteredBookings.map((booking) => (
                                   <BookingCard key={booking.booking_id} booking={booking} />
                              ))}
                         </div>
                    )}
               </div>
          </div>
     );
};

export default DriverTrips;
