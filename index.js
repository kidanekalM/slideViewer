class SimpleSlideViewer {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 15;
        this.slidesPath = 'slides/page_';
        this.isFullscreen = false;

        this.container = document.getElementById("slide-container");
        this.viewer = document.getElementById("slide-viewer");

        this.loadSlide();
        this.bindEvents();
        this.bindFullscreenEvents();
    }

    async loadSlide() {
        const url = `${this.slidesPath}${this.currentSlide}.html`;
        const response = await fetch(url);
        const html = await response.text();

        this.container.innerHTML = html;
        this.scaleSlide();
    }

    scaleSlide() {
        const scale = Math.min(
            window.innerWidth / 1280,
            window.innerHeight / 720
        );
        this.container.style.transform = `scale(${scale})`;
    }

    bindEvents() {
        window.addEventListener("resize", () => this.scaleSlide());
        document.addEventListener("keydown", (e) => this.handleKeyboard(e), true);
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
            this.viewer.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
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

    initTouchSupport() {
        let startX = 0;

        this.viewer.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.viewer.addEventListener('touchend', (e) => {
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
