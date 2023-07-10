import { AJAXPost, AJAXGet } from "./ajax.js";
import { loadNewHTML } from "./listen.js";

document.addEventListener('click', (e) => {
    if (!e.target.matches("a")) {
        return;
    }
    e.preventDefault();
    urlRoute(e);
});

const urlRoutes = {
    "/403": {
        mainView: "403",
        title: "Camagru | 403"
    },
    "/404": {
        mainView: "404",
        title: "Camagru | 404"
    },
    "/": {
        mainView: "home",
        title: "Camagru"
    },
    "/login": {
        mainView: "login",
        title: "Camagru | Login"
    },
    "/signup": {
        mainView: "sign-up",
        title: "Camagru | Signup"
    }
};

const urlRoute = (event) => {
    event.preventDefault();
    const absoluteURL = event.target.href;
    const url = new URL(absoluteURL);
    const relativePath = url.pathname.length > 0 ? url.pathname : "/";
    urlLocationHandler(relativePath);
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
    await AJAXPost("route.controller.php", { data: route.mainView }, async (response, formData) => {
        const newMainView = await response.text();
        location = Object.keys(urlRoutes).find(key => {
            return Object.values(urlRoutes[key]).some(val => val.includes(newMainView));
        });
        const elements = await (await AJAXGet("current-elements.php")).json();
        loadNewHTML(elements);
    });
    if (typeof(pathname) != "object") { // If it hasn't come from window.onpopstate
        window.history.pushState({}, "", location);
    }
};

window.onpopstate = urlLocationHandler;
window.route = urlRoute;

urlLocationHandler();