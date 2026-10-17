import React, { useEffect, useRef } from 'react';

export const ParticleGridCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isHovered: false,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouse.isHovered = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Grid particles setup
    const spacing = 48;
    const cols = Math.ceil(width / spacing) + 2;
    const rows = Math.ceil(height / spacing) + 2;
    const particles: {
      baseX: number;
      baseY: number;
      x: number;
      y: number;
      phase: number;
      size: number;
    }[] = [];

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const bx = (c - 1) * spacing;
        const by = (r - 1) * spacing;
        particles.push({
          baseX: bx,
          baseY: by,
          x: bx,
          y: by,
          phase: (c + r) * 0.25,
          size: (c + r) % 5 === 0 ? 2 : 1.2,
        });
      }
    }

    let time = 0;

    const render = () => {
      time += 0.02;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Draw faint connections
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // Ambient sine wave displacement
        const wave = Math.sin(time + p.phase) * 6;
        let dx = 0;
        let dy = 0;

        if (mouse.isHovered) {
          const distX = mouse.x - p.baseX;
          const distY = mouse.y - p.baseY;
          const dist = Math.sqrt(distX * distX + distY * distY);
          const maxDist = 180;
          if (dist < maxDist) {
            const force = (1 - dist / maxDist) * 22;
            dx = -(distX / dist) * force;
            dy = -(distY / dist) * force;
          }
        }

        p.x = p.baseX + dx;
        p.y = p.baseY + wave + dy;

        // Draw particle
        const isAccent = p.size > 1.5;
        const distFromCenter = Math.hypot(p.x - width / 2, p.y - height / 2);
        const vignette = Math.max(0.15, 1 - distFromCenter / (width * 0.75));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        if (isAccent) {
          ctx.fillStyle = `rgba(253, 93, 93, ${0.45 * vignette})`;
        } else {
          ctx.fillStyle = `rgba(56, 189, 248, ${0.22 * vignette})`;
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};
