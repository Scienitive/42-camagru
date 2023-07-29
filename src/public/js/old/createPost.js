import { AJAXPost, AJAXGet } from "./ajax.js";
import { percentageToPixel, pixelToPercentage, setSessionVariable } from "./utility.js";

let mediaStream = null;

export const stopWebcam = (videoElement, noWebcamElement, imageElement, liveStickerContainer) => {
    if (mediaStream !== null) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    if (videoElement !== undefined) {
        videoElement.classList.add('d-none');
        noWebcamElement.classList.add('d-none');
        imageElement.classList.remove('d-none');
        liveStickerContainer.classList.remove('d-none');
    }
}

export const setCreatePost = async () => {
    const videoElement = document.getElementById('webcam');
    const noWebcamElement = document.getElementById('no-webcam');
    const imageElement = document.getElementById('image');
    const imageInput = document.getElementById('image-input');
    const captureButton = document.getElementById('capture-button');
    const uploadButton = document.getElementById('upload-button');
    const postButton = document.getElementById('post-button');
    const cancelButton = document.getElementById('cancel-button');
    const saveButton = document.getElementById('save-button');
    const middleCol = document.getElementById('middle-col');
    const stickerContainerAbove = document.getElementById('sticker-container-above');
    const stickerContainerVertical = document.getElementById('sticker-container');
    const stickerContainerHorizontal = document.getElementById('sticker-container-horizontal');
    let stickerContainer = window.innerWidth < 576 ? stickerContainerHorizontal : stickerContainerVertical;
    const previewContainerVertical = document.getElementById('preview-container');
    const previewContainerHorizontal = document.getElementById('preview-container-horizontal');
    let previewContainer = window.innerWidth < 576 ? previewContainerHorizontal : previewContainerVertical;
    previewContainer.classList.remove('d-none');
    const mainContainer = document.getElementById('main-container');
    const stickerElements = document.getElementsByClassName('sticker');
    const liveStickerContainer = document.getElementById('live-sticker-container');
    let LSCwidth;
    let LSCheight;
    let captureMode = true;

    if (stickerContainer === stickerContainerHorizontal) {
        stickerContainerAbove.style.height = "15vh";
        stickerContainerAbove.classList.add('justify-content-center');
    }

    const startWebcam = async () => { // USE WITH AWAIT
        imageElement.classList.add('d-none');
        liveStickerContainer.classList.add('d-none');
        try {
            const constraints = { video: true };
            mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = mediaStream;
            videoElement.classList.remove('d-none');
            noWebcamElement.classList.add('d-none');
            captureButton.disabled = false;
        }
        catch (error) {
            videoElement.classList.add('d-none');
            noWebcamElement.classList.remove('d-none');
            captureButton.disabled = true;
        }
    }
    await startWebcam();

    const changeMode = async () => { // USE WITH AWAIT
        captureMode = !captureMode;
        if (captureMode) {
            const liveStickers = mainContainer.querySelectorAll(".live-sticker");
            for (const liveSticker of liveStickers) {
                liveSticker.remove();
            }
            await startWebcam();
            captureButton.classList.remove('d-none');
            uploadButton.classList.remove('d-none');
            postButton.classList.add('d-none');
            middleCol.classList.add('d-none');
            saveButton.classList.add('d-none');
            previewContainer.classList.remove('d-none');
            stickerContainer.classList.add('d-none');
            postButton.disabled = true;
        }
        else {
            stopWebcam(videoElement, noWebcamElement, imageElement, liveStickerContainer);
            captureButton.classList.add('d-none');
            uploadButton.classList.add('d-none');
            postButton.classList.remove('d-none');
            middleCol.classList.remove('d-none');
            saveButton.classList.remove('d-none');
            previewContainer.classList.add('d-none');
            stickerContainer.classList.remove('d-none');
            saveButton.disabled = false;
            cancelButton.disabled = false;
        }
    }

    const createPreview = (imageUrl) => {
        const rowElement = document.createElement('div');
        rowElement.classList.add('row');
        const colElement = document.createElement('div');
        colElement.classList.add('col');
        colElement.classList.add('mx-2');
        colElement.classList.add('my-3');
        const imageElement = document.createElement('img');
        imageElement.src = imageUrl;
        imageElement.classList.add('preview-image');

        previewContainerVertical.appendChild(rowElement);
        rowElement.appendChild(colElement);
        colElement.appendChild(imageElement);

        const horizontalRowElement = previewContainerHorizontal.querySelector('.row');
        const horizontalColElement = document.createElement('div');
        horizontalColElement.classList.add('col-4');
        const horizontalImageElement = document.createElement('img');
        horizontalImageElement.src = imageUrl;
        horizontalImageElement.classList.add('preview-image');
        horizontalImageElement.style.maxHeight = "12vh";

        horizontalRowElement.appendChild(horizontalColElement);
        horizontalColElement.appendChild(horizontalImageElement);

    }

    const setLiveStickerContainer = (wait = true) => {
        const func = () => {
            const imageHeight = imageElement.offsetHeight;
            const imageWidth = (imageElement.offsetHeight * imageElement.naturalWidth) / imageElement.naturalHeight;
            liveStickerContainer.style.left = `${(mainContainer.offsetWidth - imageWidth) / 2}px`;
            liveStickerContainer.style.top = `${(mainContainer.offsetHeight - imageHeight) / 2}px`;
            liveStickerContainer.style.width = `${imageWidth}px`;
            liveStickerContainer.style.height = `${imageHeight}px`;
            LSCwidth = imageWidth;
            LSCheight = imageHeight;
        }

        if (wait) {
            setTimeout(() => {
                func();
            }, 1);
        }
        else {
            func();
        }
    }

    captureButton.addEventListener('click', async () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        imageElement.src = canvas.toDataURL();
        setLiveStickerContainer();
        canvas.remove();
        createPreview(imageElement.src);
        await changeMode();
    });

    uploadButton.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', async () => {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            imageElement.src = event.target.result;
            setLiveStickerContainer();
            createPreview(imageElement.src);
        }
        reader.readAsDataURL(file);
        imageInput.value = '';
        await changeMode();
    });

    cancelButton.addEventListener('click', async () => {
        postButton.disabled = true;
        saveButton.disabled = true;
        cancelButton.disabled = true;
        await changeMode();
    });

    saveButton.addEventListener('click', async () => {
        const stickerInformation = [];
        const liveStickers = mainContainer.querySelectorAll('.live-sticker');
        const rectContainer = liveStickerContainer.getBoundingClientRect();

        for (const liveSticker of liveStickers) {
            const rect = liveSticker.getBoundingClientRect();
            const stickerLeftPixel = Math.floor(rect.left - rectContainer.left);
            const stickerTopPixel = Math.floor(rect.top - rectContainer.top);
            const stickerWidthPixel = Math.floor(rect.width);
            const stickerHeightPixel = Math.floor(rect.height);

            stickerInformation.push({ image: extractString(elementToBase64(liveSticker)), x: stickerLeftPixel, y: stickerTopPixel, width: stickerWidthPixel, height: stickerHeightPixel });
        }

        const imageResponse = await AJAXPost("image-download.controller.php", { baseImage: extractString(imageElement.src), height: imageElement.offsetHeight, stickerArray: JSON.stringify(stickerInformation) });
        if (imageResponse.ok) {
            const blob = await imageResponse.blob();
            const imageUrl = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = imageUrl;
            anchor.download = "camagru.png";
            anchor.click();
            anchor.remove();
        }
    });

    document.addEventListener('click', async (event) => {
        // Preview Images Click Event
        if (event.target.classList.contains('preview-image')) {
            imageElement.src = event.target.src;
            setLiveStickerContainer();
            await changeMode();
        }
    });

    // Sticker Element Click Event
    for (const stickerElement of stickerElements) {
        stickerElement.addEventListener('click', (event) => {
            const newSticker = document.createElement('img');
            newSticker.src = event.target.src;
            newSticker.classList.add('live-sticker');
            newSticker.draggable = false;
            newSticker.style.left = `0px`;
            newSticker.style.top = `0px`;
            newSticker.style.width = `20%`;
            newSticker.style.height = 'auto';
            setTimeout(() => {
                newSticker.style.height = heightToPercentage(newSticker.style.height, newSticker.style.width, newSticker.naturalWidth / newSticker.naturalHeight, LSCheight, LSCwidth);
            }, 1);
            liveStickerContainer.appendChild(newSticker);
            postButton.disabled = false;
        });
    }

    // Live Stickers
    let currentLiveSticker = null;
    let resizeDirection = null;
    let prevX = 0;
    let prevY = 0;

    const changeToPixel = (value, parentSize) => {
        if (value[value.length - 1] === '%') {
            value = `${percentageToPixel(parseInt(value), parentSize)}px`;
        }
        return value;
    }

    const changeToPercentage = (value, parentSize) => {
        if (value[value.length - 1] === 'x' && value[value.length - 2] === 'p') {
            value = `${pixelToPercentage(parseInt(value), parentSize)}%`;
        }
        return value;
    }

    const heightToPixel = (height, width, aspectRatio, parentHeight, parentWidth) => {
        if (height === 'auto') {
            const widthPixel = parseInt(changeToPixel(width, parentWidth));
            height = `${widthPixel / aspectRatio}px`;
            return height;
        }
        else {
            return changeToPixel(height, parentHeight);
        }
    }

    const heightToPercentage = (height, width, aspectRatio, parentHeight, parentWidth) => {
        height = heightToPixel(height, width, aspectRatio, parentHeight, parentWidth);
        return changeToPercentage(height, parentHeight);
    }

    document.addEventListener('mousedown', (event) => {
        if (event.target.classList.contains('live-sticker')) {
            currentLiveSticker = event.target;
            prevX = event.clientX;
            prevY = event.clientY;
        }
        if (event.target.style.cursor === 'auto') {
            resizeDirection = null;
        }
        else if (event.target.style.cursor === 'n-resize') {
            resizeDirection = 'top';
        }
        else if (event.target.style.cursor === 's-resize') {
            resizeDirection = 'bottom';
        }
        else if (event.target.style.cursor === 'w-resize') {
            resizeDirection = 'left';
        }
        else if (event.target.style.cursor === 'e-resize') {
            resizeDirection = 'right';
        }
    });

    document.addEventListener('mouseup', () => {
        if (currentLiveSticker) {
            const liveStickers = mainContainer.querySelectorAll('.live-sticker');
            console.log(liveStickers.length);
            const destroyRatio = 2 / 3;
            if (parseInt(currentLiveSticker.style.left) < 0) {
                if (parseInt(currentLiveSticker.style.left) > 0 - currentLiveSticker.width * destroyRatio) {
                    currentLiveSticker.style.left = `0px`;
                }
                else {
                    if (liveStickers.length === 1) {
                        postButton.disabled = true;
                    }
                    currentLiveSticker.remove();
                }
            }
            else if (parseInt(currentLiveSticker.style.left) > LSCwidth - currentLiveSticker.width) {
                if (parseInt(currentLiveSticker.style.left) < LSCwidth - currentLiveSticker.width + currentLiveSticker.width * destroyRatio) {
                    currentLiveSticker.style.left = `${LSCwidth - currentLiveSticker.width}px`;
                }
                else {
                    if (liveStickers.length === 1) {
                        postButton.disabled = true;
                    }
                    currentLiveSticker.remove();
                }
            }
            if (parseInt(currentLiveSticker.style.top) < 0) {
                if (parseInt(currentLiveSticker.style.top) > 0 - currentLiveSticker.height * destroyRatio) {
                    currentLiveSticker.style.top = `0px`;
                }
                else {
                    if (liveStickers.length === 1) {
                        postButton.disabled = true;
                    }
                    currentLiveSticker.remove();
                }
            }
            else if (parseInt(currentLiveSticker.style.top) > LSCheight - currentLiveSticker.height) {
                if (parseInt(currentLiveSticker.style.top) < LSCheight - currentLiveSticker.height + currentLiveSticker.height * destroyRatio) {
                    currentLiveSticker.style.top = `${LSCheight - currentLiveSticker.height}px`;
                }
                else {
                    if (liveStickers.length === 1) {
                        postButton.disabled = true;
                    }
                    currentLiveSticker.remove();
                }
            }
            currentLiveSticker = null;
            resizeDirection = null;
        }
    });

    window.addEventListener('mousemove', (event) => {
        if (!captureMode) {
            if (currentLiveSticker) {
                const minumumWidth = 4; // Percentage (also Height)
                const newX = prevX - event.clientX;
                const newY = prevY - event.clientY;

                // Moving the sticker
                if (!resizeDirection) {
                    currentLiveSticker.style.left = `${parseInt(changeToPixel(currentLiveSticker.style.left, LSCwidth)) - newX}px`;
                    currentLiveSticker.style.top = `${parseInt(changeToPixel(currentLiveSticker.style.top, LSCheight)) - newY}px`;
                }

                // Resizing the sticker
                else if (resizeDirection === 'right') {
                    const oldWidth = currentLiveSticker.style.width;
                    currentLiveSticker.style.width = `${parseInt(changeToPixel(currentLiveSticker.style.width, LSCwidth)) - newX}px`;
                    if (parseInt(changeToPixel(currentLiveSticker.style.left)) > LSCwidth - parseInt(currentLiveSticker.width)) {
                        currentLiveSticker.style.width = oldWidth;
                    }
                    if (parseInt(changeToPercentage(currentLiveSticker.style.width, LSCwidth)) < minumumWidth) {
                        currentLiveSticker.style.width = oldWidth;
                    }
                }
                else if (resizeDirection === 'left') {
                    const oldWidth = currentLiveSticker.style.width;
                    const oldLeft = currentLiveSticker.style.left;
                    currentLiveSticker.style.width = `${parseInt(changeToPixel(currentLiveSticker.style.width, LSCwidth)) + newX}px`;
                    currentLiveSticker.style.left = `${parseInt(changeToPixel(currentLiveSticker.style.left, LSCwidth)) - newX}px`;
                    if (parseInt(changeToPixel(currentLiveSticker.style.left)) < 0) {
                        currentLiveSticker.style.width = oldWidth;
                        currentLiveSticker.style.left = oldLeft;
                    }
                    if (parseInt(changeToPercentage(currentLiveSticker.style.width, LSCwidth)) < minumumWidth) {
                        currentLiveSticker.style.width = oldWidth;
                        currentLiveSticker.style.left = oldLeft;
                    }
                }
                else if (resizeDirection === 'bottom') {
                    const oldHeight = currentLiveSticker.style.height;
                    currentLiveSticker.style.height = `${parseInt(changeToPixel(currentLiveSticker.style.height, LSCheight)) - newY}px`;
                    if (parseInt(changeToPixel(currentLiveSticker.style.top)) > LSCheight - parseInt(currentLiveSticker.height)) {
                        currentLiveSticker.style.height = oldHeight;
                    }
                    if (parseInt(changeToPercentage(currentLiveSticker.style.height, LSCheight)) < minumumWidth) {
                        currentLiveSticker.style.height = oldHeight;
                    }
                }
                else if (resizeDirection === 'top') {
                    const oldHeight = currentLiveSticker.style.height;
                    const oldTop = currentLiveSticker.style.top;
                    currentLiveSticker.style.height = `${parseInt(changeToPixel(currentLiveSticker.style.height, LSCheight)) + newY}px`;
                    currentLiveSticker.style.top = `${parseInt(changeToPixel(currentLiveSticker.style.top, LSCwidth)) - newY}px`;
                    if (parseInt(changeToPixel(currentLiveSticker.style.top)) < 0) {
                        currentLiveSticker.style.height = oldHeight;
                        currentLiveSticker.style.top = oldTop;
                    }
                    if (parseInt(changeToPercentage(currentLiveSticker.style.height, LSCheight)) < minumumWidth) {
                        currentLiveSticker.style.height = oldHeight;
                        currentLiveSticker.style.top = oldTop;
                    }
                }

                prevX = event.clientX;
                prevY = event.clientY;
            }

            // Cursor Changes
            if (event.target.classList.contains('live-sticker')) {
                if (!resizeDirection) {
                    const { left, top, right, bottom } = event.target.getBoundingClientRect();
                    const borderRatio = 5/100;
                    let borderWidth = Math.floor(parseInt(changeToPixel(event.target.style.width, LSCwidth)) * borderRatio);
                    let borderHeight = Math.floor(parseInt(changeToPixel(event.target.style.height, LSCheight)) * borderRatio);
                    console.log(event.target.style.width);
                    if (borderHeight < 2) {borderHeight = 2;}
                    if (borderWidth < 2) {borderWidth = 2;}

                    if (event.clientY >= top && event.clientY <= top + borderHeight) {
                        event.target.style.cursor = 'n-resize';
                    }
                    else if (event.clientY >= bottom - borderHeight && event.clientY <= bottom) {
                        event.target.style.cursor = 's-resize';
                    }
                    else if (event.clientX >= left && event.clientX <= left + borderWidth) {
                        event.target.style.cursor = 'w-resize';
                    }
                    else if (event.clientX >= right - borderWidth && event.clientX <= right) {
                        event.target.style.cursor = 'e-resize';
                    }
                    else {
                        event.target.style.cursor = 'auto';
                    }
                }
            }
        }
    });

    window.addEventListener('resize', () => {
        const liveStickers = mainContainer.querySelectorAll('.live-sticker');
        for (const liveSticker of liveStickers) {
            liveSticker.style.left = changeToPercentage(liveSticker.style.left, LSCwidth);
            liveSticker.style.top = changeToPercentage(liveSticker.style.top, LSCheight);
            liveSticker.style.width = changeToPercentage(liveSticker.style.width, LSCwidth);
            liveSticker.style.height = changeToPercentage(liveSticker.style.height, LSCheight);
        }
        setLiveStickerContainer(false);

        const oldStickerContainer = stickerContainer;
        stickerContainer = window.innerWidth < 576 ? stickerContainerHorizontal : stickerContainerVertical;
        if (stickerContainer !== oldStickerContainer && !oldStickerContainer.classList.contains('d-none')) {
            oldStickerContainer.classList.add('d-none');
            stickerContainer.classList.remove('d-none');
        }

        const oldPreviewContainer = previewContainer;
        previewContainer = window.innerWidth < 576 ? previewContainerHorizontal : previewContainerVertical;
        if (previewContainer !== oldPreviewContainer && !oldPreviewContainer.classList.contains('d-none')) {
            oldPreviewContainer.classList.add('d-none');
            previewContainer.classList.remove('d-none');
        }

        if (stickerContainer === stickerContainerHorizontal) {
            stickerContainerAbove.style.height = "15vh";
            stickerContainerAbove.classList.add('justify-content-center');
        }
        else {
            stickerContainerAbove.style.height = "70vh";
            stickerContainerAbove.classList.remove('justify-content-center');
        }
    });

    // Sticker to Base64
    const elementToBase64 = (imgElement) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;

        ctx.drawImage(imgElement, 0, 0);
        const base64String = canvas.toDataURL();
        canvas.remove();
        return base64String;
    }
    const extractString = (base64String) => {
        const parts = base64String.split(',');
        if (parts.length === 2) {
            return parts[1];
        }
        else {
            return base64String;
        }
    }
    // Post button
    postButton.addEventListener('click', async () => {
        const stickerInformation = [];
        const liveStickers = mainContainer.querySelectorAll('.live-sticker');
        const rectContainer = liveStickerContainer.getBoundingClientRect();

        for (const liveSticker of liveStickers) {
            const rect = liveSticker.getBoundingClientRect();
            const stickerLeftPixel = Math.floor(rect.left - rectContainer.left);
            const stickerTopPixel = Math.floor(rect.top - rectContainer.top);
            const stickerWidthPixel = Math.floor(rect.width);
            const stickerHeightPixel = Math.floor(rect.height);

            stickerInformation.push({ image: extractString(elementToBase64(liveSticker)), x: stickerLeftPixel, y: stickerTopPixel, width: stickerWidthPixel, height: stickerHeightPixel });
        }

        const session = await (await AJAXGet("current-session.php")).json();
        const imageResponse = await AJAXPost("image.controller.php", { userId: session['user-id'], baseImage: extractString(imageElement.src), height: imageElement.offsetHeight, stickerArray: JSON.stringify(stickerInformation) });
        if (imageResponse.ok) {
            const imageFileName = await imageResponse.text();
            console.log(imageFileName);
            const postResponse = await AJAXPost("post.controller.php", { userId: session['user-id'], imageFileName: `/public/uploads/${imageFileName}` });
            if (postResponse.ok) {
                await setSessionVariable('post-successful');
                window.location.replace("/post-successful");
            }
            else {
                console.log(await postResponse.text());
            }
        }
    });
}