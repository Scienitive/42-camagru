import { AJAXGet, AJAXPost } from "./ajax.js";

export const loadNewHTML = (elements) => {
    const [headerElement, mainElement] = elements;
    document.getElementById('header-section').innerHTML = headerElement;
    document.getElementById('main-section').innerHTML = mainElement;
}

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
                const elements = await (await AJAXGet("current-elements.php")).json();
                loadNewHTML(elements);
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
                const elements = await (await AJAXGet("current-elements.php")).json();
                loadNewHTML(elements);
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