# Architecture Notes

## Frontend

- Electron shell for desktop packaging
- React UI for workflow, previews, and queue management
- presets-first UX with advanced controls hidden by default

## Backend

- Flask API bootstrap for local orchestration
- abstract interfaces for detector, embedder, parser, tracker, and stabilizer
- separate image and video pipelines

## Media

- FFmpeg wrapper module reserved for decode and encode orchestration
- audio passthrough is kept in the video export design from the start

## Why This Scaffold Matters

This keeps us from building a throwaway prototype. The first implementation can plug a real swap engine into a stable project structure instead of forcing a rewrite once video quality and temporal consistency become important.

