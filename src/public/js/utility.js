export const hash = async (string) => {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((bytes) => bytes.toString(16).padStart(2, '0'))
        .join('');
    return hashHex;
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
    const buttonText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner-border');

    if (buttonText && spinner)  {
        button.disabled = !removeDisabled;
        buttonText.classList.remove('d-none');
        spinner.classList.add('d-none');
    }
}