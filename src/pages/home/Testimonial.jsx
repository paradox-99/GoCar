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
               <div className="text-center mb-12">
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">Testimonials</p>
                    <h3 className="text-xl font-medium text-gray-700 mt-2">Hope these will welcome you</h3>
                    <h1 className="text-4xl md:text-5xl font-bold mt-4 bg-gradient-to-r from-gray-900 via-primary to-gray-900 bg-clip-text text-transparent"><span className="text-primary">Client&lsquo;s</span> Words</h1>
               </div>
               <div>
                    <Swiper
                         slidesPerView={1}
                         breakpoints={{
                              768: { slidesPerView: 2 },
                              1024: { slidesPerView: 3 }
                         }}
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
                              <div className="flex justify-center h-auto pb-16">
                                   <div className="p-6 md:p-8 w-full rounded-2xl shadow-lg hover:shadow-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 transition-all duration-500 hover:-translate-y-2">
                                        <div className="flex items-start justify-between mb-4">
                                             <Rating name="half-rating-read" defaultValue={4.5} precision={0.5} readOnly size="small" />
                                             <svg className="w-8 h-8 text-primary opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.25-2-7-2s-7 .75-7 2v10c0 1 0 7 7 7z"></path><path d="M15 19c3.386 0 7-1 7-8V5c0-1.25-4.25-2-7-2s-7 .75-7 2v10c0 1 0 7 7 7z"></path></svg>
                                        </div>
                                        <p className="mb-4 text-sm md:text-base text-gray-700 leading-relaxed">
                                             I needed a last-minute rental, and GoWheels delivered! The rates were affordable, and the car was in excellent shape. Their customer service team was very helpful as well.
                                        </p>
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                             <img src={pic1} className="rounded-full h-12 w-12 object-cover border-2 border-primary" alt="Profile" />
                                             <div>
                                                  <h4 className="font-bold text-gray-900">Catherine</h4>
                                                  <p className="text-xs text-gray-500">Verified Rider</p>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </SwiperSlide>
                         <SwiperSlide>
                              <div className="flex justify-center h-auto pb-16">
                                   <div className="p-6 md:p-8 w-full rounded-2xl shadow-lg hover:shadow-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 transition-all duration-500 hover:-translate-y-2">
                                        <div className="flex items-start justify-between mb-4">
                                             <Rating name="half-rating-read" defaultValue={5} precision={0.5} readOnly size="small" />
                                             <svg className="w-8 h-8 text-primary opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.25-2-7-2s-7 .75-7 2v10c0 1 0 7 7 7z"></path><path d="M15 19c3.386 0 7-1 7-8V5c0-1.25-4.25-2-7-2s-7 .75-7 2v10c0 1 0 7 7 7z"></path></svg>
                                        </div>
                                        <p className="mb-4 text-sm md:text-base text-gray-700 leading-relaxed">
                                             Fantastic experience! The vehicle was well-maintained and clean. The entire booking process was smooth and hassle-free.
                                        </p>
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                             <img src={pic2} className="rounded-full h-12 w-12 object-cover border-2 border-primary" alt="Profile" />
                                             <div>
                                                  <h4 className="font-bold text-gray-900">Edward</h4>
                                                  <p className="text-xs text-gray-500">Verified Rider</p>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </SwiperSlide>
                         <SwiperSlide>
                              <div className="flex justify-center h-auto pb-16">
                                   <div className="p-6 md:p-8 w-full rounded-2xl shadow-lg hover:shadow-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 transition-all duration-500 hover:-translate-y-2">
                                        <div className="flex items-start justify-between mb-4">
                                             <Rating name="half-rating-read" defaultValue={4} precision={0.5} readOnly size="small" />
                                             <svg className="w-8 h-8 text-primary opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.25-2-7-2s-7 .75-7 2v10c0 1 0 7 7 7z"></path><path d="M15 19c3.386 0 7-1 7-8V5c0-1.25-4.25-2-7-2s-7 .75-7 2v10c0 1 0 7 7 7z"></path></svg>
                                        </div>
                                        <p className="mb-4 text-sm md:text-base text-gray-700 leading-relaxed">
                                             Good experience overall. Customer support was responsive and helpful. The car was exactly as described in the listing.
                                        </p>
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                             <img src={pic3} className="rounded-full h-12 w-12 object-cover border-2 border-primary" alt="Profile" />
                                             <div>
                                                  <h4 className="font-bold text-gray-900">Mathew</h4>
                                                  <p className="text-xs text-gray-500">Verified Rider</p>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </SwiperSlide>
                         <SwiperSlide>
                              <div className="flex justify-center h-auto pb-16">
                                   <div className="p-6 md:p-8 w-full rounded-2xl shadow-lg hover:shadow-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 transition-all duration-500 hover:-translate-y-2">
                                        <div className="flex items-start justify-between mb-4">
                                             <Rating name="half-rating-read" defaultValue={5} precision={0.5} readOnly size="small" />
                                             <svg className="w-8 h-8 text-primary opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.25-2-7-2s-7 .75-7 2v10c0 1 0 7 7 7z"></path><path d="M15 19c3.386 0 7-1 7-8V5c0-1.25-4.25-2-7-2s-7 .75-7 2v10c0 1 0 7 7 7z"></path></svg>
                                        </div>
                                        <p className="mb-4 text-sm md:text-base text-gray-700 leading-relaxed">
                                             I've used GoWheels several times now and I'm always impressed by their professionalism and attention to detail. Highly recommended!
                                        </p>
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                             <img src={pic1} className="rounded-full h-12 w-12 object-cover border-2 border-primary" alt="Profile" />
                                             <div>
                                                  <h4 className="font-bold text-gray-900">Catherine</h4>
                                                  <p className="text-xs text-gray-500">Verified Rider</p>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </SwiperSlide>
                         <SwiperSlide>
                              <div className="flex justify-center h-auto pb-16">
                                   <div className="p-6 md:p-8 w-full rounded-2xl shadow-lg hover:shadow-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 transition-all duration-500 hover:-translate-y-2">
                                        <div className="flex items-start justify-between mb-4">
                                             <Rating name="half-rating-read" defaultValue={4.5} precision={0.5} readOnly size="small" />
                                             <svg className="w-8 h-8 text-primary opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.25-2-7-2s-7 .75-7 2v10c0 1 0 7 7 7z"></path><path d="M15 19c3.386 0 7-1 7-8V5c0-1.25-4.25-2-7-2s-7 .75-7 2v10c0 1 0 7 7 7z"></path></svg>
                                        </div>
                                        <p className="mb-4 text-sm md:text-base text-gray-700 leading-relaxed">
                                             Great service with competitive pricing. The booking app is very intuitive and the entire process was seamless from start to finish.
                                        </p>
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                             <img src={pic2} className="rounded-full h-12 w-12 object-cover border-2 border-primary" alt="Profile" />
                                             <div>
                                                  <h4 className="font-bold text-gray-900">Edward</h4>
                                                  <p className="text-xs text-gray-500">Verified Rider</p>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </SwiperSlide>
                    </Swiper>
               </div>
          </div>
     );
};

export default Testimonial;