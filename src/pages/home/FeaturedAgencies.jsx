import { Link } from 'react-router-dom';
import { HiStar } from 'react-icons/hi';

const FeaturedAgencies = () => {
  const agencies = [
    {
      id: 1,
      name: 'Premium Cars Ltd',
      rating: 4.8,
      reviews: 245,
      cars: 35,
      image: 'https://via.placeholder.com/300x200?text=Premium+Cars',
      badge: 'Verified Partner',
    },
    {
      id: 2,
      name: 'Dhaka Auto Rentals',
      rating: 4.7,
      reviews: 189,
      cars: 28,
      image: 'https://via.placeholder.com/300x200?text=Dhaka+Auto',
      badge: 'Top Rated',
    },
    {
      id: 3,
      name: 'Budget Wheels BD',
      rating: 4.6,
      reviews: 156,
      cars: 42,
      image: 'https://via.placeholder.com/300x200?text=Budget+Wheels',
      badge: 'Most Popular',
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Partners
          </h2>
          <p className="text-gray-600 text-lg">
            Trusted agencies providing quality vehicles and excellent service
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {agencies.map((agency) => (
            <div
              key={agency.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative">
                <img
                  src={agency.image}
                  alt={agency.name}
                  className="w-full h-48 object-cover"
                />
                <span className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {agency.badge}
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {agency.name}
                </h3>

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <HiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(agency.rating)
                            ? 'text-primary'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {agency.rating} ({agency.reviews} reviews)
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <span className="text-gray-600">
                    <span className="font-bold text-lg text-primary">
                      {agency.cars}
                    </span>{' '}
                    vehicles
                  </span>
                </div>

                <Link
                  to={`/agency/${agency.id}`}
                  className="w-full inline-block text-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity duration-300"
                >
                  View Agency
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/agencies"
            className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-300"
          >
            Browse All Agencies
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAgencies;
