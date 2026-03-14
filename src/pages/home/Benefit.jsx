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
                    <div className="flex items-center gap-4 mb-6">
                         <div className="bg-gradient-to-r from-primary to-orange-600 w-20 h-1 rounded-full"></div>
                         <div className="h-1 w-8 bg-gray-300 rounded-full"></div>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Your Journey, Our Priority</h1>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                         <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                              {/* Gradient background on hover */}
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-100/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <div className="relative flex gap-5">
                                   <div className='bg-gradient-to-br from-primary to-orange-500 p-4 h-fit rounded-xl shadow-md transform group-hover:scale-110 transition-transform duration-500'>
                                        <img src={car} alt="" className="w-[60px]"/>
                                   </div>
                                   <div className="flex flex-col gap-3">
                                        <h2 className="text-xl font-bold text-gray-900">Wide Range of Vehicles</h2>
                                        <p className="text-gray-600 text-sm leading-relaxed">Showcase your diverse fleet, from budget-friendly hatchbacks to spacious SUVs and luxury sedans.</p>
                                   </div>
                              </div>
                         </div>
                         
                         <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-100/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <div className="relative flex gap-5">
                                   <div className='bg-gradient-to-br from-primary to-orange-500 p-4 h-fit rounded-xl shadow-md transform group-hover:scale-110 transition-transform duration-500'>
                                        <img src={price} alt="" className="w-12"/>
                                   </div>
                                   <div className="flex flex-col gap-3">
                                        <h2 className="text-xl font-bold text-gray-900">Affordable Pricing</h2>
                                        <p className="text-gray-600 text-sm leading-relaxed">Highlight competitive rates and transparent pricing without hidden charges.</p>
                                   </div>
                              </div>
                         </div>
                         
                         <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-100/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <div className="relative flex gap-5">
                                   <div className='bg-gradient-to-br from-primary to-orange-500 p-4 h-fit rounded-xl shadow-md transform group-hover:scale-110 transition-transform duration-500'>
                                        <img src={booking} alt="" className="w-12"/>
                                   </div>
                                   <div className="flex flex-col gap-3">
                                        <h2 className="text-xl font-bold text-gray-900">Flexible Booking Options</h2>
                                        <p className="text-gray-600 text-sm leading-relaxed">Include short-term, long-term, or one-way rentals for user convenience.</p>
                                   </div>
                              </div>
                         </div>
                         
                         <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-100/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <div className="relative flex gap-5">
                                   <div className='bg-gradient-to-br from-primary to-orange-500 p-4 h-fit rounded-xl shadow-md transform group-hover:scale-110 transition-transform duration-500'>
                                        <img src={experience} alt="" className="w-10"/>
                                   </div>
                                   <div className="flex flex-col gap-3">
                                        <h2 className="text-xl font-bold text-gray-900">Seamless User Experience</h2>
                                        <p className="text-gray-600 text-sm leading-relaxed">Highlight your intuitive interface and easy booking process.</p>
                                   </div>
                              </div>
                         </div>
                         
                         <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-100/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <div className="relative flex gap-5">
                                   <div className='bg-gradient-to-br from-primary to-orange-500 p-4 h-fit rounded-xl shadow-md transform group-hover:scale-110 transition-transform duration-500'>
                                        <img src={support} alt="" className="w-10"/>
                                   </div>
                                   <div className="flex flex-col gap-3">
                                        <h2 className="text-xl font-bold text-gray-900">Reliable Customer Support</h2>
                                        <p className="text-gray-600 text-sm leading-relaxed">Emphasize 24/7 support and quick issue resolution.</p>
                                   </div>
                              </div>
                         </div>
                         
                         <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-100/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <div className="relative flex gap-5">
                                   <div className='bg-gradient-to-br from-primary to-orange-500 p-4 h-fit rounded-xl shadow-md transform group-hover:scale-110 transition-transform duration-500'>
                                        <img src={maintenance} alt="" className="w-12"/>
                                   </div>
                                   <div className="flex flex-col gap-3">
                                        <h2 className="text-xl font-bold text-gray-900">Safety and Maintenance</h2>
                                        <p className="text-gray-600 text-sm leading-relaxed">Assure users of well-maintained vehicles with regular inspections.</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
};

export default Benefit;