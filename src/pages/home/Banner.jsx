import { Button } from "@mui/material";
import { useState } from "react";
import DateTime from "../../components/dateTime/DateTime";
import { useNavigate } from "react-router-dom";
import AddressSearch from '../../components/address/AddressSearch';

const Banner = () => {

     const [time, setTime] = useState();
     const navigate = useNavigate();
     const [selected, setSelected] = useState(null);
     const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_KEY || '';

     const getTime = (timeAndDate) => {
          setTime(timeAndDate)
     }

     const searchPage = () => {
          const location = selected.display_name;
          const lat = selected.lat;
          const lon = selected.lon;
          const placeId = selected.raw.place_id;
          const fromTs = time.fromTs;
          const untilTs = time.untilTs;

          const locationParam = new URLSearchParams({ location: location, lat: lat, lon: lon, place_id: placeId});
          const date = new URLSearchParams({fromTs: fromTs, untilTs: untilTs});
          navigate(`/search/queries?${locationParam}&${date}`)

     }


     function handleSelectPlace(place) {
          setSelected(place);
     }

     return (
          <div className="relative md:h-[85vh] lg:h-[83vh] py-10 md:py-0 bg-[url('/banner_image.png')] md:bg-[url('/banner_image2.png')] lg:bg-[url('/banner_image.png')] bg-right-top bg-contain md:bg-auto lg:bg-contain bg-no-repeat pl-3 md:pl-8 xl:pl-20 flex flex-col justify-center md:gap-5 lg:gap-10 xl:gap-14 overflow-hidden">
               
               {/* Subtle overlay for better text readability */}
               <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-transparent"></div>
               
               {/* Animated background elements */}
               <div className="absolute top-10 right-10 w-40 h-40 bg-orange-400/15 rounded-full blur-3xl animate-pulse"></div>
               <div className="absolute bottom-10 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
               
               <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold w-full max-w-3xl text-black drop-shadow-2xl leading-tight mb-4">Drive Your Way, Anytime, Anywhere</h1>
                    <p className="text-lg md:text-xl lg:text-2xl max-w-2xl text-gray-700 drop-shadow-lg mb-8">Affordable Car Rentals Made Simple - Explore, Book, and Go!</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                         <Button variant="contained" sx={{ 
                              background: '#F58300', 
                              color: 'white', 
                              fontWeight: 700,
                              fontSize: '1rem',
                              px: 5,
                              py: 1.5,
                              borderRadius: '8px',
                              boxShadow: '0 8px 24px rgba(245, 131, 0, 0.35)',
                              transition: 'all 0.3s ease',
                              '&:hover': { 
                                   background: '#E67E00',
                                   boxShadow: '0 12px 32px rgba(245, 131, 0, 0.5)',
                                   transform: 'translateY(-2px)'
                              }
                         }}>Start Booking Now</Button>
                         <Button variant="outlined" sx={{ 
                              color: 'black',
                              borderColor: 'rgba(0, 0, 0, 0.5)',
                              fontWeight: 600,
                              fontSize: '1rem',
                              px: 5,
                              py: 1.5,
                              borderRadius: '8px',
                              transition: 'all 0.3s ease',
                              '&:hover': { 
                                   borderColor: 'black',
                                   background: 'rgba(0,0,0, 0.1)'
                              }
                         }}>Learn More</Button>
                    </div>
               </div>

               <div className="mt-10 md:mt-5 flex flex-col items-center md:items-start relative z-10">
                    <div className="flex flex-col xl:flex-row gap-4 max-w-6xl bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                         <div >
                              <h3 className="font-semibold text-black mb-5 text-sm uppercase tracking-wider">📍 Pickup Location</h3>
                              <AddressSearch
                                   onSelect={handleSelectPlace}
                                   apiKey={LOCATIONIQ_KEY}
                                   provider={LOCATIONIQ_KEY ? 'locationiq' : 'nominatim'}
                                   placeholder="Search pickup location, e.g., Dhanmondi, Dhaka"
                              />
                         </div>
                         <div >
                              <h3 className="font-semibold text-black mb-3 text-sm uppercase tracking-wider">📅 Booking Date</h3>
                              <DateTime getTime={getTime}></DateTime>
                         </div>
                    </div>
                    <Button 
                         onClick={searchPage} 
                         variant="contained" 
                         sx={{ 
                              maxWidth: "fit-content", 
                              mt: 4, 
                              background: '#F58300', 
                              color: 'white', 
                              fontWeight: 700,
                              fontSize: '1.1rem',
                              px: 6,
                              py: 1.5,
                              borderRadius: '8px',
                              boxShadow: '0 8px 24px rgba(245, 131, 0, 0.35)',
                              transition: 'all 0.3s ease',
                              '&:hover': { 
                                   background: '#E67E00',
                                   boxShadow: '0 12px 32px rgba(245, 131, 0, 0.5)',
                                   transform: 'translateY(-2px)'
                              }
                         }}>
                         🔍 Search Cars
                    </Button>
               </div>
          </div>
     );
};

export default Banner;