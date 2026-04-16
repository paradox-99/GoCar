import { useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useRole from "../../hooks/useRole";

const DriverProfile = () => {
     const axiosPublic = useAxiosPublic();
     const role = useRole();
     const [availability, setAvailability] = useState(true);

     const handleUpdate = async () => {
          if (!role?.user_id) return;
          await axiosPublic.patch(
               `/driverRoutes/availability/${role.user_id}`,
               { availability },
               { withCredentials: true }
          );
     };

     return (
          <div className="p-6 max-w-xl space-y-4">
               <h2 className="text-2xl font-semibold">Driver Profile Controls</h2>
               <label className="flex items-center gap-3">
                    <input type="checkbox" checked={availability} onChange={(e) => setAvailability(e.target.checked)} />
                    Mark me as available for bookings
               </label>
               <button className="btn btn-primary" onClick={handleUpdate}>Save availability</button>
          </div>
     );
};

export default DriverProfile;
