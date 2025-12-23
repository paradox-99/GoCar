import { Box, Button, Dialog, Divider, styled, Tab, Tabs } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useState } from "react";
import { useLocation } from "react-router-dom";
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
     const { bookingData } = location?.state || {};
     const [value, setValue] = useState(0);
     const axiosPublic = useAxiosPublic();
     const [driverData, setDriverData] = useState();
     const [selectedDriver, setSelectedDriver] = useState();
     const { userInfo } = useDesignation();

     console.log(userInfo);
     

     const carInfo = bookingData.car;
     const bookingDate = bookingData?.carBookingInfo;

     const [fromTs, setFromTs] = useState(bookingDate?.fromTs || "");
     const [untilTs, setUntilTs] = useState(bookingDate?.untilTs || "");
     const currentTime = moment();
     const [open, setOpen] = useState(false);
     const [open2, setOpen2] = useState(false);
     const [diff, setDiff] = useState();
     let diffInHours = 0

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

          if(diffHours < 10 ){
               toast.error("You have to select at least 10 hours");
               setUntilTs("");
               return;
          }

          setDiff(diffHours);     }

     const handleChange = (event, newValue) => {
          setValue(newValue);
     };

     const selectDriver = async () => {
          const drivers = await axiosPublic.get(`driverRoutes/driverList/${carInfo.district}`);
          setDriverData(drivers.data);
     }


     const handleClickOpen = () => {
          if(!user){
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
          if(!user){
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

     const driver_fee = selectedDriver?.hiring_price * ( diff || diffInHours) || 0;
     const final_total = (carInfo.rental_price * ( diff || diffInHours) + driver_fee);
     const initial_payment = (carInfo.rental_price * ( diff || diffInHours) + driver_fee) * 0.5;

     const handleBooking = async () => {
          const driver_cost = driver_fee;
          const pickup_date = fromDatetime;
          const dropoff_date = toDatetime;
          const total_cost = final_total;
          const initial_cost = initial_payment;
          const total_rent_hours = diffInHours;
          const user_id = userInfo.user_id;
          const name = userInfo.name;
          const email = userInfo.email;
          const phone = userInfo.phone;
          const address = userInfo.area;
          const vehicle_id = carInfo.vehicle_id;

          const data = { driver_cost, pickup_date, dropoff_date, total_cost, initial_cost, total_rent_hours, user_id, name, email, phone, address, vehicle_id };

          const response = await axiosPublic.post('paymentRoutes/payment', data);
          window.location.replace(response.data.url);
     }

     return (
          <div className="pt-24 max-w-[1360px] mx-auto lg:px-6 ">
               <div className="p-4 shadow-lg flex justify-between">
                    <div className="w-[60%]">
                         <h2 className="text-center text-2xl font-bold mb-10">Selected Car</h2>
                         <div className="flex items-center gap-5">
                              <img src={carInfo.images} alt="" className="w-96" />
                              <div>
                                   <h3 className="text-xl font-semibold text-primary">{carInfo.brand} {carInfo.model}</h3>
                                   <p className="">Seats: {carInfo.seats}</p>
                                   <p className="">Fuel: {carInfo.fuel}</p>
                                   <p className="">Price: {carInfo.rental_price} tk/hr</p>
                              </div>
                         </div>
                         <div className="mt-10">
                              <Box sx={{ width: '100%' }}>
                                   <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                             <Tab label="Car Information" {...a11yProps(0)} />
                                             <Tab label="Agency Information" {...a11yProps(1)} />
                                             <Tab label="Driver Information" {...a11yProps(2)} />
                                        </Tabs>
                                   </Box>
                                   <CustomTabPanel value={value} index={0}>
                                        <div className="space-y-1">
                                             <h1><span className="font-bold">Build Year:</span> {carInfo.build_year}</h1>
                                             <h1><span className="font-bold">License:</span> Verified</h1>
                                             <h1><span className="font-bold">Gear:</span> {carInfo.gear}</h1>
                                             <h1><span className="font-bold">Transmission type:</span> {carInfo.transmission_type}</h1>
                                             <h1><span className="font-bold">Mileage:</span> {carInfo.mileage}</h1>
                                             <h1><span className="font-bold">Car Type:</span> {carInfo.car_type}</h1>
                                        </div>
                                   </CustomTabPanel>
                                   <CustomTabPanel value={value} index={1}>
                                        <div className="space-y-1">
                                             <h1><span className="font-bold">Name:</span> {data?.agency_name}</h1>
                                             <h1><span className="font-bold">Agency email:</span> {data?.email}</h1>
                                             <h1><span className="font-bold">Agency Phone:</span> {data?.phone_number}</h1>
                                             <h1><span className="font-bold">Address:</span> {data?.display_name}</h1>
                                        </div>
                                   </CustomTabPanel>
                                   <CustomTabPanel value={value} index={2}>
                                        {
                                             selectedDriver ?
                                                  <div>
                                                       <h1><span className="font-bold">Name:</span> {selectedDriver?.name}</h1>
                                                       <h1><span className="font-bold">Email:</span> {selectedDriver.email}</h1>
                                                       <h1><span className="font-bold">Phone:</span> {selectedDriver.phone}</h1>
                                                       <h1><span className="font-bold">Address:</span> {selectedDriver.area}</h1>
                                                       <h1><span className="font-bold">Experience:</span> {selectedDriver.experience} years</h1>
                                                       <h1><span className="font-bold">Price:</span> {selectedDriver.hiring_price} Tk/hour</h1>
                                                  </div> :
                                                  <div className="flex justify-center">
                                                       <Button onClick={handleClickOpen} variant="contained" sx={{ background: '#f58300' }}>Select Driver</Button>
                                                  </div>
                                        }
                                   </CustomTabPanel>
                              </Box>
                         </div>
                    </div>
                    <Divider orientation="vertical" variant="middle" flexItem />
                    <div className="w-[40%]">
                         <h2 className="text-center text-2xl font-bold mb-5">Booking Information</h2>
                         <div className="space-y-4 ml-5">
                              <div className="flex items-center gap-5">
                                   <h1 className="font-semibold text-lg w-48">Start Time: </h1>
                                   <LocalizationProvider dateAdapter={AdapterMoment}>
                                        <DemoContainer components={['DateTimePicker']}>
                                             <DateTimePicker label="From" name='fromDate&Time' onChange={getFromDateAndTime} minDate={currentTime} maxDate={moment(currentTime.clone().add(3, "months"))} defaultValue={fromTs ? moment(fromTs) : null} slotProps={{ textField: { size: 'small', required: true } }} />
                                        </DemoContainer>
                                   </LocalizationProvider>
                              </div>
                              <div className="flex items-center gap-5">
                                   <h1 className="font-semibold text-lg w-48">End Time:</h1>
                                   <LocalizationProvider dateAdapter={AdapterMoment}>
                                        <DemoContainer components={['DateTimePicker']}>
                                             <DateTimePicker label="Until" name='untilDate&Time' onChange={getUntilDateAndTime} minDate={currentTime} maxDate={moment(currentTime.clone().add(3, "months"))} defaultValue={untilTs ? moment(untilTs) : null} slotProps={{ textField: { size: 'small', required: true } }} />
                                        </DemoContainer>
                                   </LocalizationProvider>
                              </div>
                              <div className="flex items-center gap-5">
                                   <h1 className="font-semibold text-lg w-48">Driving option:</h1>
                                   <p>{selectedDriver ? "Driver" : "Self Driving"}</p>
                              </div>
                              <Divider />
                              <div className="flex items-center gap-5">
                                   <h1 className="font-semibold text-lg w-48">Total Hour:</h1>
                                   <p>{diff || diffInHours} hours</p>
                              </div>
                              <div className="flex items-center gap-5">
                                   <h1 className="font-semibold text-lg w-48">Rent:</h1>
                                   <p>{carInfo.rental_price} Tk/hour</p>
                              </div>
                              <div className="flex items-center gap-5">
                                   <h1 className="font-semibold text-lg w-48">Total Rental Price:</h1>
                                   {
                                        diff && <p>{carInfo.rental_price * (diff)} Tk</p>
                                   }
                                   {
                                        diffInHours === isNaN() && <p>{carInfo.rental_price * (diffInHours)} Tk</p>
                                   }
                              </div>
                              <div className="flex items-center gap-5">
                                   <h1 className="font-semibold text-lg w-48">Driver Fee:</h1>
                                   <p>{driver_fee} Tk</p>
                              </div>
                              <div className="flex items-center gap-5">
                                   <h1 className="font-semibold text-lg w-48">Discount:</h1>
                                   <p>{0} Tk</p>
                              </div>
                              <div className="flex items-center gap-5">
                                   <h1 className="font-semibold text-lg w-48">Grand Total:</h1>
                                   <p>{final_total} Tk</p>
                              </div>
                              <Divider />
                              <div className="flex items-center gap-5">
                                   <h1 className="font-semibold text-lg w-48">Initial Payment(50%):</h1>
                                   <p>{initial_payment} Tk</p>
                              </div>
                              <div className="flex justify-center">
                                   <Button onClick={handleClickOpen2} variant="contained" sx={{ background: '#f58300', mt: "30px" }}>Confirm Booking</Button>
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
                    sx={{ px: 4 }}
               >
                    <h1 className="text-center text-3xl mt-5 font-semibold">Drivers from {carInfo.district}</h1>
                    <div className="bg-white flex flex-wrap p-8 gap-x-10 gap-y-5 justify-center">
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
               </BootstrapDialog>
               <BootstrapDialog
                    onClose={handleClose2}
                    aria-labelledby="customized-dialog-title"
                    open={open2}
                    fullWidth
                    maxWidth="sm"
                    sx={{ px: 4 }}
               >
                    <div className="p-5">
                         <h1 className="text-center text-3xl mt-5 font-semibold">You are booking {carInfo.brand} {carInfo.model}</h1>
                         <div className="flex justify-end gap-10 mt-14">
                              <Button onClick={handleClose2} variant="contained" sx={{ bgcolor: 'white', color: "black", px: 4, py: 1, fontWeight: 600, fontSize: 20 }} className="mt-5">Cancel</Button>
                              <Button onClick={handleBooking} variant="contained" sx={{ bgcolor: '#f58300', color: "white", px: 4, py: 1, fontWeight: 600, fontSize: 20 }} className="mt-5">Pay ৳{initial_payment}</Button>
                         </div>
                    </div>
               </BootstrapDialog>
          </div>
     );
};

export default Booking;