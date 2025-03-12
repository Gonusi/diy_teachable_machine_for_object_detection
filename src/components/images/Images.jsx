import React, { useState } from "react";
import {
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Fab,
  Typography,
  Grid2 as Grid,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import ImageInput from "./ImageInput.jsx";
import ImageDisplay from "./ImageDisplay.jsx";
import { downloadZippedImages } from "./downloadZippedImages.js";
import ImageAnnotationTool from "./ImageAnnotationTool.jsx";
import { grey } from "@mui/material/colors";
import { MoreVert } from "@mui/icons-material";
import PanelMenu from "./PanelMenu.jsx";

function Images() {
  // Each panel holds its own state: category name, images, and annotations.
  const [categoryPanels, setCategoryPanels] = useState([
    { id: 1, category: "dog", images: [], annotations: [], expanded: true },
  ]);

  // Update the category name for a panel.
  const handleCategoryChange = (panelId, newCategory) => {
    setCategoryPanels((prev) =>
      prev.map((panel) =>
        panel.id === panelId ? { ...panel, category: newCategory } : panel,
      ),
    );
  };

  // Add an image to the given panel.
  const handleAddImage = (panelId, newImageData) => {
    setCategoryPanels((prev) =>
      prev.map((panel) =>
        panel.id === panelId
          ? { ...panel, images: [...panel.images, newImageData] }
          : panel,
      ),
    );
  };

  // Clear all images from the given panel.
  const handleClearImages = (panelId) => {
    setCategoryPanels((prev) =>
      prev.map((panel) =>
        panel.id === panelId ? { ...panel, images: [] } : panel,
      ),
    );
  };

  // Add an annotation to the given panel.
  const handleAddAnnotation = (panelId, annotation) => {
    setCategoryPanels((prev) =>
      prev.map((panel) =>
        panel.id === panelId
          ? { ...panel, annotations: [...panel.annotations, annotation] }
          : panel,
      ),
    );
  };

  // Clear all annotations from the given panel.
  const handleClearAnnotations = (panelId) => {
    setCategoryPanels((prev) =>
      prev.map((panel) =>
        panel.id === panelId ? { ...panel, annotations: [] } : panel,
      ),
    );
  };

  // Add a new category panel.
  const handleAddPanel = () => {
    const newId =
      categoryPanels.length > 0
        ? Math.max(...categoryPanels.map((p) => p.id)) + 1
        : 1;
    setCategoryPanels((prev) => [
      ...prev,
      { id: newId, category: "", images: [], annotations: [] },
    ]);
  };

  const togglePanel = (panelId) => {
    console.log("togglePanel", panelId);
    setCategoryPanels((prev) =>
      prev.map((panel) =>
        panel.id === panelId ? { ...panel, expanded: !panel.expanded } : panel,
      ),
    );
  };

  return (
    <Box>
      {/* Category Workflows */}
      <Box>
        {categoryPanels.map((panel) => (
          <Accordion key={panel.id} expanded={panel.expanded} disableGutters>
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon onClick={() => togglePanel(panel.id)} />
              }
              sx={{
                borderBottom: `1px solid ${grey[300]}`,
              }}
            >
              <Box
                container
                spacing={2}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Typography sx={{ fontWeight: "bold", mr: 2 }}>
                  Class:
                </Typography>

                <TextField
                  sx={{ mr: 2 }}
                  value={panel.category}
                  onChange={(e) =>
                    handleCategoryChange(panel.id, e.target.value)
                  }
                  variant="outlined"
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                />

                <PanelMenu
                  onClearImages={() => handleClearImages(panel.id)}
                  onDownloadImages={() => downloadZippedImages(panel.images)}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {/* Image Input and Display for this category */}
              <Box>
                <Grid
                  container
                  spacing={2}
                  sx={{ borderBottom: `1px solid ${grey[300]}`, pb: 2, mb: 2 }}
                >
                  <Grid size={6}>
                    <ImageInput
                      addImage={(img) => handleAddImage(panel.id, img)}
                    />
                  </Grid>
                  <Grid size={6}>
                    <ImageDisplay images={panel.images} />
                  </Grid>
                </Grid>
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
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={handleAddPanel}
      >
        +
      </Fab>
    </Box>
  );
}

export default Images;
