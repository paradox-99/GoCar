/* eslint-disable react/prop-types */
import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Star, Camera,
    Edit3, Save, X, ChevronDown, ChevronUp, Eye, EyeOff, LogOut, AlertTriangle, CheckCircle, Clock, Upload, RefreshCw, Car, DollarSign, AlertCircle, Info, Trash2 } from 'lucide-react';
import { format, differenceInDays, parseISO, isValid, differenceInYears } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider,
    signOut, sendEmailVerification } from 'firebase/auth';
import auth from '../../firebase/firebase.config';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d, fmt = 'MMM dd, yyyy') => {
    try { const p = typeof d === 'string' ? parseISO(d) : new Date(d); return isValid(p) ? format(p, fmt) : '—'; }
    catch { return '—'; }
};
const fmtAge = (dob) => {
    try {
        const p = typeof dob === 'string' ? parseISO(dob) : new Date(dob);
        if (!isValid(p)) return null;
        return differenceInYears(new Date(), p);
    } catch { return null; }
};
const fmtMoney = (v) => `৳${Number(v || 0).toLocaleString('en-IN')}`;
const maskNID = (nid, show) => {
    if (!nid) return '—';
    if (show) return nid;
    return nid.length > 4 ? 'XXXX-XXXX-' + nid.slice(-4) : nid;
};
const maskLicense = (lic, show) => {
    if (!lic) return '—';
    if (show) return lic;
    return lic.length > 4 ? 'DL-XXXX-' + lic.slice(-4) : lic;
};
const licenseCountdown = (expireDate) => {
    if (!expireDate) return null;
    const d = parseISO(expireDate);
    if (!isValid(d)) return null;
    const days = differenceInDays(d, new Date());
    if (days < 0) return { color: 'text-red-600', text: `Expired ${Math.abs(days)} days ago` };
    if (days < 7) return { color: 'text-red-600', text: `Expires in ${days} days — Urgent!` };
    if (days < 30) return { color: 'text-amber-600', text: `Expires soon — ${days} days left` };
    return { color: 'text-green-600', text: `${days} days remaining` };
};
const pwStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[!@#$%^&*]/.test(pw)) score++;
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (score <= 3) return { label: 'Fair', color: 'bg-amber-500', width: '66%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
};
const completionPct = (p) => {
    if (!p) return 0;
    const checks = [
        !!p.photo,
        !!(p.name && p.phone && p.gender && p.dob && p.nid),
        !!p.address_id,
        !!(p.license_number && p.expire_date),
        p.license_status === 'Valid',
        !!localStorage.getItem('driver_pw_changed'),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────

const Skel = ({ className }) => (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

// ─── Alert Banner ─────────────────────────────────────────────────────────────

const BANNER_COLORS = {
    red:    'bg-red-50 border-red-300 text-red-800',
    amber:  'bg-amber-50 border-amber-300 text-amber-800',
    orange: 'bg-orange-50 border-orange-300 text-orange-800',
    blue:   'bg-blue-50 border-blue-300 text-blue-800',
};

const AlertBanner = ({ type, icon: Icon, message, action, onAction, onDismiss }) => (
    <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
        className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${BANNER_COLORS[type]}`}
    >
        <Icon size={16} className="mt-0.5 flex-shrink-0" />
        <span className="flex-1">{message}</span>
        {action && <button onClick={onAction} className="underline font-semibold whitespace-nowrap">{action} →</button>}
        <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100"><X size={14} /></button>
    </motion.div>
);

// ─── Stars ────────────────────────────────────────────────────────────────────

const Stars = ({ rating, size = 16 }) => (
    <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={size} fill={i <= Math.round(rating) ? '#F59E0B' : 'none'} stroke="#F59E0B" />
        ))}
    </span>
);

// ─── Rating Bar ──────────────────────────────────────────────────────────────

const RatingBar = ({ label, count, total }) => {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-5 text-gray-500 shrink-0">{label}★</span>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-5 text-right text-gray-500">{count}</span>
        </div>
    );
};

// ─── Toggle ───────────────────────────────────────────────────────────────────

const Toggle = ({ on, onClick }) => (
    <button onClick={onClick}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${on ? 'bg-green-500' : 'bg-gray-300'}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${on ? 'left-7' : 'left-1'}`} />
    </button>
);

// ─── Tab ──────────────────────────────────────────────────────────────────────

const Tab = ({ label, active, onClick }) => (
    <button onClick={onClick}
        className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            active ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}>
        {label}
    </button>
);

// ─── Field Row (view mode) ────────────────────────────────────────────────────

const FieldRow = ({ label, value, extra }) => (
    <div className="py-3 border-b border-gray-100 last:border-0">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value || <span className="text-gray-400 italic">Not provided</span>}</p>
        {extra && <p className="text-xs text-gray-500 mt-0.5">{extra}</p>}
    </div>
);

// ─── Form Field ───────────────────────────────────────────────────────────────

const FormField = ({ label, error, children }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
        {children}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

const inp = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white';
const selInp = `${inp}`;

// ─── Section Head ─────────────────────────────────────────────────────────────

const SectionHead = ({ title, editing, onEdit, onSave, onCancel, saving }) => (
    <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-800">{title}</h3>
        {!editing ? (
            <button onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                <Edit3 size={12} /> Edit
            </button>
        ) : (
            <div className="flex gap-2">
                <button onClick={onCancel}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                </button>
                <button onClick={onSave} disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-60">
                    {saving ? <RefreshCw size={11} className="animate-spin" /> : <Save size={11} />}
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </div>
        )}
    </div>
);

// ─── Personal Tab ────────────────────────────────────────────────────────────

const PersonalTab = ({ profile, driverId, onSaved }) => {
    const axiosPublic = useAxiosPublic();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showNID, setShowNID] = useState(false);
    const [form, setForm] = useState({});

    const startEdit = () => {
        setForm({
            name: profile.name || '',
            phone: profile.phone || '',
            gender: profile.gender || '',
            dob: profile.dob ? profile.dob.split('T')[0] : '',
            nid: profile.nid || '',
        });
        setEditing(true);
    };
    const cancel = () => setEditing(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const save = async () => {
        if (!form.name?.trim()) return toast.error('Name is required');
        if (!form.phone?.match(/^\d{11}$/)) return toast.error('Phone must be 11 digits');
        if (form.dob && fmtAge(form.dob) < 18) return toast.error('Must be at least 18 years old');
        setSaving(true);
        try {
            await axiosPublic.patch(`/driverProfile/personal/${driverId}`, form, { withCredentials: true });
            toast.success('Personal info updated');
            setEditing(false);
            onSaved();
        } catch { toast.error('Failed to update'); }
        finally { setSaving(false); }
    };

    const age = fmtAge(profile.dob);

    if (!editing) return (
        <div>
            <SectionHead title="Personal Information" editing={false} onEdit={startEdit} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <FieldRow label="Full Name" value={profile.name} />
                <FieldRow label="Email Address" value={profile.email} extra="Used for login" />
                <FieldRow label="Phone Number" value={profile.phone} />
                <FieldRow label="Gender" value={profile.gender} />
                <FieldRow
                    label="Date of Birth"
                    value={profile.dob ? `${fmtDate(profile.dob)} ${age ? `(${age} years)` : ''}` : null}
                />
                <div className="py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">NID Number</p>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-800">{maskNID(profile.nid, showNID)}</p>
                        {profile.nid && (
                            <button onClick={() => setShowNID(s => !s)} className="text-gray-400 hover:text-gray-600">
                                {showNID ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <SectionHead title="Personal Information" editing onEdit={startEdit} onSave={save} onCancel={cancel} saving={saving} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Full Name *">
                    <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} />
                </FormField>
                <FormField label="Phone Number *">
                    <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} maxLength={11} />
                </FormField>
                <FormField label="Gender">
                    <select className={selInp} value={form.gender} onChange={e => set('gender', e.target.value)}>
                        <option value="">Select gender</option>
                        <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
                    </select>
                </FormField>
                <FormField label="Date of Birth">
                    <input type="date" className={inp} value={form.dob} onChange={e => set('dob', e.target.value)}
                        max={format(new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')} />
                </FormField>
                <FormField label="NID Number">
                    <input className={inp} value={form.nid} onChange={e => set('nid', e.target.value)} maxLength={17} />
                </FormField>
            </div>
        </div>
    );
};

// ─── Address Tab ─────────────────────────────────────────────────────────────

const AddressTab = ({ profile, driverId, onSaved }) => {
    const axiosPublic = useAxiosPublic();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({});

    const startEdit = () => {
        setForm({ city: profile.city || '', area: profile.area || '', postcode: profile.postcode || '' });
        setEditing(true);
    };
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const save = async () => {
        if (!form.city?.trim()) return toast.error('City is required');
        if (!form.area?.trim()) return toast.error('Area is required');
        setSaving(true);
        try {
            await axiosPublic.patch(`/driverProfile/address/${driverId}`,
                { ...form, addressId: profile.address_id }, { withCredentials: true });
            toast.success('Address updated');
            setEditing(false);
            onSaved();
        } catch { toast.error('Failed to update address'); }
        finally { setSaving(false); }
    };

    if (!profile.address_id && !editing) return (
        <div>
            <SectionHead title="Address" editing={false} onEdit={startEdit} />
            <div className="flex flex-col items-center py-10 text-gray-400">
                <MapPin size={40} className="mb-2" />
                <p className="text-sm">No address on file</p>
                <button onClick={startEdit} className="mt-3 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                    Add Address
                </button>
            </div>
        </div>
    );

    if (!editing) return (
        <div>
            <SectionHead title="Address" editing={false} onEdit={startEdit} />
            <div className="border border-gray-200 rounded-xl p-5 space-y-2">
                <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-gray-800">{profile.area}, {profile.city}</p>
                        {profile.postcode && <p className="text-xs text-gray-500">Postcode: {profile.postcode}</p>}
                    </div>
                </div>
                {profile.latitude && profile.longitude && (
                    <a href={`https://maps.google.com/?q=${profile.latitude},${profile.longitude}`}
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-500 underline mt-1">
                        <MapPin size={12} /> View on Map
                    </a>
                )}
            </div>
            <p className="text-xs text-gray-400 mt-3">Your address helps agencies find local drivers for bookings.</p>
        </div>
    );

    return (
        <div>
            <SectionHead title="Address" editing onSave={save} onCancel={() => setEditing(false)} saving={saving} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="City *">
                    <input className={inp} value={form.city} onChange={e => set('city', e.target.value)} />
                </FormField>
                <FormField label="Area *">
                    <input className={inp} value={form.area} onChange={e => set('area', e.target.value)} />
                </FormField>
                <FormField label="Postcode">
                    <input className={inp} value={form.postcode} onChange={e => set('postcode', e.target.value)} />
                </FormField>
            </div>
            <p className="text-xs text-gray-400 mt-3">Your address helps agencies find local drivers for bookings.</p>
        </div>
    );
};

// ─── License Tab ──────────────────────────────────────────────────────────────

const LicenseTab = ({ profile, driverId, onSaved }) => {
    const axiosPublic = useAxiosPublic();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showLic, setShowLic] = useState(false);
    const [form, setForm] = useState({});

    const startEdit = () => {
        setForm({
            license_number: profile.license_number || '',
            license_status: profile.license_status || 'Valid',
            expire_date: profile.expire_date ? profile.expire_date.split('T')[0] : '',
            experience_year: profile.experience_year ?? '',
            rental_price: profile.rental_price ?? '',
        });
        setEditing(true);
    };
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const save = async () => {
        setSaving(true);
        try {
            await axiosPublic.patch(`/driverProfile/license/${driverId}`, form, { withCredentials: true });
            toast.success('License & professional info updated');
            setEditing(false);
            onSaved();
        } catch { toast.error('Failed to update'); }
        finally { setSaving(false); }
    };

    const countdown = licenseCountdown(profile.expire_date);
    const isExpiredForm = form.expire_date && differenceInDays(parseISO(form.expire_date), new Date()) < 0;

    if (!editing) return (
        <div className="space-y-6">
            <div>
                <SectionHead title="License & Professional Info" editing={false} onEdit={startEdit} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    <div className="py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">License Number</p>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800">{maskLicense(profile.license_number, showLic)}</p>
                            {profile.license_number && (
                                <button onClick={() => setShowLic(s => !s)} className="text-gray-400 hover:text-gray-600">
                                    {showLic ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">License Status</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            profile.license_status === 'Valid' ? 'bg-green-100 text-green-700' :
                            profile.license_status === 'Expired' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                        }`}>
                            {profile.license_status === 'Valid' ? <CheckCircle size={11} /> :
                             profile.license_status === 'Expired' ? <X size={11} /> : <AlertTriangle size={11} />}
                            {profile.license_status || '—'}
                        </span>
                    </div>
                    <div className="py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Expiry Date</p>
                        <p className="text-sm font-medium text-gray-800">{fmtDate(profile.expire_date)}</p>
                        {countdown && <p className={`text-xs mt-0.5 font-medium ${countdown.color}`}>{countdown.text}</p>}
                    </div>
                    <FieldRow label="Experience" value={profile.experience_year != null ? `${profile.experience_year} Years` : null} />
                    <FieldRow label="Daily Rental Price" value={profile.rental_price != null ? `৳${Number(profile.rental_price).toLocaleString('en-IN')}/Day` : null} />
                    <FieldRow label="Availability" value={profile.availability ? 'Available for bookings' : 'Not available'} />
                </div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                <p className="text-xs font-semibold text-gray-600 mb-1">Agency Affiliation</p>
                {profile.agency_name ? (
                    <>
                        <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">{profile.agency_name}</span>
                        {(profile.agency_city || profile.agency_area) && (
                            <p className="text-xs text-gray-500 mt-1">{profile.agency_area}, {profile.agency_city}</p>
                        )}
                    </>
                ) : (
                    <>
                        <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">Independent Driver</span>
                        <p className="text-xs text-gray-500 mt-1">You are not currently associated with any agency. Agencies can add you to their roster.</p>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div>
            <SectionHead title="License & Professional Info" editing onSave={save} onCancel={() => setEditing(false)} saving={saving} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="License Number">
                    <input className={inp} value={form.license_number} onChange={e => set('license_number', e.target.value)} />
                </FormField>
                <FormField label="License Status">
                    <select className={selInp} value={form.license_status} onChange={e => set('license_status', e.target.value)}>
                        <option>Valid</option><option>Expired</option><option>Suspended</option>
                    </select>
                </FormField>
                <FormField label="License Expiry Date">
                    <input type="date" className={inp} value={form.expire_date} onChange={e => set('expire_date', e.target.value)} />
                    {isExpiredForm && (
                        <p className="text-xs text-red-500 mt-1">⚠️ This date is in the past. Your license will be marked as Expired.</p>
                    )}
                </FormField>
                <FormField label="Years of Experience">
                    <input type="number" min="0" max="60" className={inp} value={form.experience_year} onChange={e => set('experience_year', e.target.value)} />
                </FormField>
                <FormField label="Daily Rental Price (৳)">
                    <input type="number" min="0" className={inp} value={form.rental_price} onChange={e => set('rental_price', e.target.value)} />
                </FormField>
            </div>
            <p className="text-xs text-gray-400 mt-4">Your agency affiliation can only be changed by your agency. Contact your agency manager for roster changes.</p>
        </div>
    );
};

// ─── Security Tab ─────────────────────────────────────────────────────────────

const SecurityTab = ({ driverId, onDeactivate }) => {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();

    const [showCur, setShowCur] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [curPw, setCurPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confPw, setConfPw] = useState('');
    const [pwSaving, setPwSaving] = useState(false);
    const [deactModal, setDeactModal] = useState(false);
    const [deactInput, setDeactInput] = useState('');
    const [deacting, setDeacting] = useState(false);

    const strength = pwStrength(newPw);
    const pwMatch = confPw && newPw === confPw;
    const pwChecks = [
        { label: 'At least 8 characters', ok: newPw.length >= 8 },
        { label: 'One uppercase letter', ok: /[A-Z]/.test(newPw) },
        { label: 'One lowercase letter', ok: /[a-z]/.test(newPw) },
        { label: 'One number', ok: /[0-9]/.test(newPw) },
        { label: 'One special character (!@#$%^&*)', ok: /[!@#$%^&*]/.test(newPw) },
    ];
    const canChangePw = pwChecks.every(c => c.ok) && pwMatch;

    const changePassword = async () => {
        setPwSaving(true);
        try {
            if (curPw) {
                const credential = EmailAuthProvider.credential(user.email, curPw);
                await reauthenticateWithCredential(user, credential);
            }
            await updatePassword(user, newPw);
            localStorage.setItem('driver_pw_changed', '1');
            toast.success('Password changed successfully. Use your new password next time you log in.');
            setCurPw(''); setNewPw(''); setConfPw('');
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                toast.error('Current password is incorrect');
            } else {
                toast.error('Failed to change password: ' + err.message);
            }
        } finally { setPwSaving(false); }
    };

    const confirmDeactivate = async () => {
        if (deactInput !== 'DEACTIVATE') return toast.error('Type DEACTIVATE to confirm');
        setDeacting(true);
        try {
            await axiosPublic.patch(`/driverProfile/deactivate/${driverId}`, {}, { withCredentials: true });
            await signOut(auth);
            onDeactivate();
        } catch { toast.error('Failed to deactivate account'); }
        finally { setDeacting(false); }
    };

    const lastSignIn = user?.metadata?.lastSignInTime;
    const creationTime = user?.metadata?.creationTime;

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-base font-bold text-gray-800 mb-1">Change Password</h3>
                <p className="text-xs text-gray-500 mb-5">Update your login password regularly to keep your account secure.</p>
                <div className="max-w-md space-y-4">
                    <FormField label="Current Password">
                        <div className="relative">
                            <input type={showCur ? 'text' : 'password'} className={inp + ' pr-10'} value={curPw} onChange={e => setCurPw(e.target.value)} />
                            <button onClick={() => setShowCur(s => !s)} className="absolute right-3 top-2.5 text-gray-400">
                                {showCur ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </FormField>
                    <FormField label="New Password">
                        <div className="relative">
                            <input type={showNew ? 'text' : 'password'} className={inp + ' pr-10'} value={newPw} onChange={e => setNewPw(e.target.value)} />
                            <button onClick={() => setShowNew(s => !s)} className="absolute right-3 top-2.5 text-gray-400">
                                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {newPw && (
                            <div className="mt-2 space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full ${strength.color} rounded-full transition-all`} style={{ width: strength.width }} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">{strength.label}</span>
                                </div>
                                <div className="space-y-1">
                                    {pwChecks.map((c, i) => (
                                        <p key={i} className={`text-xs flex items-center gap-1.5 ${c.ok ? 'text-green-600' : 'text-gray-400'}`}>
                                            <CheckCircle size={11} /> {c.label}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </FormField>
                    <FormField label="Confirm New Password">
                        <div className="relative">
                            <input type={showConf ? 'text' : 'password'} className={inp + ' pr-10'} value={confPw} onChange={e => setConfPw(e.target.value)} />
                            <button onClick={() => setShowConf(s => !s)} className="absolute right-3 top-2.5 text-gray-400">
                                {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {confPw && (
                            <p className={`text-xs mt-1 flex items-center gap-1 ${pwMatch ? 'text-green-600' : 'text-red-500'}`}>
                                {pwMatch ? <CheckCircle size={11} /> : <X size={11} />}
                                {pwMatch ? 'Passwords match' : 'Passwords do not match'}
                            </p>
                        )}
                    </FormField>
                    <button onClick={changePassword} disabled={!canChangePw || pwSaving}
                        className="w-full py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {pwSaving && <RefreshCw size={13} className="animate-spin" />}
                        Change Password
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-base font-bold text-gray-800 mb-1">Recent Login Activity</h3>
                <p className="text-xs text-gray-500 mb-3">Review recent sign-ins to your account.</p>
                <div className="space-y-2 max-w-md">
                    {lastSignIn && (
                        <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                            <span className="text-lg">🖥</span>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-700">Last sign-in: {new Date(lastSignIn).toLocaleString()}</p>
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">Current session</span>
                            </div>
                        </div>
                    )}
                    {creationTime && (
                        <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                            <span className="text-lg">📅</span>
                            <p className="text-xs text-gray-500">Account created: {new Date(creationTime).toLocaleString()}</p>
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-2">If you don&apos;t recognize any activity, change your password immediately.</p>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 max-w-md">
                <h3 className="text-xs font-semibold text-gray-600 mb-2">Linked Account</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-800">Email &amp; Password</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    {user?.emailVerified
                        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Email verified</span>
                        : <button onClick={() => sendEmailVerification(user).then(() => toast.success('Verification email sent'))}
                            className="text-xs text-blue-500 underline">Resend verification</button>}
                </div>
            </div>

            <div className="border-2 border-red-200 rounded-2xl p-5 max-w-md">
                <h3 className="text-sm font-bold text-red-700 mb-1 flex items-center gap-2"><AlertTriangle size={15} />Danger Zone</h3>
                <p className="text-xs text-gray-500 mb-3">Deactivating removes you from active duty. Your data is preserved.</p>
                <button onClick={() => setDeactModal(true)}
                    className="px-4 py-2 text-sm font-semibold border-2 border-red-400 text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                    Deactivate My Account
                </button>
            </div>

            <AnimatePresence>
                {deactModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setDeactModal(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle size={20} className="text-red-500" />
                                <h3 className="text-base font-bold text-gray-800">Deactivate your driver account?</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">You will be removed from active duty. Contact your agency to reactivate. Your data will be preserved.</p>
                            <FormField label='Type "DEACTIVATE" to confirm'>
                                <input className={inp} value={deactInput} onChange={e => setDeactInput(e.target.value)} placeholder="DEACTIVATE" />
                            </FormField>
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => setDeactModal(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button onClick={confirmDeactivate} disabled={deactInput !== 'DEACTIVATE' || deacting}
                                    className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {deacting && <RefreshCw size={13} className="animate-spin" />} Deactivate
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DriverProfile = () => {
    const { user, logOut } = useAuth();
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState(0);
    const [dismissed, setDismissed] = useState({});
    const [photoUploading, setPhotoUploading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [availToggling, setAvailToggling] = useState(false);
    const [availConfirm, setAvailConfirm] = useState(false);
    const [completionOpen, setCompletionOpen] = useState(false);
    const [logoutConfirm, setLogoutConfirm] = useState(false);
    const fileInputRef = useRef(null);

    const { data: profile, isLoading } = useQuery({
        queryKey: ['driverFullProfile', user?.email],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverProfile/full/${user.email}`, { withCredentials: true });
            return r.data;
        },
        enabled: !!user?.email,
    });

    const refresh = () => queryClient.invalidateQueries(['driverFullProfile', user?.email]);

    // Alert banner conditions
    const banners = profile ? [
        profile.license_status === 'Expired' && {
            id: 'licExpired', type: 'red', icon: AlertTriangle,
            message: `Your driver's license expired on ${fmtDate(profile.expire_date)}. Update your license details immediately to continue accepting trips.`,
            action: 'Update Now', onAction: () => setActiveTab(2),
        },
        profile.license_status !== 'Expired' && profile.expire_date &&
            differenceInDays(parseISO(profile.expire_date), new Date()) <= 30 &&
            differenceInDays(parseISO(profile.expire_date), new Date()) >= 0 && {
            id: 'licExpiring', type: 'amber', icon: AlertCircle,
            message: `Your driver's license expires on ${fmtDate(profile.expire_date)} (${differenceInDays(parseISO(profile.expire_date), new Date())} days remaining). Update before it expires.`,
            action: 'Update Now', onAction: () => setActiveTab(2),
        },
        !profile.verified && {
            id: 'notVerified', type: 'amber', icon: Clock,
            message: 'Your account is pending verification by the agency. Some features may be restricted until verified.',
        },
        (!profile.photo || !profile.phone || !profile.nid || !profile.address_id || !profile.license_number) && {
            id: 'incomplete', type: 'orange', icon: Info,
            message: 'Your profile is incomplete. Complete your profile to improve your chances of getting bookings.',
            action: 'Complete Now', onAction: () => setCompletionOpen(true),
        },
    ].filter(Boolean) : [];

    const visibleBanners = banners.filter(b => !dismissed[b.id]);
    const dismiss = (id) => setDismissed(d => ({ ...d, [id]: true }));

    // Photo upload
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const uploadPhoto = async () => {
        if (!photoFile) return;
        setPhotoUploading(true);
        try {
            const key = import.meta.env.VITE_IMGBB_API_KEY;
            if (!key) throw new Error('ImgBB key not configured');
            const fd = new FormData();
            fd.append('image', photoFile);
            const resp = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: 'POST', body: fd });
            const json = await resp.json();
            if (!json.success) throw new Error('Upload failed');
            const url = json.data.url;
            await axiosPublic.patch(`/driverProfile/photo/${profile.driver_id}`, { photo: url }, { withCredentials: true });
            toast.success('Profile photo updated');
            setPhotoPreview(null);
            setPhotoFile(null);
            refresh();
        } catch (err) { toast.error('Photo upload failed: ' + err.message); }
        finally { setPhotoUploading(false); }
    };

    const toggleAvailability = async () => {
        if (profile.availability) { setAvailConfirm(true); return; }
        setAvailToggling(true);
        try {
            await axiosPublic.patch(`/driverRoutes/availability/${profile.driver_id}`, { availability: true }, { withCredentials: true });
            refresh();
        } catch { toast.error('Failed to update availability'); }
        finally { setAvailToggling(false); }
    };

    const confirmUnavailable = async () => {
        setAvailToggling(true);
        setAvailConfirm(false);
        try {
            await axiosPublic.patch(`/driverRoutes/availability/${profile.driver_id}`, { availability: false }, { withCredentials: true });
            refresh();
        } catch { toast.error('Failed to update availability'); }
        finally { setAvailToggling(false); }
    };

    const pct = completionPct(profile);
    const pctColor = pct < 50 ? 'bg-red-500' : pct < 80 ? 'bg-amber-500' : 'bg-green-500';

    const completionChecks = profile ? [
        { label: 'Profile photo uploaded', done: !!profile.photo, tab: 0, label2: 'Upload photo' },
        { label: 'Personal info complete', done: !!(profile.name && profile.phone && profile.gender && profile.dob && profile.nid), tab: 0 },
        { label: 'Address added', done: !!profile.address_id, tab: 1 },
        { label: 'License details added', done: !!(profile.license_number && profile.expire_date), tab: 2 },
        { label: 'Valid license status', done: profile.license_status === 'Valid', tab: 2 },
        { label: 'Password changed from temporary', done: !!localStorage.getItem('driver_pw_changed'), tab: 3 },
    ] : [];

    const TABS = ['Personal Info', 'Address', 'License & Professional', 'Security'];

    if (isLoading) return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <Skel className="h-8 w-40 mb-6" />
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-72 space-y-4">
                    <Skel className="h-64 rounded-2xl" />
                    <Skel className="h-32 rounded-2xl" />
                </div>
                <div className="flex-1">
                    <Skel className="h-10 mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                        {[1,2,3,4,5,6].map(i => <Skel key={i} className="h-14 rounded-xl" />)}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-6xl mx-auto space-y-5">

                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-black text-gray-900">My Profile</h1>
                    <p className="text-sm text-gray-500">Manage your personal information and account settings.</p>
                </div>

                {/* Alert Banners */}
                <AnimatePresence>
                    {visibleBanners.map(b => (
                        <AlertBanner key={b.id} {...b} onDismiss={() => dismiss(b.id)} />
                    ))}
                </AnimatePresence>

                {/* Main Layout */}
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ── Left Sidebar ── */}
                    <div className="lg:w-72 shrink-0 space-y-4">

                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">

                            {/* Avatar */}
                            <div className="flex flex-col items-center">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-100 shadow">
                                        {(photoPreview || profile?.photo) ? (
                                            <img src={photoPreview || profile.photo} alt="avatar"
                                                className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                                <span className="text-3xl font-bold text-white">
                                                    {(profile?.name || '?').charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera size={18} className="text-white" />
                                    </div>
                                    {photoUploading && (
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                            <RefreshCw size={20} className="text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                                    className="hidden" onChange={handleFileSelect} />
                                {photoPreview && (
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={uploadPhoto} disabled={photoUploading}
                                            className="flex items-center gap-1 px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600">
                                            <Upload size={11} /> {photoUploading ? 'Uploading…' : 'Upload'}
                                        </button>
                                        <button onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                                            className="px-3 py-1 border border-gray-200 text-xs rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                                    </div>
                                )}
                                {!photoPreview && (
                                    <p className="text-xs text-gray-400 mt-1.5 cursor-pointer hover:text-orange-500"
                                        onClick={() => fileInputRef.current?.click()}>
                                        Change Photo
                                    </p>
                                )}
                            </div>

                            {/* Identity */}
                            <div className="text-center space-y-1.5">
                                <p className="text-base font-bold text-gray-900">{profile?.name}</p>
                                <p className="text-xs text-gray-400">{profile?.driver_id}</p>
                                <div className="flex flex-wrap gap-1.5 justify-center">
                                    {profile?.agency_name ? (
                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">{profile.agency_name}</span>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">Independent Driver</span>
                                    )}
                                    {profile?.verified
                                        ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle size={10} /> Verified</span>
                                        : <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs flex items-center gap-1"><Clock size={10} /> Pending Verification</span>
                                    }
                                </div>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    profile?.accountstatus === 'Active' ? 'bg-green-100 text-green-700' :
                                    profile?.accountstatus === 'Suspended' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-500'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                                        profile?.accountstatus === 'Active' ? 'bg-green-500' :
                                        profile?.accountstatus === 'Suspended' ? 'bg-red-500' : 'bg-gray-400'
                                    }`} />
                                    {profile?.accountstatus || 'Unknown'}
                                </span>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Rating */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Stars rating={profile?.ratingBreakdown?.avg || 0} size={14} />
                                    <span className="text-sm font-bold text-gray-800">
                                        {profile?.ratingBreakdown?.avg?.toFixed(2) || '0.00'}
                                    </span>
                                    <span className="text-xs text-gray-400">({profile?.ratingBreakdown?.total || 0} reviews)</span>
                                </div>
                                <div className="space-y-1">
                                    {[5,4,3,2,1].map(s => (
                                        <RatingBar key={s} label={s} count={profile?.ratingBreakdown?.[`r${s}`] || 0} total={profile?.ratingBreakdown?.total || 1} />
                                    ))}
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { icon: Car, label: 'Total Trips', value: profile?.stats?.totalTrips || 0 },
                                    { icon: CheckCircle, label: 'Completed', value: profile?.stats?.completedTrips || 0 },
                                    { icon: Star, label: 'Avg Rating', value: (profile?.ratingBreakdown?.avg || 0).toFixed(1) },
                                    { icon: DollarSign, label: 'Total Earned', value: fmtMoney(profile?.stats?.totalEarned) },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                                        <Icon size={15} className="mx-auto mb-1 text-orange-500" />
                                        <p className="text-xs font-bold text-gray-800 truncate">{value}</p>
                                        <p className="text-[10px] text-gray-400">{label}</p>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-gray-100" />

                            {/* Availability Toggle */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-semibold text-gray-700">Available for Bookings</p>
                                    <Toggle on={!!profile?.availability} onClick={availToggling ? undefined : toggleAvailability} />
                                </div>
                                <p className={`text-xs ${profile?.availability ? 'text-green-600' : 'text-gray-400'}`}>
                                    {profile?.availability
                                        ? 'You are currently accepting trip requests'
                                        : 'You are currently not accepting trips'}
                                </p>
                                <AnimatePresence>
                                    {availConfirm && (
                                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                                            <p className="font-medium text-gray-700 mb-2">Mark yourself as unavailable? You won `&apos;`t receive new booking requests.</p>
                                            <div className="flex gap-2">
                                                <button onClick={confirmUnavailable} className="flex-1 py-1 bg-orange-500 text-white rounded-lg font-medium">Confirm</button>
                                                <button onClick={() => setAvailConfirm(false)} className="flex-1 py-1 border border-gray-200 rounded-lg text-gray-600">Cancel</button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Profile Completion */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-gray-800">Profile {pct}% Complete</p>
                                <button onClick={() => setCompletionOpen(o => !o)} className="text-gray-400">
                                    {completionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                                <div className={`h-full ${pctColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                            </div>
                            <AnimatePresence>
                                {completionOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <div className="pt-2 space-y-1.5">
                                            {completionChecks.map((c, i) => (
                                                <button key={i} onClick={() => { if (!c.done) setActiveTab(c.tab); }}
                                                    className={`w-full flex items-center gap-2 text-left text-xs transition-colors rounded px-1 py-0.5 ${
                                                        c.done ? 'text-gray-400' : 'text-orange-600 hover:bg-orange-50'
                                                    }`}>
                                                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                                        c.done ? 'bg-green-500 border-green-500' : 'border-orange-400'
                                                    }`}>
                                                        {c.done && <CheckCircle size={10} className="text-white" />}
                                                    </span>
                                                    {c.label}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
                            <button onClick={() => setLogoutConfirm(true)}
                                className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                <LogOut size={15} /> Logout
                            </button>
                            <button onClick={() => setActiveTab(3)}
                                className="w-full text-xs text-red-400 hover:text-red-600 text-left px-1 transition-colors flex items-center gap-1">
                                <Trash2 size={11} /> Deactivate Account
                            </button>
                        </div>
                    </div>

                    {/* ── Right Main Area ── */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Tabs */}
                            <div className="border-b border-gray-100 overflow-x-auto">
                                <div className="flex px-4">
                                    {TABS.map((t, i) => <Tab key={t} label={t} active={activeTab === i} onClick={() => setActiveTab(i)} />)}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="p-5">
                                <AnimatePresence mode="wait">
                                    <motion.div key={activeTab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                                        {activeTab === 0 && <PersonalTab profile={profile} driverId={profile?.driver_id} onSaved={refresh} />}
                                        {activeTab === 1 && <AddressTab profile={profile} driverId={profile?.driver_id} onSaved={refresh} />}
                                        {activeTab === 2 && <LicenseTab profile={profile} driverId={profile?.driver_id} onSaved={refresh} />}
                                        {activeTab === 3 && <SecurityTab profile={profile} driverId={profile?.driver_id} onDeactivate={() => logOut()} />}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Confirm */}
            <AnimatePresence>
                {logoutConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setLogoutConfirm(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                            onClick={e => e.stopPropagation()}>
                            <h3 className="text-base font-bold text-gray-800 mb-2">Log out?</h3>
                            <p className="text-sm text-gray-500 mb-5">You will be signed out of your driver account.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setLogoutConfirm(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600">Cancel</button>
                                <button onClick={() => logOut()} className="flex-1 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600">Log Out</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DriverProfile;
