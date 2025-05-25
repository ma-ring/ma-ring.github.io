const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const result = document.getElementById('result');
const ctxO = overlay.getContext('2d');

// 先頭付近で要素取得
const foxImg    = document.getElementById('foxImg');
const foxLineImg    = document.getElementById('foxLineImg');
const foxCanvas = document.getElementById('foxCanvas');
const label     = document.getElementById('label');
const ctxF      = foxCanvas.getContext('2d');

// 画像ロード時に下地として白狐を一度描画しておく
foxImg.onload = () => {
  ctxF.drawImage(foxImg, 0, 0, foxCanvas.width, foxCanvas.height);
  ctxF.drawImage(foxLineImg, 0, 0, foxCanvas.width, foxCanvas.height);

};

// 3つのターゲット色
const targets = [
  { name: 'ホッキョクギツネ', rgb: [200,200,150] },
  { name: 'アカギツネ',     rgb: [150,150,80] },
  { name: 'ギンギツネ',     rgb: [50,50,10] }
];

// カメラを取得
navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', initCanvas);
})
.catch(err => result.textContent = 'カメラ取得エラー');

function initCanvas() {
  overlay.width = video.videoWidth;
  overlay.height = video.videoHeight;
  // 定期サンプリング
  setInterval(sampleAndClassify, 100);
  requestAnimationFrame(drawOverlay);
}

function drawOverlay() {
  const w = overlay.width, h = overlay.height;
  ctxO.clearRect(0,0,w,h);
  // ヘッダー文字をキャンバスに描画
  ctxO.font = 'bold 24px sans-serif';
  ctxO.fillStyle = 'rgba(255,255,255,0.9)';
  ctxO.textAlign = 'center';
  ctxO.fillText('きつね色判定アプリ', w/2, 140);

  // 円を描画
  const r = Math.min(w,h) * 0.1;
  ctxO.strokeStyle = '#fff';
  ctxO.lineWidth = 4;
  ctxO.setLineDash([10, 5]);
  ctxO.beginPath();
  ctxO.arc(w/2, h/2, r, 0, 2*Math.PI);
  ctxO.stroke();
  requestAnimationFrame(drawOverlay);
}

function sampleAndClassify() {
  // 一時キャンバスに動画をコピー
  const tmp = document.createElement('canvas');
  const ctx = tmp.getContext('2d');
  tmp.width = video.videoWidth;
  tmp.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, tmp.width, tmp.height);

  // 中央円のピクセルを取得
  const cx = tmp.width/2, cy = tmp.height/2;
  const r = Math.min(tmp.width,tmp.height) * 0.1;
  const img = ctx.getImageData(cx-r, cy-r, r*2, r*2);
  const [rAvg,gAvg,bAvg] = averageRGB(img.data);

  // 最近傍色を選択
  let best = targets[0], minD = Infinity;
  targets.forEach(t => {
    const d = colorDistance([rAvg,gAvg,bAvg], t.rgb);
    if (d < minD) { minD = d; best = t; }
  });

  // 結果表示
  //result.textContent = best.name;
  //result.style.background = `rgba(${Math.round(rAvg)}, ${Math.round(gAvg)}, ${Math.round(bAvg)}, 0.8)`;

  // 色判定は既存の best.name を使う
  label.textContent = best.name;

  // 狐イラストを平均色で着色
  ctxF.clearRect(0, 0, foxCanvas.width, foxCanvas.height);
  // 1) 背景を平均色で塗りつぶし
  ctxF.fillStyle = `rgba(${Math.round(rAvg)}, ${Math.round(gAvg)}, ${Math.round(bAvg)}`;
  ctxF.fillRect(0, 0, foxCanvas.width, foxCanvas.height);
  // 2) 白シルエットをマスク
  ctxF.globalCompositeOperation = 'destination-in';
  ctxF.drawImage(foxImg, 0, 0, foxCanvas.width, foxCanvas.height);
  // 3) 合成モードを戻す
  ctxF.globalCompositeOperation = 'source-over';
  ctxF.drawImage(foxLineImg, 0, 0, foxCanvas.width, foxCanvas.height);

}

function averageRGB(data) {
  let r=0,g=0,b=0,count=0;
  for (let i=0; i<data.length; i+=4) {
    const x = ((i/4) % (overlay.width*2)); // 無視
    const dx = ( (i/4) % (overlay.width*2) ) - overlay.width; // ダミー
    // 円内のピクセルのみカウント
    const px = (i/4) % (overlay.width) - overlay.width/2;
    const py = Math.floor((i/4)/overlay.width) - overlay.height/2;
    //if (px*px + py*py <= (Math.min(overlay.width,overlay.height)*0.1)**2) {
      r += data[i];
      g += data[i+1];
      b += data[i+2];
      count++;
    //}
  }

  return count>0 ? [r/count, g/count, b/count] : [0,0,0];
}

function colorDistance(a, b) {
  return Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2]);
}