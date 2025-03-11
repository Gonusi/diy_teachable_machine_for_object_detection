import React, { useState, useRef, useEffect } from 'react';
import { VIDEO_WIDTH, VIDEO_HEIGHT } from './constants';
import { saveAs } from 'file-saver';

const ImageAnnotationTool = ({ images, category }) => {
    // current image index
    const [currentIndex, setCurrentIndex] = useState(0);
    // annotations: a mapping from image index to an array of bounding boxes
    // Each bounding box is stored as an object: { x, y, width, height }
    const [annotations, setAnnotations] = useState({});
    // Track drawing state
    const [drawing, setDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState(null);
    const [currentBox, setCurrentBox] = useState(null);

    const canvasRef = useRef(null);
    const currentImage = images[currentIndex];

    // Redraw canvas when image or annotations change
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // Clear the canvas
        ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

        // Draw the current image using putImageData
        // (Assumes that currentImage is an ImageData object)
        if (currentImage) {
            ctx.putImageData(currentImage, 0, 0);
        }

        // Draw saved bounding boxes for the current image
        (annotations[currentIndex] || []).forEach((box) => {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
        });

        // If user is drawing a new box, draw it in a different color
        if (currentBox) {
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
        }
    }, [currentImage, annotations, currentBox, currentIndex]);

    // Mouse down: start drawing and record starting point
    const handleMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;
        setStartPoint({ x: startX, y: startY });
        setDrawing(true);
    };

    // Mouse move: update the current bounding box
    const handleMouseMove = (e) => {
        if (!drawing || !startPoint) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const x = startPoint.x;
        const y = startPoint.y;
        const width = currentX - startPoint.x;
        const height = currentY - startPoint.y;
        setCurrentBox({ x, y, width, height });
    };

    // Mouse up: finish drawing and store the bounding box
    const handleMouseUp = () => {
        if (!drawing) return;
        setDrawing(false);
        if (currentBox) {
            setAnnotations((prev) => {
                const newBoxes = prev[currentIndex] ? [...prev[currentIndex], currentBox] : [currentBox];
                return { ...prev, [currentIndex]: newBoxes };
            });
        }
        setCurrentBox(null);
        setStartPoint(null);
    };

    // Navigation handlers
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prevIndex) => prevIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < images.length - 1) {
            setCurrentIndex((prevIndex) => prevIndex + 1);
        }
    };

    // Generate and download COCO JSON
    const handleDownloadCOCO = () => {
        // Build the COCO "images" array
        const cocoImages = images.map((_, idx) => ({
            id: idx,
            file_name: `${idx}.png`,
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT,
            date_captured: new Date().toISOString(),
            license: 1,
            coco_url: "",
            flickr_url: ""
        }));

        // Build the COCO "annotations" array
        let annotationId = 1;
        const cocoAnnotations = [];
        Object.keys(annotations).forEach((imgIdx) => {
            const boxes = annotations[imgIdx];
            boxes.forEach((box) => {
                // Ensure width and height are positive values
                const absWidth = Math.abs(box.width);
                const absHeight = Math.abs(box.height);
                cocoAnnotations.push({
                    id: annotationId++,
                    image_id: parseInt(imgIdx, 10),
                    category_id: 1, // Only one category is used
                    bbox: [box.x, box.y, absWidth, absHeight],
                    area: absWidth * absHeight,
                    segmentation: [],
                    iscrowd: 0
                });
            });
        });

        // Build the COCO "categories" array (using the provided category)
        const cocoCategories = [
            {
                id: 1,
                name: category,
                supercategory: "none"
            }
        ];

        // Assemble the full COCO JSON structure
        const cocoJSON = {
            info: {
                description: "COCO Annotation Dataset",
                version: "1.0",
                year: new Date().getFullYear(),
                contributor: "",
                date_created: new Date().toISOString()
            },
            licenses: [
                {
                    id: 1,
                    name: "Unknown",
                    url: ""
                }
            ],
            images: cocoImages,
            annotations: cocoAnnotations,
            categories: cocoCategories
        };

        // Create a blob and trigger a download using file-saver
        const blob = new Blob([JSON.stringify(cocoJSON, null, 2)], { type: "application/json;charset=utf-8" });
        saveAs(blob, "annotations.json");
    };

    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                <button onClick={handlePrevious} disabled={currentIndex === 0}>
                    Previous
                </button>
                <button onClick={handleNext} disabled={currentIndex === images.length - 1}>
                    Next
                </button>
            </div>
            <canvas
                ref={canvasRef}
                width={VIDEO_WIDTH}
                height={VIDEO_HEIGHT}
                style={{ border: '1px solid #000', cursor: 'crosshair' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            ></canvas>
            <div style={{ marginTop: '10px' }}>
                <button onClick={handleDownloadCOCO}>Download COCO</button>
            </div>
        </div>
    );
};

export default ImageAnnotationTool;