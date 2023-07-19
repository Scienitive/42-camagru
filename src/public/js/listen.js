import { AJAXPost } from "./ajax.js";

// Event Listener For Buttons
document.addEventListener('click', (e) => {
    if (!e.target.matches("button")) {
        return;
    }
});

// Event Listener For Forms
document.addEventListener('submit', async (e) => {
    if (!e.target.matches("form")) {
        return;
    }
    e.preventDefault();

    const formData = new FormData(e.target);
    if (e.target.id === "signup-form") {
        await AJAXPost("signup.controller.php", formData, async (response, formData) => {
            if (response.ok) {
                const user = await response.json();
                const mailSubject = "Camagru - Email Verification Link";
                const mailContent = `http://localhost/verify?token=${user.verification_token}`;
                await AJAXPost("mail.controller.php", { email: formData.get('email'), subject: mailSubject, content: mailContent }, async (response) => {
                    if (response.ok) {
                        window.location.replace("/verification-sent");
                    }
                    else {
                        const errorMessage = await response.text();
                        const alertElement = document.getElementById('alert');
                        alertElement.textContent = errorMessage;
                        alertElement.classList.remove('d-none');
                    }
                });
            }
            else {
                const errorMessage = await response.text();
                const alertElement = document.getElementById('alert');
                alertElement.textContent = errorMessage;
                alertElement.classList.remove('d-none');
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
    }
}