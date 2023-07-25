export const setCreatePost = async () => {
    const videoElement = document.getElementById('webcam');
    const noWebcamElement = document.getElementById('no-webcam');
    const canvas = document.getElementById('canvas');
    const imageInput = document.getElementById('image-input');
    const captureButton = document.getElementById('capture-button');
    const uploadButton = document.getElementById('upload-button');
    const postButton = document.getElementById('post-button');
    const cancelButton = document.getElementById('cancel-button');
    const stickerContainer = document.getElementById('sticker-container');
    const previewContainer = document.getElementById('preview-container');
    const stickerElements = document.getElementsByClassName('sticker');
    let mediaStream = null;
    let captureMode = true;

    // Canvas
    let baseImage = null;
    let stickerArray = [];

    class Sticker {
        constructor(width, height, scaleX, scaleY, imageUrl) {
            this.x = 0;
            this.y = 0;
            this.width = width;
            this.height = height;
            this.scaleX = scaleX;
            this.scaleY = scaleY;
            this.image = new Image();
            this.image.width = 10;
            this.image.height = 10;
            this.image.src = imageUrl;
        }
    }

    const startCanvas = (width, height, image) => {
        const ctx = canvas.getContext('2d');
        canvas.classList.remove('d-none');

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        baseImage = new Image();
        baseImage.src = canvas.toDataURL();
    }

    const drawCanvas = async () => {
        const ctx = canvas.getContext('2d');

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the base image
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

        // Draw stickers
        for (const sticker of stickerArray) {
            setTimeout(() => {
            ctx.drawImage(sticker.image, canvas.width / 2 + sticker.x, canvas.height / 2 + sticker.y);
            }, 1000);
        }
    }

    const endCanvas = () => {
        const ctx = canvas.getContext('2d');
        canvas.classList.add('d-none');

        baseImage = null;
        stickerArray = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    canvas.addEventListener('mousemove', () => {
        for (let i = stickerArray.length - 1; i >= 0; i--) {

        }
    });

    canvas.addEventListener('mousedown', () => {
        for (let i = stickerArray.length - 1; i >= 0; i--) {

        }
    });

    const startWebcam = async () => { // USE WITH AWAIT
        endCanvas();
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
    }

    const changeMode = async () => { // USE WITH AWAIT
        captureMode = !captureMode;
        if (captureMode) {
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
        startCanvas(videoElement.videoWidth, videoElement.videoHeight, videoElement);
        createPreview(canvas.toDataURL());
        await changeMode();
    });

    uploadButton.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', async () => {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const uploadedImage = new Image();
            uploadedImage.onload = () => {
                startCanvas(uploadedImage.width, uploadedImage.height, uploadedImage);
            }
            uploadedImage.src = event.target.result;
            createPreview(event.target.result);
            uploadedImage.remove();
        }
        reader.readAsDataURL(file);
        imageInput.value = '';
        await changeMode();
    });

    cancelButton.addEventListener('click', async () => {
        await changeMode();
    });

    for (const stickerElement of stickerElements) {
        stickerElement.addEventListener('click', async (event) => {
            const width = event.target.naturalWidth;
            const height = event.target.naturalHeight;
            let scaleX = 1;
            let scaleY = 1;
            const stickerInitialSize = 10; // The bigger the value it gets smaller
            while (width * scaleX > canvas.width / stickerInitialSize || height * scaleY > canvas.width / stickerInitialSize) {
                scaleX -= 0.1;
                scaleY -= 0.1;
            }
            stickerArray.push(new Sticker(width, height, scaleX, scaleY, event.target.src));
            await drawCanvas();
        });
    }
}
