"""
Verify video generation functionality with minimal dependencies.
"""
import os
import sys
import numpy as np
import cv2
from pathlib import Path

def create_test_video(output_path, duration=5, fps=24, width=640, height=480):
    """Create a simple test video with OpenCV."""
    print(f"Creating test video: {output_path}")
    print(f"Resolution: {width}x{height}, FPS: {fps}, Duration: {duration}s")
    
    # Create output directory if it doesn't exist
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Define the codec and create VideoWriter object
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # or 'XVID'
    out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))
    
    try:
        total_frames = duration * fps
        
        for i in range(total_frames):
            # Create a blank frame
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            
            # Calculate progress (0.0 to 1.0)
            progress = i / total_frames
            
            # Draw a gradient background
            for y in range(height):
                # Vertical gradient
                color = int(255 * (y / height) * (1 - progress) + 255 * progress)
                cv2.line(frame, (0, y), (width, y), (color, color, 255 - color), 1)
            
            # Add text
            text = f"Test Video - Frame {i+1}/{total_frames}"
            cv2.putText(frame, text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 
                        0.7, (255, 255, 255), 2)
            
            # Draw a moving circle
            center_x = int(width * progress)
            center_y = int(height * (0.5 + 0.4 * np.sin(progress * 2 * np.pi)))
            cv2.circle(frame, (center_x, center_y), 30, (0, 255, 0), -1)
            
            # Write the frame
            out.write(frame)
            
            # Print progress
            if (i + 1) % 10 == 0 or (i + 1) == total_frames:
                print(f"Generated frame {i+1}/{total_frames}")
        
        print("✅ Video creation completed successfully!")
        
    except Exception as e:
        print(f"❌ Error creating video: {str(e)}")
        raise
    finally:
        # Release everything if job is finished
        out.release()
        
        # Verify the output file
        if output_path.exists() and output_path.stat().st_size > 0:
            print(f"✅ Video saved to: {output_path.absolute()}")
            print(f"File size: {output_path.stat().st_size / 1024:.2f} KB")
        else:
            print("❌ Output file was not created or is empty")

def main():
    print("Video Generation Test")
    print("=" * 50)
    
    # Set output path
    output_dir = Path("test_output")
    output_dir.mkdir(exist_ok=True)
    output_path = output_dir / "opencv_test.mp4"
    
    # Create test video
    create_test_video(
        output_path=output_path,
        duration=5,  # 5 seconds
        fps=24,      # 24 frames per second
        width=640,   # 640px width
        height=480   # 480px height
    )
    
    print("\nTest completed!")
    print(f"Try playing the video at: {output_path.absolute()}")

if __name__ == "__main__":
    main()
