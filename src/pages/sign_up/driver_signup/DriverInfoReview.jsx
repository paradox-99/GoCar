import { Button, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import toast from 'react-hot-toast';

const DriverInfoReview = () => {

     const { email, name, phone, nid, gender, address, area, birthdate, licenseNumber, licenseIssueDate, issuingAuthority, experience, hiringPrice, profilePicture } = useSelector((state) => state.signup);
     const navigate = useNavigate();
     const currentTime = moment();
     const axiosPublic = useAxiosPublic();

     const submitData = async (e) => {
          e.preventDefault();
          const driverData = {
               address,
               area,
               name,
               email,
               phone,
               gender,
               nid,
               licenseNumber,
               licenseIssueDate: moment(licenseIssueDate).format('YYYY-MM-DD'),
               issuingAuthority,
               experience: Number(experience),
               hiringPrice: Number(hiringPrice),
               profilePicture,
               birthdate: moment(birthdate).format('YYYY-MM-DD'),
          }

          const { data } = await axiosPublic.post('userRoute/createDriver', driverData);
          toast.success(data.message);

          navigate('/');
     }

     return (
          <div className="pt-8 md:pt-16 lg:pt-20 flex justify-center items-center ">
               <div className="md:border rounded-lg md:shadow-md min-[600px]:w-2/5 px-5 py-6">
                    <h1 className="text-3xl text-center mb-5 font-bold">Information Review</h1>
                    <form className="space-y-4" onSubmit={submitData}>
                         <div className='flex justify-center items-center gap-5 flex-col'>
                              <div className='flex flex-col gap-3 w-full'>
                                   <div className="flex flex-col xl:flex-row gap-3">
                                        <TextField id="name" label="Name" variant="outlined" type="text" fullWidth size="small" required defaultValue={name} disabled />
                                        <TextField id="Email" label="Email" variant="outlined" type="text" fullWidth size="small" required defaultValue={email} disabled />
                                   </div>
                                   <div className="flex flex-col xl:flex-row gap-3">
                                        <TextField id="gender" label="Gender" variant="outlined" type="text" fullWidth size="small" required defaultValue={gender} disabled />
                                        <TextField id="name" label="Phone" variant="outlined" type="text" fullWidth size="small" required defaultValue={phone} disabled />

                                   </div>
                                   <div className="flex flex-col xl:flex-row gap-3">
                                        <TextField id="nid" label="NID" variant="outlined" type="text" size="small" sx={{ mt: 1 }} fullWidth required defaultValue={nid} disabled />
                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                             <DemoContainer components={['DatePicker']} sx={{ width: '100%' }}>
                                                  <DatePicker label="Date of Birth" name="dob" minDate={moment('1950-01-01')} maxDate={moment(currentTime.clone().subtract(18, "years"))} slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }} defaultValue={birthdate ? moment(birthdate) : null} disabled />
                                             </DemoContainer>
                                        </LocalizationProvider>
                                   </div>
                                   <h1>Address</h1>
                                   <div className="flex flex-col xl:flex-row gap-3">
                                        <TextField id="Email" label="District" variant="outlined" type="text" fullWidth size="small" required defaultValue={address.district} disabled />
                                        <TextField id="gender" label="City/Upazilla" variant="outlined" type="text" fullWidth size="small" required defaultValue={address.upazilla} disabled />
                                   </div>
                                   <div className="flex flex-col xl:flex-row gap-3">
                                        {
                                             address?.area && <TextField id="gender" label="Key Area" variant="outlined" type="text" fullWidth size="small" required defaultValue={address.area} disabled style={{ marginTop: "8px" }} />
                                        }
                                        <TextField id="gender" label="Area/street/village" variant="outlined" type="text" fullWidth size="small" required defaultValue={area} disabled style={{ marginTop: "4px" }} />
                                   </div>
                                   <h1>Driving Information</h1>
                                   <div className="flex flex-col xl:flex-row gap-3">
                                        <TextField id="license" label="License Number" variant="outlined" type="text" fullWidth size="small" required defaultValue={licenseNumber} disabled />
                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                             <DemoContainer components={['DatePicker']} sx={{ width: '100%', paddingTop: '0px' }}>
                                                  <DatePicker label="Date of Birth" name="dob" minDate={moment(currentTime.clone().subtract(56, "months"))} maxDate={moment(currentTime)} slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }} defaultValue={licenseIssueDate ? moment(licenseIssueDate) : null} disabled />
                                             </DemoContainer>
                                        </LocalizationProvider>
                                   </div>
                                   <div className="flex flex-col xl:flex-row gap-3">
                                        <TextField id="authority" label="Issuing Authority" variant="outlined" type="text" fullWidth size="small" required defaultValue={issuingAuthority} disabled />
                                        <TextField id="experience" label="Experience (in years)" variant="outlined" type="number" fullWidth size="small" required defaultValue={experience} disabled />
                                   </div>
                                   <div className="flex flex-col xl:flex-row gap-3">
                                        <TextField id="price" label="Hiring Price (in BDT)" variant="outlined" type="number" fullWidth size="small" required defaultValue={hiringPrice} disabled /> 
                                   </div>
                              </div>
                         </div>
                         <div className='flex justify-center items-center'>
                              <img src={profilePicture} alt="Profile" className="w-32 h-32 rounded-full mt-4" />
                         </div>

                         <div className="flex justify-center items-center">
                              <Button variant="contained" color="primary" type="submit" sx={{ background: '#F58300' }}>Submit</Button>
                         </div>
                    </form>
               </div >


          </div >
     );
};

export default DriverInfoReview;