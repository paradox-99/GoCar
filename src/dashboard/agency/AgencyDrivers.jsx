import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import { 
    Users, 
    UserCheck, 
    UserPlus, 
    Search, 
    Filter, 
    Star, 
    MoreHorizontal, 
    Mail, 
    Phone, 
    Briefcase, 
    Calendar, 
    CheckCircle2, 
    AlertCircle, 
    X, 
    ChevronRight, 
    ChevronLeft, 
    Upload, 
    Trash2, 
    ShieldAlert, 
    MapPin, 
    Clock, 
    History, 
    FileText, 
    CreditCard,
    ExternalLink,
    Copy,
    Check,
    LogOut,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import auth from '../../firebase/firebase.config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import emailjs from '@emailjs/browser';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';

// --- Helpers ---
const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < 12; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
};

const STAT_VARIANTS = {
    total: { icon: Users, color: 'blue' },
    verified: { icon: UserCheck, color: 'green' },
    available: { icon: Clock, color: 'orange' },
    rating: { icon: Star, color: 'amber' }
};

// --- Sub-components ---

const StatChip = ({ label, value, type, suffix = '' }) => {
    const config = STAT_VARIANTS[type];
    const Icon = config.icon;
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 flex-1 min-w-[200px]">
            <div className={`p-3 rounded-lg bg-${config.color}-50 text-${config.color}-600`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-xl font-bold text-gray-800">{value}{suffix}</p>
            </div>
        </div>
    );
};

const DriverCard = ({ driver, onViewDetails }) => {
    const licenseStatusColor = {
        'Valid': 'bg-green-500',
        'Expired': 'bg-red-500',
        'Suspended': 'bg-amber-500'
    }[driver.license_status] || 'bg-gray-300';

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-2xl shadow-sm border-l-4 ${licenseStatusColor} border-t border-r border-b border-gray-100 p-5 hover:shadow-md transition-all group relative`}
        >
            <div className="absolute top-4 right-4 flex items-center gap-2">
                {driver.verified && (
                    <span className="flex items-center gap-1 bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-green-100">
                        <CheckCircle2 size={10} /> Verified
                    </span>
                )}
                <span className="flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100">
                    <Star size={10} className="fill-amber-600" /> {Number(driver.rating).toFixed(1)}
                </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                    <img 
                        src={driver.photo || 'https://via.placeholder.com/150'} 
                        alt={driver.name} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-50 shadow-sm"
                    />
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${driver.availability ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-orange-600 transition-colors">{driver.name}</h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">ID: {driver.driver_id}</p>
                </div>
            </div>

            <div className="space-y-2.5 my-4 border-t border-b border-gray-50 py-4">
                <div className="flex items-center gap-2.5 text-gray-600">
                    <div className="p-1.5 bg-gray-50 rounded-md"><Mail size={14} className="text-gray-400" /></div>
                    <span className="text-sm truncate">{driver.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600">
                    <div className="p-1.5 bg-gray-50 rounded-md"><Phone size={14} className="text-gray-400" /></div>
                    <span className="text-sm">{driver.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600">
                    <div className="p-1.5 bg-gray-50 rounded-md"><Briefcase size={14} className="text-gray-400" /></div>
                    <span className="text-sm">{driver.experience_year} Years Experience</span>
                </div>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Hiring Price</p>
                    <p className="text-orange-600 font-black text-lg leading-tight">৳{driver.rental_price}<span className="text-[10px] text-gray-400 font-normal">/Day</span></p>
                </div>
                <button 
                    onClick={() => onViewDetails(driver)}
                    className="flex items-center gap-1.5 px-4 py-2 border-2 border-orange-100 text-orange-600 text-sm font-bold rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all active:scale-95"
                >
                    VIEW DETAILS <ChevronRight size={16} />
                </button>
            </div>
        </motion.div>
    );
};

const AddDriverModal = ({ isOpen, onClose, agencyId }) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [generatedPass, setGeneratedPass] = useState('');
    const [successData, setSuccessData] = useState(null);
    
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    
    const { register, handleSubmit, watch, setValue, trigger, formState: { errors }, reset } = useForm({
        defaultValues: {
            name: '', email: '', phone: '', gender: 'Male', dob: '', nid: '',
            city: '', area: '', postcode: '',
            license_number: '', license_status: 'Valid', expire_date: '',
            experience_year: '', rental_price: ''
        }
    });

    const formData = watch();
    const isDirty = Object.values(formData).some(v => v !== '' && v !== 'Male' && v !== 'Valid' && v !== false);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isDirty]);

    const handleClose = () => {
        if (isDirty && step < 5) {
            if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const handleNext = async () => {
        let fields = [];
        if (step === 1) fields = ['name', 'email', 'phone', 'gender', 'dob', 'nid'];
        if (step === 2) fields = ['city', 'area', 'postcode'];
        if (step === 3) fields = ['license_number', 'license_status', 'expire_date', 'experience_year', 'rental_price'];
        
        const isValid = await trigger(fields);
        if (isValid) setStep(step + 1);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const imgData = new FormData();
        imgData.append('image', file);

        toast.loading('Uploading photo...', { id: 'img-upload' });
        try {
            const res = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_imgbb_api_key}`, {
                method: 'POST',
                body: imgData
            });
            const data = await res.json();
            if (data.success) {
                setUploadedImageUrl(data.data.url);
                toast.success('Photo uploaded!', { id: 'img-upload' });
            } else {
                throw new Error('Upload failed');
            }
        } catch (err) {
            toast.error('Failed to upload photo', { id: 'img-upload' });
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const password = generatePassword();
        setGeneratedPass(password);

        try {
            // 1. Create Firebase Auth Account
            toast.loading('Creating login account...', { id: 'submit-load' });
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, password);
            const uid = userCredential.user.uid;

            // 2. Insert into DB
            toast.loading('Saving driver record...', { id: 'submit-load' });
            const dbPayload = {
                ...data,
                photo: uploadedImageUrl,
                agency_id: agencyId,
                firebase_uid: uid, // for reference
                verified: false,
                accountstatus: 'Active',
                availability: true,
                // formatting for existing backend createDriver
                address: { city: data.city, area: data.area, postcode: data.postcode },
                birthdate: data.dob,
                profilePicture: uploadedImageUrl,
                licenseNumber: data.license_number,
                licenseIssueDate: data.expire_date, // or rename as needed
                experience: data.experience_year,
                hiringPrice: data.rental_price
            };

            await axiosPublic.post('/driverRoutes/createDriver', dbPayload);

            // 3. Send Email via EmailJS
            toast.loading('Sending credentials email...', { id: 'submit-load' });
            try {
                await emailjs.send(
                    import.meta.env.VITE_EMAILJS_SERVICE_ID,
                    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                    {
                        to_name: data.name,
                        to_email: data.email,
                        password: password,
                        login_url: window.location.origin + '/login'
                    },
                    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
                );
            } catch (emailErr) {
                console.error('EmailJS error:', emailErr);
                toast.error('Driver created but email delivery failed. Show credentials manually.', { duration: 6000 });
            }

            toast.success('Driver added successfully!', { id: 'submit-load' });
            setSuccessData({ email: data.email, password });
            queryClient.invalidateQueries(['agency-drivers']);
            setStep(5); // Success step
        } catch (err) {
            console.error('Submit error:', err);
            toast.error(err.message || 'Failed to add driver', { id: 'submit-load' });
            if (err.code === 'auth/email-already-in-use') {
                setStep(1);
                toast.error('This email is already registered.', { id: 'submit-load' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}
            />
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">ADD NEW DRIVER</h2>
                        <div className="flex items-center gap-2 mt-2">
                            {[1, 2, 3, 4].map(s => (
                                <div key={s} className={`h-2 w-8 rounded-full transition-all ${step >= s ? 'bg-orange-500' : 'bg-gray-200'}`} />
                            ))}
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><UserPlus className="text-orange-500" /> Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Full Name</label>
                                    <input {...register('name', { required: 'Name is required' })} placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none" />
                                    {errors.name && <p className="text-red-500 text-xs italic">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Email Address</label>
                                    <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none" />
                                    {errors.email && <p className="text-red-500 text-xs italic">{errors.email.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Phone Number</label>
                                    <input {...register('phone', { required: 'Phone is required', minLength: { value: 11, message: 'Must be 11 digits' } })} placeholder="01XXXXXXXXX" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none" />
                                    {errors.phone && <p className="text-red-500 text-xs italic">{errors.phone.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Gender</label>
                                    <select {...register('gender')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none bg-white">
                                        <option>Male</option><option>Female</option><option>Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Date of Birth</label>
                                    <input type="date" {...register('dob', { required: 'DOB is required' })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none" />
                                    {errors.dob && <p className="text-red-500 text-xs italic">{errors.dob.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">NID Number</label>
                                    <input {...register('nid', { required: 'NID is required' })} placeholder="1234567890" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none" />
                                    {errors.nid && <p className="text-red-500 text-xs italic">{errors.nid.message}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6"><Upload className="text-orange-500" /> Profile Photo & Address</h3>
                                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 hover:bg-gray-100/50 transition-all group relative overflow-hidden">
                                    {uploadedImageUrl ? (
                                        <div className="text-center">
                                            <img src={uploadedImageUrl} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mb-4" />
                                            <button onClick={() => setUploadedImageUrl(null)} className="text-red-500 text-sm font-bold hover:underline">Remove and Re-upload</button>
                                        </div>
                                    ) : (
                                        <>
                                            <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                            <div className="p-4 bg-orange-100 text-orange-600 rounded-full mb-3 group-hover:scale-110 transition-transform"><Upload size={32} /></div>
                                            <p className="font-bold text-gray-700">Drag & Drop or Click to Browse</p>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG or JPEG (Max 5MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">City</label>
                                    <input {...register('city', { required: 'City is required' })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Area</label>
                                    <input {...register('area', { required: 'Area is required' })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Postcode</label>
                                    <input {...register('postcode', { required: 'Postcode is required' })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 outline-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Briefcase className="text-orange-500" /> License & Professional Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">License Number</label>
                                    <input {...register('license_number', { required: 'Required' })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">License Status</label>
                                    <select {...register('license_status')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 outline-none bg-white">
                                        <option>Valid</option><option>Expired</option><option>Suspended</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">License Expiry Date</label>
                                    <input type="date" {...register('expire_date', { required: 'Required' })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 outline-none" />
                                    {new Date(watch('expire_date')) < new Date() && <p className="text-amber-600 text-xs mt-1 font-medium">⚠️ This date is in the past.</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Years of Experience</label>
                                    <input type="number" {...register('experience_year', { required: 'Required', min: 0 })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 outline-none" />
                                </div>
                                <div className="col-span-full md:col-span-1 space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Daily Rental Price (BDT)</label>
                                    <input type="number" {...register('rental_price', { required: 'Required', min: 0 })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 outline-none font-bold text-orange-600" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4"><Eye className="text-orange-500" /> Review & Submit</h3>
                            <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-8 space-y-8">
                                <div className="flex items-center gap-6">
                                    <img src={uploadedImageUrl || 'https://via.placeholder.com/150'} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                                    <div>
                                        <h4 className="text-2xl font-black text-gray-900 leading-tight">{formData.name}</h4>
                                        <p className="text-gray-500 font-medium">{formData.email} • {formData.phone}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">NID</p>
                                        <p className="font-bold text-gray-800">{formData.nid}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">License</p>
                                        <p className="font-bold text-gray-800">{formData.license_number} ({formData.license_status})</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Experience</p>
                                        <p className="font-bold text-gray-800">{formData.experience_year} Years</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Daily Price</p>
                                        <p className="font-bold text-orange-600">৳{formData.rental_price}</p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-orange-100 flex items-center gap-2 text-gray-500">
                                    <MapPin size={16} /> 
                                    <span className="text-sm font-medium">{formData.area}, {formData.city}, {formData.postcode}</span>
                                </div>
                            </div>
                            <p className="text-center text-xs text-gray-400 font-medium px-12">By clicking "Confirm & Add Driver", you will create a new login account for this driver. They will receive an email with their temporary credentials.</p>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                            <motion.div 
                                initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: 'spring', damping: 12 }}
                                className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-200"
                            >
                                <Check size={48} strokeWidth={3} />
                            </motion.div>
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">DRIVER ADDED SUCCESSFULLY!</h3>
                                <p className="text-gray-500 font-medium mt-2 max-w-md mx-auto">An account has been created and credentials have been sent to <span className="text-gray-900 font-bold">{successData?.email}</span></p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 w-full max-w-sm">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">TEMPORARY CREDENTIALS</p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 font-medium">Password:</span>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-white px-2 py-1 rounded-md text-orange-600 font-bold border border-gray-200">{successData?.password}</code>
                                            <button 
                                                onClick={() => { navigator.clipboard.writeText(successData?.password); toast.success('Copied!'); }}
                                                className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                                            ><Copy size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 flex justify-between bg-gray-50/50">
                    {step < 5 ? (
                        <>
                            <button 
                                onClick={() => setStep(Math.max(1, step - 1))}
                                disabled={step === 1 || isSubmitting}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${step === 1 ? 'opacity-0' : 'text-gray-500 hover:bg-gray-200 active:scale-95'}`}
                            >
                                <ChevronLeft size={20} /> PREVIOUS
                            </button>
                            <button 
                                onClick={step === 4 ? handleSubmit(onSubmit) : handleNext}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 active:scale-95 disabled:opacity-50 transition-all uppercase tracking-wide"
                            >
                                {isSubmitting ? <Loader size={20} light /> : step === 4 ? 'CONFIRM & ADD DRIVER' : 'NEXT'} <ChevronRight size={20} />
                            </button>
                        </>
                    ) : (
                        <div className="w-full flex gap-4">
                            <button onClick={() => { setStep(1); setSuccessData(null); reset(); setUploadedImageUrl(null); }} className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all uppercase tracking-wide">Add Another Driver</button>
                            <button onClick={onClose} className="flex-1 px-6 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all uppercase tracking-wide">Done</button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const DriverDetailsModal = ({ driver, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('Profile');
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const { data: bookings, isLoading: isLoadingBookings } = useQuery({
        queryKey: ['driver-bookings', driver?.driver_id],
        queryFn: async () => {
            const res = await axiosPublic.get(`/bookingRoutes/getDriverBookings/${driver?.driver_id}`);
            return res.data;
        },
        enabled: isOpen && activeTab === 'Trip History'
    });

    const { data: reviews, isLoading: isLoadingReviews } = useQuery({
        queryKey: ['driver-reviews', driver?.driver_id],
        queryFn: async () => {
            const res = await axiosPublic.get(`/reviewRoutes/getReceivedReviews/driver/${driver?.driver_id}`);
            return res.data;
        },
        enabled: isOpen && activeTab === 'Reviews'
    });

    const handleSuspend = async () => {
        if (window.confirm("Are you sure you want to suspend this driver? They will lose access immediately.")) {
            try {
                await axiosPublic.patch(`/driverRoutes/suspend/${driver.driver_id}`);
                toast.success('Driver suspended successfully');
                queryClient.invalidateQueries(['agency-drivers']);
                onClose();
            } catch (err) {
                toast.error('Failed to suspend driver');
            }
        }
    };

    const handleRemoveFromAgency = async () => {
        if (window.confirm("This will remove the driver from your agency roster. Continue?")) {
            try {
                await axiosPublic.patch(`/driverRoutes/remove-from-agency/${driver.driver_id}`);
                toast.success('Driver removed from agency');
                queryClient.invalidateQueries(['agency-drivers']);
                onClose();
            } catch (err) {
                toast.error('Failed to remove driver');
            }
        }
    };

    if (!isOpen) return null;

    const tabs = ['Profile', 'Trip History', 'Reviews', 'Documents', 'Danger Zone'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl relative overflow-hidden flex flex-col h-[90vh]">
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10 text-gray-500">
                    <X size={20} />
                </button>

                {/* Left Sidebar Header */}
                <div className="flex h-full">
                    <div className="w-80 bg-gray-50 border-r border-gray-100 p-8 flex flex-col">
                        <div className="text-center mb-10">
                            <div className="relative inline-block mb-4">
                                <img src={driver.photo || 'https://via.placeholder.com/150'} className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl mx-auto" />
                                {driver.verified && <CheckCircle2 className="absolute -bottom-2 -right-2 text-green-500 bg-white rounded-full p-0.5 shadow-md" size={32} />}
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">{driver.name}</h2>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mt-1">ID: {driver.driver_id}</p>
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${driver.accountstatus === 'Active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    {driver.accountstatus}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${driver.availability ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                    {driver.availability ? 'Available' : 'Booked'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1.5 flex-grow">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all text-sm ${activeTab === tab ? 'bg-white text-orange-600 shadow-sm border border-orange-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {tab === 'Profile' && <Users size={18} />}
                                    {tab === 'Trip History' && <History size={18} />}
                                    {tab === 'Reviews' && <Star size={18} />}
                                    {tab === 'Documents' && <FileText size={18} />}
                                    {tab === 'Danger Zone' && <ShieldAlert size={18} />}
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-200">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 text-center">AGENCY MANAGED</p>
                            <p className="text-center font-bold text-gray-800 text-sm">Registered 2026</p>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-grow flex flex-col">
                        <div className="p-10 overflow-y-auto flex-grow">
                            {activeTab === 'Profile' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <section>
                                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6">PERSONAL DETAILS</h4>
                                        <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Gender</p>
                                                <p className="text-gray-800 font-bold">{driver.gender}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Date of Birth</p>
                                                <p className="text-gray-800 font-bold">{format(new Date(driver.dob), 'MMMM dd, yyyy')}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">NID Number</p>
                                                <p className="text-gray-800 font-bold">{driver.nid}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Address</p>
                                                <p className="text-gray-800 font-bold leading-snug">{driver.city}, {driver.area}, {driver.postcode}</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6">PROFESSIONAL QUALIFICATION</h4>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FileText /></div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">License No.</p>
                                                    <p className="font-black text-gray-800">{driver.license_number}</p>
                                                </div>
                                            </div>
                                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Briefcase /></div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Experience</p>
                                                    <p className="font-black text-gray-800">{driver.experience_year} Years</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex items-center justify-between bg-orange-600 p-6 rounded-2xl shadow-lg shadow-orange-100">
                                            <div>
                                                <p className="text-[10px] text-orange-100 font-bold uppercase tracking-widest">Hiring Price per Day</p>
                                                <p className="text-3xl font-black text-white">৳{driver.rental_price}</p>
                                            </div>
                                            <div className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-bold text-sm">
                                                Active Pricing
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'Trip History' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-4 gap-4 mb-8">
                                        <div className="bg-gray-50 p-4 rounded-2xl text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Trips</p>
                                            <p className="text-2xl font-black text-gray-800">{bookings?.length || 0}</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-2xl text-center">
                                            <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Completed</p>
                                            <p className="text-2xl font-black text-green-700">{bookings?.filter(b => b.status === 'Completed').length || 0}</p>
                                        </div>
                                        <div className="bg-red-50 p-4 rounded-2xl text-center">
                                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Cancelled</p>
                                            <p className="text-2xl font-black text-red-700">{bookings?.filter(b => b.status === 'Cancelled').length || 0}</p>
                                        </div>
                                        <div className="bg-blue-50 p-4 rounded-2xl text-center">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Earnings</p>
                                            <p className="text-2xl font-black text-blue-700">৳{bookings?.reduce((acc, curr) => acc + (curr.total_cost || 0), 0) || 0}</p>
                                        </div>
                                    </div>

                                    {isLoadingBookings ? <Loader /> : !bookings || bookings.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4"><History className="text-gray-300" /></div>
                                            <h5 className="font-bold text-gray-800">No trips assigned yet</h5>
                                            <p className="text-sm text-gray-400">Assigned trips will appear here.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                                                        <th className="pb-4">Booking ID</th>
                                                        <th className="pb-4">Vehicle</th>
                                                        <th className="pb-4">Dates</th>
                                                        <th className="pb-4">Earnings</th>
                                                        <th className="pb-4">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {bookings.map(booking => (
                                                        <tr key={booking.booking_id} className="group">
                                                            <td className="py-4 font-bold text-gray-800 text-sm font-mono">{booking.booking_id}</td>
                                                            <td className="py-4">
                                                                <p className="font-bold text-gray-800 text-sm">{booking.brand} {booking.model}</p>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{booking.vehicle_type}</p>
                                                            </td>
                                                            <td className="py-4">
                                                                <p className="font-bold text-gray-800 text-sm">{format(new Date(booking.start_ts), 'MMM dd')} - {format(new Date(booking.end_ts), 'MMM dd')}</p>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{booking.total_rent_hours} Hours</p>
                                                            </td>
                                                            <td className="py-4 font-black text-orange-600">৳{booking.total_cost}</td>
                                                            <td className="py-4">
                                                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                                    booking.status === 'Completed' ? 'bg-blue-50 text-blue-600' :
                                                                    booking.status === 'Confirmed' ? 'bg-green-50 text-green-600' :
                                                                    booking.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                                                                    'bg-amber-50 text-amber-600'
                                                                }`}>
                                                                    {booking.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Reviews' && (
                                <div>
                                    <div className="flex items-center gap-12 mb-10 bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                        <div className="text-center space-y-1">
                                            <p className="text-5xl font-black text-gray-900 leading-tight">{Number(driver.rating).toFixed(1)}</p>
                                            <div className="flex justify-center text-amber-500">
                                                {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= Math.round(driver.rating) ? "currentColor" : "none"} />)}
                                            </div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{driver.rating_count} Reviews</p>
                                        </div>
                                        <div className="flex-grow space-y-2">
                                            {[5,4,3,2,1].map(s => (
                                                <div key={s} className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-gray-400 w-4">{s}★</span>
                                                    <div className="flex-grow h-2 bg-white rounded-full overflow-hidden border border-gray-100">
                                                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(reviews?.filter(r => Math.round(r.rating) === s).length / (reviews?.length || 1)) * 100}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-800 w-8">{reviews?.filter(r => Math.round(r.rating) === s).length || 0}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {isLoadingReviews ? <Loader /> : !reviews || reviews.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                            <Star className="text-gray-300 mx-auto mb-4" size={48} />
                                            <h5 className="font-bold text-gray-800">No reviews yet</h5>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {reviews.map(review => (
                                                <div key={review.review_id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-orange-100 text-orange-600 font-black rounded-full flex items-center justify-center">
                                                                {review.name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-800">{review.name}</p>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{format(new Date(review.date), 'MMM dd, yyyy')}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex text-amber-500">
                                                            {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= review.rating ? "currentColor" : "none"} />)}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 italic leading-relaxed">"{review.review}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Documents' && (
                                <div className="space-y-8">
                                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 relative overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-center mb-8">
                                                <h4 className="text-lg font-black text-gray-900 tracking-tight">Driving License</h4>
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${driver.license_status === 'Valid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                    {driver.license_status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-12">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Number</p>
                                                    <p className="text-xl font-mono font-black text-gray-800 tracking-wider">{driver.license_number}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Expiry Date</p>
                                                    <p className="text-xl font-black text-gray-800">{format(new Date(driver.expire_date), 'MMM dd, yyyy')}</p>
                                                </div>
                                            </div>

                                            <div className="mt-10 flex items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200">
                                                <div className={`p-4 rounded-xl ${differenceInDays(new Date(driver.expire_date), new Date()) > 30 ? 'bg-green-50 text-green-600' : differenceInDays(new Date(driver.expire_date), new Date()) > 7 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                                    <Calendar />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 font-medium">Time until expiry</p>
                                                    <p className="text-lg font-black text-gray-800">{Math.max(0, differenceInDays(new Date(driver.expire_date), new Date()))} Days Remaining</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-8 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-center opacity-50">
                                            <div className="p-3 bg-gray-50 text-gray-400 rounded-xl mb-3"><Upload /></div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">NID Scan Copy</p>
                                            <p className="text-[10px] text-gray-300 mt-1">Pending Upload</p>
                                        </div>
                                        <div className="p-8 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-center opacity-50">
                                            <div className="p-3 bg-gray-50 text-gray-400 rounded-xl mb-3"><Upload /></div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Character Certificate</p>
                                            <p className="text-[10px] text-gray-300 mt-1">Pending Upload</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Danger Zone' && (
                                <div className="space-y-8 animate-in zoom-in-95 duration-300">
                                    <div className="bg-orange-50 p-8 rounded-[2rem] border border-orange-100">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="text-lg font-black text-orange-900 tracking-tight">Account Availability</h4>
                                                <p className="text-sm text-orange-700/70 font-medium max-w-md mt-1">Temporarily toggle driver availability for bookings. They will still remain in your agency.</p>
                                            </div>
                                            <div className="relative inline-block w-16 h-8">
                                                <input 
                                                    type="checkbox" 
                                                    checked={driver.availability} 
                                                    onChange={async () => {
                                                        try {
                                                            await axiosPublic.patch(`/driverRoutes/availability/${driver.driver_id}`, { availability: !driver.availability });
                                                            toast.success(`Driver is now ${!driver.availability ? 'Available' : 'Unavailable'}`);
                                                            queryClient.invalidateQueries(['agency-drivers']);
                                                        } catch (err) { toast.error('Failed to update availability'); }
                                                    }}
                                                    className="peer appearance-none w-full h-full bg-gray-200 rounded-full checked:bg-orange-600 transition-colors cursor-pointer outline-none"
                                                />
                                                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform pointer-events-none peer-checked:translate-x-8 shadow-sm"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-lg font-black text-red-900 tracking-tight">Suspend Account</h4>
                                                <p className="text-sm text-red-700/70 font-medium max-w-sm mt-1">The driver will lose all access to their dashboard and cannot be assigned to any trips.</p>
                                            </div>
                                            <button 
                                                onClick={handleSuspend}
                                                className="px-6 py-2.5 border-2 border-red-600 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                            >SUSPEND ACCOUNT</button>
                                        </div>
                                        <div className="pt-6 border-t border-red-200 flex justify-between items-start">
                                            <div>
                                                <h4 className="text-lg font-black text-red-900 tracking-tight">Remove from Agency</h4>
                                                <p className="text-sm text-red-700/70 font-medium max-w-sm mt-1">Permanently remove this driver from your agency roster. They can be picked up by another agency.</p>
                                            </div>
                                            <button 
                                                onClick={handleRemoveFromAgency}
                                                className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                                            >REMOVE DRIVER</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// --- Main Page Component ---

const AgencyDrivers = () => {
    const axiosPublic = useAxiosPublic();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        availability: 'All',
        verification: 'All',
        license: 'All',
        sortBy: 'Rating (High→Low)'
    });

    // 1. Fetch Agency Profile for Agency ID
    const { data: agencyProfile } = useQuery({
        queryKey: ['agency-profile', user?.email],
        queryFn: async () => {
            const res = await axiosPublic.get(`/agencyRoutes/agency-profile/${user?.email}`);
            return res.data;
        },
        enabled: !!user?.email
    });

    // 2. Fetch Drivers
    const { data: drivers, isLoading } = useQuery({
        queryKey: ['agency-drivers', user?.email],
        queryFn: async () => {
            const response = await axiosPublic.get(`driverRoutes/agencyDrivers/${user?.email}`);
            return response.data;
        },
        enabled: !!user?.email
    });

    const stats = useMemo(() => {
        if (!drivers) return { total: 0, verified: 0, available: 0, avgRating: 0 };
        const total = drivers.length;
        const verified = drivers.filter(d => d.verified).length;
        const available = drivers.filter(d => d.availability).length;
        const avgRating = total > 0 ? drivers.reduce((acc, d) => acc + Number(d.rating), 0) / total : 0;
        return { total, verified, available, avgRating };
    }, [drivers]);

    const filteredDrivers = useMemo(() => {
        if (!drivers) return [];
        let result = drivers.filter(d => 
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.phone.includes(searchTerm) ||
            d.driver_id.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filters.availability !== 'All') {
            result = result.filter(d => filters.availability === 'Available' ? d.availability : !d.availability);
        }
        if (filters.verification !== 'All') {
            result = result.filter(d => filters.verification === 'Verified' ? d.verified : !d.verified);
        }
        if (filters.license !== 'All') {
            result = result.filter(d => d.license_status === filters.license);
        }

        // Sorting
        switch (filters.sortBy) {
            case 'Rating (High→Low)': result.sort((a, b) => b.rating - a.rating); break;
            case 'Experience (High→Low)': result.sort((a, b) => b.experience_year - a.experience_year); break;
            case 'Price (Low→High)': result.sort((a, b) => a.rental_price - b.rental_price); break;
            case 'Price (High→Low)': result.sort((a, b) => b.rental_price - a.rental_price); break;
            case 'Newest First': result.sort((a, b) => b.driver_id.localeCompare(a.driver_id)); break;
        }

        return result;
    }, [drivers, searchTerm, filters]);

    if (isLoading) return <div className="flex justify-center items-center py-40"><Loader /></div>;

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <Helmet>
                <title>My Drivers | GoCar Agency Dashboard</title>
                <meta name="description" content="Manage and monitor your agency's professional drivers on GoCar." />
            </Helmet>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">MY DRIVERS</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage and monitor your agency's professional drivers.</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-2xl font-black shadow-xl shadow-orange-100 hover:bg-orange-700 hover:-translate-y-1 transition-all active:scale-95 uppercase tracking-wider"
                >
                    <UserPlus size={24} /> ADD NEW DRIVER
                </button>
            </div>

            {/* Stats Summary Bar */}
            <div className="flex flex-wrap gap-4 mb-8">
                <StatChip label="Total Drivers" value={stats.total} type="total" />
                <StatChip label="Verified" value={stats.verified} type="verified" />
                <StatChip label="Available" value={stats.available} type="available" />
                <StatChip label="Avg. Rating" value={stats.avgRating.toFixed(2)} type="rating" suffix=" ⭐" />
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-10 flex flex-wrap gap-6 items-end">
                <div className="flex-grow min-w-[300px]">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Search Drivers</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name, email, phone or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 outline-none transition-all font-medium text-gray-700"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    {[
                        { label: 'Availability', key: 'availability', options: ['All', 'Available', 'Unavailable'] },
                        { label: 'Verification', key: 'verification', options: ['All', 'Verified', 'Unverified'] },
                        { label: 'License', key: 'license', options: ['All', 'Valid', 'Expired', 'Suspended'] },
                        { label: 'Sort By', key: 'sortBy', options: ['Rating (High→Low)', 'Experience (High→Low)', 'Price (Low→High)', 'Price (High→Low)', 'Newest First'] }
                    ].map(f => (
                        <div key={f.key} className="min-w-[160px]">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{f.label}</label>
                            <select 
                                value={filters[f.key]}
                                onChange={(e) => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 outline-none transition-all font-bold text-gray-700 appearance-none"
                            >
                                {f.options.map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {/* Drivers Grid */}
            {!filteredDrivers || filteredDrivers.length === 0 ? (
                <div className="py-40 text-center bg-white rounded-[3rem] shadow-sm border border-gray-100">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                        <Users size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 tracking-tight">No drivers found</h3>
                    <p className="text-gray-400 font-medium mt-2">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <motion.div 
                    initial={false}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence>
                        {filteredDrivers.map((driver) => (
                            <DriverCard 
                                key={driver.driver_id} 
                                driver={driver} 
                                onViewDetails={(d) => setSelectedDriver(d)}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Modals */}
            <AddDriverModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                agencyId={agencyProfile?.agency_id}
            />
            
            {selectedDriver && (
                <DriverDetailsModal 
                    driver={selectedDriver} 
                    isOpen={!!selectedDriver} 
                    onClose={() => setSelectedDriver(null)} 
                />
            )}
        </div>
    );
};

// Mock Helmet for SEO if not installed
const Helmet = ({ children }) => {
    const title = children.find(c => c.type === 'title')?.props.children;
    if (title) document.title = title;
    return <>{children}</>;
};

export default AgencyDrivers;
