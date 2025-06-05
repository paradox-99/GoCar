import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { TbMessageCircle } from "react-icons/tb";
import SendBird from "sendbird";
import useDesignation from "../../hooks/useDesignation";
import { Skeleton } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import Cart from "../../components/Cart/Cart";


const ViewAgencyDetails = () => {

    const { id } = useParams();
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const { userInfo } = useDesignation();
    const [carData, setCarData] = useState([]);
    const sendbirdInstance = new SendBird({ appId: import.meta.env.VITE_Send_Bird_appID })

    const { data, isPending } = useQuery({
        queryKey: ['agency', id],
        queryFn: async () => {
            const response = await axiosPublic.get(`agencyRoutes/getAgencyDetails/${id}`);
            return response.data;
        }
    })

    useEffect(() => {
        const getCars = async () => {
            const response = await axiosPublic.get(`carRoutes/showAgencyCars/${id}`);
            setCarData(response.data);
        }
        getCars();
    }, [])

    if (isPending) {
        return <div className="flex flex-col justify-center items-center gap-4 h-[80vh]">
            <Skeleton variant="rectangular" animation="wave" width={400} height={120}></Skeleton>
            <Skeleton variant="rectangular" animation="wave" width={400} height={120}></Skeleton>
            <Skeleton variant="rectangular" animation="wave" width={400} height={120}></Skeleton>
        </div>
    }

    const createOrOpenChannel = async (userId, agencyId) => {
        try {
            await sendbirdInstance.connect(userId);
            // Check if a channel already exists with the agency
            const params = new sendbirdInstance.GroupChannelParams();
            params.addUserIds([agencyId]); // Add the agency's user ID
            params.isDistinct = true; // This will ensure only one distinct channel is created per agency-user pair
            // Create or get the existing channel
            sendbirdInstance.GroupChannel.createChannel(params, (channel, error) => {
                if (error) {
                    console.error('Channel creation error: ', error);
                    return;
                }
                const channelUrl = channel.url;
                navigate(`/send-message/${channelUrl}`);
            });
        } catch (error) {
            console.error('Error creating/opening the channel:', error);
        }
    };

    return (
        <div className=" pt-20 mb-32 max-w-[1360px] mx-4 md:mx-8 xl:mx-auto">
            <Helmet>
                <title>Agency Details || { }</title>
            </Helmet>
            <h1 className="mb-10 text-5xl font-semibold">Agency Information</h1>
            <div className="bg-gray-100 p-10 rounded w-full ">
                <div className="flex justify-center">
                <div className="w-2/3">
                    <div className="flex justify-center mb-10">
                        <img src={data.image} alt="" className="w-48 rounded" />
                    </div>
                    <div>
                        <div className="flex font-nunito justify-between w-full">
                            <p className=" w-[40%]"><span className="font-semibold text-lg">Agency name:</span> {data?.agency_Name}</p>
                            <p className=" w-[36%]"><span className="font-semibold text-lg">Email:</span> {data?.agency_Email}</p>
                        </div>
                        <div className="flex font-nunito justify-between w-full mt-2">
                            <p className=" w-[40%]"><span className="font-semibold text-lg">Owner name:</span> {data.name}</p>
                            <p className=" w-[36%]"><span className="font-semibold text-lg">Phone:</span> {data.phone_Number}</p>
                        </div>
                        <div className="flex font-nunito justify-between w-full mt-2">
                            <p className=" w-[40%]"><span className="font-semibold text-lg">Number of cars:</span> {data?.total_vehicles}</p>
                            <p className=" w-[36%]"><span className="font-semibold text-lg">Registration number:</span> {data?.businessRegNumber}</p>
                        </div>
                    </div>
                    <div className="mt-5">
                        <h3 className="text-center font-bold text-xl">Agency Address</h3>
                        <div className="mt-3">
                            <div className="flex justify-between">
                                <p className="w-[36%]"><span className="font-semibold text-lg">District: </span>{data?.district}</p>
                                <p className="w-[40%]"><span className="font-semibold text-lg">Upazilla/City: </span>{data?.upazilla}</p>
                            </div>
                            <div className="flex justify-between text-lg">
                                {
                                    data?.area && <p className="w-[40%]"><span className="font-semibold text-lg">Area: </span>{data?.area}</p>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center mt-14">
                        <button onClick={() => createOrOpenChannel(userInfo._id, id)} className="border-2 rounded px-5 py-2 border-primary flex justify-center items-center gap-3">
                            <TbMessageCircle className="w-5 h-5" /> Send Message
                        </button>
                    </div>
                </div>
                </div>
                <div className="w-full flex gap-5 justify-center items-center flex-wrap my-8 md:my-12">
                    {
                        carData.length > 0 && carData.map(car => <Cart
                            key={car.vehicle_id}
                            car={car}
                        ></Cart>)
                    }
                </div>
            </div>
        </div>
    );
};

export default ViewAgencyDetails;