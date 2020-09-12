// Global selections and variables
const colorDivs = document.querySelectorAll(".color-indiv");
const generateButton = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const curentHexes = document.querySelectorAll(".color h2");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
let initialColors;

// local storage
let savedPalettes = [];

//
// Event Listeners
//
generateButton.addEventListener("click", randomColors);

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

// UPDATE YUNG ANO TEXT AND COLOR CONTRAST
colorDivs.forEach((slider, index) => {
  slider.addEventListener("change", () => {
    updateTextUI(index);
  });
});

adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    showAdjustmentPanel(index);
  });
});

closeAdjustments.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

lockButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    lockColor(index);
  });
});

//
// Functions
//

// Color generator
function generateHex() {
  // used chroma.js to generate random hex
  const hexColor = chroma.random();
  return hexColor;
}

// Random Color
function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    //   Kinuha pangalan nung h2
    const hexText = div.children[0];
    const randomColor = generateHex();

    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }

    initialColors.push(chroma(randomColor).hex());

    // Add the color to bg of each panel
    div.style.backgroundColor = randomColor;
    // Change laman nung h2
    hexText.innerText = randomColor;
    // check for contrast
    checkTextContrast(randomColor, hexText);

    // Sliders initialize
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });

  // Reset the slider input base sa kung anong color
  resetInputs();
  adjustButton.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockButton[index]);
  });
}

// Changes h2 font kapag maliwanag or dark
function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  //Scale ng saturation slider
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  //Scale ng brightness slider
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  //Update Input Colors
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)} ,${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(255, 0, 0), rgb(255,255 ,0),rgb(0, 255, 0),rgb(0, 255, 255),rgb(0,0,255),rgb(255,0,255),rgb(255,0,0))`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-saturation") ||
    e.target.getAttribute("data-hue");
  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const currentBackgroundColor = initialColors[index];

  let color = chroma(currentBackgroundColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  // Update saturation slider if brightness is changed
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();

  // BAGUHIN ULET CONTRAST
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");

  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = hueValue;
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = brightValue;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-saturation")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = satValue;
    }
  });
}

function showAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}
function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

function lockColor(index) {
  colorDivs[index].classList.toggle("locked");
  lockButton[index].firstChild.classList.toggle(`fa-lock-open`);
  lockButton[index].firstChild.classList.toggle(`fa-lock`);
}

// Save to palette saka local storage
const saveButton = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");

saveButton.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);

function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}

function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.add("remove");
}
randomColors();
