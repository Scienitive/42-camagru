import { AJAXDelete, AJAXGet, AJAXGetHTML } from "./ajax.js";
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
        name: "/403",
        title: "Camagru | 403",
        headerLink: "",
        mainLink: "403.html"
    },
    "/404": {
        name: "/404",
        title: "Camagru | 404",
        headerLink: "",
        mainLink: "404.html"
    },
    "/": {
        name: "/",
        title: "Camagru",
        headerLink: "home.html",
        mainLink: "home.html"
    },
    "/login": {
        name: "/login",
        title: "Camagru | Login",
        headerLink: "login.html",
        mainLink: "login.html"
    },
    "/signup": {
        name: "/signup",
        title: "Camagru | Signup",
        headerLink: "signup.html",
        mainLink: "signup.html"
    },
    "/verification-sent": {
        name: "/verification-sent",
        title: "Camagru | Verify",
        headerLink: "signup.html",
        mainLink: "verification-sent.html"
    },
    "/verify": {
        name: "/verify",
        title: "Camagru | Verify",
        headerLink: "signup.html",
        mainLink: "verify.html"
    },
    "/password-change-send": {
        name: "/password-change-send",
        title: "Camagru | Password Change",
        headerLink: "signup.html",
        mainLink: "password-change-1.html"
    },
    "/password-change": {
        name: "/password-change",
        title: "Camagru | Password Change",
        headerLink: "signup.html",
        mainLink: "password-change-2.html"
    },
    "/settings": {
        name: "/settings",
        title: "Camagru | Settings",
        headerLink: "home.html",
        mainLink: "settings.html"
    },
    "/create-post": {
        name: "/create-post",
        title: "Camagru | New Post",
        headerLink: "home.html",
        mainLink: "create-post.html"
    },
    "/post-successful": {
        name: "/post-successful",
        title: "Camagru | New Post",
        headerLink: "home.html",
        mainLink: "post-successful.html"
    },
    "/post-unsuccessful": {
        name: "/post-unsuccessful",
        title: "Camagru | New Post",
        headerLink: "home.html",
        mainLink: "post-unsuccessful.html"
    }
};

const urlRoute = (event) => {
    event.preventDefault();
    const absoluteURL = event.target.href;
    const url = new URL(absoluteURL);
    const relativePath = url.pathname.length > 0 ? url.pathname : "/";
    if (relativePath === window.location.pathname) {
        window.location.replace(window.location.pathname);
    }
    else if (relativePath === '/create-post') {
        window.location.replace('/create-post');
    }
    else {
        urlLocationHandler(relativePath);
    }
    
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
    location = route.name;
    if (route.headerLink !== "") {
        const headerElement = await (await AJAXGetHTML(`headers/${route.headerLink}`)).text();
        document.getElementById('header-section').innerHTML = headerElement;
    }
    if (route.mainLink !== "") {
        const mainElement = await (await AJAXGetHTML(`mains/${route.mainLink}`)).text();
        document.getElementById('main-section').innerHTML = mainElement;
    }
    afterPageLoad(location);

    if (typeof(pathname) != "object") { // If it hasn't come from window.onpopstate
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.size > 0 && pathname === undefined) { // pathname === undefined means if it's directly applied from address bar
            const queryString = urlParams.toString();
            window.history.pushState({}, "", `${location}?${queryString}`);
        }
        else {
            window.history.pushState({}, "", location);
        }
    }
}

const changeRoute = async (route) => {
    const session = await (await AJAXGet("current-session.php")).json();

    if (route.name === "/" || route.name === "/login") {
        route = session.hasOwnProperty('user-id') ? urlRoutes["/"] : urlRoutes["/login"];
    }
    else if (route.name === "/signup") {
        route = session.hasOwnProperty('user-id') ? urlRoutes["/"] : urlRoutes["/signup"];
    }
    else if (route.name === "/settings") {
        route = session.hasOwnProperty('user-id') ? urlRoutes["/settings"] : urlRoutes["/404"];
    }
    else if (route.name === "/create-post") {
        route = session.hasOwnProperty('user-id') ? urlRoutes["/create-post"] : urlRoutes["/404"];
    }
    else if (route.name === "/verification-sent") {
        route = session.hasOwnProperty('verification-sent') ? urlRoutes["/verification-sent"] : urlRoutes["/403"];
        if (session.hasOwnProperty('verification-sent')) {
            const deleteVariables = ['verification-sent'];
            await AJAXDelete("session-var.controller.php", { variables: JSON.stringify(deleteVariables) });
        }
    }
    else if (route.name === "/post-successful") {
        route = session.hasOwnProperty('post-successful') ? urlRoutes["/post-successful"] : urlRoutes["/403"];
        if (session.hasOwnProperty('post-successful')) {
            const deleteVariables = ['post-successful'];
            await AJAXDelete("session-var.controller.php", { variables: JSON.stringify(deleteVariables) });
        }
    }
    else if (route.name === "/post-unsuccessful") {
        route = session.hasOwnProperty('post-unsuccessful') ? urlRoutes["/post-unsuccessful"] : urlRoutes["/403"];
        if (session.hasOwnProperty('post-unsuccessful')) {
            const deleteVariables = ['post-unsuccessful'];
            await AJAXDelete("session-var.controller.php", { variables: JSON.stringify(deleteVariables) });
        }
    }
    else if (route.name === "/password-change-send") {
        route = session.hasOwnProperty('password-change-send') ? urlRoutes["/password-change-send"] : urlRoutes["/403"];
        if (session.hasOwnProperty('password-change-send')) {
            const deleteVariables = ['password-change-send'];
            await AJAXDelete("session-var.controller.php", { variables: JSON.stringify(deleteVariables) });
        }
    }

    return route;
}

window.onpopstate = urlLocationHandler;
window.route = urlRoute;

urlLocationHandler();