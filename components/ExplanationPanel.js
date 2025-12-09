import { Info, Grid3X3, Layers, FileDigit } from 'lucide-react';
import { html } from '../react-utils.js';

export const ExplanationPanel = () => {
  return html`
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-full overflow-y-auto custom-scrollbar">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800">
        <${Info} className="w-5 h-5 text-blue-600" />
        学習のポイント
      </h3>
      
      <div className="space-y-6">
        <section>
          <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-2">
            <${Grid3X3} className="w-4 h-4" />
            1. 標本化 (Sampling)
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            画像を細かいマス目（画素・ピクセル）に区切ることです。
            標本化レベル（解像度）が高いほど画像は滑らかになりますが、データ量は増えます。
            逆にレベルを下げると、モザイク状（ジャギー）になります。
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-2">
            <${Layers} className="w-4 h-4" />
            2. 量子化 (Quantization)
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            区切られた各画素の色を、近い数値に置き換えることです。
            階調数（量子化レベル）が多いほど自然な色合いになります。
            階調を減らすと、色の境界が目立つようになります（ポスタリゼーション）。
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-2">
            <${FileDigit} className="w-4 h-4" />
            3. 符号化 (Encoding)
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            量子化された数値を2進数（0と1）に変換して記録することです。
            例えば、8階調（0〜7）なら3ビット（000〜111）で表現できます。
            一般的にフルカラー画像は、R(赤)G(緑)B(青)それぞれ256階調（8ビット）を使用し、1画素あたり24ビットを使います。
          </p>
        </section>
        
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <h5 className="text-xs font-bold text-blue-800 uppercase mb-1">データ量の計算式</h5>
          <p className="text-xs text-blue-700 font-mono">
            データ量(bit) = 横画素数 × 縦画素数 × 1画素あたりのビット数
          </p>
        </div>
      </div>
    </div>
  `;
};