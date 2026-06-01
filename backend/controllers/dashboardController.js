export const getDashboardData = (req, res) => {
  const user = req.user;

  let data = {};

  if (user.role === "admin") {
    data = { message: `Welcome Admin ${user.name}`, dashboard: "Admin Dashboard Data" };
  } else if (user.role === "hostelOwner") {
    data = { message: `Welcome Owner ${user.name}`, dashboard: "Owner Dashboard Data" };
  } else {
    data = { message: `Welcome User ${user.name}`, dashboard: "User Dashboard Data" };
  }

  res.status(200).json(data);
};
