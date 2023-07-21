export const makeFormData = (jsonData) => {
    if (jsonData instanceof FormData) {
        return jsonData;
    }
    var formData = new FormData();
    for (let i = 0; i < Object.keys(jsonData).length; i++) {
        const key = Object.keys(jsonData)[i];
        const value = Object.values(jsonData)[i];
        formData.append(key, value);
    }
    return formData;
}

export const AJAXPost = async (link, jsonData) => {
    const formData = makeFormData(jsonData);
    const response = await fetch(`server/controllers/post/${link}`, {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
    });
    return response;
}

export const AJAXGet = async (link, jsonData, callback) => {
    if (jsonData === undefined) {
        const response = await fetch(`server/controllers/get/${link}`);
        return response;
    }
    else {
        const queryParams = new URLSearchParams(jsonData);
        const response = await fetch(`server/controllers/get/${link}?${queryParams}`);
        return response;
    }
}

export const AJAXGetHTML = async (link) => {
    const response = await fetch(`public/html/${link}`);
    return response;
}

export const AJAXDelete = async (link, jsonData) => {
    if (jsonData === undefined) {
        const response = await fetch(`server/controllers/delete/${link}`, {
            method: 'DELETE',
            credentials: 'same-origin',
        });
        return response;
    }
    else {
        const queryParams = new URLSearchParams(jsonData);
        const response = await fetch(`server/controllers/delete/${link}?${queryParams}`, {
            method: 'DELETE',
            credentials: 'same-origin',
        });
        return response;
    }
}