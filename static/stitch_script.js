<script>
    // State references
    let currentMode = 'normal';
    let isHealingSequenceRunning = false;
    let frameNumber = 48192;

    // Elements
    const fogLayer = document.getElementById('fogLayer');
    const lowLightLayer = document.getElementById('lowLightLayer');
    const bboxCar = document.getElementById('bboxCar');
    const bboxPerson = document.getElementById('bboxPerson');
    const bboxTruck = document.getElementById('bboxTruck');
    const labelCar = document.getElementById('labelCar');
    const labelPerson = document.getElementById('labelPerson');
    const labelTruck = document.getElementById('labelTruck');

    const healthBlock = document.getElementById('healthIndicatorBlock');
    const healthBeacon = document.getElementById('healthBeacon');
    const healthTitle = document.getElementById('healthTitle');
    const healthConfBig = document.getElementById('healthConfBig');
    const healthSubtext = document.getElementById('healthSubtext');

    const meterConfBar = document.getElementById('meterConfBar');
    const meterConfVal = document.getElementById('meterConfVal');
    const meterBrisqueBar = document.getElementById('meterBrisqueBar');
    const meterBrisqueVal = document.getElementById('meterBrisqueVal');
    const meterLaplacianBar = document.getElementById('meterLaplacianBar');
    const meterLaplacianVal = document.getElementById('meterLaplacianVal');
    const obscurationVal = document.getElementById('obscurationVal');
    const sumAvgConf = document.getElementById('sumAvgConf');

    const perceptionModeBadge = document.getElementById('perceptionModeBadge');
    const topModeBadge = document.getElementById('topModeBadge');
    const liveSsim = document.getElementById('liveSsim');
    const liveLaplacian = document.getElementById('liveLaplacian');
    const eventLogContainer = document.getElementById('eventLogContainer');

    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const step4 = document.getElementById('step4');
    const step5 = document.getElementById('step5');

    const pipelineAlertTitle = document.getElementById('pipelineAlertTitle');
    const pipelineAlertDesc = document.getElementById('pipelineAlertDesc');
    const pipelineAlertBox = document.getElementById('pipelineAlertBox');

    // Button refs
    const btnNormal = document.getElementById('btnNormal');
    const btnFog = document.getElementById('btnFog');
    const btnBlur = document.getElementById('btnBlur');
    const btnLowLight = document.getElementById('btnLowLight');
    const btnAutoHeal = document.getElementById('btnAutoHeal');
    const btnSideTrigger = document.getElementById('btnSideTrigger');

    // Append Log Utility
    function logEvent(type, text) {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      
      let badgeClass = 'text-primary';
      let textClass = 'text-on-surface';
      if (type === 'WARN') { badgeClass = 'text-tertiary'; textClass = 'text-tertiary'; }
      if (type === 'ERROR' || type === 'TRIGGER') { badgeClass = 'text-error'; textClass = 'text-error'; }
      if (type === 'SUCCESS') { badgeClass = 'text-secondary'; textClass = 'text-secondary'; }

      const logRow = document.createElement('div');
      logRow.className = 'flex items-start gap-2';
      logRow.innerHTML = `
        <span class="text-outline">${timeStr}</span>
        <span class="${badgeClass}">[${type}]</span>
        <span class="${textClass}">${text}</span>
      `;
      eventLogContainer.prepend(logRow);
    }

    // Set Degradation Visual Mode
    function applyDegradationState(mode) {
      currentMode = mode;

      // Reset all buttons style
      [btnNormal, btnFog, btnBlur, btnLowLight].forEach(b => {
        b.className = 'px-space-md py-1.5 bg-surface-container-low border border-outline-variant text-on-surface-variant font-label-xs text-label-xs rounded transition-all hover:border-tertiary hover:text-tertiary';
      });

      if (mode === 'normal') {
        btnNormal.className = 'px-space-md py-1.5 bg-surface-container-high border border-primary text-primary font-label-xs text-label-xs rounded font-bold';
        fogLayer.style.opacity = '0';
        lowLightLayer.style.opacity = '0';
        bboxCar.style.filter = 'none';
        bboxPerson.style.filter = 'none';
        bboxTruck.style.filter = 'none';

        // Normal metrics
        labelCar.textContent = 'Car 94%';
        labelPerson.textContent = 'Person 91%';
        labelTruck.textContent = 'Truck 87%';
        meterConfVal.textContent = '86%';
        meterConfBar.style.width = '86%';
        meterBrisqueVal.textContent = '88.4 / 100 [Optimal]';
        meterBrisqueBar.style.width = '88%';
        meterLaplacianVal.textContent = '1.4 [Low Blur]';
        meterLaplacianBar.style.width = '86%';
        obscurationVal.textContent = '8%';
        sumAvgConf.textContent = '86%';
        liveSsim.textContent = '0.94';
        liveLaplacian.textContent = '88.4';

        setHealthyUI();
        logEvent('INFO', 'Switched to Nominal Perception state. Camera feed baseline pristine.');
      } 
      else if (mode === 'fog') {
        btnFog.className = 'px-space-md py-1.5 bg-surface-container-high border border-tertiary text-tertiary font-label-xs text-label-xs rounded font-bold';
        fogLayer.style.opacity = '0.95';
        lowLightLayer.style.opacity = '0';
        setDegradedUI('Atmospheric Fog Hazard (Obscuration 72%)', '44.2%', '18.1');
        logEvent('WARN', 'Fog hazard injected: Atmospheric visibility dropped to 12 meters.');
      }
      else if (mode === 'blur') {
        btnBlur.className = 'px-space-md py-1.5 bg-surface-container-high border border-tertiary text-tertiary font-label-xs text-label-xs rounded font-bold';
        fogLayer.style.opacity = '0';
        lowLightLayer.style.opacity = '0';
        bboxCar.style.filter = 'blur(3px)';
        bboxPerson.style.filter = 'blur(4px)';
        bboxTruck.style.filter = 'blur(4px)';
        setDegradedUI('Severe Motion/Optic Blur', '41.8%', '8.4');
        logEvent('WARN', 'Heavy blur injected: Laplacian variance collapsed to 8.4.');
      }
      else if (mode === 'lowlight') {
        btnLowLight.className = 'px-space-md py-1.5 bg-surface-container-high border border-tertiary text-tertiary font-label-xs text-label-xs rounded font-bold';
        fogLayer.style.opacity = '0';
        lowLightLayer.style.opacity = '0.92';
        setDegradedUI('Low Light / Dynamic Sensor Underexposure', '46.0%', '21.0');
        logEvent('WARN', 'Sensor underexposure: SNR decreased to 9.8 dB.');
      }
    }

    function setDegradedUI(conditionName, confStr, laplaceStr) {
      healthBlock.className = 'p-space-md bg-tertiary/10 border border-tertiary rounded flex flex-col gap-1 transition-colors duration-300';
      healthBeacon.className = 'w-3 h-3 rounded-full bg-tertiary hud-pulse';
      healthTitle.className = 'font-headline-md text-headline-md text-tertiary font-bold';
      healthTitle.textContent = 'DEGRADED // THREAT';
      healthConfBig.className = 'font-headline-lg text-headline-lg text-tertiary font-mono font-bold';
      healthConfBig.textContent = confStr;
      healthSubtext.textContent = `Warning: ${conditionName}. Confidence fell below autonomous threshold (τ = 0.70).`;

      labelCar.textContent = 'Car 48% [Uncertain]';
      labelPerson.textContent = 'Person 38% [Lost]';
      labelTruck.textContent = 'Truck 42%';

      meterConfVal.textContent = confStr;
      meterConfBar.style.width = '42%';
      meterConfBar.className = 'h-full bg-tertiary transition-all duration-300';
      meterBrisqueVal.textContent = '38.2 / 100 [Severe]';
      meterBrisqueBar.style.width = '38%';
      meterLaplacianVal.textContent = '8.8 [Degraded]';
      meterLaplacianBar.style.width = '24%';
      obscurationVal.textContent = '68%';
      sumAvgConf.textContent = confStr;
      liveSsim.textContent = '0.52';
      liveLaplacian.textContent = laplaceStr;

      perceptionModeBadge.className = 'bg-tertiary/10 border border-tertiary text-tertiary font-label-xs text-label-xs px-1.5 py-0.5 rounded uppercase';
      perceptionModeBadge.textContent = 'MODE: DEGRADED INPUT';
      topModeBadge.textContent = 'HEALING TRIGGERED';
      topModeBadge.className = 'font-label-xs text-label-xs text-tertiary bg-surface-container-high px-1 border border-tertiary';

      // Step connectors
      step2.className = 'p-2 bg-surface-container-low border-l-2 border-tertiary flex items-center justify-between rounded-r transition-all';
      step2.querySelector('span:last-child').className = 'text-tertiary font-mono font-bold';
      step2.querySelector('span:last-child').textContent = '⚠️ CONFIDENCE DROP DETECTED';
    }

    function setHealthyUI() {
      healthBlock.className = 'p-space-md bg-secondary/10 border border-secondary rounded flex flex-col gap-1 transition-colors duration-300';
      healthBeacon.className = 'w-3 h-3 rounded-full bg-secondary hud-pulse';
      healthTitle.className = 'font-headline-md text-headline-md text-secondary font-bold';
      healthTitle.textContent = 'HEALTHY // OPTIMAL';
      healthConfBig.className = 'font-headline-lg text-headline-lg text-secondary font-mono font-bold';
      healthConfBig.textContent = '86.4%';
      healthSubtext.textContent = 'Real-time perception confidence exceeds minimum autonomous safety threshold (τ = 0.70). Spatial bounds validated.';

      perceptionModeBadge.className = 'bg-primary/10 border border-primary text-primary font-label-xs text-label-xs px-1.5 py-0.5 rounded uppercase';
      perceptionModeBadge.textContent = 'MODE: RESTORED & VALIDATED';
      topModeBadge.textContent = 'HEALING ACTIVE';
      topModeBadge.className = 'font-label-xs text-label-xs text-secondary-container bg-surface-container-high px-1 border border-secondary-container';

      step2.className = 'p-2 bg-surface-container-low border-l-2 border-outline-variant flex items-center justify-between rounded-r transition-all opacity-70';
      step2.querySelector('span:last-child').className = 'text-outline font-mono';
      step2.querySelector('span:last-child').textContent = 'STANDBY (< 50% TRIGGER)';

      pipelineAlertBox.className = 'mt-2 p-2.5 bg-surface-container-high border border-secondary/50 rounded flex flex-col gap-0.5';
      pipelineAlertTitle.textContent = 'PIPELINE STATUS: RECOVERY VERIFIED';
      pipelineAlertTitle.parentElement.className = 'flex items-center gap-1.5 font-label-xs text-label-xs text-secondary font-bold';
      pipelineAlertDesc.textContent = 'Generative model regenerated spatial frequencies in 38ms. 3/3 target objects recovered with zero hallucination.';
    }

    // Trigger Automated 4-Second Demonstration Sequence
    function triggerAutoHealSequence() {
      if (isHealingSequenceRunning) return;
      isHealingSequenceRunning = true;
      btnAutoHeal.disabled = true;
      btnAutoHeal.classList.add('opacity-50');

      logEvent('TRIGGER', 'Automated trigger initiated: Simulating acute atmospheric hazard.');
      applyDegradationState('fog');

      // Stage 2: Restoring
      setTimeout(() => {
        logEvent('GENAI', 'Confidence dropped to 42%. Self-Healing Pipeline activated: Latent diffusion denoise pass.');
        step3.className = 'p-2 bg-surface-container-high border-l-2 border-primary flex items-center justify-between rounded-r transition-all animate-pulse';
        pipelineAlertTitle.textContent = 'SELF-HEALING ACTIVE: RESTORING DEGRADED FRAMES...';
        pipelineAlertTitle.parentElement.className = 'flex items-center gap-1.5 font-label-xs text-label-xs text-primary font-bold';
        pipelineAlertDesc.textContent = 'Executing conditional diffusion denoising via DeepRestore-V4 engine...';
      }, 1400);

      // Stage 3: YOLO re-inference
      setTimeout(() => {
        logEvent('INFO', 'Second-pass YOLOv9 inference re-executed on reconstructed latent frame buffer.');
        step4.className = 'p-2 bg-surface-container-high border-l-2 border-primary flex items-center justify-between rounded-r transition-all';
        step4.querySelector('span:last-child').textContent = '⚡ RUNNING RE-DETECTION';
        step4.querySelector('span:last-child').className = 'text-primary font-mono font-bold';
      }, 2600);

      // Stage 4: Restored!
      setTimeout(() => {
        applyDegradationState('normal');
        logEvent('SUCCESS', 'Recovery verified: Confidence restored (+44% delta). Zero tracking loss occurred.');
        step3.className = 'p-2 bg-surface-container-low border-l-2 border-primary flex items-center justify-between rounded-r transition-all';
        step4.className = 'p-2 bg-surface-container-low border-l-2 border-outline-variant flex items-center justify-between rounded-r transition-all opacity-70';
        step4.querySelector('span:last-child').textContent = 'SECOND-PASS YOLOv9';
        step4.querySelector('span:last-child').className = 'text-outline font-mono';
        
        isHealingSequenceRunning = false;
        btnAutoHeal.disabled = false;
        btnAutoHeal.classList.remove('opacity-50');
      }, 3800);
    }

    // Event listeners
    btnNormal.addEventListener('click', () => applyDegradationState('normal'));
    btnFog.addEventListener('click', () => applyDegradationState('fog'));
    btnBlur.addEventListener('click', () => applyDegradationState('blur'));
    btnLowLight.addEventListener('click', () => applyDegradationState('lowlight'));
    btnAutoHeal.addEventListener('click', triggerAutoHealSequence);
    btnSideTrigger.addEventListener('click', triggerAutoHealSequence);

    // Minor telemetry counter loop for authentic research feel
    setInterval(() => {
      frameNumber += 1;
      document.getElementById('frameCounter').textContent = `FRM #${frameNumber.toLocaleString()}`;
    }, 16);

    // Play/Pause button interaction
    const btnPlayPause = document.getElementById('btnPlayPause');
    let isPlaying = true;
    btnPlayPause.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        btnPlayPause.innerHTML = '<span class="material-symbols-outlined text-[13px]">pause</span> Continuous Monitoring';
        btnPlayPause.className = 'px-space-sm py-1 bg-surface-container-low border border-outline-variant text-secondary font-label-xs text-label-xs rounded flex items-center gap-1';
        logEvent('INFO', 'Perception stream resumed at 60 FPS.');
      } else {
        btnPlayPause.innerHTML = '<span class="material-symbols-outlined text-[13px]">play_arrow</span> Stream Paused';
        btnPlayPause.className = 'px-space-sm py-1 bg-surface-container-low border border-outline-variant text-tertiary font-label-xs text-label-xs rounded flex items-center gap-1';
        logEvent('WARN', 'Perception stream frozen by operator. Latent frame buffer cached.');
      }
    });

    // Reset button
    document.getElementById('btnReset').addEventListener('click', () => {
      applyDegradationState('normal');
      logEvent('INFO', 'Full pipeline reset issued. Model state re-initialized.');
    });

    // Override actions
    document.getElementById('btnEngageOverride').addEventListener('click', () => {
      logEvent('WARN', 'Manual Human-in-the-Loop Override engaged. Safety interlocks active.');
    });
    document.getElementById('btnEmergencyStop').addEventListener('click', () => {
      logEvent('ERROR', 'EMERGENCY BRAKE ACTUATED. Perception pipeline entered fail-safe clamp.');
    });

  </script>