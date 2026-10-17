# Tempo Pebble product website

This is a plain HTML/CSS/JavaScript website for a concept product: a tactile focus timer with a local AI helper. Open this folder in VS Code. No npm install or build step is needed.

## Run the local llama.cpp model and website

The command `llama cli -hf ggml-org/Qwen3.5-0.8B-GGUF` starts an interactive terminal chat. The website needs the llama.cpp API server instead.

### VS Code terminal 1: start llama.cpp server

If you use the newer unified `llama` command, stop the interactive CLI with Ctrl+C and run:

```powershell
llama serve -hf ggml-org/Qwen3.5-0.8B-GGUF --host 127.0.0.1 --port 8080 --cors-origins http://127.0.0.1:5500
```

This loads the Hugging Face model and exposes its local chat API. The first run may download model files. Leave the server running.

If your installation instead has the standalone server executable, use this command from the llama.cpp folder:

```powershell
.\build\bin\llama-server.exe -hf ggml-org/Qwen3.5-0.8B-GGUF --host 127.0.0.1 --port 8080 --cors-origins http://127.0.0.1:5500
```

### VS Code terminal 2: serve the website

In this project folder, run:

```powershell
py -m http.server 5500 --bind 127.0.0.1
```

Open **http://127.0.0.1:5500** in your browser. Do not open `index.html` as a `file:///` page; the browser needs the local web server to connect to llama.cpp.

The AI helper sends prompts to `http://127.0.0.1:8080/v1/chat/completions`. It does not connect to Ollama. Product reviews and pricing on this page are clearly labeled concept placeholders, not real customer claims or a live offer.
