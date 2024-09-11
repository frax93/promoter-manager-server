import nodemailer from "nodemailer";

const appUrl = "https://promoter-manager-server-0e30fdbde338.herokuapp.com"; // URL della tua applicazione (DA METTERE COME ENV)

function createConfirmationLink(token: string) {
  return `${appUrl}/confirm-email/${token}`;
}

export async function sendConfirmationEmail(email: string, token: string) {
  const confirmationLink = createConfirmationLink(token);
  let transporter = nodemailer.createTransport({
    service: "gmail", // Puoi usare Gmail o un altro servizio
    auth: {
      user: "francesco.murador@sistinf.it",
      pass: 'dv6.1215sl',
    },
  });

  let mailOptions = {
    from: "francesco.murador@sistinf.it",
    to: email,
    subject: "Conferma la tua registrazione",
    text: `Clicca sul seguente link per confermare la tua email: ${confirmationLink}`,
  };

  return transporter.sendMail(mailOptions);
}
