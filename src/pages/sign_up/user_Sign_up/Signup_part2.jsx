import { Button, styled, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment from 'moment';
import Address from "../../../components/address/Address";
import { useState } from "react";
import { CloudUpload } from "@mui/icons-material";
import profile from "../../../assets/default_profile_pic.png"

const Signup_part2 = () => {

    const [address, setAddress] = useState();
    const [imagePreview, setImagePreview] = useState(null);
    const currentTime = moment();

    const getAddress = (address) => {
        setAddress(address);
    }

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const submitData = (e) => {
        
    }

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    return (
        <div className="pt-8 lg:pt-20 flex justify-center items-center h-screen">
            <div className="md:border rounded-lg md:shadow-md min-[600px]:w-1/2 xl:w-3/5 h-fit px-5 py-6">
                <h1 className="text-3xl text-center mb-5 font-bold">Personal Information</h1>
                <form className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <TextField id="name" label="Name" variant="outlined" type="text" fullWidth size="small" required/>
                        <TextField id="phone" label="Phone number" variant="outlined" type="text" fullWidth size="small" required/>
                        <TextField id="gender" label="Gender" variant="outlined" type="text" fullWidth size="small" required/>
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                            <DemoContainer components={['DatePicker']}>
                                <DatePicker label="Date of Birth" name="dob" minDate={moment('1950-01-01')} maxDate={moment(currentTime.clone().subtract(18, "years"))} slotProps={{ textField: { size: 'small', fullWidth: true, required:true }}}/>
                            </DemoContainer>
                        </LocalizationProvider>
                        <TextField id="nid" label="NID" variant="outlined" type="text" size="small" sx={{ mt: 1 }} required/>
                    </div>
                    <div>
                        <h3 className="text-lg">Address</h3>
                        <Address getAddress={getAddress}></Address>
                    </div>
                    <div className="flex justify-center pt-4">
                        <div className="flex flex-col items-center justify-center gap-5">
                            <img src={imagePreview || profile} alt="default_picture" className="w-32 h-32 rounded-full" />
                            <Button
                                component="label"
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                startIcon={<CloudUpload
                                load />}  
                                sx={{background: '#F58300'}}
                                size="small"                         
                            >
                                Profile Picture
                                <VisuallyHiddenInput
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    multiple
                                    required
                                />
                            </Button>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="contained" color="primary" type="submit" sx={{background: '#F58300'}}>Submit</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup_part2;