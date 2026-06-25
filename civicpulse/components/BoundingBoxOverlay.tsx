"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BoundingBox } from "@/types/analysis";

interface Props {
  box: BoundingBox;
  imageWidth: number;
  imageHeight: number;
  severity: number;
  category: string;
}

function getSeverityColor(severity: number): string {
  if (severity >= 4) return "#E8957A";
  if (severity >= 2) return "#D4AF37";
  return "#5BBFBF";
}

function MaskOverlay({
  mask,
  imageWidth,
  imageHeight,
  color,
}: {
  mask: string;
  imageWidth: number;
  imageHeight: number;
  color: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.45;
      ctx.fillRect(0, 0, imageWidth, imageHeight);
    };
    img.src = `data:image/png;base64,${mask}`;
  }, [mask, imageWidth, imageHeight, color]);

  return (
    <canvas
      ref={canvasRef}
      width={imageWidth}
      height={imageHeight}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        mixBlendMode: "multiply",
        pointerEvents: "none",
      }}
    />
  );
}

export default function BoundingBoxOverlay({
  box,
  imageWidth,
  imageHeight,
  severity,
  category,
}: Props) {
  const color = getSeverityColor(severity);

  if (box.mask) {
    return (
      <MaskOverlay
        mask={box.mask}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        color={color}
      />
    );
  }

  const x = (box.xmin / 1000) * imageWidth;
  const y = (box.ymin / 1000) * imageHeight;
  const width = ((box.xmax - box.xmin) / 1000) * imageWidth;
  const height = ((box.ymax - box.ymin) / 1000) * imageHeight;
  const perimeter = 2 * (width + height);
  const labelWidth = Math.max(category.length * 8 + 16, 80);

  return (
    <svg
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      width={imageWidth}
      height={imageHeight}
      viewBox={`0 0 ${imageWidth} ${imageHeight}`}
    >
      <motion.rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="transparent"
        stroke={color}
        strokeWidth={2.5}
        rx={4}
        initial={{ strokeDasharray: perimeter, strokeDashoffset: perimeter, opacity: 0 }}
        animate={{ strokeDashoffset: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.line
        x1={x} y1={y + 12} x2={x} y2={y}
        stroke={color} strokeWidth={3}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      />
      <motion.line
        x1={x} y1={y} x2={x + 12} y2={y}
        stroke={color} strokeWidth={3}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      />
      <motion.g
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <rect
          x={x}
          y={y - 26}
          width={labelWidth}
          height={22}
          rx={4}
          fill={color}
        />
        <text
          x={x + 8}
          y={y - 10}
          fill="white"
          fontSize={11}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="600"
        >
          {category.toUpperCase()}
        </text>
      </motion.g>
    </svg>
  );
}
