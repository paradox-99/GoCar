import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { Skeleton, TextField, InputAdornment } from "@mui/material";
import AgencyCard from "./AgencyCard";
import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { HiMagnifyingGlass } from "react-icons/hi2";

const Agencies = () => {
     const axiosPublic = useAxiosPublic();
     const [visibleItems, setVisibleItems] = useState(6);
     const [searchTerm, setSearchTerm] = useState("");

     const { data, isPending } = useQuery({
          queryKey: ['agencies'],
          queryFn: async () => {
               const response = await axiosPublic.get('/agencyRoutes/getAllAgency');
               return response.data;
          }
     });

     const filteredAgencies = useMemo(() => {
          if (!data) return [];
          return data.filter(agency => 
               agency.agency_name.toLowerCase().includes(searchTerm.toLowerCase())
          );
     }, [data, searchTerm]);

     const stats = useMemo(() => {
          if (!data || data.length === 0) return { totalVehicles: 0, avgRating: 0 };
          
          const totalVehicles = data.reduce((acc, agency) => 
               acc + (Number(agency.cars) || 0) + (Number(agency.bikes) || 0), 0);
          
          const agenciesWithRating = data.filter(a => a.rating > 0);
          const avgRating = agenciesWithRating.length > 0
               ? (agenciesWithRating.reduce((acc, a) => acc + Number(a.rating), 0) / agenciesWithRating.length).toFixed(1)
               : "N/A";

          return { totalVehicles, avgRating };
     }, [data]);

     if (isPending) {
          return (
               <div className="pt-28 max-w-[1360px] mx-4 md:mx-8 xl:mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {[...Array(6)].map((_, i) => (
                              <div key={i} className="bg-white rounded-xl shadow-md p-4 space-y-4">
                                   <Skeleton variant="rectangular" height={192} className="rounded-lg" />
                                   <Skeleton variant="text" width="60%" height={32} />
                                   <Skeleton variant="text" width="40%" height={20} />
                                   <div className="space-y-2 py-4 border-y border-gray-100">
                                        <div className="flex gap-2">
                                             <Skeleton variant="circular" width={20} height={20} />
                                             <Skeleton variant="text" width="70%" />
                                        </div>
                                        <div className="flex gap-2">
                                             <Skeleton variant="circular" width={20} height={20} />
                                             <Skeleton variant="text" width="50%" />
                                        </div>
                                   </div>
                                   <Skeleton variant="rectangular" height={40} className="rounded-lg" />
                              </div>
                         ))}
                    </div>
               </div>
          );
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
                    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 text-white overflow-hidden relative">
                         {/* Subtle Background Elements */}
                         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 uppercase"></div>
                         <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                         <div className="max-w-[1360px] mx-4 md:mx-8 xl:mx-auto text-center relative z-10">
                              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-outfit">
                                   Trusted Agency Partners
                              </h1>
                              <p className="text-gray-400 text-lg max-w-2xl text-center mx-auto leading-relaxed">
                                   Explore our verified network of professional car rental agencies across Bangladesh. 
                                   Each agency is carefully vetted to ensure quality vehicles and excellent service.
                              </p>
                         </div>
                    </div>

                    {/* Content Section */}
                    <div className="max-w-[1360px] mx-4 md:mx-8 xl:mx-auto pt-16">
                         {/* Stats & Search */}
                         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12 items-end">
                              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                                   <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                        <p className="text-3xl font-bold text-primary mb-1">{data?.length || 0}</p>
                                        <p className="text-gray-600 font-medium">Verified Agencies</p>
                                   </div>
                                   <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                        <p className="text-3xl font-bold text-primary mb-1">
                                             {stats.totalVehicles}
                                        </p>
                                        <p className="text-gray-600 font-medium">Total Vehicles</p>
                                   </div>
                                   <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                        <p className="text-3xl font-bold text-primary mb-1">{stats.avgRating}{stats.avgRating !== "N/A" ? "/5" : ""}</p>
                                        <p className="text-gray-600 font-medium">Average Rating</p>
                                   </div>
                              </div>

                              <div className="w-full">
                                   <TextField
                                        fullWidth
                                        placeholder="Search by agency..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        variant="outlined"
                                        InputProps={{
                                             startAdornment: (
                                                  <InputAdornment position="start">
                                                       <HiMagnifyingGlass className="text-gray-400 w-5 h-5" />
                                                  </InputAdornment>
                                             ),
                                        }}
                                        sx={{
                                             '& .MuiOutlinedInput-root': {
                                                  borderRadius: '12px',
                                                  backgroundColor: 'white',
                                                  '&:hover fieldset': { borderColor: '#F58300' },
                                                  '&.Mui-focused fieldset': { borderColor: '#F58300' },
                                             }
                                        }}
                                   />
                              </div>
                         </div>

                         {/* Agencies Grid */}
                         {filteredAgencies.length > 0 ? (
                              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                                   {
                                        filteredAgencies.slice(0, visibleItems).map(agency => (
                                             <AgencyCard
                                                  key={agency?.agency_id}
                                                  agency={agency}
                                             />
                                        ))
                                   }
                              </div>
                         ) : (
                              <div className="py-20 text-center">
                                   <div className="mb-4 flex justify-center">
                                        <div className="p-4 bg-gray-50 rounded-full">
                                             <HiMagnifyingGlass className="w-12 h-12 text-gray-300" />
                                        </div>
                                   </div>
                                   <h3 className="text-xl font-bold text-gray-700">No agencies found</h3>
                                   <p className="text-gray-500 mb-6">Try adjusting your search term to find what you're looking for.</p>
                                   <button 
                                        onClick={() => setSearchTerm("")}
                                        className="text-primary font-bold hover:underline"
                                   >
                                        Clear search
                                   </button>
                              </div>
                         )}

                         {/* See More Button */}
                         {visibleItems < filteredAgencies.length && (
                              <div className="flex justify-center mt-16">
                                   <button
                                        onClick={handleSeeMore}
                                        className="px-10 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-primary/25 transition-all active:scale-95"
                                   >
                                        Load More Agencies
                                   </button>
                              </div>
                         )}

                         {/* No More Items */}
                         {visibleItems >= filteredAgencies.length && filteredAgencies.length > 0 && (
                              <div className="flex justify-center mt-12">
                                   <p className="text-gray-500 font-medium bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
                                        Showing all {filteredAgencies.length} agencies
                                   </p>
                              </div>
                         )}
                    </div>
               </div>
          </>
     );
};

export default Agencies;