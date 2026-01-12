import { useState } from "react";
import { Button, TextField, Card, CardContent } from "@mui/material";
import { useQuery } from '@tanstack/react-query'
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAuth from "../../hooks/useAuth";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

const OwnerProfile = () => {
     const { user } = useAuth();
     const axiosPublic = useAxiosPublic();
     const [editingOwner, setEditingOwner] = useState(false);
     const [editingAgency, setEditingAgency] = useState(false);
     const [editingOwnerAddress, setEditingOwnerAddress] = useState(false);
     const [editingAgencyAddress, setEditingAgencyAddress] = useState(false);
     const [ownerData, setOwnerData] = useState(null);
     const [agencyData, setAgencyData] = useState(null);
     const [originalOwnerData, setOriginalOwnerData] = useState(null);
     const [originalAgencyData, setOriginalAgencyData] = useState(null);

     const { data } = useQuery({
          queryKey: ['user'],
          queryFn: async () => {
               const response = await axiosPublic.get(`agencyRoutes/getAgencyProfile/${user.email}`);
               return response.data;
          },
     })

     // Initialize form data when data is fetched
     if (data && !ownerData) {
          const initialOwnerData = {
               owner_name: data?.owner_name || '',
               owner_phone: data?.owner_phone || '',
               gender: data?.gender || '',
               owner_email: data?.owner_email || '',
               dob: data?.dob ? data.dob.split('T')[0] : '',
               owner_photo: data?.owner_photo || '',
               owner_city: data?.owner_city || '',
               owner_area: data?.owner_area || '',
               owner_postcode: data?.owner_postcode || '',
               owner_full_address: data?.owner_full_address || '',
               owner_verified: data?.owner_verified || false,
               accountstatus: data?.accountstatus || ''
          };
          setOwnerData(initialOwnerData);
          setOriginalOwnerData(initialOwnerData);
     }

     if (data && !agencyData) {
          const initialAgencyData = {
               agency_name: data?.agency_name || '',
               phone_number: data?.phone_number || '',
               email: data?.email || '',
               agency_city: data?.agency_city || '',
               agency_area: data?.agency_area || '',
               agency_postcode: data?.agency_postcode || '',
               agency_full_address: data?.agency_full_address || '',
               license: data?.license || '',
               tin: data?.tin || '',
               insurancenumber: data?.insurancenumber || '',
               tradelicenseexpire: data?.tradelicenseexpire.split('T')[0] || '',
               expire_date: data?.expire_date.split('T')[0] || '',
               status: data?.status || '',
               verified: data?.verified || false,
               cars: data?.cars || 0,
               bikes: data?.bikes || 0
          };
          setAgencyData(initialAgencyData);
          setOriginalAgencyData(initialAgencyData);
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

     // Helper function to get only changed fields
     const getChangedFields = (currentData, originalData) => {
          if (!originalData) return currentData;

          const changedFields = {};
          Object.keys(currentData).forEach(key => {
               if (currentData[key] !== originalData[key]) {
                    console.log("changed");

                    changedFields[key] = currentData[key];
               }
          });
          return changedFields;
     };

     const handleSaveOwner = async () => {
          try {
               const changedFields = getChangedFields(ownerData, originalOwnerData);

               if (Object.keys(changedFields).length === 0) {
                    console.log('No changes to save');
                    setEditingOwner(false);
                    return;
               }

               // Add API call to save only changed owner data
               console.log('Saving changed owner data:', changedFields);
               // Example API call:
               const response = await axiosPublic.patch(`agencyRoutes/updateOwnerInfo/${data?.owner_id}`, changedFields);

               if (response.data.success) {
                    toast.success(response.data.message);
               }

               // Update original data after successful save
               setOriginalOwnerData(response.data.updatedOwner);
               setEditingOwner(false);
          } catch (error) {
               console.error('Error saving owner data:', error);
          }
     };


     const handleSaveAgency = async () => {
          try {
               const changedFields = getChangedFields(agencyData, originalAgencyData);

               if (Object.keys(changedFields).length === 0) {
                    console.log('No changes to save');
                    setEditingAgency(false);
                    return;
               }

               // Add API call to save only changed agency data
               console.log('Saving changed agency data:', changedFields);
               // Example API call:
               const response = await axiosPublic.patch(`/agencyRoutes/updateAgencyInfo/${data?.agency_id}`, changedFields);

               if (response.data.success) {
                    toast.success(response.data.message);
               }

               // Update original data after successful save
               setOriginalAgencyData(response.data.updatedAgency);
               setEditingAgency(false);
          } catch (error) {
               console.error('Error saving agency data:', error);
          }
     };

     const handleCancelOwner = () => {
          if (originalOwnerData) {
               setOwnerData(originalOwnerData);
          }
          setEditingOwner(false);
     };

     const handleCancelAgency = () => {
          if (originalAgencyData) {
               setAgencyData(originalAgencyData);
          }
          setEditingAgency(false);
     };

     // Address-specific handlers for Owner
     const handleSaveOwnerAddress = async () => {
          try {
               const addressFields = {
                    owner_full_address: ownerData.owner_full_address,
                    owner_city: ownerData.owner_city,
                    owner_area: ownerData.owner_area,
                    owner_postcode: ownerData.owner_postcode
               };

               const changedAddressFields = {};
               Object.keys(addressFields).forEach(key => {
                    if (addressFields[key] !== originalOwnerData[key]) {
                         changedAddressFields[key] = addressFields[key];
                    }
               });

               if (Object.keys(changedAddressFields).length === 0) {
                    console.log('No address changes to save');
                    setEditingOwnerAddress(false);
                    return;
               }

               const response = await axiosPublic.patch(`/addressRoutes/updateAddress/${data?.agency_add_id}`, changedAddressFields);

               if (response.data.success) {
                    toast.success(response.data.message);
               }

               setOriginalOwnerData(prev => ({ ...prev, ...response.data.updatedAddress }));
               setEditingOwnerAddress(false);
          } catch (error) {
               console.error('Error saving owner address:', error);
          }
     };

     const handleCancelOwnerAddress = () => {
          if (originalOwnerData) {
               setOwnerData(prev => ({
                    ...prev,
                    owner_full_address: originalOwnerData.owner_full_address,
                    owner_city: originalOwnerData.owner_city,
                    owner_area: originalOwnerData.owner_area,
                    owner_postcode: originalOwnerData.owner_postcode
               }));
          }
          setEditingOwnerAddress(false);
     };

     // Address-specific handlers for Agency
     const handleSaveAgencyAddress = async () => {
          try {
               const addressFields = {
                    agency_full_address: agencyData.agency_full_address,
                    agency_city: agencyData.agency_city,
                    agency_area: agencyData.agency_area,
                    agency_postcode: agencyData.agency_postcode
               };

               const changedAddressFields = {};
               Object.keys(addressFields).forEach(key => {
                    if (addressFields[key] !== originalAgencyData[key]) {
                         changedAddressFields[key] = addressFields[key];
                    }
               });

               if (Object.keys(changedAddressFields).length === 0) {
                    console.log('No address changes to save');
                    setEditingAgencyAddress(false);
                    return;
               }

               const response = await axiosPublic.patch(`/addressRoutes/updateAddress/${data?.owner_add_id}`, changedAddressFields);

               if (response.data.success) {
                    toast.success(response.data.message);
               }

               setOriginalOwnerData(prev => ({ ...prev, ...response.data.updatedAddress }));
               setEditingAgencyAddress(false);
          } catch (error) {
               console.error('Error saving agency address:', error);
          }
     };

     const handleCancelAgencyAddress = () => {
          if (originalAgencyData) {
               setAgencyData(prev => ({
                    ...prev,
                    agency_full_address: originalAgencyData.agency_full_address,
                    agency_city: originalAgencyData.agency_city,
                    agency_area: originalAgencyData.agency_area,
                    agency_postcode: originalAgencyData.agency_postcode
               }));
          }
          setEditingAgencyAddress(false);
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
                                                  src={ownerData.owner_photo}
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
                                                       value={ownerData.owner_name}
                                                       onChange={(e) => handleOwnerChange('owner_name', e.target.value)}
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
                                                            value={ownerData.owner_phone}
                                                            onChange={(e) => handleOwnerChange('owner_phone', e.target.value)}
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
                                                       value={ownerData.owner_email}
                                                       disabled={true}
                                                       size="small"
                                                  />
                                             </div>

                                             <div className="grid grid-cols-2 gap-4">
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
                                                       />
                                                  </div>
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Account Status
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            value={ownerData.accountstatus}
                                                            disabled={true}
                                                            size="small"
                                                       />
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

                                             {/* Address Information */}
                                             <div className="mt-6 pt-6 border-t">
                                                  <div className="flex items-center justify-between mb-4">
                                                       <h3 className="text-lg font-semibold text-gray-800">
                                                            Address
                                                       </h3>
                                                       {!editingOwnerAddress && (
                                                            <Button
                                                                 size="small"
                                                                 startIcon={<EditIcon />}
                                                                 variant="contained"
                                                                 sx={{ background: '#F58300' }}
                                                                 onClick={() => setEditingOwnerAddress(true)}
                                                            >
                                                                 Edit
                                                            </Button>
                                                       )}
                                                  </div>
                                                  <div className="space-y-4">
                                                       <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                 Full Address
                                                            </label>
                                                            <TextField
                                                                 fullWidth
                                                                 variant="outlined"
                                                                 value={ownerData.owner_full_address}
                                                                 onChange={(e) => handleOwnerChange('owner_full_address', e.target.value)}
                                                                 disabled={!editingOwnerAddress}
                                                                 size="small"
                                                                 multiline
                                                                 rows={2}
                                                            />
                                                       </div>
                                                       <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                 <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                      City
                                                                 </label>
                                                                 <TextField
                                                                      fullWidth
                                                                      variant="outlined"
                                                                      value={ownerData.owner_city}
                                                                      onChange={(e) => handleOwnerChange('owner_city', e.target.value)}
                                                                      disabled={!editingOwnerAddress}
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
                                                                      value={ownerData.owner_area}
                                                                      onChange={(e) => handleOwnerChange('owner_area', e.target.value)}
                                                                      disabled={!editingOwnerAddress}
                                                                      size="small"
                                                                 />
                                                            </div>
                                                       </div>
                                                       <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                 Postcode
                                                            </label>
                                                            <TextField
                                                                 fullWidth
                                                                 variant="outlined"
                                                                 value={ownerData.owner_postcode}
                                                                 onChange={(e) => handleOwnerChange('owner_postcode', e.target.value)}
                                                                 disabled={!editingOwnerAddress}
                                                                 size="small"
                                                            />
                                                       </div>
                                                  </div>

                                                  {/* Address Action Buttons */}
                                                  {editingOwnerAddress && (
                                                       <div className="flex gap-4 mt-4">
                                                            <Button
                                                                 size="small"
                                                                 startIcon={<SaveIcon />}
                                                                 variant="contained"
                                                                 sx={{ background: '#F58300' }}
                                                                 onClick={handleSaveOwnerAddress}
                                                            >
                                                                 Save
                                                            </Button>
                                                            <Button
                                                                 size="small"
                                                                 startIcon={<CancelIcon />}
                                                                 variant="outlined"
                                                                 onClick={handleCancelOwnerAddress}
                                                            >
                                                                 Cancel
                                                            </Button>
                                                       </div>
                                                  )}
                                             </div>
                                        </div>
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

                                        {/* Basic Information */}
                                        <div className="space-y-4 mb-6">
                                             <div>
                                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                       Agency Name
                                                  </label>
                                                  <TextField
                                                       fullWidth
                                                       variant="outlined"
                                                       value={agencyData.agency_name}
                                                       onChange={(e) => handleAgencyChange('agency_name', e.target.value)}
                                                       disabled={!editingAgency}
                                                       size="small"
                                                  />
                                             </div>

                                             <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Phone Number
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            value={agencyData.phone_number}
                                                            onChange={(e) => handleAgencyChange('phone_number', e.target.value)}
                                                            disabled={!editingAgency}
                                                            size="small"
                                                       />
                                                  </div>
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Email
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            value={agencyData.email}
                                                            onChange={(e) => handleAgencyChange('email', e.target.value)}
                                                            disabled={!editingAgency}
                                                            size="small"
                                                       />
                                                  </div>
                                             </div>

                                             <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Vehicles - Cars
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            type="number"
                                                            value={agencyData.cars}
                                                            disabled={true}
                                                            size="small"
                                                       />
                                                  </div>
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Vehicles - Bikes
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            type="number"
                                                            value={agencyData.bikes}
                                                            disabled={true}
                                                            size="small"
                                                       />
                                                  </div>
                                             </div>
                                        </div>

                                        {/* License & Registration Information */}
                                        <div className="mb-6 pt-6 border-t">
                                             <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                                  License & Registration
                                             </h3>
                                             <div className="space-y-4">
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            License Number
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            value={agencyData.license}
                                                            onChange={(e) => handleAgencyChange('license', e.target.value)}
                                                            disabled={!editingAgency}
                                                            size="small"
                                                       />
                                                  </div>

                                                  <div className="grid grid-cols-2 gap-4">
                                                       <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                 TIN
                                                            </label>
                                                            <TextField
                                                                 fullWidth
                                                                 variant="outlined"
                                                                 value={agencyData.tin}
                                                                 onChange={(e) => handleAgencyChange('tin', e.target.value)}
                                                                 disabled={!editingAgency}
                                                                 size="small"
                                                            />
                                                       </div>
                                                       <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                 Insurance Number
                                                            </label>
                                                            <TextField
                                                                 fullWidth
                                                                 variant="outlined"
                                                                 value={agencyData.insurancenumber}
                                                                 onChange={(e) => handleAgencyChange('insurancenumber', e.target.value)}
                                                                 disabled={!editingAgency}
                                                                 size="small"
                                                            />
                                                       </div>
                                                  </div>

                                                  <div className="grid grid-cols-2 gap-4">
                                                       <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                 Trade License Expire
                                                            </label>
                                                            <TextField
                                                                 fullWidth
                                                                 variant="outlined"
                                                                 type="date"
                                                                 value={agencyData.tradelicenseexpire}
                                                                 onChange={(e) => handleAgencyChange('tradelicenseexpire', e.target.value)}
                                                                 disabled={!editingAgency}
                                                                 size="small"
                                                            />
                                                       </div>
                                                       <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                 License Expiry Date
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
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Status Information */}
                                        <div className="pt-6 border-t">
                                             <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                                  Status
                                             </h3>
                                             <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Status
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            value={agencyData.status}
                                                            disabled={true}
                                                            size="small"
                                                       />
                                                  </div>
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Verified
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            value={agencyData.verified ? 'Yes' : 'No'}
                                                            disabled={true}
                                                            size="small"
                                                       />
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

                                        {/* Address Information */}
                                        <div className="mb-6 pt-6 border-t">
                                             <div className="flex items-center justify-between mb-4">
                                                  <h3 className="text-lg font-semibold text-gray-800">
                                                       Address
                                                  </h3>
                                                  {!editingAgencyAddress && (
                                                       <Button
                                                            size="small"
                                                            startIcon={<EditIcon />}
                                                            variant="contained"
                                                            sx={{ background: '#F58300' }}
                                                            onClick={() => setEditingAgencyAddress(true)}
                                                       >
                                                            Edit
                                                       </Button>
                                                  )}
                                             </div>
                                             <div className="space-y-4">
                                                  <div>
                                                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Full Address
                                                       </label>
                                                       <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            value={agencyData.agency_full_address}
                                                            onChange={(e) => handleAgencyChange('agency_full_address', e.target.value)}
                                                            disabled={!editingAgencyAddress}
                                                            size="small"
                                                            multiline
                                                            rows={2}
                                                       />
                                                  </div>
                                                  <div className="grid grid-cols-3 gap-4">
                                                       <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                 City
                                                            </label>
                                                            <TextField
                                                                 fullWidth
                                                                 variant="outlined"
                                                                 value={agencyData.agency_city}
                                                                 onChange={(e) => handleAgencyChange('agency_city', e.target.value)}
                                                                 disabled={!editingAgencyAddress}
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
                                                                 value={agencyData.agency_area}
                                                                 onChange={(e) => handleAgencyChange('agency_area', e.target.value)}
                                                                 disabled={!editingAgencyAddress}
                                                                 size="small"
                                                            />
                                                       </div>
                                                       <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                 Postcode
                                                            </label>
                                                            <TextField
                                                                 fullWidth
                                                                 variant="outlined"
                                                                 value={agencyData.agency_postcode}
                                                                 onChange={(e) => handleAgencyChange('agency_postcode', e.target.value)}
                                                                 disabled={!editingAgencyAddress}
                                                                 size="small"
                                                            />
                                                       </div>
                                                  </div>
                                             </div>

                                             {/* Address Action Buttons */}
                                             {editingAgencyAddress && (
                                                  <div className="flex gap-4 mt-4">
                                                       <Button
                                                            size="small"
                                                            startIcon={<SaveIcon />}
                                                            variant="contained"
                                                            sx={{ background: '#F58300' }}
                                                            onClick={handleSaveAgencyAddress}
                                                       >
                                                            Save
                                                       </Button>
                                                       <Button
                                                            size="small"
                                                            startIcon={<CancelIcon />}
                                                            variant="outlined"
                                                            onClick={handleCancelAgencyAddress}
                                                       >
                                                            Cancel
                                                       </Button>
                                                  </div>
                                             )}
                                        </div>
                                   </CardContent>
                              </Card>
                         </div>
                    ) : <Loader />}
               </div>
          </div>
     );
};

export default OwnerProfile;