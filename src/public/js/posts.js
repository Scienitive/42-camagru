import { AJAXGet, AJAXGetHTML } from "./ajax.js"
import { convertStringToElement } from "./utility.js";

export const loadPosts = async (container, lastPostId = 0) => {
    const postElement = convertStringToElement(await (await AJAXGetHTML(`mains/post.html`)).text());
    const posts = Object.values(await (await AJAXGet("post.controller.php", { lastPostId: lastPostId })).json());

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