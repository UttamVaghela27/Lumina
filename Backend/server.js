require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/database");
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);
connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  if (process.env.NODE_ENV === "production" && process.env.BACKEND_URL) {
    setInterval(
      () => {
        const https = require("https");
        https
          .get(`${process.env.BACKEND_URL}/ping`, (res) => {
            console.log(`Self-ping status: ${res.statusCode}`);
          })
          .on("error", (err) => {
            console.error(`Self-ping error: ${err.message}`);
          });
      },
      14 * 60 * 1000,
    ); // 14 minutes
  }
});
