import { Button } from "@mui/material";
import Address from "../../components/address/Address";
import { useState } from "react";
import DateTime from "../../components/dateTime/DateTime";
import { useNavigate } from "react-router-dom";

const Banner = () => {

     const [address, setAddress] = useState();
     const [time, setTime] = useState();
     const navigate = useNavigate();

     const getAddress = (address) => {
          setAddress(address);
     }

     const getTime = (timeAndDate) => {
          setTime(timeAndDate)
     }

     console.log(address);
     

     const searchPage = () => {
          const district = address.district;
          const upazilla = address.upazilla;
          const keyArea = address.area;
          const fromDate = time.fromDate;
          const fromTime = time.fromTime;
          const untilDate = time.untilDate;
          const untilTime = time.untilTime;
          
          const location = new URLSearchParams({ district: district, upazilla: upazilla, keyArea: keyArea});
          const date = new URLSearchParams({fromDate: fromDate, fromTime: fromTime, untilDate: untilDate, untilTime: untilTime});
          navigate(`/search/queries?${location}&${date}`)
      }
     

     return (
          <div className="bg-[#ececec] md:h-[85vh] lg:h-[83vh] py-10 md:py-0  bg-[url('/banner_image.png')] md:bg-[url('/banner_image2.png')] lg:bg-[url('/banner_image.png')] bg-right-top bg-contain md:bg-auto lg:bg-contain bg-no-repeat pl-3 md:pl-8 xl:pl-20 flex flex-col justify-center md:gap-5 lg:gap-10 xl:gap-14">
               <div>
                    <h1 className="text-2xl md:text-4xl lg:text-[42px] lg:leading-[42px] xl:text-[54px] xl:leading-[54px] font-medium w-[250px] md:w-[400px] lg:w-[450px] xl:w-full">Drive Your Way, Anytime, Anywhere</h1>
                    <p className="lg:text-lg xl:text-xl mt-2 w-[250px] md:w-[400px] lg:w-full">Affordable Car Rentals Made Simple - Explore, Book, and Go!</p>
                    <div className="flex md:hidden">
                         <Button variant="contained" size="small" sx={{ mt: { xs: 3 }, background: '#F58300', color: 'white' }}>Start Booking</Button>
                    </div>
                    <div className="hidden md:flex">
                         <Button variant="contained" sx={{ mt: { xs: 3, lg: 5 }, background: '#F58300', color: 'white' }}>Start Booking</Button>
                    </div>
               </div>
               <div className="mt-10 md:mt-5 flex flex-col items-center md:items-start">
                    <div className="flex flex-col xl:flex-row gap-7 md:gap-3 max-w-[65vw] md:max-w-[72vw] lg:max-w-[54vw] xl:max-w-[80vw]">
                         <div>
                              <h3 className="font-semibold text-center md:text-left">Location</h3>
                              <Address getAddress={getAddress}></Address>
                         </div>
                         <div>
                              <h3 className="font-semibold text-center md:text-left">Booking Date</h3>
                              <DateTime getTime={getTime}></DateTime>
                         </div>
                    </div>
                    <Button onClick={searchPage} variant="contained" sx={{ maxWidth: "fit-content", mt: 2, background: '#F58300', color: 'white' }}>Search</Button>
               </div>
          </div>
     );
};

export default Banner;