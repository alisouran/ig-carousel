document
  .getElementById("imageUpload")
  .addEventListener("change", handleImageUpload);
const zip = new JSZip();

function handleImageUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => processImage(img);
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  zip.folder("images").forEach((relativePath, file) => {
    zip.remove(relativePath);
  });
}

function processImage(img) {
  let segmentHeight = img.height;
  let numSegments = Math.ceil(img.width / segmentHeight);

  if (numSegments > 8) {
    const scaleFactor = 8 / numSegments;
    segmentHeight = Math.round(segmentHeight * scaleFactor);
    numSegments = 8;

    // Create a new canvas with the resized image
    const resizedCanvas = document.createElement("canvas");
    const resizedCtx = resizedCanvas.getContext("2d");
    resizedCanvas.width = segmentHeight * 8;
    resizedCanvas.height = segmentHeight;

    // Fill background
    resizedCtx.fillStyle = "#fffbf5";
    resizedCtx.fillRect(0, 0, resizedCanvas.width, resizedCanvas.height);

    // Draw the resized image
    resizedCtx.drawImage(img, 0, 0, resizedCanvas.width, resizedCanvas.height);
    img = resizedCanvas;
  }

  for (let i = 0; i < numSegments; i++) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = segmentHeight;
    canvas.height = segmentHeight;

    ctx.drawImage(img, -i * segmentHeight, 0, img.width, img.height);

    displaySegment(canvas, i);
  }

  // Add a download all button
  const downloadAllButton = document.createElement("button");
  downloadAllButton.innerText = "Download All as ZIP";
  downloadAllButton.addEventListener("click", downloadAll);
  document.body.appendChild(downloadAllButton);
}

function displaySegment(canvas, index) {
  const segmentsContainer = document.getElementById("segments");
  const segmentImg = new Image();
  segmentImg.src = canvas.toDataURL("image/png");
  segmentImg.classList.add("segment");

  segmentsContainer.appendChild(segmentImg);

  canvas.toBlob(function (blob) {
    zip.file(`segment_${index + 1}.png`, blob);
  });
}

function downloadAll() {
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, "instagram_segments.zip");
  });
}
