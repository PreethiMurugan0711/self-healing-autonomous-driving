import cv2
from ultralytics import YOLO

class ObjectDetector:
    def __init__(self, model_path="yolov8n.pt"):
        # Load the pretrained YOLO model
        self.model = YOLO(model_path)
        
        # COCO classes for road objects we are interested in
        # 0: person, 1: bicycle, 2: car, 3: motorcycle, 5: bus, 7: truck, 9: traffic light, 11: stop sign
        self.target_classes = [0, 1, 2, 3, 5, 7, 9, 11]

    def detect(self, frame, conf_threshold=0.25):
        """
        Detect objects in the given frame.
        Returns the annotated frame, list of detections, and the average confidence.
        """
        results = self.model(frame, classes=self.target_classes, conf=conf_threshold, verbose=False)
        
        annotated_frame = frame.copy()
        detections = []
        
        if len(results) > 0:
            result = results[0]
            annotated_frame = result.plot()
            
            for box in result.boxes:
                cls_id = int(box.cls[0].item())
                conf = box.conf[0].item()
                label = self.model.names[cls_id]
                
                detections.append({
                    "label": label,
                    "confidence": conf,
                    "class_id": cls_id
                })
                
        avg_confidence = 0.0
        if detections:
            avg_confidence = sum(d["confidence"] for d in detections) / len(detections)
            
        return annotated_frame, detections, avg_confidence
