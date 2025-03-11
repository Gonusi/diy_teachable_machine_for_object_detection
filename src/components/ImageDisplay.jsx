import React, {useEffect, useRef} from "react";

function ImageDisplay({ images }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const thumbWidth = 28;
        // Calculate the thumbnail height proportionally (28 * 800/1280 ≈ 18)
        const thumbHeight = Math.round(thumbWidth * (800 / 1280));
        const cols = 5;
        const rows = Math.ceil(images.length / cols);
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = thumbWidth * cols;
        canvas.height = thumbHeight * rows;
        const ctx = canvas.getContext('2d');

        // Clear the canvas before redrawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // For each captured image (stored as ImageData), create an offscreen canvas,
        // put the ImageData on it, then use drawImage to scale it to thumbnail size.
        images.forEach((imageData, index) => {
            const offscreen = document.createElement('canvas');
            offscreen.width = imageData.width;
            offscreen.height = imageData.height;
            const offCtx = offscreen.getContext('2d');
            offCtx.putImageData(imageData, 0, 0);

            const col = index % cols;
            const row = Math.floor(index / cols);
            ctx.drawImage(
                offscreen,
                0,
                0,
                imageData.width,
                imageData.height,
                col * thumbWidth,
                row * thumbHeight,
                thumbWidth,
                thumbHeight
            );
        });
    }, [images]);

    // The container is fixed-size so that 5 thumbnails are shown vertically.
    return (
        <div style={{ width: 28 * 5, height: Math.round((28 * (800 / 1280)) * 5), overflowY: 'auto', border: '1px solid black' }}>
            <canvas ref={canvasRef} />
        </div>
    );
}

export default ImageDisplay;