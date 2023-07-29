//#region COMPATIBILITY.JS
const ObjectValues = (obj) => {
    if (!obj || typeof obj !== 'object') {
        throw new TypeError('ObjectValues called on non-object');
    }

    const values = [];
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            values.push(obj[key]);
        }
    }
  
    return values;
}

const customPadStart = (str, targetLength, padChar) => {
    if (str.length >= targetLength) {
        return str;
    }
  
    const paddingLength = targetLength - str.length;
    const padString = padChar.repeat(paddingLength);
  
    return padString + str;
}

const customURLSearchParams = (parameter) => {
    if (typeof parameter === 'object') {
        const queryParams = [];
        for (const key in parameter) {
            if (Object.prototype.hasOwnProperty.call(parameter, key)) {
                const value = encodeURIComponent(parameter[key]);
                queryParams.push(`${encodeURIComponent(key)}=${value}`);
            }
        }

        return queryParams.join('&');
    }
    else if (typeof parameter === 'string') {
        const queryParams = {};
        const cleanedSearchString = parameter.replace(/^\?/, '');
        const paramPairs = cleanedSearchString.split('&');

        for (const paramPair of paramPairs) {
            const [key, value] = paramPair.split('=');
            queryParams[decodeURIComponent(key)] = decodeURIComponent(value);
        }

        return {
            get: function (key) {
                return queryParams[key] || null;
            }
        };
    }
    else {
        throw new TypeError('customURLSearchParams called with invalid parameter');
    }
}

function getCookie(name) {
    const cookieString = document.cookie;
    const cookies = cookieString.split('; ');
  
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=');
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
  
    // If the cookie with the given name is not found
    return null;
  }
//#endregion

//#region AJAX.JS
const makeFormData = (jsonData) => {
    if (jsonData instanceof FormData) {
        return jsonData;
    }
    var formData = new FormData();
    for (let i = 0; i < Object.keys(jsonData).length; i++) {
        const key = Object.keys(jsonData)[i];
        const value = ObjectValues(jsonData)[i];
        formData.append(key, value);
    }
    return formData;
}

const AJAXPost = async (link, jsonData) => {
    const formData = makeFormData(jsonData);
    const response = await fetch(`server/controllers/post/${link}`, {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
    });
    return response;
}

const AJAXGet = async (link, jsonData) => {
    if (jsonData === undefined) {
        const response = await fetch(`server/controllers/get/${link}`);
        return response;
    }
    else {
        const queryParams = customURLSearchParams(jsonData);
        const response = await fetch(`server/controllers/get/${link}?${queryParams}`);
        return response;
    }
}

const AJAXGetHTML = async (link) => {
    const response = await fetch(`public/html/${link}`);
    return response;
}

const AJAXDelete = async (link, jsonData) => {
    if (jsonData === undefined) {
        const response = await fetch(`server/controllers/delete/${link}`, {
            method: 'DELETE',
            credentials: 'same-origin',
        });
        return response;
    }
    else {
        const queryParams = customURLSearchParams(jsonData);
        const response = await fetch(`server/controllers/delete/${link}?${queryParams}`, {
            method: 'DELETE',
            credentials: 'same-origin',
        });
        return response;
    }
}
//#endregion

//#region UTILITY.JS
const hash = async (string) => {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((bytes) => customPadStart(bytes.toString(16), 2, '0'))
        .join('');
    return hashHex;
}

const createNewToken = async (username, email, applyToDatabase = true) => {
    const randomValue = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const newToken = await hash(username + email + randomValue.toString());

    if (applyToDatabase) {
        await AJAXPost("token.controller.php", { email: email, token: newToken });
    }

    return newToken;
}

const createNewTokenFromOldToken = async (token, applyToDatabase = true) => {
    const response = await AJAXGet("user.controller.php", { token: token });
    if (response.ok) {
        const user = await response.json();
        return (await createNewToken(user.username, user.email, applyToDatabase));
    }
    return null;
}

const buttonLoadingOn = (button) => {
    if (!button) {return;}
    const buttonText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner-border');

    if (buttonText && spinner)  {
        button.disabled = true;
        buttonText.classList.add('d-none');
        spinner.classList.remove('d-none');
    }
}

const buttonLoadingOff = (button, removeDisabled = true) => {
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

const convertStringToElement = (htmlString) => {
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(htmlString, 'text/html');
    return parsedDocument.body.firstChild;
}

const alertModify = (alertElement, message, red = true) => {
    alertElement.classList.remove('d-none');
    alertElement.textContent = message;
    if (!red) {
        alertElement.classList.remove('alert-danger');
        alertElement.classList.add('alert-success');
    }
}

const pixelToPercentage = (px, parentSize) => {
    return px * 100 / parentSize;
}

const percentageToPixel = (percentage, parentSize) => {
    return percentage * parentSize / 100;
}

const setSessionVariable = async (variableName) => {
    const variables = [variableName];
    const values = ['true'];
    await AJAXPost("session-var.controller.php", { variables: JSON.stringify(variables), values: JSON.stringify(values), sessionId: getSessionId() });
}

const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    let browserName = "";
    let browserVersion = "";

    if (/Firefox\/([0-9.]+)/i.test(userAgent)) {
        browserName = "Firefox";
        browserVersion = userAgent.match(/Firefox\/([0-9.]+)/i)[1];
    }
    else if (/Chrome\/([0-9.]+)/i.test(userAgent)) {
        browserName = "Chrome";
        browserVersion = userAgent.match(/Chrome\/([0-9.]+)/i)[1];
    }

    return { name: browserName, version: browserVersion };
}

const getSessionId = () => {
    const browserInfo = getBrowserInfo();
    if ((browserInfo.name === 'Chrome' && parseInt(browserInfo.version) >= 51) || (browserInfo.name === 'Firefox' && parseInt(browserInfo.version) >= 60)) {
        return null;
    }
    if (getCookie('PHPSESSID')){
        return getCookie('PHPSESSID');
    }

    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = '';
      
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
}

//#endregion

//#region SETTINGS.JS
let emailSent = false;

const setSettings = async () => {
    const session = await (await AJAXGet("current-session.php", { sessionId: getSessionId() })).json();
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
        if (!emailSent && verificationInput.value !== '') {
            saveButton.disabled = true;
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

        if (Object.keys(jsonData).length === 0) {
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
//#endregion

//#region POSTS.JS
let lastPostId = null;

const loadPosts = async (container, userId, reset = false) => {
    const isDialogSupported = typeof HTMLDialogElement !== 'undefined';

    let posts;
    if (reset) {
        lastPostId = null;
    }
    if (lastPostId != null) {
        if (userId) {
            posts = ObjectValues(await (await AJAXGet("post.controller.php", { lastPostId: lastPostId, userId: userId })).json());
        }
        else {
            posts = ObjectValues(await (await AJAXGet("post.controller.php", { lastPostId: lastPostId })).json());
        }
    }
    else {
        if (userId) {
            posts = ObjectValues(await (await AJAXGet("post.controller.php", { userId: userId })).json());
        }
        else {
            posts = ObjectValues(await (await AJAXGet("post.controller.php")).json());
        }
    }

    if (posts.length <= 0) {return;}
    lastPostId = posts[posts.length - 1].id;
    const postElement = convertStringToElement(await (await AJAXGetHTML(`mains/post.html`)).text());
    const session = await (await AJAXGet("current-session.php", { sessionId: getSessionId() })).json();
    
    for (const post of posts) {
        const newElement = postElement.cloneNode(true);

        const usernameElement = newElement.querySelector('#post-username');
        const imageElement = newElement.querySelector('#post-image');
        const likeCountElement = newElement.querySelector('#like-count');
        const dateElement = newElement.querySelector('#post-date');
        const likeButton = newElement.querySelector('#like-post');
        const commentContainer = newElement.querySelector('#comment-container');
        const commentForm = newElement.querySelector('#comment-form');
        const deleteButton = newElement.querySelector('#erase-post');
        const deleteDialog = newElement.querySelector("#erase-dialog");

        if (!isDialogSupported) {
            deleteDialog.remove();
        }

        newElement.setAttribute('post-id', post.id.toString());
        usernameElement.textContent = post.username;
        const handleClick = () => {
            window.location.replace(`/?user=${post.user_id}`);
        };
        usernameElement.onclick = handleClick;
        usernameElement.setAttribute('post-id', post.id.toString());
        imageElement.src = post.image;
        likeCountElement.textContent = post.like_count;
        likeCountElement.setAttribute('post-id', post.id.toString());
        dateElement.textContent = determineDate(post.created_at);
        likeButton.setAttribute('post-id', post.id.toString());
        commentContainer.setAttribute('post-id', post.id.toString());
        commentForm.setAttribute('post-id', post.id.toString());

        const likeResponse = await AJAXGet("like.controller.php", { userId: session['user-id'], postId: post.id.toString() });
        if (likeResponse.ok && (await likeResponse.text()) !== '0') {
            const icon = likeButton.querySelector('i');
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            icon.style.color = '#dc3545';
        }

        await loadComments(post.id, commentContainer);
        
        const divider = newElement.querySelector('#divider');
        const likedText = newElement.querySelector('#liked-count-text');
        if (commentContainer.children.length === 0) {
            divider.classList.add('d-none');
            likedText.classList.remove('mb-2');
        }
        else {
            divider.classList.remove('d-none');
            likedText.classList.add('mb-2');
        }

        if (post.user_id == session['user-id']) {
            deleteButton.classList.remove('d-none');
        }

        const deletePost = async () => {
            const postResponse = await AJAXDelete("post.controller.php", { postId: post.id });
            if (postResponse.ok) {
                newElement.remove();
            }
        }
        deleteButton.addEventListener('click', () => {
            if (isDialogSupported) {
                deleteDialog.showModal();
                const realDelete = deleteDialog.querySelector('#delete');
                const cancel = deleteDialog.querySelector('#cancel');
                realDelete.addEventListener('click', async () => {
                    deletePost();
                    deleteDialog.close();
                });
                cancel.addEventListener('click', () => {
                    deleteDialog.close();
                });
            }
            else {
                deletePost();
            }
        })

        container.appendChild(newElement);
    }
}

const loadComments = async (postId, container = document.querySelector(`[post-id="${postId}"]#comment-container`)) => {
    let firstElement;
    if (container.children.length > 0) {
        firstElement = container.firstChild;
    }
    else {
        firstElement = null;
    }
    const viewMoreCommentsElement = container.querySelector('#view-more-comments');
    if (viewMoreCommentsElement) {
        container.removeChild(viewMoreCommentsElement);
    }
    
    let lastCommentId = null;
    if (firstElement != null) {
        lastCommentId = parseInt(firstElement.getAttribute('comment-id'));
    }

    let comments;
    if (lastCommentId != null) {
        comments = ObjectValues(await (await AJAXGet("comment.controller.php", { postId: postId, lastCommentId: lastCommentId })).json());
    }
    else {
        comments = ObjectValues(await (await AJAXGet("comment.controller.php", { postId: postId })).json());
    }

    const commentElement = convertStringToElement(await (await AJAXGetHTML(`mains/comment.html`)).text());

    for (const comment of comments) {
        const newElement = commentElement.cloneNode(true);
        const containerFirstElement = container.firstChild;

        const usernameElement = newElement.querySelector('#comment-username');
        const contentElement = newElement.querySelector('#comment-content');

        newElement.setAttribute('comment-id', comment.id.toString());
        usernameElement.textContent = `${comment.username}:`;
        contentElement.textContent = comment.comment;

        container.insertBefore(newElement, containerFirstElement);
    }

    const allCommentCount = parseInt(await (await AJAXGet("comment-count.controller.php", { postId: postId })).text());

    if (allCommentCount > container.children.length) {
        const viewMoreCommentsHTML = convertStringToElement(await (await AJAXGetHTML(`mains/view-more-comments.html`)).text());
        const button = viewMoreCommentsHTML.querySelector('#more-comments-button');

        button.setAttribute('post-id', postId.toString());
        container.appendChild(viewMoreCommentsHTML);
    }
}

const determineDate = (dateString) => {
    const date = new Date(dateString);
    const cDate = new Date();
    let currentDateString = cDate.toISOString();
    currentDateString = currentDateString.replace('T', ' ');
    currentDateString = currentDateString.slice(0, -5);
    const currentDate = new Date(currentDateString);
    const timeDifference = currentDate - date;

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
    const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);

    if (days > 0) {
        return days === 1 ? `${days} DAY AGO` : `${days} DAYS AGO`;
    }
    else if (hours > 0) {
        return hours === 1 ? `${hours} HOUR AGO` : `${hours} HOURS AGO`;
    }
    else if (minutes > 0) {
        return minutes === 1 ? `${minutes} MINUTE AGO` : `${minutes} MINUTES AGO`;
    }
    else {
        return `RIGHT NOW`;
    }
}
//#endregion

//#region CREATEPOST.JS
let mediaStream = null;

const stopWebcam = (videoElement, noWebcamElement, imageElement, liveStickerContainer) => {
    if (mediaStream !== null) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    if (videoElement !== undefined) {
        videoElement.classList.add('d-none');
        noWebcamElement.classList.add('d-none');
        imageElement.classList.remove('d-none');
        liveStickerContainer.classList.remove('d-none');
    }
}

const setCreatePost = async () => {
    const videoElement = document.getElementById('webcam');
    const noWebcamElement = document.getElementById('no-webcam');
    const imageElement = document.getElementById('image');
    const imageInput = document.getElementById('image-input');
    const captureButton = document.getElementById('capture-button');
    const uploadButton = document.getElementById('upload-button');
    const postButton = document.getElementById('post-button');
    const cancelButton = document.getElementById('cancel-button');
    const saveButton = document.getElementById('save-button');
    const middleCol = document.getElementById('middle-col');
    const stickerContainerAbove = document.getElementById('sticker-container-above');
    const stickerContainerVertical = document.getElementById('sticker-container');
    const stickerContainerHorizontal = document.getElementById('sticker-container-horizontal');
    let stickerContainer = window.innerWidth < 576 ? stickerContainerHorizontal : stickerContainerVertical;
    const previewContainerVertical = document.getElementById('preview-container');
    const previewContainerHorizontal = document.getElementById('preview-container-horizontal');
    let previewContainer = window.innerWidth < 576 ? previewContainerHorizontal : previewContainerVertical;
    previewContainer.classList.remove('d-none');
    const mainContainer = document.getElementById('main-container');
    const stickerElements = document.getElementsByClassName('sticker');
    const liveStickerContainer = document.getElementById('live-sticker-container');
    let LSCwidth;
    let LSCheight;
    let captureMode = true;

    if (stickerContainer === stickerContainerHorizontal) {
        stickerContainerAbove.style.height = "15vh";
        stickerContainerAbove.classList.add('justify-content-center');
    }

    const startWebcam = async () => { // USE WITH AWAIT
        imageElement.classList.add('d-none');
        liveStickerContainer.classList.add('d-none');
        try {
            const constraints = { video: true };
            mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = mediaStream;
            videoElement.classList.remove('d-none');
            noWebcamElement.classList.add('d-none');
            captureButton.disabled = false;
        }
        catch (error) {
            videoElement.classList.add('d-none');
            noWebcamElement.classList.remove('d-none');
            captureButton.disabled = true;
        }
    }
    await startWebcam();

    const changeMode = async () => { // USE WITH AWAIT
        captureMode = !captureMode;
        if (captureMode) {
            const liveStickers = mainContainer.querySelectorAll(".live-sticker");
            for (const liveSticker of liveStickers) {
                liveSticker.remove();
            }
            await startWebcam();
            captureButton.classList.remove('d-none');
            uploadButton.classList.remove('d-none');
            postButton.classList.add('d-none');
            middleCol.classList.add('d-none');
            saveButton.classList.add('d-none');
            previewContainer.classList.remove('d-none');
            stickerContainer.classList.add('d-none');
            postButton.disabled = true;
        }
        else {
            stopWebcam(videoElement, noWebcamElement, imageElement, liveStickerContainer);
            captureButton.classList.add('d-none');
            uploadButton.classList.add('d-none');
            postButton.classList.remove('d-none');
            middleCol.classList.remove('d-none');
            saveButton.classList.remove('d-none');
            previewContainer.classList.add('d-none');
            stickerContainer.classList.remove('d-none');
            saveButton.disabled = false;
            cancelButton.disabled = false;
        }
    }

    const createPreview = (imageUrl) => {
        const rowElement = document.createElement('div');
        rowElement.classList.add('row');
        const colElement = document.createElement('div');
        colElement.classList.add('col');
        colElement.classList.add('mx-2');
        colElement.classList.add('my-3');
        const imageElement = document.createElement('img');
        imageElement.src = imageUrl;
        imageElement.classList.add('preview-image');

        previewContainerVertical.appendChild(rowElement);
        rowElement.appendChild(colElement);
        colElement.appendChild(imageElement);

        const horizontalRowElement = previewContainerHorizontal.querySelector('.row');
        const horizontalColElement = document.createElement('div');
        horizontalColElement.classList.add('col-4');
        const horizontalImageElement = document.createElement('img');
        horizontalImageElement.src = imageUrl;
        horizontalImageElement.classList.add('preview-image');
        horizontalImageElement.style.maxHeight = "12vh";

        horizontalRowElement.appendChild(horizontalColElement);
        horizontalColElement.appendChild(horizontalImageElement);

    }

    const setLiveStickerContainer = (wait = true) => {
        const func = () => {
            const imageHeight = imageElement.offsetHeight;
            const imageWidth = (imageElement.offsetHeight * imageElement.naturalWidth) / imageElement.naturalHeight;
            liveStickerContainer.style.left = `${(mainContainer.offsetWidth - imageWidth) / 2}px`;
            liveStickerContainer.style.top = `${(mainContainer.offsetHeight - imageHeight) / 2}px`;
            liveStickerContainer.style.width = `${imageWidth}px`;
            liveStickerContainer.style.height = `${imageHeight}px`;
            LSCwidth = imageWidth;
            LSCheight = imageHeight;
        }

        if (wait) {
            setTimeout(() => {
                func();
            }, 1);
        }
        else {
            func();
        }
    }

    captureButton.addEventListener('click', async () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        imageElement.src = canvas.toDataURL();
        setLiveStickerContainer();
        canvas.remove();
        createPreview(imageElement.src);
        await changeMode();
    });

    uploadButton.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', async () => {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            imageElement.src = event.target.result;
            setLiveStickerContainer();
            createPreview(imageElement.src);
        }
        reader.readAsDataURL(file);
        imageInput.value = '';
        await changeMode();
    });

    cancelButton.addEventListener('click', async () => {
        postButton.disabled = true;
        saveButton.disabled = true;
        cancelButton.disabled = true;
        await changeMode();
    });

    saveButton.addEventListener('click', async () => {
        const stickerInformation = [];
        const liveStickers = mainContainer.querySelectorAll('.live-sticker');
        const rectContainer = liveStickerContainer.getBoundingClientRect();

        for (const liveSticker of liveStickers) {
            const rect = liveSticker.getBoundingClientRect();
            const stickerLeftPixel = Math.floor(rect.left - rectContainer.left);
            const stickerTopPixel = Math.floor(rect.top - rectContainer.top);
            const stickerWidthPixel = Math.floor(rect.width);
            const stickerHeightPixel = Math.floor(rect.height);

            stickerInformation.push({ image: extractString(elementToBase64(liveSticker)), x: stickerLeftPixel, y: stickerTopPixel, width: stickerWidthPixel, height: stickerHeightPixel });
        }

        const imageResponse = await AJAXPost("image-download.controller.php", { baseImage: extractString(imageElement.src), height: imageElement.offsetHeight, stickerArray: JSON.stringify(stickerInformation) });
        if (imageResponse.ok) {
            const blob = await imageResponse.blob();
            const imageUrl = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = imageUrl;
            anchor.download = "camagru.png";
            anchor.click();
            anchor.remove();
        }
    });

    document.addEventListener('click', async (event) => {
        // Preview Images Click Event
        if (event.target.classList.contains('preview-image')) {
            imageElement.src = event.target.src;
            setLiveStickerContainer();
            await changeMode();
        }
    });

    // Sticker Element Click Event
    for (const stickerElement of stickerElements) {
        stickerElement.addEventListener('click', (event) => {
            const newSticker = document.createElement('img');
            newSticker.src = event.target.src;
            newSticker.classList.add('live-sticker');
            newSticker.draggable = false;
            newSticker.style.left = `0px`;
            newSticker.style.top = `0px`;
            newSticker.style.width = `20%`;
            newSticker.style.height = 'auto';
            setTimeout(() => {
                newSticker.style.height = heightToPercentage(newSticker.style.height, newSticker.style.width, newSticker.naturalWidth / newSticker.naturalHeight, LSCheight, LSCwidth);
            }, 1);
            liveStickerContainer.appendChild(newSticker);
            postButton.disabled = false;
        });
    }

    // Live Stickers
    let currentLiveSticker = null;
    let resizeDirection = null;
    let prevX = 0;
    let prevY = 0;

    const changeToPixel = (value, parentSize) => {
        if (value[value.length - 1] === '%') {
            value = `${percentageToPixel(parseInt(value), parentSize)}px`;
        }
        return value;
    }

    const changeToPercentage = (value, parentSize) => {
        if (value[value.length - 1] === 'x' && value[value.length - 2] === 'p') {
            value = `${pixelToPercentage(parseInt(value), parentSize)}%`;
        }
        return value;
    }

    const heightToPixel = (height, width, aspectRatio, parentHeight, parentWidth) => {
        if (height === 'auto') {
            const widthPixel = parseInt(changeToPixel(width, parentWidth));
            height = `${widthPixel / aspectRatio}px`;
            return height;
        }
        else {
            return changeToPixel(height, parentHeight);
        }
    }

    const heightToPercentage = (height, width, aspectRatio, parentHeight, parentWidth) => {
        height = heightToPixel(height, width, aspectRatio, parentHeight, parentWidth);
        return changeToPercentage(height, parentHeight);
    }

    const handleMouseDown = (event) => {
        if (event.target.classList.contains('live-sticker')) {
            event.preventDefault();
            currentLiveSticker = event.target;
            if (event.type === 'mousedown') {
                prevX = event.clientX;
                prevY = event.clientY;
            }
            else if (event.type === 'touchstart') {
                const touch = event.touches[0];
                prevX = Math.floor(touch.clientX);
                prevY = Math.floor(touch.clientY);
            }
        
            if (event.type === 'mousedown') {
                if (event.target.style.cursor === 'auto') {
                    resizeDirection = null;
                }
                else if (event.target.style.cursor === 'n-resize') {
                    resizeDirection = 'top';
                }
                else if (event.target.style.cursor === 's-resize') {
                    resizeDirection = 'bottom';
                }
                else if (event.target.style.cursor === 'w-resize') {
                    resizeDirection = 'left';
                }
                else if (event.target.style.cursor === 'e-resize') {
                    resizeDirection = 'right';
                }
            }
            else if (event.type === 'touchstart') {
                const touch = event.touches[0];
                const { left, top, right, bottom } = event.target.getBoundingClientRect();
                const borderRatio = 20/100;
                let borderWidth = Math.floor(parseInt(changeToPixel(event.target.style.width, LSCwidth)) * borderRatio);
                let borderHeight = Math.floor(parseInt(changeToPixel(event.target.style.height, LSCheight)) * borderRatio);
                if (borderHeight < 2) {borderHeight = 2;}
                if (borderWidth < 2) {borderWidth = 2;}

                if (Math.floor(touch.clientY) >= top && Math.floor(touch.clientY) <= top + borderHeight) {
                    resizeDirection = 'top';
                }
                else if (Math.floor(touch.clientY) >= bottom - borderHeight && Math.floor(touch.clientY) <= bottom) {
                    resizeDirection = 'bottom';
                }
                else if (Math.floor(touch.clientX) >= left && Math.floor(touch.clientX) <= left + borderWidth) {
                    resizeDirection = 'left';
                }
                else if (Math.floor(touch.clientX) >= right - borderWidth && Math.floor(touch.clientX) <= right) {
                    resizeDirection = 'right';
                }
                else {
                    resizeDirection = null;
                }
            }
        }
    }
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('touchstart', handleMouseDown, { passive: false })

    const handleMouseUp = () => {
        if (currentLiveSticker) {
            const liveStickers = mainContainer.querySelectorAll('.live-sticker');
            const destroyRatio = 2 / 3;
            if (parseInt(currentLiveSticker.style.left) < 0) {
                if (parseInt(currentLiveSticker.style.left) > 0 - currentLiveSticker.width * destroyRatio) {
                    currentLiveSticker.style.left = `0px`;
                }
                else {
                    if (liveStickers.length === 1) {
                        postButton.disabled = true;
                    }
                    currentLiveSticker.remove();
                }
            }
            else if (parseInt(currentLiveSticker.style.left) > LSCwidth - currentLiveSticker.width) {
                if (parseInt(currentLiveSticker.style.left) < LSCwidth - currentLiveSticker.width + currentLiveSticker.width * destroyRatio) {
                    currentLiveSticker.style.left = `${LSCwidth - currentLiveSticker.width}px`;
                }
                else {
                    if (liveStickers.length === 1) {
                        postButton.disabled = true;
                    }
                    currentLiveSticker.remove();
                }
            }
            if (parseInt(currentLiveSticker.style.top) < 0) {
                if (parseInt(currentLiveSticker.style.top) > 0 - currentLiveSticker.height * destroyRatio) {
                    currentLiveSticker.style.top = `0px`;
                }
                else {
                    if (liveStickers.length === 1) {
                        postButton.disabled = true;
                    }
                    currentLiveSticker.remove();
                }
            }
            else if (parseInt(currentLiveSticker.style.top) > LSCheight - currentLiveSticker.height) {
                if (parseInt(currentLiveSticker.style.top) < LSCheight - currentLiveSticker.height + currentLiveSticker.height * destroyRatio) {
                    currentLiveSticker.style.top = `${LSCheight - currentLiveSticker.height}px`;
                }
                else {
                    if (liveStickers.length === 1) {
                        postButton.disabled = true;
                    }
                    currentLiveSticker.remove();
                }
            }
            currentLiveSticker = null;
            resizeDirection = null;
        }
    }
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);

    const handleMouseMove = (event) => {
        if (!captureMode) {
            if (currentLiveSticker) {
                event.preventDefault();
                const minumumWidth = 4; // Percentage (also Height)
                let newX;
                let newY;
                if (event.type === 'mousemove') {
                    newX = prevX - event.clientX;
                    newY = prevY - event.clientY;
                }
                else if (event.type === 'touchmove') {
                    const touch = event.touches[0];
                    newX = prevX - Math.floor(touch.clientX);
                    newY = prevY - Math.floor(touch.clientY);
                    console.log(touch.clientX);
                    console.log(prevX);
                    console.log(prevX - Math.floor(touch.clientX))
                }

                // Moving the sticker
                if (!resizeDirection) {
                    currentLiveSticker.style.left = `${parseInt(changeToPixel(currentLiveSticker.style.left, LSCwidth)) - newX}px`;
                    currentLiveSticker.style.top = `${parseInt(changeToPixel(currentLiveSticker.style.top, LSCheight)) - newY}px`;
                }

                // Resizing the sticker
                else if (resizeDirection === 'right') {
                    const oldWidth = currentLiveSticker.style.width;
                    currentLiveSticker.style.width = `${parseInt(changeToPixel(currentLiveSticker.style.width, LSCwidth)) - newX}px`;
                    if (parseInt(changeToPixel(currentLiveSticker.style.left)) > LSCwidth - parseInt(currentLiveSticker.width)) {
                        currentLiveSticker.style.width = oldWidth;
                    }
                    if (parseInt(changeToPercentage(currentLiveSticker.style.width, LSCwidth)) < minumumWidth) {
                        currentLiveSticker.style.width = oldWidth;
                    }
                }
                else if (resizeDirection === 'left') {
                    const oldWidth = currentLiveSticker.style.width;
                    const oldLeft = currentLiveSticker.style.left;
                    currentLiveSticker.style.width = `${parseInt(changeToPixel(currentLiveSticker.style.width, LSCwidth)) + newX}px`;
                    currentLiveSticker.style.left = `${parseInt(changeToPixel(currentLiveSticker.style.left, LSCwidth)) - newX}px`;
                    if (parseInt(changeToPixel(currentLiveSticker.style.left)) < 0) {
                        currentLiveSticker.style.width = oldWidth;
                        currentLiveSticker.style.left = oldLeft;
                    }
                    if (parseInt(changeToPercentage(currentLiveSticker.style.width, LSCwidth)) < minumumWidth) {
                        currentLiveSticker.style.width = oldWidth;
                        currentLiveSticker.style.left = oldLeft;
                    }
                }
                else if (resizeDirection === 'bottom') {
                    const oldHeight = currentLiveSticker.style.height;
                    currentLiveSticker.style.height = `${parseInt(changeToPixel(currentLiveSticker.style.height, LSCheight)) - newY}px`;
                    if (parseInt(changeToPixel(currentLiveSticker.style.top)) > LSCheight - parseInt(currentLiveSticker.height)) {
                        currentLiveSticker.style.height = oldHeight;
                    }
                    if (parseInt(changeToPercentage(currentLiveSticker.style.height, LSCheight)) < minumumWidth) {
                        currentLiveSticker.style.height = oldHeight;
                    }
                }
                else if (resizeDirection === 'top') {
                    const oldHeight = currentLiveSticker.style.height;
                    const oldTop = currentLiveSticker.style.top;
                    currentLiveSticker.style.height = `${parseInt(changeToPixel(currentLiveSticker.style.height, LSCheight)) + newY}px`;
                    currentLiveSticker.style.top = `${parseInt(changeToPixel(currentLiveSticker.style.top, LSCwidth)) - newY}px`;
                    if (parseInt(changeToPixel(currentLiveSticker.style.top)) < 0) {
                        currentLiveSticker.style.height = oldHeight;
                        currentLiveSticker.style.top = oldTop;
                    }
                    if (parseInt(changeToPercentage(currentLiveSticker.style.height, LSCheight)) < minumumWidth) {
                        currentLiveSticker.style.height = oldHeight;
                        currentLiveSticker.style.top = oldTop;
                    }
                }
                if (event.type === 'mousemove') {
                    prevX = event.clientX;
                    prevY = event.clientY;
                }
                else if (event.type === 'touchmove') {
                    const touch = event.touches[0];
                    prevX = Math.floor(touch.clientX);
                    prevY = Math.floor(touch.clientY);
                }
            }

            // Cursor Changes
            if (event.target.classList.contains('live-sticker')) {
                if (!resizeDirection) {
                    const { left, top, right, bottom } = event.target.getBoundingClientRect();
                    const borderRatio = 10/100;
                    let borderWidth = Math.floor(parseInt(changeToPixel(event.target.style.width, LSCwidth)) * borderRatio);
                    let borderHeight = Math.floor(parseInt(changeToPixel(event.target.style.height, LSCheight)) * borderRatio);
                    if (borderHeight < 2) {borderHeight = 2;}
                    if (borderWidth < 2) {borderWidth = 2;}

                    if (event.clientY >= top && event.clientY <= top + borderHeight) {
                        event.target.style.cursor = 'n-resize';
                    }
                    else if (event.clientY >= bottom - borderHeight && event.clientY <= bottom) {
                        event.target.style.cursor = 's-resize';
                    }
                    else if (event.clientX >= left && event.clientX <= left + borderWidth) {
                        event.target.style.cursor = 'w-resize';
                    }
                    else if (event.clientX >= right - borderWidth && event.clientX <= right) {
                        event.target.style.cursor = 'e-resize';
                    }
                    else {
                        event.target.style.cursor = 'auto';
                    }
                }
            }
        }
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });

    window.addEventListener('resize', () => {
        const liveStickers = mainContainer.querySelectorAll('.live-sticker');
        for (const liveSticker of liveStickers) {
            liveSticker.style.left = changeToPercentage(liveSticker.style.left, LSCwidth);
            liveSticker.style.top = changeToPercentage(liveSticker.style.top, LSCheight);
            liveSticker.style.width = changeToPercentage(liveSticker.style.width, LSCwidth);
            liveSticker.style.height = changeToPercentage(liveSticker.style.height, LSCheight);
        }
        setLiveStickerContainer(false);

        const oldStickerContainer = stickerContainer;
        stickerContainer = window.innerWidth < 576 ? stickerContainerHorizontal : stickerContainerVertical;
        if (stickerContainer !== oldStickerContainer && !oldStickerContainer.classList.contains('d-none')) {
            oldStickerContainer.classList.add('d-none');
            stickerContainer.classList.remove('d-none');
        }

        const oldPreviewContainer = previewContainer;
        previewContainer = window.innerWidth < 576 ? previewContainerHorizontal : previewContainerVertical;
        if (previewContainer !== oldPreviewContainer && !oldPreviewContainer.classList.contains('d-none')) {
            oldPreviewContainer.classList.add('d-none');
            previewContainer.classList.remove('d-none');
        }

        if (stickerContainer === stickerContainerHorizontal) {
            stickerContainerAbove.style.height = "15vh";
            stickerContainerAbove.classList.add('justify-content-center');
        }
        else {
            stickerContainerAbove.style.height = "70vh";
            stickerContainerAbove.classList.remove('justify-content-center');
        }
    });

    // Sticker to Base64
    const elementToBase64 = (imgElement) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;

        ctx.drawImage(imgElement, 0, 0);
        const base64String = canvas.toDataURL();
        canvas.remove();
        return base64String;
    }
    const extractString = (base64String) => {
        const parts = base64String.split(',');
        if (parts.length === 2) {
            return parts[1];
        }
        else {
            return base64String;
        }
    }
    // Post button
    postButton.addEventListener('click', async () => {
        const stickerInformation = [];
        const liveStickers = mainContainer.querySelectorAll('.live-sticker');
        const rectContainer = liveStickerContainer.getBoundingClientRect();

        for (const liveSticker of liveStickers) {
            const rect = liveSticker.getBoundingClientRect();
            const stickerLeftPixel = Math.floor(rect.left - rectContainer.left);
            const stickerTopPixel = Math.floor(rect.top - rectContainer.top);
            const stickerWidthPixel = Math.floor(rect.width);
            const stickerHeightPixel = Math.floor(rect.height);

            stickerInformation.push({ image: extractString(elementToBase64(liveSticker)), x: stickerLeftPixel, y: stickerTopPixel, width: stickerWidthPixel, height: stickerHeightPixel });
        }

        const session = await (await AJAXGet("current-session.php", { sessionId: getSessionId() })).json();
        const imageResponse = await AJAXPost("image.controller.php", { userId: session['user-id'], baseImage: extractString(imageElement.src), height: imageElement.offsetHeight, stickerArray: JSON.stringify(stickerInformation) });
        if (imageResponse.ok) {
            const imageFileName = await imageResponse.text();
            console.log(imageFileName);
            const postResponse = await AJAXPost("post.controller.php", { userId: session['user-id'], imageFileName: `/public/uploads/${imageFileName}` });
            if (postResponse.ok) {
                await setSessionVariable('post-successful');
                window.location.replace("/post-successful");
            }
            else {
                console.log(await postResponse.text());
            }
        }
    });
}
//#endregion

//#region LISTEN.JS
// Event Listener For Buttons
document.addEventListener('click', async (e) => {
    if (!e.target.matches("button")) {
        return;
    }

    if (e.target.id === "like-post") {
        const postId = e.target.getAttribute('post-id');
        const icon = e.target.querySelector('i');
        const likeCountElement = document.querySelector(`[post-id="${postId}"]#like-count`);
        const session = await (await AJAXGet("current-session.php", { sessionId: getSessionId() })).json();

        if (icon.classList.contains('fa-regular')) { // Like
            const likeResponse = await AJAXPost("like.controller.php", { userId: session['user-id'], postId: postId });
            if (likeResponse.ok) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                icon.style.color = '#dc3545';
                likeCountElement.textContent = (parseInt(likeCountElement.textContent) + 1).toString();
            }
        }
        else { // Remove Like
            const likeResponse = await AJAXDelete("like.controller.php", { userId: session['user-id'], postId: postId });
            if (likeResponse.ok) {
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                icon.style.color = '#ffffff';
                likeCountElement.textContent = (parseInt(likeCountElement.textContent) - 1).toString();
            }
        }
    }
    else if (e.target.id === "more-comments-button") {
        e.target.disabled = true;
        const postId = e.target.getAttribute('post-id');
        await loadComments(postId);
    }
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

        const signupResponse = await AJAXPost("signup.controller.php", formData);
        if (signupResponse.ok) {
            const user = await signupResponse.json();
            const mailSubject = "Camagru - Email Verification";
            const mailContent = `Hi ${user.username},\n\nWelcome to Camagru!\n\nPlease click the link below to verify your account.\n\nhttp://localhost/verify?token=${user.verification_token}\n\nThanks,\n- Camagru`;
            const mailResponse = await AJAXPost("send-mail.controller.php", { email: formData.get('email'), subject: mailSubject, content: mailContent });
            if (mailResponse.ok) {
                await setSessionVariable('verification-sent');
                window.location.replace("/verification-sent");
            }
            else {
                await AJAXDelete("user.controller.php", { email: formData.get('email') });
                errorMessage = await mailResponse.text();
                alertElement.textContent = errorMessage;
                alertElement.classList.remove('d-none');
                buttonLoadingOff(submitButton);
            }
        }
        else {
            errorMessage = await signupResponse.text();
            alertElement.textContent = errorMessage;
            alertElement.classList.remove('d-none');
            buttonLoadingOff(submitButton);
        }
    }
    else if (e.target.id === "login-form") {
        formData.append('sessionId', getSessionId());
        const loginResponse = await AJAXPost("login.controller.php", formData)
        if (loginResponse.ok) {
            window.location.replace("/");
        }
        else {
            const errorMessage = await loginResponse.text();
            const alertElement = document.getElementById('alert');
            alertElement.textContent = errorMessage;
            alertElement.classList.remove('d-none');
            buttonLoadingOff(submitButton);
        }
    }
    else if (e.target.id === "password-change-form-1") {
        const userResponse = await AJAXGet("user.controller.php", { email: formData.get('email') });
        if (userResponse.ok) {
            const user = await userResponse.json();
            if (!user.is_verified) {
                const alertElement = document.getElementById('alert');
                alertElement.textContent = "You need to verify your account to change your password.";
                alertElement.classList.remove('d-none');
                buttonLoadingOff(submitButton);
                return;
            }

            const mailSubject = "Camagru - Password Change";
            const mailContent = `Hi ${user.username},\n\nPlease click the link below to change your password.\n\nhttp://localhost/password-change?token=${user.verification_token}\n\nThanks,\n- Camagru`;
            const mailResponse = await AJAXPost("send-mail.controller.php", { email: formData.get('email'), subject: mailSubject, content: mailContent });
            if (mailResponse.ok) {
                const alertElement = document.getElementById('alert');
                alertElement.classList.remove('d-none', 'alert-danger');
                alertElement.classList.add('alert-success');
                alertElement.textContent = "Email has been sent successfully.";
                buttonLoadingOff(submitButton, false);
            }
            else {
                const errorMessage = await mailResponse.text();
                const alertElement = document.getElementById('alert');
                alertElement.textContent = errorMessage;
                alertElement.classList.remove('d-none');
                buttonLoadingOff(submitButton);
            }
        }
        else {
            const errorMessage = await userResponse.text();
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
        const urlParams = customURLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userResponse = await AJAXGet("user.controller.php", { token: token });
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
        const passwordResponse = await AJAXPost("password.controller.php", { password: formData.get('password'), token: token });
        if (passwordResponse.ok) {
            const alertElement = document.getElementById('alert');
            alertElement.classList.remove('d-none', 'alert-danger');
            alertElement.classList.add('alert-success');
            alertElement.textContent = "Your password has been changed successfully.";
            await createNewTokenFromOldToken(token);
            buttonLoadingOff(submitButton, false);
        }
        else {
            errorMessage = await passwordResponse.text();
            alertElement.textContent = errorMessage;
            alertElement.classList.remove('d-none');
            buttonLoadingOff(submitButton);
        }
    }
    else if (e.target.id === "comment-form") {
        const commentInput = e.target.querySelector('#input-comment');
        if (commentInput.value === '') {return;}
        const session = await (await AJAXGet("current-session.php", { sessionId: getSessionId() })).json();
        const postId = e.target.getAttribute('post-id');
        const comment = formData.get('comment');
        e.target.reset();

        const commentResponse = await AJAXPost("comment.controller.php", { userId: session['user-id'], postId: postId, comment: comment });
        if (commentResponse.ok) {
            const commentId = await commentResponse.text();
            const username = (await (await AJAXGet("user.controller.php", { id: session['user-id'] })).json()).username;
            const commentContainer = document.querySelector(`[post-id="${postId}"]#comment-container`);
            const lastElement = commentContainer.lastElementChild;

            const newElement = convertStringToElement(await (await AJAXGetHTML(`mains/comment.html`)).text());
            const usernameElement = newElement.querySelector('#comment-username');
            const contentElement = newElement.querySelector('#comment-content');

            newElement.setAttribute('comment-id', commentId);
            usernameElement.textContent = `${username}:`;
            contentElement.textContent = comment;
    
            if (lastElement === null || lastElement.id != "view-more-comments") {
                commentContainer.appendChild(newElement);
            }  
            else {
                commentContainer.insertBefore(newElement, lastElement);
            }

            const postContainer = document.querySelector(`[post-id="${postId}"]#post-container`);
            const divider = postContainer.querySelector('#divider');
            const likedText = postContainer.querySelector('#liked-count-text');
            divider.classList.remove('d-none');
            likedText.classList.add('mb-2');

            const postUsername = (document.querySelector(`[post-id="${postId}"]#post-username`)).textContent;
            if (postUsername !== username) {
                const postMail = (await (await AJAXGet("user.controller.php", { username: postUsername })).json()).email;
                const mailSubject = "Camagru - New Comment On Your Post";
                const mailContent = `Hi ${postUsername},\n\nOne of your posts just got a new comment from ${username}.\n--> ${username}: ${comment}\n\nThanks,\n- Camagru`;
                await AJAXPost("send-mail.controller.php", { email: postMail, subject: mailSubject, content: mailContent });
            }
        }

    }
})

// Scroll Event Listener
document.addEventListener('scroll', async () => {
    if (window.location.pathname === '/') {
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
            const container = document.getElementById('main-posts');
            await loadPosts(container);
        }
    }
});

// Event Listener For Page Loads
const afterPageLoad = async (location) => {
    // HEADER
    document.addEventListener('click', async (event) => {
        if (event.target.id === 'signout-button') {
            await AJAXDelete("session.controller.php", { sessionId: getSessionId() });
            window.location.replace("/");
        }
        else if (event.target.id === 'profile-button') {
            const session = await (await AJAXGet("current-session.php", { sessionId: getSessionId() })).json();
            window.location.replace(`/?user=${session['user-id']}`);
        }
    });

    // MAIN-SECTION SETTINGS
    if (location === '/') {
        const mainSection = document.getElementById('main-section');
        mainSection.classList.remove('flex-grow-1', 'align-items-center');
    }
    else {
        const mainSection = document.getElementById('main-section');
        mainSection.classList.add('flex-grow-1', 'align-items-center');
    }

    if (location === '/') {
        const urlParams = customURLSearchParams(window.location.search);
        const container = document.getElementById('main-posts');
        await loadPosts(container, urlParams.get('user'), true);
        const post = document.getElementById('post-container');
        if (!post) {
            const mainSection = document.getElementById('main-section');
            mainSection.classList.add('flex-grow-1', 'align-items-center');
            const looksEmptyElement = convertStringToElement(await (await AJAXGetHTML(`mains/looks-empty.html`)).text());
            container.appendChild(looksEmptyElement);
        }
        stopWebcam();
    }
    else if (location === '/verify') {
        const urlParams = customURLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const verifyResponse = await AJAXPost("verify.controller.php", { token: token });
        const header = document.getElementById('verify-header');
        const content = document.getElementById('verify-content');
        if (verifyResponse.ok) {
            header.textContent = "Verification Successful!";
            content.textContent = "You are ready to go.";
        }
        else {
            window.location.replace("/403");
        }
        await createNewTokenFromOldToken(token);
    }
    else if (location === '/password-change') {
        const urlParams = customURLSearchParams(window.location.search);
        const token = urlParams.get('token');

        const userResponse = await AJAXGet("user.controller.php", { token: token });
        if (!userResponse.ok) {
            window.location.replace("/403");
        }
    }
    else if (location === '/settings') {
        const session = await (await AJAXGet("current-session.php", { sessionId: getSessionId() })).json();
        const user = await (await AJAXGet("user.controller.php", { id: session['user-id'] })).json();

        const emailInput = document.getElementById('email');
        const usernameInput = document.getElementById('uname');
        const notifOn = document.getElementById('notification-on');
        const notifOff = document.getElementById('notification-off');
        
        emailInput.placeholder = user.email;
        usernameInput.placeholder = user.username;
        if (user.email_notification) {
            notifOn.setAttribute('checked', 'true');
        }
        else {
            notifOff.setAttribute('checked', 'true');
        }

        await setSettings();
        stopWebcam();
    }
    else if (location === '/create-post') {
        await setCreatePost();
    }
    else if (location === '/login') {
        const forgotPassword = document.getElementById('forgot-password');
        
        const handleClick = async () => {
            await setSessionVariable('password-change-send');
            window.location.replace('/password-change-send');
        }

        forgotPassword.onclick = handleClick;
    }
}
//#endregion

//#region ROUTER.JS
document.addEventListener('click', (e) => {
    if (!e.target.matches("a")) {
        return;
    }
    e.preventDefault();
    urlRoute(e);
});

const urlRoutes = {
    "/403": {
        name: "/403",
        title: "Camagru | 403",
        headerLink: "",
        mainLink: "403.html"
    },
    "/404": {
        name: "/404",
        title: "Camagru | 404",
        headerLink: "",
        mainLink: "404.html"
    },
    "/": {
        name: "/",
        title: "Camagru",
        headerLink: "home.html",
        mainLink: "home.html"
    },
    "/login": {
        name: "/login",
        title: "Camagru | Login",
        headerLink: "login.html",
        mainLink: "login.html"
    },
    "/signup": {
        name: "/signup",
        title: "Camagru | Signup",
        headerLink: "signup.html",
        mainLink: "signup.html"
    },
    "/verification-sent": {
        name: "/verification-sent",
        title: "Camagru | Verify",
        headerLink: "signup.html",
        mainLink: "verification-sent.html"
    },
    "/verify": {
        name: "/verify",
        title: "Camagru | Verify",
        headerLink: "signup.html",
        mainLink: "verify.html"
    },
    "/password-change-send": {
        name: "/password-change-send",
        title: "Camagru | Password Change",
        headerLink: "signup.html",
        mainLink: "password-change-1.html"
    },
    "/password-change": {
        name: "/password-change",
        title: "Camagru | Password Change",
        headerLink: "signup.html",
        mainLink: "password-change-2.html"
    },
    "/settings": {
        name: "/settings",
        title: "Camagru | Settings",
        headerLink: "home.html",
        mainLink: "settings.html"
    },
    "/create-post": {
        name: "/create-post",
        title: "Camagru | New Post",
        headerLink: "home.html",
        mainLink: "create-post.html"
    },
    "/post-successful": {
        name: "/post-successful",
        title: "Camagru | New Post",
        headerLink: "home.html",
        mainLink: "post-successful.html"
    },
    "/post-unsuccessful": {
        name: "/post-unsuccessful",
        title: "Camagru | New Post",
        headerLink: "home.html",
        mainLink: "post-unsuccessful.html"
    }
};

const urlRoute = (event) => {
    event.preventDefault();
    const absoluteURL = event.target.href;
    const url = new URL(absoluteURL);
    const relativePath = url.pathname.length > 0 ? url.pathname : "/";
    if (relativePath === window.location.pathname) {
        window.location.replace(window.location.pathname);
    }
    else if (relativePath === '/create-post') {
        window.location.replace('/create-post');
    }
    else {
        urlLocationHandler(relativePath);
    }
    
};

const urlLocationHandler = async (pathname) => {
    let location;
    if (typeof(pathname) != "object") { // If it hasn't come from window.onpopstate
        location = pathname || window.location.pathname;
    }
    else {
        location = window.location.pathname;
    }
    let route = urlRoutes[location] || urlRoutes["/404"];
    route = await changeRoute(route);
    location = route.name;
    if (route.headerLink !== "") {
        const headerElement = await (await AJAXGetHTML(`headers/${route.headerLink}`)).text();
        document.getElementById('header-section').innerHTML = headerElement;
    }
    if (route.mainLink !== "") {
        const mainElement = await (await AJAXGetHTML(`mains/${route.mainLink}`)).text();
        document.getElementById('main-section').innerHTML = mainElement;
    }
    afterPageLoad(location);

    if (typeof(pathname) != "object") { // If it hasn't come from window.onpopstate
        const urlParams = customURLSearchParams(window.location.search);
        if (urlParams.size > 0 && pathname === undefined) { // pathname === undefined means if it's directly applied from address bar
            const queryString = urlParams.toString();
            window.history.pushState({}, "", `${location}?${queryString}`);
        }
        else {
            window.history.pushState({}, "", location);
        }
    }
}

const changeRoute = async (route) => {
    const session = await (await AJAXGet("current-session.php", { sessionId: getSessionId() })).json();

    if (route.name === "/" || route.name === "/login") {
        route = session.hasOwnProperty('user-id') ? urlRoutes["/"] : urlRoutes["/login"];
    }
    else if (route.name === "/signup") {
        route = session.hasOwnProperty('user-id') ? urlRoutes["/"] : urlRoutes["/signup"];
    }
    else if (route.name === "/settings") {
        route = session.hasOwnProperty('user-id') ? urlRoutes["/settings"] : urlRoutes["/404"];
    }
    else if (route.name === "/create-post") {
        route = session.hasOwnProperty('user-id') ? urlRoutes["/create-post"] : urlRoutes["/404"];
    }
    else if (route.name === "/verification-sent") {
        route = session.hasOwnProperty('verification-sent') ? urlRoutes["/verification-sent"] : urlRoutes["/403"];
        if (session.hasOwnProperty('verification-sent')) {
            const deleteVariables = ['verification-sent'];
            await AJAXDelete("session-var.controller.php", { variables: JSON.stringify(deleteVariables), sessionId: getSessionId() });
        }
    }
    else if (route.name === "/post-successful") {
        route = session.hasOwnProperty('post-successful') ? urlRoutes["/post-successful"] : urlRoutes["/403"];
        if (session.hasOwnProperty('post-successful')) {
            const deleteVariables = ['post-successful'];
            await AJAXDelete("session-var.controller.php", { variables: JSON.stringify(deleteVariables), sessionId: getSessionId() });
        }
    }
    else if (route.name === "/post-unsuccessful") {
        route = session.hasOwnProperty('post-unsuccessful') ? urlRoutes["/post-unsuccessful"] : urlRoutes["/403"];
        if (session.hasOwnProperty('post-unsuccessful')) {
            const deleteVariables = ['post-unsuccessful'];
            await AJAXDelete("session-var.controller.php", { variables: JSON.stringify(deleteVariables), sessionId: getSessionId() });
        }
    }
    else if (route.name === "/password-change-send") {
        route = session.hasOwnProperty('password-change-send') ? urlRoutes["/password-change-send"] : urlRoutes["/403"];
        if (session.hasOwnProperty('password-change-send')) {
            const deleteVariables = ['password-change-send'];
            await AJAXDelete("session-var.controller.php", { variables: JSON.stringify(deleteVariables), sessionId: getSessionId() });
        }
    }

    return route;
}

window.onpopstate = urlLocationHandler;
window.route = urlRoute;

urlLocationHandler();
//#endregion