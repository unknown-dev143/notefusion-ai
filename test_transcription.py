<<<<<<< HEAD
import asyncio
import os
import requests
import torch
/*************  ✨ Windsurf Command 🌟  *************/

"""
Test script for the transcription service.

Checks the following scenarios:
  1. Transcription of a short audio file.
  2. Transcription of a long audio file (should be skipped).
  3. Transcription with Whisper model not available (should raise an error).
"""
/*******  163b7cf0-6ec6-4544-bdac-e6a4da25b6e3  *******/
from pathlib import Path
from backend.app.services.transcription.service import TranscriptionService

async def download_audio_file(url: str, destination: Path) -> bool:
    try:
        print(f"Downloading audio file from {url}...")
        response = requests.get(url, stream=True, timeout=30)  # Add timeout
        response.raise_for_status()
        
        # Add file size check
        file_size = int(response.headers.get('content-length', 0))
        if file_size > 500 * 1024 * 1024:  # 500MB limit
            raise ValueError("File too large (>500MB)")
            
        # Add content type check
        content_type = response.headers.get('content-type', '')
        if not any(t in content_type for t in ['audio', 'video']):
            raise ValueError(f"Invalid content type: {content_type}")
        
        destination.parent.mkdir(parents=True, exist_ok=True)
        with open(destination, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print("Download completed successfully")
        return True
    except requests.RequestException as e:
        print(f"Network error while downloading: {str(e)}")
        return False
    except Exception as e:
        print(f"Error downloading audio file: {str(e)}")
        return False

async def main():
    temp_files = []
    try:
        # Setup paths using pathlib for better cross-platform compatibility
        test_dir = Path("test_files")
        test_file = test_dir / "test_audio.mp3"
        
        # Create test directory if needed
        test_dir.mkdir(exist_ok=True)
        
        # Check for existing test file
        if not test_file.exists():
            print("\nNo test file found. Options:")
            print("1. Copy your own audio file to:", test_file)
            print("2. Press Enter to download a sample file")
            print("3. Press Ctrl+C to exit")
            
            try:
                input("\nPress Enter to continue...")
                # Using a public domain audio sample
                audio_url = "https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg10.wav"
                if not await download_audio_file(audio_url, test_file):
                    print("Failed to download sample file.")
                    print("Please copy your own audio file to:", test_file)
                    return
            except KeyboardInterrupt:
                print("\nExiting...")
                return
        
        # Verify file exists and get info
        if not test_file.exists():
            print(f"Error: Test audio file not found at {test_file}")
            return
        
        file_size = test_file.stat().st_size / (1024 * 1024)  # Convert to MB
        print(f"\nFound test file: {test_file}")
        print(f"File size: {file_size:.2f} MB")

        try:
            # Initialize transcription service
            print("\nInitializing transcription service...")
            device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"Using device: {device}")
            
            service = TranscriptionService(
                model_size="base",
                device=device
            )
            
            # Start transcription
            print(f"\nStarting transcription...")
            print("This may take a few minutes depending on the file size...")
            
            result = await service.transcribe_audio(
                str(test_file),
                diarize=True,
                generate_diagrams=True
            )
            
            # Handle results
            if "error" in result:
                print(f"\nTranscription error: {result['error']}")
                return
                
            print("\nTranscription Results:")
            print(f"Duration: {result.get('duration_formatted', 'Unknown')}")
            print(f"Speakers detected: {', '.join(result.get('speakers', ['Unknown']))}")
            print("\nTranscribed text:")
            print(result.get('text', 'No text transcribed'))
            
            if 'diagrams' in result:
                print(f"\nGenerated {len(result['diagrams'])} diagrams")
            
            if 'educational_videos' in result:
                print(f"\nGenerated {len(result['educational_videos'])} educational videos")
                
        except Exception as e:
            print(f"\nAn error occurred: {str(e)}")
            raise
    finally:
        # Cleanup temporary files
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.unlink(temp_file)
            except Exception as e:
                print(f"Warning: Could not delete temp file {temp_file}: {e}")

def check_dependencies():
    missing = []
    try:
        import torch
    except ImportError:
        missing.append("torch")
    try:
        import whisper
    except ImportError:
        missing.append("whisper")
    try:
        import openai
    except ImportError:
        missing.append("openai")
        
    if missing:
        print("Missing required packages:", ", ".join(missing))
        print("Install with: pip install", " ".join(missing))
        return False
    return True

if __name__ == "__main__":
    if not check_dependencies():
        exit(1)
=======
import asyncio
import os
import requests
import torch
/*************  ✨ Windsurf Command 🌟  *************/

"""
Test script for the transcription service.

Checks the following scenarios:
  1. Transcription of a short audio file.
  2. Transcription of a long audio file (should be skipped).
  3. Transcription with Whisper model not available (should raise an error).
"""
/*******  163b7cf0-6ec6-4544-bdac-e6a4da25b6e3  *******/
from pathlib import Path
from backend.app.services.transcription.service import TranscriptionService

async def download_audio_file(url: str, destination: Path) -> bool:
    try:
        print(f"Downloading audio file from {url}...")
        response = requests.get(url, stream=True, timeout=30)  # Add timeout
        response.raise_for_status()
        
        # Add file size check
        file_size = int(response.headers.get('content-length', 0))
        if file_size > 500 * 1024 * 1024:  # 500MB limit
            raise ValueError("File too large (>500MB)")
            
        # Add content type check
        content_type = response.headers.get('content-type', '')
        if not any(t in content_type for t in ['audio', 'video']):
            raise ValueError(f"Invalid content type: {content_type}")
        
        destination.parent.mkdir(parents=True, exist_ok=True)
        with open(destination, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print("Download completed successfully")
        return True
    except requests.RequestException as e:
        print(f"Network error while downloading: {str(e)}")
        return False
    except Exception as e:
        print(f"Error downloading audio file: {str(e)}")
        return False

async def main():
    temp_files = []
    try:
        # Setup paths using pathlib for better cross-platform compatibility
        test_dir = Path("test_files")
        test_file = test_dir / "test_audio.mp3"
        
        # Create test directory if needed
        test_dir.mkdir(exist_ok=True)
        
        # Check for existing test file
        if not test_file.exists():
            print("\nNo test file found. Options:")
            print("1. Copy your own audio file to:", test_file)
            print("2. Press Enter to download a sample file")
            print("3. Press Ctrl+C to exit")
            
            try:
                input("\nPress Enter to continue...")
                # Using a public domain audio sample
                audio_url = "https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg10.wav"
                if not await download_audio_file(audio_url, test_file):
                    print("Failed to download sample file.")
                    print("Please copy your own audio file to:", test_file)
                    return
            except KeyboardInterrupt:
                print("\nExiting...")
                return
        
        # Verify file exists and get info
        if not test_file.exists():
            print(f"Error: Test audio file not found at {test_file}")
            return
        
        file_size = test_file.stat().st_size / (1024 * 1024)  # Convert to MB
        print(f"\nFound test file: {test_file}")
        print(f"File size: {file_size:.2f} MB")

        try:
            # Initialize transcription service
            print("\nInitializing transcription service...")
            device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"Using device: {device}")
            
            service = TranscriptionService(
                model_size="base",
                device=device
            )
            
            # Start transcription
            print(f"\nStarting transcription...")
            print("This may take a few minutes depending on the file size...")
            
            result = await service.transcribe_audio(
                str(test_file),
                diarize=True,
                generate_diagrams=True
            )
            
            # Handle results
            if "error" in result:
                print(f"\nTranscription error: {result['error']}")
                return
                
            print("\nTranscription Results:")
            print(f"Duration: {result.get('duration_formatted', 'Unknown')}")
            print(f"Speakers detected: {', '.join(result.get('speakers', ['Unknown']))}")
            print("\nTranscribed text:")
            print(result.get('text', 'No text transcribed'))
            
            if 'diagrams' in result:
                print(f"\nGenerated {len(result['diagrams'])} diagrams")
            
            if 'educational_videos' in result:
                print(f"\nGenerated {len(result['educational_videos'])} educational videos")
                
        except Exception as e:
            print(f"\nAn error occurred: {str(e)}")
            raise
    finally:
        # Cleanup temporary files
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.unlink(temp_file)
            except Exception as e:
                print(f"Warning: Could not delete temp file {temp_file}: {e}")

def check_dependencies():
    missing = []
    try:
        import torch
    except ImportError:
        missing.append("torch")
    try:
        import whisper
    except ImportError:
        missing.append("whisper")
    try:
        import openai
    except ImportError:
        missing.append("openai")
        
    if missing:
        print("Missing required packages:", ", ".join(missing))
        print("Install with: pip install", " ".join(missing))
        return False
    return True

if __name__ == "__main__":
    if not check_dependencies():
        exit(1)
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    asyncio.run(main())