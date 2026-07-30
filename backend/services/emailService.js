import { Resend } from "resend";
import db from "../config/db.js";
import { reminderEmail } from "./templates/reminderEmail.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.log("Email Error in sendemail at emailservice js");
    throw err;
  }
};

export const processReminderEmails = async () => {
  try {
    // Offline matches
    const offlineMatches = await db.query(
      `
            SELECT *
            FROM matches
            WHERE
                status = 'open'
                AND email_sent = FALSE
                AND (match_date + match_time) >= NOW()
                AND (match_date + match_time) < NOW() + INTERVAL '2 hours'
            `,
    );

    // Gaming groups
    const gamingGroups = await db.query(
      `
            SELECT *
            FROM gaming_groups
            WHERE
                status = 'open'
                AND email_sent = FALSE
                AND (event_date + event_time) >= NOW()
                AND (event_date + event_time) < NOW() + INTERVAL '2 hours'
            `,
    );

    const reminders = [
      ...offlineMatches.rows.map((match) => ({
        table: "matches",
        id: match.id,
        adminName: match.admin_name,
        adminEmail: match.admin_email,
        title: match.sport,
        location: match.location,
        date: match.match_date,
        time: match.match_time,
      })),

      ...gamingGroups.rows.map((group) => ({
        table: "gaming_groups",
        id: group.id,
        adminName: group.admin_name,
        adminEmail: group.admin_email,
        title: group.game,
        location: group.platform,
        date: group.event_date,
        time: group.event_time,
      })),
    ];

    for (const reminder of reminders) {
      try {
        await sendEmail({
          to: reminder.adminEmail,
          subject: "Reminder: Your event starts soon!",
          html: reminderEmail(reminder),
        });

        if (reminder.table === "matches") {
          await db.query(
            `
                        UPDATE matches
                        SET email_sent = TRUE
                        WHERE id = $1
                        `,
            [reminder.id],
          );
        } else {
          await db.query(
            `
                        UPDATE gaming_groups
                        SET email_sent = TRUE
                        WHERE id = $1
                        `,
            [reminder.id],
          );
        }
      } catch (err) {
        console.error(
          `Failed to send reminder for ${reminder.table} ID ${reminder.id}:`,
          err.message,
        );
      }
    }
  } catch (err) {
    console.log("Reminder email process failed in emailservice.js");
  }
};
