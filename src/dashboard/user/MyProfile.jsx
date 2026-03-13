import { Button, TextField, Card, CardContent,  Avatar, Grid, Alert, CircularProgress } from "@mui/material";
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
import PhoneOTPVerification from './PhoneOTPVerification';
import AddressEditModal from './AddressEditModal';

const MyProfile = () => {

     const { user } = useAuth();
     const axiosPublic = useAxiosPublic();
     const [isEditing, setIsEditing] = useState(false);
     const [editedData, setEditedData] = useState({});
     const [showOTPVerification, setShowOTPVerification] = useState(false);
     const [newPhoneNumber, setNewPhoneNumber] = useState(null);
     const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
     const [isLoadingSave, setIsLoadingSave] = useState(false);

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

     const handlePhotoChange = async (e) => {
          const file = e.target.files[0];
          if (file) {
               try {
                    const formData = new FormData();
                    formData.append('image', file);

                    const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY;
                    if (!imgbbApiKey) {
                         toast.error('Image upload not configured. Please contact admin.');
                         return;
                    }

                    // Upload to imgbb
                    const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
                         method: 'POST',
                         body: formData
                    });
                    const imageData = await response.json();
                    if (imageData.success) {
                         handleChange('photo', imageData.data.url);
                         toast.success('Photo updated!');
                    } else {
                         toast.error(imageData.error?.message || 'Failed to upload photo');
                    }
               } catch (error) {
                    console.error('Error uploading photo:', error);
                    toast.error('Failed to upload photo');
               }
          }
     };

     const handleSave = async () => {
          if (!editedData.name || editedData.name.trim() === '') {
               toast.error('Name cannot be empty');
               return;
          }

          // Check if phone number changed
          const phoneChanged = editedData.phone !== data.phone;

          if (phoneChanged && newPhoneNumber === null) {
               setNewPhoneNumber(editedData.phone);
               setIsLoadingSave(true);
               try {
                    // Save all other changes first
                    await axiosPublic.put(`userRoute/updateUserInfo/${data._id}`, {
                         name: editedData.name,
                         photo: editedData.photo,
                         gender: editedData.gender,
                         license_number: editedData.license_number,
                         expire_date: editedData.expire_date,
                         experience: editedData.experience,
                         // Phone should NOT be saved yet, will be saved after OTP verification
                    });
                    toast.success('Profile updated! Now please verify your new phone number.');
                    setIsLoadingSave(false);
                    setShowOTPVerification(true);
               } catch (error) {
                    toast.error('Failed to update profile');
                    console.error(error);
                    setIsLoadingSave(false);
               }
               return;
          }

          // If no phone change, save normally
          if (!phoneChanged) {
               setIsLoadingSave(true);
               try {
                    await axiosPublic.put(`userRoute/updateUserInfo/${data._id}`, {
                         name: editedData.name,
                         photo: editedData.photo,
                         gender: editedData.gender,
                         phone: editedData.phone,
                         license_number: editedData.license_number,
                         expire_date: editedData.expire_date,
                         experience: editedData.experience,
                    });
                    toast.success('Profile updated successfully!');
                    setIsEditing(false);
                    setIsLoadingSave(false);
                    refetch();
               } catch (error) {
                    toast.error('Failed to update profile');
                    console.error(error);
                    setIsLoadingSave(false);
               }
          }
     };

     const handleOTPVerified = async (verifiedPhone) => {
          try {
               // Update phone number after OTP verification
               await axiosPublic.put(`userRoute/updateUserInfo/${data._id}`, {
                    name: editedData.name,
                    photo: editedData.photo,
                    gender: editedData.gender,
                    phone: verifiedPhone,
                    license_number: editedData.license_number,
                    expire_date: editedData.expire_date,
                    experience: editedData.experience,
               });
               toast.success('Phone number updated and verified!');
               setIsEditing(false);
               setShowOTPVerification(false);
               setNewPhoneNumber(null);
               setEditedData({});
               refetch();
          } catch (error) {
               toast.error('Failed to update phone number');
               console.error(error);
          }
     };

     const handleAddressUpdated = () => {
          refetch();
     };

     // Fields that cannot be edited
     const readOnlyFields = ['email', 'dob', 'verified', 'user_id', 'userrole', 'accountstatus', 'license_status'];

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
                                        You can edit your name, phone, gender, license number, experience, and license expiry date. Email, DOB are non-editable. Address can be edited separately. If you change your phone number, you&apos;ll need to verify it with an OTP.
                                   </Alert>
                              )}

                              {/* Profile Photo Section */}
                              <Card className="mb-8 shadow-lg">
                                   <CardContent className="flex flex-col items-center py-12">
                                        <div className="relative">
                                             <Avatar
                                                  src={isEditing ? editedData.photo : data?.photo}
                                                  alt={data?.name}
                                                  sx={{
                                                       width: 150,
                                                       height: 150,
                                                       mb: 3,
                                                       border: '4px solid #f58300',
                                                  }}
                                             />
                                             {isEditing && (
                                                  <label className="absolute bottom-3 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 cursor-pointer transition">
                                                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                                                       </svg>
                                                       <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handlePhotoChange}
                                                            className="hidden"
                                                       />
                                                  </label>
                                             )}
                                        </div>
                                        <ProfileField label="Name" field="name" value={isEditing ? editedData.name : data?.name} />
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
                                                  <ProfileField label="Phone" field="phone" value={editedData.phone || data?.phone} />
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <ProfileField label="Gender" field="gender" value={editedData.gender || data?.gender} />
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


                              {/* License Information Section */}
                              <Card className="mb-8 shadow-lg">
                                   <CardContent>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-orange-300">
                                             License Information
                                        </h3>
                                        <Grid container spacing={3}>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <ProfileField label="License Number" field="license_number" value={editedData.license_number || data?.license_number} />
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <ProfileField label="License Status" field="license_status" value={data?.license_status} />
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <DateFieldComponent label="Expiry Date" field="expire_date" value={editedData.expire_date || data?.expire_date} />
                                             </Grid>
                                             <Grid item xs={12} sm={6} md={4}>
                                                  <ProfileField label="Experience (Years)" field="experience" value={editedData.experience || data?.experience} />
                                             </Grid>
                                        </Grid>
                                   </CardContent>
                              </Card>

                              {/* Address Section */}
                              <Card className="mb-8 shadow-lg">
                                   <CardContent>
                                        <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-orange-300">
                                             <h3 className="text-2xl font-bold text-gray-800">Address Information</h3>
                                             {!isEditing && (
                                                  <Button
                                                       variant="outlined"
                                                       startIcon={<EditIcon />}
                                                       onClick={() => setIsAddressModalOpen(true)}
                                                       sx={{
                                                            color: '#f58300',
                                                            borderColor: '#f58300',
                                                            '&:hover': {
                                                                 background: '#fff5e6',
                                                            },
                                                       }}
                                                  >
                                                       Edit Address
                                                  </Button>
                                             )}
                                        </div>
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

                              {/* Action Buttons */}
                              {isEditing && (
                                   <Card className="shadow-lg">
                                        <CardContent className="flex justify-center gap-4 py-6 flex-wrap">
                                             <Button
                                                  variant="contained"
                                                  startIcon={isLoadingSave ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                                  onClick={handleSave}
                                                  disabled={isLoadingSave}
                                                  sx={{
                                                       background: '#10b981',
                                                       '&:hover': {
                                                            background: '#059669',
                                                       },
                                                  }}
                                             >
                                                  {isLoadingSave ? 'Saving...' : 'Save Changes'}
                                             </Button>
                                             <Button
                                                  variant="outlined"
                                                  startIcon={<CancelIcon />}
                                                  onClick={handleCancel}
                                                  disabled={isLoadingSave}
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

                              {/* Address Edit Modal */}
                              <AddressEditModal
                                   open={isAddressModalOpen}
                                   onClose={() => setIsAddressModalOpen(false)}
                                   addressData={data}
                                   userId={data?._id}
                                   onAddressUpdated={handleAddressUpdated}
                              />

                              {/* Phone OTP Verification Modal */}
                              {showOTPVerification && (
                                   <PhoneOTPVerification
                                        phoneNumber={newPhoneNumber}
                                        userId={data?._id}
                                        onVerified={handleOTPVerified}
                                        onCancel={() => {
                                             setShowOTPVerification(false);
                                             setNewPhoneNumber(null);
                                        }}
                                   />
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