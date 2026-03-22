const URL = "https://teachablemachine.withgoogle.com/models/Upiyd3gcy/";

let model, webcam, labelContainer, maxPredictions;

async function init() {
  try {
    const result = document.getElementById("result");
    result.textContent = "Loading model...";
    result.className = "loading";

    model = await tmImage.load(URL + "model.json", URL + "metadata.json");
    maxPredictions = model.getTotalClasses();
    result.textContent = "Starting camera...";

    webcam = new tmImage.Webcam(300, 300, true);
    await webcam.setup();
    await webcam.play();

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    document.getElementById("scan-line").classList.add("active");

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";

    for (let i = 0; i < maxPredictions; i++) {
      const row = document.createElement("div");
      row.className = "label-row";
      row.innerHTML =
        "<div class='label-top'>" +
          "<span class='label-name' id='name-" + i + "'>Class " + (i+1) + "</span>" +
          "<span class='label-pct' id='pct-" + i + "'>0%</span>" +
        "</div>" +
        "<div class='bar-track'>" +
          "<div class='bar-fill' id='bar-" + i + "'></div>" +
        "</div>";
      labelContainer.appendChild(row);
    }

    result.textContent = "Detecting...";
    window.requestAnimationFrame(loop);

  } catch (error) {
    const result = document.getElementById("result");
    result.textContent = "ERROR: " + error.message;
    result.className = "error";
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  let winnerName = "";
  let winnerProb = 0;

  for (let i = 0; i < maxPredictions; i++) {
    const name = prediction[i].className;
    const prob = prediction[i].probability;
    const pct  = (prob * 100).toFixed(0);

    document.getElementById("name-" + i).textContent = name;
    document.getElementById("pct-" + i).textContent  = pct + "%";
    document.getElementById("bar-" + i).style.width  = pct + "%";

    if (prob > winnerProb) { winnerProb = prob; winnerName = name; }
  }

  const result = document.getElementById("result");
  result.textContent = winnerName;
  result.className = "";
}
