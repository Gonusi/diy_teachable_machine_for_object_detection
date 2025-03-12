import React, { useEffect, useRef } from "react";
import {
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
  THUMB_WIDTH,
  THUMB_HEIGHT,
} from "./constants";
import { Box } from "@mui/material";
import { grey } from "@mui/material/colors";

function ImageDisplay({ images }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Calculate the thumbnail height proportionally (28 * 800/1280 ≈ 18)
    const cols = 5;
    const rows = Math.ceil(images.length / cols);
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = THUMB_WIDTH * cols;
    canvas.height = THUMB_HEIGHT * rows;
    const ctx = canvas.getContext("2d");

    // Clear the canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // For each captured image (stored as ImageData), create an offscreen canvas,
    // put the ImageData on it, then use drawImage to scale it to thumbnail size.
    images.forEach((imageData, index) => {
      const offscreen = document.createElement("canvas");
      offscreen.width = imageData.width;
      offscreen.height = imageData.height;
      const offCtx = offscreen.getContext("2d");
      offCtx.putImageData(imageData, 0, 0);

      const col = index % cols;
      const row = Math.floor(index / cols);
      ctx.drawImage(
        offscreen,
        0,
        0,
        imageData.width,
        imageData.height,
        col * THUMB_WIDTH,
        row * THUMB_HEIGHT,
        THUMB_WIDTH,
        THUMB_HEIGHT,
      );
    });
  }, [images]);

  return (
    <Box
      sx={{
        height: 462,
        overflowY: "auto",
        border: `1px solid ${grey[300]}`,
        width: "100%",
      }}
    >
      <canvas ref={canvasRef} />
    </Box>
  );
}

export default ImageDisplay;
