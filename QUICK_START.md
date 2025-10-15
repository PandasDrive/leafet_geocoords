# 🚀 GeoSignal Parser - Quick Start Guide

## ⚡ Ultra-Fast Setup (1 Minute)

### Windows Users

1. **Extract ZIP** to any folder
2. **Double-click** `START_OFFLINE.bat`
3. **Open browser** to: `http://localhost:5000`
4. **Done!** 🎉

### Linux/Mac Users

```bash
cd leafet_geocoords
source venv/bin/activate
python app.py
```

Then open browser to: `http://localhost:5000`

---

## 📊 Process Your First Signal File

### Step 1: Upload Sample File
1. Click **"Choose File"**
2. Select `signal_a_sample.fbf`
3. Click **"Process File"**

### Step 2: View Results
- **Blue markers** appear on map = Signal A coordinates
- **Charts** show signal distribution
- **Coordinates list** displays parsed data

### Step 3: Export Data
- Click **"Export as CSV"** button
- Open downloaded file in Excel or GIS software

---

## 🎮 Try These Features

### Filter Signals
- Process both sample files
- Use checkboxes to show/hide signal types

### Clear & Restart
- Click **"Clear Map"** to reset everything

### Hex Input Alternative
1. Copy hex data: `2020000000000000205216001e8d93ff`
2. Paste into text area under "Option 2"
3. Click **"Process Hex"**

---

## 🔌 Offline Verification

**Test it's truly offline:**

1. Disconnect from internet (WiFi off)
2. Restart application
3. Process files - should work perfectly!

---

## 🐛 Problems?

| Problem | Quick Fix |
|---------|-----------|
| Won't start | Check Python installed: `python --version` |
| Port error | Change line 109 in `app.py` to different port |
| No venv | Recreate: `python -m venv venv` |

---

## 📚 More Info

- **Full Guide**: See `README_OFFLINE.md`
- **Testing**: See `OFFLINE_VERIFICATION_CHECKLIST.md`
- **Details**: See `DEPLOYMENT_SUMMARY.md`

---

## ✨ Easter Eggs

Open console (F12) and try:
- **Konami Code**: ↑↑↓↓←→←→BA
- **God Mode**: IDDQD

---

**Status: ✅ Fully Offline Capable - No Internet Required!**

