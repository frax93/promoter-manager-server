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
      user: "frank.md93@gmail.com",
      pass: 'q4C_j537Q".5oN)E',
    },
  });

  let mailOptions = {
    from: "frank.md93@gmail.com",
    to: email,
    subject: "Conferma la tua registrazione",
    text: `Clicca sul seguente link per confermare la tua email: ${confirmationLink}`,
  };

  return transporter.sendMail(mailOptions);
}
