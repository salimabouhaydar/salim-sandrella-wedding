# Collecting RSVPs into a Google Sheet (then Excel)

The site's RSVP form saves every reply (name, attending yes/no, guest count,
and a wishes message) into a Google Sheet. From there you download it as Excel
anytime: **File → Download → Microsoft Excel (.xlsx)**.

This uses a free Google Apps Script — no paid service, no server to run. You
do this **once**, in about 5 minutes.

> **Until you paste the URL in (Step 4), the RSVP button falls back to opening
> WhatsApp** with the guest's details, so no reply is ever lost. Once the URL
> is set, RSVPs save silently to the sheet and the guest sees a thank-you
> message instead.

---

## Step 1 — Create the sheet

1. Go to <https://sheets.google.com> and create a new blank spreadsheet.
2. Name it something like **Salim & Sandrella — RSVPs**.

## Step 2 — Add the script

1. In that spreadsheet, open the menu **Extensions → Apps Script**.
2. Delete whatever code is shown, and paste in the code from the
   **"Apps Script code"** section at the bottom of this file.
3. Click the **Save** icon (💾).

## Step 3 — Deploy it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear ⚙️ next to "Select type" and choose **Web app**.
3. Set:
   - **Description:** RSVP collector (anything is fine)
   - **Execute as:** **Me**
   - **Who has access:** **Anyone**  ← important, so guests can submit
4. Click **Deploy**.
5. Google will ask you to **authorize** — click through, choose your Google
   account, and on the "Google hasn't verified this app" screen click
   **Advanced → Go to (your project)** → **Allow**. (This is normal; it's your
   own script.)
6. Copy the **Web app URL** it gives you. It looks like
   `https://script.google.com/macros/s/AKfy....../exec`.

## Step 4 — Paste the URL into the site

1. Open `script.js`.
2. Near the top, in the `CONFIG` block, put your URL between the quotes:

   ```js
   rsvpSheetUrl: "https://script.google.com/macros/s/AKfy....../exec",
   ```

3. Save, commit, and push. Done — new RSVPs now land in your sheet.

## Step 5 — Get your Excel file

Open the Google Sheet → **File → Download → Microsoft Excel (.xlsx)**.
The columns are: **Timestamp · Name · Attending · Guests · Wishes · Language**.

> **Attending** is `Yes` or `No`. When a guest declines, **Guests** is recorded
> as `0`. **Wishes** is the optional message they leave.
>
> If a guest submits the form twice (e.g. to correct something) you'll get two
> rows — the later timestamp is the current one; delete the older if you like.

---

## Updating the script later

If you ever change the Apps Script code, you must redeploy: **Deploy → Manage
deployments → ✏️ (edit) → Version: New version → Deploy**. The URL stays the
same.

---

## Apps Script code

```js
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("RSVPs") || ss.insertSheet("RSVPs");

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Name", "Attending", "Guests", "Wishes", "Language"]);
    }

    var data = {};
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {}

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.attending || "",
      (data.guests === 0 || data.guests) ? data.guests : "",
      data.wish || "",
      data.lang || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```
