import { GiFlexibleStar } from "react-icons/gi";

const WhyChooseUs = () => {
    return (
        <div className="max-w-6xl mx-auto mt-20 lg:mt-28 px-6">
            <div className="text-center">
                <h1 className="mt-4 text-5xl font-bold">Why Choose Us</h1>
                <p className="mt-5 mx-auto max-w-[600px] lg:w-[600px]">Choose us for affordable rates, diverse vehicle options, excellent service, flexible rentals, and a seamless booking experience.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-center mt-8">
                <div className="space-y-6">
                    <div className="flex gap-8 items-center">
                        <div className="p-4 -mt-6 rounded-sm bg-primary text-white">
                            <GiFlexibleStar className="text-3xl" />
                        </div>
                        <div>
                            <h3 className=" font-bold">Flexible Rentals</h3>
                            <p className="mt-3">Rent a vehicle for as long as you need, with easy adjustments to fit your unique schedule and plans.</p>
                        </div>
                    </div>
                    <div className="flex gap-8 items-center">
                        <div className="p-4 -mt-6 rounded-sm bg-primary text-white">
                            <GiFlexibleStar className="text-3xl" />
                        </div>
                        <div>
                            <h3 className=" font-bold">No hidden fees</h3>
                            <p className="mt-3">Enjoy transparent pricing with no unexpected costs or extra charges, ensuring you only pay what you see.</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center">
                    <img src="/car.png" alt="Car" className="max-w-full" />
                </div>
                <div className="space-y-6">
                    <div
                        className="flex flex-row-reverse gap-8 items-center">
                        <div className="p-4 -mt-6  rounded-sm bg-primary text-white">
                            <GiFlexibleStar className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="text-end font-bold">First-Class Services</h3>
                            <p className="text-end mt-3">Rent a vehicle for as long as you need, with easy adjustments to fit your unique schedule and plans.</p>
                        </div>
                    </div>
                    <div
                        className="flex flex-row-reverse gap-8 items-center">
                        <div className="p-4 -mt-7 rounded-sm bg-primary text-white">
                            <GiFlexibleStar className="text-3xl" />
                        </div>
                        <div>
                            <h3 className=" font-bold text-end">Price Match Guarantee</h3>
                            <p className="text-end mt-3">We guarantee to match any competitor’s rate, ensuring you get the best deal available for your car rental.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhyChooseUs;