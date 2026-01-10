import { useNavigate } from "react-router-dom";
import { top_car_types } from "../../components/address/locationData";

const CarTypes = () => {

     const navigate = useNavigate();

     const handleBrand = brand_name => {
          navigate(`/carType/${brand_name}`)
     }

     return (
          <div className="max-w-[1360px] mx-4 md:mx-8 xl:mx-auto pt-20 pb-16">
               <div>
                    <div className="flex items-center gap-4 mb-6">
                         <div className="bg-gradient-to-r from-primary to-orange-600 w-20 h-1 rounded-full"></div>
                         <div className="h-1 w-8 bg-gray-300 rounded-full"></div>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                         Top Car Types
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base mb-12 max-w-2xl">
                         Explore our diverse collection of premium vehicles tailored to your needs
                    </p>
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                         {
                              top_car_types.map(brand =>
                                   <div key={brand.name} className="group">
                                        <div 
                                             className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 bg-white"
                                             onClick={() => handleBrand(brand.name)}
                                        >
                                             {/* Image Container */}
                                             <div className="relative h-[220px] md:h-[240px] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                                                  <img 
                                                       src={brand.image} 
                                                       alt={brand.name} 
                                                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                  />
                                                  {/* Gradient Overlay on Hover */}
                                                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                  {/* Shine Effect */}
                                                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                             </div>
                                             
                                             {/* Card Footer */}
                                             <div className="p-4 bg-white">
                                                  <h3 className="text-center font-nunito text-lg md:text-xl font-bold text-gray-800 group-hover:text-primary transition-colors duration-300">
                                                       {brand.name}
                                                  </h3>
                                                  <div className="flex justify-center mt-2">
                                                       <div className="w-12 h-0.5 bg-primary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>)
                         }
                    </div>
               </div>
          </div>
     );
};

export default CarTypes;