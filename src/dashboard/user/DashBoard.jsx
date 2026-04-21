import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Grid, Avatar, Button, Chip, Divider, Skeleton, Alert } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EditIcon from '@mui/icons-material/Edit';
import CurrenyTaka from '../../assets/icons/taka.png'; 
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate, Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import moment from 'moment';
import { useState } from 'react';

// ---------- helpers ----------

const STATUS_COLOR = {
  Completed: { bg: 'bg-green-100', text: 'text-green-700', chip: 'success' },
  Requested: { bg: 'bg-orange-100', text: 'text-orange-700', chip: 'warning' },
  Confirmed: { bg: 'bg-orange-100', text: 'text-orange-700', chip: 'warning' },
  Running:   { bg: 'bg-blue-100',   text: 'text-blue-700',   chip: 'info'    },
  Cancelled: { bg: 'bg-red-100',    text: 'text-red-700',    chip: 'error'   },
  Overdue:   { bg: 'bg-red-100',    text: 'text-red-700',    chip: 'error'   },
};

const getStatusChip = (status) => {
  const c = STATUS_COLOR[status] || { chip: 'default' };
  return <Chip label={status} color={c.chip} size="small" />;
};

// ---------- sub-components ----------

const StatCard = ({ icon: Icon, label, value, color, badge }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
    <CardContent>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-gray-600 text-sm font-medium">{label}</p>
            {badge}
          </div>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${color} flex-shrink-0`}>
          {typeof Icon === 'string' ? (
            <img src={Icon} alt="icon" style={{ width: 32, height: 32, filter: 'brightness(0) invert(1)' }} />
          ) : (
            <Icon sx={{ fontSize: 32, color: 'white' }} />
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatCardSkeleton = () => (
  <Card className="shadow-lg h-full">
    <CardContent>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton variant="text" width={100} height={20} className="mb-2" />
          <Skeleton variant="text" width={60} height={44} />
        </div>
        <Skeleton variant="circular" width={64} height={64} />
      </div>
    </CardContent>
  </Card>
);

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between py-3 border-b last:border-b-0">
    <div className="flex items-center gap-3">
      {Icon && <Icon sx={{ color: '#f58300', fontSize: 20 }} />}
      <span className="text-gray-600 font-medium">{label}</span>
    </div>
    <span className="text-gray-800 font-semibold">{value}</span>
  </div>
);

// ---------- booking cards ----------

const UpcomingBookingCard = ({ booking, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg h-full">
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <CalendarMonthIcon sx={{ color: '#f58300' }} />
            <h3 className="text-lg font-bold text-gray-800">Upcoming Booking</h3>
          </div>
          <Divider className="mb-4" />
          <div className="flex gap-4">
            <Skeleton variant="rectangular" width={88} height={88} sx={{ borderRadius: 2 }} />
            <div className="flex-1">
              <Skeleton variant="text" width="60%" height={28} />
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="50%" height={20} />
              <Skeleton variant="rectangular" width={110} height={36} sx={{ borderRadius: 2, mt: 1 }} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return (
      <Card className="shadow-lg h-full">
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <CalendarMonthIcon sx={{ color: '#f58300' }} />
            <h3 className="text-lg font-bold text-gray-800">Upcoming Booking</h3>
          </div>
          <Divider className="mb-4" />
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <CalendarMonthIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
            <p className="text-sm">No upcoming bookings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg h-full">
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <CalendarMonthIcon sx={{ color: '#f58300' }} />
          <h3 className="text-lg font-bold text-gray-800">Upcoming Booking</h3>
        </div>
        <Divider className="mb-4" />
        <div className="flex gap-4">
          {booking.car_image ? (
            <img
              src={booking.car_image}
              alt={`${booking.brand} ${booking.model}`}
              className="w-22 h-22 object-cover rounded-xl flex-shrink-0"
              style={{ width: 88, height: 88 }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-xl bg-orange-50 flex-shrink-0"
              style={{ width: 88, height: 88 }}
            >
              <DirectionsCarIcon sx={{ color: '#f58300', fontSize: 40 }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-lg truncate">
              {booking.brand} {booking.model}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              📅 {moment(booking.start_ts).format('DD MMM YYYY, hh:mm A')}
            </p>
            <p className="text-sm text-gray-400">
              to {moment(booking.end_ts).format('DD MMM YYYY, hh:mm A')}
            </p>
            <div className="flex items-center gap-3 mt-2">
              {getStatusChip(booking.status)}
              <Button
                component={Link}
                to={`/dashboard/user/bookings/${booking.booking_id}`}
                size="small"
                variant="contained"
                sx={{
                  background: '#f58300',
                  fontSize: '0.75rem',
                  '&:hover': { background: '#e07100' },
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RecentBookingCard = ({ booking, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg h-full">
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <HistoryIcon sx={{ color: '#f58300' }} />
            <h3 className="text-lg font-bold text-gray-800">Recent Booking</h3>
          </div>
          <Divider className="mb-4" />
          <div className="flex gap-4">
            <Skeleton variant="rectangular" width={88} height={88} sx={{ borderRadius: 2 }} />
            <div className="flex-1">
              <Skeleton variant="text" width="60%" height={28} />
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1, mt: 1 }} />
              <Skeleton variant="rectangular" width={110} height={36} sx={{ borderRadius: 2, mt: 1 }} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return (
      <Card className="shadow-lg h-full">
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <HistoryIcon sx={{ color: '#f58300' }} />
            <h3 className="text-lg font-bold text-gray-800">Recent Booking</h3>
          </div>
          <Divider className="mb-4" />
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <HistoryIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
            <p className="text-sm">No bookings yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg h-full">
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <HistoryIcon sx={{ color: '#f58300' }} />
          <h3 className="text-lg font-bold text-gray-800">Recent Booking</h3>
        </div>
        <Divider className="mb-4" />
        <div className="flex gap-4">
          {booking.car_image ? (
            <img
              src={booking.car_image}
              alt={`${booking.brand} ${booking.model}`}
              className="object-cover rounded-xl flex-shrink-0"
              style={{ width: 88, height: 88 }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-xl bg-orange-50 flex-shrink-0"
              style={{ width: 88, height: 88 }}
            >
              <DirectionsCarIcon sx={{ color: '#f58300', fontSize: 40 }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-lg truncate">
              {booking.brand} {booking.model}
            </p>
            <p className="text-sm font-semibold text-gray-600 mt-1">
              ৳ {Number(booking.total_cost ?? 0).toLocaleString()}
            </p>
            <div className="flex items-center gap-3 mt-2">
              {getStatusChip(booking.status)}
              <Button
                component={Link}
                to={`/dashboard/user/bookings/${booking.booking_id}`}
                size="small"
                variant="outlined"
                sx={{
                  color: '#f58300',
                  borderColor: '#f58300',
                  fontSize: '0.75rem',
                  '&:hover': { background: '#fff5f0', borderColor: '#f58300' },
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ---------- main component ----------

const DashBoard = () => {
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifDismissed, setNotifDismissed] = useState(false);

  // ── User info query (unchanged) ──
  const { data, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await axiosPublic.get(`userRoute/getUserInfo/${user.email}`, { withCredentials: true });
      return response.data[0];
    },
  });

  // ── Single stats query ──
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', data?._id || data?.user_id],
    queryFn: async () => {
      const userId = data?._id || data?.user_id;
      const res = await axiosPublic.get(`userRoute/dashboard-stats/${userId}`);
      return res.data;
    },
    enabled: !!(data?._id || data?.user_id),
  });

  if (userLoading) return <Loader />;

  // Profile completion
  const profileFields = ['name', 'email', 'phone', 'dob', 'gender', 'area', 'city'];
  const completedFields = profileFields.filter(field => data?.[field]).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  const userId = data?._id || data?.user_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white pb-20">
      <div className="max-w-7xl mx-auto px-4">

        {/* ── Welcome ── */}
        <div className="pt-12 mb-12">
          <div className="flex items-center gap-6">
            <Avatar
              src={data?.photo}
              alt={data?.name}
              sx={{ width: 100, height: 100, border: '4px solid #f58300' }}
            />
            <div>
              <h1 className="text-5xl font-bold text-gray-800">Welcome back, {data?.name}! 👋</h1>
              <p className="text-gray-600 mt-2">Here&apos;s your driving journey overview</p>
            </div>
          </div>
        </div>

        {/* ── Unread notifications banner ── */}
        {!notifDismissed && stats?.unread_notifications > 0 && (
          <Alert
            severity="info"
            icon={<NotificationsActiveIcon />}
            onClose={() => setNotifDismissed(true)}
            className="mb-6"
            sx={{ alignItems: 'center' }}
          >
            You have <strong> {stats.unread_notifications} </strong> unread notification(s).{' '}
            <Link to="/dashboard/notifications" className="underline font-semibold">
              View them →
            </Link>
          </Alert>
        )}

        {/* ── Stat cards ── */}
        <Grid container spacing={4} className="mb-10">

          {/* Total Bookings */}
          <Grid item xs={12} sm={6} md={4} lg={20/6}>
            {statsLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                icon={DirectionsCarIcon}
                label="Total Bookings"
                value={stats?.total_bookings ?? 0}
                color="bg-blue-500"
                badge={
                  (stats?.active_bookings ?? 0) > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-400 text-white">
                      {stats.active_bookings} active
                    </span>
                  ) : null
                }
              />
            )}
          </Grid>

          {/* Favourite Cars */}
          <Grid item xs={12} sm={6} md={4} lg={20/6}>
            {statsLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                icon={FavoriteIcon}
                label="Favourite Cars"
                value={stats?.favourite_count ?? 0}
                color="bg-red-500"
              />
            )}
          </Grid>

          {/* Total Spent */}
          <Grid item xs={12} sm={6} md={4} lg={20/6}>
            {statsLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                icon={CurrenyTaka}
                label="Total Spent"
                value={`৳ ${Number(stats?.total_spent ?? 0).toLocaleString()}`}
                color="bg-green-500"
              />
            )}
          </Grid>



          {/* Profile Score */}
          <Grid item xs={12} sm={6} md={6} lg={20/6}>
            <StatCard
              icon={BookmarkIcon}
              label="Profile Score"
              value={`${profileCompletion}%`}
              color="bg-purple-500"
            />
          </Grid>
        </Grid>

        {/* ── Booking Overview ── */}
        <Grid container spacing={4} className="mb-8">
          <Grid item xs={12}>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Booking Overview</h2>
            <Divider />
          </Grid>
          <Grid item xs={12} md={6}>
            <UpcomingBookingCard booking={stats?.upcoming_booking} isLoading={statsLoading} />
          </Grid>
          <Grid item xs={12} md={6}>
            <RecentBookingCard booking={stats?.recent_booking} isLoading={statsLoading} />
          </Grid>
        </Grid>

        {/* ── Main content grid ── */}
        <Grid container spacing={4}>

          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card className="shadow-lg h-full">
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                  <Button
                    startIcon={<EditIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/dashboard/myprofile')}
                    sx={{
                      color: '#f58300',
                      borderColor: '#f58300',
                      '&:hover': { background: '#fff5f0' },
                    }}
                  >
                    Edit
                  </Button>
                </div>
                <Divider className="mb-4" />
                <InfoRow label="Email"       value={data?.email} />
                <InfoRow label="Phone"       value={data?.phone} />
                <InfoRow label="Gender"      value={data?.gender || 'N/A'} />
                <InfoRow label="Date of Birth" value={data?.dob ? moment(data.dob).format('DD MMM YYYY') : 'N/A'} />
                <InfoRow label="City"        value={data?.city || 'N/A'} />
              </CardContent>
            </Card>
          </Grid>



          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card className="shadow-lg">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                <Divider className="mb-6" />
                <Grid container spacing={3}>
                  {[
                    { label: 'Book a Car',  path: '/search',               variant: 'contained' },
                    { label: 'My Bookings', path: '/dashboard/mybookings', variant: 'outlined'  },
                    { label: 'Favourites',  path: '/dashboard/favourite',  variant: 'outlined'  },
                    { label: 'My Profile',  path: '/dashboard/myprofile',  variant: 'outlined'  },
                  ].map(({ label, path, variant }) => (
                    <Grid item xs={12} sm={6} md={3} key={label}>
                      <Button
                        fullWidth
                        variant={variant}
                        sx={{
                          background: variant === 'contained' ? '#f58300' : 'transparent',
                          color: variant === 'contained' ? 'white' : '#f58300',
                          borderColor: '#f58300',
                          py: 2,
                          fontSize: '1rem',
                          fontWeight: 600,
                          '&:hover': {
                            background: variant === 'contained' ? '#e07100' : '#fff5f0',
                            borderColor: '#f58300',
                          },
                        }}
                        onClick={() => navigate(path)}
                      >
                        {label}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </div>
    </div>
  );
};

export default DashBoard;