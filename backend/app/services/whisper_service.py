import whisper

class WhisperTranscriber:
    def __init__(self, model_name="base"):
        self.model = whisper.load_model(model_name)

    def transcribe(self, audio_path: str) -> str:
        result = self.model.transcribe(audio_path)
        return result["text"]

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python whisper_service.py <audio_file_path>")
        sys.exit(1)
    audio_path = sys.argv[1]
    transcriber = WhisperTranscriber()
    print(f"Transcribing: {audio_path}")
    try:
        text = transcriber.transcribe(audio_path)
        print("Transcription:")
        print(text)
    except Exception as e:
        print(f"Error during transcription: {e}")
