/* eslint-disable react/prop-types */
import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
    Car, Bike, Building2, Users, TrendingUp, TrendingDown,
    Download, MessageSquare, Calendar
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtDate = (d) => {
    try {
        const parsed = typeof d === 'string' ? parseISO(d) : new Date(d);
        if (!isValid(parsed)) return '—';
        return format(parsed, 'MMM dd, yyyy');
    } catch { return '—'; }
};

const daysAgo = (d) => {
    try {
        const parsed = typeof d === 'string' ? parseISO(d) : new Date(d);
        if (!isValid(parsed)) return '';
        const diff = differenceInDays(new Date(), parsed);
        if (diff === 0) return 'Today';
        if (diff === 1) return '1 day ago';
        return `${diff} days ago`;
    } catch { return ''; }
};

const getFirstImage = (images) => {
    if (!images) return null;
    try {
        const parsed = typeof images === 'string' ? JSON.parse(images) : images;
        return Array.isArray(parsed) ? parsed[0] : null;
    } catch { return null; }
};

const ratingColor = (r) => {
    if (r >= 4) return 'text-green-600';
    if (r >= 3) return 'text-amber-500';
    return 'text-red-500';
};

const rowBorderClass = (r) => {
    if (r >= 4.5) return 'border-l-4 border-l-green-400';
    if (r >= 3) return 'border-l-4 border-l-amber-400';
    return 'border-l-4 border-l-red-400';
};

const exportCSV = (reviews, type) => {
    if (!reviews?.length) return;
    const headers = {
        vehicle: ['Reviewer', 'Phone', 'Vehicle', 'Type', 'Rating', 'Review', 'Date'],
        agency: ['Reviewer', 'Phone', 'Rating', 'Review', 'Date'],
        driver: ['Reviewer', 'Phone', 'Driver', 'Rating', 'Review', 'Date']
    };
    const rows = reviews.map(r => {
        if (type === 'vehicle') return [r.reviewer_name, r.reviewer_phone, `${r.brand} ${r.model}`, r.vehicle_type, r.rating, r.review || '', fmtDate(r.date)];
        if (type === 'agency') return [r.reviewer_name, r.reviewer_phone, r.rating, r.review || '', fmtDate(r.date)];
        return [r.reviewer_name, r.reviewer_phone, r.driver_name, r.rating, r.review || '', fmtDate(r.date)];
    });
    const csv = [headers[type], ...rows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-reviews.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

// ─── Stars ───────────────────────────────────────────────────────────────────

const Stars = ({ rating, size = 14 }) => (
    <span className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <Star
                key={i}
                size={size}
                className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}
            />
        ))}
    </span>
);

// ─── Rating Bar ───────────────────────────────────────────────────────────────

const RatingBar = ({ star, count, total }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const colors = { 5: 'bg-green-500', 4: 'bg-green-300', 3: 'bg-amber-400', 2: 'bg-orange-400', 1: 'bg-red-500' };
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-4 text-gray-500 font-medium">{star}★</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${colors[star] || 'bg-gray-300'}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-right text-gray-400">{pct}%</span>
        </div>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const STAT_STYLES = {
    overall: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', icon: 'text-orange-500' },
    vehicle: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', icon: 'text-blue-400' },
    agency: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', icon: 'text-amber-400' },
    driver: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600', icon: 'text-green-400' },
    total: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600', icon: 'text-purple-400' }
};

const StatCard = ({ label, sublabel, value, Icon, type, active, onClick }) => {
    const s = STAT_STYLES[type] || STAT_STYLES.total;
    return (
        <button
            onClick={onClick}
            className={`flex-1 min-w-[160px] p-4 rounded-2xl border transition-all text-left group ${s.bg} ${s.border} ${active ? 'ring-2 ring-offset-1 ring-orange-400 shadow-md' : 'hover:shadow-sm'}`}
        >
            <div className={`p-2 rounded-xl bg-white/70 inline-block mb-3 ${s.icon}`}>
                <Icon size={20} />
            </div>
            <div className={`text-2xl font-black tracking-tight ${s.text}`}>{value}</div>
            <div className="text-sm font-semibold text-gray-700 mt-0.5">{label}</div>
            {sublabel && <div className="text-xs text-gray-400 mt-0.5">{sublabel}</div>}
        </button>
    );
};

// ─── Alert Banner ─────────────────────────────────────────────────────────────

const AlertBanner = ({ emoji, message, linkText, onClick, color }) => {
    const styles = {
        red: 'bg-red-50 border-red-200 text-red-700',
        amber: 'bg-amber-50 border-amber-200 text-amber-700',
        orange: 'bg-orange-50 border-orange-200 text-orange-700'
    };
    return (
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium ${styles[color]}`}>
            <span>{emoji} {message}</span>
            {linkText && (
                <button onClick={onClick} className="ml-4 underline underline-offset-2 whitespace-nowrap hover:opacity-75 transition-opacity">
                    {linkText} →
                </button>
            )}
        </div>
    );
};

// ─── Quick Filter Pills ───────────────────────────────────────────────────────

const PILLS = [
    { key: 'all', label: 'All Reviews' },
    { key: '5', label: '5 Stars', color: 'green' },
    { key: '4', label: '4 Stars', color: 'lime' },
    { key: '3', label: '3 Stars', color: 'amber' },
    { key: '2', label: '2 Stars', color: 'orange' },
    { key: '1', label: '1 Star', color: 'red' },
    { key: 'critical', label: 'Critical ≤ 2★', bold: true },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'notext', label: 'No Text' }
];

const pillInactive = {
    green: 'border-green-300 text-green-700 hover:bg-green-50',
    lime: 'border-green-200 text-green-600 hover:bg-green-50',
    amber: 'border-amber-300 text-amber-700 hover:bg-amber-50',
    orange: 'border-orange-300 text-orange-700 hover:bg-orange-50',
    red: 'border-red-300 text-red-700 hover:bg-red-50'
};

const QuickPills = ({ active, onChange }) => (
    <div className="flex flex-wrap gap-2">
        {PILLS.map(p => (
            <button
                key={p.key}
                onClick={() => onChange(p.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    active === p.key
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : p.color ? pillInactive[p.color] : p.bold
                            ? 'border-red-400 text-red-700 font-bold hover:bg-red-50'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
                {p.label}
            </button>
        ))}
    </div>
);

// ─── Vehicle Summary Card ─────────────────────────────────────────────────────

const VehicleSummaryCard = ({ vehicle, active, onClick }) => {
    const total = parseInt(vehicle.review_count) || 0;
    const avg = parseFloat(vehicle.avg_rating) || 0;
    const img = getFirstImage(vehicle.images);

    return (
        <button
            onClick={onClick}
            className={`flex-shrink-0 w-52 p-4 rounded-2xl border text-left transition-all ${
                active ? 'border-orange-400 ring-2 ring-orange-200 bg-orange-50' : 'border-gray-100 bg-white hover:shadow-md hover:border-orange-200'
            }`}
        >
            <div className="relative mb-3">
                {img ? (
                    <img src={img} alt={vehicle.brand} className="w-full h-24 object-cover rounded-xl" />
                ) : (
                    <div className="w-full h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
                        {vehicle.vehicle_type === 'bike' ? <Bike size={32} /> : <Car size={32} />}
                    </div>
                )}
                <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    vehicle.vehicle_type === 'bike' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                    {vehicle.vehicle_type === 'bike' ? 'Bike' : 'Car'}
                </span>
            </div>
            <p className="font-bold text-gray-900 text-sm leading-tight truncate">{vehicle.brand} {vehicle.model}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className={`font-black text-base ${ratingColor(avg)}`}>{avg.toFixed(2)}</span>
                <span className="text-xs text-gray-400">({total})</span>
            </div>
            <div className="mt-2 space-y-1">
                {[5, 4, 3, 2, 1].map(s => (
                    <div key={s} className="flex items-center gap-1">
                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${s >= 4 ? 'bg-green-400' : s === 3 ? 'bg-amber-400' : 'bg-red-400'}`}
                                style={{ width: total > 0 ? `${(parseInt(vehicle[`star${s}`]) / total) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </button>
    );
};

// ─── Driver Summary Card ──────────────────────────────────────────────────────

const DriverSummaryCard = ({ driver, active, onClick }) => {
    const total = parseInt(driver.review_count) || 0;
    const avg = parseFloat(driver.avg_rating) || 0;

    return (
        <button
            onClick={onClick}
            className={`flex-shrink-0 w-44 p-4 rounded-2xl border text-left transition-all ${
                active ? 'border-orange-400 ring-2 ring-orange-200 bg-orange-50' : 'border-gray-100 bg-white hover:shadow-md hover:border-orange-200'
            }`}
        >
            <div className="flex flex-col items-center text-center">
                {driver.driver_photo ? (
                    <img src={driver.driver_photo} alt={driver.driver_name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm mb-2" />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 font-black text-xl flex items-center justify-center mb-2">
                        {driver.driver_name?.[0]?.toUpperCase() || '?'}
                    </div>
                )}
                <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{driver.driver_name}</p>
                <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className={`font-black text-sm ${ratingColor(avg)}`}>{avg.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-400">({total})</span>
                </div>
                <span className={`mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    driver.availability ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                    {driver.availability ? 'Available' : 'Unavailable'}
                </span>
            </div>
            <div className="mt-2 space-y-1">
                {[5, 4, 3, 2, 1].map(s => (
                    <div key={s} className="flex items-center gap-1">
                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${s >= 4 ? 'bg-green-400' : s === 3 ? 'bg-amber-400' : 'bg-red-400'}`}
                                style={{ width: total > 0 ? `${(parseInt(driver[`star${s}`]) / total) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </button>
    );
};

// ─── Avatar Initial ───────────────────────────────────────────────────────────

const AvatarInitial = ({ name, photo, size = 8 }) => {
    if (photo) return <img src={photo} alt={name} className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0`} />;
    return (
        <div className={`w-${size} h-${size} rounded-full bg-orange-100 text-orange-700 font-black flex items-center justify-center flex-shrink-0 text-sm`}>
            {name?.[0]?.toUpperCase() || '?'}
        </div>
    );
};

// ─── Review Row ───────────────────────────────────────────────────────────────

const ReviewRow = ({ review, type, expanded, onToggle }) => {
    const r = parseFloat(review.rating) || 0;
    const borderClass = rowBorderClass(r);
    const hasText = review.review && review.review.trim() !== '';
    const img = type === 'vehicle' ? getFirstImage(review.images) : null;

    return (
        <motion.div layout className={`bg-white rounded-xl shadow-sm ${borderClass} ${!hasText ? 'border-dashed' : ''} overflow-hidden mb-2`}>
            <div
                className="grid gap-3 p-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
                style={{ gridTemplateColumns: type === 'vehicle' ? '2fr 2fr 1fr 3fr 1.2fr auto' : type === 'agency' ? '2fr 1fr 3fr 1.2fr auto' : '2fr 2fr 1fr 3fr 1.2fr auto' }}
                onClick={onToggle}
            >
                {/* Reviewer */}
                <div className="flex items-start gap-2 min-w-0">
                    <AvatarInitial name={review.reviewer_name} photo={review.reviewer_photo} />
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{review.reviewer_name}</p>
                        <p className="text-xs text-gray-400 truncate">{review.reviewer_phone || '—'}</p>
                    </div>
                </div>

                {/* Vehicle (Tab 1) */}
                {type === 'vehicle' && (
                    <div className="flex items-center gap-2 min-w-0">
                        {img ? (
                            <img src={img} alt={review.brand} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-300">
                                {review.vehicle_type === 'bike' ? <Bike size={18} /> : <Car size={18} />}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{review.brand} {review.model}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${review.vehicle_type === 'bike' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {review.vehicle_type === 'bike' ? 'Bike' : 'Car'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Driver (Tab 3) */}
                {type === 'driver' && (
                    <div className="flex items-center gap-2 min-w-0">
                        <AvatarInitial name={review.driver_name} photo={review.driver_photo} size={8} />
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{review.driver_name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{review.driver_ref_id || ''}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${review.availability ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {review.availability ? 'Available' : 'Unavailable'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Rating */}
                <div className="flex flex-col justify-center">
                    <Stars rating={r} size={12} />
                    <span className={`text-sm font-black mt-0.5 ${ratingColor(r)}`}>{r.toFixed(1)}</span>
                </div>

                {/* Review text */}
                <div className="flex items-start min-w-0">
                    {hasText ? (
                        <p className={`text-sm text-gray-600 line-clamp-${expanded ? 'none' : '2'} leading-relaxed`}>
                            {review.review}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-300 italic">No written review</p>
                    )}
                </div>

                {/* Date */}
                <div className="flex flex-col justify-center text-right">
                    <p className="text-xs text-gray-700 font-medium">{fmtDate(review.date)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{daysAgo(review.date)}</p>
                </div>

                {/* Expand toggle */}
                <div className="flex items-center justify-center ml-2">
                    <button className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {/* Expanded detail */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-100"
                    >
                        <div className="p-4 bg-gray-50/70 space-y-3">
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reviewer</p>
                                    <p className="font-semibold text-gray-800">{review.reviewer_name}</p>
                                    <p className="text-gray-500">{review.reviewer_phone}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rating</p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Stars rating={r} size={14} />
                                        <span className={`font-black text-base ${ratingColor(r)}`}>{r.toFixed(1)}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</p>
                                    <p className="font-semibold text-gray-800">{fmtDate(review.date)}</p>
                                </div>
                                {type === 'vehicle' && (
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vehicle</p>
                                        <p className="font-semibold text-gray-800">{review.brand} {review.model}</p>
                                        <p className="text-gray-500 capitalize">{review.vehicle_type}</p>
                                    </div>
                                )}
                                {type === 'driver' && (
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Driver</p>
                                        <p className="font-semibold text-gray-800">{review.driver_name}</p>
                                        <p className="text-gray-500">Overall ★ {parseFloat(review.driver_overall_rating || 0).toFixed(2)}</p>
                                    </div>
                                )}
                            </div>
                            {hasText && (
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Review</p>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-white rounded-xl p-3 border border-gray-100">{review.review}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Table Header ─────────────────────────────────────────────────────────────

const TableHeader = ({ type }) => {
    const cols = {
        vehicle: ['Reviewer', 'Vehicle', 'Rating', 'Review', 'Date', ''],
        agency: ['Reviewer', 'Rating', 'Review', 'Date', ''],
        driver: ['Reviewer', 'Driver', 'Rating', 'Review', 'Date', '']
    };
    return (
        <div
            className="grid gap-3 px-4 py-2 mb-1"
            style={{ gridTemplateColumns: type === 'vehicle' ? '2fr 2fr 1fr 3fr 1.2fr auto' : type === 'agency' ? '2fr 1fr 3fr 1.2fr auto' : '2fr 2fr 1fr 3fr 1.2fr auto' }}
        >
            {(cols[type] || []).map((col, i) => (
                <div key={i} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{col}</div>
            ))}
        </div>
    );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ Icon: EIcon, title, subtitle }) => (
    <div className="py-24 text-center bg-white rounded-2xl border border-gray-100">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
            <EIcon size={40} />
        </div>
        <h3 className="text-lg font-bold text-gray-700">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
    </div>
);

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = ({ page, limit, total, avgRating, setPage, setLimit }) => {
    const from = total === 0 ? 0 : (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 px-1">
            <div className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-800">{from}–{to}</span> of <span className="font-semibold text-gray-800">{total}</span>
                {avgRating > 0 && <span className="ml-2 text-amber-600 font-semibold"> · Avg ★ {avgRating.toFixed(2)} for this view</span>}
            </div>
            <div className="flex items-center gap-3">
                <select
                    value={limit}
                    onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                    {[10, 25, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
                </select>
                <div className="flex items-center gap-1">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let p = i + 1;
                        if (totalPages > 5) {
                            if (page <= 3) p = i + 1;
                            else if (page >= totalPages - 2) p = totalPages - 4 + i;
                            else p = page - 2 + i;
                        }
                        return (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${p === page ? 'bg-orange-500 text-white shadow-sm' : 'border border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                            >
                                {p}
                            </button>
                        );
                    })}
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AgencyReviews = () => {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();

    const [activeTab, setActiveTab] = useState('vehicles');
    const [vehicleSubTab, setVehicleSubTab] = useState('all');
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [filters, setFilters] = useState({
        search: '', rating: 'all', quickFilter: 'all', sortBy: 'newest', start: '', end: ''
    });

    const updateFilter = useCallback((key, val) => {
        setFilters(prev => ({ ...prev, [key]: val }));
        setPage(1);
    }, []);

    const switchTab = (tab) => {
        setActiveTab(tab);
        setPage(1);
        setFilters({ search: '', rating: 'all', quickFilter: 'all', sortBy: 'newest', start: '', end: '' });
        setExpandedId(null);
        setSelectedVehicle(null);
        setSelectedDriver(null);
    };

    // ── Agency Profile ───────────────────────────────────────────────────────
    const { data: agencyProfile } = useQuery({
        queryKey: ['agency-profile', user?.email],
        queryFn: async () => {
            const res = await axiosPublic.get(`/agencyRoutes/getAgencyProfile/${user?.email}`);
            return res.data;
        },
        enabled: !!user?.email
    });
    const agencyId = agencyProfile?.agency_id;

    // ── Stats ────────────────────────────────────────────────────────────────
    const { data: stats } = useQuery({
        queryKey: ['agency-review-stats', agencyId],
        queryFn: async () => (await axiosPublic.get(`/agencyRoutes/reviews/stats/${agencyId}`)).data,
        enabled: !!agencyId
    });

    // ── Vehicle Reviews ──────────────────────────────────────────────────────
    const vehicleParams = useMemo(() => {
        const p = new URLSearchParams({
            page, limit, search: filters.search, quickFilter: filters.quickFilter,
            ratingFilter: filters.rating, sortBy: filters.sortBy, vehicleType: vehicleSubTab
        });
        if (selectedVehicle) p.set('vehicleId', selectedVehicle.vehicle_id);
        if (selectedVehicle) p.set('vehicleType', selectedVehicle.vehicle_type);
        if (filters.start) p.set('start', filters.start);
        if (filters.end) p.set('end', filters.end);
        return p.toString();
    }, [page, limit, filters, vehicleSubTab, selectedVehicle]);

    const { data: vehicleData, isLoading: vehicleLoading } = useQuery({
        queryKey: ['agency-vehicle-reviews', agencyId, vehicleParams],
        queryFn: async () => (await axiosPublic.get(`/agencyRoutes/reviews/vehicles/${agencyId}?${vehicleParams}`)).data,
        enabled: !!agencyId && activeTab === 'vehicles'
    });

    const { data: vehicleSummary } = useQuery({
        queryKey: ['agency-vehicle-summary', agencyId],
        queryFn: async () => (await axiosPublic.get(`/agencyRoutes/reviews/vehicle-summary/${agencyId}`)).data,
        enabled: !!agencyId
    });

    // ── Agency Reviews ───────────────────────────────────────────────────────
    const agencyParams = useMemo(() => {
        const p = new URLSearchParams({
            page, limit, search: filters.search, quickFilter: filters.quickFilter,
            ratingFilter: filters.rating, sortBy: filters.sortBy
        });
        if (filters.start) p.set('start', filters.start);
        if (filters.end) p.set('end', filters.end);
        return p.toString();
    }, [page, limit, filters]);

    const { data: agencyData, isLoading: agencyLoading } = useQuery({
        queryKey: ['agency-reviews-tab', agencyId, agencyParams],
        queryFn: async () => (await axiosPublic.get(`/agencyRoutes/reviews/agency/${agencyId}?${agencyParams}`)).data,
        enabled: !!agencyId && activeTab === 'agency'
    });

    // ── Driver Reviews ───────────────────────────────────────────────────────
    const driverParams = useMemo(() => {
        const p = new URLSearchParams({
            page, limit, search: filters.search, quickFilter: filters.quickFilter,
            ratingFilter: filters.rating, sortBy: filters.sortBy
        });
        if (selectedDriver) p.set('driverId', selectedDriver.driver_id);
        if (filters.start) p.set('start', filters.start);
        if (filters.end) p.set('end', filters.end);
        return p.toString();
    }, [page, limit, filters, selectedDriver]);

    const { data: driverData, isLoading: driverLoading } = useQuery({
        queryKey: ['agency-driver-reviews', agencyId, driverParams],
        queryFn: async () => (await axiosPublic.get(`/agencyRoutes/reviews/drivers/${agencyId}?${driverParams}`)).data,
        enabled: !!agencyId && activeTab === 'drivers'
    });

    const { data: driverSummary } = useQuery({
        queryKey: ['agency-driver-summary', agencyId],
        queryFn: async () => (await axiosPublic.get(`/agencyRoutes/reviews/driver-summary/${agencyId}`)).data,
        enabled: !!agencyId
    });

    // ── Derived data ─────────────────────────────────────────────────────────
    const currentData = activeTab === 'vehicles' ? vehicleData : activeTab === 'agency' ? agencyData : driverData;
    const isLoading = activeTab === 'vehicles' ? vehicleLoading : activeTab === 'agency' ? agencyLoading : driverLoading;

    const totalAgencyReviews = stats?.agencyReviewCount || 0;
    const ratingBreakdown = agencyData?.ratingBreakdown || [];
    const breakdownMap = Object.fromEntries(ratingBreakdown.map(r => [r.star, parseInt(r.count)]));

    // ── Vehicle summary list by subTab ────────────────────────────────────────
    const vehicleSummaryList = useMemo(() => {
        if (!vehicleSummary) return [];
        if (vehicleSubTab === 'car') return vehicleSummary.cars || [];
        if (vehicleSubTab === 'bike') return vehicleSummary.bikes || [];
        return [...(vehicleSummary.cars || []), ...(vehicleSummary.bikes || [])];
    }, [vehicleSummary, vehicleSubTab]);

    const handleExport = () => {
        const reviews = currentData?.reviews || [];
        exportCSV(reviews, activeTab === 'vehicles' ? 'vehicle' : activeTab === 'agency' ? 'agency' : 'driver');
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-6">

            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reviews & Ratings</h1>
                <p className="text-gray-500 mt-1">Monitor feedback received across your fleet, agency, and drivers.</p>
            </div>

            {/* Stat Cards */}
            <div className="flex flex-wrap gap-3">
                <StatCard
                    label="Overall Rating" sublabel="Weighted across all types"
                    value={`★ ${(stats?.overallRating || 0).toFixed(2)}`}
                    Icon={Star} type="overall" active={false}
                    onClick={() => {}}
                />
                <StatCard
                    label="Vehicle Reviews" sublabel="Cars & Bikes"
                    value={stats?.vehicleReviewCount ?? '—'}
                    Icon={Car} type="vehicle" active={activeTab === 'vehicles'}
                    onClick={() => switchTab('vehicles')}
                />
                <StatCard
                    label="Agency Reviews" sublabel="Agency feedback"
                    value={stats?.agencyReviewCount ?? '—'}
                    Icon={Building2} type="agency" active={activeTab === 'agency'}
                    onClick={() => switchTab('agency')}
                />
                <StatCard
                    label="Driver Reviews" sublabel="Across all drivers"
                    value={stats?.driverReviewCount ?? '—'}
                    Icon={Users} type="driver" active={activeTab === 'drivers'}
                    onClick={() => switchTab('drivers')}
                />
                <StatCard
                    label="Total Reviews" sublabel="All time feedback"
                    value={stats?.totalReviewCount ?? '—'}
                    Icon={MessageSquare} type="total" active={false}
                    onClick={() => {}}
                />
            </div>

            {/* Alert Banners */}
            <div className="space-y-2">
                {(stats?.criticalCount || 0) > 0 && (
                    <AlertBanner
                        emoji="🔴" color="red"
                        message={`${stats.criticalCount} review${stats.criticalCount > 1 ? 's' : ''} with critically low ratings (≤ 2.0) require your attention.`}
                        linkText="View Now"
                        onClick={() => { switchTab('vehicles'); updateFilter('quickFilter', 'critical'); }}
                    />
                )}
                {(stats?.avgAgencyRating || 0) > 0 && stats.avgAgencyRating < 3.5 && (
                    <AlertBanner
                        emoji="⚠️" color="amber"
                        message={`Your agency rating has dropped below 3.5 (currently ${stats.avgAgencyRating.toFixed(2)}). Take action to improve customer satisfaction.`}
                        linkText="View Now"
                        onClick={() => switchTab('agency')}
                    />
                )}
                {(stats?.unreviewedVehicles || 0) > 0 && (
                    <AlertBanner
                        emoji="🟠" color="orange"
                        message={`${stats.unreviewedVehicles} vehicle${stats.unreviewedVehicles > 1 ? 's' : ''} in your fleet have received no reviews yet.`}
                        linkText={null}
                    />
                )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search reviewer, review text, vehicle or driver..."
                            value={filters.search}
                            onChange={e => updateFilter('search', e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>
                    <select
                        value={filters.rating}
                        onChange={e => updateFilter('rating', e.target.value)}
                        className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                        <option value="all">All Ratings</option>
                        <option value="5only">5★ Only</option>
                        <option value="4plus">4★ & Above</option>
                        <option value="3plus">3★ & Above</option>
                        <option value="below3">Below 3★</option>
                        <option value="critical">Critical ≤ 2★</option>
                    </select>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <input
                            type="date" value={filters.start} onChange={e => updateFilter('start', e.target.value)}
                            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <span className="text-gray-400 text-sm">–</span>
                        <input
                            type="date" value={filters.end} onChange={e => updateFilter('end', e.target.value)}
                            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>
                    <select
                        value={filters.sortBy}
                        onChange={e => updateFilter('sortBy', e.target.value)}
                        className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </select>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50">
                    <QuickPills active={filters.quickFilter} onChange={v => updateFilter('quickFilter', v)} />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5">
                {[
                    { key: 'vehicles', label: 'Vehicle Reviews', Icon: Car },
                    { key: 'agency', label: 'Agency Reviews', Icon: Building2 },
                    { key: 'drivers', label: 'Driver Reviews', Icon: Users }
                ].map(({ key, label, Icon: TabIcon }) => (
                    <button
                        key={key}
                        onClick={() => switchTab(key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === key ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <TabIcon size={16} /> {label}
                    </button>
                ))}
            </div>

            {/* ── TAB 1: VEHICLE REVIEWS ─────────────────────────────────── */}
            {activeTab === 'vehicles' && (
                <div className="space-y-4">
                    {/* Sub-tabs */}
                    <div className="flex gap-2">
                        {[
                            { key: 'all', label: 'All Vehicles' },
                            { key: 'car', label: 'Cars' },
                            { key: 'bike', label: 'Bikes' }
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => { setVehicleSubTab(key); setPage(1); setSelectedVehicle(null); }}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                                    vehicleSubTab === key ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                        {selectedVehicle && (
                            <button
                                onClick={() => setSelectedVehicle(null)}
                                className="px-4 py-2 rounded-full text-sm font-semibold border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 transition-all flex items-center gap-2"
                            >
                                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                                {selectedVehicle.brand} {selectedVehicle.model} ×
                            </button>
                        )}
                    </div>

                    {/* Vehicle Summary Panel */}
                    {vehicleSummaryList.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Vehicle Ratings</p>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {vehicleSummaryList.map(v => (
                                    <VehicleSummaryCard
                                        key={`${v.vehicle_type}-${v.vehicle_id}`}
                                        vehicle={v}
                                        active={selectedVehicle?.vehicle_id === v.vehicle_id}
                                        onClick={() => {
                                            setSelectedVehicle(prev => prev?.vehicle_id === v.vehicle_id ? null : v);
                                            setVehicleSubTab(v.vehicle_type);
                                            setPage(1);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Review List */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="space-y-3 p-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : !vehicleData?.reviews?.length ? (
                            <EmptyState Icon={Car} title="No vehicle reviews yet" subtitle="Your cars and bikes haven't received any feedback." />
                        ) : (
                            <div className="p-4">
                                <TableHeader type="vehicle" />
                                {vehicleData.reviews.map((r, i) => {
                                    const uid = `v-${i}-${r.entity_id}`;
                                    return (
                                        <ReviewRow
                                            key={uid} review={r} type="vehicle"
                                            expanded={expandedId === uid}
                                            onToggle={() => setExpandedId(prev => prev === uid ? null : uid)}
                                        />
                                    );
                                })}
                                <Pagination
                                    page={page} limit={limit}
                                    total={vehicleData.total} avgRating={vehicleData.avgRating}
                                    setPage={setPage} setLimit={l => { setLimit(l); setPage(1); }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── TAB 2: AGENCY REVIEWS ─────────────────────────────────── */}
            {activeTab === 'agency' && (
                <div className="space-y-4">
                    {/* Agency Rating Summary */}
                    {agencyData && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="text-center md:text-left">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 font-black text-xl flex items-center justify-center">
                                            {agencyProfile?.agency_name?.[0]?.toUpperCase() || 'A'}
                                        </div>
                                        <div>
                                            <p className="font-black text-lg text-gray-900">{agencyProfile?.agency_name}</p>
                                            <p className="text-sm text-gray-400">{totalAgencyReviews} total reviews</p>
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-3">
                                        <Star size={32} className="fill-amber-400 text-amber-400" />
                                        <span className="text-5xl font-black text-gray-900">{(agencyData.avgRating || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="mt-2">
                                        <Stars rating={agencyData.avgRating} size={18} />
                                    </div>
                                    {stats?.ratingTrend !== null && stats?.ratingTrend !== undefined && (
                                        <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${stats.ratingTrend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {stats.ratingTrend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            {stats.ratingTrend >= 0 ? '+' : ''}{stats.ratingTrend} vs last month
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-[200px] space-y-2">
                                    {[5, 4, 3, 2, 1].map(s => (
                                        <RatingBar
                                            key={s} star={s}
                                            count={breakdownMap[s] || 0}
                                            total={totalAgencyReviews}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Review List */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="space-y-3 p-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                            </div>
                        ) : !agencyData?.reviews?.length ? (
                            <EmptyState Icon={Building2} title="No agency reviews yet" subtitle="Customers who book through your agency will leave feedback here." />
                        ) : (
                            <div className="p-4">
                                <TableHeader type="agency" />
                                {agencyData.reviews.map((r, i) => {
                                    const uid = `a-${i}`;
                                    return (
                                        <ReviewRow
                                            key={uid} review={r} type="agency"
                                            expanded={expandedId === uid}
                                            onToggle={() => setExpandedId(prev => prev === uid ? null : uid)}
                                        />
                                    );
                                })}
                                <Pagination
                                    page={page} limit={limit}
                                    total={agencyData.total} avgRating={agencyData.avgRating}
                                    setPage={setPage} setLimit={l => { setLimit(l); setPage(1); }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── TAB 3: DRIVER REVIEWS ─────────────────────────────────── */}
            {activeTab === 'drivers' && (
                <div className="space-y-4">
                    {/* Driver Summary Panel */}
                    {(driverSummary?.length > 0) && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Driver Ratings</p>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {driverSummary.map(d => (
                                    <DriverSummaryCard
                                        key={d.driver_id}
                                        driver={d}
                                        active={selectedDriver?.driver_id === d.driver_id}
                                        onClick={() => {
                                            setSelectedDriver(prev => prev?.driver_id === d.driver_id ? null : d);
                                            setPage(1);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active driver filter indicator */}
                    {selectedDriver && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Filtered by driver:</span>
                            <span className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full border border-green-100">
                                {selectedDriver.driver_name}
                                <button onClick={() => setSelectedDriver(null)} className="text-green-400 hover:text-green-700 transition-colors text-base leading-none">×</button>
                            </span>
                        </div>
                    )}

                    {/* Review List */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="space-y-3 p-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                            </div>
                        ) : !driverData?.reviews?.length ? (
                            <EmptyState Icon={Users} title="No driver reviews yet" subtitle="Reviews will appear here once customers rate their drivers." />
                        ) : (
                            <div className="p-4">
                                <TableHeader type="driver" />
                                {driverData.reviews.map((r, i) => {
                                    const uid = `d-${i}-${r.driver_ref_id}`;
                                    return (
                                        <ReviewRow
                                            key={uid} review={r} type="driver"
                                            expanded={expandedId === uid}
                                            onToggle={() => setExpandedId(prev => prev === uid ? null : uid)}
                                        />
                                    );
                                })}
                                <Pagination
                                    page={page} limit={limit}
                                    total={driverData.total} avgRating={driverData.avgRating}
                                    setPage={setPage} setLimit={l => { setLimit(l); setPage(1); }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgencyReviews;
