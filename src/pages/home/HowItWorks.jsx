import { FaCar, FaCarAlt, FaHourglassStart, FaRoad, FaSearch } from "react-icons/fa";
import { GiReturnArrow } from "react-icons/gi";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import 'react-vertical-timeline-component/style.min.css';

const HowItWorks = () => {
     return (
          <div className="mt-28">
               <div className="text-center">
                    <h1 className="mt-4 text-5xl font-bold">How It Works</h1>
                    <p className="mt-5 mx-auto max-w-[600px] lg:w-[600px]">Select your car, book online, and pick it up hassle-free. Flexible rentals, easy payments, and 24/7 customer support.</p>
               </div>
               <div className='mt-10 lg:mt-20'>
                    <VerticalTimeline className='before:!bg-primary'>
                         <VerticalTimelineElement
                              className="vertical-timeline-element--work border-r-primary"
                              contentStyle={{ background: "#ececec", boxShadow: "20px 0px 150px 0px #EDEDED" }}
                              contentArrowStyle={{ borderRight: '15px solid #ececec' }}
                              date="Step 1"
                              dateClassName={"text-heading"}
                              iconStyle={{ background: '#F58300', color: '#fff' }}
                              icon={<FaHourglassStart />}
                         >
                              <h3 className="text-xl font-semibold">Register</h3>
                              <p className='!font-normal'>
                                   Create an account with your basic details to get started.
                              </p>
                         </VerticalTimelineElement>

                         <VerticalTimelineElement
                              className="vertical-timeline-element--work border-r-primary"
                              contentStyle={{ background: "#ececec", boxShadow: "20px 0px 150px 0px #EDEDED" }}
                              contentArrowStyle={{ borderRight: '15px solid #ececec' }}
                              date="Step 2"
                              dateClassName={"text-heading"}
                              iconStyle={{ background: '#F58300', color: '#fff' }}
                              icon={<FaSearch />}
                         >
                              <h3 className="text-2xl">Search for a Vehicle</h3>
                              <p className='font-secondary leading-[26px] !font-normal'>
                                   Use our search tools to find a vehicle that fits your needs and preferences.
                              </p>
                         </VerticalTimelineElement>

                         <VerticalTimelineElement
                              className="vertical-timeline-element--work border-r-primary"
                              contentStyle={{ background: "#ececec", boxShadow: "20px 0px 150px 0px #EDEDED" }}
                              contentArrowStyle={{ borderRight: '15px solid #ececec' }}
                              date="Step 3"
                              dateClassName={"text-heading"}
                              iconStyle={{ background: '#F58300', color: '#fff' }}
                              icon={<FaCar />}
                         >
                              <h3 className="text-2xl">Choose Your Vehicle</h3>
                              <p className='font-secondary leading-[26px] !font-normal'>
                                   Select the car that suits you from our wide range of vehicles available for rent.
                              </p>
                         </VerticalTimelineElement>

                         <VerticalTimelineElement
                              className="vertical-timeline-element--work border-r-primary"
                              contentStyle={{ background: "#ececec", boxShadow: "20px 0px 150px 0px #EDEDED" }}
                              contentArrowStyle={{ borderRight: '15px solid #ececec' }}
                              date="Step 4"
                              dateClassName={"text-heading"}
                              iconStyle={{ background: '#F58300', color: '#fff' }}
                              icon={<FaCarAlt />}
                         >
                              <h3 className="text-2xl">Pick Up Your Vehicle</h3>
                              <p className='font-secondary leading-[26px] !font-normal'>
                                   Visit our location or arrange delivery to pick up your chosen car.
                              </p>
                         </VerticalTimelineElement>

                         <VerticalTimelineElement
                              className="vertical-timeline-element--work border-r-primary"
                              contentStyle={{ background: "#ececec", boxShadow: "20px 0px 150px 0px #EDEDED" }}
                              contentArrowStyle={{ borderRight: '15px solid #ececec' }}
                              date="Step 5"
                              dateClassName={"text-heading"}
                              iconStyle={{ background: '#F58300', color: '#fff' }}
                              icon={<FaRoad />}
                         >
                              <h3 className="text-2xl">Enjoy Your Ride</h3>
                              <p className='font-secondary leading-[26px] !font-normal'>
                                   Drive your rental and enjoy the freedom to travel where you want.
                              </p>
                         </VerticalTimelineElement>
                         <VerticalTimelineElement
                              className="vertical-timeline-element--work border-r-primary"
                              contentStyle={{ background: "#ececec", boxShadow: "20px 0px 150px 0px #EDEDED" }}
                              contentArrowStyle={{ borderRight: '15px solid #ececec' }}
                              date="Step 6"
                              dateClassName={"text-heading"}
                              iconStyle={{ background: '#F58300', color: '#fff' }}
                              icon={<GiReturnArrow />}
                         >
                              <h3 className="text-2xl">Return the Vehicle</h3>
                              <p className='font-secondary leading-[26px] !font-normal'>
                                   Return the vehicle to the designated location at the end of your rental period.
                              </p>
                         </VerticalTimelineElement>
                    </VerticalTimeline>
               </div>
          </div>
     );
};

export default HowItWorks;