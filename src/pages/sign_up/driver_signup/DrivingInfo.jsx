import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import moment from "moment";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import { setExperience, setHiringPrice, setIssuingAuthority, setLicenseIssueDate, setLicenseNumber } from "../../../redux/driverSignupSlice";

const schema = z.object({
     license: z.string()
          .min(1, { message: "License number is required" }),
     authority: z.string()
          .min(1, { message: "Issuing authority is required" }),
     experience: z.string({ invalid_type_error: "Years of experience is required" })
          .min(1, { message: "Experience must be at least 2 years" }),
     price: z.string({ invalid_type_error: "Hiring price is required" })
          .min(2, { message: "Price must be at least 0" }),
});

const DrivingInfo = () => {

     const [message, setMessage] = useState('');
     const navigate = useNavigate();
     const dispatch = useDispatch();
     const [issueDate, setIssueDate] = useState(null);
     const [expireDate, setExpireDate] = useState(null);
     const currentTime = moment();
     const axiosPublic = useAxiosPublic();

     const { register, handleSubmit, formState: { errors } } = useForm({
          resolver: zodResolver(schema)
     })

     const checkLicense = async (license) => {
          const { data } = await axiosPublic.get(`/driverRoutes/checkLicense/${license}`);

          if (data.code === 1) {
               return true;
          }
          return false;
     }

     const submitData = async (data) => {
          await new Promise(resolve => setTimeout(() => resolve(), 1000));

          setMessage("");
          const license =  data.license
          const authority = data.authority
          const experience = parseInt(data.experience)
          const price = parseInt(data.price)

          if(experience < 2) {
               setMessage("Experience must be at least 2 years");
               return;
          }

          const isLicenseExist = await checkLicense(license);
          if (isLicenseExist) {
               setMessage("License number already exists");
               return;
          }
          else {
               dispatch(setLicenseNumber(license));
               dispatch(setLicenseIssueDate(issueDate));
               dispatch(setIssuingAuthority(authority));
               dispatch(setExperience(experience));
               dispatch(setHiringPrice(price));
               navigate("/sign-up/driver/photo-upload");
          }
     }

     return (
          <div className="pt-10 md:pt-20 lg:pt-32 flex justify-center items-center ">
               <div className="md:border rounded-lg md:shadow-md min-[600px]:w-1/2 xl:w-[500px] h-fit px-5 py-6">
                    <h1 className="text-lg md:text-xl lg:text-2xl text-center mb-5 font-bold">Driving Information</h1>
                    <form className="space-y-4" onSubmit={handleSubmit(submitData)}>
                         <div className="flex flex-col gap-3">
                              <TextField id="license" label="License Number" variant="outlined" type="text" fullWidth size="small" required {...register("license")} />
                              <LocalizationProvider dateAdapter={AdapterMoment}>
                                   <DemoContainer components={['DatePicker']}>
                                        <DatePicker label="License issue date" name="issue" minDate={moment(currentTime.clone().subtract(56, "months"))} maxDate={moment(currentTime)} slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
                                             onChange={(newValue) => {
                                                  if (newValue) {
                                                       const dateOnly = newValue.format("YYYY-MM-DD");
                                                       const expiry = moment(dateOnly).add(5, 'years');
                                                       setIssueDate(dateOnly); // store in state
                                                       setExpireDate(expiry.format("MM-DD-YYYY")); // set expire date 5 years later
                                                  } else {
                                                       setIssueDate(""); // if cleared
                                                  }
                                             }} />
                                   </DemoContainer>
                              </LocalizationProvider>
                              <LocalizationProvider dateAdapter={AdapterMoment}>
                                   <DemoContainer components={['DatePicker']}>
                                        <DatePicker label="License expire date" name="expire" value={expireDate ? moment(expireDate) : null} readOnly slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }} />
                                   </DemoContainer>
                              </LocalizationProvider>
                              <TextField id="authority" label="Issuing Authority" variant="outlined" type="text" fullWidth size="small" required {...register("authority")} />
                              <TextField id="experience" label="Years of Experience" variant="outlined" type="text" fullWidth size="small" required {...register("experience")} />
                              <TextField id="price" label="Hiring Price" variant="outlined" type="text" fullWidth size="small" required {...register("price")} />

                              {message && <p className="text-red-500 text-sm">{message}</p>}
                              {errors.license && <p className="text-red-500 text-sm">{errors.license.message}</p>}
                              {errors.experience && <p className="text-red-500 text-sm">{errors.experience.message}</p>}
                              {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                         </div>
                         <div className="flex justify-center items-center">
                              <Button variant="contained" color="primary" type="submit" sx={{ background: '#F58300' }}>Next</Button>
                         </div>
                    </form>
               </div>
          </div>
     );
};

export default DrivingInfo;