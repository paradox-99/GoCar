import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
    Button, FormGroup, FormControlLabel, Checkbox,
    Radio, RadioGroup, FormControl, Skeleton, Box, Drawer, IconButton
} from "@mui/material";
import {
    FaSearch, FaFilter, FaStar, FaShieldAlt,
    FaCreditCard, FaUndo, FaHeadset, FaMapMarkerAlt, FaCar
} from "react-icons/fa";
import { MdClose } from "react-icons/md";
import Cart from "../../components/Cart/Cart";
import AddressSearch from "../../components/address/AddressSearch";
import DateTime from "../../components/dateTime/DateTime";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import toast from "react-hot-toast";

const VEHICLE_TYPES = ["Car", "Bike"];
const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
const SORT_OPTIONS = [
    { value: "default", label: "Default" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "rating-desc", label: "Top Rated" },
];

const BrowseCars = () => {
    const location = useLocation();
    const axiosPublic = useAxiosPublic();
    const params = new URLSearchParams(location.search);
    const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_KEY || '';

    // Search state
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [time, setTime] = useState(null);
    const [lat, setLat] = useState(params.get("lat"));
    const [lon, setLon] = useState(params.get("lon"));
    const [fromTs, setFromTs] = useState(params.get("fromTs"));
    const [untilTs, setUntilTs] = useState(params.get("untilTs"));
    const [displayName, setDisplayName] = useState(params.get("location") || "");

    // Data state
    const [allCars, setAllCars] = useState([]);
    const [isPending, setIsPending] = useState(false);

    // Filter state
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedFuels, setSelectedFuels] = useState([]);
    const [maxPrice, setMaxPrice] = useState(5000);
    const [minSeats, setMinSeats] = useState(0);
    const [minRating, setMinRating] = useState(0);
    const [availableOnly, setAvailableOnly] = useState(false);
    const [sortBy, setSortBy] = useState("default");

    useEffect(() => {
        const fetchCars = async () => {
            setIsPending(true);
            try {
                if (lat && lon && fromTs && untilTs) {
                    const res = await axiosPublic.get('/carRoutes/getSearchData', {
                        params: { fromTs, untilTs, lat, lon }
                    });
                    setAllCars(Array.isArray(res.data) ? res.data : []);
                } else {
                    const res = await axiosPublic.get('/carRoutes/getAllCars');
                    setAllCars(Array.isArray(res.data) ? res.data : []);
                }
            } catch {
                setAllCars([]);
            } finally {
                setIsPending(false);
            }
        };
        fetchCars();
    }, [lat, lon, fromTs, untilTs, axiosPublic]);

    const handleSearch = () => {
        if (!selectedPlace) {
            toast.error("Please select a pickup location.");
            return;
        }
        if (!time || !time.fromTs || !time.untilTs) {
            toast.error("Please select booking dates and times.");
            return;
        }
        setFromTs(time.fromTs);
        setUntilTs(time.untilTs);
        setLat(selectedPlace.lat);
        setLon(selectedPlace.lon);
        setDisplayName(selectedPlace.display_name);
    };

    const toggleCheckbox = (arr, setArr, val) => {
        setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
    };

    const filteredAndSorted = useMemo(() => {
        let results = [...allCars];
        if (availableOnly) results = results.filter(c => c.status === "Available");
        if (selectedTypes.length) results = results.filter(c =>
            selectedTypes.some(t =>
                c.vehicle_type?.toLowerCase() === t.toLowerCase() ||
                c.car_type?.toLowerCase() === t.toLowerCase()
            )
        );
        if (selectedFuels.length) results = results.filter(c =>
            selectedFuels.some(f => c.fuel?.toLowerCase() === f.toLowerCase())
        );
        if (minSeats > 0) results = results.filter(c => (c.seats || 0) >= minSeats);
        if (minRating > 0) results = results.filter(c => parseFloat(c.rating || 0) >= minRating);
        results = results.filter(c => (c.rental_price || 0) <= maxPrice);

        if (sortBy === "price-asc") results.sort((a, b) => (a.rental_price || 0) - (b.rental_price || 0));
        else if (sortBy === "price-desc") results.sort((a, b) => (b.rental_price || 0) - (a.rental_price || 0));
        else if (sortBy === "rating-desc") results.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));

        return results;
    }, [allCars, selectedTypes, selectedFuels, maxPrice, minSeats, minRating, availableOnly, sortBy]);

    const resetFilters = () => {
        setSelectedTypes([]);
        setSelectedFuels([]);
        setMaxPrice(5000);
        setMinSeats(0);
        setMinRating(0);
        setAvailableOnly(false);
        setSortBy("default");
    };

    const checkboxSx = { color: '#F58300', '&.Mui-checked': { color: '#F58300' } };
    const radioSx = { color: '#F58300', '&.Mui-checked': { color: '#F58300' } };

    const FilterPanel = () => (
        <div className="space-y-6 text-sm">
            {/* Sort */}
            <div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Sort By</h3>
                <FormControl>
                    <RadioGroup value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        {SORT_OPTIONS.map(s => (
                            <FormControlLabel key={s.value} value={s.value}
                                control={<Radio size="small" sx={radioSx} />}
                                label={<span className="text-sm">{s.label}</span>} />
                        ))}
                    </RadioGroup>
                </FormControl>
            </div>

            <hr />

            {/* Availability */}
            <div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Availability</h3>
                <FormControlLabel
                    control={<Checkbox checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} size="small" sx={checkboxSx} />}
                    label={<span className="text-sm">Available Now</span>}
                />
            </div>

            <hr />


            {/* Vehicle Type */}
            <div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Vehicle Type</h3>
                <FormGroup>
                    {VEHICLE_TYPES.map(t => (
                        <FormControlLabel key={t}
                            control={<Checkbox checked={selectedTypes.includes(t)} onChange={() => toggleCheckbox(selectedTypes, setSelectedTypes, t)} size="small" sx={checkboxSx} />}
                            label={<span className="text-sm">{t}</span>} />
                    ))}
                </FormGroup>
            </div>

            <hr />

            {/* Seats */}
            <div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Min Seats</h3>
                <FormControl>
                    <RadioGroup value={minSeats} onChange={e => setMinSeats(Number(e.target.value))} row>
                        {[0, 4, 5, 7, 8].map(n => (
                            <FormControlLabel key={n} value={n}
                                control={<Radio size="small" sx={radioSx} />}
                                label={<span className="text-xs">{n === 0 ? "Any" : `${n}+`}</span>} />
                        ))}
                    </RadioGroup>
                </FormControl>
            </div>

            <hr />

            {/* Fuel */}
            <div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Fuel Type</h3>
                <FormGroup>
                    {FUEL_TYPES.map(f => (
                        <FormControlLabel key={f}
                            control={<Checkbox checked={selectedFuels.includes(f)} onChange={() => toggleCheckbox(selectedFuels, setSelectedFuels, f)} size="small" sx={checkboxSx} />}
                            label={<span className="text-sm">{f}</span>} />
                    ))}
                </FormGroup>
            </div>

            <hr />

            {/* Rating */}
            <div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Min Rating</h3>
                <FormControl>
                    <RadioGroup value={minRating} onChange={e => setMinRating(Number(e.target.value))} row>
                        {[0, 3, 4, 4.5].map(r => (
                            <FormControlLabel key={r} value={r}
                                control={<Radio size="small" sx={radioSx} />}
                                label={
                                    <span className="text-xs flex items-center gap-0.5">
                                        {r === 0 ? "Any" : <>{r}<FaStar className="text-yellow-400" /></>}
                                    </span>
                                } />
                        ))}
                    </RadioGroup>
                </FormControl>
            </div>

            <Button onClick={resetFilters} variant="outlined" fullWidth
                sx={{ borderColor: '#F58300', color: '#F58300', textTransform: 'none', fontWeight: 600, mt: 1 }}>
                Reset All Filters
            </Button>
        </div>
    );

    return (
        <div className="pt-16">
            <Helmet>
                <title>Browse Cars | GoCar</title>
            </Helmet>

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-16 pb-10 px-4">
                <div className="max-w-[1360px] mx-auto text-center">
                    <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Discover & Book</p>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Find Your Perfect Ride</h1>
                    <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                        Search from hundreds of verified cars across Bangladesh. Compare, choose and book in minutes.
                    </p>
                    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl max-w-4xl mx-auto">
                        <div className="flex flex-col lg:flex-row gap-4 items-end">
                            <div className="flex-1 text-left">
                                <p className="text-gray-700 font-semibold text-sm mb-3 flex items-center gap-1">
                                    <FaMapMarkerAlt className="text-primary" /> Pickup Location
                                </p>
                                <AddressSearch
                                    onSelect={setSelectedPlace}
                                    apiKey={LOCATIONIQ_KEY}
                                    provider={LOCATIONIQ_KEY ? 'locationiq' : 'nominatim'}
                                    placeholder="e.g. Dhanmondi, Dhaka"
                                    defaultValue={displayName}
                                />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-gray-700 font-semibold text-sm mb-1">Pickup &amp; Return Dates</p>
                                <DateTime getTime={setTime} time={{ fromTs, untilTs }} dis={false} />
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="contained"
                        startIcon={<FaSearch />}
                        onClick={handleSearch}
                        sx={{
                            backgroundColor: '#F58300', width: 'fit-content', color: '#fff', fontWeight: 700, mt: 2,
                            textTransform: 'none', px: 10, py: 1.75, borderRadius: '10px',
                            fontSize: '16px', whiteSpace: 'nowrap',
                            '&:hover': { backgroundColor: '#e07500' }
                        }}
                    >
                        Search Cars
                    </Button>
                </div>
            </div>

            {/* Trust Strip */}
            <div className="bg-orange-50 border-b border-orange-100 py-4">
                <div className="max-w-[1360px] mx-auto flex flex-wrap justify-center gap-6 px-4">
                    {[
                        { icon: <FaShieldAlt className="text-primary" />, text: "Verified Agencies" },
                        { icon: <FaCreditCard className="text-primary" />, text: "Secure Payment" },
                        { icon: <FaUndo className="text-primary" />, text: "Free Cancellation" },
                        { icon: <FaHeadset className="text-primary" />, text: "24/7 Support" },
                    ].map(({ icon, text }) => (
                        <div key={text} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            {icon} {text}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1360px] mx-auto px-4 py-8">
                {/* Mobile filter toggle */}
                <div className="flex justify-between items-center mb-4 lg:hidden">
                    <p className="text-gray-700 font-semibold">
                        {isPending ? "Loading..." : `${filteredAndSorted.length} cars found`}
                    </p>
                    <Button
                        variant="outlined"
                        startIcon={<FaFilter />}
                        onClick={() => setFilterDrawerOpen(true)}
                        sx={{ borderColor: '#F58300', color: '#F58300', textTransform: 'none', fontWeight: 600 }}
                    >
                        Filters
                    </Button>
                </div>

                {/* Mobile filter drawer */}
                <Drawer anchor="left" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)}>
                    <Box sx={{ width: 300, p: 3 }}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Filters</h2>
                            <IconButton onClick={() => setFilterDrawerOpen(false)}>
                                <MdClose />
                            </IconButton>
                        </div>
                        {FilterPanel()}
                    </Box>
                </Drawer>

                <div className="flex gap-6">
                    {/* Desktop filter sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-28 bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-h-[calc(100vh-8rem)] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-gray-800">Filters</h2>
                                <button onClick={resetFilters} className="text-primary text-xs font-semibold hover:underline">
                                    Reset all
                                </button>
                            </div>
                            {FilterPanel()}
                        </div>
                    </aside>

                    {/* Results area */}
                    <main className="flex-1 min-w-0">
                        {/* Results count - desktop */}
                        <div className="hidden lg:flex justify-between items-center mb-6">
                            <p className="text-gray-700 font-semibold">
                                {isPending ? "Searching..." : `${filteredAndSorted.length} car${filteredAndSorted.length !== 1 ? 's' : ''} found`}
                            </p>
                        </div>

                        {/* Skeleton loading */}
                        {isPending && (
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
                                        <Skeleton variant="rectangular" sx={{ aspectRatio: '16/9', width: '100%' }} />
                                        <div className="p-4">
                                            <Skeleton height={24} width="60%" />
                                            <Skeleton height={18} width="80%" sx={{ mt: 1 }} />
                                            <Skeleton height={22} width="40%" sx={{ mt: 1 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Car grid */}
                        {!isPending && filteredAndSorted.length > 0 && (
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredAndSorted.map(car => (
                                    <Cart
                                        key={car.car_id || car.vehicle_id || car._id}
                                        car={car}
                                        carBookingInfo={{ fromTs, untilTs, lat, lon }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!isPending && filteredAndSorted.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <FaCar className="text-7xl text-gray-200 mb-5" />
                                <h3 className="text-2xl font-bold text-gray-700 mb-2">No cars found</h3>
                                <p className="text-gray-500 mb-6 max-w-md">
                                    {allCars.length > 0
                                        ? "No cars match your current filters. Try adjusting or resetting them."
                                        : "Enter a location and dates above to discover available cars near you."}
                                </p>
                                {allCars.length > 0 && (
                                    <Button onClick={resetFilters} variant="contained"
                                        sx={{ backgroundColor: '#F58300', textTransform: 'none', fontWeight: 700, px: 4, '&:hover': { backgroundColor: '#e07500' } }}>
                                        Reset Filters
                                    </Button>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default BrowseCars;
