import time
import cv2
from self_healing.restoration import ImageRestorer
from self_healing.validation import PerceptionValidator

class HealingController:
    def __init__(self, detector):
        self.restorer = ImageRestorer()
        self.validator = PerceptionValidator()
        self.detector = detector
        
    def process(self, degraded_frame, pre_detections, pre_conf, reasons):
        """
        Run the complete self-healing pipeline:
        1. Restore frame
        2. Re-run YOLO
        3. Validate
        """
        start_time = time.time()
        
        # 1. Image Restoration
        restored_frame = self.restorer.restore(degraded_frame, reasons)
        
        # 2. YOLO Again
        annotated_restored, post_detections, post_conf = self.detector.detect(restored_frame)
        
        # 3. Before vs After Validation
        success, improvement = self.validator.validate(
            pre_detections, pre_conf, post_detections, post_conf
        )
        
        process_time = time.time() - start_time
        
        status_msg = "SUCCESS" if success else "FAILED"
        
        return annotated_restored, post_detections, post_conf, status_msg, improvement, process_time, restored_frame
