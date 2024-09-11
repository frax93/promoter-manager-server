import nodemailer from "nodemailer";

const appUrl = "https://promoter-manager-server-0e30fdbde338.herokuapp.com"; // URL della tua applicazione (DA METTERE COME ENV)

function createConfirmationLink(token: string) {
  return `${appUrl}/confirm-email/${token}`;
}

export async function sendConfirmationEmail(email: string, token: string) {
  const confirmationLink = createConfirmationLink(token);
  const transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: 'apikey',
      pass: 'YOUR_SENDGRID_API_KEY'
    }
  });

  let mailOptions = {
    from: 'your-email@example.com',
    to: email,
    subject: "Conferma la tua registrazione",
    text: `Clicca sul seguente link per confermare la tua email: ${confirmationLink}`,
  };

  return transporter.sendMail(mailOptions);
}
