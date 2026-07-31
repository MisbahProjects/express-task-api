import { AppError } from "../utils/AppError.js";

const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppError("CORS policy: Origin not allowed", 403));
    }
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "X-Access-Token",
  ],
};

export default corsOptions;
