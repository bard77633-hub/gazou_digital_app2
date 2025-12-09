import React, { useState, useRef } from 'react';
import { ImageCanvas } from './components/ImageCanvas';
import { ExplanationPanel } from './components/ExplanationPanel';
import { DataViewer } from './components/DataViewer';
import { Button } from './components/Button';
import { SampleImage, ImageStats, PixelData } from './types';
import { Upload, Image as ImageIcon, Sliders, MonitorPlay } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [imageSrc, setImageSrc] = useState<string>(SampleImage.LANDSCAPE);
  const [samplingRate, setSamplingRate] = useState<number>(1);
  const [quantizationLevels, setQuantizationLevels] = useState<number>(256);
  const [isEncodingVisible, setIsEncodingVisible] = useState<boolean>(false);
  const [stats, setStats] = useState<ImageStats>({
    width: 0, height: 0, samplingRate: 1, quantizationLevels: 256, bitsPerChannel: 8, estimatedSizeInBytes: 0
  });
  const [hoveredPixel, setHoveredPixel] = useState<PixelData | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const samplingOptions = [1, 2, 4, 8, 16, 32, 64];
  const quantizationOptions = [256, 16, 8, 4, 2];

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <MonitorPlay className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">画像のデジタル化体験 <span className="text-sm font-normal text-slate-500 ml-2">情報Ⅰ 教材</span></h1>
        </div>
        <div className="flex gap-2">
            {/* Toggle Encoding View button can be here or handled by layout presence */}
            <Button 
              variant={isEncodingVisible ? 'primary' : 'outline'}
              onClick={() => setIsEncodingVisible(!isEncodingVisible)}
            >
              符号化表示 {isEncodingVisible ? 'ON' : 'OFF'}
            </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row">
          
          {/* Left Panel: Controls & Input */}
          <aside className="w-full lg:w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 overflow-y-auto z-0">
            
            {/* Image Selection */}
            <section>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> 画像選択
              </h2>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(SampleImage).map(([key, url]) => (
                  <button
                    key={key}
                    onClick={() => setImageSrc(url)}
                    className={`h-16 rounded-md overflow-hidden border-2 transition-all ${imageSrc === url ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent hover:border-slate-300'}`}
                  >
                    <img src={url} alt={key} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg" 
                onChange={handleFileUpload} 
              />
              <Button variant="secondary" fullWidth onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4" /> 自分の画像をアップロード
              </Button>
            </section>

            {/* Sliders */}
            <section className="space-y-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4" /> パラメータ調整
              </h2>

              {/* Sampling Slider */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">標本化レベル (画素の粗さ)</label>
                  <span className="text-sm font-mono bg-blue-100 text-blue-800 px-2 rounded">
                    {samplingRate} px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={samplingOptions.length - 1}
                  step="1"
                  value={samplingOptions.indexOf(samplingRate)}
                  onChange={(e) => setSamplingRate(samplingOptions[parseInt(e.target.value)])}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-1 text-xs text-slate-400">
                  <span>細かい</span>
                  <span>粗い</span>
                </div>
              </div>

              {/* Quantization Slider */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">量子化レベル (色の段階)</label>
                  <span className="text-sm font-mono bg-green-100 text-green-800 px-2 rounded">
                    {quantizationLevels} 階調
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={quantizationOptions.length - 1}
                  step="1"
                  value={quantizationOptions.indexOf(quantizationLevels)} // Reverse index for slider logic if needed, but here: 256 is index 0
                  onChange={(e) => setQuantizationLevels(quantizationOptions[parseInt(e.target.value)])}
                  className="w-full accent-green-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  style={{ direction: 'rtl' }} // Reverse direction so right is higher quality? No, let's keep left=high quality consistent or label properly. 
                  // Let's standard: Left (min val) -> Right (max val).
                  // Array is [256, 16, 8, 4, 2]. Index 0 is 256. 
                  // If we want Right to be "Better Quality", we should reverse array or logic.
                  // Let's make Right = High Quality (256).
                />
                 {/* Correcting slider logic for intuitive UX: Right = High Quality */}
                 <div className="flex justify-between mt-1 text-xs text-slate-400">
                  <span>高画質 (256)</span>
                  <span>低画質 (2)</span>
                </div>
              </div>
            </section>
          </aside>

          {/* Center: Canvas Area */}
          <section className="flex-1 bg-slate-100 p-6 flex flex-col relative overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0">
               <div className="flex-1 relative">
                 <ImageCanvas 
                    imageSrc={imageSrc} 
                    samplingRate={samplingRate}
                    quantizationLevels={quantizationLevels}
                    onStatsUpdate={setStats}
                    onPixelHover={setHoveredPixel}
                 />
                 
                 {/* Overlay Labels */}
                 <div className="absolute bottom-4 left-4 flex gap-2">
                   <div className="bg-black/70 backdrop-blur text-white text-xs px-3 py-1 rounded-full">
                     標本化: {samplingRate}pxブロック
                   </div>
                   <div className="bg-black/70 backdrop-blur text-white text-xs px-3 py-1 rounded-full">
                     量子化: {quantizationLevels}階調 ({Math.ceil(Math.log2(quantizationLevels))}bit)
                   </div>
                 </div>
               </div>
            </div>
          </section>

          {/* Right: Data & Explanation */}
          <aside className="w-full lg:w-96 bg-slate-50 border-l border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="flex-1 min-h-[300px]">
              {isEncodingVisible ? (
                 <DataViewer stats={stats} hoveredPixel={hoveredPixel} isEncodingView={isEncodingVisible} />
              ) : (
                 <ExplanationPanel />
              )}
            </div>
            
            {/* Toggle Helper if explanation is hidden */}
            {isEncodingVisible && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                <p>現在「符号化データ」を表示中です。<br/>解説を見るには上部のボタンで切り替えてください。</p>
              </div>
            )}
          </aside>

        </div>
      </main>
    </div>
  );
};

export default App;