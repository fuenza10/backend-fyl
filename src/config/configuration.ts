export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  auth: {
    jwtKey: process.env.JWT_KEY,
  },
  db: {
    url: process.env.DATABASE_URL,
  },

});
