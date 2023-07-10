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
            const errorText = await response.text();
            if (errorText.length > 0) { // Error Happened

            }
            else {
                const elements = await (await AJAXGet("main-view.controller.php")).json();
                loadNewHTML(elements);
            }
        });
    }
    else if (e.target.id === "login-form") {
        await AJAXPost("login.controller.php", formData, async (response, formData) => {
            const errorText = await response.text();
            if (errorText.length > 0) { // Error Happened
                console.log(errorText);
            }
            else {
                const elements = await (await AJAXGet("main-view.controller.php")).json();
                loadNewHTML(elements);
            }
        });
    }
})