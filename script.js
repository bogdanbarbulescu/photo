// Select modal elements
const images = document.querySelectorAll('.gallery img');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const captionText = document.getElementById('caption');
const closeBtn = document.querySelector('.close');
let currentIndex = 0;

// Open modal on image click
images.forEach((img, index) => {
  img.addEventListener('click', () => {
    modal.style.display = 'block';
    modalImg.src = img.src;
    captionText.innerHTML = img.alt || "Image";
    currentIndex = index; // Set the current index
  });
});

// Close modal when clicking the close button
closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Close modal when clicking outside the image
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Keyboard navigation for images
document.addEventListener('keydown', (e) => {
  if (modal.style.display === 'block') {
    if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % images.length; // Next image
      updateModalContent();
    } else if (e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + images.length) % images.length; // Previous image
      updateModalContent();
    } else if (e.key === 'Escape') {
      modal.style.display = 'none'; // Close modal
    }
  }
});

// Update modal content for navigation
function updateModalContent() {
  modalImg.src = images[currentIndex].src;
  captionText.innerHTML = images[currentIndex].alt || "Image";
}

// Swipe functionality for touch devices
let touchStartX = 0;
let touchEndX = 0;

modal.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

modal.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipeGesture();
});

function handleSwipeGesture() {
  if (touchEndX < touchStartX) {
    // Swipe left
    currentIndex = (currentIndex + 1) % images.length;
    updateModalContent();
  } else if (touchEndX > touchStartX) {
    // Swipe right
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateModalContent();
  }
}
