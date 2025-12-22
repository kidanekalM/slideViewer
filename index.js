class ProfessionalSlideViewer {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 15;
        this.slidesPath = 'slides/page_';
        this.isFullscreen = false;
        this.isDarkTheme = false;
        this.fitMode = 'cover'; // 'cover', 'contain', 'fill'
        this.isLoading = false;
        
        // DOM Elements
        this.viewer = document.getElementById("slide-viewer");
        this.container = document.getElementById("vertical-container");
        this.currentSpan = document.getElementById("current");
        this.totalSpan = document.getElementById("total");
        this.progressBar = document.getElementById("progress-bar");
        this.overviewModal = document.getElementById("overview-modal");
        this.helpModal = document.getElementById("help-modal");
        this.overviewGrid = document.getElementById("overview-grid");
        this.loadingOverlay = document.getElementById("loading-overlay");
        
        this.init();
    }
    
    async init() {
        await this.loadAllSlides();
        this.bindEvents();
        this.updateUI();
        this.scrollToCurrentSlide();
        this.hideLoading();
        
        // Auto-fit on resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    showLoading() {
        this.isLoading = true;
        this.loadingOverlay.style.display = 'flex';
    }
    
    hideLoading() {
        this.isLoading = false;
        this.loadingOverlay.style.display = 'none';
    }
    
    async loadAllSlides() {
        this.showLoading();
        this.totalSpan.textContent = this.totalSlides;
        
        const promises = [];
        for (let i = 1; i <= this.totalSlides; i++) {
            promises.push(this.createSlideFrame(i));
        }
        
        await Promise.all(promises);
        this.hideLoading();
    }
    
    async createSlideFrame(slideNumber) {
        return new Promise((resolve) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = `slide-frame fit-${this.fitMode}`;
            slideDiv.id = `slide-${slideNumber}`;
            slideDiv.dataset.slideNumber = slideNumber;
            
            const iframe = document.createElement('iframe');
            iframe.loading = 'lazy';
            iframe.onload = () => {
                // Try to inject slide number
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const style = document.createElement('style');
                    style.textContent = `
                        body { 
                            margin: 0; 
                            padding: 0; 
                            overflow: hidden;
                            transform-origin: top left;
                        }
                        img, svg, canvas { 
                            max-width: 100%;
                            height: auto;
                        }
                    `;
                    iframeDoc.head.appendChild(style);
                    
                    // Scale content if needed
                    const body = iframeDoc.body;
                    const bodyRect = body.getBoundingClientRect();
                    const iframeRect = iframe.getBoundingClientRect();
                    
                    if (bodyRect.width > iframeRect.width) {
                        const scale = iframeRect.width / bodyRect.width;
                        body.style.transform = `scale(${scale})`;
                        body.style.width = `${100/scale}%`;
                    }
                } catch (e) {
                    // Cross-origin restriction
                }
                resolve();
            };
            
            iframe.onerror = () => {
                console.warn(`Slide ${slideNumber} failed to load`);
                iframe.srcdoc = `
                    <html>
                        <head>
                            <style>
                                body {
                                    margin: 0;
                                    padding: 40px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    height: 100vh;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    font-family: Arial, sans-serif;
                                    text-align: center;
                                }
                                h1 {
                                    font-size: 2em;
                                    margin-bottom: 20px;
                                }
                            </style>
                        </head>
                        <body>
                            <div>
                                <h1>Slide ${slideNumber}</h1>
                                <p>Content failed to load</p>
                                <p><small>Please check if the file exists</small></p>
                            </div>
                        </body>
                    </html>
                `;
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
        document.getElementById('home-btn').addEventListener('click', () => this.goToSlide(1));
        
        // Control buttons
        document.getElementById('print-btn').addEventListener('click', () => this.printPDF());
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('theme-btn').addEventListener('click', () => this.toggleTheme());
        document.getElementById('fit-mode-btn').addEventListener('click', () => this.cycleFitMode());
        document.getElementById('help-btn').addEventListener('click', () => this.showHelp());
        
        // Overview
        document.getElementById('overview-btn').addEventListener('click', () => this.showOverview());
        document.getElementById('close-overview').addEventListener('click', () => this.hideOverview());
        document.getElementById('close-help').addEventListener('click', () => this.hideHelp());
        
        // Jump controls
        document.getElementById('jump-btn').addEventListener('click', () => {
            const input = document.getElementById('jump-input');
            const slideNum = parseInt(input.value);
            if (slideNum && slideNum >= 1 && slideNum <= this.totalSlides) {
                this.goToSlide(slideNum);
                input.value = '';
            }
        });
        
        document.getElementById('jump-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('jump-btn').click();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Scroll event with debounce
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateActiveSlideFromScroll();
            }, 100);
        });
        
        // Fullscreen events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        
        // Close modals on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.overviewModal.classList.contains('show')) {
                    this.hideOverview();
                }
                if (this.helpModal.classList.contains('show')) {
                    this.hideHelp();
                }
            }
        });
        
        // Close modals on outside click
        [this.overviewModal, this.helpModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }
    
    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT') return;
        
        switch (e.key.toLowerCase()) {
            case 'arrowup': case 'pageup':
                e.preventDefault(); this.previousSlide(); break;
            case 'arrowdown': case 'pagedown': case ' ':
                e.preventDefault(); this.nextSlide(); break;
            case 'home': e.preventDefault(); this.goToSlide(1); break;
            case 'end': e.preventDefault(); this.goToSlide(this.totalSlides); break;
            case 'f': e.preventDefault(); this.toggleFullscreen(); break;
            case 'p': e.preventDefault(); this.printPDF(); break;
            case 'o': e.preventDefault(); this.showOverview(); break;
            case 't': e.preventDefault(); this.toggleTheme(); break;
            case '?': e.preventDefault(); this.showHelp(); break;
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
            const headerHeight = document.getElementById('header-controls').offsetHeight;
            const y = slideElement.offsetTop - headerHeight - 20;
            
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
        
        // Update progress bar
        const progress = ((this.currentSlide - 1) / (this.totalSlides - 1)) * 100;
        this.progressBar.style.width = `${progress}%`;
        
        // Update active state
        document.querySelectorAll('.slide-frame').forEach((slide, index) => {
            const slideNum = index + 1;
            slide.classList.toggle('active', slideNum === this.currentSlide);
        });
    }
    
    printPDF() {
        const printInstructions = `
            For best PDF results:
            
            1. Click "Print" in the dialog
            2. Choose "Save as PDF" as destination
            3. Set margins to "None"
            4. Enable "Background graphics"
            5. Set scale to "100%"
            6. Click "Save"
            
            Do you want to continue?
        `;
        
        if (confirm(printInstructions)) {
            // Add print class to body for print styles
            document.body.classList.add('printing');
            
            setTimeout(() => {
                window.print();
                
                // Remove print class after a delay
                setTimeout(() => {
                    document.body.classList.remove('printing');
                }, 1000);
            }, 1000);
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
        
        // Update fullscreen button icon
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        const icon = fullscreenBtn.querySelector('i');
        icon.className = this.isFullscreen ? 'fas fa-compress' : 'fas fa-expand';
    }
    
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        document.body.classList.toggle('dark-theme', this.isDarkTheme);
        
        // Update theme button icon
        const themeBtn = document.getElementById('theme-btn');
        const icon = themeBtn.querySelector('i');
        icon.className = this.isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    cycleFitMode() {
        const fitModes = ['cover', 'contain', 'fill'];
        const currentIndex = fitModes.indexOf(this.fitMode);
        this.fitMode = fitModes[(currentIndex + 1) % fitModes.length];
        
        // Update all slides with new fit mode
        document.querySelectorAll('.slide-frame').forEach(slide => {
            fitModes.forEach(mode => slide.classList.remove(`fit-${mode}`));
            slide.classList.add(`fit-${this.fitMode}`);
        });
        
        // Update fit mode button
        const fitBtn = document.getElementById('fit-mode-btn');
        const icon = fitBtn.querySelector('i');
        const titles = {
            'cover': 'Cover - Fill entire slide (may crop)',
            'contain': 'Contain - Show entire content (may have borders)',
            'fill': 'Fill - Stretch to fill (may distort)'
        };
        
        fitBtn.title = `Fit mode: ${this.fitMode.charAt(0).toUpperCase() + this.fitMode.slice(1)}`;
        
        // Show brief notification
        this.showNotification(`Fit mode: ${this.fitMode}`);
    }
    
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 2000;
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
        `;
        
        document.body.appendChild(notification);
        
        // Add CSS for animations
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remove after animation completes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    async showOverview() {
        this.overviewGrid.innerHTML = '';
        
        for (let i = 1; i <= this.totalSlides; i++) {
            const thumb = document.createElement('div');
            thumb.className = `overview-thumb ${i === this.currentSlide ? 'active' : ''}`;
            thumb.dataset.slide = i;
            
            // Try to capture thumbnail from iframe
            try {
                const iframe = document.querySelector(`#slide-${i} iframe`);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Create fallback thumbnail
                canvas.width = 200;
                canvas.height = 120;
                ctx.fillStyle = i === this.currentSlide ? '#4CAF50' : '#666';
                ctx.fillRect(0, 0, 200, 120);
                ctx.fillStyle = 'white';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`Slide ${i}`, 100, 60);
                
                const img = document.createElement('img');
                img.src = canvas.toDataURL();
                thumb.appendChild(img);
            } catch (e) {
                // Fallback: colored box with number
                const div = document.createElement('div');
                div.style.cssText = `
                    width: 100%;
                    height: 120px;
                    background: ${i === this.currentSlide ? '#4CAF50' : '#666'};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 24px;
                    font-weight: bold;
                `;
                div.textContent = i;
                thumb.appendChild(div);
            }
            
            const number = document.createElement('div');
            number.className = 'thumb-number';
            number.textContent = `Slide ${i}`;
            thumb.appendChild(number);
            
            thumb.addEventListener('click', () => {
                this.goToSlide(i);
                this.hideOverview();
            });
            
            this.overviewGrid.appendChild(thumb);
        }
        
        this.overviewModal.classList.add('show');
    }
    
    hideOverview() {
        this.overviewModal.classList.remove('show');
    }
    
    showHelp() {
        this.helpModal.classList.add('show');
    }
    
    hideHelp() {
        this.helpModal.classList.remove('show');
    }
    
    handleResize() {
        // Re-apply fit mode on resize
        document.querySelectorAll('.slide-frame iframe').forEach(iframe => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const body = iframeDoc.body;
                const bodyRect = body.getBoundingClientRect();
                const iframeRect = iframe.getBoundingClientRect();
                
                if (bodyRect.width > iframeRect.width) {
                    const scale = iframeRect.width / bodyRect.width;
                    body.style.transform = `scale(${scale})`;
                    body.style.width = `${100/scale}%`;
                }
            } catch (e) {
                // Cross-origin restriction
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const viewer = new ProfessionalSlideViewer();
    window.slideViewer = viewer; // Make available globally for debugging
});