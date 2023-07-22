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
    
    posts.forEach((post) => {
        const newElement = postElement.cloneNode(true);

        const usernameElement = newElement.querySelector('#post-username');
        const imageElement = newElement.querySelector('#post-image');
        const likeCountElement = newElement.querySelector('#like-count');
        const dateElement = newElement.querySelector('#post-date');

        usernameElement.textContent = post.username;
        imageElement.src = post.image;
        likeCountElement.textContent = post.like_count;
        dateElement.textContent = determineDate(post.post_created_at);

        container.appendChild(newElement);
    });
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
        return `${days} DAYS AGO`;
    }
    else if (hours > 0) {
        return `${hours} HOURS AGO`;
    }
    else if (minutes > 0) {
        return `${minutes} MINUTES AGO`;
    }
    else {
        return `RIGHT NOW`;
    }
}