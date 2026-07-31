import { RefreshToken } from "../../models/index.js";

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export const persistRefreshToken = async ({
  token,
  userId,
  ip = "N/A",
  userAgent = "N/A",
}) => {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL);

  return await RefreshToken.create({
    token,
    user: userId,
    createdByIp: ip,
    userAgent,
    expiresAt,
    revoked: false,
  });
};
