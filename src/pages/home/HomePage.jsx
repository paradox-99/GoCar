import { Helmet } from "react-helmet-async";
import Banner from "./Banner";

const HomePage = () => {
    return (
        <div className="pt-[72px] lg:pt-20">
            <Helmet>
                <title>GoCar</title>
            </Helmet>
            <Banner></Banner>
        </div>
    );
};

export default HomePage;