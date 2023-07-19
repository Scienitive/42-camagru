import { AJAXGet, AJAXGetHTML } from "./ajax.js";
import { afterPageLoad } from "./listen.js";

document.addEventListener('click', (e) => {
    if (!e.target.matches("a")) {
        return;
    }
    e.preventDefault();
    urlRoute(e);
});

const urlRoutes = {
    "/403": {
        name: "403",
        title: "Camagru | 403",
        headerLink: "",
        mainLink: "403.html"
    },
    "/404": {
        name: "404",
        title: "Camagru | 404",
        headerLink: "",
        mainLink: "404.html"
    },
    "/": {
        name: "home",
        title: "Camagru",
        headerLink: "",
        mainLink: ""
    },
    "/login": {
        name: "login",
        title: "Camagru | Login",
        headerLink: "login.html",
        mainLink: "login.html"
    },
    "/signup": {
        name: "signup",
        title: "Camagru | Signup",
        headerLink: "signup.html",
        mainLink: "signup.html"
    },
    "/verification-sent": {
        name: "verification-sent",
        title: "Camagru | Verify",
        headerLink: "signup.html",
        mainLink: "verification-sent.html"
    },
    "/verify": {
        name: "verify",
        title: "Camagru | Verify",
        headerLink: "signup.html",
        mainLink: "verify.html"
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
    route = await changeRoute(route);
    location = Object.keys(urlRoutes).find(key => {
        return Object.values(urlRoutes[key]).some(val => val.includes(route.name));
    });
    const headerElement = await (await AJAXGetHTML(`headers/${route.headerLink}`)).text();
    const mainElement = await (await AJAXGetHTML(`mains/${route.mainLink}`)).text();
    document.getElementById('header-section').innerHTML = headerElement;
    document.getElementById('main-section').innerHTML = mainElement;
    afterPageLoad();

    if (typeof(pathname) != "object") { // If it hasn't come from window.onpopstate
        window.history.pushState({}, "", location);
    }
}

const changeRoute = async (route) => {
    const session = await (await AJAXGet("current-session.php")).json();

    if (route.name === "home" || route.name === "login") {
        route = session.hasOwnProperty('user-id') ? urlRoutes["/"] : urlRoutes["/login"];
    }
    else if (route.name === "signup") {
        route = session.hasOwnProperty('user-id') ? urlRoutes["/"] : urlRoutes["/signup"];
    }

    return route;
}

window.onpopstate = urlLocationHandler;
window.route = urlRoute;

urlLocationHandler();