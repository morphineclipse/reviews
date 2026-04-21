const companySelect = document.querySelector('.company-select');
const searchBtn = document.querySelector('.search-btn');
const statValues = document.querySelectorAll('.stat-value');

async function loadAndAnalyzeReviews(company = 'all') {
    try {
        showLoading();
        
        const url = company === 'all' 
            ? `/api/getreviews` 
            : `/api/reviews/${company}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success && data.reviews) {
            const stats = calculateStats(data.reviews);
            updateStatsDisplay(stats);
        } else {
            showError('Ошибка загрузки данных');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Ошибка сервера');
    }
}

function calculateStats(reviews) {
    if (!reviews || reviews.length === 0) {
        return {
            totalReviews: 0,
            averageRating: 0,
            averageAge: 0,
            genderRatio: { male: 0, female: 0},
            topCities: [],
            ratingDistribution: {},
        };
    }
    
    const totalReviews = reviews.length;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / totalReviews).toFixed(1);
    
    let ageSum = 0;
    let ageCount = 0;
    reviews.forEach(review => {
        if (review.user_age && review.user_age > 0) {
            ageSum += review.user_age;
            ageCount++;
        }
    });
    const averageAge = ageCount > 0 ? Math.round(ageSum / ageCount) : 0;
    
    let maleCount = 0;
    let femaleCount = 0;
    
    reviews.forEach(review => {
        if (review.user_gender === 'male') maleCount++;
        else femaleCount++;
    });
    
    const malePercent = totalReviews > 0 ? Math.round((maleCount / totalReviews) * 100) : 0;
    const femalePercent = totalReviews > 0 ? Math.round((femaleCount / totalReviews) * 100) : 0;
    
    const cityStats = {};
    reviews.forEach(review => {
        if (review.user_city && review.user_city !== 'null' && review.user_city !== '') {
            const city = review.user_city;
            cityStats[city] = (cityStats[city] || 0) + 1;
        }
    });
    
    const topCities = Object.entries(cityStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([city, count]) => ({ city, count }));
    
    const ratingDistribution = {};
    reviews.forEach(review => {
        const rating = review.rating;
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });
    
    return {
        totalReviews,
        averageRating,
        averageAge,
        genderRatio: {
            male: malePercent,
            female: femalePercent,
            maleCount,
            femaleCount,
        },
        topCities,
        ratingDistribution,
    };
}

function updateStatsDisplay(stats) {
    const statCards = document.querySelectorAll('.stat-card');
    
    if (statCards.length >= 5) {
        statCards[0].querySelector('.stat-value').textContent = stats.totalReviews;
        
        statCards[1].querySelector('.stat-value').textContent = stats.averageRating;
        
        statCards[2].querySelector('.stat-value').textContent = stats.averageAge > 0 ? `${stats.averageAge} лет` : 'Нет данных';
        
        const genderText = `♂ ${stats.genderRatio.male}% | ♀ ${stats.genderRatio.female}%`;
        statCards[3].querySelector('.stat-value').textContent = genderText;
        
        const topCity = stats.topCities[0]?.city || 'Нет данных';
        statCards[4].querySelector('.stat-value').textContent = topCity;
    }
}


function renderRatingBars(ratingDistribution, totalReviews) {
    const bars = [];
    for (let i = 5; i >= 1; i--) {
        const count = ratingDistribution[i] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        bars.push(`
            <div class="rating-bar-item">
                <div class="rating-star">${i} ★</div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="rating-count">${count} (${percentage.toFixed(1)}%)</div>
            </div>
        `);
    }
    return bars.join('');
}

function renderCitiesList(cities) {
    if (!cities || cities.length === 0) {
        return '<div class="no-data">Нет данных о городах</div>';
    }
    
    return cities.map(city => `
        <div class="city-item">
            <span class="city-name">${(city.city)}</span>
            <div class="city-bar">
                <div class="city-bar-fill" style="width: ${Math.min((city.count / cities[0].count) * 100, 100)}%"></div>
            </div>
            <span class="city-count">${city.count} отзывов</span>
        </div>
    `).join('');
}

function showLoading() {
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        stat.textContent = 'Загрузка...';
    });
    
    const existingCharts = document.querySelector('.charts-container');
    if (existingCharts) {
        existingCharts.remove();
    }
}

function showError(message) {
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 5) {
        statCards[0].querySelector('.stat-value').textContent = 'Ошибка';
        statCards[1].querySelector('.stat-value').textContent = '-';
        statCards[2].querySelector('.stat-value').textContent = '-';
        statCards[3].querySelector('.stat-value').textContent = '-';
        statCards[4].querySelector('.stat-value').textContent = '-';
    }
    
    alert(message);
}

searchBtn?.addEventListener('click', () => {
    const selectedCompany = companySelect?.value || 'all';
    loadAndAnalyzeReviews(selectedCompany);
});
