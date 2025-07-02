## current 

The desktop app sends transcription request to the server, and the server will return transcribed text. The transaction includes integrating with DeepSeek to refine the transcript text.

## expected

The desktop app needs to have a toggle - AI润色. When the toggle is turned on, it signals that we need to refine the transcribed text by integrating with deepseek.

## context

The desktop app now sends the transcription API request to the server and the server returns the response to the desktop app.
server is located at /Users/alvinj/Desktop/Development/Voco-web-portal-alpha/project/server/server.js

## task
add variable in speech api request so that we can turn on or off calling deepseek to refine transcribed text