import cv2
import numpy as np

class ImageRestorer:
    def __init__(self):
        # We use a lightweight OpenCV-based restoration to simulate 
        # a Restormer/Generative AI module. This ensures real-time performance
        # for demonstration without heavy GPU requirements.
        pass

    def restore(self, frame, reasons):
        """
        Enhance/restore the degraded image.
        Uses basic but effective filters based on degradation type.
        """
        restored = frame.copy()
        
        is_blurry = any("Blur" in r for r in reasons)
        is_dark = any("Brightness" in r for r in reasons)
        
        # Deblur / Sharpening
        if is_blurry:
            # Simple sharpening kernel to enhance edges lost to motion blur
            kernel = np.array([[-1, -1, -1], 
                               [-1,  9, -1], 
                               [-1, -1, -1]])
            restored = cv2.filter2D(restored, -1, kernel)
            
        # Brightness / Low light enhancement
        if is_dark:
            # CLAHE (Contrast Limited Adaptive Histogram Equalization)
            lab = cv2.cvtColor(restored, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            cl = clahe.apply(l)
            limg = cv2.merge((cl, a, b))
            restored = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
            
        return restored
