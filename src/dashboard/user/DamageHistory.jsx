import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import moment from 'moment';
import { FaCar } from 'react-icons/fa';
import { IoConstructOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import { FiCalendar, FiAlertTriangle, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { MdOutlineReportProblem } from 'react-icons/md';

const STATUS_CONFIG = {
  reported:     { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Reported' },
  under_review: { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Under Review' },
  resolved:     { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Resolved' },
  rejected:     { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Rejected' },
};

const SEVERITY_CONFIG = {
  minor:    { text: 'text-amber-600',  label: 'Minor' },
  moderate: { text: 'text-orange-600', label: 'Moderate' },
  major:    { text: 'text-red-600',    label: 'Major' },
};

// ── Detail Modal ──────────────────────────────────────────────────────────────
const DamageDetailModal = ({ report, onClose }) => {
  const [imgIndex, setImgIndex] = useState(0);
  if (!report) return null;

  const images = report.damage_images?.length ? report.damage_images : (report.car_images || []);
  const status = STATUS_CONFIG[report.status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: report.status };
  const severity = SEVERITY_CONFIG[report.severity?.toLowerCase()] || { text: 'text-gray-600', label: report.severity };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{report.brand} {report.model}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Damage Report — {report.damage_id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Image Carousel */}
        {images.length > 0 ? (
          <div className="relative bg-gray-900 h-56">
            <img
              src={images[imgIndex]}
              alt={`Damage ${imgIndex + 1}`}
              className="w-full h-full object-contain"
              onError={e => { e.target.src = 'https://via.placeholder.com/400x224?text=No+Image'; }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full"
                >
                  <FiChevronLeft />
                </button>
                <button
                  onClick={() => setImgIndex(i => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full"
                >
                  <FiChevronRight />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIndex ? 'bg-white w-3' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
                <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                  {imgIndex + 1}/{images.length}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-300">
            <FaCar className="text-4xl" />
          </div>
        )}

        {/* Details */}
        <div className="p-5 space-y-4">
          {/* Status + Severity */}
          <div className="flex gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>{status.label}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gray-100 ${severity.text}`}>
              {severity.label} Severity
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Detail label="Damage Type" value={report.damage_type || '—'} />
            <Detail label="Reported On" value={moment(report.report_date).format('DD MMM YYYY, hh:mm A')} />
            <Detail label="Booking ID" value={report.booking_id || '—'} />
            <Detail label="Vehicle" value={`${report.brand} ${report.model}`} />
          </div>

          {report.description && (
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Description</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{report.description}</p>
            </div>
          )}

          {report.admin_notes && (
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Admin Notes</p>
              <p className="text-sm text-gray-700 bg-blue-50 rounded-xl p-3 leading-relaxed">{report.admin_notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const reportShape = PropTypes.shape({
  damage_id: PropTypes.string,
  brand: PropTypes.string,
  model: PropTypes.string,
  status: PropTypes.string,
  severity: PropTypes.string,
  damage_type: PropTypes.string,
  description: PropTypes.string,
  admin_notes: PropTypes.string,
  report_date: PropTypes.string,
  booking_id: PropTypes.string,
  damage_images: PropTypes.arrayOf(PropTypes.string),
  car_images: PropTypes.arrayOf(PropTypes.string),
});

DamageDetailModal.propTypes = {
  report: reportShape,
  onClose: PropTypes.func.isRequired,
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 uppercase font-semibold">{label}</p>
    <p className="text-gray-700 font-medium mt-0.5">{value}</p>
  </div>
);

Detail.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

// ── Damage Card ───────────────────────────────────────────────────────────────
const DamageCard = ({ report, onViewDetails }) => {
  const damageImg = report.damage_images?.[0] || report.car_images?.[0];
  const status = STATUS_CONFIG[report.status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: report.status };
  const severity = SEVERITY_CONFIG[report.severity?.toLowerCase()] || { text: 'text-gray-600', label: report.severity };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {damageImg ? (
          <img
            src={damageImg}
            alt="Damage"
            className="w-full h-full object-cover"
            onError={e => { e.target.src = 'https://via.placeholder.com/400x176?text=No+Image'; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
            <FiAlertTriangle className="text-4xl" />
            <p className="text-xs">No image</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status badge */}
        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow ${status.bg} ${status.text}`}>
          {status.label}
        </span>

        {/* Car name */}
        <div className="absolute bottom-3 left-4">
          <p className="text-white font-bold text-base drop-shadow">{report.brand} {report.model}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-gray-400">Damage Type</p>
            <p className="font-semibold text-gray-700 truncate">{report.damage_type || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Severity</p>
            <p className={`font-semibold capitalize ${severity.text}`}>{severity.label || '—'}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <FiCalendar />
          <span>{moment(report.report_date).format('DD MMM YYYY, hh:mm A')}</span>
        </div>

        {report.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{report.description}</p>
        )}

        <button
          onClick={() => onViewDetails(report)}
          className="mt-auto w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <IoConstructOutline /> View Damage Details
        </button>
      </div>
    </div>
  );
};

DamageCard.propTypes = {
  report: reportShape.isRequired,
  onViewDetails: PropTypes.func.isRequired,
};

// ── Page ──────────────────────────────────────────────────────────────────────
const DamageHistory = () => {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user?.email) return;
      try {
        const userRes = await axiosPublic.get(`userRoute/getUserInfo/${user.email}`);
        const userId = userRes.data[0]?.user_id || userRes.data[0]?._id;
        if (userId) {
          const res = await axiosPublic.get(`returnDamageRoutes/user-reports/${userId}`);
          setReports(res.data);
        }
      } catch (error) {
        console.error('Error fetching damage reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <MdOutlineReportProblem className="text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Damage Reports</h1>
              <p className="text-red-100 text-sm mt-0.5">Track the status of your reported vehicle damages</p>
            </div>
          </div>

          {!loading && (
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <p className="text-xs text-red-100">Total Reports</p>
                <p className="text-lg font-bold">{reports.length}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <p className="text-xs text-red-100">Under Review</p>
                <p className="text-lg font-bold">{reports.filter(r => r.status === 'under_review').length}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <p className="text-xs text-red-100">Resolved</p>
                <p className="text-lg font-bold">{reports.filter(r => r.status === 'resolved').length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-9 bg-gray-200 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-5">
              <IoCheckmarkCircleOutline className="text-5xl text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-500 mb-1">No damage reports</h3>
            <p className="text-gray-400 text-sm max-w-xs">All your previous rentals were trouble-free!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map(report => (
              <DamageCard
                key={report.damage_id}
                report={report}
                onViewDetails={setSelectedReport}
              />
            ))}
          </div>
        )}
      </div>

      <DamageDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </div>
  );
};

export default DamageHistory;
