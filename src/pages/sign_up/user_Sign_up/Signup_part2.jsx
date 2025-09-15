import { Button, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment from 'moment';
import { useDispatch } from "react-redux";
import { nextStep, setBirthdate, setNID, setGender, setName } from "../../../redux/signupSlice";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import toast from "react-hot-toast";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

const Signup_part2 = () => {

    const [message, setMessage] = useState('');
    const currentTime = moment();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    })

    const checkNID = async (nid) => {
        const { data } = await axiosPublic.get(`/userRoute/checkNID/${nid}`);

        if (data.code === 1) {
            return true;
        }
        return false;
    }

    const submitData = async (e) => {
        // e.preventDefault();
        const name = e.target.name.value;
        const gender = e.target.gender.value;
        const dob = e.target.dob.value;
        const nid = e.target.nid.value;

        const status = await checkNID(nid)
        console.log(status);

        if (status) {
            setMessage("NID already exists. Please use a different NID.");
            return;
        }
        else {
            setMessage('');
            dispatch(setName(name));
            dispatch(setGender(gender));
            dispatch(setBirthdate(dob));
            dispatch(setNID(nid));
            dispatch(nextStep());
            navigate('/sign-up/user-contact-info');
        }
    }

    return (
        <div className="pt-8 lg:pt-32 flex justify-center items-center ">
            <div className="md:border rounded-lg md:shadow-md min-[600px]:w-1/2 xl:w-[500px] h-fit px-5 py-6">
                <h1 className="text-lg md:text-xl lg:text-2xl text-center mb-5 font-bold">Personal Information</h1>
                <form className="space-y-4" onSubmit={handleSubmit(submitData)}>
                    <div className="flex flex-col gap-3">
                        <TextField id="name" label="Name" variant="outlined" type="text" fullWidth size="small" required {...register("name")} />
                        <TextField id="gender" label="Gender" variant="outlined" type="text" fullWidth size="small" required {...register("gender")} />
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                            <DemoContainer components={['DatePicker']}>
                                <DatePicker label="Date of Birth" name="dob" minDate={moment('1950-01-01')} maxDate={moment(currentTime.clone().subtract(18, "years"))} slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }} />
                            </DemoContainer>
                        </LocalizationProvider>
                        <TextField id="nid" label="NID" variant="outlined" type="text" size="small" sx={{ mt: 1 }} required {...register("nid")} />
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
        </div>
    );
};

export default Signup_part2;