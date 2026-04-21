import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAuth from '../../hooks/useAuth';

const FavouriteCars = () => {
    const axiosPublic = useAxiosPublic();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [dbUserId, setDbUserId] = useState(null);
    const [removing, setRemoving] = useState(null); // carId being removed

    // Fetch DB user to get userId
    useEffect(() => {
        if (!user?.email) return;
        axiosPublic
            .get(`userRoute/getUserInfo/${user.email}`)
            .then(res => {
                const u = res.data?.[0];
                setDbUserId(u?.user_id || u?._id || null);
            })
            .catch(() => {});
    }, [user, axiosPublic]);

    // Fetch favourites from DB
    const { data: cars = [], isLoading } = useQuery({
        queryKey: ['favouriteCars', dbUserId],
        queryFn: async () => {
            const res = await axiosPublic.get(`carRoutes/getFavourites/${dbUserId}`);
            return res.data;
        },
        enabled: !!dbUserId,
    });

    const removeCarFromFavourites = async (carId) => {
        if (!dbUserId) return;
        setRemoving(carId);
        try {
            await axiosPublic.delete('carRoutes/removeFavourite', {
                data: { userId: dbUserId, carId },
            });
            queryClient.invalidateQueries(['favouriteCars', dbUserId]);
            // Also invalidate dashboard stats so favourite_count updates
            queryClient.invalidateQueries(['dashboard-stats']);
            toast.success('Removed from favourites');
        } catch {
            toast.error('Failed to remove');
        } finally {
            setRemoving(null);
        }
    };

    const clearAllFavourites = async () => {
        if (!dbUserId || cars.length === 0) return;
        try {
            await axiosPublic.delete(`carRoutes/clearFavourites/${dbUserId}`);
            queryClient.invalidateQueries(['favouriteCars', dbUserId]);
            queryClient.invalidateQueries(['dashboard-stats']);
            toast.success('All favourites cleared');
        } catch {
            toast.error('Failed to clear favourites');
        }
    };

    if (isLoading || !dbUserId) {
        return (
            <div className="container mx-auto p-6">
                <h2 className="text-3xl font-semibold mb-6">Favourite Cars</h2>
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex bg-gray-200 animate-pulse rounded-lg overflow-hidden h-44">
                            <div className="w-1/3 bg-gray-300" />
                            <div className="w-2/3 p-6 flex flex-col justify-center space-y-4">
                                <div className="w-1/2 h-6 bg-gray-300" />
                                <div className="w-full h-4 bg-gray-300" />
                                <div className="w-3/4 h-4 bg-gray-300" />
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
                <title>Favourite Cars — GoCar</title>
            </Helmet>
            <h2 className="text-3xl font-semibold mb-6">Favourite Cars</h2>

            {cars.length > 0 && (
                <button
                    onClick={clearAllFavourites}
                    className="absolute top-6 right-6 bg-primary text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                >
                    Clear All
                </button>
            )}

            {cars.length === 0 ? (
                <div className="h-[60vh] flex flex-col justify-center items-center gap-4 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <p className="text-xl">You haven&apos;t saved any favourite cars yet.</p>
                    <Link to="/search" className="bg-primary text-white px-6 py-2 rounded hover:bg-orange-600 transition text-sm font-semibold">
                        Browse Cars
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {cars.map(car => (
                        <div
                            key={car.car_id}
                            style={{ boxShadow: '0 20px 50px #FEF2F2' }}
                            className="flex bg-white group rounded overflow-hidden relative"
                        >
                            {/* Remove button */}
                            <button
                                onClick={() => removeCarFromFavourites(car.car_id)}
                                disabled={removing === car.car_id}
                                className="absolute top-2 right-2 text-primary z-10"
                            >
                                <AiOutlineCloseCircle
                                    className={`cursor-pointer transition ${removing === car.car_id ? 'opacity-40' : 'hover:text-red-600'}`}
                                    size={24}
                                />
                            </button>

                            {/* Image */}
                            <div className="flex items-center relative justify-center ml-10 w-1/3">
                                <span className="absolute -left-10 top-1 z-[1] px-2 py-1 rounded text-white bg-primary">
                                    {car.brand}
                                </span>
                                <img
                                    className="rounded-lg group-hover:scale-105 transform duration-500 object-cover max-h-44 w-full"
                                    src={car.images?.[0]}
                                    alt={`${car.brand} ${car.model}`}
                                />
                            </div>

                            {/* Info */}
                            <div className="w-2/3 flex justify-between p-10">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">
                                        {car.brand} {car.model} ({car.build_year})
                                    </h3>
                                    <div className="grid grid-cols-2 text-sm gap-2">
                                        <p><strong>Seats:</strong> {car.seats}</p>
                                        <p><strong>Fuel:</strong> {car.fuel}</p>
                                        <p><strong>Transmission:</strong> {car.transmission_type}</p>
                                        <p><strong>Mileage:</strong> {car.mileage}</p>
                                        <p><strong>Gear:</strong> {car.gear}</p>
                                        <p><strong>Model:</strong> {car.model}</p>
                                    </div>

                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-gray-600 mb-1">Features:</h4>
                                        <ul className="list-disc list-inside text-sm">
                                            {car.air_conditioning && <li>Air Conditioning</li>}
                                            {car.gps && <li>GPS</li>}
                                            {car.bluetooth && <li>Bluetooth</li>}
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 justify-center items-center">
                                    <p className="text-lg text-center w-[150px] font-bold">
                                        From <span className="text-2xl text-primary">৳{car.rental_price}</span>
                                        <span className="text-xs text-gray-500"> /hr</span>
                                    </p>
                                    <Link
                                        to={`/details/${car.car_id}`}
                                        className="bg-primary text-sm font-bold text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavouriteCars;
