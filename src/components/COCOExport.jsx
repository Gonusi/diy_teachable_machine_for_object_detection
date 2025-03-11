import React from 'react';
import { VIDEO_WIDTH, VIDEO_HEIGHT } from './constants';
import { saveAs } from 'file-saver';

/**
 * COCOExport
 * Props:
 * - images: Array of image objects
 * - annotations: Object mapping image indices to an array of bounding boxes
 * - category: Category name for the annotations
 */
const COCOExport = ({ images, annotations, category }) => {
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
                // Normalize box so that width/height are positive
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
                    category_id: 1, // assuming single category here; adjust as needed
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
        <div style={{ marginTop: '10px' }}>
            <button onClick={handleDownloadCOCO}>Download COCO</button>
        </div>
    );
};

export default COCOExport;