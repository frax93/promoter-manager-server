import nodemailer from "nodemailer";
import { google } from "googleapis";
import {
  __REFRESH_TOKEN_,
  __CLIENT_ID__,
  __CLIENT_SECRET__,
  __EMAIL_USER__,
} from "../constants/environment";

const user = __EMAIL_USER__;
const clientId = __CLIENT_ID__;
const clientSecret = __CLIENT_SECRET__;

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  "https://developers.google.com/oauthplayground" // URL di reindirizzamento
);

oauth2Client.setCredentials({
  refresh_token: __REFRESH_TOKEN_, // Il refresh token ottenuto
});

// Ottieni l'access token
const getAccessToken = async () => {
  const { token } = await oauth2Client.getAccessToken();
  return token;
};
const appUrl = "https://promoter-manager-server-0e30fdbde338.herokuapp.com"; // URL della tua applicazione (DA METTERE COME ENV)

function createConfirmationLink(token: string) {
  return `${appUrl}/api/autenticazione/conferma-email/${token}`;
}


export async function sendConfirmationEmail(email: string, token: string) {
  const confirmationLink = createConfirmationLink(token);
  const accessToken = await getAccessToken() as string;
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      accessToken,
      type: "OAuth2",
      clientId,
      clientSecret,
      refreshToken: __REFRESH_TOKEN_,
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
