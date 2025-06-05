import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { Helmet } from 'react-helmet-async';
import useAxiosPublic from '../../hooks/useAxiosPublic';

const FavouriteCars = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const axiosPublic = useAxiosPublic()

    useEffect(() => {
        const fetchFavouriteCars = async () => {
            try {
                const storedCarIds = JSON.parse(localStorage.getItem('favorites')) || [];
                if (storedCarIds.length > 0) {
                    const response = await axiosPublic.get('carRoutes/getCartCars', { params: storedCarIds });
                    setCars(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch favorite cars:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavouriteCars();
    }, []);

    const removeCarFromFavorites = (carId) => {
        const storedCarIds = JSON.parse(localStorage.getItem('favorites')) || [];
        const updatedCarIds = storedCarIds.filter(id => id !== carId);

        localStorage.setItem('favorites', JSON.stringify(updatedCarIds));
        setCars(cars.filter(car => car.vehicle_id !== carId));
    };

    const clearAllFavorites = () => {
        localStorage.removeItem('favorites');
        setCars([]);
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <h2 className="text-3xl font-semibold mb-6">Favourite Cars</h2>
                {/* loader */}
                <div className="space-y-6">
                    {[1, 2, 3].map((index) => (
                        <div key={index} className="flex bg-gray-200 animate-pulse rounded-lg overflow-hidden h-44">
                            <div className="w-1/3 bg-gray-300"></div>
                            <div className="w-2/3 p-6 flex flex-col justify-center space-y-4">
                                <div className="w-1/2 h-6 bg-gray-300"></div>
                                <div className="w-full h-4 bg-gray-300"></div>
                                <div className="w-3/4 h-4 bg-gray-300"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 relative">
            <Helmet>
                <title>Favorite Cars</title>
            </Helmet>
            <h2 className="text-3xl font-semibold mb-6">Favourite Cars</h2>
            <button
                onClick={clearAllFavorites}
                className="absolute top-6 right-6 bg-primary text-white px-4 py-2 rounded "
            >
                Clear All
            </button>

            {cars ? (
                <div className="space-y-6">
                    {cars.map((car) => (
                        <div
                            key={car.vehicle_id}
                            style={{ boxShadow: '0 20px 50px #FEF2F2' }}
                            className="flex bg-white group rounded overflow-hidden relative"
                        >

                            <AiOutlineCloseCircle
                                onClick={() => removeCarFromFavorites(car.vehicle_id)}
                                className="absolute top-2 right-2 text-primary cursor-pointer"
                                size={24}
                            />

                            <div className="flex items-center relative justify-center ml-10 w-1/3">
                                <span className="absolute -left-10 top-1 z-[1] px-2 py-1 rounded text-white bg-primary">{car.brand}</span>
                                <img
                                    className="rounded-lg group-hover:scale-105 transform duration-500 object-cover"
                                    src={car.photo}
                                    alt={car.model}
                                />
                            </div>

                            <div className="w-2/3 flex justify-between p-10">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">{car.brand} {car.model} ({car.build_year})</h3>
                                    <div className="grid grid-cols-2 text-sm gap-2">
                                        <p><strong>Seats:</strong> {car.seats}</p>
                                        <p><strong>Fuel:</strong> {car.fuel}</p>
                                        <p><strong>Transmission:</strong> {car.transmission_type}</p>
                                        <p><strong>Mileage:</strong> {car.mileage}</p>
                                        <p><strong>Gear:</strong> {car.gear}</p>
                                        <p><strong>Model:</strong> {car.model}</p>
                                    </div>

                                    <div className="mt-4">
                                        <h4 className="text-lg font-semibold">Additional Features:</h4>
                                        <ul className="list-disc list-inside text-sm">
                                            {car.air_conditioning && <li>Air Conditioning</li>}
                                            {car.gps && <li>GPS</li>}
                                            {car.bluetooth && <li>Bluetooth</li>}
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 justify-center items-center mt-4">
                                    <div>
                                        <p className="text-lg text-center w-[150px] font-bold">
                                            Daily rate from <span className="text-2xl">${car.rental_price}</span>
                                        </p>
                                    </div>
                                    <button className="bg-primary text-sm font-bold text-white px-4 py-2 rounded">
                                        <Link className='text-sm' to={`/view-details/${car.vehicle_id}`}>View Details</Link>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='h-screen flex justify-center items-center'>
                    <p className='text-xl text-gray-500'>You did not add any cars to favorites</p>
                </div>
            )}
        </div>
    );
};

export default FavouriteCars;
