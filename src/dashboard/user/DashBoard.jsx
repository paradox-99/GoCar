import useAuth from '../../hooks/useAuth';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';

const DashBoard = () => {

     const axiosPublic = useAxiosPublic();
     const { user } = useAuth();

     const { data } = useQuery({
          queryKey: ['user'],
          queryFn: async () => {
               const response = await axiosPublic.get(`userRoute/getUser/${user.email}`);
               return response.data;
          },
     })

     return (
          <div>
               <h1 className="text-4xl text-center mt-12 font-semibold">Welcome, {data?.name}</h1>
               <div className="flex justify-center mt-9 gap-10">
                   
               </div>
               <div className="mt-8 flex justify-center">
                    
               </div>
          </div>
     );
};

export default DashBoard;