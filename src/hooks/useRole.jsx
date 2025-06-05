import useAxiosPublic from './useAxiosPublic';
import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';

const useRole = () => {

  const { user, status } = useAuth();
  const axiosPublic = useAxiosPublic();

  const { data } = useQuery({
    queryKey: [user?.email, 'userInfo'],
    enabled: !status && !!user?.email,
    queryFn: async () => {
      const { data } = await axiosPublic.get(`userRoute/getUserRole/${user?.email}`);
      return data[0];
    }
  })
  return data;
};

export default useRole;