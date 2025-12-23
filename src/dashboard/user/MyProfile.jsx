import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Card, CardContent, Divider, Avatar, Grid, Alert } from "@mui/material";
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/Loader";
import toast from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import moment from 'moment';
import { DateField } from '@mui/x-date-pickers/DateField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

const MyProfile = () => {

     const { user } = useAuth();
     const axiosPublic = useAxiosPublic();
     const [isEditing, setIsEditing] = useState(false);
     const [editedData, setEditedData] = useState({});
     const [openDialog, setOpenDialog] = useState(false);

     const { data, refetch } = useQuery({
          queryKey: ['user'],
          queryFn: async () => {
               const response = await axiosPublic.get(`userRoute/getUserInfo/${user.email}`);
               return response.data[0];
          },
     })

     const handleEditClick = () => {
          setEditedData({...data});
          setIsEditing(true);
     };

     const handleCancel = () => {
          setIsEditing(false);
          setEditedData({});
     };

     const handleChange = (field, value) => {
          setEditedData(prev => ({
               ...prev,
               [field]: value
          }));
     };

     const handleSave = async () => {
          try {
               await axiosPublic.put(`userRoute/updateUserInfo/${data._id}`, editedData);
               toast.success('Profile updated successfully!');
               setIsEditing(false);
               refetch();
          } catch (error) {
               toast.error('Failed to update profile');
               console.error(error);
          }
     };

     // Fields that cannot be edited
     const readOnlyFields = ['phone', 'email', 'license_number', 'verified', 'user_id', 'userrole', 'accountstatus', 'license_status'];

     // Helper function to format field labels
     const formatLabel = (field) => {
          return field
               .replace(/_/g, ' ')
               .split(' ')
               .map(word => word.charAt(0).toUpperCase() + word.slice(1))
               .join(' ');
     };
     

     const ProfileField = ({ label, field, value }) => (
          <div className="flex flex-col mb-4">
               <label className="text-sm font-semibold text-gray-600 mb-2">{label}</label>
               {isEditing && !readOnlyFields.includes(field) ? (
                    <TextField
                         size="small"
                         variant="outlined"
                         value={editedData[field] || ''}
                         onChange={(e) => handleChange(field, e.target.value)}
                         fullWidth
                         sx={{
                              '& .MuiOutlinedInput-root': {
                                   borderRadius: '8px',
                                   '&:hover fieldset': {
                                        borderColor: '#f58300',
                                   },
                                   '&.Mui-focused fieldset': {
                                        borderColor: '#f58300',
                                   },
                              },
                         }}
                    />
               ) : (
                    <div className="bg-gray-100 px-4 py-2 rounded-lg text-gray-800 border border-gray-300">
                         {value || 'N/A'}
                    </div>
               )}
          </div>
     );

     const DateFieldComponent = ({ label, field, value }) => (
          <div className="flex flex-col mb-4">
               <label className="text-sm font-semibold text-gray-600 mb-2">{label}</label>
               {isEditing && !readOnlyFields.includes(field) ? (
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                         <DateField
                              size="small"
                              value={editedData[field] ? moment(editedData[field]) : null}
                              onChange={(newValue) => handleChange(field, newValue ? newValue.format('YYYY-MM-DD') : '')}
                              format="YYYY-MM-DD"
                              slotProps={{
                                   textField: {
                                        fullWidth: true,
                                        sx: {
                                             '& .MuiOutlinedInput-root': {
                                                  borderRadius: '8px',
                                                  '&:hover fieldset': {
                                                       borderColor: '#f58300',
                                                  },
                                                  '&.Mui-focused fieldset': {
                                                       borderColor: '#f58300',
                                                  },
                                             },
                                        },
                                   },
                              }}
                         />
                    </LocalizationProvider>
               ) : (
                    <div className="bg-gray-100 px-4 py-2 rounded-lg text-gray-800 border border-gray-300">
                         {value ? moment(value).format('YYYY-MM-DD') : 'N/A'}
                    </div>
               )}
          </div>
     );

     return (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white pb-20">
               <div className="max-w-6xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center pt-12 mb-12">
                         <h1 className="text-5xl font-bold text-gray-800 mb-2">My Profile</h1>
                         <p className="text-gray-600">Manage your personal information</p>
                    </div>

                    {data ? (
                         <>
                              {isEditing && (
                                   <Alert severity="info" className="mb-6">
                                        You can edit your information below. Note: Phone, Email, and License Number cannot be modified.
                                   </Alert>
                              )}

                              {/* Profile Photo Section */}
                              <Card className="mb-8 shadow-lg">
                                   <CardContent className="flex flex-col items-center py-12">
                                        <Avatar
                                             src={data?.photo}
                                             alt={data?.name}
                                             sx={{
                                                  width: 150,
                                                  height: 150,
                                                  mb: 3,
                                                  border: '4px solid #f58300',
                                             }}
                                        />
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{data?.name}</h2>
                                        <p className="text-gray-600 mb-6">{data?.userrole}</p>
                                        {!isEditing && (
                                             <Button
                                                  variant="contained"
                                                  startIcon={<EditIcon />}
                                                  onClick={handleEditClick}
                                                  sx={{
                                                       background: '#f58300',
                                                       '&:hover': {
                                                            background: '#e07100',
                                                       },
                                                       px: 4,
                                                  }}
                                             >
                                                  Edit Profile
                                             </Button>
                                        )}
                                   </CardContent>
                              </Card>

                              {/* Personal Information Section */}
                              <Card className="mb-8 shadow-lg">
                                   <CardContent>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-orange-300">
                                             Personal Information
                                        </h3>
                                        <Grid container spacing={3}>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <ProfileField label="Email" field="email" value={data?.email} />
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <ProfileField label="Phone" field="phone" value={data?.phone} />
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <ProfileField label="Gender" field="gender" value={data?.gender} />
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <DateFieldComponent label="Date of Birth" field="dob" value={data?.dob} />
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <ProfileField label="Account Status" field="accountstatus" value={data?.accountstatus} />
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <ProfileField label="Verified" field="verified" value={data?.verified ? 'Yes' : 'No'} />
                                             </Grid>
                                        </Grid>
                                   </CardContent>
                              </Card>

                              {/* Address Section */}
                              <Card className="mb-8 shadow-lg">
                                   <CardContent>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-orange-300">
                                             Address Information
                                        </h3>
                                        <Grid container spacing={3}>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <ProfileField label="City" field="city" value={data?.city} />
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <ProfileField label="Area" field="area" value={data?.area} />
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <ProfileField label="Postcode" field="postcode" value={data?.postcode} />
                                             </Grid>
                                             <Grid item xs={12}>
                                                  <ProfileField label="Details Address" field="display_address" value={data?.display_name} />
                                             </Grid>
                                        </Grid>
                                   </CardContent>
                              </Card>

                              {/* License Information Section */}
                              <Card className="mb-8 shadow-lg">
                                   <CardContent>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-orange-300">
                                             License Information
                                        </h3>
                                        <Grid container spacing={3}>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <ProfileField label="License Number" field="license_number" value={data?.license_number} />
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <ProfileField label="License Status" field="license_status" value={data?.license_status} />
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <DateFieldComponent label="Expiry Date" field="expire_date" value={data?.expire_date} />
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <ProfileField label="Experience (Years)" field="experience" value={data?.experience} />
                                             </Grid>
                                        </Grid>
                                   </CardContent>
                              </Card>

                              {/* Action Buttons */}
                              {isEditing && (
                                   <Card className="shadow-lg">
                                        <CardContent className="flex justify-center gap-4 py-6">
                                             <Button
                                                  variant="contained"
                                                  startIcon={<SaveIcon />}
                                                  onClick={handleSave}
                                                  sx={{
                                                       background: '#10b981',
                                                       '&:hover': {
                                                            background: '#059669',
                                                       },
                                                  }}
                                             >
                                                  Save Changes
                                             </Button>
                                             <Button
                                                  variant="outlined"
                                                  startIcon={<CancelIcon />}
                                                  onClick={handleCancel}
                                                  sx={{
                                                       color: '#ef4444',
                                                       borderColor: '#ef4444',
                                                       '&:hover': {
                                                            background: '#fee2e2',
                                                       },
                                                  }}
                                             >
                                                  Cancel
                                             </Button>
                                        </CardContent>
                                   </Card>
                              )}
                         </>
                    ) : (
                         <Loader />
                    )}
               </div>
          </div>
     );
};

export default MyProfile;