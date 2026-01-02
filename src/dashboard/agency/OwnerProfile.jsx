import { useState } from "react";
import { Button, TextField, Card, CardContent } from "@mui/material";
import { useQuery } from '@tanstack/react-query'
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAuth from "../../hooks/useAuth";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const OwnerProfile = () => {
     const { user } = useAuth();
     const axiosPublic = useAxiosPublic();
     const [editingOwner, setEditingOwner] = useState(false);
     const [editingAgency, setEditingAgency] = useState(false);
     const [ownerData, setOwnerData] = useState(null);
     const [agencyData, setAgencyData] = useState(null);

     const { data } = useQuery({
          queryKey: ['user'],
          queryFn: async () => {
               const response = await axiosPublic.get(`userRoute/getUserInfo/${user.email}`, {withCredentials: true});
               return response.data;
          },
     })

     // Initialize form data when data is fetched
     if (data && !ownerData) {
          setOwnerData({
               name: data?.name || '',
               phone: data?.phone || '',
               gender: data?.gender || '',
               email: data?.email || '',
               nid: data?.nid || '',
               dob: data?.dob ? data.dob.split('T')[0] : '',
               image: data?.image || ''
          });
     }

     if (data && !agencyData) {
          setAgencyData({
               district: data?.district || '',
               upazilla: data?.upazilla || '',
               keyArea: data?.keyArea || '',
               area: data?.area || '',
               license_number: data?.license_number || '',
               expire_date: data?.expire_date || '',
               experience: data?.experience || ''
          });
     }

     const handleOwnerChange = (field, value) => {
          setOwnerData(prev => ({
               ...prev,
               [field]: value
          }));
     };

     const handleAgencyChange = (field, value) => {
          setAgencyData(prev => ({
               ...prev,
               [field]: value
          }));
     };

     const handleSaveOwner = async () => {
          try {
               // Add API call to save owner data
               console.log('Saving owner data:', ownerData);
               setEditingOwner(false);
          } catch (error) {
               console.error('Error saving owner data:', error);
          }
     };

     const handleSaveAgency = async () => {
          try {
               // Add API call to save agency data
               console.log('Saving agency data:', agencyData);
               setEditingAgency(false);
          } catch (error) {
               console.error('Error saving agency data:', error);
          }
     };

     const handleCancelOwner = () => {
          if (data) {
               setOwnerData({
                    name: data?.name || '',
                    phone: data?.phone || '',
                    gender: data?.gender || '',
                    email: data?.email || '',
                    nid: data?.nid || '',
                    dob: data?.dob ? data.dob.split('T')[0] : '',
                    image: data?.image || ''
               });
          }
          setEditingOwner(false);
     };

     const handleCancelAgency = () => {
          if (data) {
               setAgencyData({
                    district: data?.district || '',
                    upazilla: data?.upazilla || '',
                    keyArea: data?.keyArea || '',
                    area: data?.area || '',
                    license_number: data?.license_number || '',
                    expire_date: data?.expire_date || '',
                    experience: data?.experience || ''
               });
          }
          setEditingAgency(false);
     };

     return (
          <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
               <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
                         Profile Management
                    </h1>

                    {data && ownerData && agencyData ? (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {/* Owner Information Section */}
                              <Card className="shadow-lg">
                                   <CardContent className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                             <h2 className="text-2xl font-bold text-gray-900">
                                                  Owner Information
                                             </h2>
                                             {!editingOwner && (
                                                  <Button
                                                       startIcon={<EditIcon />}
                                                       variant="contained"
                                                       sx={{ background: '#F58300' }}
                                                       onClick={() => setEditingOwner(true)}
                                                  >
                                                       Edit
                                                  </Button>
                                             )}
                                        </div>

                                        {/* Profile Picture */}
                                        <div className="flex justify-center mb-8">
                                             <img
                                                  src={ownerData.image}
                                                  alt="Profile"
                                                  className="w-40 h-40 rounded-full border-4 border-orange-300 object-cover"
                                             />
                                        </div>

                                        {/* Form Fields */}
                                        <div className="space-y-4">
                                             <div>
                                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                       Name
                                                  </label>
                                                  <TextField
                                                       fullWidth
                                                       variant="outlined"
                                                       value={ownerData.name}
                                                       onChange={(e) => handleOwnerChange('name', e.target.value)}
                                                       disabled={!editingOwner}
                                                       size="small"
                                                  />
                                             </div>

                                             <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Phone
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            value={ownerData.phone}
                                                            onChange={(e) => handleOwnerChange('phone', e.target.value)}
                                                            disabled={!editingOwner}
                                                            size="small"
                                                       />
                                                  </div>
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Gender
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            value={ownerData.gender}
                                                            onChange={(e) => handleOwnerChange('gender', e.target.value)}
                                                            disabled={!editingOwner}
                                                            size="small"
                                                       />
                                                  </div>
                                             </div>

                                             <div>
                                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                       Email
                                                  </label>
                                                  <TextField
                                                       fullWidth
                                                       variant="outlined"
                                                       value={ownerData.email}
                                                       disabled={true}
                                                       size="small"
                                                  />
                                             </div>

                                             <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            NID
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            value={ownerData.nid}
                                                            onChange={(e) => handleOwnerChange('nid', e.target.value)}
                                                            disabled={!editingOwner}
                                                            size="small"
                                                       />
                                                  </div>
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Date of Birth
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            type="date"
                                                            value={ownerData.dob}
                                                            onChange={(e) => handleOwnerChange('dob', e.target.value)}
                                                            disabled={!editingOwner}
                                                            size="small"
                                                            InputLabelProps={{
                                                                 shrink: true,
                                                            }}
                                                       />
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {editingOwner && (
                                             <div className="flex gap-4 mt-8">
                                                  <Button
                                                       fullWidth
                                                       startIcon={<SaveIcon />}
                                                       variant="contained"
                                                       sx={{ background: '#F58300' }}
                                                       onClick={handleSaveOwner}
                                                  >
                                                       Save
                                                  </Button>
                                                  <Button
                                                       fullWidth
                                                       startIcon={<CancelIcon />}
                                                       variant="outlined"
                                                       onClick={handleCancelOwner}
                                                  >
                                                       Cancel
                                                  </Button>
                                             </div>
                                        )}
                                   </CardContent>
                              </Card>

                              {/* Agency Information Section */}
                              <Card className="shadow-lg">
                                   <CardContent className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                             <h2 className="text-2xl font-bold text-gray-900">
                                                  Agency Information
                                             </h2>
                                             {!editingAgency && (
                                                  <Button
                                                       startIcon={<EditIcon />}
                                                       variant="contained"
                                                       sx={{ background: '#F58300' }}
                                                       onClick={() => setEditingAgency(true)}
                                                  >
                                                       Edit
                                                  </Button>
                                             )}
                                        </div>

                                        {/* Address Information */}
                                        <div className="mb-6">
                                             <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                                  Address
                                             </h3>
                                             <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            District
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            value={agencyData.district}
                                                            onChange={(e) => handleAgencyChange('district', e.target.value)}
                                                            disabled={!editingAgency}
                                                            size="small"
                                                       />
                                                  </div>
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Upazilla
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            value={agencyData.upazilla}
                                                            onChange={(e) => handleAgencyChange('upazilla', e.target.value)}
                                                            disabled={!editingAgency}
                                                            size="small"
                                                       />
                                                  </div>
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Key Area
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            value={agencyData.keyArea}
                                                            onChange={(e) => handleAgencyChange('keyArea', e.target.value)}
                                                            disabled={!editingAgency}
                                                            size="small"
                                                       />
                                                  </div>
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Area
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            value={agencyData.area}
                                                            onChange={(e) => handleAgencyChange('area', e.target.value)}
                                                            disabled={!editingAgency}
                                                            size="small"
                                                       />
                                                  </div>
                                             </div>
                                        </div>

                                        {/* License Information */}
                                        <div>
                                             <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                                  License Information
                                             </h3>
                                             <div className="space-y-4">
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            License Number
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            value={agencyData.license_number}
                                                            onChange={(e) => handleAgencyChange('license_number', e.target.value)}
                                                            disabled={!editingAgency}
                                                            size="small"
                                                       />
                                                  </div>
                                                  <div className="grid grid-cols-2 gap-4">
                                                       <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                 Expiry Date
                                                            </label>
                                                            <TextField
                                                                 fullWidth
                                                                 variant="outlined"
                                                                 type="date"
                                                                 value={agencyData.expire_date}
                                                                 onChange={(e) => handleAgencyChange('expire_date', e.target.value)}
                                                                 disabled={!editingAgency}
                                                                 size="small"
                                                                 InputLabelProps={{
                                                                      shrink: true,
                                                                 }}
                                                            />
                                                       </div>
                                                       <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                 Experience (Years)
                                                            </label>
                                                            <TextField
                                                                 fullWidth
                                                                 variant="outlined"
                                                                 value={agencyData.experience}
                                                                 onChange={(e) => handleAgencyChange('experience', e.target.value)}
                                                                 disabled={!editingAgency}
                                                                 size="small"
                                                            />
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {editingAgency && (
                                             <div className="flex gap-4 mt-8">
                                                  <Button
                                                       fullWidth
                                                       startIcon={<SaveIcon />}
                                                       variant="contained"
                                                       sx={{ background: '#F58300' }}
                                                       onClick={handleSaveAgency}
                                                  >
                                                       Save
                                                  </Button>
                                                  <Button
                                                       fullWidth
                                                       startIcon={<CancelIcon />}
                                                       variant="outlined"
                                                       onClick={handleCancelAgency}
                                                  >
                                                       Cancel
                                                  </Button>
                                             </div>
                                        )}
                                   </CardContent>
                              </Card>
                         </div>
                    ) : (
                         <div className="flex justify-center items-center h-64">
                              <p className="text-xl text-gray-500">Loading...</p>
                         </div>
                    )}
               </div>
          </div>
     );
};

export default OwnerProfile;