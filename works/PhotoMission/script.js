const missions = [
  {
    category: "COLOR",
    icon: "🔵",
    text: "青いものを5つ探そう",
    hint: "空、看板、服、影。意識すると急に青が見えてくる。"
  },
  {
    category: "COLOR",
    icon: "🔴",
    text: "赤いものを3つ見つけよう",
    hint: "小さな赤ほど、見つけるとうれしい。"
  },
  {
    category: "SHAPE",
    icon: "⚪",
    text: "丸いものだけを撮ろう",
    hint: "標識、皿、ライト、マンホール。街は意外と丸い。"
  },
  {
    category: "LIGHT",
    icon: "✨",
    text: "光がきれいな場所を探そう",
    hint: "反射、木漏れ日、窓辺。光の通り道を見る。"
  },
  {
    category: "SHADOW",
    icon: "🌗",
    text: "影だけを主役にして撮ろう",
    hint: "本体ではなく、影の形を見てみる。"
  },
  {
    category: "TEXTURE",
    icon: "🪨",
    text: "ざらざらしたものを探そう",
    hint: "壁、道、木、布。触感を写真にするつもりで。"
  },
  {
    category: "ANGLE",
    icon: "👟",
    text: "足元だけを見て歩こう",
    hint: "普段見逃している小さな世界がある。"
  },
  {
    category: "ANGLE",
    icon: "🕊️",
    text: "真上を見上げて撮ろう",
    hint: "空、天井、電線、枝。視線を上にずらす。"
  },
  {
    category: "STORY",
    icon: "🌿",
    text: "今日一番静かな場所を撮ろう",
    hint: "音が少ない場所、時間が止まったような場所。"
  },
  {
    category: "STORY",
    icon: "🍬",
    text: "今日一番かわいいものを探そう",
    hint: "人に説明できない“かわいい”でもOK。"
  },
  {
    category: "SEASON",
    icon: "🍉",
    text: "夏を感じるものを撮ろう",
    hint: "温度、色、湿度、匂いまで想像できるもの。"
  },
  {
    category: "RULE",
    icon: "3",
    text: "3枚だけ撮って終わりにしよう",
    hint: "制限があると、選ぶ目が少し鋭くなる。"
  }
];

const categoryEl = document.getElementById("category");
const iconEl = document.getElementById("icon");
const missionTextEl = document.getElementById("missionText");
const hintEl = document.getElementById("hint");

const newMissionBtn = document.getElementById("newMission");
const copyMissionBtn = document.getElementById("copyMission");
const shareMissionBtn = document.getElementById("shareMission");

let currentMission = missions[0];

function pickMission() {
  const index = Math.floor(Math.random() * missions.length);
  currentMission = missions[index];

  categoryEl.textContent = currentMission.category;
  iconEl.textContent = currentMission.icon;
  missionTextEl.textContent = currentMission.text;
  hintEl.textContent = currentMission.hint;
}

function getShareText() {
  return `PHOTO MISSION\n\n${currentMission.text}\n\nいつもの景色を、違う見方で。\n#PhotoMission #MAHOLAB`;
}

async function copyMission() {
  const text = getShareText();

  try {
    await navigator.clipboard.writeText(text);
    copyMissionBtn.textContent = "Copied!";
    setTimeout(() => {
      copyMissionBtn.textContent = "Copy";
    }, 1200);
  } catch (error) {
    alert(text);
  }
}

function shareMission() {
  const text = encodeURIComponent(getShareText());
  const url = encodeURIComponent(location.href);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
}

newMissionBtn.addEventListener("click", pickMission);
copyMissionBtn.addEventListener("click", copyMission);
shareMissionBtn.addEventListener("click", shareMission);

pickMission();