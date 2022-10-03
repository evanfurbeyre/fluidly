# Convert mp4 to mp3
# brew install ffmpeg   (can take a bit)
ffmpeg -i ~/Downloads/audioclip.mp4 -vn -acodec libmp3lame -ac 2 -ab 160k -ar 48000 audioclip_out.mp3

# WIP
aws --profile cbe s3 cp ~/Downloads/paul1.ogg s3://audiolog-audio
aws --profile cbe --region us-east-2 transcribe start-transcription-job --transcription-job-name evan1 --language-code fr-FR --media MediaFileUri=s3://audiolog-audio/paul1.ogg
