class SimpleSlideViewer {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 16;
        this.slidesPath = 'slides/page_';
        this.isFullscreen = false;
        this.baseWidth = 1280;
        this.baseHeight = 720;

        this.viewer = document.getElementById("slide-viewer");
        this.frame = document.getElementById("slide-frame");
        this.indicator = document.getElementById("slide-indicator");

        this.loadSlide();
        this.bindEvents();
        this.bindFullscreenEvents();
    }

    loadSlide() {
        const url = `${this.slidesPath}${this.currentSlide}.html`;
        this.frame.src = url;
        this.updateIndicator();
    }

    scaleSlide() {
        const { width: viewportWidth, height: viewportHeight } = this.getAvailableSize();
        const scale = Math.min(
            viewportWidth / this.baseWidth,
            viewportHeight / this.baseHeight,
            1
        );

        // Make iframe fill the viewer; we scale inner content instead
        this.frame.style.width = `${Math.floor(viewportWidth)}px`;
        this.frame.style.height = `${Math.floor(viewportHeight)}px`;

        this.applyInnerScale(scale);
    }

    getAvailableSize() {
        const styles = getComputedStyle(this.viewer);
        const padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
        const padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
        const width = this.viewer.clientWidth - padX;
        const height = this.viewer.clientHeight - padY;
        return { width, height };
    }

    ensureInnerStyles(iframeDoc) {
        if (!iframeDoc || !iframeDoc.documentElement) return;
        if (iframeDoc.getElementById('sv-inner-style')) return;

        const style = iframeDoc.createElement('style');
        style.id = 'sv-inner-style';
        style.textContent = `
            html, body { width:100% !important; height:100% !important; margin:0 !important; padding:0 !important; overflow:hidden !important; background: transparent !important; overscroll-behavior: none; }
            body { display:flex !important; align-items:center !important; justify-content:center !important; }
            .sv-scale-viewport { width:100% !important; height:100% !important; display:flex !important; align-items:center !important; justify-content:center !important; overflow:hidden !important; }
            .sv-scale-wrap { width:${this.baseWidth}px !important; height:${this.baseHeight}px !important; transform-origin:center center; transform: scale(var(--sv-scale, 1)); display:block; }
            .sv-scale-wrap > .slide { width:${this.baseWidth}px !important; height:${this.baseHeight}px !important; }
            @media (max-width: 768px) {
              /* Prefer scaling to avoid overflow/cutoff on small screens */
              html, body { overflow:hidden !important; }
            }
        `;
        iframeDoc.head ? iframeDoc.head.appendChild(style) : iframeDoc.documentElement.appendChild(style);
    }

    applyInnerScale(scale) {
        try {
            const iframeDoc = this.frame.contentDocument || this.frame.contentWindow.document;
            if (!iframeDoc) return;
            this.ensureInnerStyles(iframeDoc);
            // Ensure a consistent wrapper exists
            let slideEl = iframeDoc.querySelector('.slide');
            if (!slideEl) return;
            let viewport = iframeDoc.querySelector('.sv-scale-viewport');
            let wrap = iframeDoc.querySelector('.sv-scale-wrap');
            if (!wrap) {
                viewport = iframeDoc.createElement('div');
                viewport.className = 'sv-scale-viewport';
                wrap = iframeDoc.createElement('div');
                wrap.className = 'sv-scale-wrap';
                slideEl.parentNode.insertBefore(viewport, slideEl);
                viewport.appendChild(wrap);
                wrap.appendChild(slideEl);
            }
            iframeDoc.documentElement.style.setProperty('--sv-scale', String(scale));
        } catch (e) {
            // Cross-origin iframes would block this, but our slides are same-origin
        }
    }

    bindEvents() {
        window.addEventListener("resize", () => this.scaleSlide());
        document.addEventListener("keydown", (e) => this.handleKeyboard(e), true);

        document.getElementById("prev-btn").addEventListener("click", () => this.previousSlide());
        document.getElementById("next-btn").addEventListener("click", () => this.nextSlide());

        // Fix for keyboard navigation when focus is inside iframe
        this.frame.addEventListener("load", () => {
            try {
                const iframeDoc = this.frame.contentDocument || this.frame.contentWindow.document;
                if (iframeDoc) {
                    // Inject scaling styles and bind events inside the slide
                    this.ensureInnerStyles(iframeDoc);
                    this.scaleSlide();
                    iframeDoc.addEventListener("keydown", (e) => this.handleKeyboard(e), true);
                }
            } catch (error) {
                console.warn("Could not bind/inject into slide iframe:", error);
            }
        });

        this.initTouchSupport();
    }

    handleKeyboard(e) {
        const navKeys = [
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End', ' ', 'PageUp', 'PageDown'
        ];

        if (navKeys.includes(e.key) || e.key.toLowerCase() === 'f') {
            e.preventDefault();
            e.stopPropagation();
        }

        switch (e.key) {
            case 'ArrowLeft':
            case 'PageUp':
                this.previousSlide();
                break;

            case 'ArrowRight':
            case 'PageDown':
            case ' ':
                this.nextSlide();
                break;

            case 'ArrowUp':
                this.goToSlide(this.currentSlide - 1);
                break;

            case 'ArrowDown':
                this.goToSlide(this.currentSlide + 1);
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

            case 'Escape':
                if (this.isFullscreen) this.exitFullscreen();
                break;
        }
    }

    bindFullscreenEvents() {
        const updateState = () => {
            this.isFullscreen =
                !!document.fullscreenElement ||
                !!document.webkitFullscreenElement ||
                !!document.msFullscreenElement;

            this.scaleSlide();
        };

        document.addEventListener('fullscreenchange', updateState);
        document.addEventListener('webkitfullscreenchange', updateState);
        document.addEventListener('msfullscreenchange', updateState);
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            if (this.viewer.requestFullscreen) {
                this.viewer.requestFullscreen();
            } else if (this.viewer.webkitRequestFullscreen) {
                this.viewer.webkitRequestFullscreen();
            } else if (this.viewer.msRequestFullscreen) {
                this.viewer.msRequestFullscreen();
            }
        } else {
            this.exitFullscreen();
        }
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    previousSlide() {
        if (this.currentSlide > 1) {
            this.currentSlide--;
            this.loadSlide();
        }
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.currentSlide++;
            this.loadSlide();
        }
    }

    goToSlide(num) {
        if (num < 1 || num > this.totalSlides) return;
        this.currentSlide = num;
        this.loadSlide();
    }

    updateIndicator() {
        if (!this.indicator) return;
        this.indicator.textContent = `${this.currentSlide} / ${this.totalSlides}`;
    }

    initTouchSupport() {
        let startX = 0;

        this.viewer.addEventListener('touchstart', (e) => {
            if (!e.changedTouches || !e.changedTouches[0]) return;
            startX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.viewer.addEventListener('touchend', (e) => {
            if (!e.changedTouches || !e.changedTouches[0]) return;
            const endX = e.changedTouches[0].screenX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                diff > 0 ? this.nextSlide() : this.previousSlide();
            }
        }, { passive: true });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SimpleSlideViewer();
});
