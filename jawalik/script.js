/**
 * Jawalik App - Engine & Logic (Bracket Bypass Without Brackets Output)
 * Author: Wahyudi
 */

// Peta Konversi Konsonan Jawalik
const jawalikMap = {
  // Digraf / 2-karakter (Prioritas Utama)
  "dh": "n",  "n": "dh",
  "ny": "k",  "k": "ny",
  "th": "w",  "w": "th",
  "ng": "l",  "l": "ng",
  // Konsonan Tunggal
  "h": "p",   "p": "h",
  "c": "j",   "j": "c",
  "r": "y",   "y": "r",
  "d": "m",   "m": "d",
  "t": "g",   "g": "t",
  "s": "b",   "b": "s"
};

// Urutan pencocokan kunci (2-karakter harus didahulukan dari 1-karakter)
const sortedKeys = ["dh", "ny", "th", "ng", "h", "p", "c", "j", "r", "y", "k", "d", "m", "t", "g", "s", "b", "w", "l", "n"];

/**
 * Memeriksa apakah karakter bernilai kapital (Uppercase)
 */
function isUpperCase(str) {
  return str === str.toUpperCase() && str !== str.toLowerCase();
}

/**
 * Mengaplikasikan casing (Kapitalisasi) dari asal ke hasil
 */
function applyCapitalization(original, converted) {
  if (original === original.toUpperCase()) {
    return converted.toUpperCase();
  }
  if (isUpperCase(original.charAt(0))) {
    if (converted.length === 1) {
      return converted.toUpperCase();
    }
    // Jika hasil berupa digraf (misal 'ny'), jadikan 'Ny'
    return converted.charAt(0).toUpperCase() + converted.slice(1).toLowerCase();
  }
  return converted.toLowerCase();
}

/**
 * Menerjemahkan bagian teks biasa (di luar kurung siku)
 */
function translateSegment(input) {
  if (!input) return "";

  let result = "";
  let i = 0;

  while (i < input.length) {
    let matched = false;

    // 1. Cek pasangan 2-karakter (digraf)
    if (i + 1 < input.length) {
      const twoChar = input.substr(i, 2);
      const lowerTwo = twoChar.toLowerCase();

      if (sortedKeys.includes(lowerTwo) && lowerTwo.length === 2) {
        const replacement = jawalikMap[lowerTwo];
        result += applyCapitalization(twoChar, replacement);
        i += 2;
        matched = true;
        continue;
      }
    }

    // 2. Cek pasangan 1-karakter
    if (!matched) {
      const oneChar = input.charAt(i);
      const lowerOne = oneChar.toLowerCase();

      if (jawalikMap[lowerOne] && lowerOne.length === 1) {
        const replacement = jawalikMap[lowerOne];
        result += applyCapitalization(oneChar, replacement);
      } else {
        // Karakter lain (vokal, angka, simbol, spasi, emoji, dll) dipertahankan
        result += oneChar;
      }
      i += 1;
    }
  }

  return result;
}

/**
 * Fungsi Utama Transliterasi Jawalik
 * Teks di dalam [...] tidak ditransliterasi dan tanda [...] dihilangkan dari hasil.
 */
function convertJawalik(input) {
  if (!input) return "";

  // Regex memisahkan teks biasa dan teks di dalam kurung siku [...]
  // Contoh: "Aplikasi [Jawa] hebat" => ["Aplikasi ", "[Jawa]", " hebat"]
  const regex = /(\[[^\]]*\])/g;
  const parts = input.split(regex);

  return parts.map(part => {
    // Jika bagian diawali '[' dan diakhiri ']'
    if (part.startsWith('[') && part.endsWith(']')) {
      // Ambil teks di dalam kurung tanpa tanda '[' dan ']'
      return part.slice(1, -1);
    }
    // Jika teks biasa, lakukan transliterasi
    return translateSegment(part);
  }).join('');
}

// Global App State
let isLatinToJawalik = true;
let deferredPrompt = null;

// DOM Elements
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const inputLabel = document.getElementById("inputLabel");
const outputLabel = document.getElementById("outputLabel");
const charCount = document.getElementById("charCount");
const wordCount = document.getElementById("wordCount");
const swapDirectionBtn = document.getElementById("swapDirectionBtn");
const swapContentBtn = document.getElementById("swapContentBtn");
const clearBtn = document.getElementById("clearBtn");
const copyInputBtn = document.getElementById("copyInputBtn");
const copyOutputBtn = document.getElementById("copyOutputBtn");
const pwaInstallBtn = document.getElementById("pwaInstallBtn");

/**
 * Memproses konversi & statistik teks
 */
function processConversion() {
  const text = inputText.value;
  outputText.value = convertJawalik(text);

  // Update statistik
  charCount.textContent = `Karakter: ${text.length}`;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  wordCount.textContent = `Kata: ${words}`;
}

/**
 * Mengubah Arah Translasi (Latin ↔ Jawalik)
 */
function toggleDirection() {
  isLatinToJawalik = !isLatinToJawalik;
  if (isLatinToJawalik) {
    inputLabel.textContent = "Input (Latin)";
    outputLabel.textContent = "Hasil (Jawalik)";
  } else {
    inputLabel.textContent = "Input (Jawalik)";
    outputLabel.textContent = "Hasil (Latin)";
  }
  processConversion();
}

/**
 * Menukar isi Teks Input dan Hasil
 */
function swapContent() {
  const temp = inputText.value;
  inputText.value = outputText.value;
  outputText.value = temp;
  processConversion();
}

/**
 * Menyalin Teks ke Clipboard dengan indikator visual
 */
function copyToClipboard(element, button) {
  if (!element.value) return;

  navigator.clipboard.writeText(element.value).then(() => {
    const originalText = button.textContent;
    button.textContent = "✓ Tersalin";
    button.style.opacity = "0.8";

    setTimeout(() => {
      button.textContent = originalText;
      button.style.opacity = "1";
    }, 2000);
  }).catch(err => {
    console.error("Gagal menyalin: ", err);
  });
}

// Event Listeners
inputText.addEventListener("input", processConversion);
swapDirectionBtn.addEventListener("click", toggleDirection);
swapContentBtn.addEventListener("click", swapContent);

clearBtn.addEventListener("click", () => {
  if (inputText.value.length > 0) {
    inputText.value = "";
    outputText.value = "";
    processConversion();
  }
});

copyInputBtn.addEventListener("click", () => copyToClipboard(inputText, copyInputBtn));
copyOutputBtn.addEventListener("click", () => copyToClipboard(outputText, copyOutputBtn));

// Auto Set Tahun Footer
document.getElementById("year").textContent = new Date().getFullYear();

// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js")
      .then(reg => console.log("Service Worker terdaftar:", reg.scope))
      .catch(err => console.error("Gagal mendaftarkan Service Worker:", err));
  });
}

// PWA Installation Handler
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  pwaInstallBtn.classList.remove("hidden");
});

pwaInstallBtn.addEventListener("click", () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("Pengguna menginstal PWA");
      }
      deferredPrompt = null;
      pwaInstallBtn.classList.add("hidden");
    });
  }
});

window.addEventListener("appinstalled", () => {
  pwaInstallBtn.classList.add("hidden");
  console.log("PWA berhasil terpasang di perangkat");
});
