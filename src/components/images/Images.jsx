import React, { useState } from 'react';
import {
    Box,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    Fab,
    Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import ImageInput from "./ImageInput.jsx";
import ImageDisplay from "./ImageDisplay.jsx";
import { downloadZippedImages } from "./downloadZippedImages.js";
import ImageAnnotationTool from "./ImageAnnotationTool.jsx";

function Images() {
    // Each panel holds its own state: category name, images, and annotations.
    const [categoryPanels, setCategoryPanels] = useState([
        { id: 1, category: 'dog', images: [], annotations: [] }
    ]);

    // Update the category name for a panel.
    const handleCategoryChange = (panelId, newCategory) => {
        setCategoryPanels(prev =>
            prev.map(panel =>
                panel.id === panelId ? { ...panel, category: newCategory } : panel
            )
        );
    };

    // Add an image to the given panel.
    const handleAddImage = (panelId, newImageData) => {
        setCategoryPanels(prev =>
            prev.map(panel =>
                panel.id === panelId
                    ? { ...panel, images: [...panel.images, newImageData] }
                    : panel
            )
        );
    };

    // Clear all images from the given panel.
    const handleClearImages = (panelId) => {
        setCategoryPanels(prev =>
            prev.map(panel =>
                panel.id === panelId ? { ...panel, images: [] } : panel
            )
        );
    };

    // Add an annotation to the given panel.
    const handleAddAnnotation = (panelId, annotation) => {
        setCategoryPanels(prev =>
            prev.map(panel =>
                panel.id === panelId
                    ? { ...panel, annotations: [...panel.annotations, annotation] }
                    : panel
            )
        );
    };

    // Clear all annotations from the given panel.
    const handleClearAnnotations = (panelId) => {
        setCategoryPanels(prev =>
            prev.map(panel =>
                panel.id === panelId ? { ...panel, annotations: [] } : panel
            )
        );
    };

    // Add a new category panel.
    const handleAddPanel = () => {
        const newId =
            categoryPanels.length > 0
                ? Math.max(...categoryPanels.map(p => p.id)) + 1
                : 1;
        setCategoryPanels(prev => [
            ...prev,
            { id: newId, category: 'new category', images: [], annotations: [] }
        ]);
    };

    return (
        <Box sx={{ padding: 2 }}>
            {/* Category Workflows */}
            <Box sx={{ mt: 4 }}>
                {categoryPanels.map((panel) => (
                    <Accordion key={panel.id} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    width: '100%'
                                }}
                            >
                                <Typography variant="h6">Category:</Typography>
                                <TextField
                                    value={panel.category}
                                    onChange={(e) =>
                                        handleCategoryChange(panel.id, e.target.value)
                                    }
                                    variant="outlined"
                                    size="small"
                                    onClick={(e) => e.stopPropagation()}
                                    onFocus={(e) => e.stopPropagation()}
                                />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            {/* Image Input and Display for this category */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2
                                }}
                            >
                                <ImageInput addImage={(img) => handleAddImage(panel.id, img)} />
                                <ImageDisplay images={panel.images} />
                                <Box>
                                    <Button
                                        sx={{ mr: 2 }}
                                        variant="outlined"
                                        onClick={() => handleClearImages(panel.id)}
                                    >
                                        Clear Images
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => downloadZippedImages(panel.images)}
                                    >
                                        Download Images
                                    </Button>
                                </Box>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <ImageAnnotationTool
                                    annotations={panel.annotations}
                                    images={panel.images}
                                    category={panel.category}
                                    onAddAnnotation={(annotation) =>
                                        handleAddAnnotation(panel.id, annotation)
                                    }
                                    onDeleteAnnotation={() => handleClearAnnotations(panel.id)}
                                />
                            </Box>
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


