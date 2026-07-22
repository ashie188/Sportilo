export const welcomeEmail = (name) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Welcome to Sportilo</title>
</head>

<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:40px 20px;">
    <tr>
      <td align="center">

        <table role="presentation" width="600" cellspacing="0" cellpadding="0"
          style="background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">

          <!-- Header -->
          <tr>
            <td align="center"
              style="background:#2563eb;padding:24px;color:#ffffff;font-size:28px;font-weight:bold;">
              Sportilo
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:35px;color:#374151;">

              <h2 style="margin-top:0;color:#111827;">
                Welcome to Sportilo! 👋
              </h2>

              <p style="font-size:16px;line-height:1.7;">
                Hi <strong>${name}</strong>,
              </p>

              <p style="font-size:16px;line-height:1.7;">
                Thanks for creating your Sportilo account. We're excited to have you with us.
              </p>

              <p style="font-size:16px;line-height:1.7;margin-bottom:10px;">
                With Sportilo you can:
              </p>

              <ul style="padding-left:20px;color:#374151;line-height:2;">
                <li>⚽ Find nearby sports matches</li>
                <li>🏏 Create and manage your own matches</li>
                <li>🎮 Join gaming lobbies</li>
                <li>🤝 Connect with players in your area</li>
              </ul>

              <p style="font-size:16px;line-height:1.7;margin-top:25px;">
                We hope Sportilo helps you spend less time searching for players and more time enjoying the game.
              </p>

              <p style="font-size:16px;margin-top:30px;">
                See you on the field! 🏆
              </p>

              <p style="font-weight:bold;margin-bottom:0;">
                — Team Sportilo
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center"
              style="padding:18px;background:#f9fafb;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;">

              You're receiving this email because you created a Sportilo account.<br><br>

              © ${new Date().getFullYear()} Sportilo. All rights reserved.

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};
