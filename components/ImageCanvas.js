import { useEffect, useRef, useState, useCallback } from 'react';
import { html } from '../react-utils.js';

export const ImageCanvas = ({
  imageSrc,
  samplingRate,
  quantizationLevels,
  viewMode = 'fit', // 'fit' or 'actual'
  onStatsUpdate,
  onPixelHover,
  onPixelClick
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [originalImage, setOriginalImage] = useState(null);

  // Helper to calculate bits needed for levels
  const getBitsPerChannel = (levels) => Math.ceil(Math.log2(levels));

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;
    img.onload = () => {
      setOriginalImage(img);
    };
  }, [imageSrc]);

  // Process image
  const processImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size (max 512x512 while maintaining aspect ratio)
    const maxSize = 512;
    let width = originalImage.width;
    let height = originalImage.height;

    if (width > maxSize || height > maxSize) {
      if (width > height) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
    }
    
    // Adjust dimensions to be multiple of samplingRate to avoid edge artifacts
    width = Math.floor(width / samplingRate) * samplingRate;
    height = Math.floor(height / samplingRate) * samplingRate;
    if(width === 0) width = samplingRate;
    if(height === 0) height = samplingRate;

    canvas.width = width;
    canvas.height = height;

    // 1. Sampling (Pixelation) via drawImage scaling
    // Step A: Draw small
    const sampledW = Math.max(1, Math.floor(width / samplingRate));
    const sampledH = Math.max(1, Math.floor(height / samplingRate));

    // Use an offscreen canvas for the pixelation step
    const offCanvas = document.createElement('canvas');
    offCanvas.width = sampledW;
    offCanvas.height = sampledH;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    // Draw original scaled down
    offCtx.drawImage(originalImage, 0, 0, sampledW, sampledH);

    // 2. Quantization (Color Reduction)
    const imageData = offCtx.getImageData(0, 0, sampledW, sampledH);
    const data = imageData.data;
    
    // Pre-calculate quantization lookup table for performance
    const qLevels = quantizationLevels;
    const step = 255 / (qLevels - 1);
    
    for (let i = 0; i < data.length; i += 4) {
      // R
      data[i] = Math.round(Math.round(data[i] / step) * step);
      // G
      data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
      // B
      data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
      // Alpha ignored (kept as is)
    }
    
    offCtx.putImageData(imageData, 0, 0);

    // 3. Draw back to main canvas scaled up (Nearest Neighbor)
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offCanvas, 0, 0, sampledW, sampledH, 0, 0, width, height);

    // Update stats
    const bits = getBitsPerChannel(quantizationLevels);
    onStatsUpdate({
      width: sampledW,
      height: sampledH,
      samplingRate,
      quantizationLevels,
      bitsPerChannel: bits,
      estimatedSizeInBytes: Math.ceil((sampledW * sampledH * bits * 3) / 8)
    });

  }, [originalImage, samplingRate, quantizationLevels, onStatsUpdate]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  // Shared logic for extracting pixel data from event
  const extractPixelData = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const bits = getBitsPerChannel(quantizationLevels);
        
        const toBin = (val) => {
           const step = 255 / (quantizationLevels - 1);
           const index = Math.round(val / step);
           return index.toString(2).padStart(bits, '0');
        };

        return {
          r: pixel[0],
          g: pixel[1],
          b: pixel[2],
          binaryR: toBin(pixel[0]),
          binaryG: toBin(pixel[1]),
          binaryB: toBin(pixel[2]),
          x,
          y
        };
      }
    }
    return null;
  };

  const handleMouseMove = (e) => {
    const data = extractPixelData(e);
    onPixelHover(data);
  };

  const handleClick = (e) => {
    const data = extractPixelData(e);
    if (onPixelClick) {
        onPixelClick(data);
    }
  };

  const handleMouseLeave = () => {
    onPixelHover(null);
  };

  return html`
    <div 
      ref=${containerRef} 
      className=${`relative w-full h-full bg-slate-100 ${viewMode === 'fit' ? 'overflow-hidden flex items-center justify-center' : 'overflow-auto grid place-items-center'}`}
      style=${{ minHeight: '300px' }}
    >
      ${!originalImage && html`<p className="text-slate-400 absolute">Loading...</p>`}
      
      <canvas
        ref=${canvasRef}
        className=${`shadow-sm bg-white ${viewMode === 'fit' ? 'max-w-full max-h-full object-contain w-full h-full' : ''}`}
        style=${{ imageRendering: 'pixelated' }}
        onMouseMove=${handleMouseMove}
        onMouseLeave=${handleMouseLeave}
        onClick=${handleClick}
      />
    </div>
  `;
};