import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FcList, FcViewDetails } from "react-icons/fc";
import Slider from 'react-slick';
import { Link, useLocation, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { PiSeatFill } from "react-icons/pi";
import build from "../assets/icons/transport.png";
import fuel from "../assets/icons/gas-pump.png";
import transmission from "../assets/icons/manual-transmission.png"
import gear from "../assets/icons/shift-stick.png";
import mileage from "../assets/icons/fast.png";
import { FaCircleDot } from "react-icons/fa6";
import fuel_capacity from "../assets/icons/fuel-station.png";
import engine_capacity from "../assets/icons/piston.png";

const ViewDetails = () => {

    const { name } = useParams();
    const [car, setCar] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const axiosPublic = useAxiosPublic();
    const location = useLocation();
    const { carBookingInfo } = location?.state || {};

    // Extract vehicle_id from the name parameter (format: "brand_model")
    const getVehicleIdFromName = (name) => {
        // You may need to adjust this based on how your backend identifies cars
        return name;
    };

    const isCar = name.includes("CAR");

    useEffect(() => {
        const fetchCarAndReviews = async () => {
            setIsLoading(true);
            setLoading(true);
            try {
                const vehicleIdentifier = getVehicleIdFromName(name);
                
                // Fetch car details
                const carResponse = await axiosPublic.get(`/carRoutes/getCarDetails/${vehicleIdentifier}`);
                setCar(carResponse.data);
                
                // Fetch reviews and ratings for this car
                const reviewResponse = await axiosPublic.get(`/carRoutes/getCarReviews/${vehicleIdentifier}`);
                setReviews(reviewResponse.data);
                
                setIsLoading(false);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching car details or reviews:', error);
                setIsLoading(false);
                setLoading(false);
            }
        };

        const fetchBikeAndReviews = async () => {
            setIsLoading(true);
            setLoading(true);
            try {
                const vehicleIdentifier = getVehicleIdFromName(name);
                
                // Fetch car details
                const bikeResponse = await axiosPublic.get(`/bikeRoutes/getBikeDetails/${vehicleIdentifier}`);
                setCar(bikeResponse.data);
                
                // Fetch reviews and ratings for this car
                const reviewResponse = await axiosPublic.get(`/bikeRoutes/getBikeReviews/${vehicleIdentifier}`);
                setReviews(reviewResponse.data);
                
                setIsLoading(false);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching car details or reviews:', error);
                setIsLoading(false);
                setLoading(false);
            }
        };

        if (name) {
            isCar ? fetchCarAndReviews() : fetchBikeAndReviews();
        }
    }, [name, axiosPublic]);

    const bookingData = {
        carBookingInfo,
        car,
    }

    const handleAddToFavorites = (carId) => {
        const existingFavorites = JSON.parse(localStorage.getItem('favorites')) || [];

        if (!existingFavorites.includes(carId)) {
            existingFavorites.push(carId);
            localStorage.setItem('favorites', JSON.stringify(existingFavorites));
            toast.success("Added to Favorites");
        } else {
            toast("Already in Favorites");
        }
    };
    

    return (
        <div className="pt-28 max-w-[1360px] mx-auto lg:px-6">
            <Helmet>
                <title>{car?.brand && car?.model ? `${car.brand} ${car.model} - GoCar` : 'Car Details - GoCar'}</title>
            </Helmet>
            {/* Skeleton Loader */}
            {isLoading ? (
                <div className="animate-pulse flex flex-col md:flex-row gap-8">
                    Loading...
                </div>
            ) : (
                <div className="flex flex-col gap-5 lg:flex-row">
                    {/* Image Section */}
                    <div className="mx-auto lg:w-[580px] px-6 md:px-6 lg:px-0 flex-grow">
                        <div className="image-container rounded-lg overflow-hidden">
                            <img className="lg:w-[580px] w-full h-[400px]" src={car?.images?.[0]} alt={`${car?.brand} ${car?.model}`} />
                        </div>
                        <div className="flex gap-3 mt-12">
                            <button
                                onClick={() => handleAddToFavorites(car?.vehicle_id)}
                                className="h-[50px] md:h-[60px] w-1/2 text-[14px] md:text-[16px] bg-black font-semibold text-white rounded-lg hover:bg-gray-800 transition">
                                ♥ Add to Favorite
                            </button>
                            <Link to={'/booking-info'} state={{bookingData}} className="h-[50px] md:h-[60px] w-1/2 text-[14px] md:text-[16px] font-semibold bg-primary text-white rounded-lg flex justify-center items-center hover:bg-orange-600 transition">
                                Rent Now
                            </Link>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="p-6 lg:mt-0 lg:w-1/2">
                        <div className="mb-6">
                            <h2 className="text-4xl font-bold mb-2">{car?.brand} <span>{car?.model}</span></h2>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${i < Math.round(car?.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.897c.969 0 1.371 1.24.588 1.81l-3.96 2.881a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.96-2.881a1 1 0 00-1.176 0l-3.96 2.881c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L.845 9.102c-.783-.57-.38-1.81.588-1.81h4.897a1 1 0 00.95-.69l1.518-4.674z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600 mt-2">{car?.rating} ({car?.rating_count} reviews)</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">Vehicle Type: <span className="font-semibold text-primary">{car?.car_type}</span></p>
                        </div>

                        <div className="mb-6 p-4 bg-[#FFEEE9] rounded-lg">
                            <h3 className="text-2xl font-bold text-primary mb-2">৳ {car?.rental_price} <span className="text-sm text-gray-600">/hour</span></h3>
                            <p className="text-xs text-gray-600">Available from: {new Date(car?.next_available_at).toLocaleDateString()}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-lg mb-3">Agency Information</h3>
                            <p className="text-sm mb-2"><span className="font-semibold">Agency:</span> {car?.agency_name}</p>
                            <p className="text-sm mb-2"><span className="font-semibold">Email:</span> {car?.email}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                            <div className="flex flex-col items-center py-3 px-3 border border-gray-300 rounded-lg">
                                <img src={build} alt="" className="w-6 mb-1" />
                                <span className="text-xs text-gray-600">Build Year</span>
                                <span className="font-semibold">{car?.build_year}</span>
                            </div>
                            <div className="flex flex-col items-center py-3 px-3 border border-gray-300 rounded-lg">
                                <img src={fuel} alt="" className="w-6 mb-1" />
                                <span className="text-xs text-gray-600">Fuel</span>
                                <span className="font-semibold">{car?.fuel}</span>
                            </div>
                            
                            {isCar ? (
                                <>
                                    <div className="flex flex-col items-center py-3 px-3 border border-gray-300 rounded-lg">
                                        <PiSeatFill className="text-primary text-2xl mb-1" />
                                        <span className="text-xs text-gray-600">Seats</span>
                                        <span className="font-semibold">{car?.seats}</span>
                                    </div>
                                    <div className="flex flex-col items-center py-3 px-3 border border-gray-300 rounded-lg">
                                        <img src={transmission} alt="" className="w-6 mb-1" />
                                        <span className="text-xs text-gray-600">Transmission</span>
                                        <span className="font-semibold">{car?.transmission_type}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-col items-center py-3 px-3 border border-gray-300 rounded-lg">
                                        <img src={fuel_capacity} alt="" className="w-6 mb-1" />
                                        <span className="text-xs text-gray-600">Fuel Capacity</span>
                                        <span className="font-semibold">{car?.fuel_capacity} L</span>
                                    </div>
                                    <div className="flex flex-col items-center py-3 px-3 border border-gray-300 rounded-lg">
                                        <img src={engine_capacity} alt="" className="w-6 mb-1" />
                                        <span className="text-xs text-gray-600">Engine Capacity</span>
                                        <span className="font-semibold">{car?.engine_capacity} cc</span>
                                    </div>
                                </>
                            )}
                            
                            <div className="flex flex-col items-center py-3 px-3 border border-gray-300 rounded-lg">
                                <img src={gear} alt="" className="w-6 mb-1" />
                                <span className="text-xs text-gray-600">Gear</span>
                                <span className="font-semibold">{car?.gear}</span>
                            </div>
                            <div className="flex flex-col items-center py-3 px-3 border border-gray-300 rounded-lg">
                                <img src={mileage} alt="" className="w-6 mb-1" />
                                <span className="text-xs text-gray-600">Mileage</span>
                                <span className="font-semibold text-sm">{car?.mileage}</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="font-semibold mb-2">About this vehicle</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{car?.about}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Additional Information Section */}
            <div className="mt-16 px-6 lg:px-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {isCar ? (
                        <>
                            {/* Car Features */}
                            <div className="p-6 border border-gray-200 rounded-lg">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <FcList className="text-2xl" />
                                    Available Features
                                </h2>
                                <ul className="list-none space-y-3">
                                    <li className="flex items-center gap-3">
                                        <FaCircleDot className={`text-xs ${car?.air_conditioning ? 'text-green-500' : 'text-gray-300'}`} />
                                        <span>Air Conditioning: <span className="font-semibold">{car?.air_conditioning ? 'Yes' : 'No'}</span></span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <FaCircleDot className={`text-xs ${car?.gps ? 'text-green-500' : 'text-gray-300'}`} />
                                        <span>GPS Navigation: <span className="font-semibold">{car?.gps ? 'Yes' : 'No'}</span></span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <FaCircleDot className={`text-xs ${car?.bluetooth ? 'text-green-500' : 'text-gray-300'}`} />
                                        <span>Bluetooth: <span className="font-semibold">{car?.bluetooth ? 'Yes' : 'No'}</span></span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <FaCircleDot className={`text-xs ${car?.central_locking ? 'text-green-500' : 'text-gray-300'}`} />
                                        <span>Central Locking: <span className="font-semibold">{car?.central_locking ? 'Yes' : 'No'}</span></span>
                                    </li>
                                </ul>
                            </div>

                            {/* Vehicle Info */}
                            <div className="p-6 border border-gray-200 rounded-lg">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <FcViewDetails className="text-2xl" />
                                    Vehicle Information
                                </h2>
                                <ul className="list-none space-y-3">
                                    <li className="flex items-center gap-3">
                                        <FaCircleDot className="text-primary text-xs" />
                                        <span>Brand: <span className="font-semibold">{car?.brand}</span></span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <FaCircleDot className="text-primary text-xs" />
                                        <span>Model: <span className="font-semibold">{car?.model}</span></span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <FaCircleDot className="text-primary text-xs" />
                                        <span>Vehicle Type: <span className="font-semibold">{car?.car_type}</span></span>
                                    </li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Bike Safety Features */}
                            <div className="p-6 border border-gray-200 rounded-lg">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <FcList className="text-2xl" />
                                    Safety Features
                                </h2>
                                <ul className="list-none space-y-3">
                                    <li className="flex items-center gap-3">
                                        <FaCircleDot className={`text-xs ${car?.abs ? 'text-green-500' : 'text-gray-300'}`} />
                                        <span>ABS (Anti-lock Braking System): <span className="font-semibold">{car?.abs ? 'Yes' : 'No'}</span></span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <FaCircleDot className={`text-xs ${car?.disk_brake ? 'text-green-500' : 'text-gray-300'}`} />
                                        <span>Disk Brake: <span className="font-semibold">{car?.disk_brake ? 'Yes' : 'No'}</span></span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <FaCircleDot className="text-primary text-xs" />
                                        <span>Engine Start Type: <span className="font-semibold">{car?.engine_start_type}</span></span>
                                    </li>
                                </ul>
                            </div>

                            {/* Bike Information */}
                            <div className="p-6 border border-gray-200 rounded-lg">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <FcViewDetails className="text-2xl" />
                                    Bike Information
                                </h2>
                                <ul className="list-none space-y-3">
                                    <li className="flex items-center gap-3">
                                        <FaCircleDot className="text-primary text-xs" />
                                        <span>Brand: <span className="font-semibold">{car?.brand}</span></span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <FaCircleDot className="text-primary text-xs" />
                                        <span>Model: <span className="font-semibold">{car?.model}</span></span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <FaCircleDot className="text-primary text-xs" />
                                        <span>Helmet Count: <span className="font-semibold">{car?.helmet_count}</span></span>
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>

                {/* Reviews Section */}
                <div className='mt-12'>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className='text-3xl font-bold'>Customer Reviews</h2>
                        <span className="text-sm text-gray-600">({car?.review_count} total reviews)</span>
                    </div>
                    <hr className="mb-8" />
                    
                    <div className='mt-8'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                            {loading ? (
                                // Skeleton loader
                                Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className='p-6 bg-gray-50 animate-pulse rounded-lg'>
                                        <div className="flex justify-between mb-4">
                                            <div className="flex gap-3 flex-1">
                                                <div className='w-10 h-10 bg-gray-300 rounded-full'></div>
                                                <div className="flex-1">
                                                    <div className='w-24 h-4 bg-gray-300 rounded mb-2'></div>
                                                    <div className='w-16 h-3 bg-gray-200 rounded'></div>
                                                </div>
                                            </div>
                                            <div className='flex gap-1'>
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <div key={i} className='w-4 h-4 bg-gray-300 rounded'></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className='w-full h-12 bg-gray-200 rounded'></div>
                                    </div>
                                ))
                            ) : reviews.length === 0 ? (
                                <p className="col-span-2 text-center text-gray-500 py-8">No reviews yet. Be the first to review!</p>
                            ) : (
                                reviews?.map((review, index) => (
                                    <div key={index} className='p-6 bg-gray-50 rounded-lg border border-gray-200'>
                                        <div className="flex justify-between mb-4">
                                            <div className="flex gap-3">
                                                <img
                                                    src={review.photo}
                                                    alt={review.name}
                                                    className='w-10 h-10 rounded-full object-cover border border-primary'
                                                />
                                                <div>
                                                    <p className='font-semibold text-sm'>{review.name}</p>
                                                    <p className='text-xs text-gray-500'>{new Date(review.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className='flex gap-1'>
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.897c.969 0 1.371 1.24.588 1.81l-3.96 2.881a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.96-2.881a1 1 0 00-1.176 0l-3.96 2.881c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L.845 9.102c-.783-.57-.38-1.81.588-1.81h4.897a1 1 0 00.95-.69l1.518-4.674z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>
                                        <p className='text-sm text-gray-700 leading-relaxed'>{review.review}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewDetails;
