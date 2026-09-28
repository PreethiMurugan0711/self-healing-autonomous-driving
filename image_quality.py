import cv2
import numpy as np

class ImageQualityAnalyzer:
    def __init__(self):
        pass
        
    def analyze_quality(self, frame):
        """
        Analyze the quality of the given frame.
        Returns a dictionary with blur, brightness, and contrast metrics.
        """
        # Convert to grayscale for blur and contrast calculation
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Calculate blur using Variance of Laplacian
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Calculate brightness (average pixel value in HSV Value channel or Grayscale)
        # We'll use grayscale average for simplicity
        brightness_score = np.mean(gray)
        
        # Calculate contrast (standard deviation of grayscale pixel intensities)
        contrast_score = np.std(gray)
        
        return {
            "blur_score": blur_score,
            "brightness_score": brightness_score,
            "contrast_score": contrast_score
        }
