/*
  GANTI URL DI BAWAH dengan URL Web App Google Apps Script kamu.
  Contoh: https://script.google.com/macros/s/XXXXXXXX/exec
*/
const SCRIPT_URL = "PASTE_URL_APPS_SCRIPT_DI_SINI";
const MAX = 30;

const form = document.getElementById("registrationForm");
const btn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const statusEl = document.getElementById("status");
const successBox = document.getElementById("successBox");
const closedBox = document.getElementById("closedBox");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const quotaText = document.getElementById("quotaText");

async function loadQuota(){
  if(SCRIPT_URL.includes("PASTE_URL")) return;
  try{
    const res = await fetch(SCRIPT_URL + "?action=count");
    const data = await res.json();
    updateQuota(Number(data.count || 0));
  }catch(e){
    console.log("Quota belum bisa dibaca:", e);
  }
}

function updateQuota(count){
  const safe = Math.min(Math.max(count,0),MAX);
  const remaining = MAX-safe;
  progressText.textContent = `${safe} / ${MAX}`;
  quotaText.textContent = remaining;
  progressBar.style.width = `${(safe/MAX)*100}%`;
  if(safe >= MAX){
    document.body.classList.add("closed-state");
    btn.disabled = true;
  }
}

form.addEventListener("submit", async (e)=>{
  e.preventDefault();

  if(SCRIPT_URL.includes("PASTE_URL")){
    statusEl.textContent = "Hubungkan URL Google Apps Script terlebih dahulu di script.js.";
    return;
  }

  btn.disabled = true;
  btnText.textContent = "MEMPROSES...";
  statusEl.textContent = "";

  const payload = {
    email: document.getElementById("email").value.trim(),
    nama: document.getElementById("nama").value.trim(),
    merk: document.getElementById("merk").value.trim(),
    nopol: document.getElementById("nopol").value.trim()
  };

  try{
    const res = await fetch(SCRIPT_URL, {
      method:"POST",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify(payload)
    });
    const data = await res.json();

    if(data.success){
      form.style.display = "none";
      successBox.style.display = "block";
      document.getElementById("successMessage").textContent =
        `Halo ${payload.nama}, pendaftaran kendaraan ${payload.nopol.toUpperCase()} berhasil tercatat. Nomor pendaftaran kamu: #${data.number}. Konfirmasi telah dikirim ke email.`;
      updateQuota(Number(data.count || 0));
    }else{
      statusEl.textContent = data.message || "Pendaftaran gagal. Silakan coba lagi.";
      btn.disabled = false;
      btnText.textContent = "DAFTAR SEKARANG";
      if(data.count !== undefined) updateQuota(Number(data.count));
    }
  }catch(err){
    statusEl.textContent = "Terjadi masalah koneksi. Coba lagi beberapa saat.";
    btn.disabled = false;
    btnText.textContent = "DAFTAR SEKARANG";
  }
});

loadQuota();
