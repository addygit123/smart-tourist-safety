// server/services/notificationService.js

// This function simulates sending the welcome SMS to a new tourist.
export const sendRegistrationSMS = (tourist) => {
    const message = `
    --------------------------------------------------
    📲 SMS SENT to Tourist: ${tourist.touristPhone}
    --------------------------------------------------
    Welcome to the Smart Tourist Safety network, ${tourist.name}!
    Download our app to activate your safety monitoring: [app-link.com]
    Your temporary password is: 123456
    --------------------------------------------------
    `;
    console.log(message);
};

// This function simulates sending an emergency alert to the family.
export const sendAlertSMS = (tourist) => {
    const contact = tourist.emergencyContact;
    if (!contact || !contact.phone) {
        console.log(`-- Cannot send alert for ${tourist.name}, no emergency contact phone.`);
        return;
    }

    const message = `
    **************************************************
    🚨 URGENT SMS SENT to Family: ${contact.phone}
    **************************************************
    URGENT: A safety anomaly has been detected for ${tourist.name} (ID: ${tourist.touristId}) near their last known location. 
    Please check your Family Portal for details. Local authorities have been notified.
    **************************************************
    `;
    console.log(message);
};