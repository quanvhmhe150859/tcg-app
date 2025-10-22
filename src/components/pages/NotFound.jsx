import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function NotFound() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Thiết lập kích thước canvas chiếm toàn màn hình
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Lớp Particle cho bong bóng
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 15 + 5;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
      }

      update(mouse) {
        // Di chuyển bong bóng
        this.x += this.speedX;
        this.y += this.speedY;

        // Giới hạn biên
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Tương tác với chuột
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          this.size = Math.min(this.size + 0.5, 25);
        } else {
          this.size = Math.max(this.size - 0.1, 5);
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
      }
    }

    // Khởi tạo bong bóng
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < 50; i++) {
        particlesRef.current.push(new Particle());
      }
    };
    initParticles();

    // Theo dõi vị trí chuột
    const mouse = { x: null, y: null };
    canvas.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    // Thêm bong bóng khi nhấp chuột
    canvas.addEventListener("click", (e) => {
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push(new Particle());
      }
    });

    // Vòng lặp animation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((particle) => {
        particle.update(mouse);
        particle.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Dọn dẹp
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-900 text-white text-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ zIndex: 0 }}
      />
      <div className="relative z-10 max-w-md p-8">
        <h1 className="text-6xl font-bold text-red-400 mb-4">404</h1>
        <p className="text-lg mb-6">Trang bạn đang truy cập không tồn tại hoặc đã bị xóa.</p>
        <button
          onClick={() => navigate("/")}
          className="button-blue"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}