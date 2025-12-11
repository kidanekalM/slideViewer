class SimpleSlideViewer {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 15;
        this.slidesPath = 'slides/page_';
        this.isFullscreen = false;

        this.init();
    }

    init() {
        this.slideFrame = document.getElementById('slide-frame');
        this.viewer = document.getElementById('slide-viewer');

        this.updateSlide();
        this.bindEvents();
        this.bindFullscreenEvents();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyboard(e), true);
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
        };

        document.addEventListener('fullscreenchange', updateState);
        document.addEventListener('webkitfullscreenchange', updateState);
        document.addEventListener('msfullscreenchange', updateState);
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    enterFullscreen() {
        const elem = this.viewer;

        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    }

    exitFullscreen() {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    }

    initTouchSupport() {
        let startX = 0;

        this.slideFrame.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.slideFrame.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].screenX;
            this.handleSwipe(startX, endX);
        }, { passive: true });
    }

    handleSwipe(startX, endX) {
        const diff = startX - endX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            diff > 0 ? this.nextSlide() : this.previousSlide();
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

    goToSlide(num) {
        if (num < 1 || num > this.totalSlides) return;
        this.currentSlide = num;
        this.updateSlide();
    }

    updateSlide() {
        this.slideFrame.src = `${this.slidesPath}${this.currentSlide}.html`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SimpleSlideViewer();
});
