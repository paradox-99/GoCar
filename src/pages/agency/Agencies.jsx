import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { Skeleton } from "@mui/material";
import AgencyCard from "./AgencyCard";

const Agencies = () => {

     const axiosPublic = useAxiosPublic();

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

     return (
          <div className='flex flex-wrap gap-5 pt-28 max-w-[1360px] mx-4 md:mx-8 xl:mx-auto'>
            {
                data?.map(agency => <AgencyCard
                    key={agency?._id}
                    agency={agency}
                ></AgencyCard>)
            }
        </div>
     );
};

export default Agencies;