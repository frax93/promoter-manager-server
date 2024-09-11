import { Op } from "sequelize";
import { Note } from "../db-models/note";

  // Funzione per inviare notifiche push a Expo
  export const sendPushNotification = async (expoPushToken: string, body: string): Promise<unknown> => {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'Reminder',
      body: body,
      data: { extraData: 'goes here' },
    };
  
    return await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

 export const checkAndSendNoteReminders = async () => {
   const now = new Date();

   try {
     // Trova tutte le note con un promemoria che non sono ancora state inviate
     const notes = await Note.findAll({
       where: {
         reminder_date: {
           [Op.lte]: now, // Se la data del promemoria è prima o uguale a ora
         },
         is_sent: false, // Se la notifica non è stata ancora inviata
       },
     });

     for (const note of notes) {
       // Invia la notifica (assumiamo che il token utente sia memorizzato separatamente)
       await sendPushNotification(
         note.dataValues.token,
         note.dataValues.contenuto
       );

       // Aggiorna il flag is_sent a true
       await note.update({
         is_sent: true,
       });
     }
   } catch (error) {
     console.error("Error checking or sending note reminders:", error);
   }
 };