from flask import Flask, render_template, Response, jsonify, request, send_file
import cv2
import tempfile
import time
import os
import threading
import pandas as pd
from werkzeug.utils import secure_filename

from object_detector import ObjectDetector
from image_quality import ImageQualityAnalyzer
from health_monitor import HealthMonitor
from logger import Logger
from self_healing.healing_controller import HealingController

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

# Global state
class AppState:
    def __init__(self):
        self.detector = ObjectDetector("yolov8n.pt")
        self.qa_analyzer = ImageQualityAnalyzer()
        self.logger = Logger()
        
        self.blur_thresh = 50.0
        self.bright_thresh = 40.0
        self.conf_thresh = 0.3
        
        self.monitor = HealthMonitor(
            blur_threshold=self.blur_thresh, 
            brightness_threshold=self.bright_thresh, 
            conf_threshold=self.conf_thresh
        )
        
        self.healer = HealingController(self.detector)
        
        self.running = False
        self.cap = None
        self.is_image = False
        self.image_frame = None
        
        # Latest metrics for API
        self.latest_detections = []
        self.latest_quality = None
        self.latest_status = "STANDBY"
        self.latest_reasons = []
        self.latest_healing = {
            "status": "N/A", "pre_conf": None, "post_conf": None, "improvement": None, "process_time": None
        }

state = AppState()

def generate_frames():
    frame_count = 0
    while state.running:
        if state.is_image:
            frame = state.image_frame.copy()
            ret = True
            time.sleep(0.5) # Process image at 2Hz to prevent CPU spin
        else:
            if not state.cap or not state.cap.isOpened():
                break
            ret, frame = state.cap.read()
            if not ret:
                state.running = False
                break
                
        frame_count += 1
        
        # Process Frame
        annotated_frame, detections, avg_conf = state.detector.detect(frame)
        quality_metrics = state.qa_analyzer.analyze_quality(frame)
        status, reasons = state.monitor.evaluate(detections, avg_conf, quality_metrics)
        
        pre_conf = avg_conf
        post_conf = None
        improvement = None
        healing_status = "N/A"
        process_time = None
        
        final_frame_to_show = annotated_frame
        
        if status == "DEGRADED":
            # TRIGGER PHASE 2
            (restored_annotated, post_det, post_conf, h_status, 
             imp, p_time, restored_frame) = state.healer.process(
                frame, detections, pre_conf, reasons
            )
            
            # Create side-by-side view for dashboard
            h, w = annotated_frame.shape[:2]
            cv2.putText(annotated_frame, "ORIGINAL (DEGRADED)", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.putText(restored_annotated, "RESTORED", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            combined = cv2.hconcat([annotated_frame, restored_annotated])
            final_frame_to_show = cv2.resize(combined, (w, h))
            
            detections = post_det
            healing_status = h_status
            improvement = imp
            process_time = p_time
            
            if h_status == "SUCCESS":
                status = "RECOVERED"
            else:
                status = "WARNING_SAFE_FALLBACK"
        
        state.logger.log_frame(frame_count, len(detections), pre_conf, post_conf, improvement, quality_metrics, status, reasons, healing_status, process_time)
        
        # Update state for API
        state.latest_detections = detections
        state.latest_quality = quality_metrics
        state.latest_status = status
        state.latest_reasons = reasons
        state.latest_healing = {
            "status": healing_status,
            "pre_conf": pre_conf,
            "post_conf": post_conf,
            "improvement": improvement,
            "process_time": process_time
        }
        
        # Encode frame for MJPEG
        ret, buffer = cv2.imencode('.jpg', final_frame_to_show)
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
               
        time.sleep(0.01)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/update_config', methods=['POST'])
def update_config():
    data = request.json
    state.blur_thresh = data.get('blur_thresh', state.blur_thresh)
    state.bright_thresh = data.get('bright_thresh', state.bright_thresh)
    state.conf_thresh = data.get('conf_thresh', state.conf_thresh)
    
    state.monitor = HealthMonitor(
        blur_threshold=state.blur_thresh, 
        brightness_threshold=state.bright_thresh, 
        conf_threshold=state.conf_thresh
    )
    return jsonify({"status": "success"})

@app.route('/start', methods=['POST'])
def start():
    source = request.form.get('source')
    
    if state.cap:
        state.cap.release()
        
    if source == 'Webcam':
        state.cap = cv2.VideoCapture(0)
    else:
        file = request.files.get('file')
        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            if filepath.lower().endswith(('.png', '.jpg', '.jpeg')):
                state.is_image = True
                state.image_frame = cv2.imread(filepath)
                state.cap = None
            elif filepath.lower().endswith(('.mp4', '.avi')):
                state.is_image = False
                state.cap = cv2.VideoCapture(filepath)
            else:
                return jsonify({"error": "Unsupported file format"}), 400
        else:
            return jsonify({"error": "No file uploaded"}), 400
            
    state.running = True
    return jsonify({"status": "success"})

@app.route('/stop', methods=['POST'])
def stop():
    state.running = False
    if state.cap:
        state.cap.release()
        state.cap = None
    return jsonify({"status": "success"})

@app.route('/video_feed')
def video_feed():
    if not state.running:
        return "", 204
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/metrics')
def metrics():
    return jsonify({
        "is_running": state.running,
        "detections": state.latest_detections,
        "quality": state.latest_quality,
        "health": {
            "status": state.latest_status,
            "reasons": state.latest_reasons
        },
        "healing": state.latest_healing
    })

@app.route('/export_logs')
def export_logs():
    df = state.logger.get_dataframe()
    if df.empty:
        return "No logs available", 404
        
    csv_path = os.path.join(tempfile.gettempdir(), 'phase1_logs.csv')
    df.to_csv(csv_path, index=False)
    
    return send_file(csv_path, as_attachment=True, download_name='phase1_logs.csv', mimetype='text/csv')

if __name__ == '__main__':
    app.run(debug=True, threaded=True, host='0.0.0.0', port=5000)
