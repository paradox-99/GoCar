import { top_car_types } from "../../components/address/locationData";

const CarTypes = () => {

     const handleBrand = brand_name => {
          // navigate(`/brand/${brand_name}`)
     }

     return (
          <div className="max-w-[1360px] mx-4 md:mx-8 xl:mx-auto pt-20">
               <div>
                    <div className="bg-black w-20 h-1 mb-6"></div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Top Car Types</h1>
                    <div className="mt-10 flex flex-wrap lg:flex-row justify-center gap-x-5 gap-y-10">
                         {
                              top_car_types.map(brand =>
                                   <div key={brand.name}>
                                        <div className="bg-slate-200 rounded-md relative hover:cursor-pointer hover:scale-105 hover:duration-500 hover:ease-in-out" onClick={() => handleBrand(brand.name)}>
                                             <img src={brand.image} alt="" className="w-[300px] h-[200px]" />
                                        </div>
                                        <h3 className="text-center font-nunito text-xl md:text-2xl font-semibold mt-3">{brand.name}</h3>
                                   </div>)
                         }
                    </div>
               </div>
          </div>
     );
};

export default CarTypes;