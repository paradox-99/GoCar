import { Button } from "@mui/material";
import Address from "../../components/address/Address";
import { useState } from "react";
import { TimePicker } from "@mui/x-date-pickers";
import DateTime from "../../components/dateTime/DateTime";

const Banner = () => {

     const [address, setAddress] = useState();
     const [time, setTime] = useState();

     const getAddress = (address) => {
          setAddress(address);
     }

     const getTime = (timeAndDate) => {
          setTime(timeAndDate)
     }

     return (
          <div className="bg-[#ececec] h-[83vh] bg-[url('/banner_image.png')] bg-right-top bg-contain bg-no-repeat pl-20 flex flex-wrap items-stretch gap-14">
               <div className="self-end">
                    <h1 className="text-[54px] font-medium">Drive Your Way, Anytime, Anywhere</h1>
                    <p className="text-xl mt-2">Affordable Car Rentals Made Simple - Explore, Book, and Go!</p>
                    <Button variant="contained" sx={{ mt: 5, background: '#F58300', color: 'white' }}>Start Booking</Button>
               </div>
               <div className="max-w-[80vw] self-end mb-16">
                    <div className="flex gap-3">
                         <div>
                              <h3 className="font-semibold">Location</h3>
                              <Address getAddress={getAddress}></Address>
                         </div>
                         <div>
                              <h3 className="font-semibold">Booking Date</h3>
                              <DateTime getTime={getTime}></DateTime>
                         </div>
                    </div>
                    <Button variant="contained" sx={{ mt: 2, background: '#F58300', color: 'white' }}>Search</Button>
               </div>

          </div>
     );
};

export default Banner;