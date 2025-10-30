const typingElement = document.getElementById("typing-text");
const texts = [
  "Welcome to BookRun — Your Campus Library Companion!",
  "Track borrowed books with ease.",
  "Organize archives efficiently.",
  "Manage library records anywhere, anytime."
];

let index = 0;
let charIndex = 0;
let delay = 80;

function typeText() {
  if (charIndex < texts[index].length) {
    typingElement.textContent += texts[index].charAt(charIndex);
    charIndex++;
    setTimeout(typeText, delay);
  } else {
    setTimeout(eraseText, 2000);
  }
}

function eraseText() {
  if (charIndex > 0) {
    typingElement.textContent = texts[index].substring(0, charIndex - 1);
    charIndex--;
    setTimeout(eraseText, delay / 2);
  } else {
    index = (index + 1) % texts.length;
    setTimeout(typeText, 1000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(typeText, 1000);
});
