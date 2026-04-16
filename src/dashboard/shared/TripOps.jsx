import { useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useRole from "../../hooks/useRole";

const TripOps = () => {
     const axiosPublic = useAxiosPublic();
     const role = useRole();
     const [bookingId, setBookingId] = useState("");
     const [carId, setCarId] = useState("");
     const [description, setDescription] = useState("");

     const submitReturn = async () => {
          await axiosPublic.post("/returnDamageRoutes/return", {
               booking_id: bookingId,
               fuel_level: 0,
               odometer_reading: 0,
               return_notes: "Returned from dashboard"
          }, { withCredentials: true });
     };

     const submitDamage = async () => {
          await axiosPublic.post("/returnDamageRoutes/damage", {
               booking_id: bookingId,
               car_id: carId,
               reported_by: role?.user_id,
               damage_type: "general",
               severity: "minor",
               description
          }, { withCredentials: true });
     };

     return (
          <div className="p-6 space-y-3 max-w-2xl">
               <h2 className="text-2xl font-semibold">Return & Damage</h2>
               <input className="input input-bordered w-full" placeholder="Booking ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
               <input className="input input-bordered w-full" placeholder="Car ID (for damage report)" value={carId} onChange={(e) => setCarId(e.target.value)} />
               <textarea className="textarea textarea-bordered w-full" placeholder="Damage description" value={description} onChange={(e) => setDescription(e.target.value)} />
               <div className="flex gap-2">
                    <button className="btn btn-primary" onClick={submitReturn}>Submit Return</button>
                    <button className="btn" onClick={submitDamage}>Report Damage</button>
               </div>
          </div>
     );
};

export default TripOps;
