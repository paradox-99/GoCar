import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { Skeleton } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import Cart from "../../components/Cart/Cart";
import { HiMapPin, HiEnvelope, HiPhone, HiCreditCard, HiCog6Tooth, HiCheckCircle, HiStar } from "react-icons/hi2";

const ViewAgencyDetails = () => {

    const { id } = useParams();
    const axiosPublic = useAxiosPublic();
    const [carData, setCarData] = useState([]);

    const { data, isPending } = useQuery({
        queryKey: ['agency', id],
        queryFn: async () => {
            const response = await axiosPublic.get(`agencyRoutes/getAgencyDetails/${id}`);
            return response.data;
        }
    })

    useEffect(() => {
        const getCars = async () => {
            const response = await axiosPublic.get(`carRoutes/showAgencyCars/${id}`);
            setCarData(response.data);
        }
        getCars();
    }, [id, axiosPublic])

    if (isPending) {
        return <div className="pt-20 max-w-[1360px] mx-4 md:mx-8 xl:mx-auto">
            <Skeleton variant="rectangular" animation="wave" width="100%" height={300}></Skeleton>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" animation="wave" width="100%" height={250}></Skeleton>
                ))}
            </div>
        </div>
    }

    const totalVehicles = (data?.cars || 0) + (data?.bikes || 0);
    const ratingValue = parseFloat(data?.rating || 0);

    return (
        <>
            <Helmet>
                <title>{data?.agency_name || 'Agency Details'} | goCar</title>
            </Helmet>

            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary to-orange-600 text-white pt-20 pb-8">
                <div className="max-w-[1360px] mx-4 md:mx-8 xl:mx-auto">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl md:text-5xl font-bold">{data?.agency_name}</h1>
                                {data?.verified && (
                                    <HiCheckCircle className="w-8 h-8 text-green-300" title="Verified Agency" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-3 py-1 bg-green-500 rounded-full text-sm font-semibold">
                                    {data?.status}
                                </span>
                            </div>
                            <p className="text-orange-100 mt-4">{data?.display_name}</p>
                        </div>
                        {ratingValue > 0 && (
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-2 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <HiStar
                                            key={i}
                                            className={`w-5 h-5 ${
                                                i < Math.floor(ratingValue)
                                                    ? 'text-yellow-300'
                                                    : 'text-orange-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-orange-100 text-sm">{ratingValue}/5 ({data?.review_count || 0} reviews)</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-12 pb-20 max-w-[1360px] mx-4 md:mx-8 xl:mx-auto">
                
                {/* Agency Info Section */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 md:p-12">
                        {/* Agency Image */}
                        <div className="lg:col-span-1 flex flex-col items-center">
                            <div className="w-full max-w-xs">
                                <div className="w-full h-64 rounded-lg shadow-md bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                                    <span className="text-5xl">🏢</span>
                                </div>
                            </div>
                        </div>

                        {/* Agency Details */}
                        <div className="lg:col-span-2">
                            {/* Basic Info */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Agency Name */}
                                    <div className="flex gap-4">
                                        <HiCog6Tooth className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-600 font-semibold">AGENCY NAME</p>
                                            <p className="text-lg text-gray-900 font-medium">{data?.agency_name}</p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex gap-4">
                                        <HiEnvelope className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-600 font-semibold">EMAIL</p>
                                            <p className="text-lg text-gray-900 font-medium">{data?.email}</p>
                                        </div>
                                    </div>

                                    {/* TIN */}
                                    <div className="flex gap-4">
                                        <HiCreditCard className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-600 font-semibold">TIN</p>
                                            <p className="text-lg text-gray-900 font-medium">{data?.tin || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex gap-4">
                                        <HiPhone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-600 font-semibold">PHONE</p>
                                            <p className="text-lg text-gray-900 font-medium">{data?.phone_number}</p>
                                        </div>
                                    </div>

                                    {/* Total Vehicles */}
                                    <div className="flex gap-4">
                                        <HiCog6Tooth className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-600 font-semibold">VEHICLES</p>
                                            <p className="text-lg text-gray-900 font-medium">
                                                {data?.cars} Cars {data?.bikes > 0 ? `+ ${data?.bikes} Bikes` : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="pt-8 border-t border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Address</h3>
                                <div className="flex gap-4">
                                    <HiMapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-gray-700 font-medium">
                                            {data?.display_name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cars Section */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">
                        Available Vehicles ({totalVehicles})
                    </h2>
                    
                    {carData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {carData.map(car => (
                                <Cart
                                    key={car.vehicle_id}
                                    car={car}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-gray-600 text-lg">No vehicles available at this agency yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ViewAgencyDetails;