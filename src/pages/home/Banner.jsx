import { Button } from "@mui/material";
import Address from "../../components/address/Address";
import { useState } from "react";
import DateTime from "../../components/dateTime/DateTime";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import AddressSearch from '../../components/address/AddressSearch';

// Small helper to pan map when a location is chosen
function PanTo({ lat, lon }) {
     const map = useMap();
     if (!lat || !lon) return null;
     map.setView([parseFloat(lat), parseFloat(lon)], 15, { animate: true });
     return null;
}

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
                         <div className="">
                              <h3 className="font-semibold text-center md:text-left mb-2">Location</h3>
                              <AddressSearch
                                   onSelect={handleSelectPlace}
                                   apiKey={LOCATIONIQ_KEY}
                                   provider={LOCATIONIQ_KEY ? 'locationiq' : 'nominatim'}
                                   placeholder="Search pickup location, e.g., Dhanmondi, Dhaka"
                              />
                              {/* <div>
                                   <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', height: '100vh' }}>
                                        <div style={{ padding: 12, maxWidth: 900, margin: '0 auto', width: '100%' }}>
                                             <AddressSearch
                                                  onSelect={handleSelectPlace}
                                                  apiKey={LOCATIONIQ_KEY}
                                                  provider={LOCATIONIQ_KEY ? 'locationiq' : 'nominatim'}
                                                  placeholder="Search pickup location, e.g., Dhanmondi, Dhaka"
                                             />
                                        </div>

                                        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', height: '100%' }}>
                                             <MapContainer center={[23.8103, 90.4125]} zoom={12} style={{ height: '100%', borderRadius: 8 }}>
                                                  <TileLayer
                                                       // use OSM tiles (or your tileserver)
                                                       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                       attribution="&copy; OpenStreetMap contributors"
                                                  />
                                                  {selected && (
                                                       <>
                                                            <PanTo lat={selected.lat} lon={selected.lon} />
                                                            <Marker position={[parseFloat(selected.lat), parseFloat(selected.lon)]}>
                                                                 <Popup>
                                                                      <div style={{ minWidth: 200 }}>
                                                                           <strong>{selected.display_name}</strong>
                                                                           <div style={{ fontSize: 12, color: '#444' }}>
                                                                                {selected.lat}, {selected.lon}
                                                                           </div>
                                                                      </div>
                                                                 </Popup>
                                                            </Marker>
                                                       </>
                                                  )}
                                             </MapContainer>
                                        </div>
                                   </div>
                              </div> */}
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