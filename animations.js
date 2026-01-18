// WeatherPro Dashboard - Animations and Effects
class WeatherAnimations {
    constructor() {
        this.activeEffects = new Set();
        this.particleSystems = new Map();
        this.animationFrame = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.initializeParticleSystems();
        this.startAnimationLoop();
        this.isInitialized = true;
    }
    
    setupCanvas() {
        // Create canvas for particle effects
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'weather-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        this.canvas.style.opacity = '0.7';
        
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Handle resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    initializeParticleSystems() {
        // Initialize different particle systems for weather effects
        this.particleSystems.set('rain', new RainParticleSystem(this.ctx));
        this.particleSystems.set('snow', new SnowParticleSystem(this.ctx));
        this.particleSystems.set('sun', new SunParticleSystem(this.ctx));
        this.particleSystems.set('cloud', new CloudParticleSystem(this.ctx));
        this.particleSystems.set('lightning', new LightningParticleSystem(this.ctx));
    }
    
    startAnimationLoop() {
        const animate = () => {
            this.clearCanvas();
            this.updateParticles();
            this.renderParticles();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    updateParticles() {
        this.particleSystems.forEach(system => {
            if (system.isActive) {
                system.update();
            }
        });
    }
    
    renderParticles() {
        this.particleSystems.forEach(system => {
            if (system.isActive) {
                system.render();
            }
        });
    }
    
    setWeatherEffect(weatherType, intensity = 1.0) {
        // Deactivate all effects
        this.particleSystems.forEach(system => {
            system.isActive = false;
        });
        
        // Activate specific weather effect
        switch (weatherType.toLowerCase()) {
            case 'rain':
            case 'drizzle':
                this.particleSystems.get('rain').activate(intensity);
                break;
            case 'snow':
                this.particleSystems.get('snow').activate(intensity);
                break;
            case 'clear':
                this.particleSystems.get('sun').activate(intensity);
                break;
            case 'clouds':
            case 'mist':
            case 'fog':
                this.particleSystems.get('cloud').activate(intensity);
                break;
            case 'thunderstorm':
                this.particleSystems.get('rain').activate(intensity);
                this.particleSystems.get('lightning').activate(intensity);
                break;
        }
    }
    
    // CSS-based weather effects for background
    createCSSRainEffect(container, intensity = 1.0) {
        const rainContainer = document.createElement('div');
        rainContainer.className = 'rain-effect';
        rainContainer.style.position = 'absolute';
        rainContainer.style.top = '0';
        rainContainer.style.left = '0';
        rainContainer.style.width = '100%';
        rainContainer.style.height = '100%';
        rainContainer.style.overflow = 'hidden';
        rainContainer.style.pointerEvents = 'none';
        
        const dropCount = Math.floor(intensity * 100);
        
        for (let i = 0; i < dropCount; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.position = 'absolute';
            drop.style.width = Math.random() * 2 + 1 + 'px';
            drop.style.height = Math.random() * 20 + 10 + 'px';
            drop.style.background = 'linear-gradient(transparent, rgba(255, 255, 255, 0.6))';
            drop.style.borderRadius = '50%';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDuration = (Math.random() * 0.5 + 0.5) / intensity + 's';
            drop.style.animationDelay = Math.random() * 2 + 's';
            drop.style.animation = `rain-fall ${drop.style.animationDuration} linear infinite`;
            
            rainContainer.appendChild(drop);
        }
        
        container.appendChild(rainContainer);
        return rainContainer;
    }
    
    createCSSSnowEffect(container, intensity = 1.0) {
        const snowContainer = document.createElement('div');
        snowContainer.className = 'snow-effect';
        snowContainer.style.position = 'absolute';
        snowContainer.style.top = '0';
        snowContainer.style.left = '0';
        snowContainer.style.width = '100%';
        snowContainer.style.height = '100%';
        snowContainer.style.overflow = 'hidden';
        snowContainer.style.pointerEvents = 'none';
        
        const flakeCount = Math.floor(intensity * 50);
        
        for (let i = 0; i < flakeCount; i++) {
            const flake = document.createElement('div');
            flake.className = 'snow-flake';
            flake.style.position = 'absolute';
            flake.style.width = Math.random() * 4 + 2 + 'px';
            flake.style.height = flake.style.width;
            flake.style.background = 'white';
            flake.style.borderRadius = '50%';
            flake.style.opacity = Math.random() * 0.8 + 0.2;
            flake.style.left = Math.random() * 100 + '%';
            flake.style.animationDuration = (Math.random() * 3 + 2) / intensity + 's';
            flake.style.animationDelay = Math.random() * 2 + 's';
            flake.style.animation = `snow-fall ${flake.style.animationDuration} linear infinite`;
            
            snowContainer.appendChild(flake);
        }
        
        container.appendChild(snowContainer);
        return snowContainer;
    }
    
    createCSSSunEffect(container, intensity = 1.0) {
        const sunContainer = document.createElement('div');
        sunContainer.className = 'sun-effect';
        sunContainer.style.position = 'absolute';
        sunContainer.style.top = '10%';
        sunContainer.style.right = '10%';
        sunContainer.style.width = '120px';
        sunContainer.style.height = '120px';
        sunContainer.style.background = 'radial-gradient(circle, #FCD34D 0%, #F59E0B 70%, transparent 100%)';
        sunContainer.style.borderRadius = '50%';
        sunContainer.style.animation = `sun-pulse ${3 / intensity}s ease-in-out infinite`;
        sunContainer.style.pointerEvents = 'none';
        
        container.appendChild(sunContainer);
        return sunContainer;
    }
    
    createLightningEffect() {
        const lightning = document.createElement('div');
        lightning.style.position = 'fixed';
        lightning.style.top = '0';
        lightning.style.left = '0';
        lightning.style.width = '100%';
        lightning.style.height = '100%';
        lightning.style.background = 'rgba(255, 255, 255, 0.9)';
        lightning.style.pointerEvents = 'none';
        lightning.style.zIndex = '9999';
        lightning.style.opacity = '0';
        lightning.style.transition = 'opacity 0.1s ease';
        
        document.body.appendChild(lightning);
        
        // Flash effect
        setTimeout(() => {
            lightning.style.opacity = '1';
            setTimeout(() => {
                lightning.style.opacity = '0';
                setTimeout(() => lightning.remove(), 100);
            }, 100);
        }, Math.random() * 3000 + 1000);
    }
    
    // Smooth theme transitions
    transitionWeatherTheme(fromTheme, toTheme, duration = 1000) {
        const body = document.body;
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0, 0, 0, 0.3)';
        overlay.style.zIndex = '9998';
        overlay.style.opacity = '0';
        overlay.style.transition = `opacity ${duration / 2}ms ease`;
        
        document.body.appendChild(overlay);
        
        // Fade in
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });
        
        // Change theme and fade out
        setTimeout(() => {
            body.classList.remove(`theme-${fromTheme}`);
            body.classList.add(`theme-${toTheme}`);
            
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), duration / 2);
            }, duration / 2);
        }, duration / 2);
    }
    
    // Loading animations
    showLoadingAnimation(element) {
        element.classList.add('loading-skeleton');
        element.innerHTML = `
            <div class="animate-pulse">
                <div class="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
        `;
    }
    
    hideLoadingAnimation(element, content) {
        element.classList.remove('loading-skeleton');
        element.innerHTML = content;
    }
    
    // Chart animations
    animateChart(chart, duration = 1000) {
        if (!chart || !chart.data) return;
        
        const originalData = chart.data.datasets[0].data;
        const animatedData = new Array(originalData.length).fill(0);
        
        chart.data.datasets[0].data = animatedData;
        chart.update('none');
        
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            
            for (let i = 0; i < originalData.length; i++) {
                animatedData[i] = originalData[i] * easeOutQuart;
            }
            
            chart.update('none');
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    // Scroll reveal animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe elements with animation classes
        document.querySelectorAll('.fade-in, .slide-in').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
    
    // Utility functions
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    map(value, start1, stop1, start2, stop2) {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    }
    
    // Cleanup
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.particleSystems.forEach(system => {
            system.destroy();
        });
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Base particle system class
class ParticleSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.particles = [];
        this.isActive = false;
        this.maxParticles = 100;
    }
    
    activate(intensity = 1.0) {
        this.isActive = true;
        this.intensity = intensity;
        this.createParticles();
    }
    
    deactivate() {
        this.isActive = false;
        this.particles = [];
    }
    
    createParticles() {
        // Override in subclasses
    }
    
    update() {
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.isAlive();
        });
        
        // Add new particles if needed
        while (this.particles.length < this.maxParticles * this.intensity) {
            this.createParticle();
        }
    }
    
    createParticle() {
        // Override in subclasses
    }
    
    render() {
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });
    }
    
    destroy() {
        this.particles = [];
        this.isActive = false;
    }
}

// Rain particle system
class RainParticleSystem extends ParticleSystem {
    constructor(ctx) {
        super(ctx);
        this.maxParticles = 200;
    }
    
    createParticle() {
        this.particles.push(new RainParticle(
            Math.random() * this.ctx.canvas.width,
            -10,
            Math.random() * 2 + 1,
            Math.random() * 10 + 5
        ));
    }
}

// Snow particle system
class SnowParticleSystem extends ParticleSystem {
    constructor(ctx) {
        super(ctx);
        this.maxParticles = 100;
    }
    
    createParticle() {
        this.particles.push(new SnowParticle(
            Math.random() * this.ctx.canvas.width,
            -10,
            Math.random() * 4 + 2
        ));
    }
}

// Sun particle system
class SunParticleSystem extends ParticleSystem {
    constructor(ctx) {
        super(ctx);
        this.maxParticles = 20;
    }
    
    createParticle() {
        this.particles.push(new SunParticle(
            this.ctx.canvas.width - 100,
            100
        ));
    }
}

// Cloud particle system
class CloudParticleSystem extends ParticleSystem {
    constructor(ctx) {
        super(ctx);
        this.maxParticles = 50;
    }
    
    createParticle() {
        this.particles.push(new CloudParticle(
            Math.random() * this.ctx.canvas.width,
            Math.random() * this.ctx.canvas.height * 0.3
        ));
    }
}

// Lightning particle system
class LightningParticleSystem extends ParticleSystem {
    constructor(ctx) {
        super(ctx);
        this.maxParticles = 1;
        this.flashTimer = 0;
    }
    
    update() {
        if (this.flashTimer > 0) {
            this.flashTimer--;
        } else if (Math.random() < 0.01) {
            this.flashTimer = 10;
            this.createFlash();
        }
    }
    
    createFlash() {
        // Create lightning flash effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    
    render() {
        // Flash is rendered directly in update
    }
}

// Base particle class
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.life = 1.0;
        this.decay = 0.01;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }
    
    isAlive() {
        return this.life > 0 && this.y < this.ctx?.canvas?.height + 10;
    }
    
    render(ctx) {
        // Override in subclasses
    }
}

// Rain particle
class RainParticle extends Particle {
    constructor(x, y, width, height) {
        super(x, y);
        this.width = width;
        this.height = height;
        this.vy = 10;
        this.decay = 0;
    }
    
    render(ctx) {
        ctx.fillStyle = `rgba(174, 194, 224, ${this.life * 0.6})`;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Snow particle
class SnowParticle extends Particle {
    constructor(x, y, size) {
        super(x, y);
        this.size = size;
        this.vy = Math.random() * 2 + 1;
        this.vx = Math.random() * 2 - 1;
        this.decay = 0;
        this.angle = 0;
        this.angleSpeed = Math.random() * 0.1 - 0.05;
    }
    
    update() {
        super.update();
        this.angle += this.angleSpeed;
        this.x += Math.sin(this.angle) * 0.5;
    }
    
    render(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.life * 0.8})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Sun particle
class SunParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.size = Math.random() * 3 + 2;
        this.vx = Math.random() * 0.5 - 0.25;
        this.vy = Math.random() * 0.5 - 0.25;
        this.decay = 0.005;
    }
    
    render(ctx) {
        ctx.fillStyle = `rgba(255, 223, 0, ${this.life * 0.8})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Cloud particle
class CloudParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.size = Math.random() * 50 + 30;
        this.vx = Math.random() * 0.5 + 0.2;
        this.decay = 0;
        this.opacity = Math.random() * 0.3 + 0.1;
    }
    
    update() {
        super.update();
        if (this.x > this.ctx.canvas.width + this.size) {
            this.x = -this.size;
        }
    }
    
    render(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.life * this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize animations system
let weatherAnimations;

document.addEventListener('DOMContentLoaded', () => {
    weatherAnimations = new WeatherAnimations();
    
    // Setup scroll animations
    weatherAnimations.setupScrollAnimations();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rain-fall {
            to {
                transform: translateY(100vh);
            }
        }
        
        @keyframes snow-fall {
            to {
                transform: translateY(100vh) rotate(360deg);
            }
        }
        
        @keyframes sun-pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        .loading-skeleton {
            background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
    `;
    document.head.appendChild(style);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WeatherAnimations, WeatherAnimations };
}