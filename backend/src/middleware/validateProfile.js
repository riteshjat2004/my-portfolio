const validateProfile = (req, res, next) => {
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({
      message: "Name and role are required",
    });
  }

  next();
};

export default validateProfile;