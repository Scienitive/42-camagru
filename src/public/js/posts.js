import { AJAXDelete, AJAXGet, AJAXGetHTML } from "./ajax.js"
import { convertStringToElement } from "./utility.js";

let lastPostId = null;

export const loadPosts = async (container, userId, reset = false) => {
    let posts;
    if (reset) {
        lastPostId = null;
    }
    if (lastPostId != null) {
        if (userId) {
            posts = Object.values(await (await AJAXGet("post.controller.php", { lastPostId: lastPostId, userId: userId })).json());
        }
        else {
            posts = Object.values(await (await AJAXGet("post.controller.php", { lastPostId: lastPostId })).json());
        }
    }
    else {
        if (userId) {
            posts = Object.values(await (await AJAXGet("post.controller.php", { userId: userId })).json());
        }
        else {
            posts = Object.values(await (await AJAXGet("post.controller.php")).json());
        }
    }

    if (posts.length <= 0) {return;}
    lastPostId = posts[posts.length - 1].id;
    const postElement = convertStringToElement(await (await AJAXGetHTML(`mains/post.html`)).text());
    const session = await (await AJAXGet("current-session.php")).json();
    
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

        newElement.setAttribute('post-id', post.id.toString());
        usernameElement.textContent = post.username;
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

        deleteButton.addEventListener('click', () => {
            deleteDialog.showModal();
            const realDelete = deleteDialog.querySelector('#delete');
            const cancel = deleteDialog.querySelector('#cancel');
            realDelete.addEventListener('click', async () => {
                const postResponse = await AJAXDelete("post.controller.php", { postId: post.id });
                if (postResponse.ok) {
                    newElement.remove();
                }
                deleteDialog.close();
            });
            cancel.addEventListener('click', () => {
                deleteDialog.close();
            });
        })

        container.appendChild(newElement);
    }
}

export const loadComments = async (postId, container = document.querySelector(`[post-id="${postId}"]#comment-container`)) => {
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
        comments = Object.values(await (await AJAXGet("comment.controller.php", { postId: postId, lastCommentId: lastCommentId })).json());
    }
    else {
        comments = Object.values(await (await AJAXGet("comment.controller.php", { postId: postId })).json());
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