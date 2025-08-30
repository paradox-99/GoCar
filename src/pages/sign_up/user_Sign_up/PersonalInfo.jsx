import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import Address from "../../../components/address/Address";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setAddressA, setAddressR, setPhone } from "../../../redux/signupSlice";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const PersonalInfo = () => {
     const [address, setAddress] = useState();
     const dispatch = useDispatch();
     const [phone, setPhoneNum] = useState("");
     const [otp, setOtp] = useState("");
     const [OTP, setOTP] = useState("");
     const [area, setArea] = useState("");
     const navigate = useNavigate();
     const axiosPublic = useAxiosPublic();
     const [message, setMessage] = useState("");

     const [open, setOpen] = useState(false);

     const handleClickOpen = () => {
          setOpen(true);
     };

     const handleClose = () => {
          setOpen(false);
     };

     const getAddress = (address) => {
          setAddress(address);
     }

     function generateOTP() {
          return Math.floor(100000 + Math.random() * 900000);
     }

     const checkPhone = async (phone) => {
          const { data } = await axiosPublic.get(`/userRoute/checkPhone/${phone}`);

          if (data.code === 1) {
               return true;
          }
          return false;
     }

     // Send OTP
     const sendOTP = async () => {
          const ottp = generateOTP();
          setOTP(ottp.toString());
          const message = "Your goCar OTP is: " + ottp;

          try {
               const result = await axios.post(`https://bulksmsbd.net/api/smsapi?api_key=${import.meta.env.VITE_sms_api_key}&type=text&number=${phone}&senderid=${import.meta.env.VITE_sms_sender_id}&message=${message}`);
               console.log(result);
          } catch (err) {
               console.error(err);
          }
     };

     const verifyOTP = (e) => {
          e.preventDefault();
          try {
               if (otp === OTP) {
                    toast.success("Phone number verified successfully.");
                    navigate('/sign-up/user-photo-upload');
                    handleClose();
               }
               else {
                    toast.error("Invalid OTP. Please try again.");
               }
          } catch (error) {
               console.log(error);

          }
     };


     const submitData = async(e) => {
          e.preventDefault();
          const addressData = address;
          const status = await checkPhone(phone);

          if (status) {
               setMessage("Phone number already exists. Please use a different phone number.");
               return;
          }
          else {
               setMessage('');
               dispatch(setAddressR(addressData));
               dispatch(setPhone(phone));
               dispatch(setAddressA(area));
               sendOTP();
               handleClickOpen();
          }
     }

     return (
          <div className="pt-8 lg:pt-20 flex flex-col justify-center items-center h-[70vh]">
               <div className="md:border rounded-lg md:shadow-md min-[600px]:w-1/2 xl:w-3/5 h-fit px-5 py-6">
                    <h1 className="text-3xl text-center mb-5 font-bold">Contact Information</h1>
                    <form className="space-y-4" onSubmit={submitData}>
                         <div className="grid grid-cols-3 gap-3">
                              <TextField id="phone" label="Phone number" variant="outlined" type="text" fullWidth size="small" required onChange={(e) => setPhoneNum(e.target.value)} />
                         </div>
                         <div>
                              <h3 className="text-lg">Address</h3>
                              <Address getAddress={getAddress}></Address>
                              <TextField id="phone" label="Enter area/street/village" variant="outlined" type="text" fullWidth size="small" required style={{ marginTop: "16px" }}
                                   onChange={(e) => setArea(e.target.value)}
                              />
                         </div>
                         {message && <p className="text-red-500 text-sm">{message}</p>}
                         <div className="flex justify-center items-center">
                              <Button variant="contained" color="primary" type="submit" sx={{ background: '#F58300' }}>Next</Button>
                         </div>
                    </form>
               </div>
               <div id="recaptcha-container"></div>
               <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Phone Number Verification</DialogTitle>
                    <DialogContent>
                         <DialogContentText>
                              Please enter the OTP sent to your phone number.
                         </DialogContentText>

                         <form onSubmit={verifyOTP} id="otp-form">
                              <TextField
                                   autoFocus
                                   required
                                   margin="dense"
                                   id="otp"
                                   name="otp"
                                   label="Enter OTP"
                                   type="number"
                                   fullWidth
                                   variant="standard"
                                   onChange={(e) => setOtp(e.target.value)}
                              />
                         </form>
                    </DialogContent>
                    <DialogActions>
                         <Button onClick={handleClose}>Cancel</Button>
                         <Button type="submit" form="otp-form">
                              Verify OTP
                         </Button>
                    </DialogActions>
               </Dialog>
          </div>
     );
};

export default PersonalInfo;