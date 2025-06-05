import { IconButton, Skeleton, Stack, TextField } from "@mui/material";
import { FaSearch } from "react-icons/fa";
import Cart from "../../components/Cart/Cart";
import { useLocation } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DateTime from "../../components/dateTime/DateTime";
import Address from "../../components/address/Address";
import { FaEdit } from "react-icons/fa";

const SearchPage = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const axiosPublic = useAxiosPublic();

    const [district, setDistrict] = useState(params.get("district"));
    const [upazilla, setUpazilla] = useState(params.get("upazilla"));
    const [keyArea, setKeyArea] = useState(params.get("keyArea"));
    const [fromDate, setFromDate] = useState(params.get("fromDate"));
    const [fromTime, setFromTime] = useState(params.get("fromTime"));
    const [untilDate, setUntilDate] = useState(params.get("untilDate"));
    const [untilTime, setUntilTime] = useState(params.get("untilTime"));
    const [address, setAddress] = useState();
    const [time, setTime] = useState();
    const [carBookingInfo, setCarBookingInfo] = useState(null);
    const [edit, setEdit] = useState(false);
    const [cars, setCars] = useState('');

    const timeValues = { fromDate, fromTime, untilDate, untilTime };

    const { isPending } = useQuery({
        queryKey: ['cars'],
        queryFn: async () => {
            const filterData = {
                fromDate,
                fromTime,
                untilDate,
                untilTime,
                district,
                upazilla,
                keyArea
            };
            const response = await axiosPublic.get('carRoutes/getSearchData', { params: filterData });
            const bookingInfo = {
                fromDate: fromDate,
                fromTime: fromTime,
                toDate: untilDate,
                toTime: untilTime
            }
            setCarBookingInfo(bookingInfo)
            setCars(response.data)
            return response.data;
        },
    })

    const getAddress = (address) => {
        setAddress(address);
    }
    const getTime = (timeAndDate) => {
        setTime(timeAndDate)
    }



    const searchPage = async () => {
        setDistrict(address.district);
        setUpazilla(address.upazilla);
        setKeyArea(address.area);
        if (time) {
            setFromDate(time.fromDate);
            setFromTime(time.fromTime);
            setUntilDate(time.untilDate);
            setUntilTime(time.untilTime);
        }
        console.log("called");

        const filterData = {
            fromDate,
            fromTime,
            untilDate,
            untilTime,
            district,
            upazilla,
            keyArea
        };
        const response = await axiosPublic.get('/carRoutes/getSearchData', { params: filterData });
        setCars(response.data);
    }

    return (
        <div className="pt-28 w-full">
            <div className="mb-10 w-full flex gap-5 flex-col min-[1220px]:flex-row justify-center items-center">
                <div className="">
                    <p className="font-nunito lg:mb-4 font-semibold text-lg text-center md:text-left">Location</p>
                    <div className="flex gap-4 lg:items-center w-full">
                        {
                            !edit && <>
                                <TextField size="small" value={district} label="District"></TextField>
                                <TextField size="small" value={upazilla} label="Upazilla"></TextField>
                                {
                                    keyArea &&
                                    <TextField size="small" value={keyArea} label="Area"></TextField>
                                }
                            </>
                        }
                        {
                            edit && <div className="-mt-2"><Address getAddress={getAddress}></Address></div>
                        }
                    </div>
                </div>
                <div>
                    <h3 className="font-nunito lg:mb-2 font-semibold text-lg text-center md:text-left">Booking Date</h3>
                    <DateTime getTime={getTime} time={timeValues}></DateTime>
                </div>
                <div className=" min-[1222px]:mt-10">
                    {
                        !edit &&
                        <IconButton onClick={() => setEdit(true)}>
                            <FaEdit className="w-5 md:w-7" />
                        </IconButton>
                    }
                    {
                        edit &&
                        <IconButton onClick={searchPage}>
                            <FaSearch className="w-5 md:w-7 text-black" />
                        </IconButton>
                    }
                </div>
            </div>
            <h1 className="text-5xl font-bold font-nunito text-center mt-10 md:mt-16 lg:mt-20">Search Results</h1>
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
                    )) :
                        cars?.map(car => <Cart
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