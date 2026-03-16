import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { Skeleton } from "@mui/material";
import AgencyCard from "./AgencyCard";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

const Agencies = () => {

     const axiosPublic = useAxiosPublic();
     const [visibleItems, setVisibleItems] = useState(6);

     const { data, isPending } = useQuery({
          queryKey: ['agencies'],
          queryFn: async () => {
               const response = await axiosPublic.get('agencyRoutes/getAllAgencyData');
               return response.data;
          }
     })

     if (isPending) {
          return <div className="pt-28 max-w-[1360px] mx-4 md:mx-8 xl:mx-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                         <Skeleton key={i} variant="rectangular" animation="wave" width="100%" height={350}></Skeleton>
                    ))}
               </div>
          </div>
     }

     const handleSeeMore = () => {
          setVisibleItems((prev) => prev + 6);
     };

     return (
          <>
               <Helmet>
                    <title>Agencies | goCar</title>
               </Helmet>
               <div className="pt-20 pb-20">
                    {/* Header Section */}
                    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 text-white">
                         <div className="max-w-[1360px] mx-4 md:mx-8 xl:mx-auto text-center">
                              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                   Trusted Agency Partners
                              </h1>
                              <p className="text-gray-400 text-lg max-w-2xl text-center mx-auto">
                                   Explore our verified network of professional car rental agencies across Bangladesh. Each agency is carefully vetted to ensure quality vehicles and excellent service.
                              </p>
                         </div>
                    </div>

                    {/* Content Section */}
                    <div className="max-w-[1360px] mx-4 md:mx-8 xl:mx-auto pt-16">
                         {/* Stats */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                              <div className="bg-orange-50 p-6 rounded-lg text-center">
                                   <p className="text-3xl font-bold text-primary mb-2">{data?.length || 0}</p>
                                   <p className="text-gray-700">Verified Agencies</p>
                              </div>
                              <div className="bg-orange-50 p-6 rounded-lg text-center">
                                   <p className="text-3xl font-bold text-primary mb-2">
                                        {data?.reduce((acc, agency) => acc + (agency.total_vehicles || 0), 0) || 0}
                                   </p>
                                   <p className="text-gray-700">Total Vehicles</p>
                              </div>
                              <div className="bg-orange-50 p-6 rounded-lg text-center">
                                   <p className="text-3xl font-bold text-primary mb-2">4.7/5</p>
                                   <p className="text-gray-700">Average Rating</p>
                              </div>
                         </div>

                         {/* Agencies Grid */}
                         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                              {
                                   data?.slice(0, visibleItems).map(agency => <AgencyCard
                                        key={agency?._id}
                                        agency={agency}
                                   ></AgencyCard>)
                              }
                         </div>

                         {/* See More Button */}
                         {visibleItems < data?.length && (
                              <div className="flex justify-center mt-16">
                                   <button
                                        onClick={handleSeeMore}
                                        className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-300"
                                   >
                                        Load More Agencies
                                   </button>
                              </div>
                         )}

                         {/* No More Items */}
                         {visibleItems >= data?.length && data?.length > 0 && (
                              <div className="flex justify-center mt-12">
                                   <p className="text-gray-600 text-lg">
                                        Showing all {data?.length} agencies
                                   </p>
                              </div>
                         )}
                    </div>
               </div>
          </>
     );
};

export default Agencies;