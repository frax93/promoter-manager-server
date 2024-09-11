import nodemailer from "nodemailer";
import { __ACCESS_TOKEN_, __CLIENT_ID__, __CLIENT_SECRET__, __EMAIL_USER__ } from "../constants/environment";

const appUrl = "https://promoter-manager-server-0e30fdbde338.herokuapp.com"; // URL della tua applicazione (DA METTERE COME ENV)

function createConfirmationLink(token: string) {
  return `${appUrl}/api/autenticazione/conferma-email/${token}`;
}


const user = __EMAIL_USER__;
const clientId = __CLIENT_ID__;
const clientSecret = __CLIENT_SECRET__;

export async function sendConfirmationEmail(email: string, token: string) {
  const confirmationLink = createConfirmationLink(token);
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      type: 'OAuth2',
      clientId,
      clientSecret,
    },
  });

  const mailOptions = {
    from: user,
    to: email,
    subject: "Conferma la tua registrazione",
    text: `Clicca sul seguente link per confermare la tua email: ${confirmationLink}`,
  };

  return transporter.sendMail(mailOptions);
}
