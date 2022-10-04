# Convert mp4 to mp3
# brew install ffmpeg   (can take a bit)
ffmpeg -i ~/Downloads/audioclip.mp4 -vn -acodec libmp3lame -ac 2 -ab 160k -ar 48000 audioclip_out.mp3
ffmpeg -i audio/evan-original-1.mp3 -vn -acodec libmp3lame -ac 2 -ab 96k -ar 44100 audio/evan-original-1.1.mp3

# Reduce audio size
ffmpeg -i audio/evan-feedback-1.mp3 -map 0:a:0 -b:a 36k audio/evan-feedback-1.8.mp3

# Convert to base64
base64 audio/evan-feedback-1.7.mp3 > b64_audio/evan-feedback-1.7

# WIP
aws --profile cbe s3 cp ~/Downloads/paul1.ogg s3://audiolog-audio
aws --profile cbe --region us-east-2 transcribe start-transcription-job --transcription-job-name evan1 --language-code fr-FR --media MediaFileUri=s3://audiolog-audio/paul1.ogg
