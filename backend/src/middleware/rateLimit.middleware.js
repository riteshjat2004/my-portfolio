import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 *60 * 1000, //15 minute
  max: 7,

  handler: (req, res) => {
    console.log("RATE LIMIT HIT");

    res.status(429).json({
      success: false,
      message: "Too many login attempts",
    });
  },
});