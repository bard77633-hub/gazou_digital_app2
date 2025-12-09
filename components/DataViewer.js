import { Binary, Cpu, Database, Lock, LockOpen } from 'lucide-react';
import { html } from '../react-utils.js';

const ChannelRow = ({ label, value, binary, color, bg }) => html`
  <div className=${`flex items-center justify-between p-2 rounded ${bg}`}>
    <span className=${`font-bold w-4 ${color}`}>${label}</span>
    <span className="font-mono text-sm text-slate-600">${value}</span>
    <span className="font-mono font-bold text-sm tracking-widest text-slate-800">${binary}</span>
  </div>
`;

export const DataViewer = ({ stats, hoveredPixel, isEncodingView, isLocked }) => {
  return html`
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800 border-b pb-2">
        <${Binary} className="w-5 h-5 text-blue-600" />
        データ表現と符号化
      </h3>

      <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
        
        <!-- Global Stats -->
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">論理画像サイズ</span>
            <span className="font-mono font-bold">${stats.width} × ${stats.height} px</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">解像度 (参考値)</span>
            <span className="font-mono font-bold text-slate-700">約 ${Math.round(96 / stats.samplingRate)} ppi</span>
          </div>
          <div className="text-[10px] text-slate-400 text-right -mt-2 mb-1">※画面解像度 96ppi と仮定</div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">色深度 (1色あたり)</span>
            <span className="font-mono font-bold text-blue-600">${stats.bitsPerChannel} bit</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">総画素数</span>
            <span className="font-mono font-bold">${(stats.width * stats.height).toLocaleString()} px</span>
          </div>
          
          <div className="bg-slate-100 p-3 rounded-lg mt-2">
             <div className="flex items-center gap-2 mb-1 text-slate-700 font-semibold text-xs uppercase">
                <${Database} className="w-3 h-3" />
                推定データサイズ (生データ)
             </div>
             <div className="text-2xl font-mono font-bold text-slate-800">
               ${stats.estimatedSizeInBytes.toLocaleString()} <span className="text-sm font-normal text-slate-500">bytes</span>
             </div>
             <div className="text-xs text-slate-500 mt-1">
               ${stats.width}×${stats.height}×${stats.bitsPerChannel}×3(RGB) ÷ 8
             </div>
          </div>
        </div>

        <!-- Pixel Inspector -->
        <div className=${`transition-all duration-300 ${isEncodingView ? 'opacity-100' : 'opacity-50 blur-[1px]'}`}>
          <div className="flex items-center justify-between mt-6 mb-3">
            <h4 className="font-bold text-slate-700 flex items-center gap-2">
              <${Cpu} className="w-4 h-4" />
              ピクセルデータ解析
            </h4>
            ${isLocked && html`
              <span className="text-xs font-semibold text-red-500 flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                <${Lock} className="w-3 h-3" /> 固定中
              </span>
            `}
            ${!isLocked && hoveredPixel && html`
               <span className="text-xs text-slate-400 flex items-center gap-1">
                <${LockOpen} className="w-3 h-3" /> クリックで固定
              </span>
            `}
          </div>

          ${hoveredPixel ? html`
            <div className=${`bg-slate-50 border rounded-lg p-3 space-y-3 ${isLocked ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-10 h-10 rounded border border-slate-300 shadow-inner"
                  style=${{ backgroundColor: `rgb(${hoveredPixel.r}, ${hoveredPixel.g}, ${hoveredPixel.b})` }}
                />
                <div className="text-xs text-slate-500">
                  座標: (${hoveredPixel.x}, ${hoveredPixel.y})
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <${ChannelRow} label="R" value=${hoveredPixel.r} binary=${hoveredPixel.binaryR} color="text-red-600" bg="bg-red-50" />
                <${ChannelRow} label="G" value=${hoveredPixel.g} binary=${hoveredPixel.binaryG} color="text-green-600" bg="bg-green-50" />
                <${ChannelRow} label="B" value=${hoveredPixel.b} binary=${hoveredPixel.binaryB} color="text-blue-600" bg="bg-blue-50" />
              </div>
              
              <div className="text-[10px] text-center text-slate-400 mt-1">
                ${isLocked ? 'もう一度クリックすると解除します' : '画像上のピクセルにカーソルを合わせると変化します'}
              </div>
            </div>
          ` : html`
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm p-4 text-center">
              画像の上にマウスを乗せると<br/>2進数データが表示されます
            </div>
          `}
        </div>
      </div>
    </div>
  `;
};