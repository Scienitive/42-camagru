import { AJAXDelete, AJAXGet, AJAXGetHTML, AJAXPost } from "./ajax.js";
import { loadComments, loadPosts } from "./posts.js";
import { buttonLoadingOff, buttonLoadingOn, createNewToken, createNewTokenFromOldToken, convertStringToElement } from "./utility.js";

// Event Listener For Buttons
document.addEventListener('click', async (e) => {
    if (!e.target.matches("button")) {
        return;
    }

    if (e.target.id === "like-post") {
        const postId = e.target.getAttribute('post-id');
        const icon = e.target.querySelector('i');
        const likeCountElement = document.querySelector(`[post-id="${postId}"]#like-count`);
        const session = await (await AJAXGet("current-session.php")).json();

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
        const urlParams = new URLSearchParams(window.location.search);
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
        const session = await (await AJAXGet("current-session.php")).json();
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
export const afterPageLoad = async (location) => {
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
        const container = document.getElementById('main-posts');
        await loadPosts(container);
    }
    else if (location === '/verify') {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const verifyResponse = await AJAXPost("verify.controller.php", { token: token });
        const header = document.getElementById('verify-header');
        const content = document.getElementById('verify-content');
        if (verifyResponse.ok) {
            header.textContent = "Verification Successful!";
            content.textContent = "You are ready to go.";
        }
        else {
            if (verifyResponse.status === 404) {
                header.textContent = "Verification Unsuccessful!";
                content.textContent = "Verification token is invalid.";
            }
            else if (verifyResponse.status === 400) {
                header.textContent = "Verification Unsuccessful!";
                content.textContent = "You are already verified.";
            }
            else {
                const errorMessage = await verifyResponse.text();
                header.textContent = "Error!";
                content.textContent = errorMessage;
            }
        }
        await createNewTokenFromOldToken(token);
    }
    else if (location === '/settings') {
        const session = await (await AJAXGet("current-session.php")).json();
        const user = await (await AJAXGet("user.controller.php", { id: session['user-id'] })).json();

        const emailInput = document.getElementById('email');
        const usernameInput = document.getElementById('uname');
        const notifOn = document.getElementById('success-outlined');
        const notifOff = document.getElementById('danger-outlined');
        
        emailInput.placeholder = user.email;
        usernameInput.placeholder = user.username;
        if (user.email_notification) {
            notifOn.setAttribute('checked', 'true');
        }
        else {
            notifOff.setAttribute('checked', 'true');
        }

    }
}