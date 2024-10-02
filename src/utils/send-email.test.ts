import nodemailer from "nodemailer";
import { sendEmail, sendConfirmationEmail, createConfirmationLink, backendAppUrl } from '../utils/send-email'; // Modifica con il percorso corretto
import { __EMAIL_USER__ } from '../constants/environment';

jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn(() => ({
        setCredentials: jest.fn(),
        getAccessToken: jest.fn().mockResolvedValue({ token: 'mockAccessToken' }),
      })),
    },
  },
}));

const mockSendEmail = jest.spyOn(require('../utils/send-email'), 'sendEmail').mockResolvedValue('Email sent');

const mockTransporter = { sendMail: mockSendEmail };

const nodemailerJest = jest.fn().mockResolvedValue(mockTransporter);
(nodemailer.createTransport as jest.Mock) = nodemailerJest;

describe('createConfirmationLink', () => {
  it('dovrebbe generare il link di conferma corretto', () => {
    const token = 'mockToken';
    const result = createConfirmationLink(token);
    expect(result).toBe(`${backendAppUrl}/api/autenticazione/conferma-email/${token}`);
  });
});

describe('sendConfirmationEmail', () => {
  it('dovrebbe inviare un\'email di conferma con il link corretto', async () => {
    const mockSendEmail = jest.spyOn(require('../utils/send-email'), 'sendEmail').mockResolvedValue('Email sent');

    const email = 'test@example.com';
    const token = 'mockToken';

    const result = await sendConfirmationEmail(email, token);

    expect(mockSendEmail).toHaveBeenCalledWith({
      to: email,
      subject: "Conferma la tua registrazione",
      text: `Clicca sul seguente link per confermare la tua email: ${backendAppUrl}/api/autenticazione/conferma-email/${token}`,
    });

    expect(result).toBe('Email sent');
  });
});
