import { IconButton, Menu, MenuItem } from "@mui/material";
import React from "react";
import { MoreVert } from "@mui/icons-material";

function PanelMenu({ onClearImages, onDownloadImages, panel }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => onClearImages(panel.id)}>
          Clear all images for this class
        </MenuItem>
        <MenuItem onClick={onDownloadImages}>
          Download images for this class
        </MenuItem>
      </Menu>
    </>
  );
}

export default PanelMenu;
