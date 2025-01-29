import { Button } from "@mui/material";
import fail from "../../assets/images/payment.png"

const PaymentFail = () => {
     return (
          <div className="h-screen flex flex-col justify-center items-center">
               <img src={fail} alt="" className="w-40"/>
               <h1 className="text-4xl font-bold">Sorry, payment failed..</h1>
               <div className="flex justify-center gap-10 mt-20">
                    <Button variant="contained" href="/" sx={{background: '#f58300'}}>Home page</Button>
                    <Button variant="contained" href="/donation" sx={{background: '#f58300'}}>Donation page</Button>
               </div>
          </div>
     );
};

export default PaymentFail;