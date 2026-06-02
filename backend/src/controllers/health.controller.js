export const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "Portfolio API Running",
  });
};