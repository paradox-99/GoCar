import { Button, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment from 'moment';
import { useDispatch } from "react-redux";
import { nextStep, setBirthdate, setNID, setGender, setName } from "../../../redux/signupSlice";
import { useNavigate } from "react-router-dom";

const Signup_part2 = () => {

    const currentTime = moment();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const submitData = (e) => {
        e.preventDefault();
        const name = e.target.name.value;
        const gender = e.target.gender.value;
        const dob = e.target.dob.value;
        const nid = e.target.nid.value;

        dispatch(setName(name));
        dispatch(setGender(gender));
        dispatch(setBirthdate(dob));
        dispatch(setNID(nid));
        dispatch(nextStep());
        
        navigate('/sign-up/user-contact-info');
    }

    return (
        <div className="pt-8 lg:pt-20 flex justify-center items-center h-screen">
            <div className="md:border rounded-lg md:shadow-md min-[600px]:w-1/2 xl:w-[500px] h-fit px-5 py-6">
                <h1 className="text-lg md:text-xl lg:text-2xl text-center mb-5 font-bold">Personal Information</h1>
                <form className="space-y-4" onSubmit={submitData}>
                    <div className="flex flex-col gap-3">
                        <TextField id="name" label="Name" variant="outlined" type="text" fullWidth size="small" required />
                        <TextField id="gender" label="Gender" variant="outlined" type="text" fullWidth size="small" required />
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                            <DemoContainer components={['DatePicker']}>
                                <DatePicker label="Date of Birth" name="dob" minDate={moment('1950-01-01')} maxDate={moment(currentTime.clone().subtract(18, "years"))} slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }} />
                            </DemoContainer>
                        </LocalizationProvider>
                        <TextField id="nid" label="NID" variant="outlined" type="text" size="small" sx={{ mt: 1 }} required />
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