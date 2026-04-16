import { useEffect, useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAuth from "../../hooks/useAuth";

const DriverDashboard = () => {
     const { user } = useAuth();
     const axiosPublic = useAxiosPublic();
     const [profile, setProfile] = useState(null);

     useEffect(() => {
          if (!user?.email) return;
          axiosPublic.get(`/driverRoutes/profile/${user.email}`, { withCredentials: true })
               .then((res) => setProfile(res.data))
               .catch(() => setProfile(null));
     }, [axiosPublic, user?.email]);

     return (
          <div className="p-6">
               <h2 className="text-2xl font-semibold mb-4">Driver Dashboard</h2>
               {profile ? (
                    <div className="space-y-2 bg-white rounded-xl shadow p-4">
                         <p><strong>Name:</strong> {profile.name}</p>
                         <p><strong>Status:</strong> {profile.verified ? "Verified" : "Pending verification"}</p>
                         <p><strong>Availability:</strong> {profile.availability ? "Available" : "Unavailable"}</p>
                         <p><strong>Hourly Price:</strong> {profile.rental_price}</p>
                    </div>
               ) : (
                    <p>Driver profile data is not available yet.</p>
               )}
          </div>
     );
};

export default DriverDashboard;
