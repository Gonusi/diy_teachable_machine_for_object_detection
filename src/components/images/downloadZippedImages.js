import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function downloadZippedImages(imageDataArray) {
    const zip = new JSZip();

    // Create an array of promises to process each ImageData
    const promises = imageDataArray.map((imageData, index) => {
        return new Promise((resolve, reject) => {
            // Create a canvas to draw the ImageData
            const canvas = document.createElement("canvas");
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            const ctx = canvas.getContext("2d");
            ctx.putImageData(imageData, 0, 0);

            // Convert the canvas content to a PNG blob
            canvas.toBlob((blob) => {
                if (blob) {
                    // Name each file using its index
                    zip.file(`${index}.png`, blob);
                    resolve();
                } else {
                    reject(new Error("Canvas conversion to blob failed."));
                }
            }, "image/png");
        });
    });

    // Wait for all canvases to be processed
    await Promise.all(promises);

    // Generate the ZIP file as a Blob
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Trigger the download of the ZIP file
    saveAs(zipBlob, "images.zip");
}

// Example usage:
// Assume imageDataArray is an array of ImageData objects
// downloadZippedImages(imageDataArray);