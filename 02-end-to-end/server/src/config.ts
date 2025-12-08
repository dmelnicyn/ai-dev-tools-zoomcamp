export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  corsOrigin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === "production" ? "*" : "http://localhost:5173"),
  isProduction: process.env.NODE_ENV === "production",
};
