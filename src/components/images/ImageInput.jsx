import React, { useEffect, useRef } from "react";
import {CAPTURE_INTERVAL_MS, VIDEO_HEIGHT, VIDEO_WIDTH} from "./constants";
import { Box, Button } from "@mui/material";

function ImageInput({ addImage }) {
    const videoRef = useRef(null);
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

        const canvas = document.createElement("canvas");
        canvas.width = VIDEO_WIDTH;
        canvas.height = VIDEO_HEIGHT;
        const ctx = canvas.getContext("2d");

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        if (!videoWidth || !videoHeight) return;

        const desiredRatio = VIDEO_WIDTH / VIDEO_HEIGHT;
        const videoRatio = videoWidth / videoHeight;
        let sx, sy, sWidth, sHeight;

        // Determine crop parameters to maintain the 1280x800 (16:10) ratio.
        if (videoRatio > desiredRatio) {
            sHeight = videoHeight;
            sWidth = videoHeight * desiredRatio;
            sx = (videoWidth - sWidth) / 2;
            sy = 0;
        } else if (videoRatio < desiredRatio) {
            sWidth = videoWidth;
            sHeight = videoWidth / desiredRatio;
            sx = 0;
            sy = (videoHeight - sHeight) / 2;
        } else {
            sx = 0;
            sy = 0;
            sWidth = videoWidth;
            sHeight = videoHeight;
        }

        // Draw the cropped video frame to our offscreen canvas.
        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        // Get the raw pixel data from the canvas.
        const imageData = ctx.getImageData(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        addImage(imageData);
    };

    const startCapture = () => {
        // Capture a frame every 50ms while the button is held down.
        if (!intervalRef.current) {
            intervalRef.current = setInterval(captureFrame, CAPTURE_INTERVAL_MS);
        }
    };

    const stopCapture = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    };

    return (
        <Box sx={{ border: "1px solid grey", display: "flex", flexDirection: "column", alignItems: "center", padding: 2 }}>
            <video
                ref={videoRef}
                autoPlay
                muted
                style={{ objectFit: "cover", width: VIDEO_WIDTH / 3, height: VIDEO_HEIGHT / 3 }}
            />
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                    variant="contained"
                    onMouseDown={startCapture}
                    onMouseUp={stopCapture}
                    onMouseLeave={stopCapture}
                    onTouchStart={startCapture}
                    onTouchEnd={stopCapture}
                >
                    Hold to Capture
                </Button>
                <Button variant="contained" onClick={captureFrame}>
                    Capture Single Frame
                </Button>
            </Box>
        </Box>
    );
}

export default ImageInput;