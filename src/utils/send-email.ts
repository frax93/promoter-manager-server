import nodemailer from "nodemailer";

const appUrl = "https://promoter-manager-server-0e30fdbde338.herokuapp.com"; // URL della tua applicazione (DA METTERE COME ENV)

function createConfirmationLink(token: string) {
  return `${appUrl}/confirm-email/${token}`;
}

export async function sendConfirmationEmail(email: string, token: string) {
  const confirmationLink = createConfirmationLink(token);
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.elasticemail.com',
    port: 2525,
    auth: {
      user: 'no-reply@pmanager.com',
      pass: 'A643EE194059476BAC996D0329FB9DEFD54C'
    }
  });

  let mailOptions = {
    from: 'prova@pmanager.com',
    to: email,
    subject: "Conferma la tua registrazione",
    text: `Clicca sul seguente link per confermare la tua email: ${confirmationLink}`,
  };

  return transporter.sendMail(mailOptions);
}
