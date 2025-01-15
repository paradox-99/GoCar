import { Button, TextField } from "@mui/material";
import { useQuery } from '@tanstack/react-query'
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAuth from "../../hooks/useAuth";

const MyProfile = () => {

     const { user } = useAuth();
     const axiosPublic = useAxiosPublic();
     

     const { data } = useQuery({
          queryKey: ['user'],
          queryFn: async () => {
               const response = await axiosPublic.get(`/guardianRoutes/guardian/${user?.email}`);
               return response.data[0];
          },
     })

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
                                        <TextField variant="outlined" value={data?.phone}/>
                                   </div>
                                   <div className="flex items-center">
                                        <p className='w-[200px]'>NID: </p>
                                        <TextField variant="outlined" value={data.NID}/>
                                   </div>
                                   <div className="flex items-center">
                                        <p className='w-[200px]'>Relationship with Elder: </p>
                                        <TextField variant="outlined" value={data.relationship}/>
                                   </div>
                                   <div className="flex items-center">
                                        <p className='w-[200px]'>Emergency contact name:</p>
                                        <TextField variant="outlined" value={data.em_name}/>
                                   </div>
                              </div>
                              <div className="space-y-5">
                                   <div className="flex items-center">
                                        <p className='w-[200px]'>Email: </p>
                                        <TextField variant="outlined" value={data.email}/>
                                   </div>
                                   <div className="flex items-center">
                                        <p className='w-[200px]'>Permanent address: </p>
                                        <TextField variant="outlined" value={data.permanent_address}/>
                                   </div>
                                   <div className="flex items-center">
                                        <p className='w-[200px]'>Present Address: </p>
                                        <TextField variant="outlined" value={data.present_address}/>
                                   </div>
                                   <div className="flex items-center">
                                        <p className='w-[200px]'>Emergency contact:</p>
                                        <TextField variant="outlined" value={data.em_phone}/>
                                   </div>
                                   <div className="flex items-center">
                                        <p className='w-[200px]'>Elder&rsquo;s Relationship: </p>
                                        <TextField variant="outlined" value={data.em_relationship}/>
                                   </div>
                              </div>
                         </div>
                         <div className="flex justify-center mt-10">
                              <div className="flex flex-col items-center">
                                   <img src={data.image} alt="Profile picture" className="w-32 h-32 rounded" />
                                   <Button variant="contained" sx={{ background: '#F58300' }}>Edit</Button>
                              </div>
                         </div>
                    </> : 
                    <h1>No information found</h1>
               }
          </div>
     );
};

export default MyProfile;