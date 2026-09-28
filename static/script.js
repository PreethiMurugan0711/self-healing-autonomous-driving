let metricsInterval = null;
let eventLog = [];

function startSystem() {
    let formData = new FormData();
    formData.append('source', 'Webcam'); // Default to Webcam for this UI, or Video File if needed.
    
    fetch('/start', {
        method: 'POST',
        body: formData
    }).then(res => {
        if (res.ok) {
            document.getElementById('video-feed').src = "/video_feed?" + new Date().getTime();
            if (metricsInterval) clearInterval(metricsInterval);
            metricsInterval = setInterval(fetchMetrics, 500);
            addEventLog("INFO", "System initialized and video feed active");
        }
    });
}

function fetchMetrics() {
    fetch('/metrics')
        .then(res => res.json())
        .then(data => updateUI(data))
        .catch(err => console.error("Error fetching metrics:", err));
}

function updateUI(data) {
    if (!data.is_running) return;

    // Update Top Header
    const isDegraded = data.health.status === "DEGRADED" || data.health.status === "WARNING_SAFE_FALLBACK";
    const isRecovered = data.health.status === "RECOVERED";
    const isHealingActive = data.healing && data.healing.status !== "N/A";

    const topBadge = document.getElementById('topModeBadge');
    if (topBadge) {
        if (isRecovered) {
            topBadge.textContent = "HEALING SUCCESSFUL";
            topBadge.className = "font-label-xs text-label-xs text-secondary-container bg-surface-container-high px-1 border border-secondary-container";
        } else if (isDegraded) {
            topBadge.textContent = "DEGRADED INPUT";
            topBadge.className = "font-label-xs text-label-xs text-error bg-surface-container-high px-1 border border-error";
        } else {
            topBadge.textContent = "NOMINAL";
            topBadge.className = "font-label-xs text-label-xs text-outline bg-surface-container-high px-1 border border-outline";
        }
    }

    // Health Block
    const healthBeacon = document.getElementById('healthBeacon');
    const healthTitle = document.getElementById('healthTitle');
    const healthConfBig = document.getElementById('healthConfBig');
    const healthSubtext = document.getElementById('healthSubtext');
    
    // Average Confidence Calculation
    let avgConf = 0;
    let vehicles = 0;
    let pedestrians = 0;
    if (data.detections && data.detections.length > 0) {
        let sum = 0;
        data.detections.forEach(d => {
            sum += d.confidence;
            if (['car', 'truck', 'bus', 'motorcycle'].includes(d.label)) vehicles++;
            if (d.label === 'person') pedestrians++;
        });
        avgConf = (sum / data.detections.length) * 100;
    }

    if (healthConfBig) healthConfBig.textContent = avgConf.toFixed(1) + "%";

    if (isDegraded) {
        if (healthTitle) healthTitle.textContent = "DEGRADED // WARNING";
        if (healthTitle) healthTitle.className = "font-headline-md text-headline-md text-error font-bold";
        if (healthBeacon) healthBeacon.className = "w-3 h-3 rounded-full bg-error hud-pulse";
        if (healthSubtext) healthSubtext.textContent = "Perception confidence dropped. " + (data.health.reasons ? data.health.reasons.join(", ") : "");
        if (healthConfBig) healthConfBig.className = "font-headline-lg text-headline-lg text-error font-mono font-bold";
    } else {
        if (healthTitle) healthTitle.textContent = "HEALTHY // OPTIMAL";
        if (healthTitle) healthTitle.className = "font-headline-md text-headline-md text-secondary font-bold";
        if (healthBeacon) healthBeacon.className = "w-3 h-3 rounded-full bg-secondary hud-pulse";
        if (healthSubtext) healthSubtext.textContent = "Real-time perception confidence exceeds minimum autonomous safety threshold.";
        if (healthConfBig) healthConfBig.className = "font-headline-lg text-headline-lg text-secondary font-mono font-bold";
    }

    // Metrics Gauges
    if (document.getElementById('meterConfVal')) {
        document.getElementById('meterConfVal').textContent = avgConf.toFixed(0) + "%";
        document.getElementById('meterConfBar').style.width = avgConf + "%";
        document.getElementById('meterConfBar').className = isDegraded ? "h-full bg-error transition-all duration-300" : "h-full bg-secondary transition-all duration-300";
    }
    
    if (data.quality) {
        if (document.getElementById('meterBrisqueVal')) {
            document.getElementById('meterBrisqueVal').textContent = data.quality.brightness_score.toFixed(1);
            document.getElementById('meterBrisqueBar').style.width = Math.min(100, data.quality.brightness_score) + "%";
        }
        if (document.getElementById('meterLaplacianVal')) {
            document.getElementById('meterLaplacianVal').textContent = data.quality.blur_score.toFixed(1);
            document.getElementById('meterLaplacianBar').style.width = Math.min(100, data.quality.blur_score / 2) + "%";
        }
    }

    if (document.getElementById('entityCountVal')) {
        document.getElementById('entityCountVal').textContent = data.detections ? data.detections.length.toString().padStart(2, '0') : "00";
    }
    
    // Bottom Summary
    if (document.getElementById('sumVehicles')) document.getElementById('sumVehicles').textContent = vehicles.toString().padStart(2, '0');
    if (document.getElementById('sumPedestrians')) document.getElementById('sumPedestrians').textContent = pedestrians.toString().padStart(2, '0');
    if (document.getElementById('sumAvgConf')) document.getElementById('sumAvgConf').textContent = avgConf.toFixed(0) + "%";

    // Pipeline status
    const pStatus = document.getElementById('pipelineCycleStatus');
    if (pStatus) {
        if (isRecovered) pStatus.textContent = "CYCLE: RECOVERED";
        else if (isDegraded) pStatus.textContent = "CYCLE: DEGRADED";
        else pStatus.textContent = "CYCLE: STABLE";
    }

    // Append to Event Log conditionally to avoid spam
    if (isDegraded && !eventLog.includes(data.health.status)) {
        addEventLog("WARN", "Visual degradation detected: " + data.health.reasons.join(", "));
        addEventLog("TRIGGER", "Confidence fell below threshold. Dispatched GenAI healing buffer.");
        eventLog.push(data.health.status);
    } else if (isRecovered && !eventLog.includes("RECOVERED-" + data.healing.improvement)) {
        addEventLog("SUCCESS", "Recovery verified: Improvement +" + data.healing.improvement.toFixed(1) + "%");
        eventLog.push("RECOVERED-" + data.healing.improvement);
    }
    
    // Healing Compare Panel update
    if (data.healing && data.healing.pre_conf !== null && document.getElementById('comparison')) {
        // Pre-conf
        let preConfEl = document.querySelector('#comparison .text-error');
        if (preConfEl && preConfEl.textContent.includes('%')) {
            document.querySelectorAll('#comparison .text-error').forEach(el => {
                if(el.textContent.includes('%')) el.textContent = (data.healing.pre_conf * 100).toFixed(0) + '%';
            });
        }
        // Post-conf
        let postConfEl = document.querySelector('#comparison .text-secondary');
        if (postConfEl && postConfEl.textContent.includes('%')) {
            document.querySelectorAll('#comparison .text-secondary').forEach(el => {
                if(el.textContent.includes('%') && el.textContent.length < 5) el.textContent = (data.healing.post_conf * 100).toFixed(0) + '%';
            });
        }
        // Improvement
        let impEl = document.querySelector('#comparison strong.text-secondary');
        if (impEl && impEl.textContent.includes('+')) {
            impEl.textContent = "+" + data.healing.improvement.toFixed(1) + "%";
        }
    }
}

function addEventLog(type, message) {
    const container = document.getElementById('eventLogContainer');
    if (!container) return;
    
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    
    let colorClass = 'text-primary';
    if (type === 'WARN') colorClass = 'text-tertiary';
    if (type === 'TRIGGER' || type === 'ERROR') colorClass = 'text-error';
    if (type === 'SUCCESS') colorClass = 'text-secondary';
    
    const div = document.createElement('div');
    div.className = "flex items-start gap-2";
    div.innerHTML = `
        <span class="text-outline">${timeStr}</span>
        <span class="${colorClass}">[${type}]</span>
        <span class="text-on-surface">${message}</span>
    `;
    
    container.prepend(div);
}

// Start auto on load
document.addEventListener("DOMContentLoaded", () => {
    // Clear old mock logs
    const container = document.getElementById('eventLogContainer');
    if(container) container.innerHTML = '';
    
    startSystem();
    
    // Bind buttons if they exist
    const btnPlayPause = document.getElementById('btnPlayPause');
    if(btnPlayPause) btnPlayPause.addEventListener('click', startSystem);
    
    const fileUpload = document.getElementById('fileUpload');
    if (fileUpload) {
        fileUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                let formData = new FormData();
                formData.append('source', 'Video File');
                formData.append('file', file);
                
                const btn = document.getElementById('uploadBtnText');
                if (btn) btn.textContent = "PROCESSING...";
                
                fetch('/start', {
                    method: 'POST',
                    body: formData
                }).then(res => {
                    if (btn) btn.textContent = "UPLOAD IMAGE / VIDEO";
                    if (res.ok) {
                        document.getElementById('video-feed').src = "/video_feed?" + new Date().getTime();
                        if (metricsInterval) clearInterval(metricsInterval);
                        metricsInterval = setInterval(fetchMetrics, 500);
                        addEventLog("INFO", "Uploaded file: " + file.name);
                    } else {
                        res.json().then(data => alert(data.error || "Upload failed"));
                    }
                }).catch(err => {
                    if (btn) btn.textContent = "UPLOAD IMAGE / VIDEO";
                    alert("Error uploading file.");
                });
            }
        });
    }
    
    const btnReset = document.getElementById('btnReset');
    if(btnReset) {
        btnReset.addEventListener('click', () => {
            fetch('/stop', { method: 'POST' });
            if (metricsInterval) clearInterval(metricsInterval);
            document.getElementById('video-feed').src = "";
            addEventLog("INFO", "System halted");
        });
    }
});
