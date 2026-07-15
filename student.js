const params = new URLSearchParams(location.search);
const sessionId = params.get("session");

const statusBox = document.getElementById("sessionStatus");
const form = document.getElementById("attendanceForm");
const lateReasonWrap = document.getElementById("lateReasonWrap");
const lateReason = document.getElementById("lateReason");
const result = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");

let currentSession = null;
let currentStatus = null;

function showStatus(message, type = "neutral") {
  statusBox.className = `notice ${type}`;
  statusBox.textContent = message;
}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation is not supported on this device."));
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    });
  });
}

async function loadSession() {
  if (!sessionId) {
    showStatus("This attendance link is incomplete. Please scan the latest QR code.", "danger");
    return;
  }

  const response = await fetch(`/.netlify/functions/session?id=${encodeURIComponent(sessionId)}`);
  const data = await response.json();

  if (!response.ok) {
    showStatus(data.error || "Unable to load the attendance session.", "danger");
    return;
  }

  currentSession = data.session;
  currentStatus = data.currentStatus;

  if (currentStatus === "not_open") {
    showStatus(`Attendance has not opened yet. It opens at ${new Date(currentSession.opens_at).toLocaleString()}.`, "warning");
    return;
  }

  if (currentStatus === "closed") {
    showStatus(currentSession.closed_message, "danger");
    result.classList.remove("hidden");
    result.innerHTML = `<h2>Next Step</h2><p>${escapeHtml(currentSession.closed_message)}</p>`;
    return;
  }

  if (currentStatus === "late") {
    showStatus("Attendance is open, but you are late. A reason is required.", "warning");
    lateReasonWrap.classList.remove("hidden");
    lateReason.required = true;
  } else {
    showStatus("Attendance is open. Complete the form below.", "success");
  }

  form.classList.remove("hidden");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = "Checking location…";

  try {
    const position = await getPosition();
    const payload = {
      sessionId,
      studentId: document.getElementById("studentId").value.trim(),
      studentName: document.getElementById("studentName").value.trim(),
      program: document.getElementById("program").value.trim(),
      lateReason: lateReason.value.trim(),
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    };

    const response = await fetch("/.netlify/functions/submit-attendance", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Attendance could not be marked.");

    form.classList.add("hidden");
    statusBox.classList.add("hidden");
    result.classList.remove("hidden");
    result.innerHTML = `
      <h2>${data.status === "late" ? "Late Arrival Recorded" : "Attendance Marked"}</h2>
      <p><strong>Status:</strong> ${data.status === "late" ? "Late" : "On time"}</p>
      <p><strong>Recorded at:</strong> ${new Date(data.recordedAt).toLocaleString()}</p>
      <p><strong>Next step:</strong> ${escapeHtml(data.nextStepMessage)}</p>
    `;
  } catch (error) {
    showStatus(error.message, "danger");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Verify Location & Mark Attendance";
  }
});

function escapeHtml(value = "") {
  return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

loadSession().catch(() => showStatus("Unable to connect to the attendance service.", "danger"));
