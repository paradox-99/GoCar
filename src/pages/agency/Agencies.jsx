import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { Button, Skeleton } from "@mui/material";
import AgencyCard from "./AgencyCard";
import { useState } from "react";

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
          return <div className="flex justify-center items-center gap-10 h-[80vh]">
               <Skeleton variant="rectangular" animation="wave" width={400} height={400}></Skeleton>
               <Skeleton variant="rectangular" animation="wave" width={400} height={400}></Skeleton>
               <Skeleton variant="rectangular" animation="wave" width={400} height={400}></Skeleton>
          </div>
     }

     const handleSeeMore = () => {
          setVisibleItems((prev) => prev + 6); // Show 10 more items
     };

     return (
          <div className="pt-28 max-w-[1360px] mx-4 md:mx-8 xl:mx-auto">
               <h1 className="text-5xl font-semibold text-center mb-8">Agencies</h1>
               <div className='flex justify-center flex-wrap gap-5'>

                    {
                         data.slice(0, visibleItems)?.map(agency => <AgencyCard
                              key={agency?._id}
                              agency={agency}
                         ></AgencyCard>)
                    }
               </div>
               <div className="flex justify-center mt-14">
                    <Button onClick={handleSeeMore} variant="contained" sx={{ background: "#f58300" }}>See more</Button>
               </div>
          </div>
     );
};

export default Agencies;