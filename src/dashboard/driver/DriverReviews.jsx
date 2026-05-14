/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip as RTooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Star, X, RefreshCw, Search, Download, LayoutGrid, List, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar, AlertTriangle, AlertCircle, CheckCircle, MessageSquare, BarChart3, Zap, Trophy, Users
} from 'lucide-react';
import {
    format, formatDistanceToNow, differenceInDays, parseISO, isValid,
    startOfWeek, startOfMonth, startOfYear, subMonths
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';

// ─── Constants ────────────────────────────────────────────────────────────────

const STAR_COLORS = {
    5: { border: 'border-l-green-500',     bg: 'bg-green-50',    badge: 'bg-green-100 text-green-700',   avatar: 'bg-green-100 text-green-700'  },
    4: { border: 'border-l-green-300',     bg: 'bg-white',       badge: 'bg-green-50 text-green-600',    avatar: 'bg-green-50 text-green-600'   },
    3: { border: 'border-l-amber-400',     bg: 'bg-white',       badge: 'bg-amber-100 text-amber-700',   avatar: 'bg-amber-100 text-amber-700'  },
    2: { border: 'border-l-orange-400',    bg: 'bg-white',       badge: 'bg-orange-100 text-orange-700', avatar: 'bg-orange-100 text-orange-700'},
    1: { border: 'border-l-red-500',       bg: 'bg-red-50',      badge: 'bg-red-100 text-red-700',       avatar: 'bg-red-100 text-red-700'      },
};
const starStyle = (r) => STAR_COLORS[Math.round(r)] || STAR_COLORS[3];
const barFill   = (s) => s === 5 ? '#22C55E' : s === 4 ? '#86EFAC' : s === 3 ? '#F59E0B' : s === 2 ? '#FB923C' : '#EF4444';

const STOP_WORDS = new Set([
    'the','a','an','and','or','but','is','was','are','were','be','been','has','have','had',
    'do','does','did','will','would','could','should','may','might','shall','can',
    'to','of','in','on','at','by','for','with','about','from','up','out','over',
    'all','both','each','some','such','not','only','same','so','than','too','very',
    'my','his','her','its','our','your','their','this','that','these','those',
    'i','me','he','she','it','we','they','what','which','who','him','them',
    'as','if','s','t','re','ll','ve','d','m','trip','driver','ride','service','really',
    'very','got','get','was','were','good','great','nice','well','also','just','like',
    'car','uber','taxi','vehicle','went','time','made','came','took','said','told',
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d, f = 'MMM dd, yyyy') => {
    try { const p = typeof d === 'string' ? parseISO(d) : new Date(d); return isValid(p) ? format(p, f) : '—'; }
    catch { return '—'; }
};
const fmtDateTime = (d) => fmtDate(d, 'MMM dd, yyyy HH:mm');
const safeParseISO = (d) => {
    try { const p = parseISO(d); return isValid(p) ? p : null; } catch { return null; }
};

const displayName = (name) => {
    if (!name) return 'Anonymous';
    const parts = name.trim().split(/\s+/);
    return parts[0] + (parts[1] ? ` ${parts[1].charAt(0)}.` : '');
};

const ratingLabel = (r) => {
    if (r >= 5.0) return { text: '🏆 Perfect Score', cls: 'text-amber-600' };
    if (r >= 4.5) return { text: '⭐ Excellent', cls: 'text-green-600' };
    if (r >= 4.0) return { text: '✅ Very Good', cls: 'text-green-600' };
    if (r >= 3.5) return { text: '👍 Good', cls: 'text-amber-600' };
    if (r >= 3.0) return { text: '😐 Average', cls: 'text-amber-600' };
    if (r >= 2.0) return { text: '⚠️ Below Average', cls: 'text-red-500' };
    return { text: '🚨 Poor', cls: 'text-red-600 font-bold' };
};

const isInDateRange = (dateStr, filter) => {
    const d = safeParseISO(dateStr);
    if (!d) return filter === 'all';
    const now = new Date();
    switch (filter) {
        case 'today':     return differenceInDays(now, d) === 0;
        case 'thisWeek':  return d >= startOfWeek(now, { weekStartsOn: 1 });
        case 'thisMonth': return d >= startOfMonth(now);
        case 'lastMonth': { const lm = subMonths(now, 1); return d >= startOfMonth(lm) && d < startOfMonth(now); }
        case '3months':   return d >= subMonths(now, 3);
        case '6months':   return d >= subMonths(now, 6);
        case 'thisYear':  return d >= startOfYear(now);
        default:          return true;
    }
};

const applyFilters = (reviews, { search, rating, type, date, sort, quick }) => {
    let r = [...reviews];
    // Quick filter
    if (quick === '5') r = r.filter(x => Math.round(x.rating) === 5);
    else if (quick === '4') r = r.filter(x => Math.round(x.rating) === 4);
    else if (quick === '3') r = r.filter(x => Math.round(x.rating) === 3);
    else if (quick === '2') r = r.filter(x => Math.round(x.rating) === 2);
    else if (quick === '1') r = r.filter(x => Math.round(x.rating) === 1);
    else if (quick === 'critical') r = r.filter(x => x.rating < 3);
    else if (quick === 'withText') r = r.filter(x => x.review?.trim());
    else if (quick === 'ratingOnly') r = r.filter(x => !x.review?.trim());
    else if (quick === 'thisMonth') r = r.filter(x => isInDateRange(x.date, 'thisMonth'));
    else if (quick === 'thisWeek')  r = r.filter(x => isInDateRange(x.date, 'thisWeek'));
    // Rating dropdown
    if (rating === '5') r = r.filter(x => Math.round(x.rating) === 5);
    else if (rating === '4+') r = r.filter(x => x.rating >= 4);
    else if (rating === '3+') r = r.filter(x => x.rating >= 3);
    else if (rating === 'critical') r = r.filter(x => x.rating < 3);
    else if (rating === 'below2') r = r.filter(x => x.rating < 2);
    else if (['5','4','3','2','1'].includes(rating)) r = r.filter(x => Math.round(x.rating) === Number(rating));
    // Type
    if (type === 'withText')   r = r.filter(x => x.review?.trim());
    if (type === 'ratingOnly') r = r.filter(x => !x.review?.trim());
    // Date
    if (date !== 'all') r = r.filter(x => isInDateRange(x.date, date));
    // Search
    if (search.trim()) {
        const q = search.toLowerCase();
        r = r.filter(x =>
            (x.reviewer_name || '').toLowerCase().includes(q) ||
            (x.review || '').toLowerCase().includes(q)
        );
    }
    // Sort
    r.sort((a, b) => {
        if (sort === 'oldest')  return new Date(a.date) - new Date(b.date);
        if (sort === 'highest') return b.rating - a.rating;
        if (sort === 'lowest')  return a.rating - b.rating;
        return new Date(b.date) - new Date(a.date); // newest
    });
    return r;
};

const extractKeywords = (reviews, minRating = 4) => {
    const freq = {};
    reviews.filter(r => r.rating >= minRating && r.review?.trim()).forEach(r => {
        r.review.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)
            .filter(w => w.length > 3 && !STOP_WORDS.has(w))
            .forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    });
    return Object.entries(freq).filter(([, c]) => c > 0).sort(([, a], [, b]) => b - a).slice(0, 10);
};

const computeMonthlyStats = (reviews) => {
    const map = {};
    reviews.forEach(r => {
        const key = fmtDate(r.date, 'yyyy-MM');
        const label = fmtDate(r.date, 'MMM yyyy');
        if (!map[key]) map[key] = { key, label, count: 0, sum: 0, r5: 0, r4: 0, r3: 0, r2: 0, r1: 0, best: null };
        const m = map[key];
        m.count++; m.sum += r.rating;
        const s = Math.round(r.rating);
        if (s >= 1 && s <= 5) m[`r${s}`]++;
        if (r.review && (!m.best || r.review.length > (m.best.review?.length || 0))) m.best = r;
    });
    return Object.values(map)
        .map(m => ({ ...m, avg: m.count > 0 ? m.sum / m.count : 0 }))
        .sort((a, b) => b.key.localeCompare(a.key))
        .slice(0, 12);
};

const computeMilestones = (reviews) => {
    const sorted = [...reviews].sort((a, b) => new Date(a.date) - new Date(b.date));
    return {
        first:    sorted[0]     || null,
        first5:   sorted.find(r => r.rating >= 5) || null,
        tenth:    sorted[9]     || null,
        fiftieth: sorted[49]    || null,
        total:    sorted.length,
    };
};

const computeInsights = (monthly) => {
    if (!monthly.length) return {};
    const best  = monthly.reduce((a, b) => a.avg > b.avg ? a : b, monthly[0]);
    const mostR = monthly.reduce((a, b) => a.count > b.count ? a : b, monthly[0]);
    // streak: consecutive months with avg >= 4
    const now6 = monthly.slice(0, 6);
    let streak = 0;
    for (const m of now6) { if (m.avg >= 4) streak++; else break; }
    // Response rate
    return { best, mostR, streak };
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skel = ({ className = '' }) => <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;

// ─── Stars (with partial fill) ────────────────────────────────────────────────

const Stars = ({ rating, size = 14 }) => {
    const r = parseFloat(rating) || 0;
    return (
        <span className="inline-flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => {
                const fill = i <= Math.floor(r) ? '#F59E0B' : i - 1 < r ? '#FBBF24' : '#D1D5DB';
                return <Star key={i} size={size} fill={fill} stroke={i <= Math.ceil(r) ? '#F59E0B' : '#D1D5DB'} strokeWidth={1} />;
            })}
        </span>
    );
};

// ─── Rating Badge ─────────────────────────────────────────────────────────────

const RatingBadge = ({ rating, size = 'sm' }) => {
    const s = starStyle(rating);
    const fs = size === 'lg' ? 'text-sm' : 'text-xs';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border ${s.badge} border-transparent ${fs}`}>
            ★ {Number(rating).toFixed(1)}
        </span>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, trend, trendLabel, color, loading, onClick }) => {
    if (loading) return <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"><Skel className="h-8 w-8 rounded-xl mb-3" /><Skel className="h-7 w-20 mb-1" /><Skel className="h-4 w-28" /></div>;
    return (
        <motion.button whileHover={{ y: -2 }} onClick={onClick}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left w-full hover:shadow-md transition-shadow min-w-[160px]">
            <div className="flex items-start justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={17} className="text-white" />
                </div>
                {trend !== undefined && trend !== null && (
                    <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {trendLabel || (trend >= 0 ? `+${trend}` : trend)}
                    </span>
                )}
            </div>
            <p className="text-2xl font-black text-gray-900">{value}</p>
            <p className="text-xs font-semibold text-gray-700 mt-0.5">{label}</p>
            {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
        </motion.button>
    );
};

// ─── Alert Banner ─────────────────────────────────────────────────────────────

const BCLR = { red: 'bg-red-50 border-red-300 text-red-800', amber: 'bg-amber-50 border-amber-300 text-amber-800', green: 'bg-green-50 border-green-300 text-green-800' };
const AlertBanner = ({ type, icon: Icon, message, action, onAction, onDismiss, noDismiss }) => (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
        className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${BCLR[type]}`}>
        <Icon size={15} className="mt-0.5 shrink-0" />
        <span className="flex-1">{message}</span>
        {action && <button onClick={onAction} className="underline font-semibold whitespace-nowrap shrink-0">{action} →</button>}
        {!noDismiss && <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100 shrink-0"><X size={13} /></button>}
    </motion.div>
);

// ─── Rating Overview Panel ─────────────────────────────────────────────────────

const RatingOverviewPanel = ({ rb, trendData, insights, onFilterStar }) => {
    const avg = rb?.avg || 0;
    const label = ratingLabel(avg);

    return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

                {/* Left: Big rating */}
                <div className="text-center md:text-left flex flex-col items-center md:items-start gap-2">
                    <Star size={56} fill="#F59E0B" stroke="#F59E0B" className="mx-auto md:mx-0" />
                    <p className="text-6xl font-black text-orange-500 leading-none">{avg ? avg.toFixed(2) : '—'}</p>
                    <p className="text-sm text-gray-500">out of 5.0</p>
                    <Stars rating={avg} size={24} />
                    <p className="text-xs text-gray-500">Based on {rb?.total || 0} reviews</p>
                    <span className={`text-sm font-bold ${label.cls}`}>{label.text}</span>
                    {rb?.thisMonthAvg && rb?.prevMonthAvg && (
                        <div className={`flex items-center gap-1 text-xs font-semibold ${rb.thisMonthAvg >= rb.prevMonthAvg ? 'text-green-600' : 'text-red-500'}`}>
                            {rb.thisMonthAvg >= rb.prevMonthAvg ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {rb.thisMonthAvg >= rb.prevMonthAvg ? '+' : ''}{(rb.thisMonthAvg - rb.prevMonthAvg).toFixed(2)} vs last month
                        </div>
                    )}
                </div>

                {/* Center: Breakdown bars */}
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(s => {
                        const cnt = rb?.[`r${s}`] || 0;
                        const pct = rb?.total > 0 ? (cnt / rb.total) * 100 : 0;
                        return (
                            <button key={s} onClick={() => onFilterStar(String(s))}
                                className="w-full flex items-center gap-2 group hover:opacity-80 transition-opacity">
                                <span className="text-xs font-medium text-gray-600 w-4 shrink-0">{s}★</span>
                                <div className="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${pct}%`, backgroundColor: barFill(s) }} />
                                </div>
                                <span className="text-xs font-bold text-gray-700 w-8 text-right">{pct.toFixed(0)}%</span>
                                <span className="text-xs text-gray-400 w-8 text-right">{cnt}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Right: Insights chips */}
                <div className="space-y-2.5">
                    {trendData?.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1"><TrendingUp size={11} /> Rating Trend (6mo)</p>
                            <ResponsiveContainer width="100%" height={55}>
                                <LineChart data={trendData.slice(-6)} margin={{ top: 2, right: 4, bottom: 0, left: 0 }}>
                                    <Line type="monotone" dataKey="avg" stroke="#F97316" strokeWidth={2} dot={false} />
                                    <RTooltip formatter={(v) => [`★ ${v?.toFixed(2)}`, 'Avg']} contentStyle={{ fontSize: 10, borderRadius: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        {insights?.best && (
                            <div className="bg-white rounded-xl p-2.5 border border-green-100">
                                <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><Trophy size={9} /> Best Month</p>
                                <p className="text-xs font-black text-green-600">★ {insights.best.avg.toFixed(2)}</p>
                                <p className="text-[10px] text-gray-400">{insights.best.label}</p>
                            </div>
                        )}
                        {insights?.mostR && (
                            <div className="bg-white rounded-xl p-2.5 border border-blue-100">
                                <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><MessageSquare size={9} /> Most Reviews</p>
                                <p className="text-xs font-black text-blue-600">{insights.mostR.count} reviews</p>
                                <p className="text-[10px] text-gray-400">{insights.mostR.label}</p>
                            </div>
                        )}
                        {insights?.streak > 0 && (
                            <div className="bg-white rounded-xl p-2.5 border border-orange-100">
                                <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><Zap size={9} /> Streak</p>
                                <p className="text-xs font-black text-orange-600">{insights.streak} months</p>
                                <p className="text-[10px] text-gray-400">of 4★+ ratings</p>
                            </div>
                        )}
                        {rb?.total > 0 && (
                            <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><MessageSquare size={9} /> Written</p>
                                <p className="text-xs font-black text-gray-700">{rb?.withText || '—'}%</p>
                                <p className="text-[10px] text-gray-400">wrote feedback</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Featured Reviews Row ─────────────────────────────────────────────────────

const FeaturedReviewsRow = ({ reviews }) => {
    const [expanded, setExpanded] = useState(null);
    if (!reviews?.length) return null;

    const best = [...reviews].filter(r => r.review?.trim())
        .sort((a, b) => b.rating - a.rating || (b.review?.length||0) - (a.review?.length||0))[0];
    const mostRecent = reviews[0];
    const latest5 = reviews.find(r => r.rating === 5);

    const featured = [
        best     && { ...best,       badge: '⭐ Your Best Review',   border: 'border-green-400',  label: 'Best',   bg: 'bg-green-50' },
        mostRecent && { ...mostRecent, badge: '🆕 Most Recent Review', border: 'border-blue-400',   label: 'Recent', bg: 'bg-blue-50' },
        latest5  && { ...latest5,    badge: '🏆 Latest Perfect Score',border: 'border-orange-400', label: '5★',     bg: 'bg-orange-50' },
    ].filter(Boolean).slice(0, 3);

    if (featured.length < 3) return (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
            <Star size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">Receive more reviews to unlock highlighted reviews.</p>
        </div>
    );

    return (
        <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Highlighted Reviews</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {featured.map((r, i) => {
                    const isOpen = expanded === i;
                    return (
                        <div key={i} className={`min-w-[280px] max-w-[320px] border-2 ${r.border} rounded-2xl p-4 ${r.bg} flex-shrink-0`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-600">{r.badge}</span>
                                <RatingBadge rating={r.rating} />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${starStyle(r.rating).avatar}`}>
                                    {(r.reviewer_name || '?').charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-800">{displayName(r.reviewer_name)}</p>
                                    <p className="text-[10px] text-gray-400">{fmtDate(r.date)}</p>
                                </div>
                            </div>
                            <Stars rating={r.rating} size={15} />
                            <p className={`text-xs text-gray-700 mt-2 ${isOpen ? '' : 'line-clamp-3'}`}>
                                {r.review || <span className="italic text-gray-400">Rating only</span>}
                            </p>
                            {r.review?.length > 120 && (
                                <button onClick={() => setExpanded(isOpen ? null : i)}
                                    className="text-[10px] text-orange-500 hover:underline mt-1 flex items-center gap-0.5">
                                    {isOpen ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                                    {isOpen ? 'Show less' : 'Show more'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Review Card (expandable) ─────────────────────────────────────────────────

const ReviewCard = ({ review, idx, expanded, onToggle, isNew }) => {
    const s = starStyle(review.rating);
    const daysAgoNum = review.date ? differenceInDays(new Date(), safeParseISO(review.date) || new Date()) : null;
    const isOpen = expanded === idx;

    return (
        <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`relative border-l-4 ${s.border} ${s.bg} rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
            {isNew && (
                <span className="absolute top-3 right-3 text-[10px] font-black text-white bg-orange-500 px-2 py-0.5 rounded-full">🆕 New</span>
            )}
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black shrink-0 ${s.avatar}`}>
                        {(review.reviewer_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="font-bold text-gray-900">{displayName(review.reviewer_name)}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {fmtDate(review.date)}
                                    {daysAgoNum !== null && ` · ${daysAgoNum === 0 ? 'Today' : daysAgoNum === 1 ? 'Yesterday' : `${daysAgoNum} days ago`}`}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <Stars rating={review.rating} size={18} />
                                <div className="flex items-center gap-1 justify-end mt-0.5">
                                    <span className="text-xs font-black text-orange-600">{Number(review.rating).toFixed(1)} / 5.0</span>
                                    <RatingBadge rating={review.rating} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="mt-3">
                    {review.review?.trim() ? (
                        <div className={`border border-gray-200 rounded-xl p-3 bg-white/80 text-sm text-gray-700 leading-relaxed ${isOpen ? '' : 'line-clamp-4'}`}>
                            {review.review}
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-sm italic text-gray-400">
                            No written review — rating only
                        </div>
                    )}
                    {review.review?.length > 200 && (
                        <button onClick={() => onToggle(idx)}
                            className="text-xs text-orange-500 hover:underline mt-1.5 flex items-center gap-0.5 font-medium">
                            {isOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                            {isOpen ? 'Show less' : 'Read more'}
                        </button>
                    )}
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden">
                            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                {review.date && <div><p className="font-medium text-gray-700 text-[10px] uppercase tracking-wide">Received</p><p>{fmtDateTime(review.date)}</p></div>}
                                {(review.start_ts || review.trip_start) && (
                                    <div>
                                        <p className="font-medium text-gray-700 text-[10px] uppercase tracking-wide">Trip Period</p>
                                        <p>📅 {fmtDate(review.start_ts || review.trip_start, 'MMM dd')} → {fmtDate(review.end_ts || review.trip_end, 'MMM dd, yyyy')}</p>
                                        {review.total_rent_hours && <p className="text-gray-400">⏱ {review.total_rent_hours} hrs</p>}
                                    </div>
                                )}
                                {review.brand && (
                                    <div>
                                        <p className="font-medium text-gray-700 text-[10px] uppercase tracking-wide">Vehicle</p>
                                        <p>🚗 {review.brand} {review.model}</p>
                                        {review.vehicle_type && <p className="text-gray-400">{(review.vehicle_type||'').toUpperCase()}</p>}
                                    </div>
                                )}
                                {review.estimated_destination && (
                                    <div>
                                        <p className="font-medium text-gray-700 text-[10px] uppercase tracking-wide">Destination</p>
                                        <p>📍 {review.estimated_destination}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>
                    {review.start_ts && `🚗 Trip: ${fmtDate(review.start_ts, 'MMM dd')} → ${fmtDate(review.end_ts, 'MMM dd, yyyy')}`}
                    {review.total_rent_hours && ` · ${review.total_rent_hours}h`}
                    {review.brand && ` · ${review.brand} ${review.model}`}
                </span>
                <span className={`font-medium ${daysAgoNum !== null && daysAgoNum <= 7 ? 'text-green-600' : 'text-gray-400'}`}>
                    {daysAgoNum !== null ? (daysAgoNum === 0 ? 'Today' : `${daysAgoNum}d ago`) : ''}
                </span>
            </div>
        </motion.div>
    );
};

// ─── Review List Row (table view) ─────────────────────────────────────────────

const ReviewListRow = ({ review, idx, expanded, onToggle, isNew }) => {
    const s = starStyle(review.rating);
    const isOpen = expanded === idx;
    return (
        <>
            <tr className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${review.rating < 3 ? 'bg-red-50/30' : review.rating === 5 ? 'bg-green-50/20' : ''}`}
                style={{ borderLeft: `4px solid ${barFill(Math.round(review.rating))}` }}
                onClick={() => onToggle(idx)}>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.avatar}`}>
                            {(review.reviewer_name || '?').charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">{displayName(review.reviewer_name)}</p>
                            <p className="text-[10px] text-gray-400">{fmtDate(review.date, 'MMM dd, yy')}</p>
                        </div>
                        {isNew && <span className="text-[9px] font-black bg-orange-100 text-orange-600 px-1.5 rounded-full">NEW</span>}
                    </div>
                </td>
                <td className="px-4 py-3">
                    <Stars rating={review.rating} size={14} />
                    <RatingBadge rating={review.rating} />
                </td>
                <td className="px-4 py-3 max-w-xs">
                    <p className={`text-xs text-gray-700 ${isOpen ? '' : 'line-clamp-2'}`}>
                        {review.review || <span className="italic text-gray-400">Rating only</span>}
                    </p>
                    {review.review?.length > 100 && (
                        <span className="text-[10px] text-orange-500">{isOpen ? '▲' : '▼'}</span>
                    )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                    {review.start_ts && <p>{fmtDate(review.start_ts, 'MMM dd')} → {fmtDate(review.end_ts, 'MMM dd')}</p>}
                    {review.total_rent_hours && <p className="text-gray-400">{review.total_rent_hours}h</p>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                    {review.brand && <p className="font-medium">{review.brand} {review.model}</p>}
                    {review.vehicle_type && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded">{(review.vehicle_type||'').toUpperCase()}</span>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                    <p>{fmtDate(review.date)}</p>
                    <p className="text-gray-400">{review.date && formatDistanceToNow(safeParseISO(review.date) || new Date(), { addSuffix: true })}</p>
                </td>
            </tr>
            {isOpen && (
                <tr className="bg-gray-50/50">
                    <td colSpan={6} className="px-4 py-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-600">
                            <div><p className="font-bold text-gray-700 mb-0.5">Full Review</p><p className="italic">{review.review || 'No written review.'}</p></div>
                            <div><p className="font-bold text-gray-700 mb-0.5">Received</p><p>{fmtDateTime(review.date)}</p></div>
                            {review.estimated_destination && <div><p className="font-bold text-gray-700 mb-0.5">Destination</p><p>📍 {review.estimated_destination}</p></div>}
                            <div><p className="font-bold text-gray-700 mb-0.5">Rating</p><p className="font-black text-orange-600 text-base">{Number(review.rating).toFixed(1)} / 5.0</p></div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// ─── Performance Sidebar ──────────────────────────────────────────────────────

const PerformanceSidebar = ({ monthly, rb, allReviews, profile, onFilterStar }) => {
    const posKw = useMemo(() => extractKeywords(allReviews, 4), [allReviews]);
    const negKw = useMemo(() => extractKeywords(allReviews.filter(r => r.rating < 3), 0), [allReviews]);
    const milestones = useMemo(() => computeMilestones(allReviews), [allReviews]);

    const trendData = monthly.slice().reverse().slice(-6).map(m => ({ label: m.label.split(' ')[0], avg: parseFloat(m.avg.toFixed(2)), count: m.count }));
    const agencyAvg = profile?.agency_rating ? parseFloat(profile.agency_rating) : null;
    const driverAvg = rb?.avg ? parseFloat(rb.avg) : 0;
    const maxBar = Math.max(driverAvg, agencyAvg || 0, 5);

    const withTextPct = allReviews.length > 0
        ? Math.round(allReviews.filter(r => r.review?.trim()).length / allReviews.length * 100)
        : 0;

    return (
        <div className="space-y-4">
            {/* Rating Trend */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5"><TrendingUp size={13} className="text-orange-500" /> Rating Trend</h4>
                {trendData.length < 2 ? (
                    <p className="text-xs text-gray-400">Not enough data yet.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={130}>
                        <LineChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                            <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 5]} hide />
                            <RTooltip formatter={(v) => [`★ ${v}`, 'Avg']} contentStyle={{ fontSize: 10, borderRadius: 6 }} />
                            <ReferenceLine y={4} stroke="#D1D5DB" strokeDasharray="3 2" label={{ value: '4★', position: 'right', fontSize: 9, fill: '#9CA3AF' }} />
                            <ReferenceLine y={3} stroke="#FECACA" strokeDasharray="3 2" />
                            <Line type="monotone" dataKey="avg" stroke="#F97316" strokeWidth={2} dot={{ fill: '#F97316', r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Monthly review counts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5"><BarChart3 size={13} className="text-orange-500" /> Reviews Per Month</h4>
                {trendData.length < 2 ? (
                    <p className="text-xs text-gray-400">Not enough data yet.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={90}>
                        <BarChart data={trendData} margin={{ top: 10, right: 5, bottom: 0, left: 0 }}>
                            <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                            <RTooltip formatter={(v) => [v, 'Reviews']} contentStyle={{ fontSize: 10, borderRadius: 6 }} />
                            <Bar dataKey="count" fill="#F97316" radius={[3, 3, 0, 0]} label={{ position: 'top', fontSize: 9, fill: '#9CA3AF' }} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Rating distribution (clickable) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5"><Star size={13} className="text-orange-500" /> My Ratings</h4>
                <div className="space-y-1.5">
                    {[5,4,3,2,1].map(s => {
                        const cnt = rb?.[`r${s}`] || 0;
                        const pct = rb?.total > 0 ? (cnt / rb.total) * 100 : 0;
                        return (
                            <button key={s} onClick={() => onFilterStar(String(s))}
                                className="w-full flex items-center gap-2 text-xs hover:opacity-80">
                                <span className="w-5 text-gray-500">{s}★</span>
                                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barFill(s) }} />
                                </div>
                                <span className="w-6 text-right text-gray-400 font-medium">{cnt}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* How You Compare */}
            {(agencyAvg || driverAvg > 0) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5"><Users size={13} className="text-orange-500" /> How You Compare</h4>
                    <div className="space-y-2.5">
                        {[
                            { label: 'Your Rating',    val: driverAvg,  color: '#F97316' },
                            agencyAvg && { label: 'Agency Average', val: agencyAvg, color: '#3B82F6' },
                        ].filter(Boolean).map(item => (
                            <div key={item.label}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-600">{item.label}</span>
                                    <span className="font-bold" style={{ color: item.color }}>★ {item.val.toFixed(2)}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${(item.val / maxBar) * 100}%`, backgroundColor: item.color }} />
                                </div>
                            </div>
                        ))}
                        {agencyAvg && (
                            <p className={`text-xs font-semibold mt-1 ${driverAvg >= agencyAvg ? 'text-green-600' : 'text-red-500'}`}>
                                You are {Math.abs(driverAvg - agencyAvg).toFixed(2)} pts
                                {driverAvg >= agencyAvg ? ' above' : ' below'} the agency average.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Top praise keywords */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5"><Zap size={13} className="text-green-500" /> What Customers Love</h4>
                {posKw.length < 3 ? (
                    <p className="text-xs text-gray-400">Receive more reviews with written feedback to see keywords.</p>
                ) : (
                    <div className="flex flex-wrap gap-1.5">
                        {posKw.map(([word, cnt]) => (
                            <span key={word} className={`px-2.5 py-1 rounded-full text-xs font-semibold text-green-700 border border-green-200 ${cnt > 3 ? 'bg-green-100' : 'bg-green-50'}`}>
                                {word} ({cnt})
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Areas to improve */}
            {negKw.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5"><AlertTriangle size={13} className="text-amber-500" /> Common Concerns</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {negKw.slice(0, 5).map(([word, cnt]) => (
                            <span key={word} className="px-2.5 py-1 rounded-full text-xs font-semibold text-red-700 bg-red-50 border border-red-200">
                                {word} ({cnt})
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Review Milestones */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5"><Trophy size={13} className="text-amber-500" /> Your Milestones</h4>
                <div className="space-y-2.5">
                    {[
                        { icon: '🥇', label: 'First review',    data: milestones.first,   unlocked: !!milestones.first,    need: 1   },
                        { icon: '⭐', label: 'First 5★ review', data: milestones.first5,  unlocked: !!milestones.first5,   need: null },
                        { icon: '🏆', label: '10 reviews',      data: milestones.tenth,   unlocked: !!milestones.tenth,    need: 10  },
                        { icon: '📈', label: 'Best month',      data: null,               unlocked: !!milestones.first,    need: null, extra: allReviews.length > 0 },
                        { icon: '💬', label: '50 reviews',      data: milestones.fiftieth,unlocked: !!milestones.fiftieth, need: 50  },
                    ].map(m => (
                        <div key={m.label} className={`flex items-center gap-2 text-xs ${m.unlocked ? '' : 'opacity-50'}`}>
                            <span className="text-base shrink-0">{m.icon}</span>
                            <div className="flex-1">
                                <p className={`font-semibold ${m.unlocked ? 'text-gray-800' : 'text-gray-400'}`}>{m.label}</p>
                                {m.data ? (
                                    <p className="text-gray-400">{fmtDate(m.data.date)}</p>
                                ) : m.need && !m.unlocked ? (
                                    <p className="text-gray-400">{Math.max(0, m.need - milestones.total)} more to unlock</p>
                                ) : m.extra && milestones.first ? (
                                    <p className="text-green-600 font-medium">Achieved!</p>
                                ) : null}
                            </div>
                            {m.unlocked && <CheckCircle size={14} className="text-green-500 shrink-0" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Response rate */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                <p className="text-xs font-bold text-gray-600 mb-1">Feedback Response Rate</p>
                <p className="text-2xl font-black text-orange-600">{withTextPct}%</p>
                <p className="text-xs text-gray-400">of reviewers wrote feedback</p>
            </div>
        </div>
    );
};

// ─── Monthly Breakdown ────────────────────────────────────────────────────────

const MonthlyBreakdown = ({ monthly }) => {
    const [open, setOpen] = useState(false);
    if (!monthly.length) return null;

    const overallAvg = monthly.reduce((s, m) => s + m.sum, 0) / Math.max(monthly.reduce((s, m) => s + m.count, 0), 1);
    const bestMonth  = monthly.reduce((a, b) => a.avg > b.avg ? a : b, monthly[0]);
    const now = format(new Date(), 'yyyy-MM');

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                <div className="text-left">
                    <p className="font-bold text-gray-900">Monthly Review Summary</p>
                    <p className="text-xs text-gray-400">Last 12 months breakdown</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 border-2 border-orange-200 text-orange-600 text-xs font-semibold rounded-xl">
                        {open ? 'Hide Summary' : 'Show Summary'}
                    </span>
                    {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-gray-50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-left">
                                        {['Month','Reviews','Avg ★','5★','4★','3★','2★+1★','Best Snippet','vs Prev'].map(h => (
                                            <th key={h} className="px-4 py-2.5 font-semibold whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthly.map((m, i) => {
                                        const prev = monthly[i + 1];
                                        const diff = prev ? m.avg - prev.avg : null;
                                        const isCurrent = m.key === now;
                                        const isBest = m.key === bestMonth.key;
                                        return (
                                            <tr key={m.key}
                                                className={`border-b border-gray-50 ${isCurrent ? 'bg-orange-50/40' : ''}`}
                                                style={isBest ? { borderLeft: '3px solid #F59E0B' } : {}}>
                                                <td className="px-4 py-2.5 font-semibold text-gray-800 whitespace-nowrap">
                                                    {isBest && <span className="mr-1">🏆</span>}{m.label}
                                                    {isCurrent && <span className="ml-1 text-[10px] text-orange-500 font-bold">NOW</span>}
                                                </td>
                                                <td className="px-4 py-2.5 font-bold">{m.count}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className={`font-bold ${m.avg >= 4 ? 'text-green-600' : m.avg >= 3 ? 'text-amber-600' : 'text-red-500'}`}>
                                                        ★ {m.avg.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-green-600 font-semibold">{m.r5}</td>
                                                <td className="px-4 py-2.5 text-green-500">{m.r4}</td>
                                                <td className="px-4 py-2.5 text-amber-600">{m.r3}</td>
                                                <td className="px-4 py-2.5 text-red-500 font-semibold">{m.r2 + m.r1}</td>
                                                <td className="px-4 py-2.5 max-w-[150px]">
                                                    <p className="truncate text-gray-500 italic">
                                                        {m.best?.review ? `"${m.best.review.slice(0, 30)}…"` : '—'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    {diff !== null ? (
                                                        <span className={`font-semibold flex items-center gap-0.5 ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                            {diff >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                            {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr className="bg-gray-100 font-bold border-t-2 border-gray-200">
                                        <td className="px-4 py-2.5">All Time</td>
                                        <td className="px-4 py-2.5">{monthly.reduce((s, m) => s + m.count, 0)}</td>
                                        <td className="px-4 py-2.5 text-orange-600">★ {overallAvg.toFixed(2)}</td>
                                        <td className="px-4 py-2.5 text-green-600">{monthly.reduce((s, m) => s + m.r5, 0)}</td>
                                        <td className="px-4 py-2.5 text-green-500">{monthly.reduce((s, m) => s + m.r4, 0)}</td>
                                        <td className="px-4 py-2.5 text-amber-600">{monthly.reduce((s, m) => s + m.r3, 0)}</td>
                                        <td className="px-4 py-2.5 text-red-500">{monthly.reduce((s, m) => s + m.r2 + m.r1, 0)}</td>
                                        <td colSpan={2} />
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Export CSV ───────────────────────────────────────────────────────────────

const exportCSV = (reviews) => {
    if (!reviews.length) return toast.error('No reviews to export');
    const hdr = ['Reviewer', 'Date', 'Rating', 'Review', 'Trip Start', 'Trip End', 'Vehicle'];
    const rows = reviews.map(r => [
        displayName(r.reviewer_name),
        fmtDate(r.date),
        r.rating,
        (r.review || '').replace(/"/g, '""'),
        fmtDate(r.start_ts || r.trip_start),
        fmtDate(r.end_ts || r.trip_end),
        r.brand ? `${r.brand} ${r.model}` : '',
    ]);
    const csv = [hdr, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'my-reviews.csv'; a.click();
};

// ─── Main DriverReviews Component ─────────────────────────────────────────────

const DriverReviews = () => {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // ── Filter state ──────────────────────────────────────────────────────────
    const [searchText, setSearch]     = useState('');
    const [dSearch, setDSearch]       = useState('');
    const [ratingFilter, setRating]   = useState('all');
    const [typeFilter, setType]       = useState('all');
    const [dateFilter, setDate]       = useState('all');
    const [sortBy, setSort]           = useState('newest');
    const [viewMode, setView]         = useState(() => localStorage.getItem('driver_reviews_view') || 'card');
    const [quickFilter, setQuick]     = useState('all');
    const [page, setPage]             = useState(1);
    const [pageSize, setPageSize]     = useState(10);
    const [expanded, setExpanded]     = useState(null);
    const [dismissed, setDismissed]   = useState({});
    const [sidebarOpen, setSidebar]   = useState(false);

    const prevCountRef = useRef(null);
    const searchTimer  = useRef(null);

    // ── Debounce search ───────────────────────────────────────────────────────
    useEffect(() => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => setDSearch(searchText), 250);
        return () => clearTimeout(searchTimer.current);
    }, [searchText]);

    useEffect(() => { setPage(1); }, [dSearch, ratingFilter, typeFilter, dateFilter, sortBy, quickFilter]);

    const setViewMode = (v) => { setView(v); localStorage.setItem('driver_reviews_view', v); };

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['driverRevProfile', user?.email],
        queryFn: async () => {
            const r = await axiosPublic.get(`/driverProfile/full/${user.email}`, { withCredentials: true });
            return r.data;
        },
        enabled: !!user?.email,
    });
    const driverId = profile?.driver_id;

    const { data: reviewsResp, isLoading: reviewsLoading, dataUpdatedAt } = useQuery({
        queryKey: ['driverAllReviews', driverId],
        queryFn: async () => {
            const r = await axiosPublic.get(
                `/driverProfile/reviews/${driverId}?page=1&limit=500&rating=all&sort=newest`,
                { withCredentials: true }
            );
            return r.data;
        },
        enabled: !!driverId,
        refetchInterval: 60000,
    });

    // ── Derived / computed ─────────────────────────────────────────────────────
    const allReviews  = reviewsResp?.reviews || [];
    const rb          = profile?.ratingBreakdown || {};
    const loading     = profileLoading || reviewsLoading;

    // Counts for quick pills
    const pillCounts = useMemo(() => ({
        all:       allReviews.length,
        5:         allReviews.filter(r => Math.round(r.rating) === 5).length,
        4:         allReviews.filter(r => Math.round(r.rating) === 4).length,
        3:         allReviews.filter(r => Math.round(r.rating) === 3).length,
        2:         allReviews.filter(r => Math.round(r.rating) === 2).length,
        1:         allReviews.filter(r => Math.round(r.rating) === 1).length,
        critical:  allReviews.filter(r => r.rating < 3).length,
        withText:  allReviews.filter(r => r.review?.trim()).length,
        ratingOnly:allReviews.filter(r => !r.review?.trim()).length,
        thisMonth: allReviews.filter(r => isInDateRange(r.date, 'thisMonth')).length,
        thisWeek:  allReviews.filter(r => isInDateRange(r.date, 'thisWeek')).length,
    }), [allReviews]);

    const filteredReviews = useMemo(() =>
        applyFilters(allReviews, { search: dSearch, rating: ratingFilter, type: typeFilter, date: dateFilter, sort: sortBy, quick: quickFilter }),
        [allReviews, dSearch, ratingFilter, typeFilter, dateFilter, sortBy, quickFilter]
    );

    const totalFiltered = filteredReviews.length;
    const pagedReviews  = filteredReviews.slice((page - 1) * pageSize, page * pageSize);
    const totalPages    = Math.max(1, Math.ceil(totalFiltered / pageSize));
    const filteredAvg   = filteredReviews.length > 0
        ? (filteredReviews.reduce((s, r) => s + r.rating, 0) / filteredReviews.length).toFixed(2)
        : null;

    // Monthly stats for charts + table
    const monthly  = useMemo(() => computeMonthlyStats(allReviews), [allReviews]);
    const insights = useMemo(() => computeInsights(monthly), [monthly]);
    const trendData = useMemo(() =>
        monthly.slice().reverse().map(m => ({ label: m.label.split(' ')[0], avg: parseFloat(m.avg.toFixed(2)) })),
        [monthly]
    );

    // New review detection
    useEffect(() => {
        const count = allReviews.length;
        if (prevCountRef.current !== null && count > prevCountRef.current) {
            const newest = allReviews[0];
            toast.custom((tt) => (
                <div className={`flex items-start gap-3 bg-white border border-green-200 shadow-lg rounded-2xl p-4 max-w-xs ${tt.visible ? '' : 'opacity-0'}`}>
                    <Star size={16} className="text-amber-400 mt-0.5 shrink-0" fill="#F59E0B" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">New review received!</p>
                        {newest && <p className="text-xs text-gray-500">{displayName(newest.reviewer_name)} rated you {newest.rating}★</p>}
                    </div>
                    <button onClick={() => toast.dismiss(tt.id)}><X size={13} className="text-gray-400" /></button>
                </div>
            ), { duration: 6000 });
        }
        prevCountRef.current = count;
    }, [allReviews.length]);

    const isNew = (r) => {
        const d = safeParseISO(r.date);
        return d && differenceInDays(new Date(), d) <= 2;
    };

    const lastUpdated = dataUpdatedAt
        ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true })
        : null;

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ['driverRevProfile', user?.email] });
        queryClient.invalidateQueries({ queryKey: ['driverAllReviews', driverId] });
    };

    // ── Alert Banners ─────────────────────────────────────────────────────────
    const driverAvg = rb?.avg ? parseFloat(rb.avg) : 0;
    const trend = rb?.thisMonthAvg && rb?.prevMonthAvg ? parseFloat((rb.thisMonthAvg - rb.prevMonthAvg).toFixed(2)) : null;
    const criticalThisMonth = allReviews.filter(r => r.rating < 3 && isInDateRange(r.date, 'thisMonth')).length;
    const reviewsToday = allReviews.filter(r => isInDateRange(r.date, 'today')).length;

    // Check all-time high
    const storedHigh = parseFloat(localStorage.getItem('driver_review_alltime_high') || '0');
    const isNewHigh  = driverAvg > 0 && driverAvg > storedHigh;
    if (isNewHigh && driverAvg > 0) localStorage.setItem('driver_review_alltime_high', String(driverAvg));

    const banners = [
        driverAvg > 0 && driverAvg < 3.0 && {
            id: 'lowrating', type: 'red', icon: AlertCircle, noDismiss: true,
            message: `Your overall rating has dropped below 3.0. Review critical feedback and improve your service quality.`,
            action: 'View Critical', onAction: () => setQuick('critical'),
        },
        trend !== null && trend < -0.3 && driverAvg >= 3.0 && {
            id: 'declining', type: 'amber', icon: TrendingDown,
            message: `Your rating has dropped by ${Math.abs(trend).toFixed(1)} points this month. Review recent feedback to understand the decline.`,
            action: 'View Now', onAction: () => setDate('thisMonth'),
        },
        criticalThisMonth > 2 && {
            id: 'critmonth', type: 'amber', icon: AlertTriangle,
            message: `You have ${criticalThisMonth} critical reviews (below 3★) this month. Address service issues to improve your rating.`,
            action: 'View Now', onAction: () => { setQuick('critical'); setDate('thisMonth'); },
        },
        isNewHigh && {
            id: 'milestone', type: 'green', icon: Trophy,
            message: `🎉 Congratulations! Your rating reached ${driverAvg.toFixed(2)}★ — your highest ever! Keep it up!`,
        },
        reviewsToday > 0 && {
            id: 'today', type: 'green', icon: Star,
            message: `⭐ You received ${reviewsToday} new review${reviewsToday > 1 ? 's' : ''} today!`,
            action: 'View Now', onAction: () => setDate('today'),
        },
    ].filter(Boolean);
    const visibleBanners = banners.filter(b => !dismissed[b.id]);

    // ── Stats for stat cards ───────────────────────────────────────────────────
    const thisMonthCount = pillCounts.thisMonth;
    const lastMonthCount = allReviews.filter(r => isInDateRange(r.date, 'lastMonth')).length;
    const trendMonthCount = thisMonthCount - lastMonthCount;

    // ── Quick pills ───────────────────────────────────────────────────────────
    const PILLS = [
        { id: 'all',        label: 'All Reviews',      color: '' },
        { id: '5',          label: '5 Stars ★★★★★',    color: 'text-green-600 border-green-300' },
        { id: '4',          label: '4 Stars ★★★★',     color: 'text-green-500 border-green-200' },
        { id: '3',          label: '3 Stars ★★★',      color: 'text-amber-600 border-amber-300' },
        { id: '2',          label: '2 Stars ★★',        color: 'text-orange-600 border-orange-300' },
        { id: '1',          label: '1 Star ★',          color: 'text-red-500 border-red-300' },
        { id: 'critical',   label: 'Critical (< 3★)',   color: 'text-red-600 border-red-400 font-bold' },
        { id: 'withText',   label: 'With Comments',     color: 'text-blue-600 border-blue-300' },
        { id: 'ratingOnly', label: 'Rating Only',       color: 'text-gray-500 border-gray-300' },
        { id: 'thisMonth',  label: 'This Month',        color: 'text-orange-600 border-orange-300' },
        { id: 'thisWeek',   label: 'This Week',         color: 'text-gray-600 border-gray-300' },
    ];

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Reviews & Ratings</h1>
                        <p className="text-sm text-gray-500 mt-0.5">See what customers are saying about your service.</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-1">
                        {lastUpdated && <p className="text-xs text-gray-400 hidden sm:block">Updated {lastUpdated}</p>}
                        <button onClick={() => setSidebar(o => !o)}
                            className="lg:hidden p-2 rounded-xl border border-orange-200 text-orange-600 hover:bg-orange-50 text-xs font-semibold flex items-center gap-1">
                            <BarChart3 size={13} /> Insights
                        </button>
                        <button onClick={refresh} title="Refresh"
                            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
                            <RefreshCw size={14} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="flex gap-3 overflow-x-auto pb-1">
                    <StatCard icon={Star} label="Overall Rating"
                        value={driverAvg ? `★ ${driverAvg.toFixed(2)}` : '★ —'}
                        sub="Your overall score" color="bg-orange-500" loading={loading}
                        trend={trend} trendLabel={trend !== null ? `${trend >= 0 ? '+' : ''}${trend.toFixed(2)} vs last month` : undefined}
                        onClick={() => setQuick('all')} />
                    <StatCard icon={MessageSquare} label="Total Reviews"
                        value={rb?.total ?? allReviews.length ?? '—'}
                        sub="All time feedback" color="bg-blue-500" loading={loading}
                        trend={trendMonthCount} trendLabel={`+${thisMonthCount} this month`}
                        onClick={() => setQuick('all')} />
                    <StatCard icon={Trophy} label="5 Star Reviews"
                        value={pillCounts[5]}
                        sub={rb?.total > 0 ? `${Math.round(pillCounts[5] / rb.total * 100)}% of total` : 'Perfect ratings'}
                        color="bg-green-500" loading={loading}
                        onClick={() => setQuick('5')} />
                    <StatCard icon={AlertCircle} label="Critical Reviews"
                        value={pillCounts.critical}
                        sub={rb?.total > 0 ? `${Math.round(pillCounts.critical / rb.total * 100)}% of total` : 'Needs attention'}
                        color="bg-red-500" loading={loading}
                        onClick={() => setQuick('critical')} />
                    <StatCard icon={Calendar} label="This Month"
                        value={thisMonthCount}
                        sub="Recent feedback" color="bg-amber-500" loading={loading}
                        trend={trendMonthCount} trendLabel={`${trendMonthCount >= 0 ? '+' : ''}${trendMonthCount} vs last month`}
                        onClick={() => setDate('thisMonth')} />
                </div>

                {/* Alert Banners */}
                {visibleBanners.length > 0 && (
                    <div className="space-y-2">
                        <AnimatePresence>
                            {visibleBanners.map(b => (
                                <AlertBanner key={b.id} {...b}
                                    onDismiss={() => setDismissed(d => ({ ...d, [b.id]: true }))} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Rating Overview Panel */}
                {loading ? (
                    <Skel className="h-48 rounded-2xl" />
                ) : (
                    <RatingOverviewPanel
                        rb={rb}
                        trendData={trendData}
                        insights={insights}
                        onFilterStar={(s) => { setQuick(s); setPage(1); }}
                    />
                )}

                {/* Mobile Sidebar Sheet */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebar(false)}>
                            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-gray-50 rounded-t-2xl p-4"
                                onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900">Performance Insights</h3>
                                    <button onClick={() => setSidebar(false)}><X size={18} /></button>
                                </div>
                                <PerformanceSidebar monthly={monthly} rb={rb} allReviews={allReviews} profile={profile} onFilterStar={(s) => { setQuick(s); setSidebar(false); setPage(1); }} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content + Sidebar layout */}
                <div className="flex gap-6 items-start">
                    <div className="flex-1 min-w-0 space-y-4">

                        {/* Featured Reviews */}
                        {!loading && allReviews.length >= 3 && (
                            <FeaturedReviewsRow reviews={allReviews} />
                        )}

                        {/* Filter Bar */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                <div className="relative flex-1 min-w-44">
                                    <Search size={13} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input value={searchText} onChange={e => setSearch(e.target.value)}
                                        placeholder="Search reviewer or review text…"
                                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
                                </div>
                                {[
                                    { value: ratingFilter, onChange: v => { setRating(v); setPage(1); }, options: [['all','All Ratings'],['5','5★ Only'],['4+','4★ & Above'],['3+','3★ & Above'],['critical','Below 3★'],['below2','Critical – Below 2★']] },
                                    { value: typeFilter,   onChange: v => { setType(v); setPage(1); },   options: [['all','All Types'],['withText','With Written Review'],['ratingOnly','Rating Only']] },
                                    { value: dateFilter,   onChange: v => { setDate(v); setPage(1); },   options: [['all','All Time'],['today','Today'],['thisWeek','This Week'],['thisMonth','This Month'],['lastMonth','Last Month'],['3months','Last 3 Months'],['6months','Last 6 Months'],['thisYear','This Year']] },
                                    { value: sortBy,       onChange: v => { setSort(v); setPage(1); },   options: [['newest','Newest First'],['oldest','Oldest First'],['highest','Highest Rating'],['lowest','Lowest Rating']] },
                                ].map((s, i) => (
                                    <select key={i} value={s.value} onChange={e => s.onChange(e.target.value)}
                                        className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                                        {s.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                    </select>
                                ))}
                                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                                    <button onClick={() => setViewMode('card')} className={`p-2 ${viewMode==='card'?'bg-orange-500 text-white':'text-gray-500 hover:bg-gray-50'}`}><LayoutGrid size={14}/></button>
                                    <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode==='list'?'bg-orange-500 text-white':'text-gray-500 hover:bg-gray-50'}`}><List size={14}/></button>
                                </div>
                                <button onClick={() => exportCSV(filteredReviews)}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
                                    <Download size={12} /> Export CSV
                                </button>
                            </div>
                        </div>

                        {/* Quick Filter Pills */}
                        <div className="flex flex-wrap gap-2">
                            {PILLS.map(p => (
                                <button key={p.id} onClick={() => { setQuick(p.id); setPage(1); }}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                                        quickFilter === p.id
                                            ? 'bg-orange-500 border-orange-500 text-white'
                                            : `border-gray-200 text-gray-600 hover:border-orange-300 ${p.color}`
                                    }`}>
                                    {p.label}
                                    {pillCounts[p.id] !== undefined && (
                                        <span className={`ml-1 ${quickFilter === p.id ? 'text-orange-100' : 'text-gray-400'}`}>({pillCounts[p.id]})</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Review List */}
                        {loading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => <Skel key={i} className="h-36 rounded-2xl" />)}
                            </div>
                        ) : !pagedReviews.length ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                                {allReviews.length === 0 ? (
                                    <>
                                        <Star size={64} className="mx-auto mb-3 text-gray-200" strokeWidth={1} />
                                        <p className="text-lg font-bold text-gray-600">No reviews yet.</p>
                                        <p className="text-sm text-gray-400 mt-1">Complete trips to start receiving feedback from customers.</p>
                                        <button onClick={() => navigate('/dashboard/driver/trips')}
                                            className="mt-4 px-5 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600">
                                            Complete trips to earn reviews →
                                        </button>
                                    </>
                                ) : quickFilter === 'critical' ? (
                                    <>
                                        <CheckCircle size={56} className="mx-auto mb-3 text-green-400" />
                                        <p className="text-base font-bold text-green-600">No critical reviews!</p>
                                        <p className="text-sm text-green-500 mt-1">Great job maintaining your service quality.</p>
                                    </>
                                ) : dateFilter === 'thisMonth' && allReviews.length > 0 ? (
                                    <>
                                        <Calendar size={48} className="mx-auto mb-3 text-gray-200" />
                                        <p className="text-base font-semibold text-gray-500">No reviews received this month yet.</p>
                                        <p className="text-sm text-gray-400 mt-1">Keep completing trips to earn feedback.</p>
                                    </>
                                ) : (
                                    <>
                                        <Search size={48} className="mx-auto mb-3 text-gray-200" />
                                        <p className="text-base font-semibold text-gray-500">No reviews match your filters.</p>
                                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
                                        <button onClick={() => { setQuick('all'); setRating('all'); setType('all'); setDate('all'); setSearch(''); setDSearch(''); }}
                                            className="mt-3 text-sm text-orange-500 hover:underline font-medium">
                                            Clear Filters
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : viewMode === 'card' ? (
                            <div className="space-y-3">
                                {pagedReviews.map((r, i) => (
                                    <ReviewCard key={r.date + i} review={r} idx={(page - 1) * pageSize + i}
                                        expanded={expanded} onToggle={(id) => setExpanded(expanded === id ? null : id)}
                                        isNew={isNew(r)} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-500 text-left text-xs">
                                                {['Reviewer','Rating','Review','Trip','Vehicle','Date'].map(h => (
                                                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pagedReviews.map((r, i) => (
                                                <ReviewListRow key={r.date + i} review={r} idx={(page - 1) * pageSize + i}
                                                    expanded={expanded} onToggle={(id) => setExpanded(expanded === id ? null : id)}
                                                    isNew={isNew(r)} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalFiltered > pageSize && (
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3">
                                <p className="text-xs text-gray-500">
                                    {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalFiltered)} of {totalFiltered} reviews
                                    {filteredAvg && <span className="ml-2 text-orange-600 font-semibold">· Avg ★ {filteredAvg}</span>}
                                </p>
                                <div className="flex items-center gap-2">
                                    <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none">
                                        {[10, 25, 50].map(n => <option key={n} value={n}>{n} per page</option>)}
                                    </select>
                                    <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                                        className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                                        <ChevronLeft size={14} />
                                    </button>
                                    <span className="text-xs text-gray-500">{page} / {totalPages}</span>
                                    <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
                                        className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Monthly Breakdown */}
                        {monthly.length > 0 && <MonthlyBreakdown monthly={monthly} />}

                    </div>

                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block w-72 shrink-0 sticky top-6">
                        <PerformanceSidebar
                            monthly={monthly}
                            rb={rb}
                            allReviews={allReviews}
                            profile={profile}
                            onFilterStar={(s) => { setQuick(s); setPage(1); }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DriverReviews;
