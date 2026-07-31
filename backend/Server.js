import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import joinMatchRoutes from "./routes/joinMatchRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import gamingCreateMatchRoutes from "./routes/gamingCreateMatchRoutes.js";
import gamingJoinMatchRoutes from "./routes/gamingJoinMatchRoutes.js";
import featuredMatchesRoutes from "./routes/featuredMatchesRoutes.js";
import MatchDetailsRoutes from "./routes/MatchDetailsRoutes.js";
import "./services/reminderCron.js"; //cron job
import adminFinalUpdateRoutes from "./routes/admin_final_updateroute.js";

dotenv.config();

const port = process.env.PORT || process.env.backend_port || 3000;
const app = express();
//express-rate-limit render issue
app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());
const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); 

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

// auth-routes
app.use("/auth", authLimiter, authRoutes);

//create-group
app.use("/matches", matchRoutes);

//join-match and fetch offline matches for join match page and fetch participants of the match for rendering in the match details page
app.use("/joinmatch", joinMatchRoutes);

//acount-page data importing
app.use("/account", accountRoutes);

//create gaming match
app.use("/gaming", gamingCreateMatchRoutes);

//fetch gaming matches for join match page and join gaming lobby by adding the participants in the table and updating the current players count, also to fecth participants of the gaming lobby and show in the match details page
app.use("/gaming", gamingJoinMatchRoutes);

//featured matches route
app.use("/home", featuredMatchesRoutes);

//match details route
app.use("/details", MatchDetailsRoutes);

//aadmin final note
app.use("/admin_final_update", adminFinalUpdateRoutes);

//health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log("the port is started at", port);
});
