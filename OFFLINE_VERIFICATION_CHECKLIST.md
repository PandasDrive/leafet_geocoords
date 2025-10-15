# Offline Verification Checklist

Use this checklist to verify that your GeoSignal Parser installation is properly configured for offline operation.

## ✅ Pre-Deployment Checklist

### Required Files Present

- [ ] `app.py` - Main Flask application
- [ ] `parsers.py` - Signal parsers
- [ ] `requirements.txt` - Python dependencies
- [ ] `README_OFFLINE.md` - Offline setup instructions
- [ ] `START_OFFLINE.bat` - Windows batch startup script
- [ ] `START_OFFLINE.ps1` - PowerShell startup script
- [ ] `PACKAGE_FOR_TRANSFER.ps1` - Packaging script

### Frontend Files

- [ ] `frontend/index.html` - Main application page
- [ ] `frontend/about.html` - About page
- [ ] `frontend/faq.html` - FAQ page
- [ ] `frontend/script.js` - Application JavaScript
- [ ] `frontend/style.css` - Application styles

### Offline Libraries (Critical!)

#### Leaflet (Mapping)
- [ ] `frontend/libs/leaflet/leaflet.js` (~147 KB)
- [ ] `frontend/libs/leaflet/leaflet.css` (~14 KB)
- [ ] `frontend/libs/leaflet/images/marker-icon.png`
- [ ] `frontend/libs/leaflet/images/marker-icon-2x.png`
- [ ] `frontend/libs/leaflet/images/marker-shadow.png`
- [ ] `frontend/libs/leaflet/images/layers.png`
- [ ] `frontend/libs/leaflet/images/layers-2x.png`

#### Chart.js (Analytics)
- [ ] `frontend/libs/chart/chart.min.js` (~205 KB)

#### Plotly (3D Visualization)
- [ ] `frontend/libs/plotly/plotly.min.js` (~3.6 MB)

#### Three.js (Galaxy Animation)
- [ ] `frontend/libs/three/three.min.js` (~603 KB)

### Sample Data Files

- [ ] `signal_a_sample.fbf` - Signal A sample data
- [ ] `signal_b_sample.fbf` - Signal B sample data

### Virtual Environment

- [ ] `venv/` directory exists
- [ ] `venv/Scripts/` (Windows) or `venv/bin/` (Linux/Mac) directory present
- [ ] `venv/Scripts/python.exe` (Windows) or `venv/bin/python` (Linux/Mac) executable present
- [ ] Flask installed in venv (check with: `venv/Scripts/python.exe -m pip list | findstr Flask`)

## 🧪 Testing Checklist

### Test 1: Startup Test

1. [ ] Double-click `START_OFFLINE.bat` (or run `START_OFFLINE.ps1`)
2. [ ] Virtual environment activates successfully (no errors)
3. [ ] Flask server starts on port 5000
4. [ ] Console shows: `Running on http://127.0.0.1:5000`

### Test 2: Browser Access Test

1. [ ] Open browser to `http://localhost:5000`
2. [ ] Splash screen appears with animated globe
3. [ ] Main application loads after ~2.5 seconds
4. [ ] No console errors (press F12 to check)
5. [ ] Galaxy animation visible in background

### Test 3: Library Loading Test

**Check Browser Console (F12 → Console tab):**

- [ ] No 404 errors for `.js` files
- [ ] No 404 errors for `.css` files
- [ ] Console shows: "GeoSignal Parser v1.0 Initialized"
- [ ] Leaflet loaded (no "L is not defined" errors)
- [ ] Chart.js loaded (check for Chart constructor)
- [ ] Three.js loaded (check for THREE object)

### Test 4: File Processing Test

1. [ ] Click "Choose File" under Option 1
2. [ ] Select `signal_a_sample.fbf`
3. [ ] Click "Process File"
4. [ ] Loading animation appears
5. [ ] Blue markers appear on the map
6. [ ] Results section shows parsed coordinates
7. [ ] Analytics dashboard shows pie chart and bar chart
8. [ ] Signal type shows "A"

### Test 5: Hex Data Test

1. [ ] Open `signal_a_sample.fbf` in hex editor OR use sample hex string
2. [ ] Copy hex data
3. [ ] Paste into "Option 2: Paste Hex Data" text area
4. [ ] Click "Process Hex"
5. [ ] Markers appear on map
6. [ ] Results displayed correctly

### Test 6: Map Interaction Test

1. [ ] Can zoom in/out on map (mouse wheel or +/- buttons)
2. [ ] Can pan the map (click and drag)
3. [ ] Clicking markers shows popup with coordinates
4. [ ] Hovering markers shows tooltip

### Test 7: Filter Test (Mixed Signals)

1. [ ] Process file with both Signal A and B (or process both samples sequentially)
2. [ ] "Filter Layers" section appears
3. [ ] Checkboxes for Signal A and Signal B visible
4. [ ] Unchecking Signal A hides blue markers
5. [ ] Unchecking Signal B hides red markers
6. [ ] Re-checking shows markers again

### Test 8: Dashboard Test

1. [ ] Analytics Dashboard visible by default
2. [ ] "Signal Type Distribution" pie chart displays correctly
3. [ ] "Signal Count by Latitude" bar chart displays correctly
4. [ ] Click "Hide" button collapses dashboard
5. [ ] Click "Show" button expands dashboard again

### Test 9: Export Test

1. [ ] Process signal data (any type)
2. [ ] Click "Export as CSV" button
3. [ ] CSV file(s) download automatically
4. [ ] Open CSV in text editor
5. [ ] Verify format: `Latitude,Longitude` with data rows

### Test 10: Clear Map Test

1. [ ] Process signal data
2. [ ] Click "Clear Map" button
3. [ ] All markers removed from map
4. [ ] Results section resets to "No data processed yet."
5. [ ] Coordinates list cleared
6. [ ] Analytics charts cleared

### Test 11: Navigation Test

1. [ ] Click "About" in navigation
2. [ ] About page loads
3. [ ] Click "FAQ" in navigation
4. [ ] FAQ page loads
5. [ ] Click "Home" in navigation
6. [ ] Splash screen animates again
7. [ ] Main page reloads

### Test 12: Easter Eggs Test (Optional)

1. [ ] Open browser console (F12)
2. [ ] Type Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
3. [ ] Rocket emoji flies across screen
4. [ ] Type God Mode: I D D Q D
5. [ ] Elements glow with special effect
6. [ ] God mode message appears

## 🔌 Offline Verification

### Critical: Disconnect from Internet

1. [ ] Disable WiFi / unplug Ethernet
2. [ ] Restart the Flask application
3. [ ] Navigate to `http://localhost:5000`
4. [ ] **All features work WITHOUT internet connection**
5. [ ] No console errors about failed network requests
6. [ ] Libraries load from local `libs/` folder
7. [ ] Map displays correctly (tiles may be gray if not downloaded)
8. [ ] Charts render properly
9. [ ] Galaxy animation works

### Network Tab Check (F12 → Network)

- [ ] All requests are to `localhost` or `127.0.0.1`
- [ ] No requests to CDNs (unpkg.com, cdn.jsdelivr.net, cdnjs.cloudflare.com, cdn.plot.ly)
- [ ] All `.js` files load from `/libs/` path
- [ ] No failed external requests

## 📦 Packaging Verification

### Before Zipping

1. [ ] All files in checklist above are present
2. [ ] No unnecessary files (`.pyc`, `__pycache__`, `.git`, `.log`)
3. [ ] Total folder size is reasonable (~10-50 MB)

### After Zipping

1. [ ] ZIP file created successfully
2. [ ] ZIP file size is reasonable (5-20 MB compressed)
3. [ ] Can extract ZIP file without errors

### Post-Transfer Test

1. [ ] Transfer ZIP to offline computer
2. [ ] Extract to a local directory
3. [ ] Run `START_OFFLINE.bat`
4. [ ] Verify all tests above pass on offline computer

## 🐛 Common Issues & Solutions

### Issue: Libraries not loading (404 errors)

**Solution:**
- Check that `frontend/libs/` folder exists
- Verify all library files are present (see checklist above)
- Ensure `index.html` references local paths (not CDN URLs)

### Issue: Virtual environment won't activate

**Solution:**
- Verify Python 3.7+ is installed
- Recreate venv: `python -m venv venv`
- Install dependencies: `venv\Scripts\python.exe -m pip install -r requirements.txt`

### Issue: Port 5000 already in use

**Solution:**
- Change port in `app.py`: `app.run(debug=True, port=5001)`
- Or kill process using port 5000

### Issue: Map doesn't display

**Solution:**
- Map tiles are not included by default (requires separate download)
- Markers will still show on gray background
- Application is fully functional without tiles

### Issue: Charts not rendering

**Solution:**
- Verify `chart.min.js` loaded (check browser console)
- Clear browser cache and reload
- Check for JavaScript errors in console

## ✅ Sign-Off

Once all items are checked:

- **Tested By:** _______________
- **Date:** _______________
- **Offline Computer Name/ID:** _______________
- **Status:** [ ] READY FOR DEPLOYMENT

---

**Notes:**


