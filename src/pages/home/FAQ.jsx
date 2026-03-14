import { useState } from 'react';
import { MdAdd, MdRemove } from 'react-icons/md';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'How do I book a car on goCar?',
      answer:
        'Simply select your pickup and drop-off location, choose your travel dates, and browse available cars. Once you find the perfect car, complete your booking with just a few clicks and make payment securely.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit/debit cards (Visa, Mastercard), mobile banking (Bkash, Nagad, Rocket), and bank transfers. All transactions are encrypted and secure.',
    },
    {
      question: "What's included in the rental price?",
      answer:
        'Our rental prices include vehicle use, comprehensive insurance coverage, roadside assistance 24/7, and unlimited kilometers. Additional services like extra drivers or GPS navigation are available at checkout.',
    },
    {
      question: 'What is your cancellation policy?',
      answer:
        'Cancellations made 48 hours before pickup receive a full refund. Cancellations within 48 hours incur a 25% cancellation fee. No-shows are charged the full rental amount.',
    },
    {
      question: 'Is the platform secure and safe?',
      answer:
        'Yes! All customer data is encrypted with SSL security. All drivers are verified with background checks, vehicles are regularly inspected, and we maintain 24/7 customer support for your safety.',
    },
    {
      question: 'What age do I need to be to rent a car?',
      answer:
        'You must be at least 18 years old with a valid driver\'s license. Some premium vehicles require drivers to be 21 or older. A valid national ID is also required.',
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-lg">
            Find answers to common questions about goCar rental service
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-primary hover:border-opacity-50 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-orange-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 text-left">
                  {faq.question}
                </h3>
                <div className="ml-4 flex-shrink-0">
                  {openIndex === index ? (
                    <MdRemove className="w-6 h-6 text-primary" />
                  ) : (
                    <MdAdd className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-white border-t border-gray-200">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
