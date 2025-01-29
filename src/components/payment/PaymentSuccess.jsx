import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { useParams } from "react-router-dom";
import success from "../../assets/images/credit-card.png"
import { PropagateLoader } from "react-spinners";
import { Button } from "@mui/material";

const PaymentSuccess = () => {

     const axiosPublic = useAxiosPublic();
     const { tran_id } = useParams();

     const { data, isPending } = useQuery({
          queryKey: ["payment-success"],
          queryFn: async () => {
               const response = await axiosPublic.get(`paymentRoutes/getPaymentInfo/${tran_id}`);
               return response.data[0];
          }
     })

     if (isPending) {
          return <div className="w-full h-screen flex justify-center items-center">
               <PropagateLoader
                    color="#F58300"
                    speedMultiplier={1}
               />
          </div>
     }

     const dateTime = data?.tran_date.split(" ")

     return (
          <div className="pt-20">
               <div className="flex flex-col justify-center items-center">
                    <img src={success} alt="" className="w-36" />
                    <h1 className="text-4xl font-bold">Payment Successful</h1>
               </div>
               <div className="flex justify-center mt-10">
                    <div className="bg-background w-[65%] p-10 flex justify-between items-center text-[#757575]">
                         <div className="space-y-3">
                              <h3 className="text-lg"><span className="font-bold">Paid amount:</span> ৳ {data?.amount}</h3>
                              <h3 className="text-lg"><span className="font-bold">Bank transaction id:</span> {data?.bank_tran_id}</h3>
                              <h3 className="text-lg"><span className="font-bold">Payment date:</span> {dateTime[0]}</h3>
                         </div>
                         <div className="space-y-3">
                              <h3 className="text-lg"><span className="font-bold">Payment method:</span> {data?.bank_gw}</h3>
                              <h3 className="text-lg"><span className="font-bold">Transaction id:</span> {data?.tran_id}</h3>
                              <h3 className="text-lg"><span className="font-bold">Payment time:</span> {dateTime[1]}</h3>
                         </div>
                    </div>
               </div>
               <div className="flex justify-center gap-10 mt-10">
                    <Button variant="contained" href="/" sx={{background: '#f58300'}}>Home page</Button>
                    <Button variant="contained" href="/dashboard/user/bookings" sx={{background: '#f58300'}}>View Bookings</Button>
               </div>
          </div>
     );
};

export default PaymentSuccess;