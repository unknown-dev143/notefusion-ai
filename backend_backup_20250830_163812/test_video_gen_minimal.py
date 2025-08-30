"""
Minimal video generation test using imageio and numpy.
"""
import os
import sys
import numpy as np
import imageio.v3 as iio
from pathlib import Path

def create_test_video(output_path, duration=5, fps=24, width=640, height=480):
    """Create a simple test video with a moving color gradient."""
    print(f"Creating test video: {output_path}")
    print(f"Resolution: {width}x{height}, FPS: {fps}, Duration: {duration}s")
    
    # Create output directory if it doesn't exist
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Create frames
    frames = []
    total_frames = duration * fps
    
    for i in range(total_frames):
        # Create a gradient that changes over time
        x = np.linspace(0, 1, width).reshape(1, width, 1)
        y = np.linspace(0, 1, height).reshape(height, 1, 1)
        t = i / total_frames
        
        # Create RGB channels with a moving pattern
        r = (0.5 + 0.5 * np.sin(2 * np.pi * (x + t))).astype(np.float32)
        g = (0.5 + 0.5 * np.sin(2 * np.pi * (y + t))).astype(np.float32)
        b = (0.5 + 0.5 * np.sin(2 * np.pi * (x + y + t))).astype(np.float32)
        
        # Combine channels and ensure correct shape (height, width, 3)
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        frame[..., 0] = (r * 255).astype(np.uint8).squeeze()
        frame[..., 1] = (g * 255).astype(np.uint8).squeeze()
        frame[..., 2] = (b * 255).astype(np.uint8).squeeze()
        
        # Add text to the frame
        text = f"Frame {i+1}/{total_frames}"
        frame = add_text_to_frame(frame, text, 20, 30)
        
        frames.append(frame)
        
        # Print progress
        if (i + 1) % 10 == 0 or (i + 1) == total_frames:
            print(f"Generated frame {i+1}/{total_frames}")
    
    # Save as video
    print("Saving video...")
    try:
        # Ensure all frames have the same shape
        target_shape = frames[0].shape
        for i, frame in enumerate(frames):
            if frame.shape != target_shape:
                print(f"Warning: Frame {i} has shape {frame.shape}, expected {target_shape}")
                frames[i] = frame[:target_shape[0], :target_shape[1]]
        
        # Convert frames to numpy array
        video_frames = np.stack(frames)
        
        # Save video
        iio.imwrite(
            output_path,
            video_frames,
            fps=fps,
            codec="libx264",
            output_params=["-pix_fmt", "yuv420p"]
        )
    except Exception as e:
        print(f"Error saving video: {str(e)}")
        raise
    
    print(f"✅ Video saved to: {output_path.absolute()}")
    print(f"File size: {output_path.stat().st_size / 1024:.2f} KB")

def add_text_to_frame(frame, text, x, y, color=(255, 255, 255)):
    """Add text to a frame using PIL."""
    from PIL import Image, ImageDraw, ImageFont
    
    # Convert numpy array to PIL Image
    pil_img = Image.fromarray(frame)
    draw = ImageDraw.Draw(pil_img)
    
    # Use default font
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except IOError:
        font = ImageFont.load_default()
    
    # Draw text
    draw.text((x, y), text, font=font, fill=color)
    
    # Convert back to numpy array
    return np.array(pil_img)

def main():
    print("Minimal Video Generation Test")
    print("=" * 50)
    
    # Set output path
    output_dir = Path("test_output")
    output_dir.mkdir(exist_ok=True)
    output_path = output_dir / "minimal_test.mp4"
    
    try:
        # Create test video
        create_test_video(
            output_path=output_path,
            duration=5,  # 5 seconds
            fps=24,      # 24 frames per second
            width=640,   # 640px width
            height=480   # 480px height
        )
        
        print("\n✅ Test completed successfully!")
        print(f"Try playing the video at: {output_path.absolute()}")
        
    except Exception as e:
        print(f"\n❌ An error occurred: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
