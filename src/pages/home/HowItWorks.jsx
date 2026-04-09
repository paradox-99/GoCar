import { FaCar, FaCarAlt, FaHourglassStart, FaRoad, FaSearch } from "react-icons/fa";
import { GiReturnArrow } from "react-icons/gi";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import 'react-vertical-timeline-component/style.min.css';

const HowItWorks = () => {
     return (
          <div className="mt-20 lg:mt-28">
               <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-4 mb-4">
                         <div className="h-1 w-8 bg-gray-300 rounded-full"></div>
                         <div className="bg-gradient-to-r from-primary to-orange-600 w-20 h-1 rounded-full"></div>
                         <div className="h-1 w-8 bg-gray-300 rounded-full"></div>
                    </div>
                    <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">How It Works</h1>
                    <p className="mt-5 mx-auto max-w-[600px] text-gray-600 text-sm md:text-base">Select your car, book online, and pick it up hassle-free. Flexible rentals, easy payments, and 24/7 customer support.</p>
               </div>
               <div className='mt-10 lg:mt-20'>
                    <VerticalTimeline className='before:!bg-gradient-to-b before:!from-primary before:!to-orange-500'>
                         <VerticalTimelineElement
                              className="vertical-timeline-element--work"
                              contentStyle={{ background: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", borderRadius: "12px", borderLeft: "4px solid #F58300" }}
                              contentArrowStyle={{ borderRight: '12px solid white' }}
                              date="Step 1"
                              dateClassName={"font-bold text-primary text-base"}
                              iconStyle={{ background: '#F58300', color: '#fff', boxShadow: '0 8px 16px rgba(245, 131, 0, 0.3)' }}
                              icon={<FaHourglassStart className="text-xl" />}
                         >
                              <h3 className="text-xl font-bold text-gray-900">Register</h3>
                              <p className='!font-normal text-gray-600 mt-2'>
                                   Create an account with your basic details to get started.
                              </p>
                         </VerticalTimelineElement>

                         <VerticalTimelineElement
                              className="vertical-timeline-element--work"
                              contentStyle={{ background: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", borderRadius: "12px", borderRight: "4px solid #F58300" }}
                              contentArrowStyle={{ borderRight: '12px solid white' }}
                              date="Step 2"
                              dateClassName={"font-bold text-primary text-base"}
                              iconStyle={{ background: '#F58300', color: '#fff', boxShadow: '0 8px 16px rgba(245, 131, 0, 0.3)' }}
                              icon={<FaSearch className="text-xl" />}
                         >
                              <h3 className="text-xl font-bold text-gray-900">Search for a Vehicle</h3>
                              <p className='text-gray-600 !font-normal mt-2'>
                                   Use our search tools to find a vehicle that fits your needs and preferences.
                              </p>
                         </VerticalTimelineElement>

                         <VerticalTimelineElement
                              className="vertical-timeline-element--work"
                              contentStyle={{ background: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", borderRadius: "12px", borderLeft: "4px solid #F58300" }}
                              contentArrowStyle={{ borderRight: '12px solid white' }}
                              date="Step 3"
                              dateClassName={"font-bold text-primary text-base"}
                              iconStyle={{ background: '#F58300', color: '#fff', boxShadow: '0 8px 16px rgba(245, 131, 0, 0.3)' }}
                              icon={<FaCar className="text-xl" />}
                         >
                              <h3 className="text-xl font-bold text-gray-900">Choose Your Vehicle</h3>
                              <p className='text-gray-600 !font-normal mt-2'>
                                   Select the car that suits you from our wide range of vehicles available for rent.
                              </p>
                         </VerticalTimelineElement>

                         <VerticalTimelineElement
                              className="vertical-timeline-element--work"
                              contentStyle={{ background: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", borderRadius: "12px", borderRight: "4px solid #F58300" }}
                              contentArrowStyle={{ borderRight: '12px solid white' }}
                              date="Step 4"
                              dateClassName={"font-bold text-primary text-base"}
                              iconStyle={{ background: '#F58300', color: '#fff', boxShadow: '0 8px 16px rgba(245, 131, 0, 0.3)' }}
                              icon={<FaCarAlt className="text-xl" />}
                         >
                              <h3 className="text-xl font-bold text-gray-900">Pick Up Your Vehicle</h3>
                              <p className='text-gray-600 !font-normal mt-2'>
                                   Visit our location or arrange delivery to pick up your chosen car.
                              </p>
                         </VerticalTimelineElement>

                         <VerticalTimelineElement
                              className="vertical-timeline-element--work"
                              contentStyle={{ background: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", borderRadius: "12px", borderLeft: "4px solid #F58300" }}
                              contentArrowStyle={{ borderRight: '12px solid white' }}
                              date="Step 5"
                              dateClassName={"font-bold text-primary text-base"}
                              iconStyle={{ background: '#F58300', color: '#fff', boxShadow: '0 8px 16px rgba(245, 131, 0, 0.3)' }}
                              icon={<FaRoad className="text-xl" />}
                         >
                              <h3 className="text-xl font-bold text-gray-900">Enjoy Your Ride</h3>
                              <p className='text-gray-600 !font-normal mt-2'>
                                   Drive your rental and enjoy the freedom to travel where you want.
                              </p>
                         </VerticalTimelineElement>
                         <VerticalTimelineElement
                              className="vertical-timeline-element--work"
                              contentStyle={{ background: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", borderRadius: "12px", borderRight: "4px solid #F58300" }}
                              contentArrowStyle={{ borderRight: '12px solid white' }}
                              date="Step 6"
                              dateClassName={"font-bold text-primary text-base"}
                              iconStyle={{ background: '#F58300', color: '#fff', boxShadow: '0 8px 16px rgba(245, 131, 0, 0.3)' }}
                              icon={<GiReturnArrow className="text-xl" />}
                         >
                              <h3 className="text-xl font-bold text-gray-900">Return the Vehicle</h3>
                              <p className='text-gray-600 !font-normal mt-2'>
                                   Return the vehicle to the designated location at the end of your rental period.
                              </p>
                         </VerticalTimelineElement>
                    </VerticalTimeline>
               </div>
          </div>
     );
};

export default HowItWorks;