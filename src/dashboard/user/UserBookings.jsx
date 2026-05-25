import useRole from '../../hooks/useRole';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Loader from "../../components/Loader";
import moment from 'moment';
import BookingCard from './BookingCard';
import { FaCar } from 'react-icons/fa';
import { BsCalendarCheck, BsClockHistory } from 'react-icons/bs';
import { MdOutlineBookmarkAdded } from 'react-icons/md';

const TAB_CONFIG = [
  { label: 'All',       color: 'from-gray-600 to-gray-500',   textActive: 'text-gray-600',  icon: '🗂️' },
  { label: 'Requested', color: 'from-amber-500 to-yellow-400', textActive: 'text-amber-600', icon: '📋' },
  { label: 'Upcoming',  color: 'from-blue-500 to-blue-400',   textActive: 'text-blue-600',  icon: '📅' },
  { label: 'Current',   color: 'from-green-500 to-emerald-400', textActive: 'text-green-600', icon: '🚗' },
  { label: 'Past',      color: 'from-purple-500 to-violet-400', textActive: 'text-purple-600', icon: '✅' },
  { label: 'Overdue',   color: 'from-red-500 to-rose-400',    textActive: 'text-red-600',   icon: '⚠️' },
];

const UserBookings = () => {
  const role = useRole();
  const axiosPublic = useAxiosPublic();
  const [activeTab, setActiveTab] = useState('All');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['userBookings'],
    queryFn: async () => {
      const response = await axiosPublic.get(`bookingRoutes/getUserBookings/${role.user_id}`);
      return response.data;
    },
  });

  const getFilteredBookings = (tab) => {
    if (!bookings) return [];
    const now = moment();
    return bookings.filter(booking => {
      const startDate = moment(booking.start_ts);
      const endDate = moment(booking.end_ts);
      const isOverdue = (booking.status === 'Requested' || booking.status === 'Confirmed') && startDate.isBefore(now);
      if (tab === 'All')       return true;
      if (tab === 'Requested') return booking.status === 'Requested' && !isOverdue;
      if (tab === 'Upcoming')  return startDate.isAfter(now) && booking.status === 'Confirmed';
      if (tab === 'Current')   return booking.status === 'Running';
      if (tab === 'Past')      return endDate.isBefore(now) || booking.status === 'Completed' || booking.status === 'Cancelled';
      if (tab === 'Overdue')   return booking.status === 'Overdue' || isOverdue;
      return false;
    });
  };

  const totalBookings = bookings?.length ?? 0;
  const filteredBookings = getFilteredBookings(activeTab);
  const tabCounts = Object.fromEntries(TAB_CONFIG.map(t => [t.label, getFilteredBookings(t.label).length]));
  tabCounts['All'] = totalBookings;

  const activeConfig = TAB_CONFIG.find(t => t.label === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-4 mb-1">
            <div className="bg-white/20 p-3 rounded-xl">
              <FaCar className="text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
              <p className="text-blue-100 text-sm mt-0.5">Manage and track all your vehicle rentals</p>
            </div>
          </div>

          {/* Stats Row */}
          {!isLoading && (
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-2.5">
                <MdOutlineBookmarkAdded className="text-xl text-blue-100" />
                <div>
                  <p className="text-xs text-blue-100">Total Bookings</p>
                  <p className="text-lg font-bold">{totalBookings}</p>
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-2.5">
                <BsCalendarCheck className="text-xl text-blue-100" />
                <div>
                  <p className="text-xs text-blue-100">Upcoming</p>
                  <p className="text-lg font-bold">{tabCounts['Upcoming']}</p>
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-2.5">
                <BsClockHistory className="text-xl text-blue-100" />
                <div>
                  <p className="text-xs text-blue-100">Overdue</p>
                  <p className="text-lg font-bold">{tabCounts['Overdue']}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          {TAB_CONFIG.map(({ label, color, textActive, icon }) => {
            const isActive = activeTab === label;
            return (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                  ${isActive
                    ? `bg-gradient-to-r ${color} text-white shadow-md scale-105`
                    : `text-gray-500 hover:bg-gray-50 hover:${textActive}`
                  }
                `}
              >
                <span>{icon}</span>
                <span>{label}</span>
                {tabCounts[label] > 0 && (
                  <span className={`
                    ml-1 min-w-5 h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center
                    ${isActive ? 'bg-white/30 text-white' : `bg-gray-100 text-gray-600`}
                  `}>
                    {tabCounts[label]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section Heading */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${activeConfig.color}`} />
          <h2 className="text-lg font-semibold text-gray-700">
            {activeTab} Bookings
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'})
            </span>
          </h2>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-28 gap-4">
            <Loader />
            <p className="text-gray-400 text-sm animate-pulse">Loading your bookings…</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-5">
              <FaCar className="text-5xl text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-500 mb-1">No {activeTab.toLowerCase()} bookings</h3>
            <p className="text-gray-400 text-sm max-w-xs">
              You don&apos;t have any {activeTab.toLowerCase()} bookings right now. New bookings will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookings;
