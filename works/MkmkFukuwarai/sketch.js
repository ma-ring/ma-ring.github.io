let bodyImg;
let partImgs = [];
let parts = [];
let draggingPart = null;
let offsetX, offsetY;
let correctImg;
let answerMode = false;
let similarity = null;

function preload() {
  bodyImg = loadImage('img/body.png');
  correctImg = loadImage('img/correct.png');
  // 1.png ～ 12.png を自動で読み込む
  for (let i = 1; i <= 12; i++) {
    partImgs.push(loadImage(`img/parts/${i}.png`));
  }
}

function setup() {
  createCanvas(bodyImg.width, bodyImg.height);
  resetParts();
}

function resetParts() {
  parts = [];
  for (let i = 0; i < partImgs.length; i++) {
    const w = partImgs[i].width;
    const h = partImgs[i].height;
    const x = random(0, width - w);
    const y = random(0, height - h);
    parts.push({
      img: partImgs[i],
      x: x,
      y: y,
      w: w,
      h: h
    });
  }
  answerMode = false;
  similarity = null;
}

function draw() {
  background(255);
  image(bodyImg, 0, 0);
  for (let part of parts) {
    image(part.img, part.x, part.y);
  }
  // ヒントボタン押下時のみ正解画像を重ね表示
  if (window.showCorrectHintPressed) {
    push();
    tint(0,255,0, 128);
    image(correctImg, 0, 0, width, height);
    pop();
  }
  // 回答モード時に完成度・メッセージを表示
  if (answerMode && similarity !== null) {
    fill(0, 200);
    rect(0, 0, width, 110);
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("完成度: " + nf(similarity, 1, 2) + "%", width/2, 32);
    textSize(22);
    let msg = "";
    if (similarity >= 100) {
      msg = "すごい、君はもうミャクミャク様の一部だ";
    } else if (similarity >= 80) {
      msg = "ほぼ完ぺき！ミャクミャク様マスターだね";
    } else if (similarity >= 60) {
      msg = "惜しい、万博行ってミャクミャク様について学んでこよう";
    } else {
      msg = "残念！またチャレンジしてね！";
    }
    text(msg, width/2, 75);
  }
}



function mousePressed() {
  for (let i = parts.length - 1; i >= 0; i--) {
    let part = parts[i];
    if (
      mouseX > part.x && mouseX < part.x + part.w &&
      mouseY > part.y && mouseY < part.y + part.h
    ) {
      draggingPart = part;
      offsetX = mouseX - part.x;
      offsetY = mouseY - part.y;
      // ドラッグ中のパーツを最前面に
      parts.push(parts.splice(i, 1)[0]);
      break;
    }
  }
}

function mouseDragged() {
  if (draggingPart && !answerMode) {
    // 新しい座標を計算
    let newX = mouseX - offsetX;
    let newY = mouseY - offsetY;
    // キャンバス内に収める
    newX = constrain(newX, 0, width - draggingPart.w);
    newY = constrain(newY, 0, height - draggingPart.h);
    draggingPart.x = newX;
    draggingPart.y = newY;
  }
}

function checkAnswer() {
  // キャンバス内容を取得
  loadPixels();
  let userPixels = pixels.slice();
  // correctImgを一時的にキャンバスに描画してピクセル取得
  push();
  image(correctImg, 0, 0, width, height);
  loadPixels();
  let correctPixels = pixels.slice();
  pop();
  // bodyImgを一時的にキャンバスに描画してピクセル取得
  push();
  image(bodyImg, 0, 0, width, height);
  loadPixels();
  let bodyPixels = pixels.slice();
  pop();
  // ユーザーのピクセルに戻す
  updatePixels();
  // ピクセルごとに比較（bodyImgとcorrectImgが同じ部分は除外）
  let match = 0;
  let total = 0;
  for (let i = 0; i < userPixels.length; i += 4) {
    // bodyImgとcorrectImgのピクセルが同じなら台紙部分なので除外
    if (
      bodyPixels[i] === correctPixels[i] &&
      bodyPixels[i+1] === correctPixels[i+1] &&
      bodyPixels[i+2] === correctPixels[i+2] &&
      bodyPixels[i+3] === correctPixels[i+3]
    ) {
      continue;
    }
    // パーツ部分のみ一致率を計算
    if (
      userPixels[i] === correctPixels[i] &&
      userPixels[i+1] === correctPixels[i+1] &&
      userPixels[i+2] === correctPixels[i+2] &&
      userPixels[i+3] === correctPixels[i+3]
    ) {
      match++;
    }
    total++;
  }
  similarity = total > 0 ? (match / total) * 100 : 0;
  answerMode = true;
}


// 回答・リセット・ヒントボタン連携
window.addEventListener('DOMContentLoaded', () => {
  const answerBtn = document.getElementById('answerBtn');
  if (answerBtn) answerBtn.onclick = checkAnswer;
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) resetBtn.onclick = resetParts;
  const hintBtn = document.getElementById('hintBtn');
  window.showCorrectHintPressed = false;
  if (hintBtn) {
    hintBtn.onmousedown = () => { window.showCorrectHintPressed = true; };
    hintBtn.onmouseup = () => { window.showCorrectHintPressed = false; };
    hintBtn.onmouseleave = () => { window.showCorrectHintPressed = false; };
    // タッチ操作対応
    hintBtn.ontouchstart = (e) => { window.showCorrectHintPressed = true; e.preventDefault(); };
    hintBtn.ontouchend = (e) => { window.showCorrectHintPressed = false; e.preventDefault(); };
  }
});


function mouseReleased() {
  draggingPart = null;
}
