// Simple utility to test admin functionality
export const testAdminStatus = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  console.log("=== Admin Status Test ===");
  console.log("Token exists:", !!token);
  console.log("Role:", role);
  console.log("Is Admin:", role === "admin");
  console.log("========================");
  
  return {
    hasToken: !!token,
    role: role,
    isAdmin: role === "admin"
  };
};

// Function to simulate admin login for testing
export const simulateAdminLogin = () => {
  localStorage.setItem("token", "test-admin-token");
  localStorage.setItem("role", "admin");
  console.log("Simulated admin login - please refresh the page");
};

// Function to simulate regular user login for testing  
export const simulateUserLogin = () => {
  localStorage.setItem("token", "test-user-token");
  localStorage.setItem("role", "user");
  console.log("Simulated user login - please refresh the page");
};

// Function to clear login for testing
export const simulateLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  console.log("Simulated logout - please refresh the page");
}; 