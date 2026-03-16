import { useEffect, useState } from 'react';

const Stats = () => {
  const [counts, setCounts] = useState({
    cars: 0,
    customers: 0,
    bookings: 0,
    cities: 0,
  });

  useEffect(() => {
    // Animate numbers on scroll into view
    const timer = setTimeout(() => {
      setCounts({
        cars: 5000,
        customers: 25000,
        bookings: 50000,
        cities: 15,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Vehicles Available', value: counts.cars, suffix: '+' },
    { label: 'Happy Customers', value: counts.customers, suffix: '+' },
    { label: 'Successful Bookings', value: counts.bookings, suffix: '+' },
    { label: 'Cities Served', value: counts.cities, suffix: '+' },
  ];

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose goCar?
          </h2>
          <p className="text-gray-400 text-lg">
            Trusted by thousands of customers across Bangladesh
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300"
            >
              <div className="mb-2">
                {index === 0 && <div className="text-4xl mb-2">🚗</div>}
                {index === 1 && <div className="text-4xl mb-2">👥</div>}
                {index === 2 && <div className="text-4xl mb-2">✅</div>}
                {index === 3 && <div className="text-4xl mb-2">📍</div>}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value.toLocaleString()}
                <span className="text-2xl">{stat.suffix}</span>
              </div>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
