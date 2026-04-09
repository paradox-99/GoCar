import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';
import { Skeleton, Pagination } from '@mui/material';
import { useState } from 'react';
import useRole from '../../hooks/useRole';
import Cart from '../../components/Cart/Cart';

const ITEMS_PER_PAGE = 8;

const AgencyCars = () => {
    const axiosPublic = useAxiosPublic();
    const role = useRole();
    const [page, setPage] = useState(1);

    const { data } = useQuery({
        queryKey: ['agencyCars', role?.user_id],
        queryFn: async () => {
            const response = await axiosPublic.get(`carRoutes/showAgencyCars/${role?.user_id}`, { withCredentials: true });
            return response.data;
        },
        enabled: !!role?.user_id,
    });

    const totalPages = Math.ceil((data?.length || 0) / ITEMS_PER_PAGE);
    const paginated = data?.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE) || [];

    return (
        <div className="px-4 pb-12">
            <div className="flex items-center justify-between mt-8 mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
                {data && (
                    <span className="text-sm text-gray-500">
                        {data.length} vehicle{data.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Loading skeletons */}
            {!data && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                        <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
                            <Skeleton variant="rectangular" sx={{ aspectRatio: '16/9', width: '100%' }} />
                            <div className="p-4">
                                <Skeleton height={22} width="65%" />
                                <Skeleton height={16} width="40%" sx={{ mt: 0.5 }} />
                                <Skeleton height={18} width="85%" sx={{ mt: 1.5 }} />
                                <Skeleton height={22} width="45%" sx={{ mt: 1.5 }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {data?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400">
                    <p className="text-5xl mb-4">🚗</p>
                    <p className="text-lg font-semibold text-gray-600">No vehicles listed yet</p>
                    <p className="text-sm mt-1">Add your first car to start receiving bookings.</p>
                </div>
            )}

            {/* Card grid */}
            {paginated.length > 0 && (
                <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {paginated.map(car => (
                            <Cart
                                key={car.car_id}
                                car={car}
                                to={`/dashboard/agency/vehicles/${car.car_id}`}
                                state={{ car }}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, value) => { setPage(value); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                sx={{
                                    '& .MuiPaginationItem-root.Mui-selected': {
                                        backgroundColor: '#F58300',
                                        color: '#fff',
                                        '&:hover': { backgroundColor: '#e07500' },
                                    },
                                }}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AgencyCars;
