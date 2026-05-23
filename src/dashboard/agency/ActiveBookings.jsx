import { Link } from 'react-router-dom';
import moment from 'moment';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';
import { Grid, Typography, Button, TextField, InputAdornment, Avatar, Chip } from '@mui/material';
import { Search, CalendarMonth, Person, DirectionsCar, ArrowForward, FilterList, LocalShipping, HourglassBottom, CheckCircle } from '@mui/icons-material';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import useAuth from '../../hooks/useAuth';

const ActiveBookings = () => {
    const axiosPublic = useAxiosPublic();
    const { user } = useAuth();
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Step 1: Get the agency profile to retrieve agency_id
    const { data: agencyProfile, isLoading: profileLoading } = useQuery({
        queryKey: ['agencyProfile', user?.email],
        queryFn: async () => {
            const response = await axiosPublic.get(`agencyRoutes/getAgencyProfile/${user?.email}`, { withCredentials: true });
            return response.data;
        },
        enabled: !!user?.email
    });

    const agencyId = agencyProfile?.agency_id;

    // Step 2: Fetch bookings by agency_id (dependent on Step 1)
    const { data, isLoading: bookingsLoading } = useQuery({
        queryKey: ['bookings', agencyId],
        queryFn: async () => {
            const response = await axiosPublic.get(`agencyRoutes/getBookingsByAgencyId/${agencyId}`, { withCredentials: true });
            return response.data;
        },
        enabled: !!agencyId
    });

    const isLoading = profileLoading || bookingsLoading;

    const statusMap = {
        'Requested': 'Requested',
        'Active': 'Running',
        'Upcoming': 'Confirmed',
        'Cancelled': 'Cancelled',
        'Overdue': 'Overdue',
    };

    const filteredBookings = useMemo(() => {
        if (!data) return [];
        
        let filtered = data;

        if (filter !== 'All') {
            const targetStatus = statusMap[filter];
            filtered = filtered.filter(booking => booking.status === targetStatus);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(booking => 
                booking.booking_id.toString().includes(query) ||
                booking.user_name.toLowerCase().includes(query) ||
                `${booking.brand} ${booking.model}`.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [data, filter, searchQuery]);

    if (isLoading) return <div className="flex justify-center items-center py-20"><Loader /></div>;

    const FilterButton = ({ label, count }) => (
        <button
            onClick={() => setFilter(label)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                filter === label 
                ? 'bg-[#F58300] text-white shadow-lg shadow-orange-200 transform scale-105' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
        >
            {label}
            {count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    filter === label ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                    {count}
                </span>
            )}
        </button>
    );

    const BookingCard = ({ booking }) => {
        const navigate = useNavigate();
        
        const getStatusStyles = (status) => {
            switch(status) {
                case 'Requested': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
                case 'Running': return 'bg-blue-50 text-blue-700 border-blue-100';
                case 'Confirmed': return 'bg-green-50 text-green-700 border-green-100';
                case 'Cancelled': return 'bg-red-50 text-red-700 border-red-100';
                default: return 'bg-gray-50 text-gray-700 border-gray-100';
            }
        };

        const displayStatus = Object.keys(statusMap).find(key => statusMap[key] === booking.status) || booking.status;

        const handleCardClick = () => {
            navigate(`/dashboard/agency/bookings/${booking.booking_id}`, { state: { booking } });
        };

        return (
            <div 
                onClick={handleCardClick}
                className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full hover:-translate-y-1"
            >
                {/* Header: Image & Status */}
                <div className="relative h-48 overflow-hidden">
                    <img 
                        src={booking.images || booking.car_image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                        alt={booking.model}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(booking.status)} backdrop-blur-sm shadow-sm`}>
                            {displayStatus}
                        </span>
                        {/* eslint-disable-next-line react/prop-types */}
                        {booking.pickup_id && !booking.pickup_confirmed && (
                            <Chip
                                icon={<HourglassBottom sx={{ fontSize: '13px !important' }} />}
                                label="Pickup Pending"
                                size="small"
                                color="warning"
                                sx={{ fontSize: '10px', height: '22px', fontWeight: 700 }}
                            />
                        )}
                        {/* eslint-disable-next-line react/prop-types */}
                        {booking.pickup_id && booking.pickup_confirmed && (
                            <Chip
                                icon={<CheckCircle sx={{ fontSize: '13px !important' }} />}
                                label="Pickup Confirmed"
                                size="small"
                                color="success"
                                sx={{ fontSize: '10px', height: '22px', fontWeight: 700 }}
                            />
                        )}
                        {/* eslint-disable-next-line react/prop-types */}
                        {booking.return_id && !booking.return_confirmed && (
                            <Chip
                                icon={<HourglassBottom sx={{ fontSize: '13px !important' }} />}
                                label="Return Pending"
                                size="small"
                                color="warning"
                                sx={{ fontSize: '10px', height: '22px', fontWeight: 700 }}
                            />
                        )}
                        {/* eslint-disable-next-line react/prop-types */}
                        {booking.return_id && booking.return_confirmed && (
                            <Chip
                                icon={<CheckCircle sx={{ fontSize: '13px !important' }} />}
                                label="Return Confirmed"
                                size="small"
                                color="success"
                                sx={{ fontSize: '10px', height: '22px', fontWeight: 700 }}
                            />
                        )}
                    </div>
                    <div className="absolute top-4 left-4">
                        <span className="bg-black/50 text-white px-3 py-1 rounded-full text-[10px] backdrop-blur-md">
                            ID: #{booking.booking_id}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <Typography variant="h6" className="font-bold text-gray-800 leading-tight">
                                {booking.brand} {booking.model}
                            </Typography>
                            <div className="flex items-center gap-1 text-gray-500 mt-1">
                                <DirectionsCar fontSize="inherit" />
                                <span className="text-xs uppercase tracking-wider font-medium">{booking.car_type || 'Vehicle'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#f3f4f6', color: '#6b7280' }}>
                                <Person fontSize="small" />
                            </Avatar>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Customer</p>
                                <p className="text-sm font-semibold text-gray-700">{booking.user_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#eff6ff', color: '#3b82f6' }}>
                                <CalendarMonth fontSize="small" />
                            </Avatar>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Pickup Date</p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {booking.start_ts ? moment(booking.start_ts).format('DD MMM, YYYY') : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 pb-5 mt-auto">
                    <Button 
                        component={Link}
                        to={`/dashboard/agency/bookings/${booking.booking_id}`}
                        state={{ booking }}
                        fullWidth
                        variant="contained"
                        endIcon={<ArrowForward />}
                        sx={{ 
                            borderRadius: '12px',
                            py: 1.2,
                            textTransform: 'none',
                            fontWeight: 600,
                            backgroundColor: '#F58300',
                            '&:hover': {
                                backgroundColor: '#d17000',
                                boxShadow: '0 8px 20px -6px rgba(245, 131, 0, 0.4)'
                            },
                            boxShadow: 'none'
                        }}
                    >
                        Manage Booking
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <header className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Typography variant="h3" className="font-extrabold text-[#1a1a1a] tracking-tight">
                            Manage Bookings
                        </Typography>
                        <p className="text-gray-500 mt-2 text-lg">
                            Track and manage all your customer reservations in one place.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <TextField
                            placeholder="Search by ID or Name..."
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ 
                                width: { xs: '100%', sm: 300 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    backgroundColor: 'white',
                                    '& fieldset': { borderColor: '#e5e7eb' },
                                    '&:hover fieldset': { borderColor: '#F58300' },
                                    '&.Mui-focused fieldset': { borderColor: '#F58300' },
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: '#9ca3af' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </div>
                </header>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-gray-400 mr-2">
                        <FilterList fontSize="small" />
                        <span className="text-xs font-bold uppercase tracking-widest">Filter by</span>
                    </div>
                    <FilterButton label="All" count={data?.length} />
                    <FilterButton label="Requested" count={data?.filter(b => b.status === statusMap['Requested']).length} />
                    <FilterButton label="Active" count={data?.filter(b => b.status === statusMap['Active']).length} />
                    <FilterButton label="Upcoming" count={data?.filter(b => b.status === statusMap['Upcoming']).length} />
                    <FilterButton label="Cancelled" count={data?.filter(b => b.status === statusMap['Cancelled']).length} />
                    <FilterButton label="Overdue" count={data?.filter(b => b.status === statusMap['Overdue']).length} />
                </div>

                {/* Grid Content */}
                {filteredBookings.length > 0 ? (
                    <Grid container spacing={4}>
                        {filteredBookings.map((booking) => (
                            <Grid item xs={12} sm={6} lg={4} xl={3} key={booking.booking_id}>
                                <BookingCard booking={booking} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FilterList sx={{ fontSize: 40, color: '#d1d5db' }} />
                        </div>
                        <Typography variant="h5" color="textPrimary" fontWeight="bold">
                            No Bookings Found
                        </Typography>
                        <p className="text-gray-400 mt-2">
                            We couldn't find any bookings matching your current filter.
                        </p>
                        <Button 
                            onClick={() => {setFilter('All'); setSearchQuery('');}} 
                            variant="text" 
                            sx={{ mt: 2, color: '#F58300', fontWeight: 'bold' }}
                        >
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveBookings;