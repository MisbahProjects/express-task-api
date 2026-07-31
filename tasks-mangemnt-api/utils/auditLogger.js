import fs from "fs";

export const auditLogger = (userId, action, ip = "N/A", userAgent = "N/A") => {
  const log = `${new Date().toISOString()} - ${
    userId || "Guest"
  } - ${action} - IP: ${ip} - Agent: ${userAgent}\n`;
  fs.appendFileSync("audit.log", log);
};
