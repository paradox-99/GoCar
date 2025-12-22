import { Skeleton, Stack, TextField, Tabs, Tab, Box, Button } from "@mui/material";
import { FaSearch } from "react-icons/fa";
import Cart from "../../components/Cart/Cart";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { useState, useEffect } from "react";
import DateTime from "../../components/dateTime/DateTime";
import { FaEdit } from "react-icons/fa";
import AddressSearch from "../../components/address/AddressSearch";
import toast from "react-hot-toast";

const SearchPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const axiosPublic = useAxiosPublic();

    const [lat, setLat] = useState(params.get("lat"));
    const [lon, setLon] = useState(params.get("lon"));
    const [placeID, setPlaceID] = useState(params.get("place_id"));
    const [fromTs, setFromTs] = useState(params.get("fromTs"));
    const [untilTs, setUntilTs] = useState(params.get("untilTs"));
    const [display_name, setDisplay_name] = useState(params.get("location"));
    const [time, setTime] = useState();
    const [carBookingInfo, setCarBookingInfo] = useState(null);
    const [edit, setEdit] = useState(false);
    const [cars, setCars] = useState([]);
    const [selected, setSelected] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_KEY || '';

    const timeValues = { fromTs, untilTs };

    // Set edit to true if coming from map select page
    useEffect(() => {
        if (params.get("fromMapSelect") === "true") {
            setEdit(true);
        }
    }, []);

    // Update URL whenever search parameters change
    useEffect(() => {
        if (lat && lon && fromTs && untilTs) {
            const searchParams = new URLSearchParams();
            searchParams.set('lat', lat);
            searchParams.set('lon', lon);
            searchParams.set('location', display_name);
            searchParams.set('fromTs', fromTs);
            searchParams.set('untilTs', untilTs);
            if (placeID) searchParams.set('place_id', placeID);
            
            // Update URL without full page reload
            window.history.replaceState({}, '', `/search/queries?${searchParams.toString()}`);
        }
    }, [lat, lon, fromTs, untilTs, display_name, placeID]);

    useEffect(() => {
        const fetchCars = async () => {
            setIsPending(true);
            try {
                const filterData = {
                    fromTs, untilTs, lat, lon, placeID
                };
                console.log(filterData);

                const response = await axiosPublic.get('carRoutes/getSearchData', { params: filterData });
                console.log(response);

                const bookingInfo = {
                    fromTs: fromTs,
                    untilTs: untilTs
                }
                setCarBookingInfo(bookingInfo)
                setCars(response.data)
            } catch (error) {
                console.error('Error fetching cars:', error);
            } finally {
                setIsPending(false);
            }
        };

        if (fromTs && untilTs && lat && lon) {
            fetchCars();
        }
    }, [fromTs, untilTs, lat, lon, placeID, axiosPublic]);

    const getTime = (timeAndDate) => {
        setTime(timeAndDate)
    }

    const searchPage = async () => {

        if (time) {
            setFromTs(time.fromTs);
            setUntilTs(time.untilTs);
            setLat(selected.lat);
            setLon(selected.lon);
            setDisplay_name(selected.display_name);
            setPlaceID(selected.raw.place_id);
        }

        if (!time || !fromTs || !untilTs) {
            toast.error("Please select booking date and time.");
            return;
        }

        const filterData = {
            fromTs,
            untilTs,
            lat,
            lon,
            placeID
        };
        const response = await axiosPublic.get('/carRoutes/getSearchData', { params: filterData });
        setCars(response.data);
    }

    function handleSelectPlace(place) {
        setSelected(place);
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const filteredCars = Array.isArray(cars) ? cars.filter(car => {
        if (tabValue === 0) return car.vehicle_type === 'Car';
        if (tabValue === 1) return car.vehicle_type === 'Bike';
        return true;
    }) : [];

    return (
        <div className="pt-28 w-full">
            <div className="mb-10 w-full flex gap-5 flex-col min-[1220px]:flex-row justify-center items-center">
                <div className="">
                    <p className="font-nunito lg:mb-4 font-semibold text-lg text-center md:text-left">Location</p>
                    <div className="flex gap-4 lg:items-center w-full">
                        {
                            !edit && <>
                                <TextField size="medium" value={display_name} label="District" sx={{ width: '500px' }} disabled></TextField>
                            </>
                        }
                        {
                            edit &&
                            <AddressSearch
                                onSelect={handleSelectPlace}
                                apiKey={LOCATIONIQ_KEY}
                                provider={LOCATIONIQ_KEY ? 'locationiq' : 'nominatim'}
                                placeholder="Search pickup location, e.g., Dhanmondi, Dhaka"
                                defaultValue={display_name}
                            />
                        }
                    </div>
                </div>
                <div>
                    <h3 className="font-nunito lg:mb-2 font-semibold text-lg text-center md:text-left">Booking Date</h3>
                    <DateTime getTime={getTime} time={timeValues} dis={edit ? false : true}></DateTime>
                </div>
                <div className=" min-[1222px]:mt-10">
                    {
                        !edit &&
                        <Button
                            variant="contained"
                            startIcon={<FaEdit />}
                            onClick={() => setEdit(true)}
                            sx={{
                                backgroundColor: '#ff802c',
                                color: '#fff',
                                fontFamily: 'Nunito',
                                fontWeight: 600,
                                textTransform: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                '&:hover': {
                                    backgroundColor: '#e67e1f',
                                }
                            }}
                        >
                            Edit
                        </Button>
                    }
                    {
                        edit &&
                        <Button
                            variant="contained"
                            startIcon={<FaSearch />}
                            onClick={searchPage}
                            sx={{
                                backgroundColor: '#ff802c',
                                color: '#fff',
                                fontFamily: 'Nunito',
                                fontWeight: 600,
                                textTransform: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                '&:hover': {
                                    backgroundColor: '#e67e1f',
                                }
                            }}
                        >
                            Search
                        </Button>
                    }
                </div>
            </div>
            <h1 className="text-5xl font-bold font-nunito text-center mt-10 md:mt-16 lg:mt-20">Search Results</h1>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center', my: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Cars" />
                    <Tab label="Bikes" />
                </Tabs>
            </Box>

            <div className="w-full flex gap-5 justify-center items-center flex-wrap my-8 md:my-12">
                {
                    isPending ? Array.from({ length: 3 }).map((_, index) => (
                        <Stack spacing={2} key={index}>
                            {/* For variant="text", adjust the height via font-size */}
                            <Skeleton variant="text" sx={{ fontSize: '2rem' }} />
                            {/* For other variants, adjust the size with `width` and `height` */}
                            <Skeleton variant="circular" width={60} height={60} />
                            <Skeleton variant="rectangular" width={300} height={80} />
                            <Skeleton variant="rounded" width={300} height={80} />
                        </Stack>
                    ))
                        :
                        filteredCars?.map(car => <Cart
                            key={car.vehicle_id}
                            car={car}
                            carBookingInfo={carBookingInfo}
                        ></Cart>)
                }
            </div>
        </div>
    );
};

export default SearchPage;