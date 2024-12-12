import { Component, AfterViewInit } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  ngOnInit() {
    this.createFireworks();
  }

  createFireworks() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const rockets: any[] = [];
    const stars: any[] = []; // 新增星星陣列
    let fireworkCount = 0;
    let textAlpha = 0;
    let showText = false;
    let textTimer = 0;
    let textHue = 0;
    let textShowInterval = 0; // 控制文字顯示間隔的計時器

    // 創建星星
    function createStars() {
      for (let i = 0; i < 200; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          alpha: Math.random(),
          flickerDelta: 0.05 * Math.random(),
        });
      }
    }

    // 初始化星星
    createStars();

    // 定義一組協調的顏色
    const colorPalette = [
      'hsl(350, 90%, 60%)', // 鮮豔紅
      'hsl(320, 90%, 65%)', // 亮粉紅
      'hsl(280, 90%, 70%)', // 亮紫
      'hsl(200, 90%, 65%)', // 亮藍
      'hsl(160, 90%, 70%)', // 亮綠
      'hsl(40, 90%, 60%)', // 金黃
    ];

    // 火箭類
    function Rocket(this: any, x: number, y: number) {
      this.x = x;
      this.y = y;
      // 在手機版時，將目標高度調低
      const targetHeightFactor = window.innerWidth < 768 ? 0.4 : 0.6;
      this.targetY = y - Math.random() * (canvas.height * targetHeightFactor);
      const pattern = Math.floor(Math.random() * 3);
      switch (pattern) {
        case 0:
          this.velocity = {
            x: 0,
            y: -12 - Math.random() * 3,
          };
          break;
        case 1:
          // 在手機版時，將火箭的水平速度範圍縮小
          const horizontalSpeed =
            window.innerWidth < 768
              ? Math.random() * 2 - 1 // 手機版時水平速度範圍為 -1 到 1
              : Math.random() * 4 - 2; // 桌面版時水平速度範圍為 -2 到 2
          this.velocity = {
            x: horizontalSpeed,
            y: -10 - Math.random() * 3,
          };
          break;
        case 2:
          // 在手機版時，將火箭的水平擺動幅度縮小
          const amplitude = window.innerWidth < 768 ? 1.5 : 3;
          this.velocity = {
            x: Math.cos(Date.now() * 0.001) * amplitude,
            y: -8 - Math.random() * 3,
          };
          break;
      }
      this.color =
        colorPalette[Math.floor(Math.random() * colorPalette.length)];
      this.trail = [];
      this.pattern = pattern;
    }

    // 粒子類
    function Particle(
      this: any,
      x: number,
      y: number,
      color: string,
      explosionType: number = 0
    ) {
      this.x = x;
      this.y = y;
      let angle = Math.random() * Math.PI * 2;
      let speed;

      // 在手機版時，將粒子的擴散範圍縮小
      const mobileFactor = window.innerWidth < 768 ? 0.6 : 1;

      switch (explosionType) {
        case 0:
          speed = (Math.random() * 8 + 2) * mobileFactor;
          this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          };
          break;
        case 1:
          angle = Math.random() * Math.PI * 2;
          const r = (Math.random() * 5 + 3) * mobileFactor;
          this.velocity = {
            x: r * (16 * Math.pow(Math.sin(angle), 3)),
            y:
              -r *
              (13 * Math.cos(angle) -
                5 * Math.cos(2 * angle) -
                2 * Math.cos(3 * angle) -
                Math.cos(4 * angle)),
          };
          break;
        case 2:
          speed = (Math.random() * 6 + 3) * mobileFactor;
          this.velocity = {
            x: Math.cos(angle * 5) * speed,
            y: Math.sin(angle * 5) * speed,
          };
          break;
        case 3:
          const points = 5;
          const innerRadius = 2 * mobileFactor;
          const outerRadius = 5 * mobileFactor;
          const starAngle =
            (angle % ((Math.PI * 2) / points)) - Math.PI / points;
          const radius =
            innerRadius +
            (outerRadius - innerRadius) *
              Math.abs(Math.cos((points * starAngle) / 2));
          speed = (Math.random() * 7 + 3) * mobileFactor;
          this.velocity = {
            x: Math.cos(angle) * speed * radius,
            y: Math.sin(angle) * speed * radius,
          };
          break;
        case 4:
          showText = true;
          textTimer = 0;
          textShowInterval = 0;
          speed = (Math.random() * 4 + 2) * mobileFactor;
          this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          };
          break;
      }

      this.color =
        Math.random() > 0.5
          ? color
          : colorPalette[Math.floor(Math.random() * colorPalette.length)];
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
      this.radius = Math.random() * 3 + 1;
    }

    function createExplosion(x: number, y: number, color: string) {
      fireworkCount++;
      const explosionType =
        fireworkCount === 4 ? 4 : Math.floor(Math.random() * 4);
      const particleCount = explosionType === 1 ? 150 : 100;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new (Particle as any)(x, y, color, explosionType));
      }
    }

    function drawHeart(x: number, y: number, size: number) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + size / 2, y - size / 2, x + size, y, x, y + size);
      ctx.bezierCurveTo(x - size, y, x - size / 2, y - size / 2, x, y);
      ctx.fill();
    }

    function animate() {
      requestAnimationFrame(animate);

      // 繪製漸層背景
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#000022'); // 更深的藍色
      gradient.addColorStop(1, '#000044'); // 更深的藍色
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 繪製星星
      stars.forEach((star) => {
        star.alpha += star.flickerDelta;
        if (star.alpha >= 1 || star.alpha <= 0) {
          star.flickerDelta = -star.flickerDelta;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
      });

      // 更新和繪製火箭
      for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i];
        if (rocket.pattern === 2) {
          const amplitude = window.innerWidth < 768 ? 1.5 : 3;
          rocket.velocity.x = Math.cos(Date.now() * 0.001) * amplitude;
        }
        rocket.x += rocket.velocity.x;
        rocket.y += rocket.velocity.y;
        rocket.velocity.y += 0.1;

        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = rocket.color;
        ctx.fill();

        if (rocket.velocity.y >= 0) {
          createExplosion(rocket.x, rocket.y, rocket.color);
          rockets.splice(i, 1);
        }
      }

      // 更新和繪製粒子
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.velocity.x;
        p.y += p.velocity.y;
        p.velocity.y += 0.05;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', `, ${p.alpha})`);
        ctx.fill();
      }

      // 處理文字顯示
      if (showText) {
        textTimer++;
        if (textTimer < 50) {
          textAlpha = Math.min(1, textAlpha + 0.02);
        } else if (textTimer > 500) {
          // 延長顯示時間
          textAlpha = Math.max(0, textAlpha - 0.01); // 降低淡出速度
          if (textAlpha === 0) {
            showText = false;
            textShowInterval = 0;
          }
        }

        textHue = (textHue + 1) % 360;

        const fontSize = window.innerWidth < 768 ? '20px' : '40px';
        const message =
          window.innerWidth < 768
            ? 'Happy 7th Anniversary!\n挖哀哩 ❤️\n٩(◕‿◕｡)۶'
            : 'Happy 7th Anniversary!\n挖哀哩 ❤️ ٩(◕‿◕｡)۶';

        ctx.font = `${fontSize} "Comic Sans MS", "Segoe UI Emoji", Arial`;
        ctx.fillStyle = `hsla(${textHue}, 90%, 60%, ${textAlpha})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const lines = message.split('\n');
        const lineHeight = parseInt(fontSize) * 1.2;
        const totalHeight = lineHeight * lines.length;
        const startY = canvas.height / 2 - totalHeight / 2;

        lines.forEach((line, index) => {
          ctx.fillText(line, canvas.width / 2, startY + lineHeight * index);
        });

        const heartCount = 8;
        for (let i = 0; i < heartCount; i++) {
          const angle = (i / heartCount) * Math.PI * 2;
          const radius = window.innerWidth < 768 ? 60 : 100;
          const x =
            canvas.width / 2 + Math.cos(angle + textTimer * 0.02) * radius;
          const y =
            canvas.height / 2 + Math.sin(angle + textTimer * 0.02) * radius;
          ctx.fillStyle = `hsla(${
            (textHue + i * 45) % 360
          }, 90%, 60%, ${textAlpha})`;
          drawHeart(x, y, window.innerWidth < 768 ? 10 : 20);
        }
      } else {
        // 當文字消失後，開始計時
        textShowInterval++;
        // 每隔約8秒(480幀)重新顯示文字
        if (textShowInterval > 480) {
          showText = true;
          textTimer = 0;
          textAlpha = 0;
        }
      }

      // 隨機發射新的火箭
      if (Math.random() < 0.02 && rockets.length < 5) {
        const x = Math.random() * canvas.width;
        rockets.push(new (Rocket as any)(x, canvas.height));
      }
    }

    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createStars(); // 重新創建星星
    });
  }
}
