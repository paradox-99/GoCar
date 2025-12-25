import { Box, Button, Dialog, Divider, styled, Tab, Tabs } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import DriverCart from "./DriverCart";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import moment from 'moment';
import useDesignation from "../../hooks/useDesignation";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
     '& .MuiDialogContent-root': {
          padding: theme.spacing(2),
     },
     '& .MuiDialogActions-root': {
          padding: theme.spacing(1),
     },
}));

function CustomTabPanel(props) {
     const { children, value, index, ...other } = props;

     return (
          <div
               role="tabpanel"
               hidden={value !== index}
               id={`simple-tabpanel-${index}`}
               aria-labelledby={`simple-tab-${index}`}
               {...other}
          >
               {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
          </div>
     );
}

CustomTabPanel.propTypes = {
     children: PropTypes.node,
     index: PropTypes.number.isRequired,
     value: PropTypes.number.isRequired,
};

function a11yProps(index) {
     return {
          id: `simple-tab-${index}`,
          'aria-controls': `simple-tabpanel-${index}`,
     };
}

const Booking = () => {

     const { user } = useAuth();
     const location = useLocation();
     const navigate = useNavigate();
     const { bookingData } = location?.state || {};
     const [value, setValue] = useState(0);
     const axiosPublic = useAxiosPublic();
     const [driverData, setDriverData] = useState();
     const [selectedDriver, setSelectedDriver] = useState();
     const { userInfo } = useDesignation();

     const carInfo = bookingData.car;
     const bookingDate = bookingData?.carBookingInfo;

     const [fromTs, setFromTs] = useState(bookingDate?.fromTs || "");
     const [untilTs, setUntilTs] = useState(bookingDate?.untilTs || "");
     const currentTime = moment();
     const [open, setOpen] = useState(false);
     const [open2, setOpen2] = useState(false);
     const [diff, setDiff] = useState();
     const [bookingPurpose, setBookingPurpose] = useState("");
     const [estimatedDestination, setEstimatedDestination] = useState("");
     let diffInHours = 0;

     const { data } = useQuery({
          queryKey: ['getOwner'],
          queryFn: async () => {
               const response = await axiosPublic.get(`agencyRoutes/getAgencyDetails/${carInfo?.agency_id}`);
               return response.data;
          }
     })

     const getFromDateAndTime = (e) => {
          const fromDateTime = moment(e);
          setFromTs(fromDateTime.format());
     }

     const getUntilDateAndTime = (e) => {
          const untilDateTime = moment(e);
          setUntilTs(untilDateTime.format());

          const fromDateTime = moment(fromTs);
          const toDateTime = moment(untilDateTime);
          const diffHours = toDateTime.diff(fromDateTime, 'hours');

          if (diffHours < 10) {
               toast.error("You have to select at least 10 hours");
               setUntilTs("");
               return;
          }

          setDiff(diffHours);
     }

     const handleChange = (event, newValue) => {
          setValue(newValue);
     };

     const selectDriver = async () => {
          const searchParams = { lat: bookingDate?.lat, lon: bookingDate?.lon };

          const drivers = await axiosPublic.get(`driverRoutes/driverList`, { params: searchParams });
          setDriverData(drivers.data);
     }


     const handleClickOpen = () => {
          if (!user) {
               toast.error('Please login in first.')
               return
          }
          setOpen(true);
          selectDriver();
     };

     const handleClose = () => {
          setOpen(false);
     };

     const handleClickOpen2 = () => {
          if (!user) {
               toast.error('Please login in first.')
               return
          }
          setOpen2(true);
     };

     const handleClose2 = () => {
          setOpen2(false);
     };

     const fromDatetime = new Date(moment(fromTs).format('YYYY-MM-DDTHH:mm:ss'));
     const toDatetime = new Date(moment(untilTs).format('YYYY-MM-DDTHH:mm:ss'));

     const fromDateTime = moment(fromTs);
     const toDateTime = moment(untilTs);
     diffInHours = toDateTime.diff(fromDateTime, 'hours');

     const driver_fee = selectedDriver?.rental_price * (diff || diffInHours) || 0;
     const final_total = (carInfo.rental_price * (diff || diffInHours) + driver_fee);
     const initial_payment = (carInfo.rental_price * (diff || diffInHours) + driver_fee) * 0.5;

     const handleBooking = async () => {
          const vehicle_type = carInfo.fuel_capacity ? 'Bike' : 'Car';
          const driver_cost = driver_fee;
          const start_ts = fromDatetime;
          const end_ts = toDatetime;
          const total_cost = final_total;
          const total_rent_hours = diffInHours;
          const user_id = userInfo.user_id;
          const vehicle_id = carInfo.car_id ? carInfo.car_id : carInfo.bike_id;
          const booking_purpose = bookingPurpose;
          const estimated_destination = estimatedDestination;
          const driver_id = selectedDriver ? selectedDriver.driver_id : null;

          if (!fromTs || !untilTs) {
               toast.error("Please select pick-up and drop-off date & time.");
               return;
          }

          if (!bookingPurpose) {
               toast.error("Please enter booking purpose.");
               return;
          }

          if (!estimatedDestination) {
               toast.error("Please enter estimated destination.");
               return;
          }

          const data = { vehicle_type, driver_cost, start_ts, end_ts, total_cost, total_rent_hours, user_id, vehicle_id, booking_purpose, estimated_destination, driver_id };

          try {
               const response = await axiosPublic.post('bookingRoutes/createBooking', data);
               
               if (response.data) {
                    toast.success("Booking request sent successfully!");
                    handleClose2();
                    navigate('/booking-success', { 
                         state: { 
                              bookingData: {
                                   ...response.data,
                                   car: carInfo,
                                   booking_purpose: bookingPurpose,
                                   estimated_destination: estimatedDestination
                              }
                         } 
                    });
               }
          } catch (error) {
               toast.error(error.response?.data?.message || "Failed to send booking request. Please try again.");
          }
     }

     return (
          <div className="pt-24 pb-12 bg-white">
               <div className="max-w-[1360px] mx-auto px-4 lg:px-6">
                    <h1 className="text-3xl font-bold mb-8 text-gray-800">Booking Details</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         {/* LEFT SECTION */}
                         <div className="lg:col-span-2">
                              {/* CAR INFO */}
                              <div className="border border-gray-200 rounded-lg p-6 mb-6">
                                   <h2 className="text-2xl font-semibold mb-6 text-gray-800">Selected Car</h2>
                                   <div className="flex flex-col md:flex-row gap-6">
                                        <img
                                             src={carInfo.images}
                                             alt={`${carInfo.brand} ${carInfo.model}`}
                                             className="w-96 rounded-lg"
                                        />
                                        <div className="flex-1">
                                             <h3 className="text-3xl font-bold text-gray-800 mb-4">{carInfo.brand} {carInfo.model}</h3>
                                             <div className="space-y-3">
                                                  {
                                                       carInfo.seats &&
                                                       <p className="text-gray-700"><span className="font-semibold">Seats:</span> {carInfo.seats}</p>
                                                  }
                                                  <p className="text-gray-700"><span className="font-semibold">Fuel:</span> {carInfo.fuel}</p>
                                                  <p className="text-gray-700"><span className="font-semibold">Price:</span> <span className="text-lg font-bold text-orange-600">{carInfo.rental_price} Tk/hr</span></p>
                                             </div>
                                        </div>
                                   </div>
                              </div>

                              {/* TABS */}
                              <div className="border border-gray-200 rounded-lg overflow-hidden">
                                   <Box sx={{ width: '100%' }}>
                                        <Box sx={{ borderBottom: 1, borderColor: '#e5e7eb', bgcolor: '#f9fafb' }}>
                                             <Tabs
                                                  value={value}
                                                  onChange={handleChange}
                                                  sx={{
                                                       '& .MuiTab-root': {
                                                            fontWeight: 600,
                                                            color: '#666',
                                                            '&.Mui-selected': {
                                                                 color: '#f58300'
                                                            }
                                                       },
                                                       '& .MuiTabs-indicator': {
                                                            backgroundColor: '#f58300'
                                                       }
                                                  }}
                                             >
                                                  <Tab label="Vehicle Details" {...a11yProps(0)} />
                                                  <Tab label="Agency" {...a11yProps(1)} />
                                                  <Tab label="Driver" {...a11yProps(2)} />
                                             </Tabs>
                                        </Box>
                                        <CustomTabPanel value={value} index={0}>
                                             <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                       <p className="text-gray-600 text-sm">Build Year</p>
                                                       <p className="text-lg font-semibold text-gray-800">{carInfo.build_year}</p>
                                                  </div>
                                                  <div>
                                                       <p className="text-gray-600 text-sm">License</p>
                                                       <p className="text-lg font-semibold text-green-600">Verified</p>
                                                  </div>
                                                  <div>
                                                       <p className="text-gray-600 text-sm">Gear</p>
                                                       <p className="text-lg font-semibold text-gray-800">{carInfo.gear}</p>
                                                  </div>
                                                  {
                                                       carInfo.transmission_type ?
                                                            <div>
                                                                 <p className="text-gray-600 text-sm">Transmission</p>
                                                                 <p className="text-lg font-semibold text-gray-800">{carInfo.transmission_type}</p>
                                                            </div> :
                                                            <div>
                                                                 <p className="text-gray-600 text-sm">Fuel Capacity</p>
                                                                 <p className="text-lg font-semibold text-gray-800">{carInfo.fuel_capacity} Liter</p>
                                                            </div>

                                                  }
                                                  <div>
                                                       <p className="text-gray-600 text-sm">Mileage</p>
                                                       <p className="text-lg font-semibold text-gray-800">{carInfo.mileage}</p>
                                                  </div>
                                                  <div>
                                                       <p className="text-gray-600 text-sm">Car Type</p>
                                                       <p className="text-lg font-semibold text-gray-800">{carInfo.car_type}</p>
                                                  </div>
                                             </div>
                                        </CustomTabPanel>
                                        <CustomTabPanel value={value} index={1}>
                                             <div className="space-y-4">
                                                  <div className="border-b pb-3">
                                                       <p className="text-gray-600 text-sm">Agency Name</p>
                                                       <p className="text-lg font-semibold text-gray-800">{data?.agency_name}</p>
                                                  </div>
                                                  <div className="border-b pb-3">
                                                       <p className="text-gray-600 text-sm">Email</p>
                                                       <p className="text-lg font-semibold text-gray-800">{data?.email}</p>
                                                  </div>
                                                  <div className="border-b pb-3">
                                                       <p className="text-gray-600 text-sm">Phone</p>
                                                       <p className="text-lg font-semibold text-gray-800">{data?.phone_number}</p>
                                                  </div>
                                                  <div>
                                                       <p className="text-gray-600 text-sm">Address</p>
                                                       <p className="text-lg font-semibold text-gray-800">{data?.display_name}</p>
                                                  </div>
                                             </div>
                                        </CustomTabPanel>
                                        <CustomTabPanel value={value} index={2}>
                                             {carInfo?.fuel_capacity ?
                                                  <p className="text-gray-700 m-4 p-10 text-xl text-center">Driver is not available for bikes.</p> :
                                                  <>
                                                       {
                                                            selectedDriver ?
                                                                 <div className="space-y-3">
                                                                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                                                                           <p className="text-gray-600 text-sm mb-1">Driver Selected</p>
                                                                           <p className="text-xl font-bold text-green-700">{selectedDriver?.name}</p>
                                                                      </div>
                                                                      <div className="border-b pb-3">
                                                                           <p className="text-gray-600 text-sm">Phone</p>
                                                                           <p className="text-lg font-semibold text-gray-800">{selectedDriver.phone}</p>
                                                                      </div>
                                                                      <div className="border-b pb-3">
                                                                           <p className="text-gray-600 text-sm">Address</p>
                                                                           <p className="text-lg font-semibold text-gray-800">{selectedDriver.display_name}</p>
                                                                      </div>
                                                                      <div className="border-b pb-3">
                                                                           <p className="text-gray-600 text-sm">Experience</p>
                                                                           <p className="text-lg font-semibold text-gray-800">{selectedDriver.experience} years</p>
                                                                      </div>
                                                                      <div>
                                                                           <p className="text-gray-600 text-sm">Hourly Rate</p>
                                                                           <p className="text-lg font-semibold text-gray-800">{selectedDriver.rental_price} Tk/hour</p>
                                                                      </div>
                                                                 </div> :
                                                                 <div className="flex justify-center py-8">
                                                                      <Button
                                                                           onClick={handleClickOpen}
                                                                           variant="contained"
                                                                           sx={{
                                                                                background: '#f58300',
                                                                                px: 3,
                                                                                py: 1.2,
                                                                                fontSize: '15px',
                                                                                fontWeight: 600
                                                                           }}
                                                                      >
                                                                           Select Driver
                                                                      </Button>
                                                                 </div>
                                                       }</>}
                                        </CustomTabPanel>
                                   </Box>
                              </div>
                         </div>

                         {/* RIGHT SECTION - SUMMARY */}
                         <div className="lg:col-span-1">
                              <div className="border border-gray-200 rounded-lg p-6 sticky top-24">
                                   <h2 className="text-2xl font-semibold mb-6 text-gray-800">Booking Summary</h2>

                                   <div className="space-y-5">
                                        <div>
                                             <label className="block text-sm font-semibold text-gray-700 mb-2">Pick-up Date & Time</label>
                                             <LocalizationProvider dateAdapter={AdapterMoment}>
                                                  <DemoContainer components={['DateTimePicker']}>
                                                       <DateTimePicker
                                                            label="Start"
                                                            onChange={getFromDateAndTime}
                                                            minDate={currentTime}
                                                            maxDate={moment(currentTime.clone().add(3, "months"))}
                                                            defaultValue={fromTs ? moment(fromTs) : null}
                                                            slotProps={{ textField: { size: 'small', required: true, fullWidth: true } }}
                                                       />
                                                  </DemoContainer>
                                             </LocalizationProvider>
                                        </div>

                                        <div>
                                             <label className="block text-sm font-semibold text-gray-700 mb-2">Drop-off Date & Time</label>
                                             <LocalizationProvider dateAdapter={AdapterMoment}>
                                                  <DemoContainer components={['DateTimePicker']}>
                                                       <DateTimePicker
                                                            label="End"
                                                            onChange={getUntilDateAndTime}
                                                            minDate={currentTime}
                                                            maxDate={moment(currentTime.clone().add(3, "months"))}
                                                            defaultValue={untilTs ? moment(untilTs) : null}
                                                            slotProps={{ textField: { size: 'small', required: true, fullWidth: true } }}
                                                       />
                                                  </DemoContainer>
                                             </LocalizationProvider>
                                        </div>

                                        <Divider sx={{ my: 2 }} />

                                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                             <div className="flex justify-between">
                                                  <span className="text-gray-700 font-semibold">Hours:</span>
                                                  <span className="font-bold text-gray-800">{diff || diffInHours} hrs</span>
                                             </div>
                                             <div className="flex justify-between">
                                                  <span className="text-gray-700 font-semibold">Rate:</span>
                                                  <span className="font-bold text-gray-800">{carInfo.rental_price} Tk/hr</span>
                                             </div>
                                             <div className="flex justify-between pt-2 border-t">
                                                  <span className="text-gray-700 font-semibold">Car Rental:</span>
                                                  <span className="font-bold text-gray-800">
                                                       {diff && `${carInfo.rental_price * (diff)} Tk`}
                                                       {diffInHours !== NaN && !diff && `${carInfo.rental_price * (diffInHours)} Tk`}
                                                  </span>
                                             </div>
                                             {driver_fee > 0 && (
                                                  <div className="flex justify-between">
                                                       <span className="text-gray-700 font-semibold">Driver Fee:</span>
                                                       <span className="font-bold text-gray-800">{driver_fee} Tk</span>
                                                  </div>
                                             )}
                                             <div className="flex justify-between">
                                                  <span className="text-gray-700 font-semibold">Discount:</span>
                                                  <span className="font-bold text-gray-800">-{0} Tk</span>
                                             </div>
                                        </div>

                                        <Divider sx={{ my: 2 }} />

                                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                             <div className="flex justify-between mb-3">
                                                  <span className="text-gray-800 font-semibold">Total:</span>
                                                  <span className="text-2xl font-bold text-orange-600">৳ {final_total}</span>
                                             </div>
                                             <div className="flex justify-between pt-3 border-t border-orange-300">
                                                  <span className="text-gray-700 text-sm">Initial Payment (50%):</span>
                                                  <span className="text-xl font-bold text-orange-600">৳ {initial_payment}</span>
                                             </div>
                                        </div>

                                        <Button
                                             onClick={handleClickOpen2}
                                             variant="contained"
                                             fullWidth
                                             sx={{
                                                  background: '#f58300',
                                                  py: 1.5,
                                                  fontSize: '16px',
                                                  fontWeight: 700,
                                                  borderRadius: '6px',
                                                  mt: 2,
                                                  '&:hover': {
                                                       background: '#e07b00'
                                                  }
                                             }}
                                        >
                                             Next
                                        </Button>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
               <BootstrapDialog
                    onClose={handleClose}
                    aria-labelledby="customized-dialog-title"
                    open={open}
                    fullWidth
                    maxWidth="1150px"
                    sx={{ padding: 3 }}
               >
                    <div className="pb-0">
                         <div className="p-6 bg-gray-50 border-b">
                              <h1 className="text-2xl font-bold text-gray-800">Available Drivers</h1>
                         </div>
                         <div className="flex flex-wrap p-6 gap-6 justify-center min-h-[400px] bg-white ">
                              {
                                   driverData?.map(driver => <DriverCart
                                        key={driver._id}
                                        driver={driver}
                                        setSelectedDriver={setSelectedDriver}
                                        handleClose={handleClose}
                                   >
                                   </DriverCart>)
                              }
                         </div>
                    </div>
               </BootstrapDialog>
               <BootstrapDialog
                    onClose={handleClose2}
                    aria-labelledby="customized-dialog-title"
                    open={open2}
                    fullWidth
                    maxWidth="sm"
               >
                    <div className="p-6">
                         <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-gray-600 text-sm mb-3 font-semibold">Booking Purpose</p>
                              <input
                                   type="text"
                                   placeholder="Enter booking purpose (e.g., Business, Tourist, Medical)"
                                   value={bookingPurpose}
                                   onChange={(e) => setBookingPurpose(e.target.value)}
                                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mb-3"
                              />
                              <input
                                   type="text"
                                   placeholder="Estimated destination or route"
                                   value={estimatedDestination}
                                   onChange={(e) => setEstimatedDestination(e.target.value)}
                                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                         </div>

                         <div className="flex gap-3">
                              <Button
                                   onClick={handleClose2}
                                   variant="outlined"
                                   fullWidth
                                   sx={{
                                        borderColor: '#ddd',
                                        color: '#666',
                                        py: 1,
                                        fontWeight: 600,
                                        fontSize: 14
                                   }}
                              >
                                   Cancel
                              </Button>
                              <Button
                                   onClick={handleBooking}
                                   variant="contained"
                                   fullWidth
                                   sx={{
                                        background: '#f58300',
                                        color: "white",
                                        py: 1,
                                        fontWeight: 600,
                                        fontSize: 18,
                                        '&:hover': {
                                             background: '#e07b00'
                                        },
                                        textTransform: 'none'
                                   }}
                              >
                                  Send Request
                              </Button>
                         </div>
                    </div>
               </BootstrapDialog>
          </div>
     );
};

export default Booking;