import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const appUrl = "https://promoter-manager-server-0e30fdbde338.herokuapp.com"; // URL della tua applicazione (DA METTERE COME ENV)

function createConfirmationLink(token: string) {
  return `${appUrl}/confirm-email/${token}`;
}

const apikey = 'mlsn.12b12a22fae5ca051eee05641940a0eb8a3b582f2de2a28a35690fe41e37e13b';

export async function sendConfirmationEmail(email: string, token: string) {
    const confirmationLink = createConfirmationLink(token);

    const mailersend = new MailerSend({
      apiKey: apikey,
    });

    const sentFrom = new Sender("frank.md93@gmail.com", "Promoter Manager");
    
    const recipients = [new Recipient(email, "Recipient")];

    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject("Conferma la tua registrazione")
        .setText(`Clicca sul seguente link per confermare la tua email: ${confirmationLink}`);
    
    return mailersend.email.send(emailParams);
}
