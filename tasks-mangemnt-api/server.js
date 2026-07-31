import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB, corsOptions } from "./config/index.js";
import routes from "./routes/index.js";
import { globalErrorHandler } from "./middleware/index.js";

dotenv.config();

const app = express();

// ----------------- MIDDLEWARE -----------------
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ----------------- ROUTES -----------------
app.use("/api", routes);

// ----------------- GLOBAL ERROR HANDLER -----------------
app.use(globalErrorHandler);

// ----------------- DB & SERVER -----------------
connectDB().then(() =>
  app.listen(process.env.PORT || 5000, () => console.log("🚀 Server running"))
);
