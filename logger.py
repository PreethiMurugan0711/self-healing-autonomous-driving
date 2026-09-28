import pandas as pd
import datetime

class Logger:
    def __init__(self):
        self.records = []
        
    def log_frame(self, frame_count, num_objects, pre_conf, post_conf, improvement, quality_metrics, status, reasons, healing_status, process_time):
        record = {
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
            "frame": frame_count,
            "num_objects": num_objects,
            "pre_conf": round(pre_conf, 4),
            "post_conf": round(post_conf, 4) if post_conf is not None else "N/A",
            "improvement_%": round(improvement, 2) if improvement is not None else "N/A",
            "blur_score": round(quality_metrics["blur_score"], 2),
            "brightness_score": round(quality_metrics["brightness_score"], 2),
            "contrast_score": round(quality_metrics["contrast_score"], 2),
            "status": status,
            "reasons": " | ".join(reasons) if reasons else "None",
            "healing_result": healing_status,
            "processing_time": round(process_time, 4) if process_time is not None else "N/A"
        }
        self.records.append(record)
        
    def get_dataframe(self):
        return pd.DataFrame(self.records)
        
    def clear(self):
        self.records = []
