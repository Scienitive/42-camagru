export const getCurrentMainView = async () => {
    return await (await AJAXGet("current-session.php")).text();
}

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

export const AJAXPost = async (link, jsonData, callback) => {
    const formData = makeFormData(jsonData);
    try {
        const response = await fetch("server/controllers/ajax/post/" + link, {
            method: 'POST',
            credentials: 'same-origin',
            body: formData
        });
    
        if (response.ok) {
            callback(await response, formData);
        }
        else {
          throw new Error('AJAX request failed.');
        }
    }
    catch (error) {
        console.error(error);
    }
}

export const AJAXGet = async (link) => {
    try {
        const response = await fetch("server/controllers/ajax/get/" + link);

        if (response.ok) {
            return response;
        }
        else {
          throw new Error('AJAX request failed.');
        }
    }
    catch (error) {
        console.error(error);
    }
}