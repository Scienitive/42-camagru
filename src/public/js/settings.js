import { buttonLoadingOn, buttonLoadingOff } from "./utility.js";

let emailSent = false;

export const setSettings = () => {
    const sendButton = document.getElementById('send-button');
    const emailInput = document.getElementById('email');
    const settingsForm = document.getElementById('settings-form');
    const notifOn = document.getElementById('notification-on');

    sendButton.addEventListener('click', () => {
        emailSent = true;
        sendButton.disabled = true;
    });

    emailInput.addEventListener('input', () => {
        if (emailInput.value === '') {
            sendButton.disabled = true;
        }
        else {
            if (!emailSent) {sendButton.disabled = false;}

        }
    });

    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitButton = e.target.querySelector('button[type="submit"]');
        buttonLoadingOn(submitButton);
        const formData = new FormData(e.target);

        const newEmail = formData.get('email') !== '' ? formData.get('email') : null;
        const verification = formData.get('verification') !== '' ? formData.get('verification') : null;
        const newUsername = formData.get('uname') !== '' ? formData.get('uname') : null;
        const newPassword = formData.get('password') !== '' ? formData.get('password') : null;
        const newNotifications = notifOn.checked ? true : false;
        
        const jsonData = {};
        if (!newEmail) {

        }
        if (!newUsername) {
            jsonData.username = newUsername;
        }

    });
}