import React, { useEffect, useRef, useState } from "react";

interface ClockProps {
  size?: number;
  timeFormat?: "standard" | "24hour";
  hourFormat?: "standard" | "roman";
}

const Clock: React.FC<ClockProps> = ({
  size = 400,
  timeFormat = "24hour",
  hourFormat = "standard",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState<Date>(new Date());

  const radius = size / 2;
  const draw24hour = timeFormat.toLowerCase() === "24hour";
  const drawRoman = !draw24hour && hourFormat.toLowerCase() === "roman";

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.translate(radius, radius);
    let adjustedRadius = radius * 0.9;

    const tick = () => {
      setTime(new Date());
      drawClock(ctx, adjustedRadius);
    };

    const intervalId = setInterval(tick, 1000);
    tick(); // Initial draw

    return () => clearInterval(intervalId);
  }, []);

  const drawClock = (ctx: CanvasRenderingContext2D, radius: number) => {
    drawFace(ctx, radius);
    drawNumbers(ctx, radius);
    drawTicks(ctx, radius);
    drawTime(ctx, radius);
  };

  const drawFace = (ctx: CanvasRenderingContext2D, radius: number) => {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();

    const grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
    grad.addColorStop(0, "#333");
    grad.addColorStop(0.5, "white");
    grad.addColorStop(1, "#333");

    ctx.strokeStyle = grad;
    ctx.lineWidth = radius * 0.1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.05, 0, 2 * Math.PI);
    ctx.fillStyle = "#333";
    ctx.fill();
  };

  const drawNumbers = (ctx: CanvasRenderingContext2D, radius: number) => {
    const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const fontBig = `${radius * 0.15}px Arial`;
    const fontSmall = `${radius * 0.075}px Arial`;

    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    for (let num = 1; num < 13; num++) {
      const ang = (num * Math.PI) / 6;
      ctx.rotate(ang);
      ctx.translate(0, -radius * 0.78);
      ctx.rotate(-ang);
      ctx.font = fontBig;
      ctx.fillStyle = "black";
      ctx.fillText(drawRoman ? romans[num - 1] : num.toString(), 0, 0);
      ctx.rotate(ang);
      ctx.translate(0, radius * 0.78);
      ctx.rotate(-ang);

      if (draw24hour) {
        ctx.rotate(ang);
        ctx.translate(0, -radius * 0.6);
        ctx.rotate(-ang);
        ctx.font = fontSmall;
        ctx.fillStyle = "red";
        ctx.fillText((num + 12).toString(), 0, 0);
        ctx.rotate(ang);
        ctx.translate(0, radius * 0.6);
        ctx.rotate(-ang);
      }
    }
  };

  const drawTicks = (ctx: CanvasRenderingContext2D, radius: number) => {
    for (let tick = 0; tick < 60; tick++) {
      const tickAng = (tick * Math.PI) / 30;
      const tickX = radius * Math.sin(tickAng);
      const tickY = -radius * Math.cos(tickAng);

      ctx.beginPath();
      ctx.lineWidth = radius * 0.01;
      ctx.moveTo(tickX, tickY);
      if (tick % 5 === 0) {
        ctx.lineTo(tickX * 0.88, tickY * 0.88);
      } else {
        ctx.lineTo(tickX * 0.92, tickY * 0.92);
      }
      ctx.stroke();
    }
  };

  const drawTime = (ctx: CanvasRenderingContext2D, radius: number) => {
    const now = time;
    let hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    hour %= 12;
    hour = (hour * Math.PI) / 6 + (minute * Math.PI) / (6 * 60) + (second * Math.PI) / (360 * 60);
    drawHand(ctx, hour, radius * 0.5, radius * 0.05);

    const minuteAngle = (minute * Math.PI) / 30 + (second * Math.PI) / (30 * 60);
    drawHand(ctx, minuteAngle, radius * 0.8, radius * 0.05);

    const secondAngle = (second * Math.PI) / 30;
    drawHand(ctx, secondAngle, radius * 0.9, radius * 0.02, "red");
  };

  const drawHand = (
    ctx: CanvasRenderingContext2D,
    position: number,
    length: number,
    width: number,
    color: string = "black"
  ) => {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.moveTo(0, 0);
    ctx.rotate(position);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-position);
  };

  return (
    <div className="flex justify-center items-center">
      <canvas ref={canvasRef} width={size} height={size} />
    </div>
  );
};

export default Clock;
