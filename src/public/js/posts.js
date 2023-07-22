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

        usernameElement.textContent = post.username;
        imageElement.src = post.image;
        likeCountElement.textContent = post.like_count;

        container.appendChild(newElement);
    });
}