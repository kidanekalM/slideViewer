class SlideViewer {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 15;
        this.slidesPath = 'slides/page_';
        this.isFullscreen = false;
        this.thumbnailsVisible = false;
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.generateThumbnails();
        this.updateUI();
    }
    
    cacheElements() {
        this.slideFrame = document.getElementById('slide-frame');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.currentSlideSpan = document.getElementById('current-slide');
        this.totalSlidesSpan = document.getElementById('total-slides');
        this.progressFill = document.getElementById('progress-fill');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.thumbnailToggle = document.getElementById('thumbnail-toggle');
        this.thumbnailsContainer = document.getElementById('thumbnails');
        this.thumbnailContainer = document.querySelector('.thumbnail-container');
        this.helpModal = document.getElementById('help-modal');
        this.closeHelpBtn = document.getElementById('close-help');
    }
    
    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.thumbnailToggle.addEventListener('click', () => this.toggleThumbnails());
        this.closeHelpBtn.addEventListener('click', () => this.hideHelp());
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
        
        this.initTouchSupport();
        this.slideFrame.addEventListener('contextmenu', (e) => e.preventDefault());
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
            case 'f':
            case 'F':
                this.toggleFullscreen();
                break;
            case 't':
            case 'T':
                this.toggleThumbnails();
                break;
            case '?':
                this.showHelp();
                break;
            case 'Escape':
                if (this.thumbnailsVisible) {
                    this.toggleThumbnails();
                }
                if (!this.helpModal.classList.contains('hidden')) {
                    this.hideHelp();
                }
                if (this.isFullscreen) {
                    this.toggleFullscreen();
                }
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
                this.nextSlide();
            } else {
                this.previousSlide();
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
        this.updateUI();
        this.updateThumbnailSelection();
    }
    
    updateSlide() {
        const slideUrl = `${this.slidesPath}${this.currentSlide}.html`;
        this.slideFrame.src = slideUrl;
        
        this.slideFrame.classList.add('loading');
        this.slideFrame.onload = () => {
            this.slideFrame.classList.remove('loading');
        };
    }
    
    updateUI() {
        this.currentSlideSpan.textContent = this.currentSlide;
        this.totalSlidesSpan.textContent = this.totalSlides;
        
        this.prevBtn.disabled = this.currentSlide === 1;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides;
        
        const progressPercent = (this.currentSlide / this.totalSlides) * 100;
        this.progressFill.style.width = `${progressPercent}%`;
    }
    
    generateThumbnails() {
        const thumbnailsContainer = this.thumbnailsContainer;
        thumbnailsContainer.innerHTML = '';
        
        for (let i = 1; i <= this.totalSlides; i++) {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            thumbnail.dataset.slide = i;
            
            if (i === this.currentSlide) {
                thumbnail.classList.add('active');
            }
            
            const iframe = document.createElement('iframe');
            iframe.src = `${this.slidesPath}${i}.html`;
            iframe.loading = 'lazy';
            
            const number = document.createElement('div');
            number.className = 'thumbnail-number';
            number.textContent = i;
            
            thumbnail.appendChild(iframe);
            thumbnail.appendChild(number);
            
            thumbnail.addEventListener('click', () => this.goToSlide(i));
            
            thumbnailsContainer.appendChild(thumbnail);
        }
    }
    
    updateThumbnailSelection() {
        const thumbnails = this.thumbnailsContainer.querySelectorAll('.thumbnail');
        thumbnails.forEach(thumb => {
            thumb.classList.toggle('active', parseInt(thumb.dataset.slide) === this.currentSlide);
        });
        
        const activeThumbnail = this.thumbnailsContainer.querySelector('.thumbnail.active');
        if (activeThumbnail) {
            activeThumbnail.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }
    
    toggleThumbnails() {
        this.thumbnailsVisible = !this.thumbnailsVisible;
        this.thumbnailContainer.classList.toggle('show', this.thumbnailsVisible);
        this.thumbnailsContainer.classList.toggle('hidden', !this.thumbnailsVisible);
        
        if (this.thumbnailsVisible) {
            this.updateThumbnailSelection();
        }
    }
    
    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }
    
    enterFullscreen() {
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }
    
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    handleFullscreenChange() {
        this.isFullscreen = !!(document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.mozFullScreenElement || 
                           document.msFullscreenElement);
        
        const svg = this.fullscreenBtn.querySelector('svg');
        if (this.isFullscreen) {
            svg.innerHTML = '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>';
        } else {
            svg.innerHTML = '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>';
        }
    }
    
    showHelp() {
        this.helpModal.classList.remove('hidden');
        this.closeHelpBtn.focus();
    }
    
    hideHelp() {
        this.helpModal.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SlideViewer();
});

window.addEventListener('load', () => {
    const preloadSlides = [2, 3, 4, 5];
    preloadSlides.forEach(slideNum => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `slides/page_${slideNum}.html`;
        document.head.appendChild(link);
    });
});

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const slideFrame = document.getElementById('slide-frame');
        if (slideFrame) {
            slideFrame.style.display = 'none';
            slideFrame.offsetHeight;
            slideFrame.style.display = '';
        }
    }, 250);
});

window.addEventListener('beforeprint', () => {
    const header = document.querySelector('.viewer-header');
    const navigation = document.querySelector('.navigation-controls');
    const thumbnailContainer = document.querySelector('.thumbnail-container');
    
    if (header) header.style.display = 'none';
    if (navigation) navigation.style.display = 'none';
    if (thumbnailContainer) thumbnailContainer.style.display = 'none';
    
    const slideFrame = document.getElementById('slide-frame');
    if (slideFrame) {
        slideFrame.style.position = 'absolute';
        slideFrame.style.top = '0';
        slideFrame.style.left = '0';
        slideFrame.style.width = '100%';
        slideFrame.style.height = '100%';
        slideFrame.style.borderRadius = '0';
        slideFrame.style.boxShadow = 'none';
    }
});

window.addEventListener('afterprint', () => {
    location.reload();
});