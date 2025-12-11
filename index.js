class SimpleSlideViewer {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 15;
        this.slidesPath = 'slides/page_';
        
        this.init();
    }
    
    init() {
        this.slideFrame = document.getElementById('slide-frame');
        this.bindEvents();
    }
    
    bindEvents() {
        // Use capture phase to ensure our handler runs before default browser behavior
        document.addEventListener('keydown', (e) => this.handleKeyboard(e), true);
        
        // Touch support for mobile
        this.initTouchSupport();
    }
    
    handleKeyboard(e) {
        // Prevent default behavior for all navigation keys
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', ' ', 'PageUp', 'PageDown'].includes(e.key)) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                this.previousSlide();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case 'PageDown':
            case ' ':
                this.nextSlide();
                break;
            case 'Home':
                this.goToSlide(1);
                break;
            case 'End':
                this.goToSlide(this.totalSlides);
                break;
        }
    }
    
    initTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.slideFrame.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.slideFrame.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });
    }
    
    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide(); // Swipe left, go next
            } else {
                this.previousSlide(); // Swipe right, go previous
            }
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }
    
    goToSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides) return;
        
        this.currentSlide = slideNumber;
        this.updateSlide();
    }
    
    updateSlide() {
        const slideUrl = `${this.slidesPath}${this.currentSlide}.html`;
        this.slideFrame.src = slideUrl;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SimpleSlideViewer();
});