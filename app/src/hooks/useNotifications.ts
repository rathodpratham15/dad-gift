// // hooks/useNotifications.ts
// import { useEffect, useRef } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// const shownIds = new Set<string>(); // Avoid duplicate toasts

// const useNotifications = () => {
//     const intervalRef = useRef<NodeJS.Timeout | null>(null);

//     useEffect(() => {
//         const fetchNotifications = async () => {
//             try {
//                 const { data } = await axios.get("http://localhost:3002/api/notifications");
//                 data.forEach((notif: { id: string; message: string; type?: string }) => {
//                     if (!shownIds.has(notif.id)) {
//                         shownIds.add(notif.id);
//                         toast(notif.message, {
//                             type: notif.type || "info",
//                             position: "bottom-right",
//                             autoClose: 5000,
//                         });
//                     }
//                 });
//             } catch (err) {
//                 console.error("🔴 Failed to fetch notifications:", err);
//             }
//         };

//         fetchNotifications();
//         intervalRef.current = setInterval(fetchNotifications, 30000); // every 30 sec

//         return () => {
//             if (intervalRef.current) clearInterval(intervalRef.current);
//         };
//     }, []);
// };

// export default useNotifications;
