import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAuth from "../../hooks/useAuth";
import { FiEdit2, FiSave, FiX, FiCamera, FiMapPin, FiMail, FiPhone, FiUser, FiCalendar, FiShield, FiBriefcase } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminProfile = () => {
     const { user } = useAuth();
     const axiosPublic = useAxiosPublic();
     const queryClient = useQueryClient();
     
     const [isEditing, setIsEditing] = useState(false);
     const [formData, setFormData] = useState({
          name: '',
          city: '',
          area: '',
          postcode: ''
     });
     const [photoFile, setPhotoFile] = useState(null);
     const [photoPreview, setPhotoPreview] = useState('');
     const [isSubmitting, setIsSubmitting] = useState(false);
     const fileInputRef = useRef(null);

     const { data, isLoading, isError } = useQuery({
          queryKey: ['adminUser', user?.email],
          queryFn: async () => {
               const response = await axiosPublic.get(`userRoute/getUserInfo/${user?.email}`);
               return response.data[0];
          },
          enabled: !!user?.email
     });

     const handleEditToggle = () => {
          if (!isEditing && data) {
               setFormData({
                    name: data.name || '',
                    city: data.city || '',
                    area: data.area || '',
                    postcode: data.postcode || ''
               });
               setPhotoPreview(data.photo || '');
               setPhotoFile(null);
          }
          setIsEditing(!isEditing);
     };

     const handleInputChange = (e) => {
          const { name, value } = e.target;
          setFormData(prev => ({ ...prev, [name]: value }));
     };

     const handlePhotoChange = (e) => {
          const file = e.target.files[0];
          if (file) {
               setPhotoFile(file);
               const reader = new FileReader();
               reader.onloadend = () => {
                    setPhotoPreview(reader.result);
               };
               reader.readAsDataURL(file);
          }
     };

     const triggerFileInput = () => {
          if (isEditing) {
               fileInputRef.current.click();
          }
     };

     const handleSave = async () => {
          if (!data?.user_id) return toast.error("User ID not found");
          
          setIsSubmitting(true);
          const toastId = toast.loading('Updating profile...');

          try {
               let newPhotoUrl = data.photo;
               
               // Upload new photo to ImgBB
               if (photoFile) {
                    const imgbbKey = import.meta.env.VITE_imgbb_api_key;
                    if (!imgbbKey) throw new Error("ImgBB API key is missing");

                    const formDataForImg = new FormData();
                    formDataForImg.append('image', photoFile);
                    
                    const imgbbRes = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, formDataForImg);
                    if (imgbbRes.data && imgbbRes.data.success) {
                         newPhotoUrl = imgbbRes.data.data.display_url;
                    } else {
                         throw new Error("Failed to upload image");
                    }
               }

               const hasUserInfoChanged = formData.name !== data.name || newPhotoUrl !== data.photo;
               const hasAddressChanged = formData.city !== data.city || formData.area !== data.area || formData.postcode !== data.postcode;
               const updatePromises = [];

               if (hasUserInfoChanged) {
                    updatePromises.push(
                         axiosPublic.patch(`userRoute/updateUserInfo/${data.user_id}`, {
                              name: formData.name,
                              photo: newPhotoUrl
                         })
                    );
               }

               if (hasAddressChanged) {
                    updatePromises.push(
                         axiosPublic.patch(`userRoute/updateUserAddress/${data.user_id}`, {
                              city: formData.city,
                              area: formData.area,
                              postcode: formData.postcode
                         })
                    );
               }

               if (updatePromises.length > 0) {
                    await Promise.all(updatePromises);
                    await queryClient.invalidateQueries({ queryKey: ['adminUser', user?.email] });
                    toast.success('Profile updated successfully!', { id: toastId });
                    setIsEditing(false);
               } else {
                    toast.dismiss(toastId);
                    toast('No changes to save.', { icon: 'ℹ️' });
                    setIsEditing(false);
               }

          } catch (error) {
               console.error("Update error:", error);
               toast.error(error.response?.data?.message || error.message || 'Failed to update profile', { id: toastId });
          } finally {
               setIsSubmitting(false);
          }
     };

     if (isLoading) {
          return (
               <div className="flex justify-center items-center min-h-[80vh]">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#F58300]"></div>
               </div>
          );
     }

     if (isError || !data) {
          return (
               <div className="flex justify-center items-center min-h-[80vh] flex-col text-red-500">
                    <FiShield className="text-6xl mb-4 opacity-50" />
                    <h2 className="text-2xl font-bold">Failed to load profile details</h2>
               </div>
          );
     }

     const dateOnly = data?.dob ? new Date(data.dob).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
     }) : 'N/A';

     return (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
               {/* Hero Banner Section */}
               <div className="relative rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-black h-48 sm:h-64 shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay transition-opacity duration-700 group-hover:opacity-20"></div>
                    <div className="absolute top-6 right-6 z-10 flex gap-3">
                         {isEditing ? (
                              <div className="flex gap-2">
                                   <button 
                                        onClick={handleEditToggle} 
                                        disabled={isSubmitting}
                                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl backdrop-blur-md transition-all shadow-lg font-semibold border border-white/10 text-sm sm:text-base disabled:opacity-50"
                                   >
                                        <FiX /> Cancel
                                   </button>
                                   <button 
                                        onClick={handleSave} 
                                        disabled={isSubmitting}
                                        className="flex items-center gap-2 bg-gradient-to-r from-[#F58300] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-xl backdrop-blur-md transition-all shadow-lg font-semibold shadow-orange-500/30 text-sm sm:text-base disabled:opacity-50 transform hover:-translate-y-0.5"
                                   >
                                        {isSubmitting ? (
                                             <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        ) : <FiSave />}
                                        Save
                                   </button>
                              </div>
                         ) : (
                              <button 
                                   onClick={handleEditToggle} 
                                   className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl backdrop-blur-md transition-all shadow-lg font-semibold border border-white/10 text-sm sm:text-base transform hover:-translate-y-0.5"
                              >
                                   <FiEdit2 /> Edit Profile
                              </button>
                         )}
                    </div>
               </div>

               {/* Profile Header Details */}
               <div className="relative -mt-20 sm:-mt-24 px-6 sm:px-12 mb-10">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
                         <div className="relative group">
                              <div 
                                   className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white relative transition-transform duration-300 ${isEditing ? 'cursor-pointer hover:scale-105 hover:ring-4 ring-[#F58300]/50' : ''}`}
                                   onClick={triggerFileInput}
                              >
                                   <img 
                                        src={isEditing ? photoPreview : (data.photo || 'https://via.placeholder.com/150')} 
                                        alt="Profile" 
                                        className={`w-full h-full object-cover transition-all duration-500 ${isEditing ? 'group-hover:opacity-70 scale-105' : ''}`} 
                                   />
                                   {isEditing && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                             <FiCamera className="text-white text-3xl mb-1" />
                                             <span className="text-white text-xs font-semibold">Change Photo</span>
                                        </div>
                                   )}
                              </div>
                              <input 
                                   type="file" 
                                   ref={fileInputRef} 
                                   className="hidden" 
                                   accept="image/*" 
                                   onChange={handlePhotoChange} 
                              />
                              {isEditing && (
                                   <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-[#F58300] p-3 rounded-full text-white shadow-xl border-2 border-white pointer-events-none transform transition-transform group-hover:scale-110 group-hover:rotate-12">
                                        <FiCamera size={20} />
                                   </div>
                              )}
                         </div>

                         <div className="text-center mt-32 sm:text-left flex-1 pb-2 sm:pb-6">
                              {isEditing ? (
                                   <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="text-3xl sm:text-4xl font-black bg-white/80 border-b-2 border-[#F58300] focus:outline-none focus:bg-white focus:border-orange-600 px-3 py-1 rounded-t-lg transition-all w-full sm:w-2/3 shadow-sm text-gray-800"
                                        placeholder="Full Name"
                                   />
                              ) : (
                                   <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">{data.name}</h1>
                              )}
                              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-3">
                                   <span className="bg-orange-100/80 text-orange-700 px-4 py-1.5 rounded-full text-xs sm:text-sm uppercase tracking-widest font-bold shadow-sm backdrop-blur-sm border border-orange-200">
                                        {data.userrole}
                                   </span>
                                   <span className="flex items-center gap-2 text-gray-600 font-medium bg-gray-100/80 px-4 py-1.5 rounded-full text-sm shadow-sm backdrop-blur-sm">
                                        <FiMail className="text-gray-400" /> {data.email}
                                   </span>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Bento Grid Layout */}
               <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* Main Content Area */}
                    <div className="xl:col-span-2 space-y-8">
                         
                         {/* Personal Information */}
                         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
                              <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-4 bg-gradient-to-r from-gray-50/50 to-white">
                                   <div className="bg-[#F58300]/10 p-3 rounded-2xl text-[#F58300]">
                                        <FiUser size={24} />
                                   </div>
                                   <h2 className="text-xl font-extrabold text-gray-800">Personal Details</h2>
                              </div>
                              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                   <InfoCard icon={<FiPhone />} label="Phone Number" value={data.phone} />
                                   <InfoCard icon={<FiUser />} label="Gender" value={data.gender} capitalize />
                                   <InfoCard icon={<FiCalendar />} label="Date of Birth" value={dateOnly} />
                                   <InfoCard icon={<FiBriefcase />} label="NID Number" value={data.nid || 'Not Provided'} />
                              </div>
                         </div>

                         {/* Address Information */}
                         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
                              <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-4 bg-gradient-to-r from-gray-50/50 to-white">
                                   <div className="bg-[#F58300]/10 p-3 rounded-2xl text-[#F58300]">
                                        <FiMapPin size={24} />
                                   </div>
                                   <h2 className="text-xl font-extrabold text-gray-800">Location Data</h2>
                              </div>
                              <div className="p-8">
                                   {isEditing ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                             <div className="space-y-2 relative group">
                                                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">City</label>
                                                  <input 
                                                       type="text" 
                                                       name="city" 
                                                       value={formData.city} 
                                                       onChange={handleInputChange} 
                                                       className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#F58300]/20 focus:border-[#F58300] transition-all font-medium group-hover:border-gray-300"
                                                  />
                                             </div>
                                             <div className="space-y-2 relative group">
                                                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Area</label>
                                                  <input 
                                                       type="text" 
                                                       name="area" 
                                                       value={formData.area} 
                                                       onChange={handleInputChange} 
                                                       className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#F58300]/20 focus:border-[#F58300] transition-all font-medium group-hover:border-gray-300"
                                                  />
                                             </div>
                                             <div className="space-y-2 relative group">
                                                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Postcode</label>
                                                  <input 
                                                       type="text" 
                                                       name="postcode" 
                                                       value={formData.postcode} 
                                                       onChange={handleInputChange} 
                                                       className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#F58300]/20 focus:border-[#F58300] transition-all font-medium group-hover:border-gray-300"
                                                  />
                                             </div>
                                        </div>
                                   ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                             <InfoCard icon={<FiMapPin />} label="City" value={data.city} />
                                             <InfoCard icon={<FiMapPin />} label="Area" value={data.area} />
                                             <InfoCard icon={<FiMapPin />} label="Postcode" value={data.postcode} />
                                             <div className="sm:col-span-2">
                                                  <InfoCard icon={<FiMapPin />} label="Full Display Address" value={data.display_name} fullWidth />
                                             </div>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    {/* Sidebar / Status Area */}
                    <div className="space-y-8">
                         {/* Status Card */}
                         <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.2)] overflow-hidden text-white relative hover:-translate-y-1 transition-transform duration-300">
                              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F58300]/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
                              
                              <div className="p-8 relative z-10">
                                   <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                             <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/10">
                                                  <FiShield size={26} className="text-orange-400" />
                                             </div>
                                             <h2 className="text-2xl font-bold tracking-tight">Status</h2>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${data.accountstatus?.toLowerCase() === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                             {data.accountstatus}
                                        </div>
                                   </div>
                                   
                                   <div className="space-y-6">
                                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                                             <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">User Identifier</p>
                                             <p className="font-mono text-sm tracking-wider text-orange-100 break-all">{data.user_id}</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                             {data.license_number && (
                                                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                                       <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">License</p>
                                                       <p className="font-semibold text-lg text-white">{data.license_number}</p>
                                                  </div>
                                             )}
                                             {data.experience !== null && data.experience !== undefined && (
                                                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                                       <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Experience</p>
                                                       <p className="font-semibold text-lg text-white">{data.experience} <span className="text-sm font-normal text-gray-400">Yrs</span></p>
                                                  </div>
                                             )}
                                        </div>
                                        
                                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex justify-between items-center">
                                             <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Member Since</p>
                                             <p className="font-bold text-white text-sm">
                                                  {new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                             </p>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

               </div>
          </div>
     );
};

// Reusable Info Card Component
const InfoCard = ({ icon, label, value, capitalize, fullWidth }) => {
     if (value === undefined || value === null || value === '') return null;
     
     return (
          <div className={`flex gap-5 p-5 rounded-2xl bg-gray-50/80 border border-gray-100 transition-all duration-300 hover:bg-orange-50/50 hover:border-orange-100 hover:shadow-sm group ${fullWidth ? 'w-full' : ''}`}>
               <div className="text-gray-400 mt-0.5 group-hover:text-[#F58300] transition-colors">
                    {icon}
               </div>
               <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{label}</p>
                    <p className={`text-gray-900 font-semibold text-[15px] ${capitalize ? 'capitalize' : ''} leading-relaxed`}>
                         {value}
                    </p>
               </div>
          </div>
     );
};

export default AdminProfile;