/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    Car, AlertTriangle, X, RefreshCw, Eye, Phone, MapPin, Calendar,
    DollarSign, CheckCircle, TrendingUp, TrendingDown, Copy, Star,
    Clock, Bell, AlertCircle, User, Settings, Zap, Shield,
    ChevronDown, ChevronUp, Activity, ToggleLeft, ToggleRight,
    ClipboardList, Wallet
} from 'lucide-react';
import {
    format, formatDistanceToNow, differenceInMinutes, differenceInDays,
    parseISO, isValid
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d, f = 'MMM dd, yyyy') => {
    try { const p = typeof d === 'string' ? parseISO(d) : new Date(d); return isValid(p) ? format(p, f) : '—'; }
    catch { return '—'; }
};
const fmtDateTime = (d) => fmtDate(d, 'MMM dd, yyyy HH:mm');
const fmtTime = (d) => fmtDate(d, 'HH:mm');
const fmtMoney = (v) => `৳${Number(v || 0).toLocaleString('en-IN')}`;
const safeParseISO = (d) => {
    try { const p = parseISO(d); return isValid(p) ? p : null; } catch { return null; }
};
const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text).then(() => toast.success('Copied!'));
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
const licenseCountdown = (expireDate) => {
    if (!expireDate) return null;
    const d = safeParseISO(expireDate);
    if (!d) return null;
    const days = differenceInDays(d, new Date());
    if (days < 0) return { type: 'expired', days: Math.abs(days) };
    return { type: days < 30 ? 'expiring' : 'ok', days };
};

// ─── Status Styles ────────────────────────────────────────────────────────────

const STATUS_STYLE = {
    running:   { bg: 'bg-orange-100 text-orange-700 border-orange-300', label: 'Ongoing',   glow: true  },
    ongoing:   { bg: 'bg-orange-100 text-orange-700 border-orange-300', label: 'Ongoing',   glow: true  },
    confirmed: { bg: 'bg-blue-100 text-blue-700 border-blue-300',       label: 'Confirmed', glow: false },
    completed: { bg: 'bg-green-100 text-green-700 border-green-300',    label: 'Completed', glow: false },
    cancelled: { bg: 'bg-red-100 text-red-700 border-red-300',          label: 'Cancelled', glow: false },
    pending:   { bg: 'bg-amber-100 text-amber-700 border-amber-300',    label: 'Pending',   glow: false },
    requested: { bg: 'bg-amber-100 text-amber-700 border-amber-300',    label: 'Pending',   glow: false },
};
const statusStyle = (s) => STATUS_STYLE[(s||'').toLowerCase()] ||
    { bg: 'bg-gray-100 text-gray-600 border-gray-200', label: s || '—', glow: false };

const tripBorderColor = (status) => {
    const s = (status||'').toLowerCase();
    if (s === 'ongoing' || s === 'running') return '#F97316';
    if (s === 'completed') return '#22C55E';
    if (s === 'cancelled') return '#EF4444';
    if (s === 'confirmed') return '#3B82F6';
    return '#D1D5DB';
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skel = ({ className = '' }) => (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

// ─── Stars ────────────────────────────────────────────────────────────────────

const Stars = ({ rating, size = 13 }) => (
    <span className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
            <Star key={i} size={size} fill={i <= Math.round(rating) ? '#F59E0B' : 'none'} stroke="#F59E0B" />
        ))}
    </span>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status, size = 'sm' }) => {
    const s = statusStyle(status);
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border ${s.bg} ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
            {s.glow && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
            {s.label}
        </span>
    );
};

// ─── Fuel Gauge ───────────────────────────────────────────────────────────────

const FuelGauge = ({ level }) => {
    const n = Number(level || 0);
    const color = n > 50 ? 'bg-green-500' : n >= 20 ? 'bg-amber-500' : 'bg-red-500';
    const text  = n > 50 ? 'text-green-600' : n >= 20 ? 'text-amber-600' : 'text-red-600';
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(n, 100)}%` }} />
            </div>
            <span className={`text-xs font-bold ${text}`}>{n}%</span>
        </div>
    );
};

// ─── Alert Banner ─────────────────────────────────────────────────────────────

const BCLR = {
    red:    'bg-red-50 border-red-300 text-red-800',
    amber:  'bg-amber-50 border-amber-300 text-amber-800',
    orange: 'bg-orange-50 border-orange-300 text-orange-800',
    blue:   'bg-blue-50 border-blue-300 text-blue-800',
    green:  'bg-green-50 border-green-300 text-green-800',
};
const AlertBanner = ({ type, icon: Icon, message, action, onAction, onDismiss, noDismiss, pulse }) => (
    <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
        className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${BCLR[type]} ${pulse ? 'ring-2 ring-amber-300' : ''}`}
    >
        <Icon size={15} className="mt-0.5 flex-shrink-0" />
        <span className="flex-1">{message}</span>
        {action && <button onClick={onAction} className="underline font-semibold whitespace-nowrap shrink-0">{action} →</button>}
        {!noDismiss && <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100 shrink-0"><X size={13} /></button>}
    </motion.div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, trend, trendLabel, color, pulse, extra, onClick }) => (
    <motion.button whileHover={{ y: -2 }} onClick={onClick}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left w-full hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
            <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={17} className="text-white" />
                {pulse && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white animate-ping" />}
            </div>
            {trend !== undefined && trend !== null && (
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {trendLabel || (trend >= 0 ? `+${trend}` : trend)}
                </span>
            )}
        </div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs font-semibold text-gray-700 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
        {extra && <div className="mt-1">{extra}</div>}
    </motion.button>
);

// ─── Quick Action Button ──────────────────────────────────────────────────────

const QuickActionBtn = ({ icon: Icon, label, badge, badgeColor = 'bg-red-500', onClick }) => (
    <button onClick={onClick}
        className="relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border-2 border-orange-200 bg-white hover:border-orange-400 hover:bg-orange-50 transition-all min-w-[80px] flex-shrink-0">
        {badge > 0 && (
            <span className={`absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${badgeColor}`}>
                {badge}
            </span>
        )}
        <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
            <Icon size={17} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{label}</span>
    </button>
);

// ─── Profile Completion Nudge ─────────────────────────────────────────────────

const ProfileCompletionNudge = ({ profile, navigate }) => {
    const pct = completionPct(profile);
    if (pct >= 80) return null;
    const steps = [
        { label: 'Photo',    done: !!profile?.photo },
        { label: 'Personal', done: !!(profile?.name && profile?.phone && profile?.gender && profile?.dob && profile?.nid) },
        { label: 'Address',  done: !!profile?.address_id },
        { label: 'License',  done: !!(profile?.license_number && profile?.expire_date) },
        { label: 'Password', done: !!localStorage.getItem('driver_pw_changed') },
    ];
    return (
        <div className="bg-white border-2 border-orange-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-sm font-bold text-gray-800">Complete Your Profile</p>
                    <p className="text-xs text-gray-500">Improve your chances of getting more trips</p>
                </div>
                <button onClick={() => navigate('/dashboard/driver/profile')}
                    className="px-3 py-1.5 text-xs font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-600">
                    Complete Profile →
                </button>
            </div>
            <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Profile {pct}% Complete</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {steps.map(s => (
                    <button key={s.label} onClick={() => navigate('/dashboard/driver/profile')}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                            s.done ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-500 hover:border-orange-400'
                        }`}>
                        {s.done ? '☑' : '☐'} {s.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ─── Active Trip Widget ───────────────────────────────────────────────────────

const ActiveTripWidget = ({ trip, onViewDetails }) => {
    const [, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(id);
    }, []);

    const start = safeParseISO(trip.start_ts);
    const end   = safeParseISO(trip.end_ts);
    const now   = new Date();
    const elapsedMins = start ? Math.max(0, differenceInMinutes(now, start)) : 0;
    const elapsedHrs  = Math.floor(elapsedMins / 60);
    const elapsedRem  = elapsedMins % 60;
    const remainMins  = end ? differenceInMinutes(end, now) : null;
    const isOverdue   = remainMins !== null && remainMins < 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-orange-400 ring-4 ring-orange-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Car size={15} className="text-white" />
                    <span className="text-xs font-black text-white tracking-widest uppercase">Active Trip</span>
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
                <button onClick={() => copyToClipboard(trip.booking_id)}
                    className="flex items-center gap-1 text-orange-100 hover:text-white text-xs font-mono">
                    #{trip.booking_id?.slice(0, 14)}… <Copy size={10} />
                </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Left: Timing */}
                <div className="space-y-2">
                    <StatusBadge status={trip.status} size="lg" />
                    {start && (
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Started At</p>
                            <p className="text-sm font-bold text-gray-800">{fmtDateTime(trip.start_ts)}</p>
                        </div>
                    )}
                    <div className="bg-orange-50 rounded-xl p-3 space-y-1.5">
                        <p className="text-xs text-orange-700 font-semibold flex items-center gap-1.5">
                            <Clock size={12} /> ⏱ {elapsedHrs}h {elapsedRem}m elapsed
                        </p>
                        {end && (
                            <p className="text-xs text-gray-600 font-medium">🏁 Ends: {fmtDateTime(trip.end_ts)}</p>
                        )}
                        {remainMins !== null && (
                            isOverdue
                                ? <p className="text-xs text-red-600 font-bold">⚠️ Trip is {Math.abs(remainMins)} mins overdue</p>
                                : <p className="text-xs text-gray-500">{Math.floor(remainMins / 60)}h {remainMins % 60}m remaining</p>
                        )}
                    </div>
                    {trip.booking_purpose && <p className="text-xs text-gray-400 italic">{trip.booking_purpose}</p>}
                    {trip.estimated_destination && (
                        <p className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin size={11} className="text-orange-400 shrink-0" />
                            <span className="truncate">{trip.estimated_destination}</span>
                        </p>
                    )}
                </div>

                {/* Center: Customer */}
                <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-black text-orange-600 border-2 border-orange-300">
                        {(trip.customer_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-base">{trip.customer_name || '—'}</p>
                        {trip.customer_phone && (
                            <a href={`tel:${trip.customer_phone}`} className="text-xs text-gray-500 hover:text-blue-500">
                                {trip.customer_phone}
                            </a>
                        )}
                    </div>
                    {trip.customer_phone && (
                        <a href={`tel:${trip.customer_phone}`}
                            className="flex items-center gap-1.5 px-4 py-1.5 border-2 border-green-500 text-green-600 rounded-xl text-xs font-bold hover:bg-green-50">
                            <Phone size={12} /> Call Customer
                        </a>
                    )}
                </div>

                {/* Right: Vehicle + Earnings */}
                <div className="space-y-2">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Vehicle</p>
                        <p className="font-bold text-gray-800">{trip.brand} {trip.model}</p>
                        {trip.vehicle_type && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{(trip.vehicle_type||'').toUpperCase()}</span>
                        )}
                    </div>
                    {trip.pickup && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] text-gray-400">⛽ Fuel at Pickup</p>
                            <FuelGauge level={trip.pickup.fuel_level} />
                            <p className="text-xs text-gray-600">🔢 Odometer: {trip.pickup.odometer_reading} km</p>
                        </div>
                    )}
                    {trip.driver_cost > 0 && (
                        <div className="bg-green-50 rounded-xl p-2.5">
                            <p className="text-[10px] text-gray-400">💰 Your Earnings</p>
                            <p className="text-lg font-black text-green-600">{fmtMoney(trip.driver_cost)}</p>
                        </div>
                    )}
                    <button onClick={() => onViewDetails(trip.booking_id)}
                        className="w-full py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 flex items-center justify-center gap-1.5">
                        <Eye size={13} /> View Full Trip Details
                    </button>
                </div>
            </div>

            <div className="bg-orange-50 border-t border-orange-100 px-5 py-2 flex items-center justify-between">
                <span className="text-xs text-orange-700">Trip in progress · Contact your agency if you need assistance</span>
                {trip.agency_name && <span className="text-xs text-gray-500 font-medium">{trip.agency_name}</span>}
            </div>
        </div>
    );
};

// ─── Countdown Widget ─────────────────────────────────────────────────────────

const CountdownWidget = ({ trip, otherUpcoming, onViewDetails }) => {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const start = safeParseISO(trip.start_ts);
    if (!start) return null;
    const totalSec = Math.max(0, Math.floor((start - now) / 1000));
    const days = Math.floor(totalSec / 86400);
    const hrs  = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const urgent = totalSec < 7200;

    return (
        <div>
            <div className={`rounded-2xl p-5 border-2 ${urgent ? 'border-red-400 bg-red-50' : 'border-orange-300 bg-gradient-to-r from-orange-500 to-amber-500'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    {/* Countdown */}
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${urgent ? 'text-red-600' : 'text-orange-100'}`}>
                            {urgent ? '⚡ Starting Very Soon!' : 'Next Trip In:'}
                        </p>
                        <div className={`flex gap-4 ${urgent ? 'text-red-700' : 'text-white'}`}>
                            {[{ v: days, l: 'Days' }, { v: hrs, l: 'Hrs' }, { v: mins, l: 'Mins' }, { v: secs, l: 'Secs' }].map(({ v, l }) => (
                                <div key={l} className="text-center">
                                    <p className="text-3xl font-black tabular-nums leading-none">{String(v).padStart(2, '0')}</p>
                                    <p className="text-[10px] font-semibold opacity-70 mt-0.5">{l}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trip info */}
                    <div className={`space-y-1.5 ${urgent ? 'text-red-800' : 'text-orange-100'}`}>
                        <div className="flex items-center gap-2">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-black ${urgent ? 'bg-red-200 text-red-700' : 'bg-white/20 text-white'}`}>
                                {(trip.customer_name || '?').charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-sm">{trip.customer_name || '—'}</p>
                                {urgent && trip.customer_phone && (
                                    <a href={`tel:${trip.customer_phone}`} className="text-xs font-bold text-red-600">{trip.customer_phone}</a>
                                )}
                            </div>
                        </div>
                        {trip.brand && <p className="text-xs"><span className="opacity-70">Vehicle:</span> {trip.brand} {trip.model}</p>}
                        <p className="text-xs"><span className="opacity-70">📅 Start:</span> {fmtDateTime(trip.start_ts)}</p>
                        {trip.end_ts && <p className="text-xs"><span className="opacity-70">🏁 End:</span> {fmtDateTime(trip.end_ts)}</p>}
                        {trip.estimated_destination && <p className="text-xs"><span className="opacity-70">📍</span> {trip.estimated_destination}</p>}
                        {trip.booking_purpose && <p className="text-xs opacity-60 italic">{trip.booking_purpose}</p>}
                    </div>

                    {/* Booking details */}
                    <div className="space-y-2">
                        <button onClick={() => copyToClipboard(trip.booking_id)}
                            className={`text-xs font-mono flex items-center gap-1 ${urgent ? 'text-red-500' : 'text-orange-100 hover:text-white'}`}>
                            #{trip.booking_id?.slice(0, 14)}… <Copy size={10} />
                        </button>
                        {trip.driver_cost > 0 && (
                            <p className={`text-sm font-bold ${urgent ? 'text-red-700' : 'text-white'}`}>💰 {fmtMoney(trip.driver_cost)}</p>
                        )}
                        <button onClick={() => onViewDetails(trip.booking_id)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold ${urgent ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white text-orange-600 hover:bg-orange-50'}`}>
                            View Full Details
                        </button>
                        {trip.agency_name && (
                            <p className={`text-[10px] ${urgent ? 'text-red-500' : 'text-orange-200'}`}>{trip.agency_name}</p>
                        )}
                    </div>
                </div>
            </div>

            {otherUpcoming?.length > 0 && (
                <div className="mt-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <p className="text-xs font-bold text-gray-600 px-4 py-2 border-b border-gray-50">
                        + {otherUpcoming.length} more upcoming trip{otherUpcoming.length > 1 ? 's' : ''}
                    </p>
                    {otherUpcoming.slice(0, 3).map((t) => (
                        <button key={t.booking_id} onClick={() => onViewDetails(t.booking_id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 text-left">
                            <Calendar size={13} className="text-blue-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800">{fmtDate(t.start_ts, 'MMM dd')} → {fmtDate(t.end_ts, 'MMM dd')}</p>
                                <p className="text-[10px] text-gray-400 truncate">{t.customer_name} · {t.brand} {t.model}</p>
                            </div>
                            {t.total_rent_hours && <p className="text-xs font-bold text-green-600 shrink-0">{t.total_rent_hours}h</p>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Charts ───────────────────────────────────────────────────────────────────

const EarningsTrendChart = ({ data }) => {
    if (!data?.length) return (
        <div className="h-44 flex items-center justify-center text-gray-300 text-sm">No chart data yet</div>
    );
    const avg = data.reduce((s, d) => s + (d.earned || 0), 0) / data.length;
    const dataWithAvg = data.map(d => ({ ...d, avg: Math.round(avg) }));
    return (
        <div>
            <p className="text-xs text-gray-400 mb-2">Avg: {fmtMoney(Math.round(avg))}/month (dashed)</p>
            <ResponsiveContainer width="100%" height={160}>
                <LineChart data={dataWithAvg} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <RTooltip formatter={(v, name) => [name === 'avg' ? null : fmtMoney(v), name === 'avg' ? null : 'Earned']}
                        contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="earned" stroke="#F97316" strokeWidth={2.5}
                        dot={(props) => (
                            props.payload.current
                                ? <circle key={props.key} cx={props.cx} cy={props.cy} r={5} fill="#F97316" stroke="#fff" strokeWidth={2} />
                                : <circle key={props.key} cx={props.cx} cy={props.cy} r={2.5} fill="#F97316" />
                        )} />
                    <Line type="monotone" dataKey="avg" stroke="#D1D5DB" strokeDasharray="4 2" strokeWidth={1.5} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const DONUT_COLORS = { completed: '#22C55E', confirmed: '#3B82F6', cancelled: '#EF4444', ongoing: '#F97316', pending: '#F59E0B' };

const TripDonutChart = ({ stats }) => {
    const data = [
        { name: 'Completed', value: stats?.completed || 0, color: DONUT_COLORS.completed },
        { name: 'Upcoming',  value: stats?.upcoming  || 0, color: DONUT_COLORS.confirmed },
        { name: 'Cancelled', value: stats?.cancelled || 0, color: DONUT_COLORS.cancelled },
        { name: 'Ongoing',   value: stats?.ongoing   || 0, color: DONUT_COLORS.ongoing   },
    ].filter(d => d.value > 0);
    const total = data.reduce((s, d) => s + d.value, 0);
    if (!total) return <div className="h-40 flex items-center justify-center text-gray-300 text-sm">No trips yet</div>;
    return (
        <div className="relative">
            <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                    <Pie data={data} innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                        {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <RTooltip formatter={(v, n) => [`${v} (${((v/total)*100).toFixed(1)}%)`, n]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <p className="text-lg font-black text-gray-800 leading-none">{total}</p>
                    <p className="text-[9px] text-gray-400">Total</p>
                </div>
            </div>
        </div>
    );
};

const RatingDistributionChart = ({ rb }) => {
    const data = [5, 4, 3, 2, 1].map(s => ({
        star: `${s}★`,
        count: rb?.[`r${s}`] || 0,
        color: s >= 4 ? '#22C55E' : s === 3 ? '#F59E0B' : s === 2 ? '#F97316' : '#EF4444',
    }));
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="space-y-2 mt-2">
            {data.map(d => (
                <div key={d.star} className="flex items-center gap-2 text-xs">
                    <span className="w-7 text-gray-500 shrink-0 font-medium">{d.star}</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${(d.count / max) * 100}%`, backgroundColor: d.color }} />
                    </div>
                    <span className="w-6 text-right text-gray-500 font-medium">{d.count}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Recent Trips Panel ───────────────────────────────────────────────────────

const RecentTripsPanel = ({ trips, loading, onView, navigate }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">Recent Trips</h3>
            <button onClick={() => navigate('/dashboard/driver/trips')}
                className="text-xs text-orange-500 hover:underline font-medium">View All →</button>
        </div>
        <div className="divide-y divide-gray-50">
            {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-5 py-3 flex gap-3 items-center">
                        <Skel className="w-16 h-5 rounded-full" />
                        <Skel className="w-7 h-7 rounded-full" />
                        <div className="flex-1 space-y-1.5"><Skel className="h-3 rounded w-3/4" /><Skel className="h-2.5 rounded w-1/2" /></div>
                        <Skel className="w-12 h-4 rounded" />
                    </div>
                ))
            ) : !trips?.length ? (
                <div className="py-12 text-center">
                    <Car size={40} className="mx-auto mb-2 text-gray-200" />
                    <p className="text-sm text-gray-400">No trips yet. Your agency will assign trips soon.</p>
                </div>
            ) : trips.map((t) => {
                const isOngoing = ['ongoing','running'].includes((t.status||'').toLowerCase());
                return (
                    <div key={t.booking_id}
                        className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 border-l-4 ${isOngoing ? 'bg-orange-50/40' : ''}`}
                        style={{ borderLeftColor: tripBorderColor(t.status) }}>
                        <StatusBadge status={t.status} />
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                            {(t.customer_name || '?').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{t.customer_name}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 flex-wrap">
                                <span>{t.brand} {t.model}</span>
                                {t.vehicle_type && <span className="px-1 bg-gray-100 rounded text-[9px]">{(t.vehicle_type||'').toUpperCase()}</span>}
                                <span>·</span>
                                <span>{fmtDate(t.start_ts, 'MMM dd')} → {fmtDate(t.end_ts, 'MMM dd')}</span>
                                {t.total_rent_hours && <span className="text-orange-500">{t.total_rent_hours}h</span>}
                            </div>
                            {t.estimated_destination && (
                                <p className="text-[10px] text-gray-400 truncate">📍 {t.estimated_destination}</p>
                            )}
                        </div>
                        <div className="text-right shrink-0">
                            {(t.status||'').toLowerCase() === 'completed' && t.driver_cost
                                ? <p className="text-xs font-bold text-green-600">{fmtMoney(t.driver_cost)}</p>
                                : <p className="text-xs text-gray-200">—</p>
                            }
                            <button onClick={() => onView(t.booking_id)}
                                className="mt-1 p-1 rounded-lg border border-gray-200 hover:bg-orange-50 hover:border-orange-300 text-gray-400 hover:text-orange-500">
                                <Eye size={12} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

// ─── Earnings Dashboard Panel ─────────────────────────────────────────────────

const EarningsDashPanel = ({ earnings, activeTripCost, navigate }) => {
    const lt = earnings?.lifetime;
    const medals = ['🥇','🥈','🥉'];
    const lastMonthPct = lt?.last_month > 0
        ? Math.round(((lt.this_month - lt.last_month) / lt.last_month) * 100)
        : 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <h3 className="font-bold text-gray-900">Earnings Summary</h3>
                <button onClick={() => navigate('/dashboard/driver/trips')}
                    className="text-xs text-orange-500 hover:underline font-medium">View Details →</button>
            </div>
            <div className="p-5 space-y-4">
                {!lt ? (
                    <div className="space-y-3">{[1,2,3,4].map(i => <Skel key={i} className="h-10 rounded-xl" />)}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-2.5">
                            {[
                                { label: 'Today',      value: fmtMoney(lt.today),      color: 'text-orange-600' },
                                { label: 'This Week',  value: fmtMoney(lt.this_week),  color: 'text-orange-600' },
                                { label: 'This Month', value: fmtMoney(lt.this_month), color: 'text-orange-600' },
                                { label: 'All Time',   value: fmtMoney(lt.all_time),   color: 'text-green-600'  },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className={`text-base font-black ${color}`}>{value}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                                </div>
                            ))}
                        </div>

                        {lt.last_month > 0 && (
                            <div>
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                    <span>This month vs last month</span>
                                    <span className={lastMonthPct >= 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                                        {lastMonthPct >= 0 ? '+' : ''}{lastMonthPct}%
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${lastMonthPct >= 0 ? 'bg-green-500' : 'bg-red-400'}`}
                                        style={{ width: `${Math.min(Math.abs(lastMonthPct), 100)}%` }} />
                                </div>
                            </div>
                        )}

                        {earnings?.top3?.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-gray-500 mb-2">Top Earning Trips</p>
                                <div className="space-y-1.5">
                                    {earnings.top3.map((t, i) => (
                                        <div key={t.booking_id || i} className="flex items-center gap-2 text-xs">
                                            <span className="text-sm">{medals[i]}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 truncate">{t.customer_name}</p>
                                                <p className="text-gray-400">{fmtDate(t.start_ts, 'MMM dd')}</p>
                                            </div>
                                            <span className="font-black text-green-600 shrink-0">{fmtMoney(t.driver_cost)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {earnings?.avgPerTrip > 0 && (
                            <p className="text-xs text-center text-orange-600 font-semibold border-t border-gray-50 pt-3">
                                Avg: {fmtMoney(earnings.avgPerTrip)} per completed trip
                            </p>
                        )}

                        {activeTripCost > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center">
                                <p className="text-xs text-amber-700">
                                    💰 <span className="font-bold">{fmtMoney(activeTripCost)}</span> pending from active trip
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Recent Reviews Panel ─────────────────────────────────────────────────────

const RecentReviewsPanel = ({ reviews, reviewsLoading, rb, navigate }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">Recent Reviews</h3>
            <button onClick={() => navigate('/dashboard/driver/reviews')}
                className="text-xs text-orange-500 hover:underline font-medium">View All →</button>
        </div>
        {rb?.avg > 0 && (
            <div className="px-5 py-3 bg-amber-50/40 border-b border-gray-50 flex items-center gap-4">
                <div className="text-center shrink-0">
                    <p className="text-2xl font-black text-amber-500">{rb.avg?.toFixed(2)}</p>
                    <Stars rating={rb.avg} size={11} />
                    <p className="text-[10px] text-gray-400 mt-0.5">{rb.total || 0} reviews</p>
                </div>
                <div className="flex-1 space-y-1">
                    {[5,4,3,2,1].map(s => {
                        const cnt = rb[`r${s}`] || 0;
                        const pct = rb.total > 0 ? (cnt / rb.total) * 100 : 0;
                        return (
                            <div key={s} className="flex items-center gap-1.5 text-[10px]">
                                <span className="w-5 text-gray-500">{s}★</span>
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="w-4 text-right text-gray-400">{cnt}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
        <div className="divide-y divide-gray-50">
            {reviewsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="px-5 py-3 space-y-1.5">
                        <div className="flex gap-2 items-center"><Skel className="w-7 h-7 rounded-full" /><Skel className="h-3 rounded w-1/3" /></div>
                        <Skel className="h-3 rounded w-full" /><Skel className="h-3 rounded w-2/3" />
                    </div>
                ))
            ) : !reviews?.length ? (
                <div className="py-12 text-center">
                    <Star size={36} className="mx-auto mb-2 text-gray-200" />
                    <p className="text-sm text-gray-400 font-medium">No reviews yet</p>
                    <p className="text-xs text-gray-300 mt-1">Complete trips to receive feedback.</p>
                </div>
            ) : reviews.slice(0, 4).map((r, i) => {
                const rating = r.rating || 0;
                const borderColor = rating >= 4 ? 'border-l-green-400' : rating === 3 ? 'border-l-amber-400' : 'border-l-red-400';
                const parts = (r.reviewer_name || '').split(' ');
                const displayName = parts[0] + (parts[1] ? ` ${parts[1].charAt(0)}.` : '');
                const reviewDate = safeParseISO(r.date);
                return (
                    <div key={i} className={`px-5 py-3 border-l-4 ${borderColor}`}>
                        <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                    {(r.reviewer_name || '?').charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-800">{displayName}</p>
                                    <p className="text-[10px] text-gray-400">
                                        {fmtDate(r.date)}
                                        {reviewDate && ` · ${formatDistanceToNow(reviewDate, { addSuffix: true })}`}
                                    </p>
                                </div>
                            </div>
                            <Stars rating={rating} size={11} />
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                            {r.review || <span className="italic text-gray-400">Rating only</span>}
                        </p>
                        {(r.trip_start || r.start_ts) && (
                            <p className="text-[10px] text-gray-400 mt-1">
                                Trip: {fmtDate(r.trip_start || r.start_ts, 'MMM dd')} → {fmtDate(r.trip_end || r.end_ts, 'MMM dd')}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
);

// ─── Vehicle Info Panel ───────────────────────────────────────────────────────

const VehicleInfoPanel = ({ trip, profile }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">Current Assignment</h3>
        </div>
        <div className="p-5 space-y-4">
            {!trip?.brand ? (
                <div className="py-8 text-center">
                    <Car size={44} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-sm font-semibold text-gray-500">No vehicle currently assigned.</p>
                    <p className="text-xs text-gray-400 mt-1">Your agency will assign a vehicle when a trip is booked.</p>
                </div>
            ) : (
                <>
                    {trip.vehicle_images?.[0] && (
                        <img src={trip.vehicle_images[0]} alt={`${trip.brand} ${trip.model}`}
                            className="w-full h-36 object-cover rounded-xl" />
                    )}
                    <div>
                        <p className="text-xl font-black text-gray-900">{trip.brand} {trip.model}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {trip.vehicle_type && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                    {(trip.vehicle_type||'').toUpperCase()}
                                </span>
                            )}
                            {trip.car_type && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{trip.car_type}</span>}
                            {trip.status_label && <StatusBadge status={trip.vehicle_status || trip.status} />}
                        </div>
                    </div>
                    {trip.agency_name && (
                        <span className="inline-block px-2.5 py-0.5 bg-orange-500 text-white text-xs rounded-full font-medium">{trip.agency_name}</span>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                            { icon: '🏎️', label: 'Type', value: trip.car_type },
                            { icon: '⚙️', label: 'Gear', value: trip.gear || trip.transmission_type },
                            { icon: '⛽', label: 'Fuel', value: trip.fuel },
                            {
                                icon: trip.vehicle_type === 'bike' ? '🪖' : '💺',
                                label: trip.vehicle_type === 'bike' ? 'Engine' : 'Seats',
                                value: trip.vehicle_type === 'bike' ? trip.engine_capacity : trip.seats,
                            },
                        ].filter(r => r.value).map(r => (
                            <div key={r.label} className="bg-gray-50 rounded-lg p-2">
                                <p className="text-gray-400 text-[10px]">{r.icon} {r.label}</p>
                                <p className="font-semibold text-gray-700 mt-0.5">{r.value}</p>
                            </div>
                        ))}
                    </div>
                    {trip.vehicle_rating > 0 && (
                        <div className="flex items-center gap-1.5">
                            <Stars rating={trip.vehicle_rating} size={12} />
                            <span className="text-xs text-gray-500">Vehicle rating</span>
                        </div>
                    )}
                </>
            )}

            {/* Agency contact */}
            {profile?.agency_name && (
                <div className="border-t border-gray-100 pt-4 space-y-2">
                    <p className="text-xs font-bold text-gray-800">{profile.agency_name}</p>
                    {profile.agency_phone && (
                        <a href={`tel:${profile.agency_phone}`} className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline">
                            <Phone size={11} /> {profile.agency_phone}
                        </a>
                    )}
                    {profile.agency_email && (
                        <a href={`mailto:${profile.agency_email}`} className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline">
                            📧 {profile.agency_email}
                        </a>
                    )}
                    <button
                        onClick={() => profile.agency_phone && window.open(`tel:${profile.agency_phone}`)}
                        className="w-full py-2 border-2 border-orange-300 text-orange-600 text-xs font-bold rounded-xl hover:bg-orange-50">
                        Contact Agency
                    </button>
                </div>
            )}
        </div>
    </div>
);

// ─── Schedule Timeline ────────────────────────────────────────────────────────

const ScheduleTimeline = ({ trips }) => {
    const [open, setOpen] = useState(false);
    const now = new Date();

    const sorted = [...(trips || [])].sort((a, b) => new Date(a.start_ts) - new Date(b.start_ts));

    const dotCls = (status) => {
        const s = (status||'').toLowerCase();
        if (s === 'ongoing' || s === 'running') return 'bg-orange-500 ring-2 ring-orange-200 animate-pulse';
        if (s === 'completed') return 'bg-green-500';
        if (s === 'confirmed') return 'bg-blue-400 ring-2 ring-blue-100';
        if (s === 'cancelled') return 'bg-red-400';
        return 'bg-gray-300';
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                <div className="text-left">
                    <p className="font-bold text-gray-900">My Schedule</p>
                    <p className="text-xs text-gray-400">Your upcoming and recent trip timeline.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 border-2 border-orange-200 text-orange-600 text-xs font-semibold rounded-xl">
                        {open ? 'Hide Schedule' : 'Show Schedule'}
                    </span>
                    {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-gray-50">
                        {!sorted.length ? (
                            <div className="py-12 text-center">
                                <Calendar size={40} className="mx-auto mb-2 text-gray-200" />
                                <p className="text-sm text-gray-400">Your schedule is empty.</p>
                                <p className="text-xs text-gray-300 mt-1">Your agency will assign trips to you.</p>
                            </div>
                        ) : (
                            <div className="px-5 py-4 space-y-0">
                                {sorted.map((t, i) => {
                                    const tripStart = safeParseISO(t.start_ts);
                                    const prevTrip  = sorted[i - 1];
                                    const prevStart = prevTrip ? safeParseISO(prevTrip.start_ts) : null;
                                    const showTodayLine = i > 0 && prevStart && prevStart < now && tripStart && tripStart >= now;

                                    return (
                                        <div key={t.booking_id}>
                                            {showTodayLine && (
                                                <div className="flex items-center gap-2 my-3">
                                                    <div className="flex-1 border-t-2 border-dashed border-orange-300" />
                                                    <span className="text-[10px] font-bold text-orange-500 px-2 py-0.5 bg-orange-50 rounded-full border border-orange-200">TODAY</span>
                                                    <div className="flex-1 border-t-2 border-dashed border-orange-300" />
                                                </div>
                                            )}
                                            <div className="flex gap-3 relative pb-3">
                                                <div className="w-14 shrink-0 text-right pt-0.5">
                                                    <p className="text-[10px] font-bold text-gray-700">{tripStart ? format(tripStart, 'MMM dd') : '—'}</p>
                                                    <p className="text-[9px] text-gray-400">{tripStart ? format(tripStart, 'EEE') : ''}</p>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${dotCls(t.status)}`} />
                                                    {i < sorted.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" style={{ minHeight: 20 }} />}
                                                </div>
                                                <div className={`flex-1 bg-gray-50 rounded-xl p-3 min-w-0`}>
                                                    <div className="flex items-start justify-between gap-2 flex-wrap">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <StatusBadge status={t.status} />
                                                            <button onClick={() => copyToClipboard(t.booking_id)}
                                                                className="text-[10px] font-mono text-gray-400 hover:text-orange-500 flex items-center gap-0.5">
                                                                #{t.booking_id?.slice(0, 10)}… <Copy size={8} />
                                                            </button>
                                                        </div>
                                                        {(t.status||'').toLowerCase() === 'completed' && t.driver_cost > 0 && (
                                                            <span className="text-xs font-bold text-green-600 shrink-0">{fmtMoney(t.driver_cost)}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-semibold text-gray-800 mt-1.5 truncate">
                                                        {t.customer_name} · {t.brand} {t.model}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        {fmtTime(t.start_ts)} → {fmtTime(t.end_ts)}
                                                        {t.total_rent_hours ? ` · ${t.total_rent_hours}h` : ''}
                                                    </p>
                                                    {t.estimated_destination && (
                                                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">📍 {t.estimated_destination}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Trip Detail Modal ────────────────────────────────────────────────────────

const TripDetailModal = ({ bookingId, onClose }) => {
    const axiosPublic = useAxiosPublic();
    const [tab, setTab] = useState(0);

    const { data: d, isLoading } = useQuery({
        queryKey: ['dashTripDetail', bookingId],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverTrips/detail/${bookingId}`, { withCredentials: true });
            return r.data;
        },
        enabled: !!bookingId,
    });
    const TABS = ['Overview', 'Pickup & Return', 'Earnings', 'Review'];
    const isComplete = d && (d.status||'').toLowerCase() === 'completed';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-6 px-3 pb-6 overflow-y-auto"
            onClick={onClose}>
            <motion.div initial={{ scale: 0.96, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: -20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <button onClick={() => copyToClipboard(bookingId)}
                            className="text-xs font-mono text-gray-500 hover:text-orange-600 flex items-center gap-1">
                            #{bookingId?.slice(0, 18)} <Copy size={11} />
                        </button>
                        {d && <StatusBadge status={d.status} size="lg" />}
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
                </div>
                <div className="flex border-b border-gray-100 overflow-x-auto">
                    {TABS.map((t, i) => (
                        <button key={t} onClick={() => setTab(i)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${tab === i ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            {t}
                        </button>
                    ))}
                </div>
                <div className="p-5 max-h-[65vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="space-y-3">{[1,2,3,4].map(i => <Skel key={i} className="h-12 rounded-xl" />)}</div>
                    ) : !d ? (
                        <p className="text-center text-gray-400 py-8">Failed to load trip details.</p>
                    ) : (
                        <>
                            {tab === 0 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            ['Start',    fmtDateTime(d.start_ts)],
                                            ['End',      fmtDateTime(d.end_ts)],
                                            ['Total Hrs',d.total_rent_hours ? `${d.total_rent_hours} hrs` : '—'],
                                            ['Purpose',  d.booking_purpose || '—'],
                                            ['Destination', d.estimated_destination || '—'],
                                            ['Booked On', fmtDateTime(d.booking_ts)],
                                        ].map(([l, v]) => (
                                            <div key={l} className="py-2 border-b border-gray-100">
                                                <p className="text-[10px] text-gray-400 uppercase">{l}</p>
                                                <p className="text-sm font-medium text-gray-800 mt-0.5">{v}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs font-bold text-gray-600 mb-2">Customer</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                                                {(d.customer_name||'?').charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm">{d.customer_name}</p>
                                                {d.customer_phone && <a href={`tel:${d.customer_phone}`} className="text-xs text-blue-500">{d.customer_phone}</a>}
                                            </div>
                                            {d.customer_phone && (
                                                <a href={`tel:${d.customer_phone}`} className="flex items-center gap-1 px-3 py-1.5 border border-green-500 text-green-600 rounded-lg text-xs font-medium hover:bg-green-50">
                                                    <Phone size={12} /> Call
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs font-bold text-gray-600 mb-2">Vehicle</p>
                                        <div className="flex gap-3">
                                            {d.vehicle_images?.[0] && <img src={d.vehicle_images[0]} alt="" className="w-16 h-12 object-cover rounded-lg" />}
                                            <div>
                                                <p className="font-bold text-sm">{d.brand} {d.model}</p>
                                                <p className="text-xs text-gray-500">{[d.car_type, d.fuel, d.gear].filter(Boolean).join(' · ')}</p>
                                                {d.seats && <p className="text-xs text-gray-400">{d.seats} seats</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border border-gray-100 rounded-xl p-4 space-y-1.5">
                                        <p className="text-xs font-bold text-gray-600 mb-2">Payment</p>
                                        <div className="flex justify-between text-sm"><span className="text-gray-600">Total Cost</span><span className="font-bold">{fmtMoney(d.total_cost)}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-green-700">Your Earnings</span><span className="font-bold text-green-600">{fmtMoney(d.driver_cost)}</span></div>
                                        <div className="flex justify-between text-sm text-gray-400"><span>Agency Share</span><span>{fmtMoney((d.total_cost||0)-(d.driver_cost||0))}</span></div>
                                    </div>
                                    {(d.status||'').toLowerCase() === 'cancelled' && d.cancelled_by && (
                                        <div className="border-2 border-red-200 rounded-xl p-4 bg-red-50">
                                            <p className="text-xs font-bold text-red-700 mb-1">Cancellation</p>
                                            <p className="text-sm text-red-800">By: <span className="font-semibold">{d.cancelled_by}</span></p>
                                            {d.cancel_reason && <p className="text-xs italic text-red-600 mt-1">{d.cancel_reason}</p>}
                                        </div>
                                    )}
                                </div>
                            )}
                            {tab === 1 && (
                                <div className="space-y-5">
                                    {['pickup', 'return'].map(key => (
                                        <div key={key}>
                                            <p className="text-sm font-bold text-gray-800 mb-2 capitalize">{key} Info</p>
                                            {d[key] ? (
                                                <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div><p className="text-[10px] text-gray-400 uppercase">Time</p><p className="text-sm font-medium">{fmtDateTime(d[key][`${key}_time`] || d[key].return_time)}</p></div>
                                                        <div><p className="text-[10px] text-gray-400 uppercase">Odometer</p><p className="text-sm font-bold">{d[key].odometer_reading} km</p></div>
                                                    </div>
                                                    <div><p className="text-[10px] text-gray-400 uppercase mb-1">Fuel Level</p><FuelGauge level={d[key].fuel_level} /></div>
                                                </div>
                                            ) : (
                                                <div className="border border-dashed border-gray-200 rounded-xl p-5 text-center text-gray-400 text-sm">
                                                    No {key} record yet.
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {tab === 2 && (
                                <div className="space-y-4">
                                    <div className="text-center py-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Your Earnings</p>
                                        <p className="text-5xl font-black text-green-600">{fmtMoney(d.driver_cost)}</p>
                                        <p className={`text-xs font-semibold mt-1 ${isComplete ? 'text-green-600' : 'text-amber-600'}`}>
                                            {isComplete ? `Earned on ${fmtDate(d.end_ts)}` : '⏳ Pending after completion'}
                                        </p>
                                    </div>
                                    <div className="border border-gray-100 rounded-xl p-4 space-y-2">
                                        <div className="flex justify-between text-sm"><span className="text-gray-600">Total Booking Cost</span><span className="font-bold">{fmtMoney(d.total_cost)}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-green-700">Driver Fee</span><span className="font-bold text-green-600">{fmtMoney(d.driver_cost)}</span></div>
                                        <div className="flex justify-between text-sm text-gray-400"><span>Agency Share</span><span>{fmtMoney((d.total_cost||0)-(d.driver_cost||0))}</span></div>
                                    </div>
                                </div>
                            )}
                            {tab === 3 && (
                                <div className="py-2">
                                    {!isComplete ? (
                                        <div className="text-center py-10 text-gray-400">
                                            <Star size={32} className="mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">Reviews available after trip completion.</p>
                                        </div>
                                    ) : d.review ? (
                                        <div className={`border-l-4 rounded-xl p-4 ${d.review.rating>=4?'border-l-green-400':d.review.rating===3?'border-l-amber-400':'border-l-red-400'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-bold text-sm">{d.review.reviewer_name || 'Anonymous'}</p>
                                                <Stars rating={d.review.rating} />
                                            </div>
                                            <p className="text-sm text-gray-700">{d.review.review || <span className="italic text-gray-400">Rating only</span>}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-gray-400">
                                            <Star size={32} className="mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">No review yet for this trip.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── Availability Modal ───────────────────────────────────────────────────────

const AvailabilityModal = ({ current, onConfirm, onClose, loading }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <p className="font-bold text-gray-900">Set Availability</p>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="p-6 text-center space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${current ? 'bg-green-100' : 'bg-red-100'}`}>
                    {current ? <ToggleRight size={32} className="text-green-600" /> : <ToggleLeft size={32} className="text-red-500" />}
                </div>
                <div>
                    <p className="text-base font-bold text-gray-800">
                        Currently: <span className={current ? 'text-green-600' : 'text-red-500'}>{current ? 'Available' : 'Unavailable'}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Switch to <strong>{current ? 'Unavailable' : 'Available'}</strong>?
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={() => onConfirm(!current)} disabled={loading}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 ${!current ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                        {loading ? '...' : `Set ${!current ? 'Available' : 'Unavailable'}`}
                    </button>
                </div>
            </div>
        </motion.div>
    </motion.div>
);

// ─── New Driver Empty State ────────────────────────────────────────────────────

const NewDriverEmptyState = ({ name, navigate }) => {
    const steps = [
        { label: 'Account created',            done: true },
        { label: 'Complete your profile',       done: false },
        { label: 'Add your address',            done: false },
        { label: 'Upload license details',      done: false },
        { label: 'Change temporary password',   done: !!localStorage.getItem('driver_pw_changed') },
        { label: 'Set yourself as available',   done: false },
        { label: 'Receive your first trip',     done: false },
    ];
    const donePct = Math.round((steps.filter(s => s.done).length / steps.length) * 100);

    return (
        <div className="space-y-4">
            <div className="bg-white border-2 border-orange-200 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <Car size={40} className="text-orange-500" />
                </div>
                <h2 className="text-xl font-black text-gray-900">Welcome to GoCar, {name}!</h2>
                <p className="text-gray-500 mt-2">Your agency will assign trips to you soon.</p>
                <p className="text-gray-400 text-sm mt-1">While you wait, complete your profile to get started.</p>
                <button onClick={() => navigate('/dashboard/driver/profile')}
                    className="mt-5 px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600">
                    Complete Profile →
                </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-1">Get Ready to Drive</h3>
                <p className="text-xs text-gray-400 mb-3">{steps.filter(s => s.done).length}/{steps.length} steps completed</p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${donePct}%` }} />
                </div>
                <div className="space-y-2">
                    {steps.map((s, i) => (
                        <button key={i} onClick={() => navigate('/dashboard/driver/profile')}
                            className={`w-full flex items-center gap-3 py-2 px-3 rounded-xl text-sm text-left transition-colors ${s.done ? 'bg-green-50' : 'bg-gray-50 hover:bg-orange-50'}`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {s.done ? '✓' : i + 1}
                            </span>
                            <span className={s.done ? 'text-green-700 line-through' : 'text-gray-700'}>{s.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Main DriverDashboard ─────────────────────────────────────────────────────

const DriverDashboard = () => {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [dismissed, setDismissed]   = useState({});
    const [showAllBanners, setShowAll] = useState(false);
    const [selectedTripId, setTripId] = useState(null);
    const [availModal, setAvailModal] = useState(false);
    const [availLoading, setAvailLoad]= useState(false);
    const prevTotalRef                = useRef(null);

    // ── Queries ─────────────────────────────────────────────────────────────

    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['driverDashProfile', user?.email],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverProfile/full/${user.email}`, { withCredentials: true });
            return r.data;
        },
        enabled: !!user?.email,
        refetchInterval: 60000,
    });
    const driverId = profile?.driver_id;

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['driverDashStats', driverId],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverTrips/stats/${driverId}`, { withCredentials: true });
            return r.data;
        },
        enabled: !!driverId,
        refetchInterval: 60000,
    });

    const { data: banners } = useQuery({
        queryKey: ['driverDashBanners', driverId],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverTrips/banners/${driverId}`, { withCredentials: true });
            return r.data;
        },
        enabled: !!driverId,
        refetchInterval: 60000,
    });

    const { data: recentTripsData, isLoading: tripsLoading, dataUpdatedAt } = useQuery({
        queryKey: ['driverDashRecentTrips', driverId],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverTrips/list/${driverId}?page=1&limit=8&sort=newest`, { withCredentials: true });
            return r.data;
        },
        enabled: !!driverId,
        refetchInterval: 60000,
    });

    const { data: earnings, isLoading: earningsLoading } = useQuery({
        queryKey: ['driverDashEarnings', driverId],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverTrips/earnings/${driverId}`, { withCredentials: true });
            return r.data;
        },
        enabled: !!driverId,
        refetchInterval: 60000,
    });

    const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
        queryKey: ['driverDashReviews', driverId],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverProfile/reviews/${driverId}?page=1&rating=all&sort=newest`, { withCredentials: true });
            return r.data;
        },
        enabled: !!driverId,
        refetchInterval: 60000,
    });

    // ── Derived Data ──────────────────────────────────────────────────────────

    const allTrips = recentTripsData?.trips || [];
    const activeTrip = allTrips.find(t => ['ongoing','running'].includes((t.status||'').toLowerCase()));
    const upcomingTrips = allTrips.filter(t =>
        (t.status||'').toLowerCase() === 'confirmed' && new Date(t.start_ts) > new Date()
    ).sort((a, b) => new Date(a.start_ts) - new Date(b.start_ts));
    const nextTrip = banners?.nextTrip || upcomingTrips[0] || null;
    const otherUpcomingTrips = upcomingTrips.slice(1);
    const recentFive = [...allTrips].sort((a, b) => new Date(b.start_ts) - new Date(a.start_ts)).slice(0, 5);

    const rb = profile?.ratingBreakdown || {};
    const pct = completionPct(profile);
    const licLive = licenseCountdown(profile?.expire_date);
    const isNewDriver = !statsLoading && stats !== undefined && (stats?.total ?? 0) === 0;
    const vehicleTrip = activeTrip
        || allTrips.find(t => (t.status||'').toLowerCase() === 'confirmed')
        || allTrips[0];

    const lastUpdated = dataUpdatedAt
        ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true })
        : null;

    // ── New trip toast ───────────────────────────────────────────────────────

    useEffect(() => {
        if (recentTripsData?.total !== undefined && prevTotalRef.current !== null && recentTripsData.total > prevTotalRef.current) {
            const newest = recentTripsData.trips?.[0];
            toast.custom((tt) => (
                <div className={`flex items-start gap-3 bg-white border border-blue-200 shadow-lg rounded-2xl p-4 max-w-xs ${tt.visible ? '' : 'opacity-0'}`}>
                    <Bell size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">New trip assigned!</p>
                        {newest && <p className="text-xs text-gray-500">#{newest.booking_id?.slice(0,14)}… starts {fmtDate(newest.start_ts, 'MMM dd')}</p>}
                    </div>
                    <button onClick={() => toast.dismiss(tt.id)}><X size={13} className="text-gray-400" /></button>
                </div>
            ), { duration: 6000 });
        }
        if (recentTripsData?.total !== undefined) prevTotalRef.current = recentTripsData.total;
    }, [recentTripsData?.total, recentTripsData?.trips]);

    // ── Availability toggle ───────────────────────────────────────────────────

    const handleAvailability = async (newVal) => {
        setAvailLoad(true);
        try {
            await axiosPublic.patch(`/driverRoutes/availability/${driverId}`, { availability: newVal }, { withCredentials: true });
            queryClient.invalidateQueries({ queryKey: ['driverDashProfile', user?.email] });
            toast.success(`You are now ${newVal ? 'Available' : 'Unavailable'}`);
            setAvailModal(false);
        } catch {
            toast.error('Failed to update availability');
        } finally {
            setAvailLoad(false);
        }
    };

    const refresh = () => {
        ['driverDashProfile','driverDashStats','driverDashBanners','driverDashRecentTrips','driverDashEarnings','driverDashReviews']
            .forEach(key => queryClient.invalidateQueries({ queryKey: [key] }));
    };

    // ── Build Alert Banners ───────────────────────────────────────────────────

    const allBanners = [
        profile?.accountstatus === 'suspended' && {
            id: 'suspended', type: 'red', icon: Shield, noDismiss: true,
            message: 'Your driver account has been suspended. Contact your agency immediately for assistance.',
            action: 'Contact Agency', onAction: () => profile?.agency_phone && window.open(`tel:${profile.agency_phone}`),
        },
        licLive?.type === 'expired' && {
            id: 'licexp', type: 'red', icon: AlertCircle, noDismiss: true,
            message: `Your driver's license expired ${licLive.days} days ago. Update your license details to continue receiving trips.`,
            action: 'Update Now', onAction: () => navigate('/dashboard/driver/profile'),
        },
        banners?.missedPickup && {
            id: 'missed', type: 'red', icon: AlertTriangle,
            message: `Booking #${banners.missedPickup.booking_id?.slice(0,16)}… is marked ongoing but no pickup has been recorded. Contact your agency.`,
            action: 'View Trip', onAction: () => setTripId(banners.missedPickup.booking_id),
        },
        licLive?.type === 'expiring' && {
            id: 'licwarn', type: 'amber', icon: Clock,
            message: `Your driver's license expires on ${fmtDate(profile?.expire_date)} (${licLive.days} days remaining). Update before expiry.`,
            action: 'Update Now', onAction: () => navigate('/dashboard/driver/profile'),
        },
        profile && !profile.verified && {
            id: 'unverified', type: 'amber', icon: Shield,
            message: 'Your account is pending verification by your agency. Some features may be restricted until verified.',
        },
        (() => {
            if (!nextTrip || activeTrip) return null;
            const start = safeParseISO(nextTrip.start_ts);
            if (!start) return null;
            const mins = differenceInMinutes(start, new Date());
            if (mins > 0 && mins < 120) return {
                id: 'soon', type: 'amber', icon: Zap, pulse: true,
                message: `⚡ Your next trip starts in less than 2 hours! Booking #${nextTrip.booking_id?.slice(0,14)}… at ${fmtTime(nextTrip.start_ts)}.`,
                action: 'View Details', onAction: () => setTripId(nextTrip.booking_id),
            };
            return null;
        })(),
        banners?.newReview && {
            id: 'newrev', type: 'green', icon: Star,
            message: `⭐ You received a new review! ${banners.newReview.reviewer_name || 'A customer'} rated you ${banners.newReview.rating}★.`,
            action: 'View Review', onAction: () => navigate('/dashboard/driver/reviews'),
        },
        banners?.newAssignment && {
            id: 'newtrip', type: 'green', icon: CheckCircle,
            message: `✅ A new trip has been assigned to you. Booking #${banners.newAssignment.booking_id?.slice(0,14)}… starts on ${fmtDate(banners.newAssignment.start_ts)}.`,
            action: 'View Now', onAction: () => setTripId(banners.newAssignment.booking_id),
        },
    ].filter(Boolean);

    const visibleBanners = allBanners.filter(b => !dismissed[b.id]);
    const SHOW_MAX = 4;
    const shownBanners = showAllBanners ? visibleBanners : visibleBanners.slice(0, SHOW_MAX);
    const hiddenCount  = visibleBanners.length - shownBanners.length;

    const thisMonthRatingTrend = rb.thisMonthAvg && rb.prevMonthAvg
        ? parseFloat((rb.thisMonthAvg - rb.prevMonthAvg).toFixed(2))
        : null;

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
                        {profileLoading
                            ? <Skel className="h-4 w-64 rounded mt-1" />
                            : <p className="text-sm text-gray-500 mt-0.5">
                                Welcome back, <span className="font-semibold text-orange-600">{profile?.name || user?.displayName || 'Driver'}</span>! Here&apos;s your overview for today.
                              </p>
                        }
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-1">
                        {lastUpdated && <p className="text-xs text-gray-400 hidden sm:block">Updated {lastUpdated}</p>}
                        <button onClick={refresh} title="Refresh"
                            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
                            <RefreshCw size={14} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Alert Banners */}
                {shownBanners.length > 0 && (
                    <div className="space-y-2">
                        <AnimatePresence>
                            {shownBanners.map(b => (
                                <AlertBanner key={b.id} {...b}
                                    onDismiss={() => setDismissed(d => ({ ...d, [b.id]: true }))} />
                            ))}
                        </AnimatePresence>
                        {hiddenCount > 0 && !showAllBanners && (
                            <button onClick={() => setShowAll(true)}
                                className="text-xs text-orange-500 hover:underline font-medium">
                                Show {hiddenCount} more alert{hiddenCount > 1 ? 's' : ''} ▾
                            </button>
                        )}
                        {showAllBanners && visibleBanners.length > SHOW_MAX && (
                            <button onClick={() => setShowAll(false)} className="text-xs text-gray-400 hover:underline">Show less ▴</button>
                        )}
                    </div>
                )}

                {/* Active Trip Widget */}
                {activeTrip && <ActiveTripWidget trip={activeTrip} onViewDetails={setTripId} />}

                {/* KPI Stat Cards — 2 rows of 4 */}
                {statsLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Array.from({ length: 8 }).map((_, i) => <Skel key={i} className="h-28 rounded-2xl" />)}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Row 1 — Trip KPIs */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard icon={Car} label="Total Trips" value={stats?.total ?? '—'}
                                sub="All time assignments" color="bg-orange-500"
                                trend={stats?.totalThisMonth !== undefined ? stats.totalThisMonth : undefined}
                                trendLabel={stats?.totalThisMonth !== undefined ? `+${stats.totalThisMonth} this month` : undefined}
                                onClick={() => navigate('/dashboard/driver/trips')} />
                            <StatCard icon={CheckCircle} label="Completed Trips" value={stats?.completed ?? '—'}
                                sub="Successfully delivered" color="bg-green-500"
                                trend={stats?.completedThisMonth}
                                onClick={() => navigate('/dashboard/driver/trips')} />
                            <StatCard icon={Calendar} label="Upcoming Trips" value={stats?.upcoming ?? '—'}
                                sub="Scheduled" color="bg-blue-500"
                                extra={nextTrip && <p className="text-[10px] text-blue-600 font-medium">Next: {fmtDate(nextTrip.start_ts, 'MMM dd')}</p>}
                                onClick={() => navigate('/dashboard/driver/trips')} />
                            <StatCard icon={AlertCircle} label="Cancelled Trips" value={stats?.cancelled ?? '—'}
                                sub={stats?.total > 0 ? `${Math.round(((stats?.cancelled||0) / stats.total) * 100)}% cancellation rate` : 'Cancellations'}
                                color="bg-red-500"
                                onClick={() => navigate('/dashboard/driver/trips')} />
                        </div>
                        {/* Row 2 — Performance KPIs */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard icon={DollarSign} label="Total Earnings" value={fmtMoney(stats?.totalEarned)}
                                sub="All time" color="bg-green-600"
                                trend={stats?.earnedLastMonth > 0 ? Math.round(((( stats?.earnedThisMonth||0) - stats.earnedLastMonth) / stats.earnedLastMonth) * 100) : undefined}
                                trendLabel={stats?.earnedLastMonth > 0 ? `+${fmtMoney(stats?.earnedThisMonth||0)} this month` : undefined}
                                onClick={() => navigate('/dashboard/driver/trips')} />
                            <StatCard icon={Wallet} label="This Month" value={fmtMoney(stats?.earnedThisMonth)}
                                sub="Current month" color="bg-orange-500"
                                extra={stats?.earnedLastMonth > 0 && (
                                    <div className="mt-1">
                                        <div className="flex justify-between text-[9px] text-gray-400 mb-0.5">
                                            <span>vs last month</span>
                                            <span>{Math.round(((stats?.earnedThisMonth||0)/stats.earnedLastMonth)*100)}%</span>
                                        </div>
                                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-400 rounded-full"
                                                style={{ width: `${Math.min(((stats?.earnedThisMonth||0)/stats.earnedLastMonth)*100, 100)}%` }} />
                                        </div>
                                    </div>
                                )}
                                onClick={() => navigate('/dashboard/driver/trips')} />
                            <StatCard icon={Star} label="Overall Rating"
                                value={rb?.avg ? `★ ${Number(rb.avg).toFixed(2)}` : (profile?.rating ? `★ ${Number(profile.rating).toFixed(2)}` : '★ —')}
                                sub={`Based on ${rb?.total || profile?.review_count || 0} reviews`}
                                color="bg-amber-500"
                                trend={thisMonthRatingTrend}
                                trendLabel={thisMonthRatingTrend !== null ? `${thisMonthRatingTrend >= 0 ? '+' : ''}${thisMonthRatingTrend} vs last month` : undefined}
                                onClick={() => navigate('/dashboard/driver/reviews')} />
                            <StatCard icon={profile?.availability ? Activity : Activity}
                                label="Availability"
                                value={
                                    <span className={profile?.availability ? 'text-green-600' : 'text-red-500'}>
                                        {profile?.availability ? '● Available' : '● Unavailable'}
                                    </span>
                                }
                                sub="Current status"
                                color={profile?.availability ? 'bg-green-500' : 'bg-gray-400'}
                                pulse={!!profile?.availability}
                                extra={
                                    <button onClick={(e) => { e.stopPropagation(); setAvailModal(true); }}
                                        className={`mt-1.5 w-full py-1 rounded-lg text-[10px] font-bold transition-colors ${profile?.availability ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                                        {profile?.availability ? 'Set Unavailable' : 'Set Available'}
                                    </button>
                                } />
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-3 overflow-x-auto pb-1">
                    <QuickActionBtn icon={ClipboardList} label="My Trips"
                        badge={stats?.upcoming || 0} badgeColor="bg-blue-500"
                        onClick={() => navigate('/dashboard/driver/trips')} />
                    <QuickActionBtn icon={User} label="My Profile"
                        badge={pct < 80 ? 1 : 0} badgeColor="bg-red-500"
                        onClick={() => navigate('/dashboard/driver/profile')} />
                    <QuickActionBtn icon={Star} label="My Reviews"
                        badge={banners?.newReview ? 1 : 0} badgeColor="bg-amber-400"
                        onClick={() => navigate('/dashboard/driver/reviews')} />
                    <QuickActionBtn icon={DollarSign} label="Earnings"
                        onClick={() => navigate('/dashboard/driver/trips')} />
                    <QuickActionBtn icon={profile?.availability ? ToggleRight : ToggleLeft}
                        label="Availability"
                        onClick={() => setAvailModal(true)} />
                    <QuickActionBtn icon={Settings} label="Settings"
                        onClick={() => navigate('/dashboard/driver/profile')} />
                </div>

                {/* Profile Completion Nudge */}
                {!profileLoading && profile && <ProfileCompletionNudge profile={profile} navigate={navigate} />}

                {/* Upcoming Countdown (hidden if active trip is showing) */}
                {!activeTrip && nextTrip && (
                    <CountdownWidget
                        trip={nextTrip}
                        otherUpcoming={otherUpcomingTrips}
                        onViewDetails={setTripId}
                    />
                )}

                {/* New driver empty state OR full dashboard */}
                {isNewDriver ? (
                    <NewDriverEmptyState
                        name={profile?.name || user?.displayName || 'Driver'}
                        navigate={navigate}
                    />
                ) : (
                    <>
                        {/* Charts Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h3 className="text-sm font-bold text-gray-900 mb-0.5">Monthly Earnings Trend</h3>
                                <p className="text-xs text-gray-400 mb-2">Last 12 months</p>
                                {earningsLoading ? <Skel className="h-44 rounded-xl" /> : <EarningsTrendChart data={earnings?.chart || []} />}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                    <h3 className="text-sm font-bold text-gray-900 mb-0.5">Trip Status</h3>
                                    <p className="text-[10px] text-gray-400">Breakdown</p>
                                    {statsLoading ? <Skel className="h-36 rounded-xl mt-2" /> : <TripDonutChart stats={stats} />}
                                    {!statsLoading && stats && (
                                        <div className="mt-2 space-y-0.5">
                                            {[
                                                ['Completed', stats.completed || 0, '#22C55E'],
                                                ['Upcoming',  stats.upcoming  || 0, '#3B82F6'],
                                                ['Cancelled', stats.cancelled || 0, '#EF4444'],
                                                ['Ongoing',   stats.ongoing   || 0, '#F97316'],
                                            ].filter(([,v]) => v > 0).map(([l, v, c]) => (
                                                <div key={l} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />
                                                    {l}: {v}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                    <h3 className="text-sm font-bold text-gray-900 mb-0.5">Rating Breakdown</h3>
                                    <p className="text-[10px] text-gray-400">My rating distribution</p>
                                    {profileLoading ? <Skel className="h-32 rounded-xl mt-2" /> : <RatingDistributionChart rb={rb} />}
                                </div>
                            </div>
                        </div>

                        {/* Recent Trips + Earnings Summary */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                            <div className="lg:col-span-3">
                                <RecentTripsPanel
                                    trips={recentFive}
                                    loading={tripsLoading}
                                    onView={setTripId}
                                    navigate={navigate}
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <EarningsDashPanel
                                    earnings={earnings}
                                    activeTripCost={activeTrip?.driver_cost || 0}
                                    navigate={navigate}
                                />
                            </div>
                        </div>

                        {/* Recent Reviews + Vehicle Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4">
                            <div className="lg:col-span-6">
                                <RecentReviewsPanel
                                    reviews={reviewsData?.reviews}
                                    reviewsLoading={reviewsLoading}
                                    rb={rb}
                                    navigate={navigate}
                                />
                            </div>
                            <div className="lg:col-span-5">
                                <VehicleInfoPanel trip={vehicleTrip} profile={profile} />
                            </div>
                        </div>
                    </>
                )}

                {/* Schedule Timeline */}
                {!tripsLoading && allTrips.length > 0 && (
                    <ScheduleTimeline trips={allTrips} />
                )}

            </div>

            {/* Modals */}
            <AnimatePresence>
                {selectedTripId && (
                    <TripDetailModal bookingId={selectedTripId} onClose={() => setTripId(null)} />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {availModal && (
                    <AvailabilityModal
                        current={profile?.availability || false}
                        onConfirm={handleAvailability}
                        onClose={() => setAvailModal(false)}
                        loading={availLoading}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DriverDashboard;
