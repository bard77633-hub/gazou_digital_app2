import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sliders, MonitorPlay, Maximize, Minimize } from 'lucide-react';
import { html } from './react-utils.js';
import { ImageCanvas } from './components/ImageCanvas.js';
import { ExplanationPanel } from './components/ExplanationPanel.js';
import { DataViewer } from './components/DataViewer.js';
import { Button } from './components/Button.js';
import { SampleImage } from './constants.js';

const App = () => {
  // State
  const [imageSrc, setImageSrc] = useState(SampleImage.LANDSCAPE);
  const [samplingRate, setSamplingRate] = useState(1);
  const [quantizationLevels, setQuantizationLevels] = useState(256);
  const [isEncodingVisible, setIsEncodingVisible] = useState(false);
  const [viewMode, setViewMode] = useState('fit'); // 'fit' or 'actual'
  const [stats, setStats] = useState({
    width: 0, height: 0, samplingRate: 1, quantizationLevels: 256, bitsPerChannel: 8, estimatedSizeInBytes: 0
  });
  
  // Pixel inspection state
  const [hoveredPixel, setHoveredPixel] = useState(null);
  const [lockedPixel, setLockedPixel] = useState(null);
  
  const fileInputRef = useRef(null);

  // Handlers
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result);
          // Reset pixel lock when image changes
          setLockedPixel(null);
          setHoveredPixel(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePixelHover = (data) => {
    // Only update hover state if not locked
    if (!lockedPixel) {
      setHoveredPixel(data);
    }
  };

  const handlePixelClick = (data) => {
    if (lockedPixel) {
      // Unlock if already locked
      setLockedPixel(null);
      // Immediately show the current pixel under mouse
      setHoveredPixel(data);
    } else if (data) {
      // Lock the current pixel
      setLockedPixel(data);
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'fit' ? 'actual' : 'fit');
  };

  const samplingOptions = [1, 2, 4, 8, 16, 32, 64];
  // Modified order: High quality (256) -> Low quality (2) to match sampling slider direction (Left=Best)
  const quantizationOptions = [256, 16, 8, 4, 2];

  return html`
    <div className="flex flex-col h-screen bg-slate-50">
      <!-- Header -->
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <${MonitorPlay} className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">画像のデジタル化体験 <span className="text-sm font-normal text-slate-500 ml-2">情報Ⅰ 教材</span></h1>
        </div>
        <div className="flex gap-2">
            <${Button} 
              variant=${isEncodingVisible ? 'primary' : 'outline'}
              onClick=${() => setIsEncodingVisible(!isEncodingVisible)}
            >
              符号化表示 ${isEncodingVisible ? 'ON' : 'OFF'}
            <//>
        </div>
      </header>

      <!-- Main Content -->
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row">
          
          <!-- Left Panel: Controls & Input -->
          <aside className="w-full lg:w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 overflow-y-auto z-0">
            
            <!-- Image Selection -->
            <section>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <${ImageIcon} className="w-4 h-4" /> 画像選択
              </h2>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                ${Object.entries(SampleImage).map(([key, url]) => html`
                  <button
                    key=${key}
                    onClick=${() => setImageSrc(url)}
                    className=${`h-16 rounded-md overflow-hidden border-2 transition-all ${imageSrc === url ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent hover:border-slate-300'}`}
                  >
                    <img src=${url} alt=${key} className="w-full h-full object-cover" />
                  </button>
                `)}
              </div>

              <input 
                type="file" 
                ref=${fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg" 
                onChange=${handleFileUpload} 
              />
              <${Button} variant="secondary" fullWidth=${true} onClick=${() => fileInputRef.current?.click()}>
                <${Upload} className="w-4 h-4" /> 自分の画像をアップロード
              <//>
            </section>

            <!-- Sliders -->
            <section className="space-y-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <${Sliders} className="w-4 h-4" /> パラメータ調整
              </h2>

              <!-- Sampling Slider -->
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">標本化レベル (画素の粗さ)</label>
                  <span className="text-sm font-mono bg-blue-100 text-blue-800 px-2 rounded">
                    ${samplingRate} px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max=${samplingOptions.length - 1}
                  step="1"
                  value=${samplingOptions.indexOf(samplingRate)}
                  onChange=${(e) => setSamplingRate(samplingOptions[parseInt(e.target.value)])}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-1 text-xs text-slate-400">
                  <span>細かい (高画質)</span>
                  <span>粗い (低画質)</span>
                </div>
              </div>

              <!-- Quantization Slider -->
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">量子化レベル (色の段階)</label>
                  <span className="text-sm font-mono bg-green-100 text-green-800 px-2 rounded">
                    ${quantizationLevels} 階調
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max=${quantizationOptions.length - 1}
                  step="1"
                  value=${quantizationOptions.indexOf(quantizationLevels)}
                  onChange=${(e) => setQuantizationLevels(quantizationOptions[parseInt(e.target.value)])}
                  className="w-full accent-green-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                 <div className="flex justify-between mt-1 text-xs text-slate-400">
                  <span>多い (高画質)</span>
                  <span>少ない (低画質)</span>
                </div>
              </div>
            </section>
          </aside>

          <!-- Center: Canvas Area -->
          <section className="flex-1 bg-slate-100 p-6 flex flex-col relative overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <!-- Main Image Area -->
               <div className="flex-1 relative overflow-hidden bg-slate-100">
                 <${ImageCanvas} 
                    imageSrc=${imageSrc} 
                    samplingRate=${samplingRate}
                    quantizationLevels=${quantizationLevels}
                    viewMode=${viewMode}
                    onStatsUpdate=${setStats}
                    onPixelHover=${handlePixelHover}
                    onPixelClick=${handlePixelClick}
                 />
               </div>

               <!-- Footer Control Bar -->
               <div className="h-14 border-t border-slate-200 bg-white flex items-center justify-between px-4 shrink-0 z-10">
                  <!-- Info Badges -->
                  <div className="flex gap-2 items-center">
                     <div className="bg-slate-100 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full font-medium">
                       標本化: ${samplingRate}pxブロック
                     </div>
                     <div className="bg-slate-100 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full font-medium">
                       量子化: ${quantizationLevels}階調 (${Math.ceil(Math.log2(quantizationLevels))}bit)
                     </div>
                  </div>

                  <!-- View Mode Toggle -->
                  <button
                    onClick=${toggleViewMode}
                    className="hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors font-medium"
                    title=${viewMode === 'fit' ? "原寸サイズで表示" : "画面に合わせて拡大"}
                  >
                    ${viewMode === 'fit' 
                      ? html`<${Minimize} className="w-3.5 h-3.5" /> 原寸表示` 
                      : html`<${Maximize} className="w-3.5 h-3.5" /> 拡大表示`
                    }
                  </button>
               </div>
            </div>
          </section>

          <!-- Right: Data & Explanation -->
          <aside className="w-full lg:w-96 bg-slate-50 border-l border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="flex-1 min-h-[300px]">
              ${isEncodingVisible ? html`
                 <${DataViewer} 
                   stats=${stats} 
                   hoveredPixel=${lockedPixel || hoveredPixel} 
                   isEncodingView=${isEncodingVisible}
                   isLocked=${!!lockedPixel}
                 />
              ` : html`
                 <${ExplanationPanel} />
              `}
            </div>
            
            ${isEncodingVisible && html`
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                <p>現在「符号化データ」を表示中です。<br/>画像をタップするとデータを固定できます。</p>
              </div>
            `}
          </aside>

        </div>
      </main>
    </div>
  `;
};

export default App;