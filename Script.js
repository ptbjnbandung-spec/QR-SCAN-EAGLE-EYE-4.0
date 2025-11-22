// === SETTING ===
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxiPihfW2MDfm01oHu_tNi9x-Iq52GtZTd4wSEtUqRaKREDnI2aHtTJa_VXl34dp2U/exec";

// === Elements ===
const video = document.getElementById("preview");
const lastScan = document.getElementById("lastScan");
const statusText = document.getElementById("statusText");

let scanning = false;
let lastScannedValue = "";
let cooldown = false;

// === Start Camera ===
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then(stream => {
    video.srcObject = stream;
    video.play();
    requestAnimationFrame(scanLoop);
  })
  .catch(err => {
    statusText.innerText = "Camera Error!";
    console.error(err);
  });

// === QR Scan Loop ===
function scanLoop() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(img.data, img.width, img.height);

    if (code && !cooldown) {
      handleScan(code.data);
    }
  }
  requestAnimationFrame(scanLoop);
}

// === Handle Found QR ===
function handleScan(value) {
  cooldown = true;
  setTimeout(() => cooldown = false, 2000);

  lastScan.innerText = value;
  statusText.innerText = "Sending...";

  sendToSheet(value);
}

// === Send to Google Sheet ===
function sendToSheet(qrValue) {
  fetch(WEBAPP_URL + "?qr=" + encodeURIComponent(qrValue))
    .then(res => res.text())
    .then(result => {
      statusText.innerText = "Success ✔";
      console.log("Sheet Response:", result);
    })
    .catch(err => {
      statusText.innerText = "Error Sending!";
      console.error("Error:", err);
    });
}
