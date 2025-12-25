import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosPublic from "./useAxiosPublic";

const useDesignation = () => {

    const { user, loader } = useAuth();
    const axiosPublic = useAxiosPublic();

    const { data: userInfo= '', refetch  } = useQuery({
        queryKey: [user?.email, 'userInfo'],
        enabled: !loader && !!user?.email,
        queryFn: async () => {
            const { data } = await axiosPublic.get(`/userRoute/getUserInfo/${user?.email}`);
            return data;
        }
    })
    
    return {userInfo, refetch};
};


export default useDesignation;


