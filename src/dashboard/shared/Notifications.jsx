import { useEffect, useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useRole from "../../hooks/useRole";

const Notifications = () => {
     const role = useRole();
     const axiosPublic = useAxiosPublic();
     const [items, setItems] = useState([]);

     const loadNotifications = async () => {
          if (!role?.user_id) return;
          const { data } = await axiosPublic.get(`/notificationRoutes/user/${role.user_id}`, { withCredentials: true });
          setItems(data || []);
     };

     useEffect(() => {
          loadNotifications();
     }, [role?.user_id]);

     const markRead = async (id) => {
          await axiosPublic.patch(`/notificationRoutes/${id}/read`, {}, { withCredentials: true });
          loadNotifications();
     };

     return (
          <div className="p-6">
               <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
               <div className="space-y-2">
                    {items.map((item) => (
                         <div className="p-3 rounded-lg border flex items-center justify-between" key={item.notif_id}>
                              <span>{item.message}</span>
                              {!item.is_read && <button className="btn btn-sm" onClick={() => markRead(item.notif_id)}>Mark read</button>}
                         </div>
                    ))}
               </div>
          </div>
     );
};

export default Notifications;
