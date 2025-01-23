
const images = document.querySelectorAll('.gallery img');
const lightbox = document.querySelector('.lightbox');

images.forEach(image => {
  image.addEventListener('click', () => {
    lightbox.style.display = 'block';
    lightbox.src = image.src;
  });
});

lightbox.addEventListener('click', () => {
  lightbox.style.display = 'none';
});
