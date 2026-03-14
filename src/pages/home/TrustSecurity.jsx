import { HiCheckCircle, HiShieldCheck, HiPhone, HiLockClosed } from 'react-icons/hi';

const TrustSecurity = () => {
  const features = [
    {
      icon: HiShieldCheck,
      title: 'Verified Partners',
      description: 'All agencies undergo strict verification and background checks',
    },
    {
      icon: HiLockClosed,
      title: 'Secure Payments',
      description: 'All transactions protected with SSL encryption technology',
    },
    {
      icon: HiCheckCircle,
      title: 'Verified Vehicles',
      description: 'Every vehicle inspected and documented for your safety',
    },
    {
      icon: HiPhone,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for any assistance',
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Safety is Our Priority
          </h2>
          <p className="text-gray-600 text-lg">
            We maintain the highest standards of security and trust
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                <Icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-8 bg-orange-50 rounded-lg border-l-4 border-primary">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Insurance Protection
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            All our rental vehicles come with comprehensive third-party and collision insurance coverage. This protects you and your investment in case of accidents or damages. For additional peace of mind, you can opt for premium coverage with zero deductible.
          </p>
          <p className="text-gray-700">
            Our insurance partners are among the most trusted in Bangladesh, ensuring quick claim processing and reliable support when you need it.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TrustSecurity;
