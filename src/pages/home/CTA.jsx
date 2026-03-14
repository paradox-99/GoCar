import { Link } from 'react-router-dom';
import { MdArrowForward } from 'react-icons/md';

const CTA = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-orange-600 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-primary rounded-full opacity-10"></div>
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-primary rounded-full opacity-10"></div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Book Your Next Ride?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust goCar for affordable, reliable car rentals across Bangladesh.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-50 transition-colors duration-300"
            >
              Start Booking Now
              <MdArrowForward className="w-5 h-5" />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-primary transition-colors duration-300"
            >
              Become a Partner
              <MdArrowForward className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
