import { AJAXPost } from "./ajax.js";
import { setListeners } from "./listen.js";

const loadNewHTML = (elements, newMainView) => {
    const [headerElement, mainElement] = elements;
    document.getElementById('header-section').innerHTML = headerElement;
    document.getElementById('main-section').innerHTML = mainElement;
    setListeners(newMainView);
}

document.addEventListener('click', (e) => {
    if (!e.target.matches("a")) {
        console.log("asdsa")
        return;
    }
    e.preventDefault();
    urlRoute(e);
});

const urlRoutes = {
    403: {
        mainView: "403",
        title: "Camagru | 403"
    },
    404: {
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
    window.history.pushState({}, "", event.target.href);
    urlLocationHandler();
};

const urlLocationHandler = async () => {
    const location = window.location.pathname;
    if (location.length == 0) {
        location = "/";
    }

    const route = urlRoutes[location] || urlRoutes[404];
    AJAXPost("main-view.controller.php", { data: route.mainView }, async (response, formData) => {
        const elements = await response.json();
        for (let data of formData) {
            loadNewHTML(elements, data[1])
        }
    });
};

window.onpopstate = urlLocationHandler;
window.route = urlRoute;

urlLocationHandler();