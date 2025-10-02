import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment from 'moment';
import { useDispatch } from "react-redux";
import { nextStep, setBirthdate, setNID, setGender, setName, setAddressR, setPhone, setAddressA } from "../../../redux/driverSignupSlice";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropagateLoader } from "react-spinners";
import axios from "axios";
import Address from "../../../components/address/Address";
import toast from "react-hot-toast";

const schema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name cannot exceed 100 characters')
        .transform(name => name.trim().replace(/\s+/g, ' ').replace(/[<>()&;'"\\]/g, '')),

    gender: z.string()
        .min(1, 'Gender is required')
        .transform(gender => gender.trim().toLowerCase())
        .refine(gender => ['male', 'female', 'other'].includes(gender), 'Please select a valid gender'),

    nid: z.string()
        .min(1, 'NID is required')
        .max(20, 'NID cannot exceed 13 characters')
        .transform(nid => {
            const cleaned = nid.trim().replace(/\D/g, ''); // Remove non-digits
            return parseInt(cleaned, 10);
        })
        .refine(nid => !isNaN(nid), 'NID must be a valid number')
        .refine(nid => nid.toString().length >= 10, 'NID must be at least 10 digits'),
});

const DriverPersonalInfo = () => {

    const [message, setMessage] = useState('');
    const currentTime = moment();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();
    const [loading, setLoading] = useState(false);
    const [birthdate, setBirthdatee] = useState(null);
    const [phone, setPhoneNum] = useState("");
    const [address, setAddress] = useState();
    const [otp, setOtp] = useState("");
    const [OTP, setOTP] = useState("");
    const [area, setArea] = useState("");
    const [open, setOpen] = useState(false);


    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    })

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

    const checkNID = async (nid) => {
        const { data } = await axiosPublic.get(`/driverRoutes/checkNID/${nid}`);

        if (data.code === 1) {
            return true;
        }
        return false;
    }

    const checkPhone = async (phone) => {
        const { data } = await axiosPublic.get(`/driverRoutes/checkPhone/${phone}`);

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
                navigate('/sign-up/driver/driving-info');
                handleClose();
                setLoading(true);
            }
            else {
                toast.error("Invalid OTP. Please try again.");
            }
        } catch (error) {
            console.log(error);

        }
    };

    const submitData = async (data) => {
        await new Promise(resolve => setTimeout(() => resolve(), 1000));

        const name = data.name;
        const gender = data.gender;
        const nid = data.nid;

        const statusNID = await checkNID(nid);
        const addressData = address;
        const statusPhone = await checkPhone(phone);

        if (statusNID) {
            setMessage("NID already exists. Please use a different NID.");
            return;
        }
        if (statusPhone) {
            setMessage("Phone number already exists. Please use a different phone number.");
            return;
        }
        else {
            setMessage('');
            dispatch(setName(name));
            dispatch(setGender(gender));
            dispatch(setBirthdate(birthdate));
            dispatch(setNID(nid));
            dispatch(setAddressR(addressData));
            dispatch(setPhone(phone));
            dispatch(setAddressA(area));
            dispatch(nextStep());
            sendOTP();
            handleClickOpen();
        }
    }


    if (loading) {
        return <div className="w-full h-screen flex justify-center items-center">
            <PropagateLoader
                color="#F58300"
                speedMultiplier={1}
            />
        </div>
    }


    return (
        <div className="pt-10 md:pt-20 lg:pt-32 flex justify-center items-center ">
            <div className="md:border rounded-lg md:shadow-md min-[600px]:w-1/2 xl:w-[700px] h-fit px-5 py-6">
                <h1 className="text-lg md:text-xl lg:text-2xl text-center mb-5 font-bold">Personal Information</h1>
                <form className="space-y-4" onSubmit={handleSubmit(submitData)}>
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col xl:flex-row gap-3">
                            <TextField id="name" label="Name" variant="outlined" type="text" fullWidth size="small" required {...register("name")} />
                            <TextField id="gender" label="Gender" variant="outlined" type="text" fullWidth size="small" required {...register("gender")} />
                        </div>
                        <div className="flex flex-col xl:flex-row gap-3">
                            <TextField id="nid" label="NID" variant="outlined" type="text" fullWidth size="small" required {...register("nid")} />
                            <TextField id="phone" label="Phone number" variant="outlined" type="text" fullWidth size="small" required onChange={(e) => setPhoneNum(e.target.value)} />
                        </div>
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                            <DemoContainer components={['DatePicker']}>
                                <DatePicker label="Date of Birth" name="dob" minDate={moment('1950-01-01')} maxDate={moment(currentTime.clone().subtract(18, "years"))} slotProps={{ textField: { size: 'small', fullWidth: false, required: true } }}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            const dateOnly = newValue.format("YYYY-MM-DD");
                                            console.log(dateOnly); // e.g., "1998-05-20"
                                            setBirthdatee(dateOnly); // store in state
                                        } else {
                                            setBirthdatee(""); // if cleared
                                        }
                                    }} />
                            </DemoContainer>
                        </LocalizationProvider>
                        <div>
                            <h3 className="text-lg">Address</h3>
                            <Address getAddress={getAddress}></Address>
                            <TextField id="phone" label="Enter area/street/village" variant="outlined" type="text" fullWidth size="small" required style={{ marginTop: "16px" }}
                                onChange={(e) => setArea(e.target.value)}
                            />
                        </div>
                        {message && <p className="text-red-500 text-sm">{message}</p>}
                        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                        {errors.gender && <p className="text-red-500">{errors.gender.message}</p>}
                        {errors.nid && <p className="text-red-500">{errors.nid.message}</p>}
                    </div>
                    <div className="flex justify-center items-center">
                        <Button variant="contained" color="primary" type="submit" sx={{ background: '#F58300' }}>Next</Button>
                    </div>
                </form>
            </div>
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

export default DriverPersonalInfo;