import React, { useState } from 'react';
import { Box, Button, Accordion, AccordionSummary, AccordionDetails, TextField, Fab, Typography } from '@mui/material';

import ImageInput from "./ImageInput.jsx";
import ImageDisplay from "./ImageDisplay.jsx";
import { downloadZippedImages } from "./downloadZippedImages.js";
import ImageAnnotationTool from "./ImageAnnotationTool.jsx";

function Images() {
    // Global images state remains common.
    const [images, setImages] = useState([]);

    // Each panel represents a labeling workflow for one category.
    // Each panel object: { id, category }.
    const [categoryPanels, setCategoryPanels] = useState([{ id: 1, category: 'dog' }]);

    // Maintain annotations separately for each panel, keyed by panel id.
    const [annotations, setAnnotations] = useState({dog: []});

    // Append a new ImageData object to images.
    const addImage = (newImageData) => {
        setImages((prev) => [...prev, newImageData]);
    };

    // Called by a panel’s ImageAnnotationTool when an annotation is added.
    const handleAddAnnotation = (panelId, annotation) => {
        setAnnotations((prev) => ({
            ...prev,
            [panelId]: [...(prev[panelId] || []), annotation],
        }));
    };

    // Clear all annotations for a given panel.
    const handleClearAnnotations = (panelId) => {
        setAnnotations((prev) => ({
            ...prev,
            [panelId]: [],
        }));
    };

    // Update the category name for a panel.
    const handleCategoryChange = (panelId, newCategory) => {
        setCategoryPanels((prev) =>
            prev.map((panel) =>
                panel.id === panelId ? { ...panel, category: newCategory } : panel
            )
        );
    };

    // Add a new panel with a default category.
    const handleAddPanel = () => {
        const newId = categoryPanels.length > 0
            ? Math.max(...categoryPanels.map((p) => p.id)) + 1
            : 1;
        setCategoryPanels((prev) => [...prev, { id: newId, category: 'new category' }]);
    };

    return (
        <Box sx={{ padding: 2 }}>
            {/* Top area: image input, display, and common buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <ImageInput addImage={addImage} />
                <ImageDisplay images={images} />
                <Box>
                    <Button sx={{ mr: 2 }} variant="outlined" onClick={() => setImages([])}>
                        Clear Images
                    </Button>
                    <Button variant="contained" onClick={() => downloadZippedImages(images)}>
                        Download Images
                    </Button>
                </Box>
            </Box>

            {/* Category workflows */}
            <Box sx={{ mt: 4 }}>
                {categoryPanels.map((panel) => (
                    <Accordion key={panel.id} defaultExpanded>
                        <AccordionSummary expandIcon={<Box>Ex</Box>}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                <Typography variant="h6">Category:</Typography>
                                <TextField
                                    value={panel.category}
                                    onChange={(e) => handleCategoryChange(panel.id, e.target.value)}
                                    variant="outlined"
                                    size="small"
                                />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <ImageAnnotationTool
                                annotations={annotations[panel.category]}
                                images={images}
                                category={panel.category}
                                onAddAnnotation={(annotation) =>
                                    handleAddAnnotation(panel.id, annotation)
                                }
                                onDeleteAnnotation={() => handleClearAnnotations(panel.id)}
                            />
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>

            {/* Floating action button to add new category panel */}
            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={handleAddPanel}
            >
                +
            </Fab>
        </Box>
    );
}

export default Images;