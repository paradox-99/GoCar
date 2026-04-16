import { useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useRole from "../../hooks/useRole";

const ChatBox = () => {
     const axiosPublic = useAxiosPublic();
     const role = useRole();
     const [bookingId, setBookingId] = useState("");
     const [receiver, setReceiver] = useState("");
     const [message, setMessage] = useState("");

     const send = async () => {
          await axiosPublic.post("/chatRoutes", {
               booking_id: bookingId,
               sender_id: role?.user_id,
               receiver_id: receiver,
               message
          }, { withCredentials: true });
          setMessage("");
     };

     return (
          <div className="p-6 space-y-3 max-w-2xl">
               <h2 className="text-2xl font-semibold">Chat</h2>
               <input className="input input-bordered w-full" placeholder="Booking ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
               <input className="input input-bordered w-full" placeholder="Receiver ID" value={receiver} onChange={(e) => setReceiver(e.target.value)} />
               <textarea className="textarea textarea-bordered w-full" placeholder="Write message" value={message} onChange={(e) => setMessage(e.target.value)} />
               <button className="btn btn-primary" onClick={send}>Send message</button>
          </div>
     );
};

export default ChatBox;
