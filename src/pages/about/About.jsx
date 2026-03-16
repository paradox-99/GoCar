import { Helmet } from "react-helmet-async";
import { Button } from "@mui/material";
import { FaBullseye, FaEye, FaHandshake, FaShieldAlt, FaLightbulb, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";

const stats = [
    { value: "500+", label: "Verified Cars" },
    { value: "50+", label: "Agency Partners" },
    { value: "10k+", label: "Happy Renters" },
    { value: "24/7", label: "Customer Support" },
];

const values = [
    {
        icon: <FaShieldAlt className="text-3xl text-primary" />,
        title: "Trust First",
        desc: "Every agency and vehicle is verified before appearing on our platform. We don't compromise on safety.",
    },
    {
        icon: <FaLightbulb className="text-3xl text-primary" />,
        title: "Simplicity",
        desc: "We strip away the complexity of car rentals. Search, compare, book — in three simple steps.",
    },
    {
        icon: <FaHandshake className="text-3xl text-primary" />,
        title: "Fair for Everyone",
        desc: "Transparent pricing for renters, fair revenue for agencies. No hidden fees on either side.",
    },
    {
        icon: <FaUsers className="text-3xl text-primary" />,
        title: "Community Driven",
        desc: "Genuine reviews, real ratings. Our community of renters helps everyone make better decisions.",
    },
];

const About = () => {
    return (
        <div className="pt-24">
            <Helmet>
                <title>About Us | GoCar</title>
            </Helmet>

            {/* Hero */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-4 text-center">
                <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Our Story</p>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About GoCar</h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    GoCar was built on a simple belief — renting a car in Bangladesh should be as easy as booking a ride.
                    We connect trusted local agencies with everyday renters through a transparent, technology-driven platform.
                </p>
            </div>

            {/* Stats */}
            <div className="bg-primary py-12 px-4">
                <div className="max-w-[1360px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {stats.map((stat, idx) => (
                        <div key={idx}>
                            <p className="text-4xl font-extrabold text-white">{stat.value}</p>
                            <p className="text-white/80 font-medium mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mission & Vision */}
            <section className="max-w-[1360px] mx-auto px-4 py-20">
                <div className="grid md:grid-cols-2 gap-10">
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-10">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                                <FaBullseye className="text-2xl text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            To make vehicle rental accessible, affordable, and trustworthy for every person in Bangladesh —
                            whether you need a car for a weekend trip, a business meeting, or a moving day. We empower
                            local agencies to grow digitally while giving renters the confidence to book without worry.
                        </p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                                <FaEye className="text-2xl text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            To become the most trusted car rental marketplace in South Asia — a platform where every
                            journey starts with complete peace of mind. We envision a future where verified, quality
                            vehicle rentals are available to anyone, anywhere in the region, at the tap of a button.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-gray-50 py-20 px-4">
                <div className="max-w-[1360px] mx-auto">
                    <div className="text-center mb-12">
                        <div className="bg-primary w-12 h-1 rounded mx-auto mb-4"></div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What We Stand For</h2>
                        <p className="text-gray-500 mt-3 max-w-lg mx-auto">The principles that guide every decision we make at GoCar.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((val, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                                    {val.icon}
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg mb-2">{val.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Origin story */}
            <section className="max-w-[1360px] mx-auto px-4 py-20">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="bg-primary w-12 h-1 rounded mx-auto mb-6"></div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why We Built GoCar</h2>
                    <p className="text-gray-600 leading-relaxed mb-5">
                        The idea for GoCar came from a simple frustration — finding a reliable car rental in Bangladesh
                        was unnecessarily hard. Phone calls, unclear pricing, no reviews, and no accountability.
                        Renters had no way to trust agencies and agencies had no easy way to reach customers.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-5">
                        We set out to fix that. By bringing car rental agencies online with a structured,
                        transparent marketplace, GoCar provides renters with real ratings, verified vehicles,
                        and secure online payment — and gives agencies a professional digital presence to grow their business.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        Today, GoCar serves thousands of renters and dozens of agencies across Bangladesh,
                        and we're just getting started.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 px-4 text-center text-white">
                <div className="max-w-xl mx-auto">
                    <h2 className="text-3xl font-extrabold mb-4">Be Part of the GoCar Story</h2>
                    <p className="text-gray-400 mb-10">
                        Whether you're looking for a reliable rental or want to grow your agency business, GoCar is your platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/search">
                            <Button variant="contained" size="large"
                                sx={{ backgroundColor: '#F58300', color: '#fff', fontWeight: 700, textTransform: 'none', px: 5, py: 1.75, borderRadius: '10px', fontSize: '16px', '&:hover': { backgroundColor: '#e07500' } }}>
                                Browse Cars
                            </Button>
                        </Link>
                        <Link to="/contact">
                            <Button variant="outlined" size="large"
                                sx={{ borderColor: '#F58300', color: '#F58300', fontWeight: 700, textTransform: 'none', px: 5, py: 1.75, borderRadius: '10px', fontSize: '16px', '&:hover': { borderColor: '#e07500', color: '#e07500', backgroundColor: 'transparent' } }}>
                                Get in Touch
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
