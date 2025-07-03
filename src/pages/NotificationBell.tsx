// // src/components/NotificationBell.tsx
// import React, { useState, useEffect } from "react";
// import { Bell } from "lucide-react";
// import axios from "axios";
// import "./NotificationBell.css";

// const NotificationBell: React.FC = () => {
//     const [open, setOpen] = useState(false);
//     const [notifs, setNotifs] = useState([]);

//     const fetchNotifs = async () => {
//         try {
//             const res = await axios.get("http://localhost:3002/api/notifications");
//             setNotifs(res.data || []);
//         } catch (err) {
//             console.error("❌ Error fetching notifications:", err);
//         }
//     };

//     useEffect(() => {
//         fetchNotifs();
//     }, []);

//     return (
//         <div className="notif-container">
//             <div className="notif-icon" onClick={() => setOpen(!open)}>
//                 <Bell size={22} />
//                 {notifs.length > 0 && <span className="notif-badge">{notifs.length}</span>}
//             </div>

//             {open && (
//                 <div className="notif-dropdown">
//                     {notifs.length === 0 ? (
//                         <p className="notif-empty">No notifications</p>
//                     ) : (
//                         notifs.map((n, idx) => (
//                             <div className="notif-item" key={idx}>
//                                 {n.message}
//                             </div>
//                         ))
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default NotificationBell;
