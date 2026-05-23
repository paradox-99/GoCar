/* eslint-disable react/prop-types */
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    X, ChevronRight, RefreshCw, Car, Users, Star,
    TrendingUp, TrendingDown, DollarSign, Calendar, Eye,
    Plus, ClipboardList, Wrench, MessageSquare, BarChart3, Settings,
    CheckCircle, Clock, Bike, Shield, Activity,
} from 'lucide-react';
import { format, differenceInDays, parseISO, isValid, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtMoney = (v) => `৳${Number(v || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => {
    try {
        const p = typeof d === 'string' ? parseISO(d) : new Date(d);
        return isValid(p) ? format(p, 'MMM dd') : '—';
    } catch { return '—'; }
};
const fmtDateFull = (d) => {
    try {
        const p = typeof d === 'string' ? parseISO(d) : new Date(d);
        return isValid(p) ? format(p, 'MMM dd, yyyy') : '—';
    } catch { return '—'; }
};
const daysAgo = (d) => {
    try {
        const p = typeof d === 'string' ? parseISO(d) : new Date(d);
        if (!isValid(p)) return '—';
        const diff = differenceInDays(new Date(), p);
        return diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : `${diff}d ago`;
    } catch { return '—'; }
};
const avatarInitial = (name) => (name || '?').charAt(0).toUpperCase();

const BOOKING_STATUS = {
    Completed:  { label: 'Completed',  bg: 'bg-green-100',  text: 'text-green-700',  icon: '✓' },
    Confirmed:  { label: 'Confirmed',  bg: 'bg-blue-100',   text: 'text-blue-700',   icon: '✓' },
    Running:    { label: 'Ongoing',    bg: 'bg-orange-100', text: 'text-orange-700', icon: '▶' },
    Overdue:    { label: 'Overdue',    bg: 'bg-red-100',    text: 'text-red-700',    icon: '⚠' },
    Requested:  { label: 'Pending',    bg: 'bg-amber-100',  text: 'text-amber-700',  icon: '⏳' },
    Cancelled:  { label: 'Cancelled',  bg: 'bg-red-100',    text: 'text-red-700',    icon: '✗' },
};

const BOOKING_BORDER = {
    Completed: 'border-l-green-500',
    Confirmed: 'border-l-blue-500',
    Running:   'border-l-orange-500',
    Overdue:   'border-l-red-600',
    Requested: 'border-l-amber-500',
    Cancelled: 'border-l-gray-400',
};

const SEV_STYLE = {
    High:   { label: 'Severe',   bg: 'bg-red-100',   text: 'text-red-700',   border: 'border-l-red-600' },
    Medium: { label: 'Moderate', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-l-amber-500' },
    Low:    { label: 'Minor',    bg: 'bg-green-100', text: 'text-green-700', border: 'border-l-green-500' },
};

const STATUS_STYLE = {
    Pending:     { label: 'Open',         bg: 'bg-red-100',   text: 'text-red-700'   },
    'On-Review': { label: 'Under Review', bg: 'bg-amber-100', text: 'text-amber-700' },
    Resolved:    { label: 'Resolved',     bg: 'bg-green-100', text: 'text-green-700' },
};

const REVIEW_TYPE_STYLE = {
    Agency: { bg: 'bg-amber-100', text: 'text-amber-700' },
    Car:    { bg: 'bg-blue-100',  text: 'text-blue-700'  },
    Bike:   { bg: 'bg-teal-100',  text: 'text-teal-700'  },
    Driver: { bg: 'bg-green-100', text: 'text-green-700' },
};

const DONUT_COLORS = {
    completed: '#22C55E',
    active:    '#3B82F6',
    pending:   '#F59E0B',
    cancelled: '#EF4444',
};

const FLEET_COLORS = {
    available:   '#22C55E',
    booked:      '#3B82F6',
    maintenance: '#EF4444',
    inactive:    '#9CA3AF',
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

const Skeleton = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

// ─── Stars ───────────────────────────────────────────────────────────────────

const Stars = ({ rating, size = 12 }) => {
    const r = parseFloat(rating) || 0;
    return (
        <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width={size} height={size} viewBox="0 0 16 16" fill={i <= r ? '#F59E0B' : '#E5E7EB'}>
                    <path d="M8 1.25l1.9 3.85 4.25.62-3.08 3 .73 4.25L8 10.77l-3.8 2.2.73-4.25-3.08-3 4.25-.62z" />
                </svg>
            ))}
        </span>
    );
};

// ─── Alert Banner ────────────────────────────────────────────────────────────

const BANNER_COLORS = {
    red:    'bg-red-50 border-red-300 text-red-800',
    orange: 'bg-orange-50 border-orange-300 text-orange-800',
    amber:  'bg-amber-50 border-amber-300 text-amber-800',
    blue:   'bg-blue-50 border-blue-300 text-blue-800',
    green:  'bg-green-50 border-green-300 text-green-800',
};

const AlertBanner = ({ color, icon, message, link, linkLabel, onDismiss }) => (
    <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${BANNER_COLORS[color]}`}
    >
        <div className="flex items-center gap-2 flex-1">
            <span className="text-base">{icon}</span>
            <span>{message}</span>
            {link && (
                <button onClick={link} className="underline font-semibold ml-1 whitespace-nowrap hover:opacity-80">
                    {linkLabel} →
                </button>
            )}
        </div>
        {onDismiss && (
            <button onClick={onDismiss} className="ml-2 p-1 rounded hover:bg-black/10 flex-shrink-0">
                <X size={14} />
            </button>
        )}
    </motion.div>
);

// ─── Stat Card ───────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, iconBg, label, value, sublabel, trend, trendLabel, badge, pulse, onClick, loading }) => {
    if (loading) return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between mb-4"><Skeleton className="h-10 w-10" /><Skeleton className="h-4 w-16" /></div>
            <Skeleton className="h-7 w-24 mb-1" /><Skeleton className="h-4 w-32" />
        </div>
    );
    return (
        <motion.div
            whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(249,115,22,0.12)' }}
            onClick={onClick}
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-all ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-xl ${iconBg}`}>
                    <Icon size={20} />
                </div>
                <div className="flex items-center gap-1.5">
                    {pulse && <span className={`w-2 h-2 rounded-full animate-pulse ${pulse}`} />}
                    {badge !== undefined && badge > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
                    )}
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-0.5">{value}</p>
            <p className="text-xs text-gray-500 font-medium mb-2">{label}</p>
            <p className="text-[11px] text-gray-400">{sublabel}</p>
            {trend !== null && trend !== undefined && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{trendLabel}</span>
                </div>
            )}
        </motion.div>
    );
};

// ─── Month Progress Bar ───────────────────────────────────────────────────────

const ProgressBar = ({ pct, color = '#F97316' }) => (
    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
    </div>
);

// ─── Quick Action Button ──────────────────────────────────────────────────────

const QuickAction = ({ icon: Icon, label, onClick, badge }) => (
    <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="relative flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border-2 border-orange-200 bg-white hover:bg-orange-50 hover:border-orange-400 transition-all min-w-[90px] group"
    >
        <div className="p-2.5 rounded-xl bg-orange-50 group-hover:bg-orange-100 text-orange-500 transition-colors">
            <Icon size={20} />
        </div>
        <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{label}</span>
        {badge > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {badge > 99 ? '99+' : badge}
            </span>
        )}
    </motion.button>
);

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ title, linkLabel = 'View All →', onLink }) => (
    <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-800">{title}</h3>
        {onLink && (
            <button onClick={onLink} className="text-xs text-orange-500 font-semibold hover:text-orange-700 flex items-center gap-1">
                {linkLabel} <ChevronRight size={12} />
            </button>
        )}
    </div>
);

// ─── Availability Bar ─────────────────────────────────────────────────────────

const AvailabilityBar = ({ segments }) => {
    const total = segments.reduce((s, v) => s + v.count, 0) || 1;
    return (
        <div className="mb-4">
            <div className="h-3 rounded-full overflow-hidden flex mb-2">
                {segments.map((seg, i) => (
                    <div key={i} style={{ width: `${(seg.count / total) * 100}%`, background: seg.color }} />
                ))}
            </div>
            <div className="flex flex-wrap gap-3">
                {segments.map((seg, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: seg.color }} />
                        {seg.count} {seg.label}
                    </span>
                ))}
            </div>
        </div>
    );
};

// ─── Custom Tooltip for Revenue Chart ─────────────────────────────────────────

const RevTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-sm">
            <p className="font-bold text-gray-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="text-xs">
                    {p.name}: {fmtMoney(p.value)}
                </p>
            ))}
        </div>
    );
};

// ─── Custom Label for Donut ───────────────────────────────────────────────────

const DonutLabel = ({ cx, cy, total }) => (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
        <tspan x={cx} dy="-6" fontSize={22} fontWeight={700} fill="#1F2937">{total}</tspan>
        <tspan x={cx} dy={20} fontSize={11} fill="#6B7280">Total</tspan>
    </text>
);


// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ icon: Icon, message, action, actionLabel }) => (
    <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="p-3 bg-orange-50 rounded-full mb-3">
            <Icon size={28} className="text-orange-400" />
        </div>
        <p className="text-sm text-gray-500 mb-3">{message}</p>
        {action && (
            <button onClick={action} className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors">
                {actionLabel}
            </button>
        )}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AgencyDashboard = () => {
    const { user } = useAuth();
    const axios = useAxiosPublic();
    const navigate = useNavigate();
    const qc = useQueryClient();

    const [dismissed, setDismissed] = useState(new Set());
    const [showAllBanners, setShowAllBanners] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    // Fetch agency profile → get agencyId
    const { data: profile } = useQuery({
        queryKey: ['agency-profile-dash', user?.email],
        queryFn: () => axios.get(`agencyRoutes/getAgencyProfile/${user.email}`).then(r => r.data),
        enabled: !!user?.email,
        staleTime: 5 * 60 * 1000,
    });
    const agencyId = profile?.agency_id;

    // Stats (refresh every 60s)
    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
        queryKey: ['agency-dash-stats', agencyId],
        queryFn: () => axios.get(`agencyDashboard/stats/${agencyId}`).then(r => r.data),
        enabled: !!agencyId,
        refetchInterval: 60000,
        onSuccess: () => setLastUpdated(Date.now()),
    });

    // Revenue trend
    const { data: trendData = [], isLoading: trendLoading } = useQuery({
        queryKey: ['agency-dash-trend', agencyId],
        queryFn: () => axios.get(`agencyDashboard/revenue-trend/${agencyId}`).then(r => r.data),
        enabled: !!agencyId,
        staleTime: 5 * 60 * 1000,
    });

    // Recent bookings
    const { data: recentBookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
        queryKey: ['agency-dash-bookings', agencyId],
        queryFn: () => axios.get(`agencyDashboard/bookings/${agencyId}`).then(r => r.data),
        enabled: !!agencyId,
        refetchInterval: 60000,
    });

    // Fleet
    const { data: fleet, isLoading: fleetLoading } = useQuery({
        queryKey: ['agency-dash-fleet', agencyId],
        queryFn: () => axios.get(`agencyDashboard/fleet/${agencyId}`).then(r => r.data),
        enabled: !!agencyId,
        staleTime: 30000,
    });

    // Drivers
    const { data: driverData, isLoading: driversLoading } = useQuery({
        queryKey: ['agency-dash-drivers', agencyId],
        queryFn: () => axios.get(`agencyDashboard/drivers/${agencyId}`).then(r => r.data),
        enabled: !!agencyId,
        staleTime: 30000,
    });

    // Damage
    const { data: damageData, isLoading: damageLoading } = useQuery({
        queryKey: ['agency-dash-damage', agencyId],
        queryFn: () => axios.get(`agencyDashboard/damage/${agencyId}`).then(r => r.data),
        enabled: !!agencyId,
        refetchInterval: 60000,
    });

    // Reviews
    const { data: recentReviews = [], isLoading: reviewsLoading } = useQuery({
        queryKey: ['agency-dash-reviews', agencyId],
        queryFn: () => axios.get(`agencyDashboard/reviews/${agencyId}`).then(r => r.data),
        enabled: !!agencyId,
        staleTime: 60000,
    });

    const handleRefresh = useCallback(() => {
        if (!agencyId) return;
        ['agency-dash-stats', 'agency-dash-bookings', 'agency-dash-damage'].forEach(k =>
            qc.invalidateQueries({ queryKey: [k, agencyId] })
        );
        refetchStats();
        refetchBookings();
        setLastUpdated(Date.now());
    }, [agencyId, qc, refetchStats, refetchBookings]);

    // Auto-update last updated display
    const [, forceUpdate] = useState(0);
    useEffect(() => {
        const id = setInterval(() => forceUpdate(n => n + 1), 30000);
        return () => clearInterval(id);
    }, []);

    // ─── Banners ─────────────────────────────────────────────────────────────

    const dismiss = (id) => setDismissed(s => new Set([...s, id]));

    const allBanners = [
        !stats?.verified && {
            id: 'unverified', color: 'red', icon: '🔴',
            message: 'Your agency is not yet verified. Some features may be limited. Contact support to complete verification.',
            link: null, linkLabel: 'Learn More',
        },
        stats?.expireDate && new Date(stats.expireDate) < new Date() && {
            id: 'expired', color: 'red', icon: '🔴',
            message: `Your agency license expired on ${fmtDateFull(stats.expireDate)}. Renew immediately to continue operations.`,
            link: () => navigate('/dashboard/agency/profile'), linkLabel: 'Renew Now',
        },
        stats?.severeOpenReports > 0 && {
            id: 'severe', color: 'red', icon: '🔴',
            message: `${stats.severeOpenReports} severe damage report${stats.severeOpenReports > 1 ? 's' : ''} are open and need immediate attention.`,
            link: () => navigate('/dashboard/agency/damage-reports'), linkLabel: 'View Reports',
        },
        stats?.unpaidDamageCharges > 0 && {
            id: 'unpaid', color: 'orange', icon: '🟠',
            message: `${stats.unpaidDamageCharges} damage report${stats.unpaidDamageCharges > 1 ? 's' : ''} have outstanding charges pending customer payment.`,
            link: () => navigate('/dashboard/agency/damage-reports'), linkLabel: 'Charge Now',
        },
        stats?.expiringDocuments > 0 && {
            id: 'docs', color: 'amber', icon: '🟡',
            message: `${stats.expiringDocuments} vehicle${stats.expiringDocuments > 1 ? 's' : ''} have insurance or license expiring within 30 days.`,
            link: () => navigate('/dashboard/agency/vehicles'), linkLabel: 'Review Fleet',
        },
        stats?.expiringDriverLicenses > 0 && {
            id: 'licenses', color: 'amber', icon: '🟡',
            message: `${stats.expiringDriverLicenses} driver license${stats.expiringDriverLicenses > 1 ? 's' : ''} expire within 30 days.`,
            link: () => navigate('/dashboard/agency/drivers'), linkLabel: 'Review Drivers',
        },
        stats?.pendingRequests > 0 && {
            id: 'pending', color: 'blue', icon: '🔵',
            message: `${stats.pendingRequests} booking request${stats.pendingRequests > 1 ? 's are' : ' is'} pending your confirmation.`,
            link: () => navigate('/dashboard/agency/bookings'), linkLabel: 'Review Now',
        },
        stats?.newReviewsToday > 0 && {
            id: 'reviews', color: 'green', icon: '🟢',
            message: `You received ${stats.newReviewsToday} new review${stats.newReviewsToday > 1 ? 's' : ''} today.`,
            link: () => navigate('/dashboard/agency/reviews'), linkLabel: 'View Reviews',
        },
    ].filter(Boolean).filter(b => !dismissed.has(b.id));

    const MAX_BANNERS = 4;
    const visibleBanners = showAllBanners ? allBanners : allBanners.slice(0, MAX_BANNERS);
    const hiddenCount = allBanners.length - MAX_BANNERS;

    // ─── Chart data ───────────────────────────────────────────────────────────

    const donutBookings = stats ? [
        { name: 'Completed', value: stats.bookingDistribution.completed, color: DONUT_COLORS.completed },
        { name: 'Active',    value: stats.bookingDistribution.active,    color: DONUT_COLORS.active },
        { name: 'Pending',   value: stats.bookingDistribution.pending,   color: DONUT_COLORS.pending },
        { name: 'Cancelled', value: stats.bookingDistribution.cancelled, color: DONUT_COLORS.cancelled },
    ].filter(d => d.value > 0) : [];

    const donutFleet = stats ? [
        { name: 'Available',   value: stats.fleetAvailability.available,   color: FLEET_COLORS.available },
        { name: 'Booked',      value: stats.fleetAvailability.booked,      color: FLEET_COLORS.booked },
        { name: 'Maintenance', value: stats.fleetAvailability.maintenance, color: FLEET_COLORS.maintenance },
        { name: 'Inactive',    value: stats.fleetAvailability.inactive,    color: FLEET_COLORS.inactive },
    ].filter(d => d.value > 0) : [];

    const monthPct = stats?.lastMonthRevenue > 0
        ? Math.round((stats.thisMonthRevenue / stats.lastMonthRevenue) * 100)
        : stats?.thisMonthRevenue > 0 ? 100 : 0;

    const tripTrend = stats ? stats.thisMonthTrips - stats.lastMonthTrips : 0;
    const revTrend  = stats ? stats.thisMonthRevenue - stats.lastMonthRevenue : 0;

    const totalRevForType = (stats?.carRevenue || 0) + (stats?.bikeRevenue || 0) || 1;
    const carRevPct  = Math.round((stats?.carRevenue || 0) / totalRevForType * 100);
    const bikeRevPct = 100 - carRevPct;

    const totalDmgCost = (stats?.damageRecovered || 0) + (stats?.damageOutstanding || 0) || 1;
    const recoveryRate = Math.round((stats?.damageRecovered || 0) / totalDmgCost * 100);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Welcome back, <span className="font-semibold text-orange-600">{stats?.agencyName || profile?.agency_name || '…'}</span>! Here&apos;s what&apos;s happening today.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                        Updated {formatDistanceToNow(lastUpdated)} ago
                    </span>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                    >
                        <RefreshCw size={13} /> Refresh
                    </button>
                </div>
            </div>

            {/* ── Alert Banners ── */}
            <AnimatePresence>
                {visibleBanners.length > 0 && (
                    <div className="space-y-2">
                        {visibleBanners.map(b => (
                            <AlertBanner
                                key={b.id}
                                color={b.color}
                                icon={b.icon}
                                message={b.message}
                                link={b.link}
                                linkLabel={b.linkLabel}
                                onDismiss={() => dismiss(b.id)}
                            />
                        ))}
                        {!showAllBanners && hiddenCount > 0 && (
                            <button
                                onClick={() => setShowAllBanners(true)}
                                className="text-xs font-semibold text-orange-500 hover:text-orange-700 px-2 py-1"
                            >
                                Show {hiddenCount} more alert{hiddenCount > 1 ? 's' : ''} ▾
                            </button>
                        )}
                        {showAllBanners && hiddenCount > 0 && (
                            <button
                                onClick={() => setShowAllBanners(false)}
                                className="text-xs font-semibold text-orange-500 hover:text-orange-700 px-2 py-1"
                            >
                                Show fewer ▴
                            </button>
                        )}
                    </div>
                )}
            </AnimatePresence>

            {/* ── KPI Row 1 ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={ClipboardList} iconBg="bg-orange-50 text-orange-600"
                    label="Total Bookings" value={stats?.totalBookings ?? '—'}
                    sublabel="All time"
                    trend={tripTrend}
                    trendLabel={`${tripTrend >= 0 ? '+' : ''}${tripTrend} this month`}
                    onClick={() => navigate('/dashboard/agency/bookings')}
                    loading={statsLoading}
                />
                <StatCard
                    icon={Activity} iconBg="bg-blue-50 text-blue-600"
                    label="Active Bookings" value={stats?.activeBookings ?? '—'}
                    sublabel="Currently running"
                    pulse="bg-blue-500"
                    onClick={() => navigate('/dashboard/agency/bookings')}
                    loading={statsLoading}
                />
                <StatCard
                    icon={Clock} iconBg="bg-amber-50 text-amber-600"
                    label="Pending Requests" value={stats?.pendingRequests ?? '—'}
                    sublabel="Awaiting confirmation"
                    pulse={stats?.pendingRequests > 0 ? 'bg-amber-400' : null}
                    badge={stats?.pendingRequests}
                    onClick={() => navigate('/dashboard/agency/bookings')}
                    loading={statsLoading}
                />
                <StatCard
                    icon={CheckCircle} iconBg="bg-green-50 text-green-600"
                    label="Completed Trips" value={stats?.completedTrips ?? '—'}
                    sublabel="Successfully delivered"
                    trend={tripTrend}
                    trendLabel={`${tripTrend >= 0 ? '+' : ''}${tripTrend} vs last month`}
                    onClick={() => navigate('/dashboard/agency/bookings')}
                    loading={statsLoading}
                />
            </div>

            {/* ── KPI Row 2 ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={DollarSign} iconBg="bg-green-50 text-green-600"
                    label="Total Revenue" value={statsLoading ? '—' : fmtMoney(stats?.totalRevenue)}
                    sublabel="All time earnings"
                    trend={revTrend}
                    trendLabel={`${revTrend >= 0 ? '+' : ''}${fmtMoney(Math.abs(revTrend))} this month`}
                    onClick={() => navigate('/dashboard/agency/bookings')}
                    loading={statsLoading}
                />
                <motion.div
                    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(249,115,22,0.12)' }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer"
                    onClick={() => navigate('/dashboard/agency/bookings')}
                >
                    {statsLoading ? (
                        <><Skeleton className="h-10 w-10 mb-4" /><Skeleton className="h-7 w-24 mb-1" /><Skeleton className="h-4 w-32" /></>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600"><DollarSign size={20} /></div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800 mb-0.5">{fmtMoney(stats?.thisMonthRevenue)}</p>
                            <p className="text-xs text-gray-500 font-medium mb-2">This Month Revenue</p>
                            <p className="text-[11px] text-gray-400 mb-1">Current month</p>
                            <ProgressBar pct={monthPct} />
                            <p className="text-[10px] text-gray-400 mt-1">{monthPct}% of last month</p>
                        </>
                    )}
                </motion.div>
                <StatCard
                    icon={Car} iconBg="bg-blue-50 text-blue-600"
                    label="Fleet Size" value={statsLoading ? '—' : stats?.fleetTotal ?? '—'}
                    sublabel={`${stats?.carCount ?? 0} Cars · ${stats?.bikeCount ?? 0} Bikes`}
                    onClick={() => navigate('/dashboard/agency/vehicles')}
                    loading={statsLoading}
                />
                <StatCard
                    icon={Star} iconBg="bg-amber-50 text-amber-600"
                    label="Overall Rating"
                    value={statsLoading ? '—' : `★ ${(stats?.overallRating || 0).toFixed(2)}`}
                    sublabel={`Across ${stats?.totalReviewCount ?? 0} total reviews`}
                    trend={stats?.ratingTrend}
                    trendLabel={stats?.ratingTrend != null
                        ? `${stats.ratingTrend >= 0 ? '↑ +' : '↓ '}${Math.abs(stats.ratingTrend).toFixed(1)} vs last month`
                        : 'No trend data'}
                    onClick={() => navigate('/dashboard/agency/reviews')}
                    loading={statsLoading}
                />
            </div>

            {/* ── Quick Actions ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Quick Actions</h3>
                <div className="flex gap-3 overflow-x-auto pb-1">
                    <QuickAction icon={Plus}          label="Add Vehicle"    onClick={() => navigate('/dashboard/agency/add-cars')} />
                    <QuickAction icon={Users}          label="Add Driver"     onClick={() => navigate('/dashboard/agency/drivers')} />
                    <QuickAction icon={ClipboardList}  label="View Bookings"  onClick={() => navigate('/dashboard/agency/bookings')} />
                    <QuickAction icon={Wrench}         label="Review Damage"  onClick={() => navigate('/dashboard/agency/damage-reports')} badge={stats?.severeOpenReports || 0} />
                    <QuickAction icon={MessageSquare}  label="View Reviews"   onClick={() => navigate('/dashboard/agency/reviews')} />
                    <QuickAction icon={BarChart3}      label="Fleet Report"   onClick={() => navigate('/dashboard/agency/vehicles')} />
                    <QuickAction icon={Settings}       label="Profile"        onClick={() => navigate('/dashboard/agency/profile')} />
                </div>
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Revenue Trend */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <SectionHeader title="Revenue Trend" />
                    {trendLoading ? (
                        <Skeleton className="h-56 w-full" />
                    ) : trendData.length === 0 ? (
                        <EmptyState icon={BarChart3} message="No revenue data yet. Complete bookings to see trends." />
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} width={45} />
                                <Tooltip content={<RevTooltip />} />
                                <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={2.5} dot={{ r: 3, fill: '#F97316' }} activeDot={{ r: 5 }} name="This Year" />
                                <Line type="monotone" dataKey="prevRevenue" stroke="#D1D5DB" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Last Year" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Two donuts */}
                <div className="grid grid-cols-2 gap-4">

                    {/* Booking Distribution */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <p className="text-sm font-bold text-gray-700 mb-2">Bookings</p>
                        {statsLoading ? <Skeleton className="h-44 w-full" /> : (
                            donutBookings.length === 0 ? (
                                <EmptyState icon={ClipboardList} message="No bookings yet." />
                            ) : (
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={donutBookings} cx="50%" cy="50%" innerRadius={45} outerRadius={68}
                                            dataKey="value" paddingAngle={2}
                                            label={false}
                                        >
                                            {donutBookings.map((d, i) => <Cell key={i} fill={d.color} />)}
                                            <DonutLabel cx="50%" cy="50%" total={stats?.totalBookings} />
                                        </Pie>
                                        <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                                        <Tooltip formatter={(v) => [v, '']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )
                        )}
                    </div>

                    {/* Fleet Availability */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <p className="text-sm font-bold text-gray-700 mb-2">Fleet</p>
                        {statsLoading ? <Skeleton className="h-44 w-full" /> : (
                            donutFleet.length === 0 ? (
                                <EmptyState icon={Car} message="No vehicles yet." />
                            ) : (
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={donutFleet} cx="50%" cy="50%" innerRadius={45} outerRadius={68}
                                            dataKey="value" paddingAngle={2}
                                            label={false}
                                        >
                                            {donutFleet.map((d, i) => <Cell key={i} fill={d.color} />)}
                                            <DonutLabel cx="50%" cy="50%" total={stats?.fleetTotal} />
                                        </Pie>
                                        <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                                        <Tooltip formatter={(v) => [v, '']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* ── Recent Bookings Table ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <SectionHeader title="Recent Bookings" onLink={() => navigate('/dashboard/agency/bookings')} />
                {bookingsLoading ? (
                    <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
                ) : recentBookings.length === 0 ? (
                    <EmptyState icon={Calendar} message="No bookings yet. Share your fleet to get started." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-400 font-semibold border-b border-gray-100">
                                    <th className="pb-2 text-left font-medium">Booking</th>
                                    <th className="pb-2 text-left font-medium">Customer</th>
                                    <th className="pb-2 text-left font-medium">Vehicle</th>
                                    <th className="pb-2 text-left font-medium">Trip Period</th>
                                    <th className="pb-2 text-right font-medium">Cost</th>
                                    <th className="pb-2 text-center font-medium">Status</th>
                                    <th className="pb-2 text-center font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map(b => {
                                    const st = BOOKING_STATUS[b.status] || BOOKING_STATUS.Requested;
                                    const border = BOOKING_BORDER[b.status] || 'border-l-gray-300';
                                    return (
                                        <tr key={b.booking_id} className={`border-l-4 ${border} border-b border-gray-50 hover:bg-orange-50/30 transition-colors`}>
                                            <td className="py-2.5 pr-3 pl-2">
                                                <span className="font-mono text-xs text-gray-500">{b.booking_id.slice(0, 10)}…</span>
                                            </td>
                                            <td className="py-2.5 pr-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                                        {avatarInitial(b.user_name)}
                                                    </div>
                                                    <span className="font-medium text-gray-700 text-xs">{b.user_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 pr-3">
                                                <span className="font-medium text-gray-700 text-xs">{b.brand} {b.model}</span>
                                                <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${b.vehicle_type === 'Car' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
                                                    {b.vehicle_type}
                                                </span>
                                            </td>
                                            <td className="py-2.5 pr-3 text-xs text-gray-600">
                                                <div>{fmtDate(b.start_ts)} → {fmtDate(b.end_ts)}</div>
                                                <div className="text-gray-400 text-[10px]">{b.total_rent_hours}h</div>
                                            </td>
                                            <td className="py-2.5 pr-3 text-right font-bold text-gray-800 text-xs">{fmtMoney(b.total_cost)}</td>
                                            <td className="py-2.5 px-3 text-center">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${st.bg} ${st.text}`}>
                                                    {st.icon} {st.label}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <button
                                                    onClick={() => navigate(`/dashboard/agency/bookings/${b.booking_id}`)}
                                                    className="p-1.5 rounded-lg hover:bg-orange-100 text-gray-400 hover:text-orange-600 transition-colors"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Fleet Status + Driver Status ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Fleet Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <SectionHeader title="Fleet Status" onLink={() => navigate('/dashboard/agency/vehicles')} />
                    {fleetLoading ? <Skeleton className="h-48 w-full" /> : !fleet ? null : (
                        <>
                            <AvailabilityBar segments={[
                                { label: 'Available',   count: fleet.available,   color: FLEET_COLORS.available },
                                { label: 'Booked',      count: fleet.booked,      color: FLEET_COLORS.booked },
                                { label: 'Maintenance', count: fleet.maintenance, color: FLEET_COLORS.maintenance },
                                { label: 'Inactive',    count: fleet.inactive,    color: FLEET_COLORS.inactive },
                            ]} />
                            {fleet.vehicles.length === 0 ? (
                                <EmptyState icon={Car} message="Add your first vehicle to start accepting bookings." action={() => navigate('/dashboard/agency/add-cars')} actionLabel="Add Vehicle" />
                            ) : (
                                <div className="space-y-2">
                                    {fleet.vehicles.map(v => {
                                        const statusColors = {
                                            Available:   'bg-green-100 text-green-700',
                                            Booked:      'bg-blue-100 text-blue-700',
                                            Requested:   'bg-blue-100 text-blue-700',
                                            Maintenance: 'bg-red-100 text-red-700',
                                            Unavailable: 'bg-gray-100 text-gray-600',
                                            Suspend:     'bg-gray-100 text-gray-600',
                                        }[v.status] || 'bg-gray-100 text-gray-600';
                                        return (
                                            <div key={v.vehicle_id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                                                {v.image ? (
                                                    <img src={v.image} alt={v.brand} className="w-10 h-8 object-cover rounded-lg flex-shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-8 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                        {v.vehicle_type === 'Car' ? <Car size={14} className="text-gray-400" /> : <Bike size={14} className="text-gray-400" />}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-semibold text-gray-800 truncate">{v.brand} {v.model}</span>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${v.vehicle_type === 'Car' ? 'bg-blue-50 text-blue-600' : 'bg-teal-50 text-teal-600'}`}>{v.vehicle_type}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Stars rating={v.rating} size={10} />
                                                        <span className="text-[10px] text-gray-400">{fmtMoney(v.rental_price)}/day</span>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColors}`}>{v.status}</span>
                                                <button onClick={() => navigate(`/dashboard/agency/vehicles/${v.vehicle_id}`)} className="p-1 rounded hover:bg-orange-50 text-gray-400 hover:text-orange-600">
                                                    <Eye size={13} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {fleet.totalCount > 6 && (
                                        <button onClick={() => navigate('/dashboard/agency/vehicles')} className="text-xs text-gray-400 hover:text-orange-500 font-medium pt-1">
                                            + {fleet.totalCount - 6} more vehicles
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Driver Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <SectionHeader title="Driver Status" onLink={() => navigate('/dashboard/agency/drivers')} />
                    {driversLoading ? <Skeleton className="h-48 w-full" /> : !driverData ? null : (
                        <>
                            <AvailabilityBar segments={[
                                { label: 'Available',   count: driverData.available,   color: FLEET_COLORS.available },
                                { label: 'Unavailable', count: driverData.unavailable, color: '#F59E0B' },
                                { label: 'Suspended',   count: driverData.suspended,   color: FLEET_COLORS.maintenance },
                            ]} />
                            {driverData.drivers.length === 0 ? (
                                <EmptyState icon={Users} message="Add drivers to offer chauffeured bookings." action={() => navigate('/dashboard/agency/drivers')} actionLabel="Add Driver" />
                            ) : (
                                <div className="space-y-2">
                                    {driverData.drivers.map(d => {
                                        const licenseColor = {
                                            Verified:   'bg-green-100 text-green-700',
                                            Unverified: 'bg-amber-100 text-amber-700',
                                            Expired:    'bg-red-100 text-red-700',
                                        }[d.license_status] || 'bg-gray-100 text-gray-600';
                                        return (
                                            <div key={d.driver_id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                                                {d.photo ? (
                                                    <img src={d.photo} alt={d.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                                                        {avatarInitial(d.name)}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-semibold text-gray-800 truncate">{d.name}</span>
                                                        {d.verified && <CheckCircle size={10} className="text-green-500 flex-shrink-0" />}
                                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${d.availability && d.accountstatus === 'Active' ? 'bg-green-500' : 'bg-red-400'}`} />
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Stars rating={d.rating} size={10} />
                                                        <span className="text-[10px] text-gray-400">{fmtMoney(d.rental_price)}/day</span>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${licenseColor}`}>{d.license_status || 'Unknown'}</span>
                                                <button onClick={() => navigate('/dashboard/agency/drivers')} className="p-1 rounded hover:bg-orange-50 text-gray-400 hover:text-orange-600">
                                                    <Eye size={13} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {driverData.totalCount > 6 && (
                                        <button onClick={() => navigate('/dashboard/agency/drivers')} className="text-xs text-gray-400 hover:text-orange-500 font-medium pt-1">
                                            + {driverData.totalCount - 6} more drivers
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Recent Damage + Recent Reviews ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Recent Damage Reports */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <SectionHeader title="Recent Damage Reports" onLink={() => navigate('/dashboard/agency/damage-reports')} />
                    {damageLoading ? (
                        <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
                    ) : !damageData?.reports?.length ? (
                        <EmptyState icon={Shield} message="No damage reports yet." />
                    ) : (
                        <div className="space-y-2">
                            {damageData.reports.map(r => {
                                const sev = SEV_STYLE[r.severity] || SEV_STYLE.Low;
                                const sta = STATUS_STYLE[r.status] || STATUS_STYLE.Pending;
                                return (
                                    <div key={r.damage_id} className={`flex items-center gap-3 py-2.5 pl-3 border-l-4 ${sev.border} border-b border-gray-50 last:border-b-0 rounded-r-lg`}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${sev.bg} ${sev.text}`}>{sev.label}</span>
                                                <span className="text-xs font-semibold text-gray-700 truncate">{r.brand} {r.model}</span>
                                                {r.damage_type && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-gray-200 text-gray-500">{r.damage_type}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${sta.bg} ${sta.text}`}>{sta.label}</span>
                                                <span className="text-xs font-bold text-gray-800">
                                                    {r.estimated_cost ? fmtMoney(r.estimated_cost) : <span className="text-red-400">Not Set</span>}
                                                </span>
                                                <span className="text-[10px] text-gray-400 ml-auto">{daysAgo(r.report_date)}</span>
                                            </div>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.is_paid ? 'bg-green-500' : r.estimated_cost > 0 ? 'bg-red-400' : 'bg-gray-300'}`} title={r.is_paid ? 'Paid' : r.estimated_cost > 0 ? 'Unpaid' : 'No Cost'} />
                                    </div>
                                );
                            })}
                            {damageData.totalCount > 5 && (
                                <button onClick={() => navigate('/dashboard/agency/damage-reports')} className="text-xs text-gray-400 hover:text-orange-500 font-medium pt-1">
                                    + {damageData.totalCount - 5} more reports
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Recent Reviews */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <SectionHeader title="Recent Reviews" onLink={() => navigate('/dashboard/agency/reviews')} />
                    {reviewsLoading ? (
                        <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
                    ) : !recentReviews.length ? (
                        <EmptyState icon={Star} message="No reviews yet. Complete bookings to receive feedback." />
                    ) : (
                        <div className="space-y-2">
                            {recentReviews.map((r, i) => {
                                const rFloat = parseFloat(r.rating) || 0;
                                const borderColor = rFloat >= 4 ? 'border-l-green-500' : rFloat >= 3 ? 'border-l-amber-400' : 'border-l-red-500';
                                const typeStyle = REVIEW_TYPE_STYLE[r.review_type] || REVIEW_TYPE_STYLE.Agency;
                                return (
                                    <div key={i} className={`flex items-center gap-3 py-2.5 pl-3 border-l-4 ${borderColor} border-b border-gray-50 last:border-b-0 rounded-r-lg`}>
                                        <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                                            {avatarInitial(r.reviewer_name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeStyle.bg} ${typeStyle.text}`}>{r.review_type}</span>
                                                <Stars rating={r.rating} size={10} />
                                                <span className="text-xs font-medium text-gray-700">{r.reviewer_name}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                                {r.review ? r.review : <em className="text-gray-400">Rating only</em>}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-gray-400">{r.subject_name}</span>
                                                <span className="text-[10px] text-gray-300">·</span>
                                                <span className="text-[10px] text-gray-400">{daysAgo(r.date)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Revenue Summary Footer ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="mb-5">
                    <h3 className="text-base font-bold text-gray-800">Revenue Summary</h3>
                    <p className="text-xs text-gray-500">Financial overview of your agency</p>
                </div>

                {/* 4 metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'This Week', value: stats?.thisWeekRevenue, color: 'text-orange-600', compare: null },
                        { label: 'This Month', value: stats?.thisMonthRevenue, color: 'text-orange-600', compare: stats?.lastMonthRevenue },
                        { label: 'Last Month', value: stats?.lastMonthRevenue, color: 'text-gray-600', compare: null },
                        { label: 'All Time', value: stats?.totalRevenue, color: 'text-green-600', compare: null },
                    ].map((m, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                            {statsLoading ? <Skeleton className="h-7 w-24" /> : (
                                <p className={`text-xl font-bold ${m.color}`}>{fmtMoney(m.value)}</p>
                            )}
                            {m.compare != null && !statsLoading && (
                                <>
                                    <ProgressBar pct={m.compare > 0 ? Math.round((m.value / m.compare) * 100) : m.value > 0 ? 100 : 0} />
                                    <p className="text-[10px] text-gray-400 mt-1">{m.compare > 0 ? Math.round((m.value / m.compare) * 100) : m.value > 0 ? '>' : 0}% of last month</p>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Revenue by vehicle type */}
                <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-600 mb-3">Revenue by Vehicle Type</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 w-8">Cars</span>
                            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full flex items-center justify-end pr-2 transition-all" style={{ width: `${carRevPct}%` }}>
                                    <span className="text-[10px] text-white font-bold">{carRevPct}%</span>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-700 w-24 text-right">{fmtMoney(stats?.carRevenue)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 w-8">Bikes</span>
                            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2 transition-all" style={{ width: `${bikeRevPct}%` }}>
                                    <span className="text-[10px] text-white font-bold">{bikeRevPct}%</span>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-700 w-24 text-right">{fmtMoney(stats?.bikeRevenue)}</span>
                        </div>
                    </div>
                </div>

                {/* Damage recovery */}
                <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-600 mb-3">Damage Cost Recovery</p>
                    <div className="flex flex-wrap gap-4 mb-3">
                        <div>
                            <p className="text-[10px] text-gray-400">Recovered</p>
                            <p className="text-base font-bold text-green-600">{fmtMoney(stats?.damageRecovered)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400">Outstanding</p>
                            <p className="text-base font-bold text-red-500">{fmtMoney(stats?.damageOutstanding)}</p>
                        </div>
                        <div className="flex items-end">
                            <div>
                                <p className="text-[10px] text-gray-400">Recovery Rate</p>
                                <p className="text-base font-bold text-orange-600">{recoveryRate}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${Math.min(recoveryRate, 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{recoveryRate}% of damage costs recovered</p>
                </div>
            </div>

            {/* Bottom spacer */}
            <div className="h-4" />
        </div>
    );
};

export default AgencyDashboard;
