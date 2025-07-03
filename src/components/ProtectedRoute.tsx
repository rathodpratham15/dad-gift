// import React from "react";
// import { Navigate } from "react-router-dom";

// const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//         return <Navigate to="/login" />;
//     }

//     return <>{children}</>;
// };

// export default ProtectedRoute;

import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    isAdmin: boolean;
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAdmin, children }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (isAdmin && role !== "admin") {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
};


export default ProtectedRoute;


