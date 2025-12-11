class SimpleSlideViewer {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 15;
        this.slidesPath = 'slides/page_';
        this.isFullscreen = false;

        this.viewer = document.getElementById("slide-viewer");
        this.frame = document.getElementById("slide-frame");

        this.loadSlide();
        this.bindEvents();
        this.bindFullscreenEvents();
    }

    loadSlide() {
        const url = `${this.slidesPath}${this.currentSlide}.html`;
        this.frame.src = url;
        this.scaleSlide();
    }

    scaleSlide() {
        const baseWidth = 1280;
        const baseHeight = 720;

        const scale = Math.min(
            window.innerWidth / baseWidth,
            window.innerHeight / baseHeight
        );

        this.frame.style.width = `${baseWidth * scale}px`;
        this.frame.style.height = `${baseHeight * scale}px`;
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
