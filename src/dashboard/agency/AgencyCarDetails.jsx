import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BsFuelPumpFill } from "react-icons/bs";
import { FaStar, FaCheckCircle, FaTimesCircle, FaPencilAlt } from "react-icons/fa";
import { PiSeatFill } from "react-icons/pi";
import { TbManualGearbox, TbSteeringWheel } from "react-icons/tb";
import { MdCalendarToday, MdSpeed } from "react-icons/md";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["Available", "Unavailable", "Suspended", "Maintenance", "Booked", "Requested"];

const STATUS_STYLES = {
    Available:   "bg-green-100 text-green-700",
    Unavailable: "bg-red-100 text-red-600",
    Suspended:   "bg-amber-100 text-amber-700",
    Maintenance: "bg-yellow-100 text-yellow-700",
    Booked:      "bg-blue-100 text-blue-700",
    Requested:   "bg-purple-100 text-purple-700",
};

const btnSx = {
    backgroundColor: "#F58300", color: "#fff", textTransform: "none", fontWeight: 700,
    "&:hover": { backgroundColor: "#e07500" },
};

const SpecRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-semibold text-gray-800">{value ?? "—"}</span>
    </div>
);

const FeatureChip = ({ label, active }) => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${
        active ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-400"
    }`}>
        {active
            ? <FaCheckCircle className="text-green-500 flex-shrink-0" />
            : <FaTimesCircle className="text-gray-300 flex-shrink-0" />}
        {label}
    </div>
);

const AgencyCarDetails = () => {
    const location = useLocation();
    const axiosPublic = useAxiosPublic();

    // Local copy of car so UI reflects updates immediately
    const [car, setCar] = useState(location.state?.car ?? null);

    // Status
    const [selectedStatus, setSelectedStatus] = useState(car?.status ?? "");
    const [statusLoading, setStatusLoading] = useState(false);

    // Price dialog
    const [priceOpen, setPriceOpen] = useState(false);
    const [newPrice, setNewPrice] = useState(car?.rental_price ?? "");
    const [priceLoading, setPriceLoading] = useState(false);

    // About dialog
    const [aboutOpen, setAboutOpen] = useState(false);
    const [newAbout, setNewAbout] = useState(car?.about ?? "");
    const [aboutLoading, setAboutLoading] = useState(false);

    if (!car) {
        return (
            <div className="p-6">
                <Link to="/dashboard/agency/vehicles" className="text-primary underline text-sm">
                    ← Back to Vehicles
                </Link>
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <p className="text-5xl mb-4">🚗</p>
                    <p className="text-lg font-semibold text-gray-600">No vehicle data found.</p>
                    <p className="text-sm mt-1">Please go back and select a vehicle.</p>
                </div>
            </div>
        );
    }

    const image = Array.isArray(car.images) ? car.images[0] : car.images;

    /* ── Status update ── */
    const handleStatusUpdate = async () => {
        setStatusLoading(true);
        try {
            await axiosPublic.patch(`carRoutes/updateCarInfo/${car.car_id}`, { status: selectedStatus });
            setCar(prev => ({ ...prev, status: selectedStatus }));
            toast.success("Status updated successfully.");
        } catch {
            toast.error("Failed to update status. Please try again.");
        } finally {
            setStatusLoading(false);
        }
    };

    /* ── Price update ── */
    const handlePriceSave = async () => {
        const parsed = parseFloat(newPrice);
        if (!newPrice || isNaN(parsed) || parsed <= 0) {
            toast.error("Please enter a valid price.");
            return;
        }
        setPriceLoading(true);
        try {
            console.log(`Updating price for car ${car.car_id}: ${parsed}`);
            await axiosPublic.patch(`carRoutes/updateCarInfo/${car.car_id}`, { rental_price: parsed });
            setCar(prev => ({ ...prev, rental_price: parsed }));
            toast.success("Price updated successfully.");
            setPriceOpen(false);
        } catch {
            toast.error("Failed to update price. Please try again.");
        } finally {
            setPriceLoading(false);
        }
    };

    /* ── About update ── */
    const handleAboutSave = async () => {
        if (!newAbout.trim()) {
            toast.error("About text cannot be empty.");
            return;
        }
        setAboutLoading(true);
        try {
            await axiosPublic.patch(`carRoutes/updateCarInfo/${car.car_id}`, { about: newAbout.trim() });
            setCar(prev => ({ ...prev, about: newAbout.trim() }));
            toast.success("Description updated successfully.");
            setAboutOpen(false);
        } catch {
            toast.error("Failed to update description. Please try again.");
        } finally {
            setAboutLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 pb-12">
            {/* Back link */}
            <Link
                to="/dashboard/agency/vehicles"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6"
            >
                ← Back to Vehicles
            </Link>

            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {car.brand} {car.model}
                    <span className="text-gray-400 font-normal text-lg ml-2">({car.build_year})</span>
                </h1>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[car.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {car.status}
                </span>
                {car.verified && (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                        <FaCheckCircle className="text-xs" /> Verified
                    </span>
                )}
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                {/* ── Left column ── */}
                <div className="lg:col-span-3 space-y-5">
                    {/* Image */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <img
                            src={image}
                            alt={`${car.brand} ${car.model}`}
                            className="w-full aspect-video object-cover"
                        />
                    </div>

                    {/* About */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">About</h2>
                            <button
                                onClick={() => { setNewAbout(car.about ?? ""); setAboutOpen(true); }}
                                className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                            >
                                <FaPencilAlt className="text-xs" /> Edit
                            </button>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {car.about || <span className="text-gray-400 italic">No description yet.</span>}
                        </p>
                    </div>

                    {/* Specifications */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Specifications</h2>
                        <SpecRow label="Car ID" value={car.car_id} />
                        <SpecRow label="Brand" value={car.brand} />
                        <SpecRow label="Model" value={car.model} />
                        <SpecRow label="Build Year" value={car.build_year} />
                        <SpecRow label="Type" value={car.car_type} />
                        <SpecRow label="Fuel" value={car.fuel} />
                        <SpecRow label="Transmission" value={car.transmission_type} />
                        <SpecRow label="Gear" value={car.gear} />
                        <SpecRow label="Seats" value={car.seats} />
                        <SpecRow label="Mileage" value={car.mileage ? `${car.mileage} km/l` : null} />
                    </div>
                </div>

                {/* ── Right column ── */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Status update */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Vehicle Status</h2>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={selectedStatus}
                                label="Status"
                                onChange={e => setSelectedStatus(e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#F58300" },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#F58300" },
                                }}
                            >
                                {STATUS_OPTIONS.map(s => (
                                    <MenuItem key={s} value={s}>
                                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[s] ?? "bg-gray-100 text-gray-600"}`}>
                                            {s}
                                        </span>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {selectedStatus !== car.status && (
                            <Button
                                onClick={handleStatusUpdate}
                                disabled={statusLoading}
                                variant="contained"
                                fullWidth
                                sx={{ ...btnSx, mt: 3 }}
                            >
                                {statusLoading ? "Updating..." : "Update Status"}
                            </Button>
                        )}
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Pricing & Rating</h2>
                            <button
                                onClick={() => { setNewPrice(car.rental_price); setPriceOpen(true); }}
                                className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                            >
                                <FaPencilAlt className="text-xs" /> Edit
                            </button>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                            <p className="text-xs text-gray-500 mb-1">Rental Price</p>
                            <p className="text-primary text-3xl font-extrabold">
                                ৳{car.rental_price}
                                <span className="text-gray-400 text-base font-normal">/hour</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaStar className="text-yellow-400" />
                            <span className="font-bold text-gray-800 text-lg">
                                {parseFloat(car.rating || 0).toFixed(1)}
                            </span>
                            <span className="text-gray-400 text-sm">
                                ({car.rating_count ?? 0} rating{car.rating_count !== 1 ? "s" : ""} · {car.review_count ?? 0} review{car.review_count !== 1 ? "s" : ""})
                            </span>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Features</h2>
                        <div className="grid grid-cols-2 gap-2">
                            <FeatureChip label="Air Conditioning" active={car.air_conditioning} />
                            <FeatureChip label="GPS" active={car.gps} />
                            <FeatureChip label="Bluetooth" active={car.bluetooth} />
                            <FeatureChip label="Central Locking" active={car.central_locking} />
                        </div>
                    </div>

                    {/* Quick info */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Quick Info</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <BsFuelPumpFill className="text-primary flex-shrink-0" />
                                <span>{car.fuel} · {car.transmission_type}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <PiSeatFill className="text-primary flex-shrink-0" />
                                <span>{car.seats} seats</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <TbManualGearbox className="text-primary flex-shrink-0" />
                                <span>{car.gear}-speed gearbox</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <MdSpeed className="text-primary flex-shrink-0" />
                                <span>{car.mileage} km/l mileage</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <MdCalendarToday className="text-primary flex-shrink-0" />
                                <span>Listed {new Date(car.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                            {car.next_available_at && (
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <TbSteeringWheel className="text-primary flex-shrink-0" />
                                    <span>Next available: {new Date(car.next_available_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Price Dialog ── */}
            <Dialog open={priceOpen} onClose={() => !priceLoading && setPriceOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1.1rem" }}>Update Rental Price</DialogTitle>
                <DialogContent>
                    <p className="text-sm text-gray-500 mb-4 mt-1">Enter the new hourly rental price for this vehicle.</p>
                    <TextField
                        label="Price per hour (৳)"
                        type="number"
                        value={newPrice}
                        onChange={e => setNewPrice(e.target.value)}
                        fullWidth
                        autoFocus
                        inputProps={{ min: 1, step: 1 }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                "&:hover fieldset": { borderColor: "#F58300" },
                                "&.Mui-focused fieldset": { borderColor: "#F58300" },
                            },
                            "& .MuiInputLabel-root.Mui-focused": { color: "#F58300" },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        onClick={() => setPriceOpen(false)}
                        disabled={priceLoading}
                        variant="outlined"
                        sx={{ textTransform: "none", borderColor: "#e5e7eb", color: "#6b7280", "&:hover": { borderColor: "#9ca3af" } }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handlePriceSave} disabled={priceLoading} variant="contained" sx={btnSx}>
                        {priceLoading ? "Saving..." : "Save Price"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── About Dialog ── */}
            <Dialog open={aboutOpen} onClose={() => !aboutLoading && setAboutOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1.1rem" }}>Update Description</DialogTitle>
                <DialogContent>
                    <p className="text-sm text-gray-500 mb-4 mt-1">Describe this vehicle for potential renters.</p>
                    <TextField
                        label="About"
                        value={newAbout}
                        onChange={e => setNewAbout(e.target.value)}
                        fullWidth
                        multiline
                        rows={5}
                        autoFocus
                        inputProps={{ maxLength: 500 }}
                        helperText={`${newAbout.length}/500`}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                "&:hover fieldset": { borderColor: "#F58300" },
                                "&.Mui-focused fieldset": { borderColor: "#F58300" },
                            },
                            "& .MuiInputLabel-root.Mui-focused": { color: "#F58300" },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        onClick={() => setAboutOpen(false)}
                        disabled={aboutLoading}
                        variant="outlined"
                        sx={{ textTransform: "none", borderColor: "#e5e7eb", color: "#6b7280", "&:hover": { borderColor: "#9ca3af" } }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleAboutSave} disabled={aboutLoading} variant="contained" sx={btnSx}>
                        {aboutLoading ? "Saving..." : "Save Description"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AgencyCarDetails;
