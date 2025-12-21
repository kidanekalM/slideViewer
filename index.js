class AllSlidesViewer {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 15;
        this.slidesPath = 'slides/page_';
        this.isFullscreen = false;
        this.zoomLevel = 1;
        
        this.viewer = document.getElementById("slide-viewer");
        this.container = document.getElementById("all-slides-container");
        this.currentSpan = document.getElementById("current");
        this.totalSpan = document.getElementById("total");
        
        this.init();
    }
    
    async init() {
        await this.loadAllSlides();
        this.bindEvents();
        this.updateUI();
        this.scrollToCurrentSlide();
    }
    
    async loadAllSlides() {
        this.totalSpan.textContent = this.totalSlides;
        
        for (let i = 1; i <= this.totalSlides; i++) {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'slide-frame';
            slideDiv.id = `slide-${i}`;
            slideDiv.dataset.slideNumber = i;
            
            const iframe = document.createElement('iframe');
            iframe.src = `${this.slidesPath}${i}.html`;
            iframe.style.width = '1280px';
            iframe.style.height = '720px';
            iframe.style.border = 'none';
            
            slideDiv.appendChild(iframe);
            this.container.appendChild(slideDiv);
            
            // Add click handler to each slide
            slideDiv.addEventListener('click', () => {
                this.goToSlide(i);
            });
        }
    }
    
    bindEvents() {
        // Navigation buttons
        document.getElementById('prev-btn').addEventListener('click', () => this.previousSlide());
        document.getElementById('next-btn').addEventListener('click', () => this.nextSlide());
        
        // Fullscreen button
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        
        // Zoom controls
        document.getElementById('zoom-in-btn').addEventListener('click', () => this.adjustZoom(0.1));
        document.getElementById('zoom-out-btn').addEventListener('click', () => this.adjustZoom(-0.1));
        document.getElementById('zoom-slider').addEventListener('input', (e) => {
            this.setZoom(e.target.value / 100);
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Resize handling
        window.addEventListener('resize', () => this.handleResize());
        
        // Fullscreen events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        
        // Container scroll event
        this.container.addEventListener('scroll', () => this.updateActiveSlideFromScroll());
    }
    
    handleKeyboard(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                this.previousSlide();
                break;
                
            case 'ArrowRight':
            case 'PageDown':
            case ' ':
                e.preventDefault();
                this.nextSlide();
                break;
                
            case 'Home':
                e.preventDefault();
                this.goToSlide(1);
                break;
                
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides);
                break;
                
            case 'f':
            case 'F':
                e.preventDefault();
                this.toggleFullscreen();
                break;
                
            case '+':
            case '=':
                e.preventDefault();
                this.adjustZoom(0.1);
                break;
                
            case '-':
            case '_':
                e.preventDefault();
                this.adjustZoom(-0.1);
                break;
        }
    }
    
    goToSlide(num) {
        if (num < 1 || num > this.totalSlides) return;
        this.currentSlide = num;
        this.updateUI();
        this.scrollToCurrentSlide();
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
    
    scrollToCurrentSlide() {
        const slideElement = document.getElementById(`slide-${this.currentSlide}`);
        if (slideElement) {
            slideElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }
    }
    
    updateActiveSlideFromScroll() {
        const containerRect = this.container.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        
        let closestSlide = null;
        let minDistance = Infinity;
        
        // Find slide closest to center
        for (let i = 1; i <= this.totalSlides; i++) {
            const slide = document.getElementById(`slide-${i}`);
            if (slide) {
                const slideRect = slide.getBoundingClientRect();
                const slideCenter = slideRect.left + slideRect.width / 2;
                const distance = Math.abs(slideCenter - containerCenter);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestSlide = i;
                }
            }
        }
        
        if (closestSlide && closestSlide !== this.currentSlide) {
            this.currentSlide = closestSlide;
            this.updateUI();
        }
    }
    
    updateUI() {
        this.currentSpan.textContent = this.currentSlide;
        
        // Update active state
        document.querySelectorAll('.slide-frame').forEach((slide, index) => {
            const slideNum = index + 1;
            slide.classList.toggle('active', slideNum === this.currentSlide);
        });
    }
    
    setZoom(level) {
        this.zoomLevel = Math.max(0.5, Math.min(2, level));
        
        // Update slider
        document.getElementById('zoom-slider').value = this.zoomLevel * 100;
        
        // Apply zoom to all slides
        document.querySelectorAll('.slide-frame').forEach(slide => {
            slide.style.transform = `scale(${this.zoomLevel})`;
        });
        
        // Store in CSS variable for fullscreen
        document.documentElement.style.setProperty('--zoom-level', this.zoomLevel);
    }
    
    adjustZoom(delta) {
        this.setZoom(this.zoomLevel + delta);
    }
    
    toggleFullscreen() {
        if (!this.isFullscreen) {
            if (this.viewer.requestFullscreen) {
                this.viewer.requestFullscreen();
            } else if (this.viewer.webkitRequestFullscreen) {
                this.viewer.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }
    
    handleFullscreenChange() {
        this.isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
        
        // Adjust padding in fullscreen
        if (this.isFullscreen) {
            this.container.style.padding = '40px';
        } else {
            this.container.style.padding = '20px';
        }
    }
    
    handleResize() {
        // Re-center current slide on resize
        setTimeout(() => this.scrollToCurrentSlide(), 100);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AllSlidesViewer();
});