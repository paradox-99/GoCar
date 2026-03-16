import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button, TextField } from "@mui/material";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa";
import toast from "react-hot-toast";

const contactInfo = [
    {
        icon: <FaPhone className="text-primary text-xl" />,
        label: "Phone",
        value: "+880 1700-000000",
        sub: "Available 24/7 for urgent support",
    },
    {
        icon: <FaEnvelope className="text-primary text-xl" />,
        label: "Email",
        value: "support@gocar.com.bd",
        sub: "We typically reply within 2 hours",
    },
    {
        icon: <FaMapMarkerAlt className="text-primary text-xl" />,
        label: "Address",
        value: "Dhanmondi, Dhaka 1205",
        sub: "Bangladesh",
    },
];

const inputSx = {
    '& .MuiOutlinedInput-root': {
        '&:hover fieldset': { borderColor: '#F58300' },
        '&.Mui-focused fieldset': { borderColor: '#F58300' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#F58300' },
};

const Contact = () => {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [sending, setSending] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setSending(true);
        // Simulate form submission
        setTimeout(() => {
            setSending(false);
            setForm({ name: "", email: "", subject: "", message: "" });
            toast.success("Message sent! We'll get back to you soon.");
        }, 1200);
    };

    return (
        <div className="pt-24">
            <Helmet>
                <title>Contact Us | GoCar</title>
            </Helmet>

            {/* Hero */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-4 text-center">
                <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Get in Touch</p>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Contact Us</h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                    Have a question, a partnership idea, or need help with a booking? Our team is here for you — any time.
                </p>
            </div>

            {/* Main content */}
            <section className="max-w-[1360px] mx-auto px-4 py-20">
                <div className="grid lg:grid-cols-5 gap-12">

                    {/* Contact info cards */}
                    <div className="lg:col-span-2 space-y-5">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Reach Us</h2>

                        {contactInfo.map((info, idx) => (
                            <div key={idx} className="flex gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    {info.icon}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{info.label}</p>
                                    <p className="font-bold text-gray-900">{info.value}</p>
                                    <p className="text-gray-500 text-sm">{info.sub}</p>
                                </div>
                            </div>
                        ))}

                        {/* Social links */}
                        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Follow Us</p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                                    <FaFacebook />
                                </a>
                                <a href="#" className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                                    <FaLinkedin />
                                </a>
                                <a href="#" className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                                    <FaInstagram />
                                </a>
                            </div>
                        </div>

                        {/* Office hours */}
                        <div className="p-5 bg-orange-50 border border-orange-200 rounded-xl">
                            <p className="font-bold text-gray-900 mb-3">Office Hours</p>
                            <div className="space-y-1.5 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Saturday – Thursday</span>
                                    <span className="font-semibold">9:00 AM – 9:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Friday</span>
                                    <span className="font-semibold">2:00 PM – 9:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Emergency support</span>
                                    <span className="font-semibold text-primary">24/7</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact form */}
                    <div className="lg:col-span-3">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-5">
                                <TextField
                                    label="Your Name *"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={inputSx}
                                />
                                <TextField
                                    label="Email Address *"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={inputSx}
                                />
                            </div>
                            <TextField
                                label="Subject"
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                fullWidth
                                sx={inputSx}
                            />
                            <TextField
                                label="Message *"
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={6}
                                placeholder="Tell us how we can help you..."
                                sx={inputSx}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={sending}
                                fullWidth
                                sx={{
                                    backgroundColor: '#F58300', color: '#fff', fontWeight: 700,
                                    textTransform: 'none', py: 1.75, borderRadius: '10px',
                                    fontSize: '16px', '&:hover': { backgroundColor: '#e07500' },
                                    '&.Mui-disabled': { backgroundColor: '#fbbf24', color: '#fff' }
                                }}
                            >
                                {sending ? "Sending..." : "Send Message"}
                            </Button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
