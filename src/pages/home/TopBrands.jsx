import { useNavigate } from "react-router-dom";
import { top_brands } from "../../components/address/locationData";
import { Button } from "@mui/material";

const TopBrands = () => {

    const navigate = useNavigate();

    const handleBrand = brand_name => {
        navigate(`/brand/${brand_name}`)
    }

    return (
        <div>
            <div className="mt-20">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-r from-primary to-orange-600 w-20 h-1 rounded-full"></div>
                    <div className="h-1 w-8 bg-gray-300 rounded-full"></div>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Top Brands</h1>
                <p className="text-gray-600 text-sm md:text-base mt-2 max-w-2xl">Explore our curated selection of premium vehicle brands</p>
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {
                        top_brands.map(brand =>
                            <div key={brand.name}>
                                <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2" onClick={() => handleBrand(brand.name)}>
                                    <div className="relative h-[200px] overflow-hidden bg-gray-100">
                                        <img src={brand.image} alt={brand.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                            <img src={brand.logo} alt={brand.name} className="w-24 h-24 object-contain drop-shadow-lg" />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-center font-nunito text-xl md:text-2xl font-semibold mt-4 text-gray-900 group-hover:text-primary transition-colors duration-300">{brand.name}</h3>
                            </div>)
                    }
                </div>
                <div className="flex justify-center mt-8">
                    <Button href={'/view-all-brands'} variant="contained" sx={{ background: '#F58300', color: 'white', fontWeight: 600, boxShadow: '0 8px 16px rgba(245, 131, 0, 0.4)', '&:hover': { background: '#E67E00', boxShadow: '0 12px 24px rgba(245, 131, 0, 0.6)', transform: 'translateY(-2px)' }, transition: 'all 0.3s ease' }}>View all brands</Button>
                </div>
            </div>
        </div>
    );
};

export default TopBrands;