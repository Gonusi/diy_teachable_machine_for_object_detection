import React, { useState, useRef, useEffect } from 'react';
import ImageInput from "./ImageInput.jsx";
import ImageDisplay from "./ImageDisplay.jsx";

function Images() {
    const [images, setImages] = useState([]);

    // Append a new ImageData object to the images state
    const addImage = (newImageData) => {
        setImages(prevImages => [...prevImages, newImageData]);
    };

    return (
        <div>
            <h2>Image Capture and Display (ImageData version)</h2>
            <ImageInput addImage={addImage} />
            <ImageDisplay images={images} />
        </div>
    );
}



export default Images;