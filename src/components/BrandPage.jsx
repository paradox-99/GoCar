import { useParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from "../hooks/useAxiosPublic";
import { Skeleton } from "@mui/material";
import { Helmet } from "react-helmet-async";
import Cart from "./Cart/Cart";

const BrandPage = () => {

     const { brandName } = useParams();
     const axiosPublic = useAxiosPublic();

     const { data, error, isPending } = useQuery({
          queryKey: ['brand'],
          queryFn: async () => {
               console.log("request sent....");
               const response = await axiosPublic.get(`/carRoutes/carByBrand/${brandName}`);
               return response.data;
          },
     })

     console.log(data);
     
     if (isPending) {
          return <div className="flex flex-col justify-center items-center gap-4 h-[80vh]">
               <Skeleton variant="rectangular" animation="wave" width={400} height={120}></Skeleton>
               <Skeleton variant="rectangular" animation="wave" width={400} height={120}></Skeleton>
               <Skeleton variant="rectangular" animation="wave" width={400} height={120}></Skeleton>
          </div>
     }

     return (
          <div className="px-4 md:px-10 pt-28">
               <Helmet>
                    <title>{brandName} Cars</title>
               </Helmet>
               <h1 className="text-5xl text-center font-merriweather font-bold mb-5">{brandName} Cars</h1>
               {
                    data?.length === 0 ? <div className="w-full h-[30vh] text-2xl font-nunito flex items-center justify-center">Sorry. No car found.</div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-10 justify-items-center">
                         {
                              data?.map((car) => (<Cart
                                   key={car.vehicle_id}
                                   car={car}
                              ></Cart>))
                         }
                    </div>
               }
          </div>
     );
};

export default BrandPage;