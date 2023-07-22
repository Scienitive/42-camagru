import { AJAXGetHTML } from "./ajax.js"
import { convertStringToElement } from "./utility.js";

export const loadPosts = async (container) => {
    const post = convertStringToElement(await (await AJAXGetHTML(`mains/post.html`)).text());
    
    for (let i = 0; i < 3; i++) {
        container.appendChild(post.cloneNode(true));
    }
}