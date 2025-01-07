import car from "../../assets/icons/car_lo.png";
import price from "../../assets/icons/money-bags.png";
import booking from "../../assets/icons/booking.png";
import experience from "../../assets/icons/satisfaction.png";
import support from "../../assets/icons/technical-support.png";  
import maintenance from "../../assets/icons/optimizing.png";

const Benefit = () => {
     return (
          <div className="max-w-[1360px] mx-4 md:mx-8 xl:mx-auto pt-20">
               <div>
                    <div className="bg-black w-20 h-1 mb-6"></div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Your Journey, Our Priority</h1>
                    <div className="mt-10 flex flex-wrap lg:flex-row justify-center gap-x-10 gap-y-10">
                         <div className="w-[400px] h-40 flex gap-5">
                              <div className='bg-primary p-3 h-fit rounded'>
                                   <img src={car} alt="" className="w-[72px]"/>
                              </div>
                              <div className="flex flex-col gap-3">
                                   <h2 className="text-xl font-bold">Wide Range of Vehicles</h2>
                                   <p>Showcase your diverse fleet, from budget-friendly hatchbacks to spacious SUVs and luxury sedans.</p>
                              </div>
                         </div>
                         <div className="w-[400px] h-40 flex gap-5">
                              <div className='bg-primary p-3 h-fit rounded'>
                                   <img src={price} alt="" className="w-14"/>
                              </div>
                              <div className="flex flex-col gap-3">
                                   <h2 className="text-xl font-bold">Affordable Pricing</h2>
                                   <p>Highlight competitive rates and transparent pricing without hidden charges.</p>
                              </div>
                         </div>
                         <div className="w-[400px] h-40 flex gap-5"> 
                              <div className='bg-primary p-3 h-fit rounded'>
                                   <img src={booking} alt="" className="w-14"/>
                              </div>
                              <div className="flex flex-col gap-3">
                                   <h2 className="text-xl font-bold">Flexible Booking Options</h2>
                                   <p>Include short-term, long-term, or one-way rentals for user convenience.
                                   </p>
                              </div>
                         </div>
                         <div className="w-[400px] h-40 flex gap-5">
                              <div className='bg-primary p-3 h-fit rounded'>
                                   <img src={experience} alt="" className="w-12"/>
                              </div>
                              <div className="flex flex-col gap-3">
                                   <h2 className="text-xl font-bold">Seamless User Experience</h2>
                                   <p>Highlight your intuitive interface and easy booking process.</p>
                              </div>
                         </div>
                         <div className="w-[400px] h-40 flex gap-5">
                              <div className='bg-primary p-3 h-fit rounded'>
                                   <img src={support} alt="" className="w-10"/>
                              </div>
                              <div className="flex flex-col gap-3">
                                   <h2 className="text-xl font-bold">Reliable Customer Support</h2>
                                   <p>Emphasize 24/7 support and quick issue resolution.</p>
                              </div>
                         </div>
                         <div className="w-[400px] h-40 flex gap-5">
                              <div className='bg-primary p-3 h-fit rounded'>
                                   <img src={maintenance} alt="" className="w-12"/>
                              </div>
                              <div className="flex flex-col gap-3">
                                   <h2 className="text-xl font-bold">Safety and Maintenance</h2>
                                   <p>Assure users of well-maintained vehicles with regular inspections.</p>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
};

export default Benefit;