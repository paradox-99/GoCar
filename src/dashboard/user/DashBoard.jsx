import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import moment from 'moment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';

const DashBoard = () => {


     const email = 'saiful.islam@example.com'
     const axiosPublic = useAxiosPublic();
     const { user } = useAuth();
     const currentTime = moment();

     const { data } = useQuery({
          queryKey: ['user'],
          queryFn: async () => {
               const response = await axiosPublic.get(`/guardianRoutes/guardian/${email}`);
               return response.data[0];
          },
     })

     return (
          <div>
               <h1 className="text-4xl text-center mt-12 font-semibold">Welcome, {data?.name}</h1>
               <div className="flex justify-center mt-9 gap-10">
                    <div className="shadow-lg p-5 w-44 rounded bg-white">
                         <h3 className="text-xl text-center font-semibold">Status:</h3>
                         <div className="border border-black my-2"></div>
                         <h2 className="text-3xl font-bold text-center">Good</h2>
                    </div>
                    <div className="shadow-lg p-5 rounded w-80 bg-white">
                         <h3 className="text-xl text-center font-semibold">Upcoming Payment Date:</h3>
                         <div className="border border-black my-2"></div>
                         <h2 className="text-3xl font-bold text-center">10 - 12 - 2025</h2>
                    </div>
               </div>
               <div className="mt-8 flex justify-center">
                    <div className='flex justify-center items-center gap-3 shadow-lg w-fit px-5 rounded py-3 bg-white'>
                         <p className='font-semibold'>Book a Visiting Date: </p>
                         <LocalizationProvider dateAdapter={AdapterMoment}>
                              <DemoContainer components={['DateTimePicker']}>
                                   <DateTimePicker label="Select a date and time" name='fromDate&Time' minDate={currentTime} maxDate={moment(currentTime.clone().add(3, "months"))} slotProps={{ textField: { size: 'small' } }} />
                              </DemoContainer>
                         </LocalizationProvider>
                    </div>
               </div>
          </div>
     );
};

export default DashBoard;