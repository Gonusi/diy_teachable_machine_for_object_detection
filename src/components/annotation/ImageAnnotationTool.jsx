import React, { useState, useRef, useEffect } from 'react';
import { VIDEO_WIDTH, VIDEO_HEIGHT } from './constants';
import { saveAs } from 'file-saver';

const CONTROL_RADIUS = 10; // Radius for control point circles

const ImageAnnotationTool = ({ images, category }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // annotations: { [imageIndex]: [ { x, y, width, height }, ... ] }
    const [annotations, setAnnotations] = useState({});
    // For drawing a new bounding box
    const [drawing, setDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState(null);
    const [currentBox, setCurrentBox] = useState(null);
    // For editing an existing box
    // editing: { boxIndex, corner } where corner is 'topLeft' or 'bottomRight'
    const [editing, setEditing] = useState(null);

    const canvasRef = useRef(null);
    const currentImage = images[currentIndex];

    // Helper: get mouse position relative to the canvas
    const getMousePos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    // Helper: check if mouse is within a circle of given center and radius
    const isNearControlPoint = (mouseX, mouseY, pointX, pointY, radius) => {
        const dx = mouseX - pointX;
        const dy = mouseY - pointY;
        return dx * dx + dy * dy <= radius * radius;
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'n' || e.key === 'N') {
                handleNext();
            } else if (e.key === 'p' || e.key === 'P') {
                handlePrevious();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentIndex, images.length]);

    // Redraw canvas when image, annotations, or current drawing box changes
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

        // Draw the current image (assuming it's an ImageData object)
        if (currentImage) {
            ctx.putImageData(currentImage, 0, 0);
        }

        // Draw existing bounding boxes with control points
        (annotations[currentIndex] || []).forEach((box) => {
            // Draw the bounding box
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            // Draw top-left control point
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.arc(box.x, box.y, CONTROL_RADIUS, 0, 2 * Math.PI);
            ctx.fill();

            // Draw bottom-right control point
            ctx.beginPath();
            ctx.arc(box.x + box.width, box.y + box.height, CONTROL_RADIUS, 0, 2 * Math.PI);
            ctx.fill();
        });

        // If drawing a new bounding box, show it in a different color
        if (currentBox) {
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
        }
    }, [currentImage, annotations, currentBox, currentIndex]);

    // Mouse down: check if we're starting to edit an existing box or drawing a new one
    const handleMouseDown = (e) => {
        const pos = getMousePos(e);
        const boxes = annotations[currentIndex] || [];

        // Check if the click is on a control point for any box
        for (let i = 0; i < boxes.length; i++) {
            const box = boxes[i];
            const topLeft = { x: box.x, y: box.y };
            const bottomRight = { x: box.x + box.width, y: box.y + box.height };
            if (isNearControlPoint(pos.x, pos.y, topLeft.x, topLeft.y, CONTROL_RADIUS)) {
                setEditing({ boxIndex: i, corner: 'topLeft' });
                return;
            }
            if (isNearControlPoint(pos.x, pos.y, bottomRight.x, bottomRight.y, CONTROL_RADIUS)) {
                setEditing({ boxIndex: i, corner: 'bottomRight' });
                return;
            }
        }
        // Otherwise, start drawing a new box
        setStartPoint(pos);
        setDrawing(true);
    };

    const handleMouseMove = (e) => {
        const pos = getMousePos(e);

        // If editing an existing box
        if (editing !== null) {
            setAnnotations((prev) => {
                const boxes = prev[currentIndex] ? [...prev[currentIndex]] : [];
                const box = { ...boxes[editing.boxIndex] };
                // Compute the fixed corner of the box
                const fixedPoint =
                    editing.corner === 'topLeft'
                        ? { x: box.x + box.width, y: box.y + box.height }
                        : { x: box.x, y: box.y };

                if (editing.corner === 'topLeft') {
                    // Update top-left point and adjust width/height accordingly
                    box.x = pos.x;
                    box.y = pos.y;
                    box.width = fixedPoint.x - pos.x;
                    box.height = fixedPoint.y - pos.y;
                } else if (editing.corner === 'bottomRight') {
                    // Update bottom-right point; top-left stays fixed
                    box.width = pos.x - fixedPoint.x;
                    box.height = pos.y - fixedPoint.y;
                }
                boxes[editing.boxIndex] = box;
                return { ...prev, [currentIndex]: boxes };
            });
            return;
        }

        // If drawing a new bounding box
        if (drawing && startPoint) {
            const width = pos.x - startPoint.x;
            const height = pos.y - startPoint.y;
            setCurrentBox({ x: startPoint.x, y: startPoint.y, width, height });
        }
    };

    const handleMouseUp = () => {
        if (editing !== null) {
            setEditing(null);
            return;
        }
        if (drawing) {
            if (currentBox) {
                setAnnotations((prev) => {
                    const newBoxes = prev[currentIndex] ? [...prev[currentIndex], currentBox] : [currentBox];
                    return { ...prev, [currentIndex]: newBoxes };
                });
            }
            setDrawing(false);
            setCurrentBox(null);
            setStartPoint(null);
        }
    };

    // Navigation: go to previous image
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    // Navigation: go to next image
    const handleNext = () => {
        if (currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    // Clear all annotations for the current image
    const handleClear = () => {
        setAnnotations((prev) => ({ ...prev, [currentIndex]: [] }));
    };

    // Generate COCO JSON and download it using file-saver
    const handleDownloadCOCO = () => {
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

        let annotationId = 1;
        const cocoAnnotations = [];
        Object.keys(annotations).forEach((imgIdx) => {
            const boxes = annotations[imgIdx];
            boxes.forEach((box) => {
                // Ensure x and y represent the top-left corner
                let x = box.x;
                let y = box.y;
                let width = box.width;
                let height = box.height;
                if (width < 0) {
                    x = box.x + box.width;
                    width = Math.abs(width);
                }
                if (height < 0) {
                    y = box.y + box.height;
                    height = Math.abs(height);
                }
                cocoAnnotations.push({
                    id: annotationId++,
                    image_id: parseInt(imgIdx, 10),
                    category_id: 1, // single category
                    bbox: [x, y, width, height],
                    area: width * height,
                    segmentation: [],
                    iscrowd: 0
                });
            });
        });

        const cocoCategories = [
            {
                id: 1,
                name: category,
                supercategory: "none"
            }
        ];

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

        const blob = new Blob([JSON.stringify(cocoJSON, null, 2)], { type: 'application/json;charset=utf-8' });
        saveAs(blob, 'annotations.json');
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
                <button onClick={handleClear}>Clear bounding box</button>
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