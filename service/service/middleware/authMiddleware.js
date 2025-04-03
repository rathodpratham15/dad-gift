import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Authentication failed" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.role = decoded.role;

        if (!req.role) {
            return res.status(403).json({ message: "Access denied: No role assigned" });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export default authMiddleware;



// import jsonwebtoken from "jsonwebtoken";

// const { verify } = jsonwebtoken;

// export default (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) {
//         return res.status(401).json({ message: "Authentication failed" });
//     }

//     try {
//         const decoded = verify(token, process.env.JWT_SECRET);
//         req.userId = decoded.userId;
//         req.role = decoded.role;
//         next();
//     } catch (error) {
//         res.status(401).json({ message: "Invalid token" });
//     }
// };


// --------------
// import jwt from "jsonwebtoken";

// const protect = (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//         return res.status(401).json({ message: "No token, authorization denied" });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         console.error("Token Verification Error:", error.message);
//         return res.status(401).json({ message: "Token is not valid" });
//     }
// };

// export const adminProtect = (req, res, next) => {
//     protect(req, res, () => {
//         if (req.user.role !== "admin") {
//             return res.status(403).json({ message: "Access Denied: Admins Only" });
//         }
//         next();
//     });
// };

// export default protect;




// import { verify } from "jsonwebtoken";
// const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key";

// export function verifyToken(req, res, next) {
//     const token = req.header("Authorization")?.split(" ")[1];
//     if (!token) return res.status(403).json({ error: "Access denied!" });

//     try {
//         const verified = verify(token, SECRET_KEY);
//         req.user = verified;
//         next();
//     } catch (error) {
//         res.status(401).json({ error: "Invalid token!" });
//     }
// }

// export function requireRole(role) {
//     return (req, res, next) => {
//         if (req.user.role !== role) {
//             return res.status(403).json({ error: "Access denied!" });
//         }
//         next();
//     };
// }

// import jsonwebtoken from "jsonwebtoken";

// const { verify } = jsonwebtoken;

// const protect = (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//         console.error("No token provided");
//         return res.status(401).json({ message: "No token, authorization denied" });
//     }

//     try {
//         const decoded = verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         console.log("Decoded token:", req.user);
//         next();
//     } catch (err) {
//         console.error("Token Verification Error:", err.message);
//         return res.status(401).json({ message: "Token is not valid" });
//     }
// };

// export default protect;
