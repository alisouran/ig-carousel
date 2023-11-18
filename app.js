document
  .getElementById("imageUpload")
  .addEventListener("change", handleImageUpload);
const zip = new JSZip();
let cropper;

function handleImageUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  const uploadImage = document.getElementById("imageUpload");
  if (uploadImage) {
    uploadImage.classList.add("hidden");
  }
  reader.onload = (e) => {
    // Initialize Cropper
    const img = new Image();
    img.onload = () => {
      let croppingContainer = document.getElementById("croppingContainer");
      croppingContainer.innerHTML = `<img src="${e.target.result}" id="imageToCrop">`;
      cropper = new Croppie(document.getElementById("imageToCrop"), {
        viewport: {
          width: img.width / 1.7,
          height: img.height / 1.7,
        },
        boundary: {
          width: img.width / 1.7 + 100,
          height: img.height / 1.7 + 100,
        },
        enableResize: true, // Allow resizing of the viewport
        enableOrientation: true,
        enableZoom: true,
        mouseWheelZoom: true,
        showZoomer: true,
      });
      document.getElementById("cropButton").style.display = "block";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  zip.folder("images").forEach((relativePath, file) => {
    zip.remove(relativePath);
  });
}

document.getElementById("cropButton").addEventListener("click", function () {
  cropper
    .result({ type: "canvas", size: "original" })
    .then(function (croppedImg) {
      const img = new Image();
      img.onload = () => processImage(img);
      img.src = croppedImg;
      document.getElementById("cropButton").style.display = "none";
    });
});

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

    if (i === numSegments - 1 && img.width % segmentHeight !== 0) {
      ctx.fillStyle = "#fffbf5";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, -i * segmentHeight, 0, img.width, img.height);
    } else {
      ctx.drawImage(img, -i * segmentHeight, 0, img.width, img.height);
    }

    displaySegment(canvas, i);
  }

  // Add a download all button
  const buttonContainer = document.getElementById("button-container");
  let croppingContainer = document.getElementById("croppingContainer");
  const downloadAllButton = document.createElement("button");
  downloadAllButton.classList.add(
    "bg-blue-500",
    "hover:bg-blue-700",
    "text-white",
    "font-bold",
    "py-2",
    "px-4",
    "rounded",
    "transition",
    "duration-300",
    "ease-in-out"
  );
  downloadAllButton.innerText = "Download All as ZIP";
  downloadAllButton.addEventListener("click", downloadAll);
  buttonContainer.appendChild(downloadAllButton);
  croppingContainer.innerHTML = `<h1 class="text-2xl font-bold text-center mb-4">Instagram Carousel Cutter</h1><p class="text-center text-gray-700 mb-4">Effortlessly craft seamless carousel segments for your Instagram posts.</p>`;
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
