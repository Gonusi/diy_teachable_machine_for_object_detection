import React, {useEffect, useRef, useState} from "react";

function ImageInput({ addImage }) {
    // Desired capture dimensions:
    const desiredWidth = 1280;
    const desiredHeight = 800;
    const videoRef = useRef(null);
    const [capturing, setCapturing] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        async function setupCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        }
        setupCamera();

        // Cleanup on unmount: stop video tracks and clear capture interval
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Capture a frame from the video, crop it to the desired aspect ratio,
    // draw to an offscreen canvas (1280×800), then get the ImageData.
    const captureFrame = () => {
        const video = videoRef.current;
        if (!video) return;

        const canvas = document.createElement('canvas');
        canvas.width = desiredWidth;
        canvas.height = desiredHeight;
        const ctx = canvas.getContext('2d');

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        if (!videoWidth || !videoHeight) return;

        const desiredRatio = desiredWidth / desiredHeight;
        const videoRatio = videoWidth / videoHeight;
        let sx, sy, sWidth, sHeight;

        // Determine crop parameters to maintain the 1280x800 (16:10) ratio.
        if (videoRatio > desiredRatio) {
            // Video is too wide: crop horizontally.
            sHeight = videoHeight;
            sWidth = videoHeight * desiredRatio;
            sx = (videoWidth - sWidth) / 2;
            sy = 0;
        } else if (videoRatio < desiredRatio) {
            // Video is too tall: crop vertically.
            sWidth = videoWidth;
            sHeight = videoWidth / desiredRatio;
            sx = 0;
            sy = (videoHeight - sHeight) / 2;
        } else {
            // Aspect ratios match; no cropping needed.
            sx = 0;
            sy = 0;
            sWidth = videoWidth;
            sHeight = videoHeight;
        }

        // Draw the cropped video frame to our offscreen canvas.
        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, desiredWidth, desiredHeight);
        // Get the raw pixel data from the canvas.
        const imageData = ctx.getImageData(0, 0, desiredWidth, desiredHeight);
        addImage(imageData);
    };

    const startCapture = () => {
        setCapturing(true);
        // Capture a frame every 50ms (this interval is configurable)
        intervalRef.current = setInterval(captureFrame, 50);
    };

    const stopCapture = () => {
        setCapturing(false);
        clearInterval(intervalRef.current);
    };

    return (
        <div>
            <div>
                {/* The video feed is styled to "cover" its container so that it is cropped (not squished) */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    style={{ objectFit: 'cover', width: desiredWidth, height: desiredHeight }}
                />
            </div>
            <button onClick={() => (capturing ? stopCapture() : startCapture())}>
                {capturing ? "Stop" : "Capture"}
            </button>
        </div>
    );
}

export default ImageInput;