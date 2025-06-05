import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import "./style.css";
import pic1 from "../../assets/images/8867 1.png";
import pic2 from "../../assets/images/911 1.png";
import pic3 from "../../assets/images/2147961425 1.png";
import { Rating } from '@mui/material';

const Testimonial = () => {
     return (
          <div className="my-28">
               <h3 className="text-xl font-medium text-center">Hope these will welcome you</h3>
               <h1 className="text-secondary text-5xl font-extrabold mt-5 mb-12 text-center"><span className="text-primary">Client&rsquo;s</span> Words</h1>
               <div>
                    <Swiper
                         slidesPerView={3}
                         spaceBetween={30}
                         autoplay={{
                              delay: 2500,
                              disableOnInteraction: false,
                         }}
                         pagination={{
                              clickable: true,
                         }}
                         modules={[Pagination, Autoplay]}
                         className="mySwiper"
                    >
                         <SwiperSlide>
                              <div className="flex justify-center h-56">
                                   <div className="p-5 w-[400px] rounded-3xl shadow-lg">
                                        <div className="flex items-center justify-between">
                                             <Rating name="half-rating-read" defaultValue={4.5} precision={0.5} readOnly />
                                             <div className="flex items-center gap-2">
                                                  <img src={pic1} className="rounded-full h-12 w-12 mb-4" alt="Profile" />
                                                  <h1 className="font-bold">Catherine</h1>
                                             </div>
                                        </div>
                                        <p className="mb-2 text-sm text-justify">
                                             I needed a last-minute rental, and GoWheels delivered! The rates were affordable, and the car was in excellent shape. Their customer service team was very helpful as well.
                                        </p>
                                   </div>
                              </div>
                         </SwiperSlide>
                         <SwiperSlide>
                              <div className="flex justify-center h-56">
                                   <div className="p-5 w-[400px] rounded-3xl shadow-lg">
                                        <div className="flex items-center justify-between">
                                             <Rating name="half-rating-read" defaultValue={5} precision={0.5} readOnly />
                                             <div className="flex items-center gap-2">
                                                  <img src={pic2} className="rounded-full h-12 w-12 mb-4" alt="Profile"
                                                  />
                                                  <h1 className="font-bold">Edward</h1>
                                             </div>
                                        </div>
                                        <p className="mb-2 text-sm text-justify">
                                             Fantastic experience! The vehicle was well-maintained and clean.
                                        </p>
                                   </div>
                              </div>
                         </SwiperSlide>
                         <SwiperSlide>
                              <div className="flex justify-center h-56">
                                   <div className="p-5 w-[400px] rounded-3xl shadow-lg">
                                        <div className="flex items-center justify-between">
                                             <Rating name="half-rating-read" defaultValue={4} precision={0.5} readOnly />
                                             <div className="flex items-center gap-2">
                                                  <img src={pic3} className="rounded-full h-12 w-12 mb-4" alt="Profile"
                                                  />
                                                  <h1 className="font-bold">Mathew</h1>
                                             </div>
                                        </div>
                                        <a href="#"><h4 className="text-sm mb-3 font-semibold">Booked :  2/3/2023 - 12-12-2023 </h4>
                                        </a>
                                        <p className="mb-2 text-sm text-justify">
                                             Good experience overall. Customer support was responsive.
                                        </p>
                                   </div>
                              </div>
                         </SwiperSlide>
                         <SwiperSlide>
                              <div className="flex justify-center h-56">
                                   <div className="p-5 w-[400px] rounded-3xl shadow-lg">
                                        <div className="flex items-center justify-between">
                                             <Rating name="half-rating-read" defaultValue={5} precision={0.5} readOnly />
                                             <div className="flex items-center gap-2">
                                                  <img src={pic1} className="rounded-full h-12 w-12 mb-4" alt="Profile" />
                                                  <h1 className="font-bold">Catherine</h1>
                                             </div>
                                        </div>
                                        <p className="mb-2 text-sm text-justify">
                                             I needed a last-minute rental, and GoWheels delivered! The rates were affordable, and the car was in excellent shape. Their customer service team was very helpful as well.
                                        </p>
                                   </div>
                              </div>
                         </SwiperSlide>
                         <SwiperSlide>
                              <div className="flex justify-center h-56">
                                   <div className="p-5 w-[400px] rounded-3xl shadow-lg">
                                        <div className="flex items-center justify-between">
                                             <Rating name="half-rating-read" defaultValue={4.5} precision={0.5} readOnly />
                                             <div className="flex items-center gap-2">
                                                  <img src={pic2} className="rounded-full h-12 w-12 mb-4" alt="Profile"
                                                  />
                                                  <h1 className="font-bold">Edward</h1>
                                             </div>
                                        </div>
                                        <p className="mb-2 text-sm text-justify">Fantastic experience! The vehicle was well-maintained and clean.</p>
                                   </div>
                              </div>
                         </SwiperSlide>
                    </Swiper>
               </div>
          </div>
     );
};

export default Testimonial;