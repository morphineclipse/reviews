const modal = document.querySelector('.modal-overlay');
const openBtn = document.querySelector('.add-review-btn');
const closeBtn = document.querySelector('.modal-close');

if(!localStorage.getItem("token")){
    openBtn.addEventListener('click', () => {
        window.location.href = "/login";
    });
}
else{
    
    openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    });
}
