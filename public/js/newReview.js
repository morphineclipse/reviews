const submitBtn = document.getElementById("submit-btn")
const prosTextarea = document.querySelectorAll('.form-textarea')[0];
const consTextarea = document.querySelectorAll('.form-textarea')[1];
const ratingInputs = document.querySelectorAll('input[name="rating"]');

function addCharCounters() {
  if (prosTextarea && !document.querySelector('.pros-counter')) {
    const prosCounter = document.createElement('div');
    prosCounter.className = 'char-counter pros-counter';
    prosCounter.style.cssText = 'font-size: 12px; color: #666; margin-top: 5px; text-align: right;';
    prosCounter.textContent = '0/75';
    prosTextarea.parentNode.appendChild(prosCounter);
    
    const consCounter = document.createElement('div');
    consCounter.className = 'char-counter cons-counter';
    consCounter.style.cssText = 'font-size: 12px; color: #666; margin-top: 5px; text-align: right;';
    consCounter.textContent = '0/75';
    consTextarea.parentNode.appendChild(consCounter);
  }
}

function updateCounters() {
  const prosCounter = document.querySelector('.pros-counter');
  const consCounter = document.querySelector('.cons-counter');
  
  if (prosCounter && prosTextarea) {
    prosCounter.textContent = `${prosTextarea.value.length}/75`;
    prosCounter.style.color = prosTextarea.value.length === 75 ? '#f00' : '#666';
  }
  
  if (consCounter && consTextarea) {
    consCounter.textContent = `${consTextarea.value.length}/75`;
    consCounter.style.color = consTextarea.value.length === 75 ? '#f00' : '#666';
  }
}

function getSelectedRating() {
  let rating = null;
  ratingInputs.forEach(input => {
    if (input.checked) {
      rating = input.value;
    }
  });
  return rating;
}

function validateForm() {
  const errors = [];
  
  const companySelect = document.getElementById('company')
    if (companySelect.value === 'all') {
        errors.push('Пожалуйста, выберите компанию');
    }
  
  if (!getSelectedRating()) {
    errors.push('Пожалуйста, поставьте оценку');
  }
  
  if (!prosTextarea || !prosTextarea.value.trim()) {
    errors.push('Пожалуйста, заполните поле "Достоинства"');
  } else if (prosTextarea.value.length > 75) {
    errors.push('Достоинства не должны превышать 75 символов');
  }
  
  if (!consTextarea || !consTextarea.value.trim()) {
    errors.push('Пожалуйста, заполните поле "Недостатки"');
  } else if (consTextarea.value.length > 75) {
    errors.push('Недостатки не должны превышать 75 символов');
  }
  
  return errors;
}

function showErrors(errors) {
  const existingErrors = document.querySelectorAll('.form-error');
  existingErrors.forEach(error => error.remove());
  
  const modalBody = document.querySelector('.modal-body');
  if (modalBody && errors.length > 0) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.style.cssText = `
      background: #fee;
      color: #c00;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 15px;
      font-size: 14px;
    `;
    errorDiv.innerHTML = errors.map(err => `<div>• ${err}</div>`).join('');
    
    modalBody.insertBefore(errorDiv, modalBody.firstChild);
    
    setTimeout(() => {
      if (errorDiv && errorDiv.remove) {
        errorDiv.remove();
      }
    }, 5000);
  }
}

function showSuccess(message) {
  const notification = document.createElement('div');
  notification.className = 'success-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4caf50;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 10000;
    font-size: 14px;
    animation: slideIn 0.3s ease;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification && notification.remove) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

async function submitReview() {
    const errors = validateForm();
  if (errors.length > 0) {
    showErrors(errors);
    return;
  }
  const companySelect = document.getElementById("company")
  const reviewData = {
    company: companySelect.value,
    rating: parseInt(getSelectedRating()),
    pros: prosTextarea ? prosTextarea.value.trim() : '',
    cons: consTextarea ? consTextarea.value.trim() : ''
  };
  
  const token = localStorage.getItem('token');
  
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Отправка...';
  submitBtn.disabled = true;
  
  try {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Token": `${token}`
      },
      body: JSON.stringify(reviewData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showSuccess('Отзыв успешно добавлен!');
      
      if (prosTextarea) prosTextarea.value = '';
      if (consTextarea) consTextarea.value = '';
      ratingInputs.forEach(input => input.checked = false);
      if (companySelect) companySelect.value = '';
      updateCounters();
      
      
      if (typeof loadReviews === 'function') {
        setTimeout(() => loadReviews(), 1500);
      } else if (typeof window.loadReviews === 'function') {
        setTimeout(() => window.loadReviews(), 1500);
      } else {
        setTimeout(() => location.reload(), 1500);
      }
      
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

function limitTextLength(e) {
  if (e.target.value.length > 75) {
    e.target.value = e.target.value.slice(0, 75);
  }
  updateCounters();
}

function addStyles() {
  if (!document.querySelector('#review-styles')) {
    const style = document.createElement('style');
    style.id = 'review-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      .char-counter {
        font-size: 12px;
        color: #666;
        margin-top: 5px;
        text-align: right;
      }
      
      .form-error {
        animation: slideIn 0.3s ease;
      }
      
      .success-notification {
        animation: slideIn 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  }
}

function init() {
  addStyles();
  addCharCounters();
  
  if (submitBtn) {
    submitBtn.addEventListener('click', submitReview);
  }
  
  if (prosTextarea) {
    prosTextarea.addEventListener('input', limitTextLength);
  }
  
  if (consTextarea) {
    consTextarea.addEventListener('input', limitTextLength);
  }
  
  updateCounters();
}

init()
