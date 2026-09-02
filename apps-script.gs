const SHEET_NAME = "Pendaftar";
const MAX = 30;
const SUBJECT = "Konfirmasi Pendaftaran TSM CLEAN";

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp","Nomor","Email","Nama","Merk Sepeda Motor","NOPOL"]);
  }
  return sheet;
}

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : "";
  const sheet = getSheet_();
  const count = Math.max(sheet.getLastRow() - 1, 0);

  if (action === "count") {
    return json_({success:true, count:count, max:MAX});
  }

  return json_({success:true, message:"TSM CLEAN API aktif.", count:count, max:MAX});
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    const data = JSON.parse(e.postData.contents || "{}");
    const email = String(data.email || "").trim();
    const nama = String(data.nama || "").trim();
    const merk = String(data.merk || "").trim();
    const nopol = String(data.nopol || "").trim().toUpperCase();

    if (!email || !nama || !merk || !nopol) {
      return json_({success:false, message:"Semua data wajib diisi."});
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json_({success:false, message:"Format email tidak valid."});
    }

    const sheet = getSheet_();
    const count = Math.max(sheet.getLastRow() - 1, 0);

    if (count >= MAX) {
      return json_({success:false, message:"Maaf, kuota 30 pendaftar sudah penuh.", count:count});
    }

    // Cegah email atau NOPOL yang sama mendaftar dua kali.
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][2]).toLowerCase() === email.toLowerCase()) {
        return json_({success:false, message:"Email tersebut sudah terdaftar.", count:count});
      }
      if (String(rows[i][5]).toUpperCase() === nopol) {
        return json_({success:false, message:"NOPOL tersebut sudah terdaftar.", count:count});
      }
    }

    const number = count + 1;
    sheet.appendRow([new Date(), number, email, nama, merk, nopol]);

    MailApp.sendEmail({
      to: email,
      subject: SUBJECT,
      htmlBody:
        '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222">' +
        '<h1 style="color:#e53935">TSM CLEAN</h1>' +
        '<p>Halo <b>' + escapeHtml_(nama) + '</b>,</p>' +
        '<p>Pendaftaran kamu telah berhasil dan tercatat.</p>' +
        '<div style="background:#f3f3f3;padding:20px;border-radius:10px">' +
        '<p><b>Nomor Pendaftaran:</b> #' + number + '</p>' +
        '<p><b>Merk:</b> ' + escapeHtml_(merk) + '</p>' +
        '<p><b>NOPOL:</b> ' + escapeHtml_(nopol) + '</p>' +
        '</div>' +
        '<p>Terima kasih telah melakukan pendaftaran di TSM CLEAN.</p>' +
        '</div>'
    });

    return json_({success:true, number:number, count:number});
  } catch (err) {
    return json_({success:false, message:"Server mengalami kesalahan: " + err.message});
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml_(text) {
  return String(text)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}
