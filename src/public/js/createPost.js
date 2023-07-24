
export const setCreatePost = async () => {
    const videoElement = document.getElementById('webcam');
    const noWebcamElement = document.getElementById('no-webcam');
    const imageElement = document.getElementById('the-image');
    const imageInput = document.getElementById('image-input');
    const captureButton = document.getElementById('capture-button');
    const uploadButton = document.getElementById('upload-button');
    const postButton = document.getElementById('post-button');
    const cancelButton = document.getElementById('cancel-button');
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
            await startWebcam();
            captureButton.classList.remove('d-none');
            uploadButton.classList.remove('d-none');
            postButton.classList.add('d-none');
            cancelButton.classList.add('d-none');
        }
        else {
            stopWebcam();
            captureButton.classList.add('d-none');
            uploadButton.classList.add('d-none');
            postButton.classList.remove('d-none');
            cancelButton.classList.remove('d-none');
        }
    }

    captureButton.addEventListener('click', async () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        imageElement.src = canvas.toDataURL();
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
        }
        reader.readAsDataURL(file);
        imageInput.value = '';
        await changeMode();
    });

    cancelButton.addEventListener('click', async () => {
        await changeMode();
    });
}
