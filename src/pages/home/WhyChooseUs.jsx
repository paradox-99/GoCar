import { GiFlexibleStar } from "react-icons/gi";

const WhyChooseUs = () => {
    return (
        <div className="max-w-6xl mx-auto mt-20 lg:mt-28 px-6 py-12">
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="h-1 w-8 bg-gray-300 rounded-full"></div>
                    <div className="bg-gradient-to-r from-primary to-orange-600 w-20 h-1 rounded-full"></div>
                    <div className="h-1 w-8 bg-gray-300 rounded-full"></div>
                </div>
                <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Why Choose Us</h1>
                <p className="mt-5 mx-auto max-w-[600px] text-gray-600 text-sm md:text-base">Choose us for affordable rates, diverse vehicle options, excellent service, flexible rentals, and a seamless booking experience.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-center mt-12">
                <div className="space-y-6 flex-1">
                    <div className="group flex gap-6 items-start p-6 rounded-xl hover:bg-gradient-to-br hover:from-primary/10 hover:to-orange-100/10 transition-all duration-300">
                        <div className="p-4 rounded-lg bg-gradient-to-br from-primary to-orange-500 text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            <GiFlexibleStar className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">Flexible Rentals</h3>
                            <p className="mt-2 text-gray-600 text-sm leading-relaxed">Rent a vehicle for as long as you need, with easy adjustments to fit your unique schedule and plans.</p>
                        </div>
                    </div>
                    <div className="group flex gap-6 items-start p-6 rounded-xl hover:bg-gradient-to-br hover:from-primary/10 hover:to-orange-100/10 transition-all duration-300">
                        <div className="p-4 rounded-lg bg-gradient-to-br from-primary to-orange-500 text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            <GiFlexibleStar className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">No hidden fees</h3>
                            <p className="mt-2 text-gray-600 text-sm leading-relaxed">Enjoy transparent pricing with no unexpected costs or extra charges, ensuring you only pay what you see.</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center flex-1 order-first lg:order-none">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-3xl blur-3xl"></div>
                        <img src="/car.png" alt="Car" className="max-w-full relative z-10 drop-shadow-2xl" />
                    </div>
                </div>
                <div className="space-y-6 flex-1">
                    <div className="group flex gap-6 items-start p-6 rounded-xl hover:bg-gradient-to-br hover:from-primary/10 hover:to-orange-100/10 transition-all duration-300">
                        <div className="p-4 rounded-lg bg-gradient-to-br from-primary to-orange-500 text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            <GiFlexibleStar className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">First-Class Services</h3>
                            <p className="mt-2 text-gray-600 text-sm leading-relaxed">Rent a vehicle for as long as you need, with easy adjustments to fit your unique schedule and plans.</p>
                        </div>
                    </div>
                    <div className="group flex gap-6 items-start p-6 rounded-xl hover:bg-gradient-to-br hover:from-primary/10 hover:to-orange-100/10 transition-all duration-300">
                        <div className="p-4 rounded-lg bg-gradient-to-br from-primary to-orange-500 text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            <GiFlexibleStar className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">Price Match Guarantee</h3>
                            <p className="mt-2 text-gray-600 text-sm leading-relaxed">We guarantee to match any competitor's rate, ensuring you get the best deal available for your car rental.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhyChooseUs;
