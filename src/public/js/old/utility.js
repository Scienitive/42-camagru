import { AJAXGet, AJAXPost } from "./ajax.js";

const hash = async (string) => {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((bytes) => bytes.toString(16).padStart(2, '0'))
        .join('');
    return hashHex;
}

export const createNewToken = async (username, email, applyToDatabase = true) => {
    const randomValue = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const newToken = await hash(username + email + randomValue.toString());

    if (applyToDatabase) {
        await AJAXPost("token.controller.php", { email: email, token: newToken });
    }

    return newToken;
}

export const createNewTokenFromOldToken = async (token, applyToDatabase = true) => {
    const response = await AJAXGet("user.controller.php", { token: token });
    if (response.ok) {
        const user = await response.json();
        return (await createNewToken(user.username, user.email, applyToDatabase));
    }
    return null;
}

export const buttonLoadingOn = (button) => {
    if (!button) {return;}
    const buttonText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner-border');

    if (buttonText && spinner)  {
        button.disabled = true;
        buttonText.classList.add('d-none');
        spinner.classList.remove('d-none');
    }
}

export const buttonLoadingOff = (button, removeDisabled = true) => {
    if (!button) {return;}
    setTimeout(() => {
        const buttonText = button.querySelector('.btn-text');
        const spinner = button.querySelector('.spinner-border');

        if (buttonText && spinner)  {
            button.disabled = !removeDisabled;
            buttonText.classList.remove('d-none');
            spinner.classList.add('d-none');
        }
    }, 1);
}

export const convertStringToElement = (htmlString) => {
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(htmlString, 'text/html');
    return parsedDocument.body.firstChild;
}

export const alertModify = (alertElement, message, red = true) => {
    alertElement.classList.remove('d-none');
    alertElement.textContent = message;
    if (!red) {
        alertElement.classList.remove('alert-danger');
        alertElement.classList.add('alert-success');
    }
}

export const pixelToPercentage = (px, parentSize) => {
    return px * 100 / parentSize;
}

export const percentageToPixel = (percentage, parentSize) => {
    return percentage * parentSize / 100;
}

export const setSessionVariable = async (variableName) => {
    const variables = [variableName];
    const values = ['true'];
    await AJAXPost("session-var.controller.php", { variables: JSON.stringify(variables), values: JSON.stringify(values) });
}