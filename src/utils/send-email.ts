import nodemailer from "nodemailer";

const appUrl = "https://promoter-manager-server-0e30fdbde338.herokuapp.com"; // URL della tua applicazione (DA METTERE COME ENV)

function createConfirmationLink(token: string) {
  return `${appUrl}/api/autenticazione/conferma-email/${token}`;
}

export async function sendConfirmationEmail(email: string, token: string) {
  const confirmationLink = createConfirmationLink(token);
  const transporter = nodemailer.createTransport({
    service: "gmail", // Puoi usare Gmail o un altro servizio
    auth: {
      user: "f41873773@gmail.com",
      pass: '6bJ)?(EWBgvCCv%Mdm:j',
    },
  });

  const mailOptions = {
    from: "f41873773@gmail.com",
    to: email,
    subject: "Conferma la tua registrazione",
    text: `Clicca sul seguente link per confermare la tua email: ${confirmationLink}`,
  };

  return transporter.sendMail(mailOptions);
}
