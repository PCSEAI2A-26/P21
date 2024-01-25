const dropdowns = document.querySelectorAll(".dropdown-container"),
  inputLanguageDropdown = document.querySelector("#input-language"),
  outputLanguageDropdown = document.querySelector("#output-language"),
  speakInputIcon = document.querySelector("#speak-input-icon"),
  speakOutputIcon = document.querySelector("#speak-output-icon"),
  clearSectionBtn = document.querySelector("#clear-section-btn");

function populateDropdown(dropdown, options) {
  dropdown.querySelector("ul").innerHTML = "";
  options.forEach((option) => {
    const li = document.createElement("li");
    const title = option.name + " (" + option.native + ")";
    li.innerHTML = title;
    li.dataset.value = option.code;
    li.classList.add("option");
    dropdown.querySelector("ul").appendChild(li);
  });
}

speakInputIcon.addEventListener("click", () => {
  const inputText = inputTextElem.value;
  speakText(inputText);
});

speakOutputIcon.addEventListener("click", () => {
  const outputText = outputTextElem.value;
  speakText(outputText);
});

function speakText(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);

  // Optional: Set voice language based on the selected language
  const inputLanguageValue = inputLanguageDropdown.querySelector(".selected").dataset.value;
  const voices = synth.getVoices();
  const selectedVoice = voices.find(voice => voice.lang === inputLanguageValue);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  synth.speak(utterance);
}

populateDropdown(inputLanguageDropdown, languages);
populateDropdown(outputLanguageDropdown, languages);

dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", (e) => {
    dropdown.classList.toggle("active");
  });

  dropdown.querySelectorAll(".option").forEach((item) => {
    item.addEventListener("click", (e) => {
      // Remove active class from current dropdowns
      dropdown.querySelectorAll(".option").forEach((item) => {
        item.classList.remove("active");
      });
      item.classList.add("active");
      const selected = dropdown.querySelector(".selected");
      selected.innerHTML = item.innerHTML;
      selected.dataset.value = item.dataset.value;
      translate();
    });
  });
});

document.addEventListener("click", (e) => {
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
});

const swapBtn = document.querySelector(".swap-position"),
  inputLanguageSelected = inputLanguageDropdown.querySelector(".selected"),
  outputLanguageSelected = outputLanguageDropdown.querySelector(".selected"),
  inputTextElem = document.querySelector("#input-text"),
  outputTextElem = document.querySelector("#output-text");

swapBtn.addEventListener("click", (e) => {
  const temp = inputLanguageSelected.innerHTML;
  inputLanguageSelected.innerHTML = outputLanguageSelected.innerHTML;
  outputLanguageSelected.innerHTML = temp;

  const tempValue = inputLanguageSelected.dataset.value;
  inputLanguageSelected.dataset.value = outputLanguageSelected.dataset.value;
  outputLanguageSelected.dataset.value = tempValue;

  // Swap text
  const tempInputText = inputTextElem.value;
  inputTextElem.value = outputTextElem.value;
  outputTextElem.value = tempInputText;

  translate();
});

function translate() {
  const inputText = inputTextElem.value;
  const inputLanguageValue = inputLanguageSelected.dataset.value;
  const outputLanguageValue = outputLanguageSelected.dataset.value;

  // Check if inputText is empty, don't make the translation request
  if (inputText.trim() === "") {
    outputTextElem.value = "";
    return;
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguageValue}&tl=${outputLanguageValue}&dt=t&q=${encodeURI(
    inputText
  )}`;
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      outputTextElem.value = json[0].map((item) => item[0]).join("");
    })
    .catch((error) => {
      console.log(error);
    });
}

inputTextElem.addEventListener("input", (e) => {
  // Limit input to 1000000 characters
  if (inputTextElem.value.length > 1000000) {
    inputTextElem.value = inputTextElem.value.slice(0, 1000000);
  }
  translate();
});

const uploadDocument = document.querySelector("#upload-document"),
  uploadTitle = document.querySelector("#upload-title");

uploadDocument.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (
    file.type === "application/pdf" ||
    file.type === "text/plain" ||
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    uploadTitle.innerHTML = file.name;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      inputTextElem.value = e.target.result;
      translate();
    };
  } else {
    alert("Please upload a valid file");
  }
});

const downloadBtn = document.querySelector("#download-btn");

downloadBtn.addEventListener("click", (e) => {
  const outputText = outputTextElem.value;
  const outputLanguageValue = outputLanguageSelected.dataset.value;
  if (outputText) {
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `translated-to-${outputLanguageValue}.txt`;
    a.href = url;
    a.click();
  }
});

const darkModeCheckbox = document.getElementById("dark-mode-btn");

darkModeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});

const inputChars = document.querySelector("#input-chars");

inputTextElem.addEventListener("input", (e) => {
  inputChars.innerHTML = inputTextElem.value.length;
});

clearSectionBtn.addEventListener("click", () => {
  // Clear input text area
  inputTextElem.value = "";
  // Reset input language to "Auto Detect"
  inputLanguageSelected.innerHTML = "Auto Detect";
  inputLanguageSelected.dataset.value = "auto";
  // Clear output text area
  outputTextElem.value = "";
  // Reset output language to "English"
  outputLanguageSelected.innerHTML = "English";
  outputLanguageSelected.dataset.value = "en";
  // Hide file name in the upload section
  uploadTitle.innerHTML = "Choose File";

  // Trigger translation for the initial state
  translate();
});
