const modelCards = [...document.querySelectorAll('.model-card')];
const colorOptions = [...document.querySelectorAll('.color-option')];
const preview = document.querySelector('#product-preview');
let selectedModel = modelCards[0];
let selectedColor = colorOptions[0];

function updateSummary() {
  document.querySelector('#summary-model').textContent = selectedModel.dataset.model;
  document.querySelector('#summary-color').textContent = selectedColor.dataset.color;
  document.querySelector('#summary-price').textContent = `$${selectedModel.dataset.price}`;
  document.querySelector('#stage-label').textContent = `${selectedColor.dataset.color.toUpperCase()} · ${selectedModel.dataset.model.toUpperCase()}`;
  document.querySelector('#color-name').textContent = selectedColor.dataset.color.toUpperCase();
  preview.className = `product-pebble ${selectedColor.dataset.color.toLowerCase()}-bg`;
}

modelCards.forEach(card => card.addEventListener('click', () => {
  modelCards.forEach(item => item.classList.remove('selected'));
  selectedModel = card; card.classList.add('selected'); updateSummary();
}));
colorOptions.forEach(option => option.addEventListener('click', () => {
  colorOptions.forEach(item => { item.classList.remove('active'); item.setAttribute('aria-pressed', 'false'); });
  selectedColor = option; option.classList.add('active'); option.setAttribute('aria-pressed', 'true'); updateSummary();
}));
document.querySelector('#add-button').addEventListener('click', () => {
  localStorage.setItem('tempo-selection', JSON.stringify({ model: selectedModel.dataset.model, color: selectedColor.dataset.color, price: selectedModel.dataset.price }));
  window.location.href = 'checkout.html';
});
updateSummary();
