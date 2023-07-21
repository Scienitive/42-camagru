import { AJAXDelete, AJAXGet, AJAXPost } from "./ajax.js";
import { buttonLoadingOff, buttonLoadingOn, createNewToken, createNewTokenFromOldToken } from "./utility.js";

// Event Listener For Buttons
document.addEventListener('click', (e) => {
    if (!e.target.matches("button")) {
        return;
    }
    //buttonLoadingOn(e.target);
});

// Event Listener For Forms
document.addEventListener('submit', async (e) => {
    if (!e.target.matches("form")) {
        return;
    }

    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    buttonLoadingOn(submitButton);
    const formData = new FormData(e.target);

    if (e.target.id === "signup-form") {
        // CLIENT-SIDE CONTROLS
        const alertElement = document.getElementById('alert');
        const usernameRegex = /[^a-zA-Z0-9-_]/;
        const username = formData.get('uname');
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/;
        const password = formData.get('password');
        let errorMessage = "";
        if (usernameRegex.test(username)) {errorMessage = "Username must not include special characters other than (_) and (-).";}
        else if (username.length < 4) {errorMessage = "Username must be at least 4 characters.";}
        else if (username.length > 20) {errorMessage = "Username must not exceed 20 characters.";}
        else if (!passwordRegex.test(password)) {errorMessage = "Password must include at least one uppercase, one lowecase and one number character.";}
        else if (password.length < 6) {errorMessage = "Password must be at least 6 characters.";}
        else if (password.length > 32) {errorMessage = "Username must not exceed 32 characters.";}

        if (errorMessage !== "") {
            alertElement.textContent = errorMessage;
            alertElement.classList.remove('d-none');
            buttonLoadingOff(submitButton);
            return;
        }

        // HTTP REQUEST
        const token = await createNewToken(username + formData.get('email'), false);
        formData.append('token', token);
        await AJAXPost("signup.controller.php", formData, async (response) => {
            if (response.ok) {
                const user = await response.json();
                const mailSubject = "Camagru - Email Verification";
                const mailContent = `Hi ${user.username},\n\nWelcome to Camagru!\n\nPlease click the link below to verify your account.\n\nhttp://localhost/verify?token=${user.verification_token}\n\nThanks,\n- Camagru`;
                await AJAXPost("send-mail.controller.php", { email: formData.get('email'), subject: mailSubject, content: mailContent }, async (response) => {
                    if (response.ok) {
                        window.location.replace("/verification-sent");
                    }
                    else {
                        await AJAXDelete("user.controller.php", { email: formData.get('email') });
                        errorMessage = await response.text();
                        alertElement.textContent = errorMessage;
                        alertElement.classList.remove('d-none');
                        buttonLoadingOff(submitButton);
                    }
                });
            }
            else {
                errorMessage = await response.text();
                alertElement.textContent = errorMessage;
                alertElement.classList.remove('d-none');
                buttonLoadingOff(submitButton);
            }
        });
    }
    else if (e.target.id === "login-form") {
        await AJAXPost("login.controller.php", formData, async (response, formData) => {
            if (response.ok) {
                window.location.replace("/");
            }
            else {
                const errorMessage = await response.text();
                const alertElement = document.getElementById('alert');
                alertElement.textContent = errorMessage;
                alertElement.classList.remove('d-none');
                buttonLoadingOff(submitButton);
            }
        });
    }
    else if (e.target.id === "password-change-form-1") {
        const response = await AJAXGet("user.controller.php", { email: formData.get('email') });
        if (response.ok) {
            const user = await response.json();
            if (!user.is_verified) {
                const alertElement = document.getElementById('alert');
                alertElement.textContent = "You need to verify your account to change your password.";
                alertElement.classList.remove('d-none');
                buttonLoadingOff(submitButton);
                return;
            }
            const mailSubject = "Camagru - Password Change";
            const mailContent = `Hi ${user.username},\n\nPlease click the link below to change your password.\n\nhttp://localhost/password-change?token=${user.verification_token}\n\nThanks,\n- Camagru`;
            await AJAXPost("send-mail.controller.php", { email: formData.get('email'), subject: mailSubject, content: mailContent }, async (response) => {
                if (response.ok) {
                    const alertElement = document.getElementById('alert');
                    alertElement.classList.remove('d-none', 'alert-danger');
                    alertElement.classList.add('alert-success');
                    alertElement.textContent = "Email has been sent successfully.";
                    buttonLoadingOff(submitButton, false);
                }
                else {
                    const errorMessage = await response.text();
                    const alertElement = document.getElementById('alert');
                    alertElement.textContent = errorMessage;
                    alertElement.classList.remove('d-none');
                    buttonLoadingOff(submitButton);
                }
            });
        }
        else {
            const errorMessage = await response.text();
            const alertElement = document.getElementById('alert');
            alertElement.textContent = errorMessage;
            alertElement.classList.remove('d-none');
            buttonLoadingOff(submitButton);
        }

    }
    else if (e.target.id === "password-change-form-2") {
        // CLIENT-SIDE CONTROLS
        const alertElement = document.getElementById('alert');
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/;
        const password = formData.get('password');
        let errorMessage = "";
        if (!passwordRegex.test(password)) {errorMessage = "Password must include at least one uppercase, one lowecase and one number character.";}
        else if (password.length < 6) {errorMessage = "Password must be at least 6 characters.";}
        else if (password.length > 32) {errorMessage = "Username must not exceed 32 characters.";}

        if (errorMessage !== "") {
            alertElement.textContent = errorMessage;
            alertElement.classList.remove('d-none');
            buttonLoadingOff(submitButton);
            return;
        }

        // HTTP REQUEST
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userResponse = await AJAXGet("token-user.controller.php", { token: token });
        if (!userResponse.ok) {
            alertElement.textContent = "Verification token is invalid.";
            alertElement.classList.remove('d-none');
            buttonLoadingOff(submitButton);
            return;
        }
        const user = await userResponse.json();
        if (!user.is_verified) {
            alertElement.textContent = "You need to verify your account to change your password.";
            alertElement.classList.remove('d-none');
            buttonLoadingOff(submitButton);
            return;
        }
        await AJAXPost("password.controller.php", { password: formData.get('password'), token: token }, async (response, formData) => {
            if (response.ok) {
                const alertElement = document.getElementById('alert');
                alertElement.classList.remove('d-none', 'alert-danger');
                alertElement.classList.add('alert-success');
                alertElement.textContent = "Your password has been changed successfully.";
                await createNewTokenFromOldToken(token);
                buttonLoadingOff(submitButton, false);
            }
            else {
                errorMessage = await response.text();
                alertElement.textContent = errorMessage;
                alertElement.classList.remove('d-none');
                buttonLoadingOff(submitButton);
            }
        });
    }
})

// Event Listener For Page Loads
export const afterPageLoad = async () => {
    if (window.location.pathname === '/verify') {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        await AJAXPost("verify.controller.php", { token: token }, async (response) => {
            const header = document.getElementById('verify-header');
            const content = document.getElementById('verify-content');
            if (response.ok) {
                header.textContent = "Verification Successful!";
                content.textContent = "You are ready to go.";
            }
            else {
                if (response.status === 404) {
                    header.textContent = "Verification Unsuccessful!";
                    content.textContent = "Verification token is invalid.";
                }
                else if (response.status === 400) {
                    header.textContent = "Verification Unsuccessful!";
                    content.textContent = "You are already verified.";
                }
                else {
                    const errorMessage = await response.text();
                    header.textContent = "Error!";
                    content.textContent = errorMessage;
                }
            }
        });
        await createNewTokenFromOldToken(token);
    }
}