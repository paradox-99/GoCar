import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Grid, Avatar, Button, LinearProgress, Box, Chip, Divider } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ErrorIcon from '@mui/icons-material/Error';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import moment from 'moment';

const DashBoard = () => {

     const axiosPublic = useAxiosPublic();
     const { user } = useAuth();
     const navigate = useNavigate();

     const { data, isLoading } = useQuery({
          queryKey: ['user'],
          queryFn: async () => {
               const response = await axiosPublic.get(`userRoute/getUserInfo/${user.email}`,{withCredentials: true});
               return response.data[0];
          },
     })

     const { data: bookingStats } = useQuery({
          queryKey: ['bookingStats', data?._id],
          queryFn: async () => {
               const response = await axiosPublic.get(`bookingRoutes/userBookings/${data._id}`);
               return response.data;
          },
          enabled: !!data?._id,
     })

     const { data: favouriteStats } = useQuery({
          queryKey: ['favouriteStats', data?._id],
          queryFn: async () => {
               const response = await axiosPublic.get(`favouriteRoutes/userFavourites/${data._id}`);
               return response.data;
          },
          enabled: !!data?._id,
     })

     if (isLoading) return <Loader />;

     // Calculate profile completion
     const profileFields = ['name', 'email', 'phone', 'dob', 'gender', 'area', 'city'];
     const completedFields = profileFields.filter(field => data?.[field]).length;
     const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

     const StatCard = ({ icon: Icon, label, value, color }) => (
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
               <CardContent>
                    <div className="flex items-center justify-between">
                         <div>
                              <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
                              <p className="text-3xl font-bold text-gray-800">{value}</p>
                         </div>
                         <div className={`p-4 rounded-full ${color}`}>
                              <Icon sx={{ fontSize: 32, color: 'white' }} />
                         </div>
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

     return (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white pb-20">
               <div className="max-w-7xl mx-auto px-4">
                    {/* Welcome Section */}
                    <div className="pt-12 mb-12">
                         <div className="flex items-center gap-6">
                              <Avatar
                                   src={data?.photo}
                                   alt={data?.name}
                                   sx={{
                                        width: 100,
                                        height: 100,
                                        border: '4px solid #f58300',
                                   }}
                              />
                              <div>
                                   <h1 className="text-5xl font-bold text-gray-800">Welcome back, {data?.name}! 👋</h1>
                                   <p className="text-gray-600 mt-2">Here's your driving journey overview</p>
                              </div>
                         </div>
                    </div>

                    {/* Stats Overview */}
                    <Grid container spacing={4} className="mb-12">
                         <Grid item xs={12} sm={6} md={3}>
                              <StatCard
                                   icon={DirectionsCarIcon}
                                   label="Total Bookings"
                                   value={bookingStats?.length || 0}
                                   color="bg-blue-500"
                              />
                         </Grid>
                         <Grid item xs={12} sm={6} md={3}>
                              <StatCard
                                   icon={FavoriteIcon}
                                   label="Favourite Cars"
                                   value={favouriteStats?.length || 0}
                                   color="bg-red-500"
                              />
                         </Grid>
                         <Grid item xs={12} sm={6} md={3}>
                              <StatCard
                                   icon={VerifiedUserIcon}
                                   label="Account Status"
                                   value={data?.accountstatus === 'active' ? '✓ Active' : 'Pending'}
                                   color={data?.accountstatus === 'active' ? 'bg-green-500' : 'bg-yellow-500'}
                              />
                         </Grid>
                         <Grid item xs={12} sm={6} md={3}>
                              <StatCard
                                   icon={BookmarkIcon}
                                   label="Profile Score"
                                   value={`${profileCompletion}%`}
                                   color="bg-purple-500"
                              />
                         </Grid>
                    </Grid>

                    {/* Main Content Grid */}
                    <Grid container spacing={4}>
                         {/* Personal Information Card */}
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
                                                       '&:hover': {
                                                            background: '#fff5f0',
                                                       }
                                                  }}
                                             >
                                                  Edit
                                             </Button>
                                        </div>
                                        <Divider className="mb-4" />
                                        <InfoRow label="Email" value={data?.email} />
                                        <InfoRow label="Phone" value={data?.phone} />
                                        <InfoRow label="Gender" value={data?.gender || 'N/A'} />
                                        <InfoRow label="Date of Birth" value={data?.dob ? moment(data?.dob).format('DD MMM YYYY') : 'N/A'} />
                                        <InfoRow label="City" value={data?.city || 'N/A'} />
                                   </CardContent>
                              </Card>
                         </Grid>

                         {/* Account Status Card */}
                         <Grid item xs={12} md={6}>
                              <Card className="shadow-lg h-full">
                                   <CardContent>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Status</h2>
                                        <Divider className="mb-6" />
                                        
                                        <div className="space-y-6">
                                             <div>
                                                  <div className="flex items-center justify-between mb-3">
                                                       <span className="font-semibold text-gray-700">Profile Completion</span>
                                                       <span className="text-lg font-bold text-orange-600">{profileCompletion}%</span>
                                                  </div>
                                                  <LinearProgress
                                                       variant="determinate"
                                                       value={profileCompletion}
                                                       sx={{
                                                            height: 10,
                                                            borderRadius: 5,
                                                            backgroundColor: '#f0f0f0',
                                                            '& .MuiLinearProgress-bar': {
                                                                 backgroundColor: '#f58300',
                                                            },
                                                       }}
                                                  />
                                             </div>

                                             <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                                  <p className="text-blue-900 text-sm">
                                                       <strong>Total Bookings:</strong> You have made {bookingStats?.length || 0} bookings
                                                  </p>
                                             </div>

                                             <div>
                                                  <p className="font-semibold text-gray-700 mb-3">Verification Status</p>
                                                  <div className="space-y-2">
                                                       <div className="flex items-center gap-3">
                                                            {data?.verified ? (
                                                                 <VerifiedUserIcon sx={{ color: '#10b981', fontSize: 20 }} />
                                                            ) : (
                                                                 <ErrorIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                                                            )}
                                                            <span className="text-gray-700">
                                                                 Account {data?.verified ? 'Verified' : 'Not Verified'}
                                                            </span>
                                                       </div>
                                                       <div className="flex items-center gap-3">
                                                            {data?.accountstatus === 'active' ? (
                                                                 <VerifiedUserIcon sx={{ color: '#10b981', fontSize: 20 }} />
                                                            ) : (
                                                                 <ErrorIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                                                            )}
                                                            <span className="text-gray-700">
                                                                 Account is {data?.accountstatus === 'active' ? 'Active' : 'Inactive'}
                                                            </span>
                                                       </div>
                                                  </div>
                                             </div>

                                             <div className="flex gap-3 flex-wrap">
                                                  {data?.verified && (
                                                       <Chip
                                                            label="Verified"
                                                            color="success"
                                                            variant="outlined"
                                                       />
                                                  )}
                                                  {data?.accountstatus === 'active' && (
                                                       <Chip
                                                            label="Active"
                                                            color="primary"
                                                            variant="outlined"
                                                            sx={{ color: '#f58300', borderColor: '#f58300' }}
                                                       />
                                                  )}
                                             </div>
                                        </div>
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
                                             <Grid item xs={12} sm={6} md={3}>
                                                  <Button
                                                       fullWidth
                                                       variant="contained"
                                                       sx={{
                                                            background: '#f58300',
                                                            py: 2,
                                                            fontSize: '1rem',
                                                            fontWeight: 600,
                                                            '&:hover': {
                                                                 background: '#e07100',
                                                            }
                                                       }}
                                                       onClick={() => navigate('/search')}
                                                  >
                                                       Book a Car
                                                  </Button>
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={3}>
                                                  <Button
                                                       fullWidth
                                                       variant="outlined"
                                                       sx={{
                                                            color: '#f58300',
                                                            borderColor: '#f58300',
                                                            py: 2,
                                                            fontSize: '1rem',
                                                            fontWeight: 600,
                                                            '&:hover': {
                                                                 background: '#fff5f0',
                                                                 borderColor: '#f58300',
                                                            }
                                                       }}
                                                       onClick={() => navigate('/dashboard/mybookings')}
                                                  >
                                                       My Bookings
                                                  </Button>
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={3}>
                                                  <Button
                                                       fullWidth
                                                       variant="outlined"
                                                       sx={{
                                                            color: '#f58300',
                                                            borderColor: '#f58300',
                                                            py: 2,
                                                            fontSize: '1rem',
                                                            fontWeight: 600,
                                                            '&:hover': {
                                                                 background: '#fff5f0',
                                                                 borderColor: '#f58300',
                                                            }
                                                       }}
                                                       onClick={() => navigate('/dashboard/favourite')}
                                                  >
                                                       Favourites
                                                  </Button>
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={3}>
                                                  <Button
                                                       fullWidth
                                                       variant="outlined"
                                                       sx={{
                                                            color: '#f58300',
                                                            borderColor: '#f58300',
                                                            py: 2,
                                                            fontSize: '1rem',
                                                            fontWeight: 600,
                                                            '&:hover': {
                                                                 background: '#fff5f0',
                                                                 borderColor: '#f58300',
                                                            }
                                                       }}
                                                       onClick={() => navigate('/dashboard/myprofile')}
                                                  >
                                                       My Profile
                                                  </Button>
                                             </Grid>
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