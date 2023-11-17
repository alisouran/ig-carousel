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
  const segmentHeight = img.height; // Height of the original image
  const numSegments = Math.ceil(img.width / segmentHeight);

  for (let i = 0; i < numSegments; i++) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = segmentHeight; // Square segment
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
