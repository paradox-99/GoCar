/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,ResponsiveContainer, PieChart, Pie, Cell, Legend} from 'recharts';
import { Users, Building2, Car, Bike, ClipboardList, DollarSign, TrendingUp, TrendingDown, X, RefreshCw, Search, Plus, Bell, BarChart3,CheckCircle, ChevronRight, ChevronLeft, FileText, Wrench, Calendar} from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays, parseISO, isValid } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtMoney = (v) => `৳${Number(v || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => {
    try { const p = typeof d === 'string' ? parseISO(d) : new Date(d); return isValid(p) ? format(p, 'MMM dd') : '—'; }
    catch { return '—'; }
};
const fmtDateFull = (d) => {
    try { const p = typeof d === 'string' ? parseISO(d) : new Date(d); return isValid(p) ? format(p, 'MMM dd, yyyy') : '—'; }
    catch { return '—'; }
};
const timeAgo = (d) => {
    try { const p = typeof d === 'string' ? parseISO(d) : new Date(d); return isValid(p) ? formatDistanceToNow(p, { addSuffix: true }) : '—'; }
    catch { return '—'; }
};
const avatarInit = (n) => (n || '?').charAt(0).toUpperCase();
const plural = (n, s) => `${n} ${s}${n !== 1 ? 's' : ''}`;

const BOOKING_STATUS = {
    Completed: { label: 'Completed', bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
    Confirmed: { label: 'Confirmed', bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
    Running:   { label: 'Ongoing',   bg: 'bg-teal-100',   text: 'text-teal-700',   dot: 'bg-teal-500'   },
    Overdue:   { label: 'Overdue',   bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-600'    },
    Requested: { label: 'Pending',   bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
    Cancelled: { label: 'Cancelled', bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-400'    },
};

const SEV_STYLE = {
    High:   { label: 'Severe',   bg: 'bg-red-100',   text: 'text-red-700',   border: 'border-l-red-600'   },
    Medium: { label: 'Moderate', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-l-amber-500' },
    Low:    { label: 'Minor',    bg: 'bg-green-100', text: 'text-green-700', border: 'border-l-green-500'  },
};

const DMG_STATUS = {
    Pending:     { label: 'Open',         bg: 'bg-red-100',   text: 'text-red-700'   },
    'On-Review': { label: 'Under Review', bg: 'bg-amber-100', text: 'text-amber-700' },
    Resolved:    { label: 'Resolved',     bg: 'bg-green-100', text: 'text-green-700' },
};

const METHOD_COLORS = {
    card:           '#3B82F6',
    mobile_banking: '#F97316',
    cash:           '#22C55E',
    bkash:          '#EC4899',
    nagad:          '#F97316',
    unknown:        '#9CA3AF',
};

const DONUT_COLORS = ['#22C55E','#14B8A6','#F97316','#3B82F6','#EF4444'];

// ─── Skeleton ────────────────────────────────────────────────────────────────

const Sk = ({ className = '' }) => <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;

// ─── Live Clock ──────────────────────────────────────────────────────────────

const LiveClock = () => {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return (
        <span className="text-xs text-gray-500 font-mono">
            {format(now, 'EEEE, MMM dd, yyyy · hh:mm:ss aa')}
        </span>
    );
};

// ─── Alert Banner ────────────────────────────────────────────────────────────

const BANNER_COLOR = {
    red:    'bg-red-50 border-red-300 text-red-800',
    orange: 'bg-orange-50 border-orange-300 text-orange-800',
    amber:  'bg-amber-50 border-amber-300 text-amber-800',
};

const AlertBanner = ({ color, icon, message, linkLabel, onLink, onDismiss }) => (
    <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium ${BANNER_COLOR[color]}`}
    >
        <span className="text-base flex-shrink-0">{icon}</span>
        <span className="flex-1">{message}</span>
        {onLink && <button onClick={onLink} className="underline font-semibold whitespace-nowrap hover:opacity-80 ml-1">{linkLabel} →</button>}
        <button onClick={onDismiss} className="p-1 rounded hover:bg-black/10 flex-shrink-0 ml-1"><X size={13} /></button>
    </motion.div>
);

// ─── KPI Card ────────────────────────────────────────────────────────────────

const KPICard = ({ icon: Icon, iconColor, borderColor, label, value, sub, trend, trendVal, pulse, onClick, loading }) => {
    if (loading) return (
        <div className={`bg-white rounded-2xl shadow-sm border-l-4 ${borderColor} border border-gray-100 p-4`}>
            <div className="flex justify-between mb-3"><Sk className="h-9 w-9 rounded-xl" /><Sk className="h-4 w-12" /></div>
            <Sk className="h-7 w-20 mb-1" /><Sk className="h-4 w-28 mt-2" />
        </div>
    );
    return (
        <motion.div
            whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(249,115,22,0.12)' }}
            onClick={onClick}
            className={`bg-white rounded-2xl shadow-sm border-l-4 ${borderColor} border border-gray-100 p-4 cursor-pointer relative overflow-hidden`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-xl ${iconColor} bg-opacity-10`}>
                    <Icon size={18} className={iconColor.replace('bg-', 'text-').replace('-100', '-600')} />
                </div>
                {pulse && <span className={`w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0 mt-1 ${pulse}`} />}
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-0.5">{value}</p>
            <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
            <p className="text-[11px] text-gray-400 leading-tight">{sub}</p>
            {trend !== undefined && trend !== null && (
                <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    <span>{trendVal}</span>
                </div>
            )}
        </motion.div>
    );
};

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHead = ({ title, sub, onLink, linkLabel = 'View All →' }) => (
    <div className="flex items-center justify-between mb-4">
        <div>
            <h3 className="text-sm font-bold text-gray-800">{title}</h3>
            {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
        </div>
        {onLink && <button onClick={onLink} className="text-xs text-orange-500 font-semibold hover:text-orange-700 flex items-center gap-1">{linkLabel}<ChevronRight size={12} /></button>}
    </div>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgBar = ({ pct, color = '#F97316', label, sublabel }) => (
    <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-700">{label}</span>
            <span className="font-bold text-gray-800">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
        </div>
        {sublabel && <p className="text-[10px] text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
);

// ─── Stars ────────────────────────────────────────────────────────────────────

const Stars = ({ rating, size = 11 }) => {
    const r = parseFloat(rating) || 0;
    return (
        <span className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
                <svg key={i} width={size} height={size} viewBox="0 0 16 16" fill={i <= r ? '#F59E0B' : '#E5E7EB'}>
                    <path d="M8 1.25l1.9 3.85 4.25.62-3.08 3 .73 4.25L8 10.77l-3.8 2.2.73-4.25-3.08-3 4.25-.62z" />
                </svg>
            ))}
            <span className="text-[10px] text-gray-500 ml-0.5">{r.toFixed(1)}</span>
        </span>
    );
};

// ─── Revenue Tooltip ──────────────────────────────────────────────────────────

const RevTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
            <p className="font-bold text-gray-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>{p.name}: {fmtMoney(p.value)}</p>
            ))}
            {payload[0]?.payload?.transactions > 0 && (
                <p className="text-gray-400 mt-0.5">{payload[0].payload.transactions} txns</p>
            )}
        </div>
    );
};

// ─── Donut Center Label ───────────────────────────────────────────────────────

const DonutCenter = ({ cx, cy, total, label }) => (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
        <tspan x={cx} dy="-6" fontSize={22} fontWeight={700} fill="#1F2937">{total}</tspan>
        <tspan x={cx} dy={20} fontSize={11} fill="#6B7280">{label}</tspan>
    </text>
);

// ─── Mini Calendar ────────────────────────────────────────────────────────────

const MiniCalendar = ({ bookingDots = {}, onDayClick, selectedDay }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const dayStr = (d) => `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const intensity = (count) => count > 10 ? 'bg-orange-600 text-white' : count > 5 ? 'bg-orange-400 text-white' : count > 0 ? 'bg-orange-200 text-orange-800' : '';

    return (
        <div className="select-none">
            <div className="flex items-center justify-between mb-3">
                <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1 rounded hover:bg-gray-100"><ChevronLeft size={14} /></button>
                <span className="text-sm font-bold text-gray-700">{format(currentMonth, 'MMMM yyyy')}</span>
                <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1 rounded hover:bg-gray-100"><ChevronRight size={14} /></button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <div key={d} className="text-[10px] text-center text-gray-400 font-semibold py-1">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
                {cells.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const ds = dayStr(d);
                    const count = bookingDots[ds] || 0;
                    const isToday = ds === todayStr;
                    const isSelected = ds === selectedDay;
                    return (
                        <button
                            key={i}
                            onClick={() => onDayClick(ds)}
                            className={`h-8 w-full rounded-lg text-xs font-medium flex flex-col items-center justify-center transition-all
                                ${isSelected ? 'ring-2 ring-orange-500' : ''}
                                ${isToday ? 'ring-2 ring-orange-300 font-bold' : ''}
                                ${count > 0 ? intensity(count) : 'hover:bg-gray-100 text-gray-600'}
                            `}
                        >
                            {d}
                            {count > 0 && <span className="text-[8px] leading-none opacity-80">{count}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Global Search Modal ──────────────────────────────────────────────────────

const GlobalSearch = ({ onClose, navigate }) => {
    const axios = useAxiosPublic();
    const [q, setQ] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    useEffect(() => {
        if (!q.trim() || q.trim().length < 2) { setResults(null); return; }
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await axios.get(`admin-dashboard/search?q=${encodeURIComponent(q)}`);
                setResults(res.data);
            } catch { setResults(null); }
            finally { setLoading(false); }
        }, 300);
        return () => clearTimeout(timerRef.current);
    }, [q, axios]);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const totalResults = results ? Object.values(results).reduce((s, v) => s + v.length, 0) : 0;

    const groups = results ? [
        { key: 'users',    label: '👤 Users',    items: results.users,    path: (r) => navigate(`/dashboard/admin/users/${r.id}`) },
        { key: 'agencies', label: '🏢 Agencies',  items: results.agencies,  path: (r) => navigate(`/dashboard/admin/agencies/${r.id}`) },
        { key: 'cars',     label: '🚗 Cars',      items: results.cars,     path: (r) => navigate(`/dashboard/admin/vehicles/${r.id}`) },
        { key: 'bikes',    label: '🏍️ Bikes',     items: results.bikes,    path: (r) => navigate(`/dashboard/admin/vehicles/${r.id}`) },
        { key: 'drivers',  label: '🧑‍✈️ Drivers',  items: results.drivers,  path: (r) => navigate(`/dashboard/admin/drivers/${r.id}`) },
        { key: 'bookings', label: '📋 Bookings',  items: results.bookings, path: (r) => navigate(`/dashboard/admin/bookings`) },
    ].filter(g => g.items?.length > 0) : [];

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <Search size={18} className="text-gray-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Search users, agencies, bookings, vehicles..."
                        className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400"
                    />
                    {loading && <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />}
                    <kbd className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">ESC</kbd>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {!q.trim() && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            Type to search across the entire platform...
                        </div>
                    )}
                    {q.trim() && !loading && totalResults === 0 && (
                        <div className="p-8 text-center">
                            <Search size={32} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No results found for &quot;{q}&quot;</p>
                        </div>
                    )}
                    {groups.map(g => (
                        <div key={g.key} className="border-b border-gray-50 last:border-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2 bg-gray-50">{g.label}</p>
                            {g.items.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => { g.path(item); onClose(); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors text-left"
                                >
                                    {item.photo ? (
                                        <img src={item.photo} alt={item.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                            {avatarInit(item.name || item.customer_name)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 truncate">{item.name || item.vehicle || item.id}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{item.email || item.city || item.agency_name || item.customer_name || ''}</p>
                                    </div>
                                    {item.status && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {item.status}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── FAB ─────────────────────────────────────────────────────────────────────

const FAB = ({ navigate, onSearch }) => {
    const [open, setOpen] = useState(false);
    const items = [
        { icon: Bell,      label: 'Send Notification', action: () => navigate('/dashboard/admin/notifications') },
        { icon: ClipboardList, label: 'Pending Approvals', action: () => navigate('/dashboard/admin/verification-queue') },
        { icon: BarChart3, label: 'View Analytics',    action: () => navigate('/dashboard/admin/reports') },
        { icon: Search,    label: 'Search Platform',   action: onSearch },
    ];
    return (
        <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-2">
            <AnimatePresence>
                {open && items.map((item, i) => (
                    <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.05 } }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        onClick={() => { item.action(); setOpen(false); }}
                        className="flex items-center gap-2 bg-white rounded-full shadow-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-orange-50 border border-gray-100 transition-colors"
                    >
                        <item.icon size={14} className="text-orange-500" />
                        {item.label}
                    </motion.button>
                ))}
            </AnimatePresence>
            <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(o => !o)}
                className="w-14 h-14 bg-orange-500 hover:bg-orange-600 rounded-full shadow-xl flex items-center justify-center text-white transition-colors"
            >
                <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
                    <Plus size={24} />
                </motion.div>
            </motion.button>
        </div>
    );
};

// ─── Rank Medal ───────────────────────────────────────────────────────────────

const Medal = ({ rank }) => {
    if (rank === 1) return <span className="text-base">🥇</span>;
    if (rank === 2) return <span className="text-base">🥈</span>;
    if (rank === 3) return <span className="text-base">🥉</span>;
    return <span className="text-xs font-bold text-gray-500 w-5 text-center">{rank}</span>;
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ icon: Icon, msg }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="p-3 bg-orange-50 rounded-full mb-2"><Icon size={24} className="text-orange-400" /></div>
        <p className="text-xs text-gray-400">{msg}</p>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
    const { user } = useAuth();
    const axios = useAxiosPublic();
    const navigate = useNavigate();
    const qc = useQueryClient();

    const [dismissed, setDismissed] = useState(new Set());
    const [revPeriod, setRevPeriod] = useState('month');
    const [methodPeriod, setMethodPeriod] = useState('month');
    const [vehicleTab, setVehicleTab] = useState('car');
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const [searchOpen, setSearchOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [, forceRender] = useState(0);

    // Admin name
    const { data: adminInfo } = useQuery({
        queryKey: ['admin-info'],
        queryFn: () => axios.get('admin-dashboard/admin-info').then(r => r.data),
        staleTime: 10 * 60 * 1000,
    });

    // Main stats (refresh every 60s)
    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
        queryKey: ['admin-dash-stats'],
        queryFn: () => axios.get('admin-dashboard/stats').then(r => r.data),
        refetchInterval: 60000,
    });

    // Revenue chart
    const { data: revChart, isLoading: revLoading } = useQuery({
        queryKey: ['admin-dash-rev', revPeriod],
        queryFn: () => axios.get(`admin-dashboard/revenue-chart?period=${revPeriod}`).then(r => r.data),
        staleTime: 30000,
    });

    // Revenue by method
    const { data: revMethod = [], isLoading: methodLoading } = useQuery({
        queryKey: ['admin-dash-method', methodPeriod],
        queryFn: () => axios.get(`admin-dashboard/revenue-by-method?period=${methodPeriod}`).then(r => r.data),
    });

    // Recent feeds
    const { data: recentBookings = [], isLoading: bkLoading, refetch: refetchBk } = useQuery({
        queryKey: ['admin-dash-bookings'],
        queryFn: () => axios.get('admin-dashboard/recent-bookings').then(r => r.data),
        refetchInterval: 60000,
    });
    const { data: recentDamage = [], isLoading: dmgLoading } = useQuery({
        queryKey: ['admin-dash-damage'],
        queryFn: () => axios.get('admin-dashboard/recent-damage').then(r => r.data),
        refetchInterval: 60000,
    });
    const { data: recentNotifs = [], isLoading: notifLoading } = useQuery({
        queryKey: ['admin-dash-notifs'],
        queryFn: () => axios.get('admin-dashboard/recent-notifications').then(r => r.data),
        refetchInterval: 60000,
    });

    // Upcoming bookings
    const { data: upcoming = [], isLoading: upcomingLoading } = useQuery({
        queryKey: ['admin-dash-upcoming'],
        queryFn: () => axios.get('admin-dashboard/upcoming-bookings').then(r => r.data),
        refetchInterval: 60000,
    });

    // Top performers
    const { data: performers, isLoading: perfLoading } = useQuery({
        queryKey: ['admin-dash-performers'],
        queryFn: () => axios.get('admin-dashboard/top-performers').then(r => r.data),
        staleTime: 60000,
    });

    // Calendar data
    const calToday = new Date();
    const { data: calDots = {} } = useQuery({
        queryKey: ['admin-dash-cal', calToday.getFullYear(), calToday.getMonth() + 1],
        queryFn: () => axios.get(`admin-dashboard/calendar?year=${calToday.getFullYear()}&month=${calToday.getMonth() + 1}`).then(r => r.data),
        staleTime: 5 * 60 * 1000,
    });

    // Ctrl+K global search
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Auto update "X seconds ago"
    useEffect(() => {
        const id = setInterval(() => forceRender(n => n + 1), 30000);
        return () => clearInterval(id);
    }, []);

    const handleRefresh = useCallback(() => {
        ['admin-dash-stats','admin-dash-bookings','admin-dash-damage','admin-dash-notifs','admin-dash-upcoming'].forEach(k =>
            qc.invalidateQueries({ queryKey: [k] })
        );
        refetchStats(); refetchBk();
        setLastUpdated(Date.now());
    }, [qc, refetchStats, refetchBk]);

    // ─── Banners ─────────────────────────────────────────────────────────────

    const dismiss = (id) => setDismissed(s => new Set([...s, id]));
    const b = stats?.banners || {};

    const allBanners = [
        b.overdueBookings > 0 && { id: 'overdue',  color: 'red',    icon: '🔴', message: `${plural(b.overdueBookings, 'booking')} are overdue — vehicles not returned yet.`,      linkLabel: 'Review Bookings', onLink: () => navigate('/dashboard/admin/bookings') },
        b.severeDamage > 0    && { id: 'severe',   color: 'red',    icon: '🔴', message: `${plural(b.severeDamage, 'severe damage report')} are unresolved.`,                        linkLabel: 'View Reports',    onLink: () => navigate('/dashboard/admin/damage-reports') },
        b.expiredVehicleDocs > 0 && { id: 'docs',  color: 'red',    icon: '🔴', message: `${plural(b.expiredVehicleDocs, 'vehicle')} have expired licenses or insurance.`,           linkLabel: 'Review Vehicles', onLink: () => navigate('/dashboard/admin/vehicles') },
        b.expiredDriverLicenses > 0 && { id: 'dlicense', color: 'red',  icon: '🔴', message: `${plural(b.expiredDriverLicenses, 'driver')} have expired licenses.`,                  linkLabel: 'License Approvals', onLink: () => navigate('/dashboard/admin/license-approvals') },
        b.pendingApprovals > 0 && { id: 'approve', color: 'orange', icon: '🟠', message: `${plural(b.pendingApprovals, 'item')} are awaiting your approval.`,                        linkLabel: 'Review Now',      onLink: () => navigate('/dashboard/admin/verification-queue') },
        b.pendingAgencies > 0  && { id: 'agencies',color: 'orange', icon: '🟠', message: `${plural(b.pendingAgencies, 'new agency')} are waiting for approval.`,                    linkLabel: 'View Agencies',   onLink: () => navigate('/dashboard/admin/agencies') },
        b.expiringSoon > 0     && { id: 'expiring',color: 'amber',  icon: '🟡', message: `${plural(b.expiringSoon, 'license')} expire within the next 30 days.`,                    linkLabel: 'View Licenses',   onLink: () => navigate('/dashboard/admin/license-approvals') },
        b.unpaidFinals > 0     && { id: 'unpaid',  color: 'amber',  icon: '🟡', message: `${plural(b.unpaidFinals, 'completed booking')} have unpaid final payments.`,               linkLabel: 'View Payments',   onLink: () => navigate('/dashboard/admin/payments') },
        b.lowRated > 0         && { id: 'lowrated',color: 'amber',  icon: '🟡', message: `${plural(b.lowRated, 'entity')} have dropped below 2.5 ⭐ rating.`,                       linkLabel: 'View Reviews',    onLink: () => navigate('/dashboard/admin/reviews') },
    ].filter(Boolean).filter(x => !dismissed.has(x.id));

    // ─── Chart data ───────────────────────────────────────────────────────────

    const todayDonut = stats ? [
        { name: 'Completed', value: stats.todayCompleted, color: '#22C55E' },
        { name: 'Ongoing',   value: stats.todayOngoing,   color: '#14B8A6' },
        { name: 'Pending',   value: stats.todayPending,   color: '#F97316' },
        { name: 'Confirmed', value: stats.todayConfirmed, color: '#3B82F6' },
        { name: 'Cancelled', value: stats.todayCancelled, color: '#EF4444' },
    ].filter(d => d.value > 0) : [];

    const topVehicles = performers ? (vehicleTab === 'car' ? performers.cars : performers.bikes) || [] : [];
    const maxVehRev = Math.max(...(topVehicles.map(v => v.monthly_bookings || 0)), 1);

    const pd = stats?.pendingBreakdown || {};
    const totalPending = (pd.agencies || 0) + (pd.drivers || 0) + (pd.cars || 0) + (pd.bikes || 0) + (pd.licenses || 0);

    const h = stats?.health || {};

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50 p-5 space-y-5">

            {/* ── Header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Live" />
                    </div>
                    <p className="text-sm text-gray-600">
                        Welcome back, <span className="font-semibold text-orange-600">{adminInfo?.name || user?.displayName || 'Admin'}</span> 👋
                    </p>
                    <div className="mt-1"><LiveClock /></div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">{formatDistanceToNow(lastUpdated)} ago</span>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                    >
                        <RefreshCw size={13} /> Refresh
                    </button>
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                    >
                        <Search size={13} /> <kbd className="text-[10px] text-gray-400">Ctrl+K</kbd>
                    </button>
                </div>
            </div>

            {/* ── Banners ── */}
            <AnimatePresence>
                {allBanners.length > 0 && (
                    <div className="space-y-2">
                        {allBanners.map(b2 => (
                            <AlertBanner key={b2.id} {...b2} onDismiss={() => dismiss(b2.id)} />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* ── KPI Row 1 — Users & Entities ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <KPICard icon={Users}    iconColor="bg-blue-100"   borderColor="border-l-blue-500"   label="Total Users"    value={stats?.totalUsers ?? '—'}    sub={`+${stats?.newUsersThisMonth ?? 0} new this month`}    trend={stats?.newUsersThisMonth} trendVal={`+${stats?.newUsersThisMonth ?? 0} this month`} onClick={() => navigate('/dashboard/admin/users')}    loading={statsLoading} />
                <KPICard icon={Building2} iconColor="bg-orange-100" borderColor="border-l-orange-500" label="Total Agencies"  value={stats?.totalAgencies ?? '—'}  sub={`${stats?.activeAgencies ?? 0} active · ${stats?.pendingAgencies ?? 0} pending`}   onClick={() => navigate('/dashboard/admin/agencies')} loading={statsLoading} />
                <KPICard icon={Users}    iconColor="bg-teal-100"   borderColor="border-l-teal-500"   label="Total Drivers"   value={stats?.totalDrivers ?? '—'}   sub={`${stats?.verifiedDrivers ?? 0} verified · ${stats?.availableDrivers ?? 0} available`}  onClick={() => navigate('/dashboard/admin/drivers')}  loading={statsLoading} />
                <KPICard icon={Car}      iconColor="bg-blue-100"   borderColor="border-l-blue-400"   label="Total Cars"      value={stats?.totalCars ?? '—'}      sub={`${stats?.availableCars ?? 0} available · ${stats?.bookedCars ?? 0} booked`}             onClick={() => navigate('/dashboard/admin/vehicles')} loading={statsLoading} />
                <KPICard icon={Bike}     iconColor="bg-purple-100" borderColor="border-l-purple-500" label="Total Bikes"     value={stats?.totalBikes ?? '—'}     sub={`${stats?.availableBikes ?? 0} available · ${stats?.bookedBikes ?? 0} booked`}            onClick={() => navigate('/dashboard/admin/vehicles')} loading={statsLoading} />
            </div>

            {/* ── KPI Row 2 — Bookings & Revenue ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <KPICard icon={ClipboardList} iconColor="bg-orange-100" borderColor="border-l-orange-500" label="Today's Bookings" value={stats?.todayBookings ?? '—'} sub={`${stats?.todayCompleted ?? 0} done · ${stats?.todayOngoing ?? 0} ongoing · ${stats?.todayPending ?? 0} pending`} pulse="bg-orange-400" onClick={() => navigate('/dashboard/admin/bookings')} loading={statsLoading} />
                <KPICard icon={FileText}     iconColor="bg-gray-100"   borderColor="border-l-gray-400"   label="Total Bookings"   value={stats?.totalBookings ?? '—'} sub={`${stats?.thisMonthBookings ?? 0} this month`} trend={stats?.thisMonthBookings} trendVal={`+${stats?.thisMonthBookings ?? 0} this month`} onClick={() => navigate('/dashboard/admin/bookings')} loading={statsLoading} />
                <KPICard icon={DollarSign}   iconColor="bg-green-100"  borderColor="border-l-green-500"  label="Today's Revenue"  value={statsLoading ? '—' : fmtMoney(stats?.todayRevenue)} sub={`${stats?.todayTransactions ?? 0} transactions today`} onClick={() => navigate('/dashboard/admin/payments')} loading={statsLoading} />
                <KPICard icon={TrendingUp}   iconColor="bg-green-100"  borderColor="border-l-green-400"  label="Monthly Revenue"  value={statsLoading ? '—' : fmtMoney(stats?.thisMonthRevenue)} sub={`vs last month`} trend={stats?.monthRevenuePctChange} trendVal={`${stats?.monthRevenuePctChange >= 0 ? '+' : ''}${stats?.monthRevenuePctChange ?? 0}% vs last month`} onClick={() => navigate('/dashboard/admin/reports')} loading={statsLoading} />
                <KPICard icon={DollarSign}   iconColor="bg-green-100"  borderColor="border-l-green-600"  label="Total Revenue"    value={statsLoading ? '—' : fmtMoney(stats?.totalRevenue)} sub="Lifetime earnings" onClick={() => navigate('/dashboard/admin/reports')} loading={statsLoading} />
            </div>

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                {/* Revenue Chart (3/5) */}
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <SectionHead title="Revenue Overview" onLink={() => navigate('/dashboard/admin/reports')} linkLabel="View Full Report →" />
                        <div className="flex gap-1">
                            {['week','month','3months','year'].map(p => (
                                <button key={p} onClick={() => setRevPeriod(p)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${revPeriod === p ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-50'}`}>
                                    {p === 'week' ? 'Week' : p === 'month' ? 'Month' : p === '3months' ? '3 Months' : 'Year'}
                                </button>
                            ))}
                        </div>
                    </div>
                    {revLoading ? <Sk className="h-56 w-full" /> : !revChart?.data?.length ? (
                        <EmptyState icon={BarChart3} msg="No revenue data for this period." />
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={revChart.data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barGap={0}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} width={40} />
                                    <Tooltip content={<RevTooltip />} />
                                    <Bar dataKey="revenue" fill="#F97316" radius={[3,3,0,0]} name="This Period" maxBarSize={24} />
                                    <Line type="monotone" dataKey="prevRevenue" stroke="#D1D5DB" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Prev Period" />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
                                {[
                                    { label: 'Total', val: fmtMoney(revChart.summary?.total) },
                                    { label: 'Avg/Day', val: fmtMoney(revChart.summary?.avg) },
                                    { label: 'Best Day', val: fmtMoney(revChart.summary?.best) },
                                ].map((m, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-[10px] text-gray-400">{m.label}</p>
                                        <p className="text-sm font-bold text-gray-800">{m.val}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Today's Bookings Donut (2/5) */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <SectionHead title="Booking Status Today" onLink={() => navigate('/dashboard/admin/bookings')} />
                    {statsLoading ? <Sk className="h-56 w-full" /> : todayDonut.length === 0 ? (
                        <EmptyState icon={ClipboardList} msg="No bookings recorded today." />
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={todayDonut} cx="50%" cy="45%" innerRadius={55} outerRadius={82} dataKey="value" paddingAngle={2}>
                                    {todayDonut.map((d, i) => <Cell key={i} fill={d.color || DONUT_COLORS[i]} />)}
                                    <DonutCenter cx="50%" cy="45%" total={stats?.todayBookings} label="Today" />
                                </Pie>
                                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                                <Tooltip formatter={(v) => [v, '']} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ── Middle Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Pending Approvals */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Needs Your Attention</h3>
                            <p className="text-[11px] text-gray-400">Pending approvals</p>
                        </div>
                        {totalPending > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalPending}</span>
                        )}
                    </div>
                    {totalPending === 0 && !statsLoading ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <CheckCircle size={32} className="text-green-500 mb-2" />
                            <p className="text-sm font-semibold text-green-600">All caught up!</p>
                            <p className="text-xs text-gray-400">No pending approvals.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {[
                                { icon: Building2, label: 'Agency Registrations', count: pd.agencies, color: 'text-orange-600 bg-orange-100', link: '/dashboard/admin/agencies' },
                                { icon: Users,     label: 'Driver Verifications', count: pd.drivers,  color: 'text-teal-600 bg-teal-100',   link: '/dashboard/admin/drivers' },
                                { icon: Car,       label: 'Car Verifications',    count: pd.cars,     color: 'text-blue-600 bg-blue-100',   link: '/dashboard/admin/vehicles' },
                                { icon: Bike,      label: 'Bike Verifications',   count: pd.bikes,    color: 'text-purple-600 bg-purple-100',link: '/dashboard/admin/vehicles' },
                                { icon: FileText,  label: 'License Approvals',    count: pd.licenses, color: 'text-amber-600 bg-amber-100', link: '/dashboard/admin/license-approvals' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${item.color.split(' ')[1]}`}>
                                        <item.icon size={14} className={item.color.split(' ')[0]} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-700">{item.label}</p>
                                    </div>
                                    {statsLoading ? <Sk className="h-5 w-8" /> : item.count > 0 ? (
                                        <>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.color}`}>{item.count}</span>
                                            <button onClick={() => navigate(item.link)} className="text-[10px] font-semibold text-orange-500 hover:text-orange-700">Review →</button>
                                        </>
                                    ) : <span className="text-[10px] text-gray-300">None</span>}
                                </div>
                            ))}
                        </div>
                    )}
                    <button onClick={() => navigate('/dashboard/admin/verification-queue')} className="w-full mt-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors">
                        View All Pending →
                    </button>
                </div>

                {/* Platform Quick Stats */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <SectionHead title="Platform Health" />
                    {statsLoading ? (
                        <div className="space-y-3">{[...Array(5)].map((_, i) => <Sk key={i} className="h-8 w-full" />)}</div>
                    ) : (
                        <>
                            <ProgBar pct={h.verificationRate ?? 0} color="#22C55E" label="Verification Rate" sublabel={`${h.verificationRate ?? 0}% of entities verified`} />
                            <ProgBar pct={h.completionRate ?? 0} color={h.completionRate >= 70 ? '#22C55E' : h.completionRate >= 50 ? '#F59E0B' : '#EF4444'} label="Booking Completion Rate" sublabel={`${h.completionRate ?? 0}% completion rate`} />
                            <ProgBar pct={h.cancellationRate ?? 0} color={h.cancellationRate < 10 ? '#22C55E' : h.cancellationRate < 20 ? '#F59E0B' : '#EF4444'} label="Cancellation Rate" sublabel={`${h.cancellationRate ?? 0}% cancelled`} />
                            <ProgBar pct={Math.min(h.fleetUtilization ?? 0, 100)} color="#F97316" label="Fleet Utilization" sublabel={`${h.fleetUtilization ?? 0}% of fleet in use`} />

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500">Avg Platform Rating</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Stars rating={h.avgPlatformRating} />
                                        <span className="text-[11px] text-gray-400">({h.totalReviews} reviews)</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Active Now</p>
                                    <p className="text-lg font-bold text-teal-600 flex items-center gap-1 justify-end">
                                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                                        {stats?.activeBookings ?? 0}
                                    </p>
                                </div>
                            </div>

                            <button onClick={() => navigate('/dashboard/admin/notifications')} className="flex items-center justify-between w-full mt-3 pt-3 border-t border-gray-100">
                                <span className="text-xs text-gray-600">Unread Notifications</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${h.unreadNotifications > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{h.unreadNotifications ?? 0}</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Revenue by Method */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-800">Revenue Breakdown</h3>
                        <div className="flex gap-1">
                            {['today','week','month'].map(p => (
                                <button key={p} onClick={() => setMethodPeriod(p)}
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors capitalize ${methodPeriod === p ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                    {p === 'today' ? 'Today' : p === 'week' ? 'Week' : 'Month'}
                                </button>
                            ))}
                        </div>
                    </div>
                    {methodLoading ? <Sk className="h-44 w-full" /> : revMethod.length === 0 ? (
                        <EmptyState icon={DollarSign} msg="No payment data." />
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={140}>
                                <PieChart>
                                    <Pie data={revMethod} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="revenue" paddingAngle={2}>
                                        {revMethod.map((m, i) => (
                                            <Cell key={i} fill={METHOD_COLORS[m.method?.toLowerCase()] || DONUT_COLORS[i % DONUT_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => [fmtMoney(v), '']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {revMethod.map((m, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: METHOD_COLORS[m.method?.toLowerCase()] || DONUT_COLORS[i % DONUT_COLORS.length] }} />
                                        <span className="text-xs text-gray-600 flex-1 capitalize">{m.method || 'Unknown'}</span>
                                        <span className="text-xs font-bold text-gray-800">{fmtMoney(m.revenue)}</span>
                                        <span className="text-[10px] text-gray-400 w-8 text-right">{m.pct}%</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => navigate('/dashboard/admin/payments')} className="text-xs text-orange-500 font-semibold hover:text-orange-700 mt-3 block">View Payment Details →</button>
                        </>
                    )}
                </div>
            </div>

            {/* ── Top Performers ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Top Agencies */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <SectionHead title="Top Performing Agencies" sub="by revenue this month" onLink={() => navigate('/dashboard/admin/agencies')} linkLabel="View Rankings →" />
                    {perfLoading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <Sk key={i} className="h-12 w-full" />)}</div> : !performers?.agencies?.length ? (
                        <EmptyState icon={Building2} msg="No agency data yet." />
                    ) : (
                        <div className="space-y-2">
                            {performers.agencies.map((ag, i) => {
                                const maxRev = Math.max(...performers.agencies.map(a => parseInt(a.monthly_revenue)), 1);
                                const pct = Math.round((parseInt(ag.monthly_revenue) / maxRev) * 100);
                                return (
                                    <div key={ag.agency_id} className="flex items-center gap-2 py-1">
                                        <Medal rank={i + 1} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 truncate">{ag.agency_name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Stars rating={ag.rating} size={9} />
                                                <span className="text-[10px] text-gray-400">{ag.cars ?? 0}🚗·{ag.bikes ?? 0}🏍️</span>
                                            </div>
                                            <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-800 whitespace-nowrap">{fmtMoney(ag.monthly_revenue)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Top Drivers */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <SectionHead title="Top Performing Drivers" sub="by trips this month" onLink={() => navigate('/dashboard/admin/drivers')} linkLabel="View Rankings →" />
                    {perfLoading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <Sk key={i} className="h-12 w-full" />)}</div> : !performers?.drivers?.length ? (
                        <EmptyState icon={Users} msg="No driver data yet." />
                    ) : (
                        <div className="space-y-2">
                            {performers.drivers.map((dr, i) => (
                                <div key={dr.driver_id} className="flex items-center gap-2 py-1">
                                    <Medal rank={i + 1} />
                                    {dr.photo ? (
                                        <img src={dr.photo} alt={dr.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{avatarInit(dr.name)}</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 truncate">{dr.name}</p>
                                        <div className="flex items-center gap-1.5">
                                            <Stars rating={dr.rating} size={9} />
                                            <span className="text-[10px] text-gray-400 truncate">{dr.agency_name || 'Independent'}</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-teal-600 whitespace-nowrap">{dr.monthly_trips} trips</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Vehicles */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Most Booked Vehicles</h3>
                            <p className="text-[11px] text-gray-400">this month</p>
                        </div>
                        <div className="flex gap-1">
                            {['car','bike'].map(t => (
                                <button key={t} onClick={() => setVehicleTab(t)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors ${vehicleTab === t ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                    {t}s
                                </button>
                            ))}
                        </div>
                    </div>
                    {perfLoading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <Sk key={i} className="h-12 w-full" />)}</div> : !topVehicles.length ? (
                        <EmptyState icon={Car} msg="No vehicle data yet." />
                    ) : (
                        <div className="space-y-2">
                            {topVehicles.map((v, i) => (
                                <div key={v.vehicle_id} className="flex items-center gap-2 py-1">
                                    <Medal rank={i + 1} />
                                    {v.image ? (
                                        <img src={v.image} alt={v.brand} className="w-9 h-7 object-cover rounded-lg flex-shrink-0" />
                                    ) : (
                                        <div className="w-9 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Car size={12} className="text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 truncate">{v.brand} {v.model}</p>
                                        <div className="flex items-center gap-1.5">
                                            <Stars rating={v.rating} size={9} />
                                            <span className="text-[10px] text-gray-400 truncate">{v.agency_name}</span>
                                        </div>
                                        <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.round((v.monthly_bookings / maxVehRev) * 100)}%` }} />
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600 whitespace-nowrap">{v.monthly_bookings}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Recent Feeds ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Recent Bookings Feed */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <SectionHead title="Recent Bookings" onLink={() => navigate('/dashboard/admin/bookings')} />
                    {bkLoading ? <div className="space-y-2">{[...Array(6)].map((_, i) => <Sk key={i} className="h-12 w-full" />)}</div> : !recentBookings.length ? (
                        <EmptyState icon={ClipboardList} msg="No bookings yet." />
                    ) : (
                        <div className="space-y-1">
                            {recentBookings.map(bk => {
                                const st = BOOKING_STATUS[bk.status] || BOOKING_STATUS.Requested;
                                return (
                                    <div key={bk.booking_id} className={`flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0`}>
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot} ${bk.status === 'Running' ? 'animate-pulse' : ''}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 truncate">{bk.customer_name}</p>
                                            <p className="text-[10px] text-gray-400 truncate">{bk.brand} {bk.model}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(bk.booking_ts)}</p>
                                        </div>
                                        <p className="text-xs font-bold text-gray-800 flex-shrink-0 w-20 text-right">{fmtMoney(bk.total_cost)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Damage */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <SectionHead title="Recent Damage Reports" onLink={() => navigate('/dashboard/admin/damage-reports')} />
                    {dmgLoading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <Sk key={i} className="h-12 w-full" />)}</div> : !recentDamage.length ? (
                        <EmptyState icon={Wrench} msg="No damage reports." />
                    ) : (
                        <div className="space-y-1">
                            {recentDamage.map(d => {
                                const sev = SEV_STYLE[d.severity] || SEV_STYLE.Low;
                                const sta = DMG_STATUS[d.status] || DMG_STATUS.Pending;
                                const isNew = differenceInDays(new Date(), parseISO(d.report_date || new Date().toISOString())) === 0;
                                return (
                                    <div key={d.damage_id} className={`flex items-start gap-2.5 py-2 pl-3 border-l-4 ${sev.border} border-b border-gray-50 last:border-b-0 rounded-r-lg`}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${sev.bg} ${sev.text}`}>{sev.label}</span>
                                                {isNew && <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-red-500 text-white">NEW</span>}
                                            </div>
                                            <p className="text-xs font-semibold text-gray-800 mt-0.5 truncate">{d.brand} {d.model}</p>
                                            <p className="text-[10px] text-gray-400 truncate">{d.damage_type} · {d.reported_by_name}</p>
                                        </div>
                                        <div className="flex-shrink-0 text-right">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${sta.bg} ${sta.text}`}>{sta.label}</span>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(d.report_date)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Notifications */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <SectionHead title="Recent Notifications Sent" onLink={() => navigate('/dashboard/admin/notifications')} />
                    {notifLoading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <Sk key={i} className="h-12 w-full" />)}</div> : !recentNotifs.length ? (
                        <EmptyState icon={Bell} msg="No notifications sent yet." />
                    ) : (
                        <div className="space-y-1">
                            {recentNotifs.map(n => (
                                <div key={n.notif_id} className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0">
                                    {n.category === 'broadcast' ? (
                                        <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-base">📢</div>
                                    ) : n.user_photo ? (
                                        <img src={n.user_photo} alt={n.user_name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">{avatarInit(n.user_name)}</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-700 truncate">{n.category === 'broadcast' ? 'Broadcast' : n.user_name}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{(n.message || '').slice(0, 50)}{n.message?.length > 50 ? '…' : ''}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <span className={`w-2 h-2 rounded-full ${n.is_read ? 'bg-green-400' : 'bg-red-400'}`} />
                                        <p className="text-[10px] text-gray-400">{timeAgo(n.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Calendar + Upcoming ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <SectionHead title="Calendar & Upcoming Bookings" sub="Next 7 days" onLink={() => navigate('/dashboard/admin/bookings')} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Calendar */}
                    <div className="lg:col-span-1 border-r border-gray-100 pr-6">
                        <MiniCalendar bookingDots={calDots} onDayClick={setSelectedDay} selectedDay={selectedDay} />
                        {selectedDay && (
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                {calDots[selectedDay] ?? 0} booking{calDots[selectedDay] !== 1 ? 's' : ''} on {fmtDateFull(selectedDay)}
                            </p>
                        )}
                    </div>

                    {/* Upcoming Bookings */}
                    <div className="lg:col-span-2">
                        {upcomingLoading ? (
                            <div className="space-y-2">{[...Array(6)].map((_, i) => <Sk key={i} className="h-14 w-full" />)}</div>
                        ) : !upcoming.length ? (
                            <EmptyState icon={Calendar} msg="No upcoming bookings in the next 7 days." />
                        ) : (
                            <div className="space-y-2">
                                {upcoming.map(bk => {
                                    const st = BOOKING_STATUS[bk.status] || BOOKING_STATUS.Requested;
                                    const startDate = parseISO(bk.start_ts);
                                    const daysUntil = isValid(startDate) ? differenceInDays(startDate, new Date()) : null;
                                    const countdown = daysUntil === null ? null : daysUntil <= 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil}d`;
                                    const countdownColor = daysUntil === null ? 'bg-gray-100 text-gray-500' : daysUntil <= 0 ? 'bg-red-100 text-red-700' : daysUntil === 1 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700';
                                    return (
                                        <div key={bk.booking_id} className="flex items-center gap-3 py-2.5 px-3 bg-gray-50 rounded-xl hover:bg-orange-50/40 transition-colors">
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">{isValid(startDate) ? format(startDate, 'MMM dd') : '—'}</p>
                                                <p className="text-[10px] text-gray-400">{isValid(startDate) ? format(startDate, 'hh:mm aa') : '—'}</p>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 truncate">{bk.customer_name} <span className="font-normal text-gray-500">· {bk.customer_phone}</span></p>
                                                <p className="text-[10px] text-gray-500 truncate">{bk.brand} {bk.model} {bk.driver_name ? `· 🧑‍✈️ ${bk.driver_name}` : '· Self Drive'}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${st.bg} ${st.text} flex-shrink-0`}>{st.label}</span>
                                            <span className="text-xs font-bold text-gray-800 flex-shrink-0 w-20 text-right">{fmtMoney(bk.total_cost)}</span>
                                            {countdown && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${countdownColor}`}>{countdown}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Bottom spacer ── */}
            <div className="h-16" />

            {/* ── FAB ── */}
            <FAB navigate={navigate} onSearch={() => setSearchOpen(true)} />

            {/* ── Global Search ── */}
            <AnimatePresence>
                {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} navigate={navigate} />}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
