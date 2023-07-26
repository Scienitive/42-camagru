import { percentageToPixel, pixelToPercentage } from "./utility.js";

export const setCreatePost = async () => {
    const videoElement = document.getElementById('webcam');
    const noWebcamElement = document.getElementById('no-webcam');
    const imageElement = document.getElementById('image');
    const imageInput = document.getElementById('image-input');
    const captureButton = document.getElementById('capture-button');
    const uploadButton = document.getElementById('upload-button');
    const postButton = document.getElementById('post-button');
    const cancelButton = document.getElementById('cancel-button');
    const stickerContainer = document.getElementById('sticker-container');
    const previewContainer = document.getElementById('preview-container');
    const mainContainer = document.getElementById('main-container');
    const stickerElements = document.getElementsByClassName('sticker');
    const liveStickerContainer = document.getElementById('live-sticker-container');
    let mediaStream = null;
    let captureMode = true;

    const startWebcam = async () => { // USE WITH AWAIT
        imageElement.classList.add('d-none');
        liveStickerContainer.classList.add('d-none');
        try {
            const constraints = { video: true };
            mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = mediaStream;
            videoElement.classList.remove('d-none');
            noWebcamElement.classList.add('d-none');
        }
        catch (error) {
            videoElement.classList.add('d-none');
            noWebcamElement.classList.remove('d-none');
        }
    }
    await startWebcam();

    const stopWebcam = () => {
        if (mediaStream !== null) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
        videoElement.classList.add('d-none');
        noWebcamElement.classList.add('d-none');
        imageElement.classList.remove('d-none');
        liveStickerContainer.classList.remove('d-none');
    }

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
            cancelButton.classList.add('d-none');
            previewContainer.classList.remove('d-none');
            stickerContainer.classList.add('d-none');
        }
        else {
            stopWebcam();
            captureButton.classList.add('d-none');
            uploadButton.classList.add('d-none');
            postButton.classList.remove('d-none');
            cancelButton.classList.remove('d-none');
            previewContainer.classList.add('d-none');
            stickerContainer.classList.remove('d-none');
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

        previewContainer.appendChild(rowElement);
        rowElement.appendChild(colElement);
        colElement.appendChild(imageElement);
    }

    const setLiveStickerContainer = (wait = true) => {
        const func = () => {
            const imageHeight = imageElement.offsetHeight;
            const imageWidth = (imageElement.offsetHeight * imageElement.naturalWidth) / imageElement.naturalHeight;
            liveStickerContainer.style.left = `${(mainContainer.offsetWidth - imageWidth) / 2}px`;
            liveStickerContainer.style.top = `${(mainContainer.offsetHeight - imageHeight) / 2}px`;
            liveStickerContainer.style.width = `${imageWidth}px`;
            liveStickerContainer.style.height = `${imageHeight}px`;
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
        dasdaf();
    });

    cancelButton.addEventListener('click', async () => {
        await changeMode();
    });

    document.addEventListener('click', async (event) => {
        // Preview Images Click Event
        if (event.target.classList.contains('preview-image')) {
            imageElement.src = event.target.src;
            setLiveStickerContainer();
            await changeMode();
            dasdaf();
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
            liveStickerContainer.appendChild(newSticker);
        });
    }

    // Live Stickers
    let currentLiveSticker = null;
    let isResizing = false;
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
    });

    document.addEventListener('mouseup', () => {
        if (currentLiveSticker) {
            const destroyRatio = 2 / 3;
            if (parseInt(currentLiveSticker.style.left) < 0) {
                if (parseInt(currentLiveSticker.style.left) > 0 - currentLiveSticker.width * destroyRatio) {
                    currentLiveSticker.style.left = `0px`;
                }
                else {
                    currentLiveSticker.remove();
                }
            }
            else if (parseInt(currentLiveSticker.style.left) > liveStickerContainer.offsetWidth - currentLiveSticker.width) {
                if (parseInt(currentLiveSticker.style.left) < liveStickerContainer.offsetWidth - currentLiveSticker.width + currentLiveSticker.width * destroyRatio) {
                    currentLiveSticker.style.left = `${liveStickerContainer.offsetWidth - currentLiveSticker.width}px`;
                }
                else {
                    currentLiveSticker.remove();
                }
            }
            if (parseInt(currentLiveSticker.style.top) < 0) {
                if (parseInt(currentLiveSticker.style.top) > 0 - currentLiveSticker.height * destroyRatio) {
                    currentLiveSticker.style.top = `0px`;
                }
                else {
                    currentLiveSticker.remove();
                }
            }
            else if (parseInt(currentLiveSticker.style.top) > liveStickerContainer.offsetHeight - currentLiveSticker.height) {
                if (parseInt(currentLiveSticker.style.top) < liveStickerContainer.offsetHeight - currentLiveSticker.height + currentLiveSticker.height * destroyRatio) {
                    currentLiveSticker.style.top = `${liveStickerContainer.offsetHeight - currentLiveSticker.height}px`;
                }
                else {
                    currentLiveSticker.remove();
                }
            }
            currentLiveSticker = null;
        }
    });

    window.addEventListener('mousemove', (event) => {
        // Moving the sticker
        if (currentLiveSticker) {
            const newX = prevX - event.clientX;
            const newY = prevY - event.clientY;

            currentLiveSticker.style.left = `${parseInt(changeToPixel(currentLiveSticker.style.left, liveStickerContainer.offsetWidth)) - newX}px`;
            currentLiveSticker.style.top = `${parseInt(changeToPixel(currentLiveSticker.style.top, liveStickerContainer.offsetHeight)) - newY}px`;

            prevX = event.clientX;
            prevY = event.clientY;
        }

        // Cursor Changes
        if (!captureMode && event.target.classList.contains('live-sticker')) {
            const { left, top, right, bottom } = event.target.getBoundingClientRect();

            const ap = event.target.naturalWidth / event.target.naturalHeight;
            const borderRatio = 5/100;
            let borderWidth = Math.floor(parseInt(changeToPixel(event.target.style.width, liveStickerContainer.offsetWidth)) * borderRatio);
            let borderHeight = Math.floor(parseInt(heightToPixel(event.target.style.height, event.target.style.width, ap, liveStickerContainer.offsetHeight, liveStickerContainer.offsetWidth)) * borderRatio);
            if (borderHeight < 2) {borderHeight = 2;}
            if (borderWidth < 2) {borderWidth = 2;}
            console.log(borderWidth);
            console.log(borderHeight);

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
    });

    window.addEventListener('resize', () => {
        if (!captureMode) {
            setLiveStickerContainer(false);
        }
        const liveStickers = mainContainer.querySelectorAll('.live-sticker');
        for (const liveSticker of liveStickers) {
            liveSticker.style.left = changeToPercentage(liveSticker.style.left, liveStickerContainer.offsetWidth);
            liveSticker.style.top = changeToPercentage(liveSticker.style.top, liveStickerContainer.offsetHeight);
        }
    });
}
