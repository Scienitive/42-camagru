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
    let mediaStream = null;
    let captureMode = true;

    const startWebcam = async () => { // USE WITH AWAIT
        imageElement.classList.add('d-none');
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

    captureButton.addEventListener('click', async () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        imageElement.src = canvas.toDataURL();
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
            createPreview(imageElement.src);
        }
        reader.readAsDataURL(file);
        imageInput.value = '';
        await changeMode();
    });

    cancelButton.addEventListener('click', async () => {
        await changeMode();
    });

    document.addEventListener('click', async (event) => {
        // Preview Images Click Event
        if (event.target.classList.contains('preview-image')) {
            imageElement.src = event.target.src;
            await changeMode();
        }
    });

    // Sticker Element Click Event
    for (const stickerElement of stickerElements) {
        stickerElement.addEventListener('click', (event) => {
            const newSticker = document.createElement('img');
            newSticker.src = event.target.src;
            newSticker.classList.add('live-sticker');
            //newSticker.style.width = "100px";
            //newSticker.style.height = "100px";
            mainContainer.appendChild(newSticker);
        });
    }

    window.addEventListener('resize', () => {
        const liveStickers = mainContainer.querySelectorAll(".live-sticker");
        for (const liveSticker of liveStickers) {
            const computedStyle = window.getComputedStyle(liveSticker);
            const displayedHeight = computedStyle.getPropertyValue("height");
            const displayedWidth = computedStyle.getPropertyValue("width");
            console.log(`width: ${displayedWidth}`);
            console.log(`height: ${displayedHeight}`);
        }
    })
}
