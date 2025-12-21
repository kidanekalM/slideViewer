class VerticalSlideViewer {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 15;
        this.slidesPath = 'slides/page_';
        this.isFullscreen = false;
        
        this.viewer = document.getElementById("slide-viewer");
        this.container = document.getElementById("vertical-container");
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
            await this.createSlideFrame(i);
        }
    }
    
    async createSlideFrame(slideNumber) {
        return new Promise((resolve) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'slide-frame';
            slideDiv.id = `slide-${slideNumber}`;
            slideDiv.dataset.slideNumber = slideNumber;
            
            const iframe = document.createElement('iframe');
            iframe.loading = 'lazy';
            iframe.onload = () => {
                // Try to add slide number inside iframe for printing
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const slideNumberDiv = document.createElement('div');
                    slideNumberDiv.style.cssText = `
                        position: absolute;
                        bottom: 20px;
                        right: 20px;
                        color: #666;
                        font-size: 14px;
                        font-family: Arial, sans-serif;
                        background: rgba(255,255,255,0.9);
                        padding: 4px 12px;
                        border-radius: 12px;
                    `;
                    slideNumberDiv.textContent = `Slide ${slideNumber}`;
                    iframeDoc.body.appendChild(slideNumberDiv);
                } catch (e) {
                    // Cross-origin restriction, ignore
                }
                resolve();
            };
            
            iframe.src = `${this.slidesPath}${slideNumber}.html`;
            slideDiv.appendChild(iframe);
            this.container.appendChild(slideDiv);
            
            // Click to navigate
            slideDiv.addEventListener('click', () => {
                this.goToSlide(slideNumber);
            });
        });
    }
    
    bindEvents() {
        // Navigation buttons
        document.getElementById('prev-btn').addEventListener('click', () => this.previousSlide());
        document.getElementById('next-btn').addEventListener('click', () => this.nextSlide());
        
        // Control buttons
        document.getElementById('print-btn').addEventListener('click', () => this.printPDF());
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Scroll event
        window.addEventListener('scroll', () => this.updateActiveSlideFromScroll());
        
        // Fullscreen events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    }
    
    handleKeyboard(e) {
        switch (e.key) {
            case 'ArrowUp': case 'PageUp':
                e.preventDefault(); this.previousSlide(); break;
            case 'ArrowDown': case 'PageDown': case ' ':
                e.preventDefault(); this.nextSlide(); break;
            case 'Home': e.preventDefault(); this.goToSlide(1); break;
            case 'End': e.preventDefault(); this.goToSlide(this.totalSlides); break;
            case 'f': case 'F': e.preventDefault(); this.toggleFullscreen(); break;
            case 'p': case 'P': e.preventDefault(); this.printPDF(); break;
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
            const yOffset = -100; // Adjust for fixed controls
            const y = slideElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
            
            window.scrollTo({
                top: y,
                behavior: 'smooth'
            });
        }
    }
    
    updateActiveSlideFromScroll() {
        const viewportHeight = window.innerHeight;
        const scrollTop = window.pageYOffset;
        const viewportCenter = scrollTop + (viewportHeight / 2);
        
        let closestSlide = null;
        let minDistance = Infinity;
        
        for (let i = 1; i <= this.totalSlides; i++) {
            const slide = document.getElementById(`slide-${i}`);
            if (!slide) continue;
            
            const slideRect = slide.getBoundingClientRect();
            const slideCenter = scrollTop + slideRect.top + (slideRect.height / 2);
            
            const distance = Math.abs(slideCenter - viewportCenter);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestSlide = i;
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
    
    printPDF() {
        // Show simple print instruction
        if (confirm('Click OK to print to PDF. For best results:\n\n1. Choose "Save as PDF" as destination\n2. Set margins to "None" or "Minimum"\n3. Enable "Background graphics"\n\nClick OK to continue.')) {
            // Wait a moment for any iframes to load
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }
    
    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.viewer.requestFullscreen?.() || 
            this.viewer.webkitRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() || 
            document.webkitExitFullscreen?.();
        }
    }
    
    handleFullscreenChange() {
        this.isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VerticalSlideViewer();
});