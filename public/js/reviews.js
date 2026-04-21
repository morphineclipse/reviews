const reviewsGrid = document.querySelector('.reviews-grid');
const companySelect = document.querySelector('.company-select');
const   searchBtn = document.querySelector('.search-btn');
const addReviewBtn = document.querySelector('.add-review-btn');
const modalOverlay = document.querySelector('.modal-overlay');
const modalClose = document.querySelector('.modal-close');

async function loadReviews(company = 'all') {
    try {
        reviewsGrid.innerHTML = '<div class="loading">Загрузка отзывов...</div>';
        
        const url = company === 'all' 
            ? `/api/getreviews` 
            : `/api/reviews/${company}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            renderReviews(data.reviews);
        } else {
            reviewsGrid.innerHTML = '<div class="error">Ошибка загрузки отзывов</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        reviewsGrid.innerHTML = '<div class="error">Ошибка сервера</div>';
    }
}

function renderReviews(reviews) {
    if (!reviews || reviews.length === 0) {
        reviewsGrid.innerHTML = '<div class="no-reviews">Пока нет отзывов</div>';
        return;
    }
    
    const reviewsHtml = reviews.map(review => `
        <div class="review-card">
            <div class="review-company">${getCompanyName(review.company)}</div>
            <div class="review-stars">
                <div class="rating-display">
                    ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                </div>
            </div>
            <div class="review-user">
                <span class="user-name">${(review.display_name || review.user_name || 'Аноним')}</span>
                ${review.user_city ? `<span class="user-city"> ${(review.user_city)}</span>` : ''}
            </div>
            <br>
            <div class="review-pluses-text">Достоинства</div>
            <div class="review-pluses">${(review.pros)}</div>
            <div class="review-minuses-text">Недостатки</div>
            <div class="review-minuses">${(review.cons)}</div>
            <br>
            <div class="review-date">${formatDate(review.created_at)}</div>
        </div>
    `).join('');
    
    reviewsGrid.innerHTML = reviewsHtml;
}

function getCompanyName(companyCode) {
    const companies = {
        'avito': 'Авито',
        'aliexpress': 'Алиэкспресс',
        'bank': 'БанкКубань',
        'wildberries': 'Вайлдберриз',
        'lamoda': 'Ламода',
        'ozon': 'Озон',
        'sbermegamarket': 'СберМегаМаркет',
        'yandexmarket': 'ЯндексМаркет'
    };
    return companies[companyCode] || companyCode;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

searchBtn?.addEventListener('click', () => {
    const selectedCompany = companySelect?.value || 'all';
    loadReviews(selectedCompany);
});
loadReviews();