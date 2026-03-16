import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Accordion, AccordionSummary, AccordionDetails, Button } from "@mui/material";
import { MdExpandMore } from "react-icons/md";
import {
    FaSearch, FaBalanceScale, FaLock, FaCarSide,
    FaIdCard, FaCar, FaUserCheck, FaShieldAlt,
    FaHeadset, FaCheckCircle, FaTimesCircle, FaGasPump,
    FaParking, FaClock
} from "react-icons/fa";
import { HiOutlineDocumentText } from "react-icons/hi";
import { Link } from "react-router-dom";

const steps = [
    {
        number: "01",
        icon: <FaSearch className="text-3xl text-white" />,
        title: "Search Location & Dates",
        description: "Enter your pickup location, desired dates and times. Our smart search finds all available cars near you instantly.",
        color: "from-primary to-orange-500",
    },
    {
        number: "02",
        icon: <FaBalanceScale className="text-3xl text-white" />,
        title: "Compare Cars & Agencies",
        description: "Browse verified car listings with full specs, agency ratings, and transparent pricing. Filter by vehicle type, fuel, seats and more.",
        color: "from-orange-500 to-amber-500",
    },
    {
        number: "03",
        icon: <FaLock className="text-3xl text-white" />,
        title: "Book & Pay Securely",
        description: "Confirm your booking with a secure online payment. You'll receive an instant confirmation and all booking details via email.",
        color: "from-amber-500 to-yellow-500",
    },
    {
        number: "04",
        icon: <FaCarSide className="text-3xl text-white" />,
        title: "Pickup & Enjoy Your Ride",
        description: "Meet the agency at the agreed location, present your documents, collect your keys and hit the road. Enjoy your journey!",
        color: "from-yellow-500 to-primary",
    },
];

const documents = [
    {
        icon: <FaIdCard className="text-2xl text-primary" />,
        title: "Valid Driving License",
        desc: "A current, valid driving license issued from any recognized authority. International licenses accepted.",
    },
    {
        icon: <HiOutlineDocumentText className="text-2xl text-primary" />,
        title: "National ID or Passport",
        desc: "Government-issued photo identification (NID, passport or birth registration for younger renters).",
    },
    {
        icon: <FaUserCheck className="text-2xl text-primary" />,
        title: "Age Requirement",
        desc: "Minimum age of 21 years. Some premium or luxury vehicles may require renters to be 25 or older.",
    },
    {
        icon: <FaCar className="text-2xl text-primary" />,
        title: "Booking Confirmation",
        desc: "Your GoCar booking confirmation email or in-app booking reference shown at pickup.",
    },
];

const included = [
    "Basic insurance coverage",
    "Unlimited kilometers (select vehicles)",
    "24/7 roadside assistance contact",
    "In-car GPS navigation",
];

const extras = [
    { label: "Fuel cost", icon: <FaGasPump className="text-primary text-sm" /> },
    { label: "Toll & parking fees", icon: <FaParking className="text-primary text-sm" /> },
    { label: "Late return charge", icon: <FaClock className="text-primary text-sm" /> },
    { label: "Additional driver fee", icon: <FaUserCheck className="text-primary text-sm" /> },
];

const cancellationPolicies = [
    { time: "48+ hours before", action: "Full refund", positive: true },
    { time: "24–48 hours before", action: "50% refund", positive: true },
    { time: "Under 24 hours", action: "No refund", positive: false },
    { time: "No-show", action: "No refund", positive: false },
];

const trustItems = [
    {
        icon: <FaShieldAlt className="text-4xl text-primary" />,
        title: "Verified Agency Checks",
        desc: "Every agency on GoCar goes through a strict verification process — business registration, vehicle inspection, and identity confirmation before they can list cars.",
    },
    {
        icon: <FaCar className="text-4xl text-primary" />,
        title: "Vehicle Quality Checks",
        desc: "All vehicles are inspected for roadworthiness, insurance validity, and cleanliness standards. Ratings reflect real customer experiences.",
    },
    {
        icon: <FaHeadset className="text-4xl text-primary" />,
        title: "24/7 Support",
        desc: "Our support team is available around the clock via chat and phone. From pre-booking queries to mid-trip emergencies, we've got you covered.",
    },
];

const faqs = [
    {
        q: "Can I cancel or modify my booking?",
        a: "Yes. You can cancel or modify bookings from your dashboard. Cancellation charges depend on how far in advance you cancel — see the Cancellation Policy section above for full details.",
    },
    {
        q: "What happens if the car breaks down?",
        a: "All bookings include 24/7 roadside assistance contact. In the event of a breakdown, contact the agency immediately and our support team will help coordinate a resolution.",
    },
    {
        q: "Is fuel included in the rental price?",
        a: "No. Fuel is not included. You are expected to return the vehicle with the same fuel level as at pickup, or a refuelling charge will apply.",
    },
    {
        q: "Can I add an extra driver?",
        a: "Yes. Additional drivers can be added at an extra charge, provided they meet the age and license requirements. Contact the agency directly after booking.",
    },
    {
        q: "How is the total cost calculated?",
        a: "The total is based on the hourly rental rate multiplied by your booking duration, plus any applicable add-ons. All pricing is shown transparently before you confirm.",
    },
];

const HowItWorksPage = () => {
    const [expanded, setExpanded] = useState(false);

    const handleAccordion = (panel) => (_, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <div className="pt-24">
            <Helmet>
                <title>How It Works | GoCar</title>
            </Helmet>

            {/* Hero */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-4 text-center">
                <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Simple & Transparent</p>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">How GoCar Works</h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                    Renting a car should be effortless. We've made it four easy steps — from discovery to driving.
                </p>
            </div>

            {/* 4-Step Flow */}
            <section className="max-w-[1360px] mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <div className="bg-primary w-12 h-1 rounded mx-auto mb-4"></div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">The 4-Step Booking Flow</h2>
                    <p className="text-gray-500 mt-3 max-w-lg mx-auto">Everything you need to go from browsing to driving in minutes.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, idx) => (
                        <div key={idx} className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 group">
                            <div className={`bg-gradient-to-br ${step.color} p-6 flex items-center justify-between`}>
                                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                    {step.icon}
                                </div>
                                <span className="text-white/30 font-black text-5xl">{step.number}</span>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className="hidden lg:block absolute -right-4 top-1/4 w-8 h-8 bg-gray-50 rounded-full border border-gray-200 z-10 flex items-center justify-center text-gray-400 text-xs font-bold">
                                    →
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Required Documents */}
            <section className="bg-gray-50 py-20 px-4">
                <div className="max-w-[1360px] mx-auto">
                    <div className="text-center mb-12">
                        <div className="bg-primary w-12 h-1 rounded mx-auto mb-4"></div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Required Documents</h2>
                        <p className="text-gray-500 mt-3 max-w-lg mx-auto">Please have these ready at the time of pickup to ensure a smooth handover.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {documents.map((doc, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                                    {doc.icon}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{doc.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{doc.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Transparency */}
            <section className="max-w-[1360px] mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <div className="bg-primary w-12 h-1 rounded mx-auto mb-4"></div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Pricing Transparency</h2>
                    <p className="text-gray-500 mt-3 max-w-lg mx-auto">No hidden fees. Know exactly what you're paying for before you confirm.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
                        <h3 className="font-bold text-green-800 text-xl mb-5 flex items-center gap-2">
                            <FaCheckCircle className="text-green-500" /> What's Included
                        </h3>
                        <ul className="space-y-3">
                            {included.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-green-800 text-sm">
                                    <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8">
                        <h3 className="font-bold text-orange-800 text-xl mb-5 flex items-center gap-2">
                            <FaTimesCircle className="text-orange-400" /> What's Extra
                        </h3>
                        <ul className="space-y-3">
                            {extras.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-orange-800 text-sm">
                                    <span className="mt-0.5 flex-shrink-0">{item.icon}</span>
                                    {item.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <p className="text-center text-gray-500 text-sm mt-8 max-w-lg mx-auto">
                    The total rental cost is calculated based on your hourly rate × booking duration. All charges are shown at checkout before you pay.
                </p>
            </section>

            {/* Cancellation Policy */}
            <section className="bg-gray-50 py-20 px-4">
                <div className="max-w-[1360px] mx-auto">
                    <div className="text-center mb-12">
                        <div className="bg-primary w-12 h-1 rounded mx-auto mb-4"></div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Cancellation & Refund Policy</h2>
                        <p className="text-gray-500 mt-3 max-w-lg mx-auto">We believe in fair, transparent cancellation terms. Here's a quick summary.</p>
                    </div>
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="grid grid-cols-2 bg-gray-800 text-white text-sm font-bold px-6 py-3">
                                <span>Cancellation Time</span>
                                <span>Refund</span>
                            </div>
                            {cancellationPolicies.map((policy, idx) => (
                                <div key={idx} className={`grid grid-cols-2 px-6 py-4 text-sm border-b border-gray-100 last:border-b-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <span className="text-gray-700 font-medium">{policy.time}</span>
                                    <span className={`font-bold flex items-center gap-2 ${policy.positive ? 'text-green-600' : 'text-red-500'}`}>
                                        {policy.positive ? <FaCheckCircle /> : <FaTimesCircle />}
                                        {policy.action}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="text-gray-500 text-sm text-center mt-4">
                            Refunds are processed within 5–7 business days to your original payment method.
                        </p>
                    </div>
                </div>
            </section>

            {/* Safety & Trust */}
            <section className="max-w-[1360px] mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <div className="bg-primary w-12 h-1 rounded mx-auto mb-4"></div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Safety & Trust</h2>
                    <p className="text-gray-500 mt-3 max-w-lg mx-auto">Your safety and peace of mind is our top priority at every step.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {trustItems.map((item, idx) => (
                        <div key={idx} className="text-center p-8 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex justify-center mb-5">
                                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
                                    {item.icon}
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-3">{item.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Snippet */}
            <section className="bg-gray-50 py-20 px-4">
                <div className="max-w-[1360px] mx-auto">
                    <div className="text-center mb-12">
                        <div className="bg-primary w-12 h-1 rounded mx-auto mb-4"></div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
                        <p className="text-gray-500 mt-3 max-w-lg mx-auto">Quick answers to the most common questions from our renters.</p>
                    </div>
                    <div className="max-w-3xl mx-auto space-y-3">
                        {faqs.map((faq, idx) => (
                            <Accordion
                                key={idx}
                                expanded={expanded === `faq-${idx}`}
                                onChange={handleAccordion(`faq-${idx}`)}
                                sx={{ borderRadius: '12px !important', border: '1px solid #f3f4f6', boxShadow: 'none', '&:before': { display: 'none' }, '&.Mui-expanded': { margin: 0 } }}
                            >
                                <AccordionSummary
                                    expandIcon={<MdExpandMore className="text-primary text-xl" />}
                                    sx={{ fontWeight: 600, fontFamily: 'Nunito Sans', fontSize: '15px', color: '#111827' }}
                                >
                                    {faq.q}
                                </AccordionSummary>
                                <AccordionDetails sx={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.7 }}>
                                    {faq.a}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-24 px-4 text-center text-white">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Hit the Road?</h2>
                    <p className="text-gray-400 text-lg mb-10">
                        Join thousands of happy renters across Bangladesh. Find your car in seconds.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/search">
                            <Button
                                variant="contained"
                                size="large"
                                sx={{
                                    backgroundColor: '#F58300', color: '#fff', fontWeight: 700,
                                    textTransform: 'none', px: 5, py: 1.75, borderRadius: '10px',
                                    fontSize: '16px', '&:hover': { backgroundColor: '#e07500' }
                                }}
                            >
                                Browse Cars Now
                            </Button>
                        </Link>
                        <Link to="/sign-up/agency">
                            <Button
                                variant="outlined"
                                size="large"
                                sx={{
                                    borderColor: '#F58300', color: '#F58300', fontWeight: 700,
                                    textTransform: 'none', px: 5, py: 1.75, borderRadius: '10px',
                                    fontSize: '16px', '&:hover': { borderColor: '#e07500', color: '#e07500', backgroundColor: 'transparent' }
                                }}
                            >
                                Become an Agency Partner
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HowItWorksPage;
