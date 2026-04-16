import { useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useRole from "../../hooks/useRole";

const SubmitReview = () => {
     const axiosPublic = useAxiosPublic();
     const role = useRole();
     const [vehicleType, setVehicleType] = useState("car");
     const [vehicleId, setVehicleId] = useState("");
     const [rating, setRating] = useState(5);
     const [review, setReview] = useState("");

     const handleSubmit = async () => {
          await axiosPublic.post("/reviewRoutes/vehicle", {
               vehicle_type: vehicleType,
               vehicle_id: vehicleId,
               user_id: role?.user_id,
               rating: Number(rating),
               review
          }, { withCredentials: true });
          setReview("");
     };

     return (
          <div className="p-6 space-y-3 max-w-2xl">
               <h2 className="text-2xl font-semibold">Submit Review</h2>
               <select className="select select-bordered w-full" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
               </select>
               <input className="input input-bordered w-full" placeholder="Vehicle ID" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} />
               <input className="input input-bordered w-full" type="number" min={1} max={5} value={rating} onChange={(e) => setRating(e.target.value)} />
               <textarea className="textarea textarea-bordered w-full" placeholder="Write your feedback" value={review} onChange={(e) => setReview(e.target.value)} />
               <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
          </div>
     );
};

export default SubmitReview;
