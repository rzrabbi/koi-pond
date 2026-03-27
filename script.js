const canvas = document.getElementById('wallpaper-canvas');
const ctx = canvas.getContext('2d');

let config = {
    fishCount: 15,
    waterHue: 195,
    fishSpeed: 1.0,
    enableCaustics: true,
    enableFeeding: true,
    shyFish: true,
    fishTheme: 0,
    fishSize: 1.0,
    rippleStrength: 1.0
};

let width, height;
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let kois = [];
let foods = [];
let ripples = [];

let mouse = { x: null, y: null, active: false };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    
    if (Math.random() < 0.1) {
        ripples.push(new Ripple(mouse.x, mouse.y, 0.5 * config.rippleStrength));
    }
});
window.addEventListener('mouseout', () => { mouse.active = false; });

window.addEventListener('click', (e) => {
    if (config.enableFeeding) {
        foods.push(new Food(e.clientX, e.clientY));
    }
    ripples.push(new Ripple(e.clientX, e.clientY, 1.5 * config.rippleStrength));
});

window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
        if (properties.fishCount !== undefined) {
            config.fishCount = properties.fishCount.value;
            syncKois();
        }
        if (properties.waterHue !== undefined) {
            config.waterHue = properties.waterHue.value;
            document.body.style.backgroundColor = `hsl(${config.waterHue}, 75%, 18%)`;
        }
        if (properties.fishSpeed !== undefined) {
            config.fishSpeed = properties.fishSpeed.value;
        }
        if (properties.enableCaustics !== undefined) {
            config.enableCaustics = properties.enableCaustics.value;
        }
        if (properties.enableFeeding !== undefined) {
            config.enableFeeding = properties.enableFeeding.value;
        }
        if (properties.shyFish !== undefined) {
            config.shyFish = properties.shyFish.value;
        }
        if (properties.fishTheme !== undefined) {
            config.fishTheme = properties.fishTheme.value;
            kois.forEach(k => k.updateColorTheme());
        }
        if (properties.fishSize !== undefined) {
            config.fishSize = properties.fishSize.value;
        }
        if (properties.rippleStrength !== undefined) {
            config.rippleStrength = properties.rippleStrength.value;
        }
    }
};

function livelyPropertyListener(name, val) {
    if (name === "fishCount") {
        config.fishCount = val;
        syncKois();
    } else if (name === "waterHue") {
        config.waterHue = val;
        document.body.style.backgroundColor = `hsl(${config.waterHue}, 75%, 18%)`;
    } else if (name === "fishSpeed") {
        config.fishSpeed = val;
    } else if (name === "enableCaustics") {
        config.enableCaustics = val;
    } else if (name === "enableFeeding") {
        config.enableFeeding = val;
    } else if (name === "shyFish") {
        config.shyFish = val;
    } else if (name === "fishTheme") {
        config.fishTheme = val;
        kois.forEach(k => k.updateColorTheme());
    } else if (name === "fishSize") {
        config.fishSize = val;
    } else if (name === "rippleStrength") {
        config.rippleStrength = val;
    }
}

function distance(a, b) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function distanceSq(a, b) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    return dx * dx + dy * dy;
}

const FISH_BASE_SIZES = [12, 14, 15, 14, 12, 9, 6, 4, 3, 2, 1, 1];

class Ripple {
    constructor(x, y, power) {
        this.x = x;
        this.y = y;
        this.radius = 1;
        this.power = power;
        this.maxRadius = power * 100;
        this.life = 1;
    }
    update() {
        this.radius += 1 * this.power;
        this.life -= 0.01;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.life * 0.3})`;
        ctx.lineWidth = 2 * this.life;
        ctx.stroke();
    }
}

class Food {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 3;
        this.life = 1000;
    }
    update() {
        this.life--;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f4a460';
        ctx.fill();
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 0;
    }
}

class Koi {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.baseSpeed = 0.4 + Math.random() * 0.4;
        this.maxForce = 0.03;
        
        this.updateColorTheme();
        this.spotColor = Math.random() > 0.5 ? '#222' : '#fff'; 
        
        this.segments = [];
        this.numSegments = 12;
        for (let i = 0; i < this.numSegments; i++) {
            this.segments.push({ x: this.x, y: this.y });
        }
        this.angle = Math.atan2(this.vy, this.vx);
        this.swimCycle = Math.random() * Math.PI * 2;
        this.fedTimer = 0;
    }

    updateColorTheme() {
        let colors;
        if (config.fishTheme === 0) {
            colors = ['#ff5e00', '#e6e6e6', '#ffd700', '#ff2a00'];
        } else if (config.fishTheme === 1) {
            colors = ['#00ffcc', '#ff00ff', '#ccff00', '#00ccff'];
        } else {
            colors = ['#ffffff', '#cccccc', '#999999', '#666666'];
        }
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        if (this.fedTimer > 0) this.fedTimer--;

        let target = null;
        let minDistSq = Infinity;
        for (let i = 0; i < foods.length; i++) {
            let dSq = distanceSq(this, foods[i]);
            if (dSq < minDistSq) {
                minDistSq = dSq;
                target = foods[i];
            }
        }

        let ax = 0, ay = 0;
        let effectiveBaseSpeed = this.baseSpeed * config.fishSpeed;
        let avoidForceApplied = false;

        if (target && minDistSq < 90000) {
            let truedirX = target.x - this.x;
            let truedirY = target.y - this.y;
            let dirLen = Math.sqrt(truedirX * truedirX + truedirY * truedirY);
            if (dirLen > 0) {
                let desiredX = (truedirX / dirLen) * effectiveBaseSpeed * 2;
                let desiredY = (truedirY / dirLen) * effectiveBaseSpeed * 2;
                
                ax = (desiredX - this.vx) * this.maxForce * 2;
                ay = (desiredY - this.vy) * this.maxForce * 2;
            }
            
            if (minDistSq < 400) {
                foods.splice(foods.indexOf(target), 1);
                ripples.push(new Ripple(this.x, this.y, 0.8 * config.rippleStrength));
                this.fedTimer = 180;
            }
        } else {
            if (this.fedTimer <= 0 && config.shyFish && mouse.active) {
                let dMouseSq = distanceSq(this, mouse);
                if (dMouseSq < 40000) {
                    let avoidX = this.x - mouse.x;
                    let avoidY = this.y - mouse.y;
                    let avoidLen = Math.sqrt(avoidX * avoidX + avoidY * avoidY);
                    
                    if (avoidLen > 0) {
                        let desiredX = (avoidX / avoidLen) * effectiveBaseSpeed * 2.5;
                        let desiredY = (avoidY / avoidLen) * effectiveBaseSpeed * 2.5;
                        
                        ax = (desiredX - this.vx) * this.maxForce * 3;
                        ay = (desiredY - this.vy) * this.maxForce * 3;
                        avoidForceApplied = true;
                    }
                }
            }
            
            if (!avoidForceApplied) {
                let wanderAngle = (Math.random() - 0.5) * 0.5;
                let curAngle = Math.atan2(this.vy, this.vx) + wanderAngle;
                
                this.vx = Math.cos(curAngle) * effectiveBaseSpeed;
                this.vy = Math.sin(curAngle) * effectiveBaseSpeed;
            }
        }

        let margin = 100;
        let turn = 0.1;
        
        if (target && minDistSq < 90000) {
            margin = 0;
        }

        if (this.x < margin) ax += turn;
        if (this.x > width - margin) ax -= turn;
        if (this.y < margin) ay += turn;
        if (this.y > height - margin) ay -= turn;

        this.vx += ax;
        this.vy += ay;

        let speedSquared = this.vx * this.vx + this.vy * this.vy;
        let cSpeed = Math.sqrt(speedSquared);
        
        let currentMax = effectiveBaseSpeed;
        if (target && minDistSq < 90000) {
            currentMax = effectiveBaseSpeed * 2;
        } else if (avoidForceApplied) {
            currentMax = effectiveBaseSpeed * 2.5;
        }
        
        if (cSpeed > currentMax) {
            this.vx = (this.vx / cSpeed) * currentMax;
            this.vy = (this.vy / cSpeed) * currentMax;
        }

        this.x += this.vx;
        this.y += this.vy;
        
        this.swimCycle += cSpeed * 0.1;
        let wiggle = Math.sin(this.swimCycle) * 0.2;

        this.angle = Math.atan2(this.vy, this.vx) + wiggle;

        this.segments[0].x = this.x;
        this.segments[0].y = this.y;
        
        let currentSpacing = 5 * config.fishSize;
        for (let i = 1; i < this.numSegments; i++) {
            let prev = this.segments[i - 1];
            let curr = this.segments[i];
            
            let dx = prev.x - curr.x;
            let dy = prev.y - curr.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                curr.x = prev.x - (dx / dist) * currentSpacing;
                curr.y = prev.y - (dy / dist) * currentSpacing;
            }
        }
    }

    draw(ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.shadowBlur = 15 * config.fishSize;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowOffsetX = 10 * config.fishSize;
        ctx.shadowOffsetY = 15 * config.fishSize;
        
        ctx.beginPath();
        let mid = this.segments[3];
        let dX = this.segments[3].x - this.segments[4].x;
        let dY = this.segments[3].y - this.segments[4].y;
        let a = Math.atan2(dY, dX);
        
        let s30 = 30 * config.fishSize;
        let s15 = 15 * config.fishSize;

        ctx.fillStyle = `rgba(255, 255, 255, 0.5)`;
        ctx.moveTo(mid.x, mid.y);
        ctx.lineTo(mid.x + Math.cos(a + 1.5) * s30, mid.y + Math.sin(a + 1.5) * s30);
        ctx.lineTo(mid.x + Math.cos(a + 2.5) * s15, mid.y + Math.sin(a + 2.5) * s15);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(mid.x, mid.y);
        ctx.lineTo(mid.x + Math.cos(a - 1.5) * s30, mid.y + Math.sin(a - 1.5) * s30);
        ctx.lineTo(mid.x + Math.cos(a - 2.5) * s15, mid.y + Math.sin(a - 2.5) * s15);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        for (let i = 0; i < this.numSegments - 1; i++) {
            let s1 = this.segments[i];
            let s2 = this.segments[i + 1];
            
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.lineWidth = FISH_BASE_SIZES[i] * config.fishSize * 2;
            
            ctx.strokeStyle = (i === 4 || i === 7) ? this.spotColor : this.color;
            
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(this.segments[0].x, this.segments[0].y, FISH_BASE_SIZES[0] * config.fishSize * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        let tailIdx = this.numSegments - 1;
        let t1 = this.segments[tailIdx];
        let t2 = this.segments[tailIdx - 1];
        let tAngle = Math.atan2(t1.y - t2.y, t1.x - t2.x);
        
        let t15 = 15 * config.fishSize;
        let t5 = 5 * config.fishSize;

        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(t1.x + Math.cos(tAngle + 0.5) * t15, t1.y + Math.sin(tAngle + 0.5) * t15);
        ctx.lineTo(t1.x + Math.cos(tAngle + Math.PI) * t5, t1.y + Math.sin(tAngle + Math.PI) * t5);
        ctx.lineTo(t1.x + Math.cos(tAngle - 0.5) * t15, t1.y + Math.sin(tAngle - 0.5) * t15);
        ctx.fillStyle = `rgba(255, 255, 255, 0.7)`;
        ctx.fill();
    }
}

function syncKois() {
    while (kois.length < config.fishCount) {
        kois.push(new Koi());
    }
    while (kois.length > config.fishCount) {
        kois.pop();
    }
}

syncKois();

function drawCaustics() {
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    let time = Date.now() * 0.0003 * config.fishSpeed;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        let lx = (Math.sin(time + i) * 200) + width / 2;
        let ly = (Math.cos(time - i) * 200) + height / 2;
        ctx.arc(lx, ly, 400 + Math.sin(time)*100, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
}

function render() {
    ctx.clearRect(0, 0, width, height);

    if (config.enableCaustics) drawCaustics();

    for (let i = foods.length - 1; i >= 0; i--) {
        foods[i].update();
        foods[i].draw(ctx);
        if (foods[i].life <= 0) foods.splice(i, 1);
    }

    for (let fish of kois) {
        fish.update();
        fish.draw(ctx);
    }
    
    for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].update();
        ripples[i].draw(ctx);
        if (ripples[i].life <= 0) ripples.splice(i, 1);
    }

    requestAnimationFrame(render);
}

render();

// Lively Wallpaper Support
function livelyPropertyListener(name, val) {
    const props = {};
    props[name] = { value: val };
    window.wallpaperPropertyListener.applyUserProperties(props);
}
