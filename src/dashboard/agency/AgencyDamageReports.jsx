/* eslint-disable react/prop-types */
import { useState, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Search, ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
    Car, Eye, Edit2, DollarSign, ArrowRight, Download, Calendar, Copy, Check,
    X, Clock, CheckCircle, AlertCircle, Wrench, Camera, FileText, User,
    CreditCard, RefreshCw, Layers, Filter
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_UI = { 'Pending': 'Open', 'On-Review': 'Under Review', 'Resolved': 'Resolved' };
const STATUS_DB = { 'Open': 'Pending', 'Under Review': 'On-Review', 'Resolved': 'Resolved' };
const SEV_UI = { 'Low': 'Minor', 'Medium': 'Moderate', 'High': 'Severe' };

const SEV_STYLE = {
    High: { label: 'Severe', dot: '●●●', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    Medium: { label: 'Moderate', dot: '●●', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    Low: { label: 'Minor', dot: '●', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
};

const STATUS_STYLE = {
    Pending: { label: 'Open', bg: 'bg-red-100', text: 'text-red-700', icon: '🔴' },
    'On-Review': { label: 'Under Review', bg: 'bg-amber-100', text: 'text-amber-700', icon: '🟡' },
    Resolved: { label: 'Resolved', bg: 'bg-green-100', text: 'text-green-700', icon: '✓' }
};

const PAYMENT_METHODS = ['Cash', 'bKash', 'Nagad', 'Card', 'Bank Transfer'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) => {
    try { const p = typeof d === 'string' ? parseISO(d) : new Date(d); return isValid(p) ? format(p, 'MMM dd, yyyy') : '—'; }
    catch { return '—'; }
};
const daysAgo = (d) => {
    try { const diff = differenceInDays(new Date(), typeof d === 'string' ? parseISO(d) : new Date(d)); return diff === 0 ? 'Today' : `${diff}d ago`; }
    catch { return ''; }
};
const fmtCost = (v) => v ? `৳${Number(v).toLocaleString()}` : null;
const getFirstImg = (imgs) => {
    try { const a = typeof imgs === 'string' ? JSON.parse(imgs) : imgs; return Array.isArray(a) ? a[0] : null; }
    catch { return null; }
};
const rowBorderClass = (r) => {
    if (!r.estimated_cost || r.estimated_cost == 0) return 'border-l-4 border-l-orange-300 border-dashed';
    if (r.severity === 'High' && r.status === 'Pending') return 'border-l-4 border-l-red-600';
    if (r.severity === 'High' && r.status === 'On-Review') return 'border-l-4 border-l-red-300';
    if (r.severity === 'Medium' && r.status === 'Pending') return 'border-l-4 border-l-amber-500';
    if (r.severity === 'Low' && r.status === 'Pending') return 'border-l-4 border-l-orange-400';
    if (r.status === 'Resolved' && !r.is_paid && r.estimated_cost > 0) return 'border-l-4 border-l-green-500';
    if (r.vehicle_damage_count > 1) return 'border-l-4 border-l-purple-400';
    return 'border-l-4 border-l-gray-100';
};

const exportCSV = (rows) => {
    if (!rows?.length) return;
    const h = ['Report ID', 'Vehicle', 'Booking', 'Customer', 'Date', 'Damage Type', 'Severity', 'Estimated Cost', 'Payment', 'Status'];
    const data = rows.map(r => [r.damage_id, `${r.brand} ${r.model}`, r.booking_id, r.customer_name, fmtDate(r.report_date), r.damage_type, SEV_UI[r.severity] || r.severity, r.estimated_cost || 0, r.is_paid ? 'Paid' : 'Unpaid', STATUS_UI[r.status] || r.status]);
    const csv = [h, ...data].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'damage-reports.csv'; a.click();
    URL.revokeObjectURL(url);
};

// ─── Copy Button ──────────────────────────────────────────────────────────────

const CopyBtn = ({ text, display }) => {
    const [copied, setCopied] = useState(false);
    const copy = (e) => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); };
    return (
        <button onClick={copy} className="inline-flex items-center gap-1 font-mono text-xs text-gray-600 hover:text-orange-600 transition-colors group">
            <span className="truncate max-w-[100px]" title={text}>{display || text}</span>
            {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="opacity-0 group-hover:opacity-100" />}
        </button>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const STAT_COLORS = {
    total: 'bg-orange-50 border-orange-200 text-orange-600',
    open: 'bg-red-50 border-red-200 text-red-600',
    review: 'bg-amber-50 border-amber-200 text-amber-600',
    resolved: 'bg-green-50 border-green-200 text-green-600',
    pending_pay: 'bg-red-50 border-red-200 text-red-700',
    recovered: 'bg-green-50 border-green-200 text-green-700'
};

const StatCard = ({ label, sublabel, value, type, active, onClick }) => (
    <button onClick={onClick} className={`flex-1 min-w-[150px] p-4 rounded-2xl border text-left transition-all ${STAT_COLORS[type]} ${active ? 'ring-2 ring-offset-1 ring-orange-400 shadow-md' : 'hover:shadow-sm'}`}>
        <div className="text-2xl font-black tracking-tight">{value}</div>
        <div className="text-sm font-semibold text-gray-700 mt-0.5">{label}</div>
        {sublabel && <div className="text-xs text-gray-400 mt-0.5">{sublabel}</div>}
    </button>
);

// ─── Alert Banner ─────────────────────────────────────────────────────────────

const AlertBanner = ({ emoji, msg, link, onClick, color }) => {
    const s = { red: 'bg-red-50 border-red-200 text-red-700', amber: 'bg-amber-50 border-amber-200 text-amber-700', orange: 'bg-orange-50 border-orange-200 text-orange-700' };
    return (
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium ${s[color]}`}>
            <span>{emoji} {msg}</span>
            {link && <button onClick={onClick} className="ml-4 underline underline-offset-2 whitespace-nowrap hover:opacity-75">{link} →</button>}
        </div>
    );
};

// ─── Quick Pills ──────────────────────────────────────────────────────────────

const PILLS = [
    { key: 'all', label: 'All Reports', color: '' },
    { key: 'open', label: 'Open', color: 'red' },
    { key: 'under_review', label: 'Under Review', color: 'amber' },
    { key: 'resolved', label: 'Resolved', color: 'green' },
    { key: 'severe', label: 'Severe Only', color: 'red', bold: true },
    { key: 'moderate', label: 'Moderate', color: 'amber' },
    { key: 'minor', label: 'Minor', color: 'green' },
    { key: 'pending_payment', label: 'Pending Payment', color: 'red', bold: true },
    { key: 'paid', label: 'Paid', color: 'green' },
    { key: 'missing_cost', label: 'Missing Cost', color: 'orange' },
    { key: 'week', label: 'This Week', color: '' },
    { key: 'month', label: 'This Month', color: '' }
];
const PILL_INACTIVE = { red: 'border-red-300 text-red-700', amber: 'border-amber-300 text-amber-700', green: 'border-green-300 text-green-700', orange: 'border-orange-300 text-orange-700' };

const QuickPills = ({ active, onChange }) => (
    <div className="flex flex-wrap gap-2">
        {PILLS.map(p => (
            <button key={p.key} onClick={() => onChange(p.key)} className={`px-3 py-1.5 rounded-full text-xs border transition-all ${p.bold ? 'font-bold' : 'font-semibold'} ${active === p.key ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : p.color ? PILL_INACTIVE[p.color] + ' hover:bg-gray-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {p.label}
            </button>
        ))}
    </div>
);

// ─── Severity & Status Badges ─────────────────────────────────────────────────

const SevBadge = ({ sev }) => {
    const s = SEV_STYLE[sev] || SEV_STYLE.Low;
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}>{s.dot} {s.label}</span>;
};
const StatusBadge = ({ status }) => {
    const s = STATUS_STYLE[status] || STATUS_STYLE.Pending;
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>{s.icon} {s.label}</span>;
};
const PaymentBadge = ({ isPaid, cost }) => {
    if (!cost || cost == 0) return <span className="text-xs font-semibold text-gray-400">— No Cost</span>;
    if (isPaid) return <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ Paid</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">🔴 Unpaid</span>;
};

// ─── Timeline Stepper ─────────────────────────────────────────────────────────

const StatusTimeline = ({ status }) => {
    const steps = ['Pending', 'On-Review', 'Resolved'];
    const labels = ['Open', 'Under Review', 'Resolved'];
    const cur = steps.indexOf(status);
    return (
        <div className="flex items-center gap-0">
            {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                    <div className={`flex flex-col items-center`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= cur ? (s === 'Pending' ? 'bg-red-500 text-white' : s === 'On-Review' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white') : 'bg-gray-100 text-gray-400'} ${i === cur ? 'ring-4 ring-offset-1 ring-orange-300 animate-pulse' : ''}`}>
                            {i < cur ? '✓' : i + 1}
                        </div>
                        <span className="text-[10px] font-semibold text-gray-500 mt-1 whitespace-nowrap">{labels[i]}</span>
                    </div>
                    {i < steps.length - 1 && <div className={`w-16 h-0.5 mx-1 mb-4 ${i < cur ? 'bg-orange-400' : 'bg-gray-200'}`} />}
                </div>
            ))}
        </div>
    );
};

// ─── Photo Gallery ────────────────────────────────────────────────────────────

const PhotoGallery = ({ photos }) => {
    const [lightbox, setLightbox] = useState(null);
    const urls = useMemo(() => {
        if (!photos) return [];
        try { return typeof photos === 'string' ? JSON.parse(photos) : (Array.isArray(photos) ? photos : []); }
        catch { return typeof photos === 'string' ? [photos] : []; }
    }, [photos]);

    if (!urls.length) return (
        <div className="flex items-center gap-2 text-gray-400 py-4"><Camera size={20} /><span className="text-sm">No photos attached</span></div>
    );
    return (
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{urls.length} Photo{urls.length > 1 ? 's' : ''}</p>
            <div className="grid grid-cols-3 gap-2">
                {urls.map((url, i) => (
                    <button key={i} onClick={() => setLightbox(url)} className="aspect-square overflow-hidden rounded-xl border border-gray-100 hover:border-orange-300 transition-all">
                        <img src={url} alt={`damage-${i}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
            <AnimatePresence>
                {lightbox && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)} className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out">
                        <img src={lightbox} alt="fullscreen" className="max-w-full max-h-full object-contain rounded-xl" />
                        <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Damage Detail Modal ──────────────────────────────────────────────────────

const DamageDetailModal = ({ damageId, agencyProfile, onClose, onRefresh }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [editingCost, setEditingCost] = useState(false);
    const [costInput, setCostInput] = useState('');
    const [chargeAmount, setChargeAmount] = useState('');
    const [chargeMethod, setChargeMethod] = useState('Cash');
    const [chargeTrxId, setChargeTrxId] = useState('');
    const [chargeDesc, setChargeDesc] = useState('');
    const [chargeConfirm, setChargeConfirm] = useState(false);
    const [alsoResolve, setAlsoResolve] = useState(true);
    const [updateStatus, setUpdateStatus] = useState('');
    const [updateCost, setUpdateCost] = useState('');
    const [updateNotes, setUpdateNotes] = useState('');
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['agency-damage-detail', damageId],
        queryFn: async () => (await axiosPublic.get(`/agencyDamage/detail/${damageId}`)).data,
        enabled: !!damageId
    });

    const r = data?.report;

    const updateMut = useMutation({
        mutationFn: (body) => axiosPublic.patch(`/agencyDamage/update/${damageId}`, body),
        onSuccess: () => { toast.success('Report updated'); queryClient.invalidateQueries(['agency-damage-detail', damageId]); onRefresh(); }
    });

    const chargeMut = useMutation({
        mutationFn: (body) => axiosPublic.post(`/agencyDamage/charge/${damageId}`, body),
        onSuccess: () => { toast.success(`✅ Payment of ${fmtCost(chargeAmount)} recorded`); queryClient.invalidateQueries(['agency-damage-detail', damageId]); onRefresh(); }
    });

    const handleSaveCost = () => {
        updateMut.mutate({ estimated_cost: parseFloat(costInput) });
        setEditingCost(false);
    };

    const handleUpdate = () => {
        if (!updateNotes.trim()) { toast.error('Please add notes for this status change'); return; }
        updateMut.mutate({ status: updateStatus || STATUS_UI[r?.status], estimated_cost: updateCost || r?.estimated_cost, notes: updateNotes });
    };

    const handleCharge = () => {
        if (!chargeConfirm) { toast.error('Please confirm the charge'); return; }
        if (!chargeAmount) { toast.error('Please enter amount'); return; }
        if (chargeMethod !== 'Cash' && !chargeTrxId) { toast.error('Transaction ID required for digital payments'); return; }
        chargeMut.mutate({
            booking_id: r.booking_id, amount: parseFloat(chargeAmount),
            method_type: chargeMethod, trx_id: chargeTrxId,
            payment_for: chargeDesc || `Damage charge — ${r.damage_type}`,
            also_resolve: alsoResolve && r.status !== 'Resolved'
        });
    };

    const daysOld = r ? differenceInDays(new Date(), parseISO(r.report_date)) : 0;
    const ageColor = daysOld < 3 ? 'text-green-600' : daysOld <= 7 ? 'text-amber-600' : 'text-red-600';
    const existingPayment = data?.payments?.[0];

    const TABS = [
        { key: 'overview', label: 'Report Overview', icon: FileText },
        { key: 'vehicle', label: 'Vehicle & Booking', icon: Car },
        { key: 'costs', label: 'Cost & Charges', icon: DollarSign },
        { key: 'update', label: 'Update & Resolve', icon: RefreshCw }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X size={18} /></button>

                {isLoading || !r ? (
                    <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {r.severity === 'High' && <AlertTriangle size={18} className="text-red-500" />}
                                    <CopyBtn text={r.damage_id} display={r.damage_id} />
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <SevBadge sev={r.severity} />
                                    <StatusBadge status={r.status} />
                                    <span className={`text-xs font-semibold ${ageColor}`}>{daysOld === 0 ? 'Today' : `${daysOld} days since report`}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{fmtDate(r.report_date)} · {r.damage_type}</p>
                            </div>
                            <div className="flex-shrink-0"><StatusTimeline status={r.status} /></div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 px-4">
                            {TABS.map(({ key, label, icon: Icon }) => (
                                <button key={key} onClick={() => setActiveTab(key)} className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === key ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                    <Icon size={14} /> {label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">

                            {/* TAB 1: Overview */}
                            {activeTab === 'overview' && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Damage Information</p>
                                            <div className="flex justify-between text-sm"><span className="text-gray-500">Type</span><span className="font-semibold">{r.damage_type}</span></div>
                                            <div className="flex justify-between text-sm items-center"><span className="text-gray-500">Severity</span><SevBadge sev={r.severity} /></div>
                                            <div className="flex justify-between text-sm items-center">
                                                <span className="text-gray-500">Estimated Cost</span>
                                                {editingCost ? (
                                                    <div className="flex items-center gap-1">
                                                        <input autoFocus type="number" value={costInput} onChange={e => setCostInput(e.target.value)} className="w-24 px-2 py-1 text-sm border border-orange-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400" placeholder="0" />
                                                        <button onClick={handleSaveCost} className="px-2 py-1 bg-orange-500 text-white text-xs rounded-lg">Save</button>
                                                        <button onClick={() => setEditingCost(false)} className="px-2 py-1 text-gray-400 text-xs rounded-lg">✕</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <span className={`font-bold ${r.estimated_cost ? 'text-gray-900' : 'text-red-500'}`}>{fmtCost(r.estimated_cost) || 'Not Set'}</span>
                                                        <button onClick={() => { setEditingCost(true); setCostInput(r.estimated_cost || ''); }} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-orange-500"><Edit2 size={12} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Info</p>
                                            <div className="flex justify-between text-sm"><span className="text-gray-500">Vehicle</span><span className="font-semibold">{r.brand} {r.model}</span></div>
                                            <div className="flex justify-between text-sm"><span className="text-gray-500">Customer</span><span className="font-semibold">{r.customer_name}</span></div>
                                            <div className="flex justify-between text-sm items-center"><span className="text-gray-500">Payment</span><PaymentBadge isPaid={!!existingPayment} cost={r.estimated_cost} /></div>
                                        </div>
                                    </div>
                                    {r.description && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</p>
                                            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 border border-gray-100 leading-relaxed">{r.description}</p>
                                        </div>
                                    )}
                                    <PhotoGallery photos={r.photos} />
                                </div>
                            )}

                            {/* TAB 2: Vehicle & Booking */}
                            {activeTab === 'vehicle' && (
                                <div className="space-y-5">
                                    {/* Vehicle */}
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Vehicle</p>
                                        <div className="flex gap-4">
                                            {getFirstImg(r.images) ? (
                                                <img src={getFirstImg(r.images)} alt={r.brand} className="w-24 h-24 rounded-xl object-cover border border-gray-100" />
                                            ) : (
                                                <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300"><Car size={32} /></div>
                                            )}
                                            <div className="space-y-1 text-sm">
                                                <p className="font-bold text-gray-900 text-base">{r.brand} {r.model}</p>
                                                <p className="text-gray-500">{r.car_type} {r.build_year && `· ${r.build_year}`}</p>
                                                <div className="flex gap-2 flex-wrap">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.car_status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{r.car_status}</span>
                                                    {r.car_rating && <span className="text-xs text-amber-600 font-semibold">★ {Number(r.car_rating).toFixed(1)}</span>}
                                                </div>
                                                {data?.history?.length > 1 && <p className="text-xs font-bold text-red-500">⚠️ Repeat damage vehicle — {data.history.length} incidents</p>}
                                            </div>
                                        </div>
                                        {data?.history?.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Damage History</p>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-xs">
                                                        <thead><tr className="text-gray-400">{['ID', 'Date', 'Severity', 'Type', 'Status', 'Cost'].map(h => <th key={h} className="text-left pb-1 pr-3 font-bold uppercase">{h}</th>)}</tr></thead>
                                                        <tbody>
                                                            {data.history.map(h => (
                                                                <tr key={h.damage_id} className={`${h.damage_id === r.damage_id ? 'font-bold text-orange-600' : 'text-gray-600'} border-t border-gray-100`}>
                                                                    <td className="py-1 pr-3 font-mono">{h.damage_id.slice(-8)}</td>
                                                                    <td className="py-1 pr-3">{fmtDate(h.report_date)}</td>
                                                                    <td className="py-1 pr-3"><SevBadge sev={h.severity} /></td>
                                                                    <td className="py-1 pr-3">{h.damage_type}</td>
                                                                    <td className="py-1 pr-3"><StatusBadge status={h.status} /></td>
                                                                    <td className="py-1">{fmtCost(h.estimated_cost) || '—'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Booking */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl space-y-2 text-sm">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Booking</p>
                                            <div className="flex justify-between"><span className="text-gray-500">ID</span><CopyBtn text={r.booking_id} display={r.booking_id.slice(-10)} /></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Trip</span><span className="font-semibold text-xs">{fmtDate(r.start_ts)} → {fmtDate(r.end_ts)}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700`}>{r.booking_status}</span></div>
                                            {r.booking_purpose && <div className="flex justify-between"><span className="text-gray-500">Purpose</span><span>{r.booking_purpose}</span></div>}
                                            {r.total_rent_hours && <div className="flex justify-between"><span className="text-gray-500">Duration</span><span>{r.total_rent_hours}h</span></div>}
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl space-y-2 text-sm">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</p>
                                            <div className="flex items-center gap-2 mb-2">
                                                {r.customer_photo ? <img src={r.customer_photo} alt={r.customer_name} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-black flex items-center justify-center text-sm">{r.customer_name?.[0]}</div>}
                                                <span className="font-bold">{r.customer_name}</span>
                                            </div>
                                            <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{r.customer_phone}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-xs truncate">{r.customer_email}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.customer_status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{r.customer_status}</span></div>
                                        </div>
                                    </div>
                                    {/* Driver + Pickup + Return */}
                                    {r.driver_name && (
                                        <div className="p-4 bg-gray-50 rounded-2xl text-sm space-y-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Driver</p>
                                            <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-semibold">{r.driver_name}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{r.driver_phone}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">License</span><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.driver_license_status === 'Valid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.driver_license_status}</span></div>
                                        </div>
                                    )}
                                    {!r.driver_name && <p className="text-sm text-gray-400 italic">Self-drive booking — no driver assigned</p>}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-blue-50 rounded-2xl text-sm space-y-1">
                                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Pickup Info</p>
                                            {r.pickup_time ? <>
                                                <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-semibold">{fmtDate(r.pickup_time)}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">Fuel</span><span>{r.pickup_fuel}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">Odometer</span><span>{r.pickup_odometer} km</span></div>
                                                {r.pickup_notes && <p className="text-gray-500 text-xs">{r.pickup_notes}</p>}
                                            </> : <p className="text-gray-400 italic text-xs">No pickup record</p>}
                                        </div>
                                        <div className="p-4 bg-purple-50 rounded-2xl text-sm space-y-1">
                                            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Return Info</p>
                                            {r.return_time ? <>
                                                <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-semibold">{fmtDate(r.return_time)}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">Fuel</span><span>{r.return_fuel}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">Odometer</span><span>{r.return_odometer} km</span></div>
                                                {r.pickup_odometer && r.return_odometer && <div className="flex justify-between"><span className="text-gray-500">Distance</span><span className="font-semibold">{r.return_odometer - r.pickup_odometer} km</span></div>}
                                                {r.late_fee > 0 && <div className="flex justify-between text-red-600"><span>Late Fee</span><span>৳{r.late_fee}</span></div>}
                                            </> : <p className="text-gray-400 italic text-xs">No return record</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: Cost & Charges */}
                            {activeTab === 'costs' && (
                                <div className="space-y-5">
                                    <div className="p-5 bg-gray-50 rounded-2xl">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Estimated Cost</p>
                                        {editingCost ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-black text-gray-400">৳</span>
                                                <input autoFocus type="number" value={costInput} onChange={e => setCostInput(e.target.value)} className="text-2xl font-black w-40 border-b-2 border-orange-400 bg-transparent focus:outline-none" placeholder="0" />
                                                <button onClick={handleSaveCost} className="px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold text-sm">Save</button>
                                                <button onClick={() => setEditingCost(false)} className="px-4 py-2 text-gray-400 rounded-xl text-sm">Cancel</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-baseline gap-3">
                                                <span className={`text-4xl font-black ${r.estimated_cost ? 'text-gray-900' : 'text-red-400'}`}>{fmtCost(r.estimated_cost) || 'Not Set'}</span>
                                                <button onClick={() => { setEditingCost(true); setCostInput(r.estimated_cost || ''); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-orange-500 transition-colors"><Edit2 size={16} /></button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Payments */}
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment History</p>
                                        {data?.payments?.length > 0 ? (
                                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50"><tr>{['Payment ID', 'Amount', 'Method', 'Trx ID', 'Date', 'For'].map(h => <th key={h} className="text-left p-3 text-xs font-bold text-gray-400 uppercase">{h}</th>)}</tr></thead>
                                                    <tbody>
                                                        {data.payments.map(p => (
                                                            <tr key={p.payment_id} className="border-t border-gray-100">
                                                                <td className="p-3"><CopyBtn text={p.payment_id} display={p.payment_id.slice(-8)} /></td>
                                                                <td className="p-3 font-bold text-green-600">{fmtCost(p.amount)}</td>
                                                                <td className="p-3">{p.method_type}</td>
                                                                <td className="p-3 font-mono text-xs">{p.trx_id || '—'}</td>
                                                                <td className="p-3 text-xs">{fmtDate(p.date)}</td>
                                                                <td className="p-3 text-xs text-gray-500">{p.payment_for}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : <p className="text-sm text-gray-400 italic">No payments recorded yet</p>}
                                    </div>

                                    {/* Charge section */}
                                    {existingPayment ? (
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
                                            <CheckCircle size={24} className="text-green-500" />
                                            <div>
                                                <p className="font-bold text-green-700">✓ Payment Received</p>
                                                <p className="text-sm text-green-600">{fmtCost(existingPayment.amount)} · {existingPayment.method_type} · {fmtDate(existingPayment.date)}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-5 bg-orange-50 border border-orange-200 rounded-2xl space-y-4">
                                            <p className="font-bold text-orange-700">Charge Customer</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Amount (৳)</label>
                                                    <input type="number" value={chargeAmount} onChange={e => setChargeAmount(e.target.value)} defaultValue={r.estimated_cost || ''} placeholder={r.estimated_cost || 'Enter amount'} className="w-full mt-1 px-3 py-2 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Payment Method</label>
                                                    <select value={chargeMethod} onChange={e => setChargeMethod(e.target.value)} className="w-full mt-1 px-3 py-2 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                                                        {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                                                    </select>
                                                </div>
                                                {chargeMethod !== 'Cash' && (
                                                    <div className="col-span-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase">Transaction ID</label>
                                                        <input value={chargeTrxId} onChange={e => setChargeTrxId(e.target.value)} placeholder="Enter bKash/Nagad/Bank trx ID" className="w-full mt-1 px-3 py-2 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
                                                    </div>
                                                )}
                                                <div className="col-span-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Charge Description</label>
                                                    <input value={chargeDesc} onChange={e => setChargeDesc(e.target.value)} defaultValue={`Damage charge — ${r.damage_type}`} placeholder={`Damage charge — ${r.damage_type}`} className="w-full mt-1 px-3 py-2 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
                                                </div>
                                            </div>
                                            {r.status !== 'Resolved' && (
                                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input type="checkbox" checked={alsoResolve} onChange={e => setAlsoResolve(e.target.checked)} className="accent-orange-500" />
                                                    Also mark report as Resolved
                                                </label>
                                            )}
                                            <label className="flex items-start gap-2 text-sm cursor-pointer">
                                                <input type="checkbox" checked={chargeConfirm} onChange={e => setChargeConfirm(e.target.checked)} className="accent-orange-500 mt-0.5" />
                                                I confirm that ৳{chargeAmount || '?'} has been collected from {r.customer_name} for damage to {r.brand} {r.model}
                                            </label>
                                            <button onClick={handleCharge} disabled={!chargeConfirm || chargeMut.isPending} className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 transition-all">
                                                {chargeMut.isPending ? 'Recording...' : 'Record Payment'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 4: Update & Resolve */}
                            {activeTab === 'update' && (
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm text-gray-500">Current status:</p>
                                        <StatusBadge status={r.status} />
                                        <ArrowRight size={16} className="text-gray-300" />
                                        <p className="text-xs text-gray-400">Open → Under Review → Resolved</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Update Status</label>
                                            <select value={updateStatus || STATUS_UI[r.status]} onChange={e => setUpdateStatus(e.target.value)} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                                                <option>Open</option>
                                                <option>Under Review</option>
                                                <option>Resolved</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Update Estimated Cost (৳)</label>
                                            <input type="number" value={updateCost} onChange={e => setUpdateCost(e.target.value)} placeholder={r.estimated_cost ? `Current: ৳${r.estimated_cost}` : 'Currently not set'} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Agency Notes <span className="text-red-400">*</span></label>
                                            <textarea value={updateNotes} onChange={e => setUpdateNotes(e.target.value)} maxLength={1000} rows={4} placeholder="Describe the reason for this status change, actions taken, or resolution details..." className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                                            <p className="text-right text-xs text-gray-400 mt-1">{updateNotes.length}/1000</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        {r.status !== 'Resolved' && (
                                            <button onClick={() => { setUpdateStatus('Resolved'); setTimeout(() => handleUpdate(), 0); }} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all">
                                                Mark as Resolved
                                            </button>
                                        )}
                                        <button onClick={handleUpdate} disabled={updateMut.isPending} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 transition-all">
                                            {updateMut.isPending ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

// ─── Status Update Modal ──────────────────────────────────────────────────────

const StatusUpdateModal = ({ report, onClose, onRefresh }) => {
    const [status, setStatus] = useState(STATUS_UI[report.status] || 'Open');
    const [cost, setCost] = useState(report.estimated_cost || '');
    const [notes, setNotes] = useState('');
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();

    const mut = useMutation({
        mutationFn: () => axiosPublic.patch(`/agencyDamage/update/${report.damage_id}`, { status, estimated_cost: cost || undefined, notes }),
        onSuccess: () => { toast.success(`✅ Report status updated to ${status}`); queryClient.invalidateQueries(['agency-damage-list']); onRefresh(); onClose(); }
    });

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
                <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"><X size={18} /></button>
                <h3 className="text-lg font-black text-gray-900">Update Report</h3>
                <div className="flex items-center gap-2"><StatusBadge status={report.status} /><ArrowRight size={14} className="text-gray-300" /><span className="text-xs text-gray-400">Open → Under Review → Resolved</span></div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                        {['Open', 'Under Review', 'Resolved'].map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Estimated Cost (৳)</label>
                    <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="Not set" className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Notes <span className="text-red-400">*</span></label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Reason for this status change..." className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                </div>
                <div className="flex gap-2 pt-2">
                    <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={() => mut.mutate()} disabled={mut.isPending || !notes.trim()} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50">
                        {mut.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ─── Charge Modal ─────────────────────────────────────────────────────────────

const ChargeModal = ({ report, onClose, onRefresh }) => {
    const [amount, setAmount] = useState(report.estimated_cost || '');
    const [method, setMethod] = useState('Cash');
    const [trxId, setTrxId] = useState('');
    const [desc, setDesc] = useState(`Damage charge — ${report.damage_type}`);
    const [confirmed, setConfirmed] = useState(false);
    const [alsoResolve, setAlsoResolve] = useState(true);
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();

    const mut = useMutation({
        mutationFn: () => axiosPublic.post(`/agencyDamage/charge/${report.damage_id}`, {
            booking_id: report.booking_id, amount: parseFloat(amount),
            method_type: method, trx_id: trxId, payment_for: desc,
            also_resolve: alsoResolve && report.status !== 'Resolved'
        }),
        onSuccess: () => { toast.success(`✅ Payment of ৳${Number(amount).toLocaleString()} recorded`); queryClient.invalidateQueries(['agency-damage-list']); onRefresh(); onClose(); }
    });

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
                <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"><X size={18} /></button>
                <h3 className="text-lg font-black text-gray-900">Charge Customer for Damage</h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 font-black flex items-center justify-center">{report.customer_name?.[0]}</div>
                    <div><p className="font-semibold text-sm">{report.customer_name}</p><p className="text-xs text-gray-400">{report.customer_phone}</p></div>
                    <div className="ml-auto"><SevBadge sev={report.severity} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Amount (৳) <span className="text-red-400">*</span></label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={report.estimated_cost || 'Enter amount'} className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Payment Method</label>
                        <select value={method} onChange={e => setMethod(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                        </select>
                    </div>
                    {method !== 'Cash' && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Trx ID <span className="text-red-400">*</span></label>
                            <input value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="bKash/Nagad/Bank trx" className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                        </div>
                    )}
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                        <input value={desc} onChange={e => setDesc(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                </div>
                {report.status !== 'Resolved' && (
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={alsoResolve} onChange={e => setAlsoResolve(e.target.checked)} className="accent-orange-500" />
                        Also mark report as Resolved
                    </label>
                )}
                <label className="flex items-start gap-2 text-sm cursor-pointer p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="accent-orange-500 mt-0.5" />
                    I confirm that ৳{amount || '?'} has been collected from {report.customer_name} for damage to {report.brand} {report.model}
                </label>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                    <button onClick={() => mut.mutate()} disabled={!confirmed || !amount || mut.isPending || (method !== 'Cash' && !trxId)} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50">
                        {mut.isPending ? 'Recording...' : 'Record Payment'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ─── Quick Advance Popover ────────────────────────────────────────────────────

const QuickAdvance = ({ report, onClose, onRefresh }) => {
    const next = { Pending: 'Under Review', 'On-Review': 'Resolved' };
    const nextStatus = next[report.status];
    const [notes, setNotes] = useState('');
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();

    const mut = useMutation({
        mutationFn: () => axiosPublic.patch(`/agencyDamage/update/${report.damage_id}`, { status: nextStatus, notes }),
        onSuccess: () => { toast.success(`Report advanced to ${nextStatus === 'On-Review' ? 'Under Review' : 'Resolved'}`); queryClient.invalidateQueries(['agency-damage-list']); onRefresh(); onClose(); }
    });

    if (!nextStatus) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/40" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-2xl shadow-xl p-5 w-full max-w-sm space-y-3">
                <p className="font-bold text-gray-900 text-sm">Advance Report #{report.damage_id.slice(-6)}</p>
                <div className="flex items-center gap-2 text-sm">
                    <StatusBadge status={report.status} />
                    <ArrowRight size={14} className="text-gray-300" />
                    <StatusBadge status={nextStatus} />
                </div>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                    <button onClick={() => mut.mutate()} disabled={mut.isPending} className="flex-1 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50">
                        {mut.isPending ? '...' : 'Confirm'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ─── Repeat Offenders Panel ───────────────────────────────────────────────────

const RepeatOffendersPanel = ({ agencyId, onFilterVehicle }) => {
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const { data: vehicles = [], isLoading } = useQuery({
        queryKey: ['agency-repeat-vehicles', agencyId],
        queryFn: async () => (await axiosPublic.get(`/agencyDamage/repeat-vehicles/${agencyId}`)).data,
        enabled: !!agencyId
    });

    const flagMut = useMutation({
        mutationFn: (carId) => axiosPublic.patch(`/carRoutes/updateCarStatus/${carId}`, { status: 'Maintenance' }),
        onSuccess: () => { toast.success('Vehicle flagged for maintenance'); queryClient.invalidateQueries(['agency-repeat-vehicles', agencyId]); }
    });

    if (isLoading) return <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>;
    if (!vehicles.length) return <div className="p-4 text-center text-gray-400 text-sm">No repeat offender vehicles.</div>;

    const rankColor = (i) => i === 0 ? 'text-red-600' : i === 1 ? 'text-orange-500' : i === 2 ? 'text-amber-500' : 'text-gray-500';

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50">
                    <tr>{['Rank', 'Vehicle', 'Reports', 'Severe', 'Moderate', 'Minor', 'Total Cost', 'Paid', 'Unpaid', 'Last Report', 'Actions'].map(h => <th key={h} className="text-left p-3 text-xs font-bold text-gray-400 uppercase whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody>
                    {vehicles.map((v, i) => (
                        <tr key={v.car_id} className={`border-t border-gray-100 ${i === 0 ? 'bg-red-50/30' : ''}`}>
                            <td className="p-3"><span className={`font-black text-lg ${rankColor(i)}`}>#{i + 1}</span></td>
                            <td className="p-3">
                                <div className="flex items-center gap-2">
                                    {v.car_image ? <img src={v.car_image} alt={v.brand} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300"><Car size={16} /></div>}
                                    <div><p className="font-bold">{v.brand} {v.model}</p><p className="text-xs text-gray-400">{v.car_type}</p></div>
                                </div>
                            </td>
                            <td className="p-3"><span className={`font-black text-base ${v.total_reports >= 4 ? 'text-red-600' : v.total_reports >= 3 ? 'text-orange-500' : 'text-amber-500'}`}>{v.total_reports}</span></td>
                            <td className="p-3 text-red-600 font-semibold">{v.severe_count}</td>
                            <td className="p-3 text-amber-600 font-semibold">{v.moderate_count}</td>
                            <td className="p-3 text-green-600 font-semibold">{v.minor_count}</td>
                            <td className="p-3 font-bold">{fmtCost(v.total_estimated_cost)}</td>
                            <td className="p-3 text-green-600">{fmtCost(v.total_paid)}</td>
                            <td className="p-3 text-red-600 font-bold">{fmtCost(v.total_unpaid)}</td>
                            <td className="p-3 text-xs text-gray-500">{fmtDate(v.last_report_date)}</td>
                            <td className="p-3">
                                <div className="flex gap-1">
                                    <button onClick={() => onFilterVehicle(v.car_id)} className="px-2 py-1 text-xs font-semibold text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50">View Reports</button>
                                    <button onClick={() => { if (confirm(`Set ${v.brand} ${v.model} to Maintenance due to repeated damage?`)) flagMut.mutate(v.car_id); }} className="px-2 py-1 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Flag</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = ({ page, limit, total, summary, setPage, setLimit }) => {
    const from = total === 0 ? 0 : page * limit + 1;
    const to = Math.min((page + 1) * limit, total);
    const totalPages = Math.ceil(total / limit);
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 px-1">
            <div className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-800">{from}–{to}</span> of <span className="font-semibold text-gray-800">{total}</span>
                {summary && <span className="ml-2 text-gray-400">· {summary}</span>}
            </div>
            <div className="flex items-center gap-2">
                <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(0); }} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400">
                    {[10, 25, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
                </select>
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={14} /></button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p = i; if (totalPages > 5) { if (page <= 2) p = i; else if (page >= totalPages - 3) p = totalPages - 5 + i; else p = page - 2 + i; }
                    return <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${p === page ? 'bg-orange-500 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-600'}`}>{p + 1}</button>;
                })}
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={14} /></button>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AgencyDamageReports = () => {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();

    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [filters, setFilters] = useState({ search: '', status: '', severity: '', damage_type: '', car_id: '', payment_status: '', startDate: '', endDate: '', costRange: '', quickFilter: 'open' });
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [bulkStatus, setBulkStatus] = useState('Under Review');
    const [bulkNotes, setBulkNotes] = useState('');
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);
    const [showRepeat, setShowRepeat] = useState(false);
    const [modals, setModals] = useState({ detail: null, status: null, charge: null, advance: null });

    const openModal = (type, data) => setModals(prev => ({ ...prev, [type]: data }));
    const closeModal = (type) => setModals(prev => ({ ...prev, [type]: null }));

    const updateFilter = useCallback((key, val) => {
        setFilters(prev => ({ ...prev, [key]: val }));
        setPage(0);
        setSelectedRows(new Set());
    }, []);

    // Agency profile
    const { data: agencyProfile } = useQuery({
        queryKey: ['agency-profile', user?.email],
        queryFn: async () => (await axiosPublic.get(`/agencyRoutes/getAgencyProfile/${user?.email}`)).data,
        enabled: !!user?.email
    });
    const agencyId = agencyProfile?.agency_id;

    // Stats
    const { data: stats } = useQuery({
        queryKey: ['agency-damage-stats', agencyId],
        queryFn: async () => (await axiosPublic.get(`/agencyDamage/stats/${agencyId}`)).data,
        enabled: !!agencyId
    });

    // Filter options
    const { data: filterOpts } = useQuery({
        queryKey: ['agency-damage-filter-opts', agencyId],
        queryFn: async () => (await axiosPublic.get(`/agencyDamage/filter-options/${agencyId}`)).data,
        enabled: !!agencyId
    });

    // Report list
    const listParams = useMemo(() => {
        const p = new URLSearchParams({ page, limit, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) });
        return p.toString();
    }, [page, limit, filters]);

    const { data: listData, isLoading } = useQuery({
        queryKey: ['agency-damage-list', agencyId, listParams],
        queryFn: async () => (await axiosPublic.get(`/agencyDamage/list/${agencyId}?${listParams}`)).data,
        enabled: !!agencyId
    });

    const refresh = useCallback(() => {
        queryClient.invalidateQueries(['agency-damage-list']);
        queryClient.invalidateQueries(['agency-damage-stats', agencyId]);
    }, [queryClient, agencyId]);

    const bulkMut = useMutation({
        mutationFn: () => axiosPublic.patch('/agencyDamage/bulk-update', { damageIds: [...selectedRows], status: bulkStatus, notes: bulkNotes }),
        onSuccess: () => { toast.success(`${selectedRows.size} reports updated`); setSelectedRows(new Set()); setShowBulkConfirm(false); refresh(); }
    });

    const reports = listData?.reports || [];
    const total = listData?.total || 0;

    const allSelected = reports.length > 0 && reports.every(r => selectedRows.has(r.damage_id));
    const toggleAll = () => {
        if (allSelected) setSelectedRows(new Set());
        else setSelectedRows(new Set(reports.map(r => r.damage_id)));
    };
    const toggleRow = (id) => setSelectedRows(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

    const paginationSummary = listData ? `${listData.severe_count || 0} Severe · ${listData.moderate_count || 0} Moderate · ${listData.minor_count || 0} Minor · ${listData.open_count || 0} Open · ৳${Number(listData.outstanding || 0).toLocaleString()} outstanding` : '';

    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Damage Reports</h1>
                <p className="text-gray-500 mt-1">Track and resolve damage incidents across your fleet.</p>
            </div>

            {/* Stat Cards */}
            <div className="flex flex-wrap gap-3">
                <StatCard label="Total Reports" value={stats?.total ?? '—'} type="total" active={false} onClick={() => updateFilter('quickFilter', 'all')} />
                <StatCard label="Open Reports" sublabel="Needs attention" value={stats?.openCount ?? '—'} type="open" active={filters.quickFilter === 'open'} onClick={() => updateFilter('quickFilter', 'open')} />
                <StatCard label="Under Review" sublabel="Being assessed" value={stats?.underReviewCount ?? '—'} type="review" active={filters.quickFilter === 'under_review'} onClick={() => updateFilter('quickFilter', 'under_review')} />
                <StatCard label="Resolved" sublabel="Closed reports" value={stats?.resolvedCount ?? '—'} type="resolved" active={filters.quickFilter === 'resolved'} onClick={() => updateFilter('quickFilter', 'resolved')} />
                <StatCard label="Pending Payment" sublabel="Awaiting payment" value={stats?.pendingPaymentCount ?? '—'} type="pending_pay" active={filters.quickFilter === 'pending_payment'} onClick={() => updateFilter('quickFilter', 'pending_payment')} />
                <StatCard label="Total Recovered" sublabel="Revenue from damages" value={stats ? fmtCost(stats.totalRecovered) : '—'} type="recovered" active={filters.quickFilter === 'paid'} onClick={() => updateFilter('quickFilter', 'paid')} />
            </div>

            {/* Alert Banners */}
            <div className="space-y-2">
                {(stats?.severeOpen || 0) > 0 && <AlertBanner emoji="🔴" color="red" msg={`${stats.severeOpen} severe damage report${stats.severeOpen > 1 ? 's' : ''} are still Open and require immediate attention.`} link="Review Now" onClick={() => { updateFilter('quickFilter', 'all'); updateFilter('severity', 'Severe'); updateFilter('status', 'Open'); }} />}
                {(stats?.staleReview || 0) > 0 && <AlertBanner emoji="⚠️" color="amber" msg={`${stats.staleReview} report${stats.staleReview > 1 ? 's' : ''} have been Under Review for more than 7 days.`} link="Review Now" onClick={() => updateFilter('quickFilter', 'under_review')} />}
                {(stats?.unpaidCharges || 0) > 0 && <AlertBanner emoji="🔴" color="red" msg={`${stats.unpaidCharges} damage report${stats.unpaidCharges > 1 ? 's' : ''} have outstanding charges that have not been paid.`} link="Charge Now" onClick={() => updateFilter('quickFilter', 'pending_payment')} />}
                {(stats?.missingCost || 0) > 0 && <AlertBanner emoji="🟠" color="orange" msg={`${stats.missingCost} damage report${stats.missingCost > 1 ? 's' : ''} have no cost estimate set.`} link="Update Now" onClick={() => updateFilter('quickFilter', 'missing_cost')} />}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search ID, booking, vehicle, customer..." value={filters.search} onChange={e => updateFilter('search', e.target.value)} className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                    {[
                        { key: 'status', label: 'Status', opts: ['All', 'Open', 'Under Review', 'Resolved'] },
                        { key: 'severity', label: 'Severity', opts: ['All', 'Minor', 'Moderate', 'Severe'] },
                        { key: 'payment_status', label: 'Payment', opts: ['All', 'Paid', 'Pending Payment', 'No Cost Set'] },
                        { key: 'costRange', label: 'Cost Range', opts: ['All', 'No Estimate', 'Under 5000', '5000-20000', '20000-50000', 'Above 50000'] }
                    ].map(({ key, label, opts }) => (
                        <select key={key} value={filters[key] || ''} onChange={e => updateFilter(key, e.target.value === 'All' ? '' : e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                            <option value="">{label}: All</option>
                            {opts.filter(o => o !== 'All').map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    ))}
                    <select value={filters.damage_type || ''} onChange={e => updateFilter('damage_type', e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                        <option value="">Damage Type: All</option>
                        {(filterOpts?.damageTypes || []).map(t => <option key={t}>{t}</option>)}
                    </select>
                    <select value={filters.car_id || ''} onChange={e => updateFilter('car_id', e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                        <option value="">Vehicle: All</option>
                        {(filterOpts?.vehicles || []).map(v => <option key={v.car_id} value={v.car_id}>{v.brand} {v.model}</option>)}
                    </select>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <input type="date" value={filters.startDate} onChange={e => updateFilter('startDate', e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                        <span className="text-gray-400">–</span>
                        <input type="date" value={filters.endDate} onChange={e => updateFilter('endDate', e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                    <button onClick={() => exportCSV(reports)} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm">
                        <Download size={14} /> Export CSV
                    </button>
                </div>
                <QuickPills active={filters.quickFilter} onChange={v => updateFilter('quickFilter', v === 'all' ? '' : v)} />
            </div>

            {/* Bulk Action Bar */}
            <AnimatePresence>
                {selectedRows.size > 0 && (
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="bg-orange-500 rounded-2xl p-4 flex items-center gap-4 text-white">
                        <span className="font-bold">{selectedRows.size} report{selectedRows.size > 1 ? 's' : ''} selected</span>
                        <div className="flex gap-2 ml-auto flex-wrap">
                            <button onClick={() => { setBulkStatus('Under Review'); setShowBulkConfirm(true); }} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600">Move to Under Review</button>
                            <button onClick={() => { setBulkStatus('Resolved'); setShowBulkConfirm(true); }} className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600">Mark as Resolved</button>
                            <button onClick={() => exportCSV(reports.filter(r => selectedRows.has(r.damage_id)))} className="px-4 py-2 bg-white/20 text-white rounded-xl text-sm font-bold hover:bg-white/30">Export Selected</button>
                            <button onClick={() => setSelectedRows(new Set())} className="px-3 py-2 text-white/80 text-sm underline hover:text-white">Deselect All</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk Confirm Dialog */}
            <AnimatePresence>
                {showBulkConfirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowBulkConfirm(false)} className="absolute inset-0 bg-black/40" />
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
                            <h3 className="font-black text-gray-900">Update {selectedRows.size} Reports to {bulkStatus}?</h3>
                            <div className="text-xs text-gray-500 space-y-1">{[...selectedRows].slice(0, 5).map(id => <p key={id}>{id}</p>)}{selectedRows.size > 5 && <p>+{selectedRows.size - 5} more</p>}</div>
                            <textarea value={bulkNotes} onChange={e => setBulkNotes(e.target.value)} rows={3} placeholder="Shared agency notes (required)..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                            <div className="flex gap-2">
                                <button onClick={() => setShowBulkConfirm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">Cancel</button>
                                <button onClick={() => bulkMut.mutate()} disabled={bulkMut.isPending || !bulkNotes.trim()} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                                    {bulkMut.isPending ? 'Updating...' : 'Confirm'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="grid gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider" style={{ gridTemplateColumns: '2rem 1fr 1.2fr 1fr 1fr 0.8fr 0.8fr 1fr 0.8fr 0.8fr 7rem' }}>
                    <div><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-orange-500" /></div>
                    <div>Report ID</div><div>Vehicle</div><div>Booking</div><div>Customer</div>
                    <div>Date</div><div>Type</div><div>Severity</div><div>Cost</div><div>Payment</div><div>Status</div>
                </div>

                {isLoading ? (
                    <div className="space-y-2 p-4">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                ) : reports.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200"><Wrench size={32} /></div>
                        <p className="text-lg font-bold text-gray-600">No damage reports found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search term.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {reports.map(r => (
                            <div key={r.damage_id} className={`grid gap-3 px-4 py-3 items-center hover:bg-gray-50/60 transition-colors ${rowBorderClass(r)} ${r.status === 'Resolved' && r.is_paid ? 'opacity-75' : ''}`} style={{ gridTemplateColumns: '2rem 1fr 1.2fr 1fr 1fr 0.8fr 0.8fr 1fr 0.8fr 0.8fr 7rem' }}>
                                {/* Checkbox */}
                                <div><input type="checkbox" checked={selectedRows.has(r.damage_id)} onChange={() => toggleRow(r.damage_id)} className="accent-orange-500" /></div>
                                {/* Report ID */}
                                <div className="flex items-center gap-1 min-w-0">
                                    {r.severity === 'High' && <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />}
                                    <CopyBtn text={r.damage_id} display={r.damage_id.slice(-8)} />
                                    {r.vehicle_damage_count > 1 && <span title="Repeat offender" className="text-purple-500 text-[10px]">🔁</span>}
                                </div>
                                {/* Vehicle */}
                                <div className="flex items-center gap-2 min-w-0">
                                    {r.car_image ? <img src={r.car_image} alt={r.brand} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 flex-shrink-0"><Car size={14} /></div>}
                                    <div className="min-w-0"><p className="font-semibold text-gray-900 text-sm truncate">{r.brand} {r.model}</p><p className="text-xs text-gray-400 truncate">{r.car_type}</p></div>
                                </div>
                                {/* Booking */}
                                <div>
                                    <CopyBtn text={r.booking_id} display={r.booking_id.slice(-8)} />
                                    <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(r.start_ts)} → {fmtDate(r.end_ts)}</p>
                                </div>
                                {/* Customer */}
                                <div className="flex items-center gap-1.5 min-w-0">
                                    {r.customer_photo ? <img src={r.customer_photo} alt={r.customer_name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" /> : <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-black flex items-center justify-center text-xs flex-shrink-0">{r.customer_name?.[0]}</div>}
                                    <div className="min-w-0"><p className="text-sm font-semibold truncate">{r.customer_name}</p><p className="text-[10px] text-gray-400">{r.customer_phone}</p></div>
                                </div>
                                {/* Date */}
                                <div><p className="text-xs font-medium text-gray-700">{fmtDate(r.report_date)}</p><p className="text-[10px] text-gray-400">{daysAgo(r.report_date)}</p></div>
                                {/* Type */}
                                <div><span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-600 font-medium">{r.damage_type}</span></div>
                                {/* Severity */}
                                <div><SevBadge sev={r.severity} /></div>
                                {/* Cost */}
                                <div className="flex items-center gap-1 group">
                                    <span className={`text-sm font-bold ${r.estimated_cost ? 'text-gray-900' : 'text-red-400'}`}>{fmtCost(r.estimated_cost) || 'Not Set'}</span>
                                    <button onClick={() => openModal('status', r)} className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-orange-500 transition-all text-gray-300"><Edit2 size={11} /></button>
                                </div>
                                {/* Payment */}
                                <div><PaymentBadge isPaid={r.is_paid} cost={r.estimated_cost} /></div>
                                {/* Status */}
                                <div><StatusBadge status={r.status} /></div>
                                {/* Actions — rendered as a separate full-width row overlay trick */}
                                <div className="flex items-center gap-1">
                                    <button onClick={() => openModal('detail', r.damage_id)} title="View Details" className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-orange-500 transition-colors"><Eye size={14} /></button>
                                    <button onClick={() => openModal('status', r)} title="Update Status/Cost" className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-orange-500 transition-colors"><Edit2 size={14} /></button>
                                    {r.estimated_cost > 0 && !r.is_paid && (
                                        <button onClick={() => openModal('charge', r)} title="Charge Customer" className="p-1.5 hover:bg-orange-100 rounded-lg text-orange-500 transition-colors"><DollarSign size={14} /></button>
                                    )}
                                    {r.status !== 'Resolved' ? (
                                        <button onClick={() => openModal('advance', r)} title="Quick Advance Status" className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-green-500 transition-colors"><ArrowRight size={14} /></button>
                                    ) : (
                                        <button disabled title="Already Resolved" className="p-1.5 rounded-lg text-gray-200 cursor-not-allowed"><ArrowRight size={14} /></button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {reports.length > 0 && (
                    <div className="p-4 border-t border-gray-100">
                        <Pagination page={page} limit={limit} total={total} summary={paginationSummary} setPage={setPage} setLimit={l => { setLimit(l); setPage(0); }} />
                    </div>
                )}
            </div>

            {/* Repeat Offenders Panel */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button onClick={() => setShowRepeat(p => !p)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2">
                        <Layers size={18} className="text-purple-500" />
                        <span className="font-bold text-gray-800">Repeat Damage Vehicles</span>
                        <span className="text-xs text-gray-400">(2+ reports)</span>
                    </div>
                    {showRepeat ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                <AnimatePresence>
                    {showRepeat && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-gray-100 overflow-hidden">
                            <RepeatOffendersPanel agencyId={agencyId} onFilterVehicle={(id) => { updateFilter('car_id', id); setShowRepeat(false); }} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {modals.detail && <DamageDetailModal key="detail" damageId={modals.detail} agencyProfile={agencyProfile} onClose={() => closeModal('detail')} onRefresh={refresh} />}
                {modals.status && <StatusUpdateModal key="status" report={modals.status} onClose={() => closeModal('status')} onRefresh={refresh} />}
                {modals.charge && <ChargeModal key="charge" report={modals.charge} onClose={() => closeModal('charge')} onRefresh={refresh} />}
                {modals.advance && <QuickAdvance key="advance" report={modals.advance} onClose={() => closeModal('advance')} onRefresh={refresh} />}
            </AnimatePresence>
        </div>
    );
};

export default AgencyDamageReports;
