import React, { useState, useRef, useEffect } from 'react';
import ImageInput from "./ImageInput.jsx";
import ImageDisplay from "./ImageDisplay.jsx";
import {Box, Button} from "@mui/material";
import {downloadZippedImages} from "./downloadZippedImages.js";
import ImageAnnotationTool from "../annotation/ImageAnnotationTool.jsx";

function Images() {
    const [images, setImages] = useState([]);
    const [annotations, setAnnotations] = useState([])

    const handleAddAnnotation = (annotation) => {
        setAnnotations(prevAnnotations => [...prevAnnotations, annotation])
    }

    const handleClearAnnotations = (imageId) => {
        setAnnotations(prevAnnotations => prevAnnotations.filter(annotation => annotation.imageId !== imageId))
    }

    // Append a new ImageData object to the images state
    const addImage = (newImageData) => {
        setImages(prevImages => [...prevImages, newImageData]);
    };

    return (
        <Box sx={{display:'flex', flexDirection:'column', alignItems:'center', gap:2}}>
            <ImageInput addImage={addImage} />
            <ImageDisplay images={images} />

            <Box>
            <Button sx={{mr:2}} variant="outlined" onClick={() => setImages([])}>Clear Images</Button>
            <Button variant="contained" onClick={() => downloadZippedImages(images)}>Download images</Button>
            </Box>

            <br/>
            <br/>

            <ImageAnnotationTool onDeleteAnnotation={handleClearAnnotations} onAddAnnotation={handleAddAnnotation()} images={images} category="dog" />
        </Box>
    );
}



export default Images;