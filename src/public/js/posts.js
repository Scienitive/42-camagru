import { AJAXGet, AJAXGetHTML } from "./ajax.js"
import { convertStringToElement } from "./utility.js";

let lastPostId = null;

export const loadPosts = async (container) => {
    let posts;
    if (lastPostId != null) {
        posts = Object.values(await (await AJAXGet("post.controller.php", { lastPostId: lastPostId })).json());
    }
    else {
        posts = Object.values(await (await AJAXGet("post.controller.php")).json());
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

        usernameElement.textContent = post.username;
        imageElement.src = post.image;
        likeCountElement.textContent = post.like_count;
        likeCountElement.setAttribute('post-id', post.id.toString());
        dateElement.textContent = determineDate(post.created_at);
        likeButton.setAttribute('post-id', post.id.toString());

        const likeResponse = await AJAXGet("like.controller.php", { userId: session['user-id'], postId: post.id.toString() });
        if (likeResponse.ok && (await likeResponse.text()) !== '0') {
            const icon = likeButton.querySelector('i');
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            icon.style.color = '#dc3545';
        }

        container.appendChild(newElement);
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