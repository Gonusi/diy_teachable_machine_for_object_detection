import React from "react";
import { Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { grey } from "@mui/material/colors";
import { THUMB_WIDTH, THUMB_HEIGHT } from "./constants";

function ImageDisplay({ images, imageClick, deleteImageClick }) {
  return (
    <Box
      sx={{
        height: 462,
        overflowY: "auto",
        border: `1px solid ${grey[300]}`,
        width: "100%",
      }}
    >
      <Box
        component="ul"
        sx={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {images.map((imageData, index) => (
          <Box
            component="li"
            key={index}
            sx={{
              position: "relative",
              margin: 1,
              // On hover, reveal the delete icon
              "&:hover .delete-icon": {
                display: "block",
              },
            }}
          >
            <canvas
              width={THUMB_WIDTH}
              height={THUMB_HEIGHT}
              style={{ display: "block", cursor: "pointer" }}
              ref={(canvas) => {
                if (canvas) {
                  // Create an offscreen canvas to draw the full image data,
                  // then draw a scaled version on the thumbnail canvas.
                  const offscreen = document.createElement("canvas");
                  offscreen.width = imageData.width;
                  offscreen.height = imageData.height;
                  const offCtx = offscreen.getContext("2d");
                  offCtx.putImageData(imageData, 0, 0);
                  const ctx = canvas.getContext("2d");
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(
                    offscreen,
                    0,
                    0,
                    imageData.width,
                    imageData.height,
                    0,
                    0,
                    THUMB_WIDTH,
                    THUMB_HEIGHT,
                  );
                }
              }}
              onClick={() => imageClick(imageData)}
            />
            <Box
              className="delete-icon"
              sx={{
                display: "none",
                position: "absolute",
                top: 0,
                right: 0,
                cursor: "pointer",
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "50%",
              }}
              onClick={(e) => {
                // Prevent triggering the imageClick when clicking on delete icon.
                e.stopPropagation();
                deleteImageClick(imageData);
              }}
            >
              <DeleteIcon fontSize="small" />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default ImageDisplay;
