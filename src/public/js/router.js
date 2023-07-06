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
    "403": {
        mainView: "403",
        title: "Camagru | 403"
    },
    "404": {
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
    let location = pathname || window.location.pathname;
    console.log(location);

    let route = urlRoutes[location] || urlRoutes["404"];
    console.log(route.mainView);
    await AJAXPost("main-view.controller.php", { data: route.mainView }, async (response, formData) => {
        const newMainView = await response.text();
        console.log(newMainView);
        location = Object.keys(urlRoutes).find(key => {
            return Object.values(urlRoutes[key]).some(val => val.includes(newMainView));
        });
        console.log(location);
        const elements = await (await AJAXGet("main-view.controller.php")).json();
        loadNewHTML(elements);
    });
    window.history.pushState({}, "", location);
};

// Bu kısım şuan sıkıntılı
//window.onpopstate = urlLocationHandler;
//window.route = urlRoute;

urlLocationHandler();