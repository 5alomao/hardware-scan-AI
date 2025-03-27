const URL = "./hardware_scan_model/";
let model, webcam, labelWebcamContainer, labelContainerUpload, maxPredictions;

async function loadModel() {
  if (!model) {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
  }
}

async function initWebcam() {
  await loadModel();

  const flip = true;
  webcam = new tmImage.Webcam(200, 200, flip);

  await webcam.setup();
  await webcam.play();

  window.requestAnimationFrame(loop);

  document.getElementById("scan-webcam__content__viewer").innerHTML = "";
  document
    .getElementById("scan-webcam__content__viewer")
    .appendChild(webcam.canvas);

  labelWebcamContainer = document.getElementById(
    "scan-webcam__content__results__labels"
  );
}

async function loop() {
  webcam.update();
  await predict(webcam.canvas, labelWebcamContainer);
  window.requestAnimationFrame(loop);
}

async function predict(imageElement, container) {
  const prediction = await model.predict(imageElement);

  container.innerHTML = "";

  prediction.forEach((p) => {
    const paragraph = document.createElement("p");
    paragraph.innerText = `${p.className}: ${p.probability.toFixed(2)}`;
    paragraph.classList.add("labels__item");
    container.appendChild(paragraph);
  });
}

function openFilePicker() {
  document.getElementById("uploadInput").click();
}

document
  .getElementById("uploadInput")
  .addEventListener("change", async (event) => {
    await loadModel();

    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const image = document.getElementById("uploadedImage");
        image.src = e.target.result;
        image.onload = async () => {
          const labelContainerUpload = document.getElementById(
            "upload-file__content__results__labels"
          );
          await predict(image, labelContainerUpload);
        };
      };
      reader.readAsDataURL(file);
    }
  });
