import { Button, TextField } from "@mui/material";
import { useQuery } from '@tanstack/react-query'
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAuth from "../../hooks/useAuth";

const AdminProfile = () => {
     const { user } = useAuth();
     const axiosPublic = useAxiosPublic();

     const { data } = useQuery({
          queryKey: ['user'],
          queryFn: async () => {
               const response = await axiosPublic.get(`userRoute/getUserInfo/${user.email}`, {withCredentials: true});
               return response.data;
          },
     })

     const dateOnly = data?.dob.split('T')[0];

     return (
          <div>
               <h1 className="text-4xl text-center mt-12 font-semibold">Personal Information</h1>
               {
                    data ?
                         <>
                              <div className="mt-10 flex justify-evenly">
                                   <div className="space-y-5">
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Name: </p>
                                             <TextField variant="outlined" value={data?.name} />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Phone: </p>
                                             <TextField variant="outlined" value={data?.phone} />
                                        </div>

                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Gender: </p>
                                             <TextField variant="outlined" value={data.gender} />
                                        </div>
                                   </div>
                                   <div className="space-y-5">
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>Email: </p>
                                             <TextField variant="outlined" value={data.email} />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>NID: </p>
                                             <TextField variant="outlined" value={data.nid} />
                                        </div>
                                        <div className="flex items-center">
                                             <p className='w-[200px]'>DOB: </p>
                                             <TextField variant="outlined" value={dateOnly} />
                                        </div>
                                   </div>
                              </div>
                              <div>
                                   <h1 className="text-3xl text-center mt-8 font-semibold">Address</h1>
                                   <div className="flex justify-center gap-5 mt-8">
                                        <TextField variant="outlined" label="District" value={data.district} />
                                        <TextField variant="outlined" label="Upazilla" value={data.upazilla} />
                                        <TextField variant="outlined" label="KeyArea" value={data.keyArea} />
                                        <TextField variant="outlined" label="Area" value={data.area} />
                                   </div>
                              </div>
                              <div className="flex justify-center mt-10">
                                   <div className="flex flex-col items-center">
                                        <img src={data.image} alt="Profile picture" className="w-32 h-32 rounded-full mb-5" />
                                        <Button variant="contained" sx={{ background: '#F58300' }}>Edit</Button>
                                   </div>
                              </div>
                         </> :
                         <h1>...Loading</h1>
               }
          </div>
     );
};

export default AdminProfile;