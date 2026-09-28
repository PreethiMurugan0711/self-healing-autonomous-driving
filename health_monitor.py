class HealthMonitor:
    def __init__(self, blur_threshold=50.0, brightness_threshold=40.0, conf_threshold=0.3):
        self.blur_threshold = blur_threshold
        self.brightness_threshold = brightness_threshold
        self.conf_threshold = conf_threshold
        
    def update_thresholds(self, blur, brightness, conf):
        self.blur_threshold = blur
        self.brightness_threshold = brightness
        self.conf_threshold = conf

    def evaluate(self, detections, avg_confidence, quality_metrics):
        """
        Evaluate perception health based on detection confidence and image quality.
        Returns:
            status: "HEALTHY" or "DEGRADED"
            reasons: List of reasons for degradation, if any.
        """
        reasons = []
        
        # Evaluate Image Quality
        if quality_metrics["blur_score"] < self.blur_threshold:
            reasons.append(f"High Blur (Score: {quality_metrics['blur_score']:.1f})")
            
        if quality_metrics["brightness_score"] < self.brightness_threshold:
            reasons.append(f"Low Brightness (Score: {quality_metrics['brightness_score']:.1f})")
            
        # Evaluate Detection Confidence
        # Only penalize if objects were detected but confidence is too low.
        if len(detections) > 0 and avg_confidence < self.conf_threshold:
            reasons.append(f"Low Detection Confidence (Avg: {avg_confidence:.2f})")
            
        # Determine status
        if reasons:
            status = "DEGRADED"
        else:
            status = "HEALTHY"
            
        return status, reasons
