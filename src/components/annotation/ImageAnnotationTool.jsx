import React, { useState, useRef, useEffect } from 'react';
import { VIDEO_WIDTH, VIDEO_HEIGHT } from './constants';

const CONTROL_RADIUS = 10; // Radius for control point circles

/**
 * AnnotationTool
 * Props:
 * - images: Array of image objects (assumed to be ImageData)
 * - annotations: Object mapping image indices to an array of bounding boxes
 * - onAddAnnotation: function(imageIndex, box) => void
 * - onDeleteAnnotation: function(imageIndex) => void (e.g. to clear annotations for an image)
 */
const AnnotationTool = ({ images, annotations, onAddAnnotation, onDeleteAnnotation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Local state for drawing (and editing) new boxes.
    const [drawing, setDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState(null);
    const [currentBox, setCurrentBox] = useState(null);
    const [editing, setEditing] = useState(null);
    const canvasRef = useRef(null);
    const currentImage = images[currentIndex];

    // Helper: Get mouse position relative to the canvas.
    const getMousePos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    // Helper: Check if the mouse is near a control point.
    const isNearControlPoint = (mouseX, mouseY, pointX, pointY, radius) => {
        const dx = mouseX - pointX;
        const dy = mouseY - pointY;
        return dx * dx + dy * dy <= radius * radius;
    };

    // Keyboard navigation (n for next, p for previous)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key.toLowerCase() === 'n') {
                handleNext();
            } else if (e.key.toLowerCase() === 'p') {
                handlePrevious();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, images.length]);

    // Redraw canvas whenever the image, annotations, or drawing state changes.
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

        if (currentImage) {
            ctx.putImageData(currentImage, 0, 0);
        }

        // Draw existing bounding boxes from parent's annotations.
        (annotations[currentIndex] || []).forEach((box) => {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            // Draw control points
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.arc(box.x, box.y, CONTROL_RADIUS, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(box.x + box.width, box.y + box.height, CONTROL_RADIUS, 0, 2 * Math.PI);
            ctx.fill();
        });

        // If a new box is being drawn, show it.
        if (currentBox) {
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
        }
    }, [currentImage, annotations, currentBox, currentIndex]);

    // Start drawing or editing when the mouse goes down.
    const handleMouseDown = (e) => {
        const pos = getMousePos(e);
        const boxes = annotations[currentIndex] || [];

        // Check if the click is near a control point (for editing)
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
        // Otherwise, start drawing a new bounding box.
        setStartPoint(pos);
        setDrawing(true);
    };

    const handleMouseMove = (e) => {
        const pos = getMousePos(e);
        if (editing !== null) {
            // Optionally implement editing updates here (e.g. call an onUpdateAnnotation callback)
            return;
        }
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
        if (drawing && currentBox) {
            // Call the parent's callback to add a new annotation.
            onAddAnnotation(currentIndex, currentBox);
        }
        setDrawing(false);
        setCurrentBox(null);
        setStartPoint(null);
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    // Clear all annotations for the current image by calling parent's callback.
    const handleClear = () => {
        onDeleteAnnotation(currentIndex);
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
        </div>
    );
};

export default AnnotationTool;