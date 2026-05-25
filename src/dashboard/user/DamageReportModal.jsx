import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog, DialogContent, DialogActions,
    Button, TextField, MenuItem, CircularProgress,
} from '@mui/material';
import { AlertTriangle, X, Camera, Trash2, ImagePlus } from 'lucide-react';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useRole from '../../hooks/useRole';
import toast from 'react-hot-toast';

const DAMAGE_TYPES = [
    'Scratch', 'Dent', 'Mechanical', 'Electrical',
    'Interior', 'Tyre', 'Glass', 'Other',
];

const SEVERITIES = [
    { value: 'Low',    label: 'Low — Minor scratches, small dents' },
    { value: 'Medium', label: 'Medium — Large dents, paint damage' },
    { value: 'High',   label: 'High — Structural or mechanical damage' },
];

const MAX_PHOTOS = 5;

const SEVERITY_STYLE = {
    Low:    'text-green-600 bg-green-50 border-green-200',
    Medium: 'text-amber-600 bg-amber-50 border-amber-200',
    High:   'text-red-600   bg-red-50   border-red-200',
};

// Each photo entry shape:
// { file: File, preview: string, uploadUrl: string|null, fileUrl: string|null, uploading: bool, error: bool }

const DamageReportModal = ({ open, onClose, booking, onSubmitted }) => {
    const axiosPublic = useAxiosPublic();
    const role = useRole();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({ damage_type: 'Scratch', severity: 'Low', description: '' });
    const [photos, setPhotos] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleClose = () => {
        if (submitting) return;
        photos.forEach(p => URL.revokeObjectURL(p.preview));
        setForm({ damage_type: 'Scratch', severity: 'Low', description: '' });
        setPhotos([]);
        onClose();
    };

    /**
     * Upload each selected file to the backend (/uploadRoutes/upload).
     * The backend signs the request and proxies it to S3, so no CORS
     * configuration on the bucket is needed.
     */
    const handleFilesSelected = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        e.target.value = '';

        const remaining = MAX_PHOTOS - photos.length;
        const toAdd = files.slice(0, remaining);

        if (files.length > remaining) {
            toast.error(`Only ${remaining} slot(s) remaining (max ${MAX_PHOTOS} photos).`);
        }

        // Show placeholders immediately so the user sees thumbnails right away
        const startIndex = photos.length;
        setPhotos(prev => [
            ...prev,
            ...toAdd.map(file => ({
                file,
                preview: URL.createObjectURL(file),
                fileUrl: null,
                uploading: true,
                error: false,
            })),
        ]);

        // Upload each file concurrently through the backend proxy
        toAdd.forEach(async (file, i) => {
            const idx = startIndex + i;
            try {
                const { data } = await axiosPublic.post(
                    'uploadRoutes/upload',
                    file,           // raw File object as the request body
                    {
                        headers: {
                            'Content-Type': file.type,
                            'X-File-Name':  file.name,
                            'X-Folder':     `damage-reports/${booking.booking_id}`,
                        },
                        // Tell axios not to JSON-serialize the body
                        transformRequest: [(d) => d],
                    }
                );

                setPhotos(prev =>
                    prev.map((p, j) =>
                        j === idx ? { ...p, fileUrl: data.fileUrl, uploading: false } : p
                    )
                );
            } catch (err) {
                const msg = err?.response?.data?.message || 'Upload failed.';
                console.error('Upload error:', msg);
                setPhotos(prev =>
                    prev.map((p, j) =>
                        j === idx ? { ...p, uploading: false, error: true } : p
                    )
                );
                toast.error(`Photo ${i + 1} failed: ${msg}`);
            }
        });
    };

    const removePhoto = (index) => {
        setPhotos(prev => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.description.trim()) {
            toast.error('Please describe the damage.');
            return;
        }
        if (photos.some(p => p.uploading)) {
            toast.error('Please wait — photos are still uploading.');
            return;
        }
        if (photos.some(p => p.error)) {
            toast.error('Remove failed photos before submitting.');
            return;
        }

        setSubmitting(true);
        try {
            const uploadedUrls = photos.filter(p => p.fileUrl).map(p => p.fileUrl);

            await axiosPublic.post('returnDamageRoutes/user-damage', {
                booking_id: booking.booking_id,
                user_id: role?.user_id,
                damage_type: form.damage_type,
                severity: form.severity,
                description: form.description.trim(),
                ...(uploadedUrls.length > 0 && { photos: uploadedUrls }),
            });

            toast.success('Damage report submitted successfully.');
            photos.forEach(p => URL.revokeObjectURL(p.preview));
            setForm({ damage_type: 'Scratch', severity: 'Low', description: '' });
            setPhotos([]);
            onSubmitted?.();
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to submit report. Please try again.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const anyUploading = photos.some(p => p.uploading);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-xl">
                        <AlertTriangle size={20} className="text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-800">Report Damage</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {booking?.brand} {booking?.model} · {booking?.booking_id}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleClose}
                    disabled={submitting}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ px: 3, py: 3 }}>
                    <div className="space-y-4">

                        {/* Info banner */}
                        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700">
                            Report any damage to the vehicle as soon as you notice it during your trip.
                        </div>

                        {/* Damage Type + Severity */}
                        <div className="grid grid-cols-2 gap-3">
                            <TextField
                                select fullWidth label="Damage Type"
                                name="damage_type" value={form.damage_type}
                                onChange={handleChange} size="small" required
                            >
                                {DAMAGE_TYPES.map(t => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select fullWidth label="Severity"
                                name="severity" value={form.severity}
                                onChange={handleChange} size="small" required
                            >
                                {SEVERITIES.map(s => (
                                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                                ))}
                            </TextField>
                        </div>

                        {/* Severity badge */}
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${SEVERITY_STYLE[form.severity]}`}>
                            <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                            {form.severity} severity
                        </div>

                        {/* Description */}
                        <TextField
                            fullWidth multiline rows={3}
                            label="Description" name="description"
                            value={form.description} onChange={handleChange}
                            placeholder="Describe what happened and where the damage is located..."
                            size="small" required
                            inputProps={{ maxLength: 500 }}
                            helperText={`${form.description.length}/500`}
                        />

                        {/* Photo upload */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                    <Camera size={15} className="text-gray-500" />
                                    Photos
                                    <span className="text-xs font-normal text-gray-400">
                                        (optional, up to {MAX_PHOTOS})
                                    </span>
                                </p>
                                <span className="text-xs text-gray-400">{photos.length}/{MAX_PHOTOS}</span>
                            </div>

                            {/* Thumbnail grid */}
                            {photos.length > 0 && (
                                <div className="grid grid-cols-5 gap-2 mb-3">
                                    {photos.map((p, i) => (
                                        <div
                                            key={i}
                                            className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                                        >
                                            <img
                                                src={p.preview}
                                                alt={`damage-${i + 1}`}
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Uploading overlay */}
                                            {p.uploading && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <CircularProgress size={18} sx={{ color: '#fff' }} />
                                                </div>
                                            )}

                                            {/* Error overlay */}
                                            {p.error && (
                                                <div className="absolute inset-0 bg-red-500/60 flex flex-col items-center justify-center gap-1">
                                                    <AlertTriangle size={14} className="text-white" />
                                                    <span className="text-white text-[10px] font-semibold">Failed</span>
                                                </div>
                                            )}

                                            {/* Uploaded tick */}
                                            {!p.uploading && !p.error && p.fileUrl && (
                                                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-[10px] font-bold">✓</span>
                                                </div>
                                            )}

                                            {/* Remove button */}
                                            {!p.uploading && (
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(i)}
                                                    className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add photos button */}
                            {photos.length < MAX_PHOTOS && (
                                <>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        multiple
                                        className="hidden"
                                        onChange={handleFilesSelected}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={anyUploading}
                                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ImagePlus size={18} />
                                        {anyUploading ? 'Uploading…' : 'Click to add photos'}
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
                    <Button
                        onClick={handleClose}
                        disabled={submitting}
                        variant="outlined"
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting || anyUploading}
                        variant="contained"
                        startIcon={
                            submitting
                                ? <CircularProgress size={16} color="inherit" />
                                : <AlertTriangle size={16} />
                        }
                        sx={{
                            background: '#ef4444',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            '&:hover': { background: '#dc2626' },
                            '&:disabled': { background: '#fca5a5' },
                        }}
                    >
                        {submitting ? 'Submitting…' : 'Submit Report'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

DamageReportModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    booking: PropTypes.shape({
        booking_id: PropTypes.string,
        brand: PropTypes.string,
        model: PropTypes.string,
    }).isRequired,
    onSubmitted: PropTypes.func,
};

export default DamageReportModal;
