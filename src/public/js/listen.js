import { AJAXGet, AJAXPost } from "./ajax.js";

const loadNewHTML = (elements, newMainView) => {
    const [headerElement, mainElement] = elements;
    document.getElementById('header-section').innerHTML = headerElement;
    document.getElementById('main-section').innerHTML = mainElement;
    setListeners(newMainView);
}

const setHeaderEventListeners = (mainView) => {
    /*if (mainView === "login") {
        const signupButton = document.getElementById("signup-button");

        signupButton.addEventListener('click', () => {
            AJAXPost("main-view.controller.php", { data: "sign-up" }, async (response, formData) => {
                const elements = await response.json();
                for (let data of formData) {
                    loadNewHTML(elements, data[1])
                }
            });
        });
    }
    else if (mainView === "sign-up") {
        const loginButton = document.getElementById("login-button");

        loginButton.addEventListener('click', () => {
            AJAXPost("main-view.controller.php", { data: "login" }, async (response, formData) => {
                const elements = await response.json();
                for (let data of formData) {
                    loadNewHTML(elements, data[1])
                }
            });
        });
    }*/
}

const setMainEventListeners = (mainView) => {
    if (mainView === "login") {

    }
    else if (mainView === "sign-up") {
        const signupForm = document.getElementById("signup-form");

        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            AJAXPost("signup.controller.php", formData, async (response, formData) => {
                const errorText = await response.text();
                if (errorText.length > 0) { // Error Happened

                }
                else {
                    const elements = await (await AJAXGet("main-view.controller.php")).json();
                    loadNewHTML(elements, await (await AJAXGet("current-session.php")).text());
                }
            });
        })
    }
    else if (mainView === "email-verification") {
        /*const loginButton = document.getElementById("back-to-login");

        loginButton.addEventListener('click', () => {
            AJAXPost("main-view.controller.php", { data: "login" }, async (response, formData) => {
                const elements = await response.json();
                for (let data of formData) {
                    loadNewHTML(elements, data[1])
                }
            });
        });*/
    }
}

export const setListeners = (mainView) => {
    //setHeaderEventListeners(mainView);
    setMainEventListeners(mainView);
}