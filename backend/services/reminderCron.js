import cron from "node-cron";
import { processReminderEmails } from "./emailService.js";

cron.schedule("0 */2 * * *", async () => {
    console.log("Running reminder cron...");
    await processReminderEmails();
});