import { AJAXPost, AJAXGet } from "./ajax.js";
import { buttonLoadingOn, buttonLoadingOff, alertModify, createNewTokenFromOldToken } from "./utility.js";

let emailSent = false;

export const setSettings = async () => {
    const session = await (await AJAXGet("current-session.php")).json();
    const user = await (await AJAXGet("user.controller.php", { id: session['user-id'] })).json();

    const sendButton = document.getElementById('send-button');
    const saveButton = document.getElementById('save-button');
    const emailInput = document.getElementById('email');
    const verificationInput = document.getElementById('verification');
    const settingsForm = document.getElementById('settings-form');
    const notifOn = document.getElementById('notification-on');
    const alertElement = document.getElementById('alert');

    const saveButtonModify = () => {
        if (emailInput.value === '') {
            saveButton.disabled = false;
        }
        else {
            if (emailSent) {
                if (verificationInput.value === '') {
                    saveButton.disabled = true;
                }
                else {
                    saveButton.disabled = false;
                }
            }
            else {
                saveButton.disabled = true;
            }
        }
    }
    
    sendButton.addEventListener('click', async () => {
        buttonLoadingOn(sendButton);

        let errorMessage = "";
        const newEmail = emailInput.value !== '' ? emailInput.value : null;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!newEmail) {errorMessage = "Please provide a mail address.";}
        else if (!emailRegex.test(newEmail)) {errorMessage = "Please provide a valid email address.";}
        else if (user.email === newEmail) {errorMessage = `Your email address is already ${newEmail}.`;}

        if (errorMessage !== "") {
            alertModify(alertElement, errorMessage);
            buttonLoadingOff(sendButton);
            return;
        }

        const mailSubject = "Camagru - Email Verification";
        const mailContent = `Hi ${user.username},\n\nYour new email verification code is: ${user.verification_token.substring(0,4).toUpperCase()}\n\nThanks,\n- Camagru`;
        const mailResponse = await AJAXPost("send-mail.controller.php", { email: newEmail, subject: mailSubject, content: mailContent });
        if (mailResponse.ok) {
            emailSent = true;
            saveButtonModify();
            await createNewTokenFromOldToken(user.verification_token);
            alertModify(alertElement, "Verification code has been sent to your new email.", false);
            buttonLoadingOff(sendButton, false);
        }
        else {
            alertModify(alertElement, await mailResponse.text());
            buttonLoadingOff(sendButton);
        }
    });

    emailInput.addEventListener('input', () => {
        if (emailInput.value === '') {
            sendButton.disabled = true;
        }
        else {
            if (!emailSent) {sendButton.disabled = false;}
        }
        saveButtonModify();
    });

    verificationInput.addEventListener('input', () => {
        saveButtonModify();
    });

    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        buttonLoadingOn(saveButton);
        const formData = new FormData(e.target);

        const newEmail = formData.get('email') !== '' ? formData.get('email') : null;
        const verification = formData.get('verification') !== '' ? formData.get('verification') : null;
        const newUsername = formData.get('uname') !== '' ? formData.get('uname') : null;
        const newPassword = formData.get('password') !== '' ? formData.get('password') : null;
        const newNotification = notifOn.checked ? true : false;
        
        const jsonData = {};
        let errorMessage = "";
        if (newEmail) {
            console.log(verification);
            console.log(user.verification_token.substring(0, 4).toUpperCase());
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(newEmail)) {errorMessage = "Please provide a valid email address.";}
            else if (user.email === newEmail) {errorMessage = `Your email address is already ${newEmail}.`;}
            else if (!verification) {errorMessage = "Please enter the code that has been sent to your new email.";}
            else if (user.verification_token.substring(0, 4).toUpperCase() !== verification) {errorMessage = "Wrong code.";}

            if (errorMessage !== "") {
                alertModify(alertElement, errorMessage);
                buttonLoadingOff(saveButton);
                return;
            }

            jsonData.email = newEmail;
        }
        if (newUsername) {
            const usernameRegex = /[^a-zA-Z0-9-_]/;
            if (usernameRegex.test(newUsername)) {errorMessage = "Username must not include special characters other than (_) and (-).";}
            else if (newUsername.length < 4) {errorMessage = "Username must be at least 4 characters.";}
            else if (newUsername.length > 20) {errorMessage = "Username must not exceed 20 characters.";}
            else if (user.username === newUsername) {errorMessage = `Your username is already ${newUsername}.`;}

            if (errorMessage !== "") {
                alertModify(alertElement, errorMessage);
                buttonLoadingOff(saveButton);
                return;
            }

            jsonData.username = newUsername;
        }
        if (newPassword) {
            const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/;
            if (!passwordRegex.test(newPassword)) {errorMessage = "Password must include at least one uppercase, one lowecase and one number character.";}
            else if (newPassword.length < 6) {errorMessage = "Password must be at least 6 characters.";}
            else if (newPassword.length > 32) {errorMessage = "Username must not exceed 32 characters.";}

            if (errorMessage !== "") {
                alertModify(alertElement, errorMessage);
                buttonLoadingOff(saveButton);
                return;
            }

            jsonData.password = newPassword;
        }
        if (newNotification != user.email_notification) {
            jsonData.emailNotification = newNotification ? 1 : 0;
        }

        console.log(jsonData);

        if (Object.entries(jsonData).length === 0) {
            alertModify(alertElement, "Please change something before hitting save.");
            buttonLoadingOff(saveButton);
            return;
        }

        jsonData.id = user.id;
        const userResponse = await AJAXPost("user.controller.php", jsonData);
        if (userResponse.ok) {
            alertModify(alertElement, "Your settings have been changed successfully!", false);
            buttonLoadingOff(saveButton, false);
        }
        else {
            alertModify(alertElement, await userResponse.text());
            buttonLoadingOff(saveButton);
        }
    });
}