import { AJAXGetHTML } from "./ajax.js"
import { convertStringToElement } from "./utility.js";

export const loadPosts = async (container) => {
    console.log(container);
    const post = convertStringToElement(await (await AJAXGetHTML(`mains/post.html`)).text());
    console.log(post);
    container.appendChild(post);
}