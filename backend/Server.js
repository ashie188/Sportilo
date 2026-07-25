import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import joinMatchRoutes from "./routes/joinMatchRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import gamingCreateMatchRoutes from "./routes/gamingCreateMatchRoutes.js";
import gamingJoinMatchRoutes from "./routes/gamingJoinMatchRoutes.js";
import featuredMatchesRoutes from "./routes/featuredMatchesRoutes.js";
import MatchDetailsRoutes from "./routes/MatchDetailsRoutes.js";
import "./services/reminderCron.js";        //cron job
import adminFinalUpdateRoutes from "./routes/admin_final_updateroute.js";

dotenv.config();

const port=process.env.backend_port;
const app=express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


// auth-routes
app.use("/auth", authRoutes);

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

app.listen(port,()=>{
  console.log("the port is started at",port);
})