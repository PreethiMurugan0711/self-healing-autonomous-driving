class PerceptionValidator:
    def __init__(self):
        pass
        
    def validate(self, pre_detections, pre_conf, post_detections, post_conf):
        """
        Compare before and after healing.
        Returns: 
            success (bool): True if recovery is considered successful
            improvement_percentage (float): Improvement in confidence
        """
        if len(pre_detections) == 0 and len(post_detections) == 0:
            return False, 0.0 # No improvement, still no objects
            
        if len(pre_detections) == 0 and len(post_detections) > 0:
            return True, 100.0 # Complete improvement, found new objects
            
        # Calculate improvement percentage
        # e.g., pre=42%, post=86% -> improvement = 44%
        improvement = (post_conf - pre_conf) * 100.0
        
        success = False
        
        # We consider it a success if:
        # 1. More objects were detected
        # 2. Or confidence improved by at least a small threshold
        if len(post_detections) > len(pre_detections):
            success = True
        elif improvement > 1.0: # Even slightly better confidence
            success = True
            
        return success, improvement
