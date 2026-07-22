export const reminderEmail = (reminder) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Match Reminder</title>
    </head>

    <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;">

        <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:10px;overflow:hidden;">

            <div style="background:#2563eb;padding:20px;text-align:center;">
                <h1 style="margin:0;color:white;">Sportilo</h1>
            </div>

            <div style="padding:30px;color:#333;line-height:1.6;">

                <h2 style="margin-top:0;">
                    Hi ${reminder.adminName},
                </h2>

                <p>
                    This is a reminder that your event is scheduled to begin within the next <strong>2 hours.</strong>
                </p>

                <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:18px;margin:25px 0;">

                    <p style="margin:8px 0;">
                        <strong>Activity:</strong> ${reminder.title}
                    </p>

                    <p style="margin:8px 0;">
                        <strong>Location / Platform:</strong> ${reminder.location}
                    </p>

                    <p style="margin:8px 0;">
                        <strong>Date:</strong> ${new Date(reminder.date).toLocaleDateString()}
                    </p>

                    <p style="margin:8px 0;">
                        <strong>Time:</strong> ${reminder.time}
                    </p>

                </div>

                <p>
                    Make sure everything is ready before participants start joining.
                </p>

                <p>
                    Have a great game!
                </p>

                <p>
                    — Team Sportilo
                </p>

            </div>

            <div style="background:#f3f4f6;padding:15px;text-align:center;font-size:12px;color:#666;">
                You're receiving this email because you created this event on Sportilo.
            </div>

        </div>

    </body>
    </html>
    `;
};
