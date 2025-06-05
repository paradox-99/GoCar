import { Helmet } from "react-helmet-async";
import Banner from "./Banner";
import TopBrands from "./TopBrands";
import CarTypes from "./CarTypes";
import Benefit from "./Benefit";
import HowItWorks from "./HowItWorks";
import WhyChooseUs from "./WhyChooseUs";
import Testimonial from "./Testimonial";

const HomePage = () => {
    return (
        <div className="pt-[72px] lg:pt-20">
            <Helmet>
                <title>goCar</title>
            </Helmet>
            <Banner></Banner>
            <div className="max-w-[1360px] mx-4 md:mx-8 xl:mx-auto">
                <Benefit></Benefit>
                <TopBrands></TopBrands>
                <CarTypes></CarTypes>
                <HowItWorks></HowItWorks>
                <WhyChooseUs></WhyChooseUs>
                <Testimonial></Testimonial>
            </div>
        </div>
    );
};

export default HomePage;