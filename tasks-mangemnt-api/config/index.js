// ----------------- IMPORTS -----------------
import connectDB from "./mongodb.js";
import corsOptions from "./corsOptions.js";
import transporter, { sendEmail } from "./nodemailer.js";

// ----------------- EXPORTS -----------------
export { connectDB, corsOptions, transporter, sendEmail };
