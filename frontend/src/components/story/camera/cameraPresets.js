/**
 * Camera Filter Presets - Hệ thống bộ lọc Story chuẩn Instagram
 */
export const CAMERA_FILTER_PRESETS = [
  { id: 'normal', name: 'Gốc', css: 'none', previewColor: 'from-neutral-700 to-neutral-900' },
  { id: 'vintage', name: 'Vintage', css: 'sepia(0.45) contrast(1.1) brightness(0.95)', previewColor: 'from-amber-600 to-amber-950' },
  { id: 'noir', name: 'B&W Noir', css: 'grayscale(1) contrast(1.2)', previewColor: 'from-neutral-400 to-black' },
  { id: 'cyberpunk', name: 'Cyber', css: 'hue-rotate(180deg) saturate(1.8) contrast(1.2)', previewColor: 'from-cyan-500 to-pink-600' },
  { id: 'sunset', name: 'Sunset', css: 'sepia(0.3) saturate(1.4) brightness(1.05)', previewColor: 'from-orange-500 to-rose-700' },
  { id: 'cool', name: 'Cool', css: 'hue-rotate(-20deg) saturate(1.2) brightness(1.05)', previewColor: 'from-sky-400 to-blue-800' },
  { id: 'vivid', name: 'Vivid', css: 'saturate(2) contrast(1.15)', previewColor: 'from-emerald-400 to-violet-700' }
];

