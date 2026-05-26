/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RTooltip, ResponsiveContainer } from 'recharts';
import { Car, AlertTriangle, X, RefreshCw, Search, Download, LayoutGrid, List, ChevronLeft, ChevronRight, Eye, Phone, MapPin, Calendar, DollarSign,
    CheckCircle, TrendingUp, TrendingDown, Copy, Star, ChevronDown,
    ChevronUp, Clock, Bell, AlertCircle, CheckCheck, XCircle, Inbox
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInMinutes, parseISO, isValid, isToday} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d, f = 'MMM dd, yyyy') => {
    try { const p = typeof d === 'string' ? parseISO(d) : new Date(d); return isValid(p) ? format(p, f) : '—'; }
    catch { return '—'; }
};
const fmtDateTime = (d) => fmtDate(d, 'MMM dd, yyyy HH:mm');
const fmtMoney = (v) => `৳${Number(v || 0).toLocaleString('en-IN')}`;
const safeParseISO = (d) => { try { const p = parseISO(d); return isValid(p) ? p : null; } catch { return null; } };

const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text).then(() => toast.success('Copied!'));
};

const STATUS_STYLE = {
    running:   { border: 'border-l-orange-500', bg: 'bg-orange-100 text-orange-700 border-orange-300', label: 'Ongoing', glow: true },
    ongoing:   { border: 'border-l-orange-500', bg: 'bg-orange-100 text-orange-700 border-orange-300', label: 'Ongoing', glow: true },
    confirmed: { border: 'border-l-blue-400',   bg: 'bg-blue-100 text-blue-700 border-blue-300',       label: 'Confirmed', glow: false },
    completed: { border: 'border-l-green-400',  bg: 'bg-green-100 text-green-700 border-green-300',    label: 'Completed', glow: false },
    cancelled: { border: 'border-l-red-400',    bg: 'bg-red-100 text-red-700 border-red-300',          label: 'Cancelled', glow: false },
    pending:   { border: 'border-l-amber-400',  bg: 'bg-amber-100 text-amber-700 border-amber-300',    label: 'Pending',  glow: false },
    requested: { border: 'border-l-amber-400',  bg: 'bg-amber-100 text-amber-700 border-amber-300',    label: 'Pending',  glow: false },
    overdue:   { border: 'border-l-red-500',    bg: 'bg-red-100 text-red-700 border-red-300',          label: 'Overdue',  glow: false },
};
const statusStyle = (status) => STATUS_STYLE[(status || '').toLowerCase()] || { border: 'border-l-gray-200', bg: 'bg-gray-100 text-gray-600 border-gray-200', label: status || '—', glow: false };

const cardBorder = (t) => {
    const key = (t.status || '').toLowerCase();
    if (key === 'running' || key === 'ongoing') return 'border-l-orange-500';
    if (key === 'cancelled') return 'border-l-red-400';
    if (key === 'completed') return 'border-l-green-400';
    if (key === 'confirmed') {
        const s = safeParseISO(t.start_ts);
        if (!s) return 'border-l-blue-400';
        const diff = differenceInMinutes(s, new Date());
        if (diff < 0) return 'border-l-red-400';
        if (diff < 120) return 'border-l-red-400';
        if (isToday(s)) return 'border-l-amber-400';
        return 'border-l-blue-400';
    }
    return 'border-l-gray-200';
};

const isStartingSoon = (t) => {
    if ((t.status || '').toLowerCase() !== 'confirmed') return false;
    const s = safeParseISO(t.start_ts);
    return s && differenceInMinutes(s, new Date()) < 120 && differenceInMinutes(s, new Date()) >= 0;
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────

const Skel = ({ className }) => <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status, size = 'sm' }) => {
    const s = statusStyle(status);
    const isActive = s.glow;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border ${s.bg} ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
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
                <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(n,100)}%` }} />
            </div>
            <span className={`text-xs font-bold ${text}`}>{n}%</span>
        </div>
    );
};

// ─── Stars ────────────────────────────────────────────────────────────────────

const Stars = ({ rating, size = 13 }) => (
    <span className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => <Star key={i} size={size} fill={i<=Math.round(rating)?'#F59E0B':'none'} stroke="#F59E0B" />)}
    </span>
);

// ─── Alert Banner ─────────────────────────────────────────────────────────────

const BCLR = {
    red:    'bg-red-50 border-red-300 text-red-800',
    amber:  'bg-amber-50 border-amber-300 text-amber-800',
    orange: 'bg-orange-50 border-orange-300 text-orange-800',
    blue:   'bg-blue-50 border-blue-300 text-blue-800',
};
const AlertBanner = ({ type, icon: Icon, message, action, onAction, onDismiss, noDismiss }) => (
    <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,height:0 }}
        className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${BCLR[type]}`}>
        <Icon size={15} className="mt-0.5 flex-shrink-0" />
        <span className="flex-1">{message}</span>
        {action && <button onClick={onAction} className="underline font-semibold whitespace-nowrap">{action} →</button>}
        {!noDismiss && <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100"><X size={13}/></button>}
    </motion.div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, trend, color, pulse, onClick }) => (
    <motion.button whileHover={{ y: -2 }} onClick={onClick}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left w-full hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={17} className="text-white" />
                {pulse && <span className="absolute w-2 h-2 rounded-full bg-green-400 animate-ping" />}
            </div>
            {trend !== undefined && (
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {trend >= 0 ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
                    {trend >= 0 ? '+' : ''}{trend}
                </span>
            )}
        </div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs font-semibold text-gray-700 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </motion.button>
);

// ─── Countdown Widget ─────────────────────────────────────────────────────────

const CountdownWidget = ({ nextTrip }) => {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    if (!nextTrip) return null;
    const start = safeParseISO(nextTrip.start_ts);
    if (!start) return null;
    const totalSec = Math.max(0, Math.floor((start - now) / 1000));
    const days  = Math.floor(totalSec / 86400);
    const hrs   = Math.floor((totalSec % 86400) / 3600);
    const mins  = Math.floor((totalSec % 3600) / 60);
    const secs  = totalSec % 60;
    const urgent = totalSec < 7200;

    return (
        <div className={`rounded-2xl p-4 border ${urgent ? 'bg-red-50 border-red-300 animate-pulse' : 'bg-gradient-to-r from-orange-500 to-amber-500'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${urgent ? 'text-red-600' : 'text-orange-100'}`}>
                        {urgent ? '⚡ Your next trip starts very soon!' : 'Next Trip In:'}
                    </p>
                    <div className={`flex gap-3 text-center ${urgent ? 'text-red-700' : 'text-white'}`}>
                        {[{v:days,l:'Days'},{v:hrs,l:'Hrs'},{v:mins,l:'Mins'},{v:secs,l:'Secs'}].map(({v,l}) => (
                            <div key={l}>
                                <p className="text-2xl font-black tabular-nums">{String(v).padStart(2,'0')}</p>
                                <p className="text-[10px] font-semibold opacity-70">{l}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`text-right text-xs ${urgent ? 'text-red-700' : 'text-orange-100'}`}>
                    <p className="font-bold">{nextTrip.customer_name}</p>
                    <p>{nextTrip.brand} {nextTrip.model}</p>
                    <p>{fmtDateTime(nextTrip.start_ts)}</p>
                    {nextTrip.estimated_destination && <p className="truncate max-w-32">📍 {nextTrip.estimated_destination}</p>}
                </div>
            </div>
        </div>
    );
};

// ─── Trip Detail Modal ─────────────────────────────────────────────────────────

const TripDetailModal = ({ bookingId, onClose }) => {
    const axiosPublic = useAxiosPublic();
    const [tab, setTab] = useState(0);

    const { data: d, isLoading } = useQuery({
        queryKey: ['tripDetail', bookingId],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverTrips/detail/${bookingId}`, { withCredentials: true });
            return r.data;
        },
        enabled: !!bookingId,
    });

    const TABS = ['Trip Overview', 'Pickup & Return', 'Earnings', 'Review'];
    const isComplete = d && (d.status||'').toLowerCase() === 'completed';

    return (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-6 px-3 pb-6 overflow-y-auto"
            onClick={onClose}>
            <motion.div initial={{ scale:0.96,y:-20 }} animate={{ scale:1,y:0 }} exit={{ scale:0.96,y:-20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
                onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <button onClick={() => copyToClipboard(bookingId)}
                            className="text-xs font-mono text-gray-500 hover:text-orange-600 flex items-center gap-1">
                            {bookingId} <Copy size={11}/>
                        </button>
                        {d && <StatusBadge status={d.status} size="lg"/>}
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16}/></button>
                </div>

                <div className="flex border-b border-gray-100 overflow-x-auto">
                    {TABS.map((t, i) => (
                        <button key={t} onClick={() => setTab(i)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${tab===i ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                <div className="p-5 max-h-[70vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="space-y-3">{[1,2,3,4].map(i=><Skel key={i} className="h-12 rounded-xl"/>)}</div>
                    ) : !d ? (
                        <p className="text-center text-gray-400 py-8">Failed to load trip details.</p>
                    ) : (
                        <>
                            {/* Tab 0: Overview */}
                            {tab === 0 && (
                                <div className="space-y-5">
                                    {/* Status timeline */}
                                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                                        {['Requested','Confirmed','Ongoing','Completed'].map((s,i,arr) => {
                                            const key = (d.status||'').toLowerCase();
                                            const doneIdx = key==='running'||key==='ongoing' ? 2 : key==='completed' ? 3 : key==='confirmed' ? 1 : 0;
                                            const done = i <= doneIdx;
                                            const active = i === doneIdx;
                                            return (
                                                <div key={s} className="flex items-center gap-1 flex-shrink-0">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                        active ? 'bg-orange-500 text-white ring-2 ring-orange-300 animate-pulse' :
                                                        done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                                                    }`}>{i+1}</div>
                                                    <span className={`text-[10px] font-medium ${done?'text-gray-700':'text-gray-400'}`}>{s}</span>
                                                    {i < arr.length-1 && <div className={`w-6 h-0.5 mx-1 rounded ${done?'bg-green-400':'bg-gray-200'}`}/>}
                                                </div>
                                            );
                                        })}
                                        {(d.status||'').toLowerCase() === 'cancelled' && (
                                            <div className="flex items-center gap-1 ml-2">
                                                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                                                    <X size={12} className="text-red-600"/>
                                                </div>
                                                <span className="text-[10px] text-red-500 font-medium">Cancelled</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Start Date', value: fmtDateTime(d.start_ts) },
                                            { label: 'End Date',   value: fmtDateTime(d.end_ts) },
                                            { label: 'Total Hours', value: d.total_rent_hours ? `${d.total_rent_hours} hrs` : '—' },
                                            { label: 'Booking Purpose', value: d.booking_purpose || '—' },
                                            { label: 'Destination', value: d.estimated_destination || '—' },
                                            { label: 'Booking Made', value: fmtDateTime(d.booking_ts) },
                                        ].map(({label,value}) => (
                                            <div key={label} className="py-2 border-b border-gray-100">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                                                <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Customer info */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs font-bold text-gray-600 mb-3">Customer</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-base">
                                                {(d.customer_name||'?').charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800 text-sm">{d.customer_name}</p>
                                                {d.customer_phone && <a href={`tel:${d.customer_phone}`} className="text-xs text-blue-500">{d.customer_phone}</a>}
                                            </div>
                                            {d.customer_phone && (
                                                <a href={`tel:${d.customer_phone}`}
                                                    className="flex items-center gap-1 px-3 py-1.5 border border-green-500 text-green-600 rounded-lg text-xs font-medium hover:bg-green-50">
                                                    <Phone size={12}/> Call
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Vehicle info */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs font-bold text-gray-600 mb-3">Vehicle</p>
                                        <div className="flex gap-3">
                                            {d.vehicle_images?.[0] && <img src={d.vehicle_images[0]} alt="" className="w-16 h-12 object-cover rounded-lg"/>}
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-gray-800">{d.brand} {d.model}</p>
                                                <p className="text-xs text-gray-500">{d.car_type} · {d.fuel} · {d.gear}</p>
                                                {d.transmission_type && <p className="text-xs text-gray-400">{d.transmission_type}</p>}
                                                {d.seats && <p className="text-xs text-gray-400">{d.seats} seats</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment summary */}
                                    <div className="border border-gray-100 rounded-xl p-4">
                                        <p className="text-xs font-bold text-gray-600 mb-3">Payment Summary</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm"><span className="text-gray-600">Total Cost</span><span className="font-bold">{fmtMoney(d.total_cost)}</span></div>
                                            <div className="flex justify-between text-sm"><span className="text-gray-600">Driver Earnings</span><span className="font-bold text-green-600">{fmtMoney(d.driver_cost)}</span></div>
                                            <hr className="border-gray-100"/>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Initial Payment</span>
                                                <span className={d.initial_payment ? 'text-green-600' : 'text-red-500'}>
                                                    {d.initial_payment ? '✔ Paid' : '✗ Not Paid'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Final Payment</span>
                                                <span className={d.final_payment ? 'text-green-600' : 'text-red-500'}>
                                                    {d.final_payment ? '✔ Paid' : '✗ Not Paid'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cancellation info */}
                                    {(d.status||'').toLowerCase() === 'cancelled' && d.cancelled_by && (
                                        <div className="border-2 border-red-200 rounded-xl p-4 bg-red-50">
                                            <p className="text-xs font-bold text-red-700 mb-2">Cancellation Details</p>
                                            <p className="text-sm text-red-800">Cancelled by: <span className="font-semibold">{d.cancelled_by}</span></p>
                                            {d.cancel_reason && <p className="text-xs text-red-600 italic mt-1">{d.cancel_reason}</p>}
                                            {d.cancelled_at && <p className="text-xs text-red-500 mt-1">{fmtDateTime(d.cancelled_at)}</p>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab 1: Pickup & Return */}
                            {tab === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 mb-3">Pickup Info</h4>
                                        {d.pickup ? (
                                            <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div><p className="text-[10px] text-gray-400 uppercase">Pickup Time</p><p className="text-sm font-medium">{fmtDateTime(d.pickup.pickup_time)}</p></div>
                                                    <div><p className="text-[10px] text-gray-400 uppercase">Odometer</p><p className="text-sm font-bold">{d.pickup.odometer_reading} km</p></div>
                                                </div>
                                                <div><p className="text-[10px] text-gray-400 uppercase mb-1">Fuel Level at Pickup</p><FuelGauge level={d.pickup.fuel_level}/></div>
                                                {d.pickup.pickup_notes && (
                                                    <div><p className="text-[10px] text-gray-400 uppercase">Pickup Notes</p>
                                                    <p className="text-sm text-gray-700 mt-1 p-2 bg-gray-50 rounded border border-gray-100">{d.pickup.pickup_notes}</p></div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400">
                                                <p className="text-sm">No pickup record found for this trip.</p>
                                                <p className="text-xs mt-1">Pickup details will appear here once recorded by the agency.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 mb-3">Return Info</h4>
                                        {d.return ? (
                                            <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div><p className="text-[10px] text-gray-400 uppercase">Return Time</p><p className="text-sm font-medium">{fmtDateTime(d.return.return_time)}</p></div>
                                                    <div><p className="text-[10px] text-gray-400 uppercase">Odometer</p><p className="text-sm font-bold">{d.return.odometer_reading} km</p></div>
                                                </div>
                                                <div><p className="text-[10px] text-gray-400 uppercase mb-1">Fuel Level at Return</p><FuelGauge level={d.return.fuel_level}/></div>
                                                {d.pickup && (
                                                    <div className="flex gap-4 text-sm bg-orange-50 rounded-lg p-3">
                                                        <div><p className="text-[10px] text-gray-400">Distance</p><p className="font-bold text-orange-600">{(d.return.odometer_reading - d.pickup.odometer_reading).toLocaleString()} km</p></div>
                                                        <div><p className="text-[10px] text-gray-400">Fuel Used</p><p className="font-bold text-orange-600">{d.pickup.fuel_level - d.return.fuel_level}%</p></div>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-3 gap-3 text-sm">
                                                    <div><p className="text-[10px] text-gray-400">Late Fee</p><p className={`font-bold ${d.return.late_fee > 0 ? 'text-red-600':'text-gray-400'}`}>{fmtMoney(d.return.late_fee)}</p></div>
                                                    <div><p className="text-[10px] text-gray-400">Fuel Charge</p><p className={`font-bold ${d.return.fuel_charge > 0 ? 'text-red-600':'text-gray-400'}`}>{fmtMoney(d.return.fuel_charge)}</p></div>
                                                    <div><p className="text-[10px] text-gray-400">Cleaning</p><p className={`font-bold ${d.return.cleaning_charge > 0 ? 'text-red-600':'text-gray-400'}`}>{fmtMoney(d.return.cleaning_charge)}</p></div>
                                                </div>
                                                {d.return.return_notes && (
                                                    <div><p className="text-[10px] text-gray-400">Return Notes</p>
                                                    <p className="text-sm text-gray-700 p-2 bg-gray-50 rounded border border-gray-100 mt-1">{d.return.return_notes}</p></div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400">
                                                <p className="text-sm">No return record found for this trip.</p>
                                                <p className="text-xs mt-1">Return details will appear here once recorded by the agency.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Earnings */}
                            {tab === 2 && (
                                <div className="space-y-5">
                                    <div className="text-center py-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Your Earnings</p>
                                        <p className="text-5xl font-black text-green-600">{fmtMoney(d.driver_cost)}</p>
                                        <p className="text-xs text-gray-400 mt-1">For this trip</p>
                                        <p className={`text-xs font-semibold mt-1 ${isComplete ? 'text-green-600' : (d.status||'').toLowerCase()==='cancelled' ? 'text-gray-400' : 'text-amber-600'}`}>
                                            {isComplete ? `Earned on ${fmtDate(d.end_ts)}` :
                                             (d.status||'').toLowerCase()==='cancelled' ? 'No earnings — trip cancelled' : '⏳ Payment pending'}
                                        </p>
                                    </div>

                                    <div className="border border-gray-100 rounded-xl p-4">
                                        <p className="text-xs font-bold text-gray-600 mb-3">Cost Breakdown</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm"><span className="text-gray-600">Total Booking Cost</span><span className="font-bold">{fmtMoney(d.total_cost)}</span></div>
                                            <div className="flex justify-between text-sm"><span className="text-green-700">Your Driver Fee</span><span className="font-bold text-green-600">{fmtMoney(d.driver_cost)}</span></div>
                                            <div className="flex justify-between text-sm text-gray-400"><span>Agency Share</span><span>{fmtMoney((d.total_cost||0)-(d.driver_cost||0))}</span></div>
                                        </div>
                                        {d.return && (
                                            <>
                                                <hr className="border-gray-100 my-3"/>
                                                <p className="text-[10px] text-gray-400 mb-2">Additional Charges (billed to customer)</p>
                                                <div className="space-y-1.5">
                                                    {[['Late Fee', d.return.late_fee],['Fuel Charge',d.return.fuel_charge],['Cleaning Charge',d.return.cleaning_charge]].map(([l,v]) => (
                                                        <div key={l} className="flex justify-between text-xs"><span className="text-gray-500">{l}</span><span className={v>0?'text-red-500 font-semibold':'text-gray-400'}>{fmtMoney(v)}</span></div>
                                                    ))}
                                                    <div className="flex justify-between text-xs font-bold"><span>Total Extra</span><span className="text-red-500">{fmtMoney((d.return.late_fee||0)+(d.return.fuel_charge||0)+(d.return.cleaning_charge||0))}</span></div>
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-2">These charges are billed to the customer, not deducted from your earnings.</p>
                                            </>
                                        )}
                                    </div>

                                    {d.payments?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-600 mb-2">Payment Records</p>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs">
                                                    <thead><tr className="bg-gray-50 text-gray-500 text-left">
                                                        {['Amount','Method','Trx ID','Date','For'].map(h=><th key={h} className="px-2 py-2 font-semibold">{h}</th>)}
                                                    </tr></thead>
                                                    <tbody>{d.payments.map((p,i)=>(
                                                        <tr key={i} className="border-b border-gray-50">
                                                            <td className="px-2 py-2 font-bold text-green-600">{fmtMoney(p.amount)}</td>
                                                            <td className="px-2 py-2">{p.method_type||'—'}</td>
                                                            <td className="px-2 py-2 font-mono text-[10px] text-gray-400">{p.trx_id||'—'}</td>
                                                            <td className="px-2 py-2">{fmtDate(p.date||p.payment_ts)}</td>
                                                            <td className="px-2 py-2">{p.payment_for||'—'}</td>
                                                        </tr>
                                                    ))}</tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab 3: Review */}
                            {tab === 3 && (
                                <div className="py-2">
                                    {!isComplete ? (
                                        <div className="text-center py-10 text-gray-400">
                                            <Star size={36} className="mx-auto mb-2 opacity-30"/>
                                            <p className="text-sm">Reviews are available after trip completion.</p>
                                        </div>
                                    ) : d.review ? (
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-bold text-gray-800">Customer Review</h4>
                                            <div className={`border-l-4 rounded-xl p-4 ${d.review.rating>=4?'border-l-green-400':d.review.rating===3?'border-l-amber-400':'border-l-red-400'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                                                            {(d.review.reviewer_name||'?').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold">
                                                                {d.review.reviewer_name ? d.review.reviewer_name.split(' ')[0]+' '+(d.review.reviewer_name.split(' ')[1]?.[0]||'')+'.' : 'Anonymous'}
                                                            </p>
                                                            <p className="text-xs text-gray-400">{fmtDate(d.review.date)}</p>
                                                        </div>
                                                    </div>
                                                    <Stars rating={d.review.rating} size={15}/>
                                                </div>
                                                <p className="text-sm text-gray-700">{d.review.review || <span className="italic text-gray-400">Rating only — no written review</span>}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-gray-400">
                                            <Star size={36} className="mx-auto mb-2 opacity-30"/>
                                            <p className="text-sm font-medium">No review yet for this trip.</p>
                                            <p className="text-xs mt-1">Reviews may take a few days after trip completion.</p>
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

// ─── Trip Card ────────────────────────────────────────────────────────────────

const TripCard = ({ trip, now, onView }) => {
    const s = statusStyle(trip.status);
    const isOngoing = s.glow;
    const soonBadge = isStartingSoon(trip);
    const isLong = (trip.total_rent_hours || 0) > 24;
    const borderC = `${cardBorder(trip)} ${isLong && !isOngoing ? 'border-l-purple-400' : ''}`;

    const elapsedMins = isOngoing && trip.start_ts ? differenceInMinutes(now, parseISO(trip.start_ts)) : 0;
    const elapsedHrs  = Math.floor(elapsedMins / 60);
    const elapsedRem  = elapsedMins % 60;

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${borderC} transition-shadow hover:shadow-md ${isOngoing ? 'ring-1 ring-orange-200' : ''} ${(trip.status||'').toLowerCase()==='cancelled' ? 'opacity-70' : ''}`}>
            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={trip.status}/>
                        {soonBadge && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold animate-pulse">⚡ Starting Soon</span>}
                        {isLong && <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[10px] font-semibold">Long Trip</span>}
                    </div>
                    <button onClick={() => copyToClipboard(trip.booking_id)}
                        title={trip.booking_id}
                        className="text-[10px] font-mono text-gray-400 hover:text-orange-600 flex items-center gap-0.5">
                        {trip.booking_id.slice(0,12)}… <Copy size={9}/>
                    </button>
                </div>

                {isOngoing && (
                    <div className="bg-orange-50 rounded-lg px-3 py-2 mb-3 text-xs text-orange-700 font-semibold">
                        🚗 Duration: {elapsedHrs}h {elapsedRem}m elapsed
                    </div>
                )}

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                            {(trip.customer_name||'?').charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">{trip.customer_name}</p>
                            {trip.customer_phone && (
                                <a href={`tel:${trip.customer_phone}`} className="text-xs text-gray-400 hover:text-blue-500">{trip.customer_phone}</a>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Car size={12} className="text-orange-400 shrink-0"/>
                        <span className="font-semibold">{trip.brand} {trip.model}</span>
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">{(trip.vehicle_type||'').toUpperCase()}</span>
                        {trip.car_type && <span className="text-gray-400">{trip.car_type}</span>}
                    </div>

                    <div className="text-xs text-gray-500 space-y-0.5">
                        <p className="flex items-center gap-1"><Calendar size={11}/> {fmtDateTime(trip.start_ts)}</p>
                        <p className="flex items-center gap-1 pl-3.5">→ {fmtDateTime(trip.end_ts)}</p>
                        {trip.total_rent_hours && <p className="text-orange-600 font-bold pl-3.5">{trip.total_rent_hours} hrs total</p>}
                    </div>

                    {trip.estimated_destination && (
                        <p className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={11} className="shrink-0 text-gray-400"/> <span className="truncate">{trip.estimated_destination}</span></p>
                    )}

                    {(trip.status||'').toLowerCase() === 'completed' && trip.driver_cost && (
                        <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                            <DollarSign size={12}/> Driver Earnings: {fmtMoney(trip.driver_cost)}
                        </div>
                    )}

                    {(trip.status||'').toLowerCase() === 'cancelled' && trip.cancelled_by && (
                        <div className="text-xs text-red-500">
                            <p>✗ Cancelled by: {trip.cancelled_by}</p>
                            {trip.cancel_reason && <p className="italic text-gray-400 mt-0.5">{trip.cancel_reason}</p>}
                        </div>
                    )}
                </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs border border-orange-200 px-2 py-0.5 rounded-full text-orange-600">
                    {trip.total_rent_hours ? `${trip.total_rent_hours} hrs` : '—'}
                </span>
                <button onClick={() => onView(trip.booking_id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-orange-500 text-orange-600 rounded-xl hover:bg-orange-50 transition-colors">
                    <Eye size={12}/> View Details
                </button>
            </div>
        </div>
    );
};

// ─── Trip Requests Panel ──────────────────────────────────────────────────────

const TripRequestsPanel = ({ driverId, onResponded }) => {
    const axiosPublic = useAxiosPublic();
    const [responding, setResponding] = useState({});
    const [rejectNote, setRejectNote] = useState({});
    const [showNoteFor, setShowNoteFor] = useState(null);

    const { data: requests = [], isLoading, refetch } = useQuery({
        queryKey: ['driverRequests', driverId],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverTrips/requests/${driverId}`, { withCredentials: true });
            return r.data;
        },
        enabled: !!driverId,
        refetchInterval: 30000,
    });

    const respond = async (assignmentId, action, note) => {
        setResponding(s => ({ ...s, [assignmentId]: action }));
        try {
            await axiosPublic.post(`/driverTrips/requests/${assignmentId}/respond`, { action, driver_note: note || undefined }, { withCredentials: true });
            toast.success(action === 'accept' ? '✅ Trip accepted!' : '❌ Trip rejected');
            refetch();
            onResponded?.();
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to respond');
        } finally {
            setResponding(s => ({ ...s, [assignmentId]: null }));
            setShowNoteFor(null);
        }
    };

    if (isLoading) return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1"><Inbox size={16} className="text-orange-500"/><span className="font-bold text-gray-700">Trip Requests</span></div>
            {[1,2].map(i => <Skel key={i} className="h-28 rounded-xl"/>)}
        </div>
    );

    if (!requests.length) return (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <Inbox size={36} className="mx-auto mb-2 text-gray-300"/>
            <p className="text-sm font-semibold text-gray-500">No pending trip requests</p>
            <p className="text-xs text-gray-400 mt-1">New requests from customers will appear here.</p>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-orange-50 bg-orange-50/60">
                <div className="flex items-center gap-2">
                    <Inbox size={16} className="text-orange-500"/>
                    <span className="font-bold text-gray-800">Trip Requests</span>
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{requests.length}</span>
                </div>
                <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-orange-100 text-gray-400">
                    <RefreshCw size={13}/>
                </button>
            </div>

            <div className="divide-y divide-gray-50">
                {requests.map(req => (
                    <div key={req.assignment_id} className="p-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex gap-3">
                            {/* Vehicle image */}
                            <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                {req.vehicle_image
                                    ? <img src={req.vehicle_image} alt="" className="w-full h-full object-cover"/>
                                    : <div className="w-full h-full flex items-center justify-center"><Car size={20} className="text-gray-300"/></div>
                                }
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{req.brand} {req.model}</p>
                                        <p className="text-xs text-gray-400">{req.agency_name || 'Agency'} · {req.car_type}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                                        {formatDistanceToNow(new Date(req.assigned_at), { addSuffix: true })}
                                    </span>
                                </div>

                                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                                    <span className="flex items-center gap-1"><Calendar size={10}/>{fmtDateTime(req.start_ts)} → {fmtDateTime(req.end_ts)}</span>
                                    <span className="flex items-center gap-1"><Clock size={10}/>{req.total_rent_hours} hrs</span>
                                    {req.estimated_destination && <span className="flex items-center gap-1"><MapPin size={10} className="shrink-0"/><span className="truncate max-w-32">{req.estimated_destination}</span></span>}
                                </div>

                                <div className="mt-1.5 flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                                            {(req.customer_name || '?').charAt(0)}
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700">{req.customer_name}</span>
                                        {req.customer_phone && (
                                            <a href={`tel:${req.customer_phone}`} className="text-xs text-blue-500 hover:underline">{req.customer_phone}</a>
                                        )}
                                    </div>
                                    <span className="ml-auto text-sm font-black text-green-600">{fmtMoney(req.driver_cost)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Reject note input */}
                        {showNoteFor === req.assignment_id && (
                            <div className="mt-3 flex gap-2">
                                <input
                                    value={rejectNote[req.assignment_id] || ''}
                                    onChange={e => setRejectNote(s => ({ ...s, [req.assignment_id]: e.target.value }))}
                                    placeholder="Reason for rejection (optional)"
                                    className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-300"
                                />
                                <button
                                    onClick={() => respond(req.assignment_id, 'reject', rejectNote[req.assignment_id])}
                                    disabled={!!responding[req.assignment_id]}
                                    className="px-4 py-2 text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl disabled:opacity-50"
                                >
                                    {responding[req.assignment_id] === 'reject' ? '…' : 'Confirm'}
                                </button>
                                <button onClick={() => setShowNoteFor(null)} className="px-3 py-2 text-xs border border-gray-200 rounded-xl hover:bg-gray-50">
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* Action buttons */}
                        {showNoteFor !== req.assignment_id && (
                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={() => respond(req.assignment_id, 'accept')}
                                    disabled={!!responding[req.assignment_id]}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl disabled:opacity-50 transition-colors"
                                >
                                    {responding[req.assignment_id] === 'accept'
                                        ? <><RefreshCw size={12} className="animate-spin"/> Accepting…</>
                                        : <><CheckCheck size={12}/> Accept Trip</>
                                    }
                                </button>
                                <button
                                    onClick={() => setShowNoteFor(req.assignment_id)}
                                    disabled={!!responding[req.assignment_id]}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold border border-red-300 text-red-500 hover:bg-red-50 rounded-xl disabled:opacity-50 transition-colors"
                                >
                                    <XCircle size={12}/> Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Earnings Summary Panel ───────────────────────────────────────────────────

const EarningsSummaryPanel = ({ driverId }) => {
    const axiosPublic = useAxiosPublic();
    const { data } = useQuery({
        queryKey: ['tripEarnings', driverId],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverTrips/earnings/${driverId}`, { withCredentials: true });
            return r.data;
        },
        enabled: !!driverId,
    });

    const lt = data?.lifetime;
    const medals = ['🥇','🥈','🥉'];
    const lastMonthPct = lt?.last_month > 0 ? Math.round(((lt.this_month - lt.last_month) / lt.last_month) * 100) : 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'This Week', value: fmtMoney(lt?.this_week), color: 'text-orange-600' },
                    { label: 'This Month', value: fmtMoney(lt?.this_month), color: 'text-orange-600' },
                    { label: 'Last Month', value: fmtMoney(lt?.last_month), color: 'text-gray-600' },
                    { label: 'All Time', value: fmtMoney(lt?.all_time), color: 'text-green-600' },
                ].map(({label,value,color}) => (
                    <div key={label} className="text-center">
                        <p className={`text-lg font-black ${color}`}>{value}</p>
                        <p className="text-xs text-gray-400">{label}</p>
                    </div>
                ))}
            </div>

            {lt?.last_month > 0 && (
                <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>This month vs last month</span>
                        <span className={lastMonthPct >= 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                            {lastMonthPct >= 0 ? '+' : ''}{lastMonthPct}%
                        </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${lastMonthPct >= 0 ? 'bg-green-500' : 'bg-red-400'} rounded-full`}
                            style={{ width: `${Math.min(Math.abs(lastMonthPct), 100)}%` }} />
                    </div>
                </div>
            )}

            {data?.chart && (
                <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Last 12 Months</p>
                    <ResponsiveContainer width="100%" height={120}>
                        <AreaChart data={data.chart} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
                            <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false}/>
                            <YAxis hide/>
                            <RTooltip formatter={(v) => [fmtMoney(v), 'Earned']} contentStyle={{ fontSize: 11 }}/>
                            <Area type="monotone" dataKey="earned" stroke="#F97316" strokeWidth={2} fill="url(#earnGrad)"/>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {data?.top3?.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Top Earning Trips</p>
                    <div className="space-y-2">
                        {data.top3.map((t, i) => (
                            <div key={t.booking_id} className="flex items-center gap-3 text-sm">
                                <span className="text-base">{medals[i]}</span>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{t.brand} {t.model}</p>
                                    <p className="text-xs text-gray-400">{t.customer_name} · {fmtDate(t.start_ts)}</p>
                                </div>
                                <span className="font-black text-green-600">{fmtMoney(t.driver_cost)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DriverTrips = () => {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Driver profile (to get driverId)
    const { data: driverProfile } = useQuery({
        queryKey: ['driverFullProfile', user?.email],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverProfile/full/${user.email}`, { withCredentials: true });
            return r.data;
        },
        enabled: !!user?.email,
    });
    const driverId = driverProfile?.driver_id;

    // State
    const [viewMode, setViewMode]       = useState(() => localStorage.getItem('driver_trips_view') || 'card');
    const [page, setPage]               = useState(1);
    const [pageSize, setPageSize]       = useState(10);
    const [search, setSearch]           = useState('');
    const [debouncedSearch, setDSearch] = useState('');
    const [statusFilter, setStatus]     = useState('all');
    const [vehicleType, setVType]       = useState('all');
    const [purpose, setPurpose]         = useState('all');
    const [startDate, setStartDate]     = useState('');
    const [endDate, setEndDate]         = useState('');
    const [sort, setSort]               = useState('newest');
    const [earningsRange, setERange]    = useState('all');
    const [quickFilter, setQuick]       = useState('all');
    const [earningsPanelOpen, setEP]    = useState(false);
    const [selectedBookingId, setSelId] = useState(null);
    const [dismissed, setDismissed]     = useState({});
    const [now, setNow]                 = useState(new Date());
    const searchTimer                   = useRef(null);
    const prevTotal                     = useRef(null);

    // Live clock (for elapsed/countdown)
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    // Debounce search
    useEffect(() => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => setDSearch(search), 300);
        return () => clearTimeout(searchTimer.current);
    }, [search]);

    // Reset page when filters change
    useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, vehicleType, purpose, startDate, endDate, sort, earningsRange, quickFilter]);

    const setView = useCallback((v) => { setViewMode(v); localStorage.setItem('driver_trips_view', v); }, []);

    // Stats query
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['tripsStats', driverId],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverTrips/stats/${driverId}`, { withCredentials: true });
            return r.data;
        },
        enabled: !!driverId,
    });

    // Banners query
    const { data: banners } = useQuery({
        queryKey: ['tripsBanners', driverId],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverTrips/banners/${driverId}`, { withCredentials: true });
            return r.data;
        },
        enabled: !!driverId,
        refetchInterval: 60000,
    });

    // Trip list query
    const params = new URLSearchParams({
        page, limit: pageSize, sort,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(vehicleType !== 'all' && { vehicleType }),
        ...(purpose !== 'all' && { purpose }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(earningsRange !== 'all' && { earningsRange }),
        ...(quickFilter !== 'all' && { quickFilter }),
    });

    const { data: tripData, isLoading: listLoading, dataUpdatedAt } = useQuery({
        queryKey: ['tripsList', driverId, params.toString()],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverTrips/list/${driverId}?${params}`, { withCredentials: true });
            return r.data;
        },
        enabled: !!driverId,
        refetchInterval: 60000,
        keepPreviousData: true,
    });

    // Detect new assignments
    useEffect(() => {
        if (tripData?.total !== undefined && prevTotal.current !== null && tripData.total > prevTotal.current) {
            toast('🔔 New trip assigned!', { icon: '✅' });
        }
        if (tripData?.total !== undefined) prevTotal.current = tripData.total;
    }, [tripData?.total]);

    const refresh = () => {
        queryClient.invalidateQueries(['tripsList', driverId]);
        queryClient.invalidateQueries(['tripsStats', driverId]);
        queryClient.invalidateQueries(['tripsBanners', driverId]);
    };

    const lastUpdated = dataUpdatedAt ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true }) : null;

    // Export CSV
    const exportCSV = () => {
        if (!tripData?.trips?.length) return toast.error('No trips to export');
        const hdr = ['Booking ID','Start Date','End Date','Customer','Phone','Vehicle','Vehicle Type','Hours','Driver Earnings','Total Cost','Status','Destination'];
        const rows = tripData.trips.map(t => [
            t.booking_id, fmtDateTime(t.start_ts), fmtDateTime(t.end_ts),
            t.customer_name, t.customer_phone || '',
            `${t.brand} ${t.model}`, t.vehicle_type,
            t.total_rent_hours || '', t.driver_cost || 0, t.total_cost || 0,
            t.status, t.estimated_destination || '',
        ]);
        const csv = [hdr, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = 'my-trips.csv'; a.click();
    };

    // Build visible banners
    const bannerList = banners ? [
        banners.activeTrip && {
            id: 'active', type: 'red', icon: Car, noDismiss: true,
            message: `🚗 You have an active trip in progress. Booking #${banners.activeTrip.booking_id} started at ${fmtDateTime(banners.activeTrip.start_ts)}.`,
            action: 'View Trip', onAction: () => setSelId(banners.activeTrip.booking_id),
        },
        banners.upcomingToday && {
            id: 'today', type: 'amber', icon: Clock,
            message: `⏰ You have a trip scheduled today at ${fmtDate(banners.upcomingToday.start_ts, 'HH:mm')} with ${banners.upcomingToday.customer_name}.`,
            action: 'View Details', onAction: () => setSelId(banners.upcomingToday.booking_id),
        },
        banners.upcomingTomorrow && {
            id: 'tomorrow', type: 'amber', icon: Calendar,
            message: `📅 You have a trip scheduled tomorrow at ${fmtDate(banners.upcomingTomorrow.start_ts, 'HH:mm')}. Prepare in advance.`,
            action: 'View Details', onAction: () => setSelId(banners.upcomingTomorrow.booking_id),
        },
        banners.missedPickup && {
            id: 'missed', type: 'orange', icon: AlertTriangle,
            message: `📋 Booking #${banners.missedPickup.booking_id} is confirmed but pickup has not been recorded yet. Contact your agency.`,
        },
        banners.newAssignment && {
            id: 'new', type: 'blue', icon: Bell,
            message: `✅ A new trip has been assigned to you. Booking #${banners.newAssignment.booking_id} starts on ${fmtDate(banners.newAssignment.start_ts)}.`,
            action: 'View Now', onAction: () => setSelId(banners.newAssignment.booking_id),
        },
    ].filter(Boolean) : [];
    const visibleBanners = bannerList.filter(b => !dismissed[b.id]);

    const QUICK_PILLS = [
        { id: 'all',          label: 'All Trips',           color: '' },
        { id: 'ongoing',      label: '● Ongoing',           color: 'text-orange-600 border-orange-300' },
        { id: 'upcoming',     label: 'Upcoming',            color: 'text-blue-600 border-blue-300' },
        { id: 'completed',    label: 'Completed',           color: 'text-green-600 border-green-300' },
        { id: 'cancelled',    label: 'Cancelled',           color: 'text-red-500 border-red-300' },
        { id: 'thisweek',     label: 'This Week',           color: '' },
        { id: 'thismonth',    label: 'This Month',          color: '' },
        { id: 'lastmonth',    label: 'Last Month',          color: '' },
        { id: 'highearnings', label: 'High Earnings >৳2K', color: 'text-green-600 border-green-300' },
        { id: 'longtrips',    label: 'Long Trips >24h',     color: 'text-purple-600 border-purple-300' },
    ];

    const trips = tripData?.trips || [];
    const totalTrips = tripData?.total || 0;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">My Trips</h1>
                        <p className="text-sm text-gray-500">View and track all your assigned trips and earnings.</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        {lastUpdated && <p className="text-xs text-gray-400 hidden sm:block">Updated {lastUpdated}</p>}
                        <button onClick={refresh} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
                            <RefreshCw size={14} className="text-gray-500"/>
                        </button>
                    </div>
                </div>

                {/* Alert Banners */}
                <AnimatePresence>
                    {visibleBanners.map(b => (
                        <AlertBanner key={b.id} {...b} onDismiss={() => setDismissed(d => ({ ...d, [b.id]: true }))}/>
                    ))}
                </AnimatePresence>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                    {statsLoading ? (
                        Array.from({length:6}).map((_,i) => <Skel key={i} className="h-24 rounded-2xl"/>)
                    ) : (
                        <>
                            <StatCard icon={Car} label="Total Trips" value={stats?.total ?? '—'} sub="All time assignments" color="bg-orange-500" onClick={() => { setQuick('all'); setStatus('all'); }}/>
                            <StatCard icon={CheckCircle} label="Completed" value={stats?.completed ?? '—'} sub="Successfully delivered" color="bg-green-500" trend={stats?.completedThisMonth} onClick={() => setStatus('completed')}/>
                            <StatCard icon={Car} label="Ongoing" value={stats?.ongoing ?? '—'} sub="Currently active" color="bg-blue-500" pulse={!!stats?.ongoing} onClick={() => setQuick('ongoing')}/>
                            <StatCard icon={Calendar} label="Upcoming" value={stats?.upcoming ?? '—'} sub="Scheduled trips" color="bg-amber-500" onClick={() => setQuick('upcoming')}/>
                            <StatCard icon={AlertCircle} label="Cancelled" value={stats?.cancelled ?? '—'} sub="Cancelled bookings" color="bg-red-500" onClick={() => setStatus('cancelled')}/>
                            <StatCard icon={DollarSign} label="Total Earnings" value={fmtMoney(stats?.totalEarned)} sub="From completed trips" color="bg-green-600"
                                trend={stats?.earnedLastMonth > 0 ? Math.round(((stats.earnedThisMonth - stats.earnedLastMonth) / stats.earnedLastMonth) * 100) : undefined}
                                onClick={() => setQuick('highearnings')}/>
                        </>
                    )}
                </div>

                {/* Countdown Widget */}
                {banners?.nextTrip && <CountdownWidget nextTrip={banners.nextTrip}/>}

                {/* Trip Requests */}
                {driverId && (
                    <TripRequestsPanel
                        driverId={driverId}
                        onResponded={refresh}
                    />
                )}

                {/* Filter Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                        <div className="relative flex-1 min-w-44">
                            <Search size={14} className="absolute left-3 top-2.5 text-gray-400"/>
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search trips, customer, vehicle…"
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                        </div>
                        {[
                            { value: statusFilter, onChange: setStatus, options: [['all','All Status'],['confirmed','Confirmed'],['ongoing','Ongoing'],['completed','Completed'],['cancelled','Cancelled'],['pending','Pending']] },
                            { value: vehicleType, onChange: setVType, options: [['all','All Vehicles'],['car','Car'],['bike','Bike']] },
                        ].map((s, i) => (
                            <select key={i} value={s.value} onChange={e => s.onChange(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                                {s.options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        ))}
                        {stats?.purposes?.length > 0 && (
                            <select value={purpose} onChange={e => setPurpose(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                                <option value="all">All Purposes</option>
                                {stats.purposes.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        )}
                        <select value={sort} onChange={e => setSort(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="startasc">Trip Date ↑</option>
                            <option value="startdesc">Trip Date ↓</option>
                            <option value="highearnings">Highest Earnings</option>
                            <option value="lowearnings">Lowest Earnings</option>
                        </select>
                        <select value={earningsRange} onChange={e => setERange(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                            <option value="all">All Earnings</option>
                            <option value="none">No Earnings</option>
                            <option value="under500">Under ৳500</option>
                            <option value="500to2000">৳500–৳2,000</option>
                            <option value="2000to5000">৳2,000–৳5,000</option>
                            <option value="above5000">Above ৳5,000</option>
                        </select>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                            className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                        <span className="text-gray-400 text-xs">→</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                            className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                        {(startDate || endDate) && (
                            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-xs text-orange-500 hover:underline">Clear dates</button>
                        )}
                        <div className="ml-auto flex items-center gap-2">
                            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                                <button onClick={() => setView('card')}
                                    className={`p-2 ${viewMode==='card'?'bg-orange-500 text-white':'text-gray-500 hover:bg-gray-50'}`}>
                                    <LayoutGrid size={14}/>
                                </button>
                                <button onClick={() => setView('table')}
                                    className={`p-2 ${viewMode==='table'?'bg-orange-500 text-white':'text-gray-500 hover:bg-gray-50'}`}>
                                    <List size={14}/>
                                </button>
                            </div>
                            <button onClick={exportCSV}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
                                <Download size={12}/> Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Pills */}
                <div className="flex flex-wrap gap-2">
                    {QUICK_PILLS.map(p => (
                        <button key={p.id} onClick={() => setQuick(p.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                                quickFilter === p.id
                                    ? 'bg-orange-500 border-orange-500 text-white'
                                    : `border-gray-200 text-gray-600 hover:border-orange-300 ${p.color}`
                            }`}>
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Trip List */}
                <div>
                    {listLoading ? (
                        viewMode === 'card' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Array.from({length:4}).map((_,i) => <Skel key={i} className="h-52 rounded-2xl"/>)}
                            </div>
                        ) : (
                            <Skel className="h-64 rounded-2xl"/>
                        )
                    ) : !trips.length ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                            <Car size={48} className="mx-auto mb-3 text-gray-300"/>
                            <p className="text-base font-semibold text-gray-600">
                                {totalTrips === 0 ? 'No trips assigned yet.' : 'No trips match your filters.'}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                {totalTrips === 0
                                    ? 'Your agency will assign trips to you. Make sure your availability is turned on.'
                                    : 'Try adjusting your search or filters.'}
                            </p>
                            <div className="flex justify-center gap-3 mt-4">
                                {totalTrips === 0 ? (
                                    <button onClick={() => navigate('/dashboard/driver/profile')}
                                        className="px-4 py-2 bg-orange-500 text-white text-sm rounded-xl hover:bg-orange-600">
                                        Update Availability →
                                    </button>
                                ) : (
                                    <button onClick={() => { setQuick('all'); setStatus('all'); setSearch(''); setStartDate(''); setEndDate(''); }}
                                        className="px-4 py-2 text-sm text-orange-600 hover:underline">
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : viewMode === 'card' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {trips.map(t => <TripCard key={t.booking_id} trip={t} now={now} onView={setSelId}/>)}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-left text-xs">
                                            {['Booking ID','Customer','Vehicle','Trip Period','Destination','Earnings','Status',''].map(h => (
                                                <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trips.map((t) => {
                                            const s = statusStyle(t.status);
                                            const isActive = s.glow;
                                            return (
                                                <tr key={t.booking_id}
                                                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${isActive ? 'bg-orange-50/40' : ''} ${(t.status||'').toLowerCase()==='cancelled' ? 'opacity-60' : ''}`}
                                                    style={{ borderLeft: `3px solid`, borderLeftColor: isActive ? '#F97316' : (t.status||'').toLowerCase()==='completed' ? '#22C55E' : (t.status||'').toLowerCase()==='cancelled' ? '#EF4444' : '#3B82F6' }}>
                                                    <td className="px-4 py-3">
                                                        <button onClick={() => copyToClipboard(t.booking_id)} title={t.booking_id}
                                                            className="font-mono text-xs text-gray-500 hover:text-orange-600 flex items-center gap-1">
                                                            {t.booking_id.slice(0,14)}… <Copy size={9}/>
                                                        </button>
                                                        {isActive && <span className="text-[10px] text-orange-500 font-bold">🚗 ACTIVE</span>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-bold text-gray-800">{t.customer_name}</p>
                                                        {t.customer_phone && <p className="text-xs text-gray-400">{t.customer_phone}</p>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-bold">{t.brand} {t.model}</p>
                                                        <span className="text-xs text-gray-400">{(t.vehicle_type||'').toUpperCase()}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="text-xs">{fmtDate(t.start_ts,'MMM dd')} → {fmtDate(t.end_ts,'MMM dd, yy')}</p>
                                                        {t.total_rent_hours && <p className="text-xs text-gray-400">{t.total_rent_hours} hrs</p>}
                                                    </td>
                                                    <td className="px-4 py-3 max-w-32">
                                                        <p className="text-xs truncate">{t.estimated_destination || '—'}</p>
                                                        {t.booking_purpose && <p className="text-[10px] text-gray-400">{t.booking_purpose}</p>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {(t.status||'').toLowerCase()==='completed' && t.driver_cost
                                                            ? <span className="font-bold text-green-600">{fmtMoney(t.driver_cost)}</span>
                                                            : <span className="text-gray-300">—</span>}
                                                    </td>
                                                    <td className="px-4 py-3"><StatusBadge status={t.status}/></td>
                                                    <td className="px-4 py-3">
                                                        <button onClick={() => setSelId(t.booking_id)}
                                                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-orange-50 hover:border-orange-300 text-gray-500 hover:text-orange-600">
                                                            <Eye size={14}/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalTrips > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3">
                        <p className="text-xs text-gray-500">
                            {((page-1)*pageSize)+1}–{Math.min(page*pageSize, totalTrips)} of {totalTrips} trips
                            {tripData?.filteredEarnings > 0 && (
                                <span className="ml-2 text-green-600 font-semibold">· {fmtMoney(tripData.filteredEarnings)} earned</span>
                            )}
                        </p>
                        <div className="flex items-center gap-2">
                            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400">
                                {[10,25,50].map(n => <option key={n} value={n}>{n} per page</option>)}
                            </select>
                            <button onClick={() => setPage(p => p-1)} disabled={page===1}
                                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                                <ChevronLeft size={14}/>
                            </button>
                            <span className="text-xs text-gray-500">{page} / {tripData?.totalPages || 1}</span>
                            <button onClick={() => setPage(p => p+1)} disabled={page>=(tripData?.totalPages||1)}
                                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                                <ChevronRight size={14}/>
                            </button>
                        </div>
                    </div>
                )}

                {/* Earnings Summary Panel */}
                {driverId && (
                    <div>
                        <button onClick={() => setEP(o => !o)}
                            className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:underline">
                            {earningsPanelOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                            {earningsPanelOpen ? 'Hide Earnings Summary' : 'Show Earnings Summary'}
                        </button>
                        <AnimatePresence>
                            {earningsPanelOpen && (
                                <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }} className="overflow-hidden mt-3">
                                    <EarningsSummaryPanel driverId={driverId}/>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Trip Detail Modal */}
            <AnimatePresence>
                {selectedBookingId && (
                    <TripDetailModal bookingId={selectedBookingId} onClose={() => setSelId(null)}/>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DriverTrips;
