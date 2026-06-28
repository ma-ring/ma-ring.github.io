const categoryEl = document.getElementById("category");
const iconEl = document.getElementById("icon");
const missionTextEl = document.getElementById("missionText");
const hintEl = document.getElementById("hint");

const newMissionBtn = document.getElementById("newMission");
const copyMissionBtn = document.getElementById("copyMission");
const shareMissionBtn = document.getElementById("shareMission");

let missions = [];
let currentMission = null;

function renderMission(mission) {
  categoryEl.textContent = mission.category;
  iconEl.textContent = mission.icon;
  missionTextEl.textContent = mission.text;
  hintEl.textContent = mission.hint;
}

function setLoadingState(isLoading) {
  newMissionBtn.disabled = isLoading;
  copyMissionBtn.disabled = isLoading;
  shareMissionBtn.disabled = isLoading;
}

function getMissionUrl(mission) {
  const url = new URL(window.location.href);

  if (mission?.id) {
    url.searchParams.set("id", mission.id);
  } else {
    url.searchParams.delete("id");
  }

  return url.toString();
}

function syncMissionUrl(mission) {
  window.history.replaceState({}, "", getMissionUrl(mission));
}

function findMissionById(id) {
  return missions.find((mission) => mission.id === id) || null;
}

function getRequestedMissionId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function setCurrentMission(mission) {
  currentMission = mission;
  renderMission(currentMission);
  syncMissionUrl(currentMission);
}

function pickMission() {
  if (missions.length === 0) {
    return;
  }

  const index = Math.floor(Math.random() * missions.length);
  setCurrentMission(missions[index]);
}

function getShareText() {
  if (!currentMission) {
    return "PHOTO MISSION\n\nお題を読み込み中です。";
  }

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
  const url = encodeURIComponent(getMissionUrl(currentMission));
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
}

async function loadMissions() {
  setLoadingState(true);

  try {
    const response = await fetch("./missions.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load missions: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Mission data is empty.");
    }

    missions = data;

    const requestedId = getRequestedMissionId();
    const requestedMission = requestedId ? findMissionById(requestedId) : null;

    if (requestedMission) {
      setCurrentMission(requestedMission);
    } else {
      pickMission();
    }
  } catch (error) {
    console.error(error);
    categoryEl.textContent = "ERROR";
    iconEl.textContent = "!";
    missionTextEl.textContent = "お題の読み込みに失敗しました";
    hintEl.textContent = "missions.json を確認してください。";
  } finally {
    setLoadingState(false);
  }
}

newMissionBtn.addEventListener("click", pickMission);
copyMissionBtn.addEventListener("click", copyMission);
shareMissionBtn.addEventListener("click", shareMission);

loadMissions();
