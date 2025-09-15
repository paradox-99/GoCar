import { Button, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import useAxiosPublic from '../../../hooks/useAxiosPublic';

const ReviewInfo = () => {

     const { email, name, phone, nid, gender, address, area, birthdate, profilePicture } = useSelector((state) => state.signup);
     const navigate = useNavigate();
     const currentTime = moment();
     const axiosPublic = useAxiosPublic();

     const submitData = async(e) => {
          e.preventDefault();
          const userData = {
               address,
               area,
               name,
               email,
               phone,
               gender,
               nid,
               profilePicture,
               birthdate: moment(birthdate).format('YYYY-MM-DD'),
          }
          console.log(userData);
          

          const {data} = await axiosPublic.post('userRoute/createUser', userData);
          console.log(data.response);
          

          navigate('/');
     }

     return (
          <div className="pt-8 lg:pt-20 flex justify-center items-center h-screen">
               <div className="md:border rounded-lg md:shadow-md min-[600px]:w-1/2 xl:w-3/5 h-fit px-5 py-6">
                    <h1 className="text-3xl text-center mb-5 font-bold">Information Review</h1>
                    <form className="space-y-4" onSubmit={submitData}>
                         <div className='flex flex-col justify-center items-center'>
                              <div className='flex gap-10'>
                                   <div className="flex flex-col gap-3">
                                        <TextField id="name" label="Name" variant="outlined" type="text" fullWidth size="small" required defaultValue={name} disabled/>
                                        <TextField id="Email" label="Email" variant="outlined" type="text" fullWidth size="small" required defaultValue={email} disabled/>
                                        <TextField id="gender" label="Gender" variant="outlined" type="text" fullWidth size="small" required defaultValue={gender} disabled/>
                                        <TextField id="nid" label="NID" variant="outlined" type="text" size="small" sx={{ mt: 1 }} required defaultValue={nid} disabled/>
                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                             <DemoContainer components={['DatePicker']}>
                                                  <DatePicker label="Date of Birth" name="dob" minDate={moment('1950-01-01')} maxDate={moment(currentTime.clone().subtract(18, "years"))} slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }} defaultValue={moment(birthdate)} disabled/>
                                             </DemoContainer>
                                        </LocalizationProvider>
                                   </div>
                                   <div className='flex flex-col gap-3'>
                                        <TextField id="name" label="Phone" variant="outlined" type="text" fullWidth size="small" required defaultValue={phone} disabled/>
                                        <TextField id="Email" label="District" variant="outlined" type="text" fullWidth size="small" required defaultValue={address.district} disabled/>
                                        <TextField id="gender" label="City/Upazilla" variant="outlined" type="text" fullWidth size="small" required defaultValue={address.upazilla} disabled/>
                                        {
                                             address?.area && <TextField id="gender" label="Key Area" variant="outlined" type="text" fullWidth size="small" required defaultValue={address.area} disabled style={{marginTop: "8px"}}/>
                                        }
                                        <TextField id="gender" label="Area/street/village" variant="outlined" type="text" fullWidth size="small" required defaultValue={area} disabled style={{marginTop: "8px"}}/>
                                   </div>
                              </div>
                              <div>
                                   <img src={profilePicture} alt="Profile" className="w-32 h-32 rounded-full mt-4" />
                              </div>
                         </div>
                         <div className="flex justify-center items-center">
                              <Button variant="contained" color="primary" type="submit" sx={{ background: '#F58300' }}>Submit</Button>
                         </div>
                    </form>
               </div>


          </div>
     );
};

export default ReviewInfo;