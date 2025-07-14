# Steganography Website
![ab2](https://github.com/Surventurer/Steganography_Website/assets/89982630/4a4cf32d-5a1d-47bd-9f4d-69b0aa4d2b0a)

Welcome to **Steganography Website**, a comprehensive steganography platform that allows users to encode and decode secret messages in various media formats, including text, images, audio, and video. This project is built using Next.js and Flask, combining a modern frontend with a robust backend.

## Features

- **Image Steganography**: Encode and decode messages in images (PNG, JPEG, TIFF).
- **Text Steganography**: Hide and reveal messages in plain text using zero-width characters.
- **Audio Steganography**: Embed and extract messages in audio files (WAV, MP3, etc.).
- **Video Steganography**: Encode and decode messages in video files (MP4, AVI, etc.).

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Flask, Python
- **Styling**: Tailwind CSS with custom themes

## Getting Started locally

- Before continue, install FFmpeg, npm (10.8.2) and uv in your path
1. Clone the repository:
   ```bash
   git clone https://github.com/Surventurer/Steganography_Website.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Steganography_Website
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   ```bash
   uv add -r src/backend/requirements.txt
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   ```bash
   uv run src/backend/main.py
   ```
5. Open your browser and navigate to `http://localhost:3000` for frontend and `http://127.0.0.1:8080` for backend.

## Folder Structure

- `src/app/`: Frontend pages and components
- `src/backend/`: Flask backend for steganography APIs
- `public/`: Static assets (images, PDFs, etc.)

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the GPL-3.0 License. See the `LICENSE` file for details.

## Acknowledgments

Special thanks to the open-source community for providing the tools and libraries that made this project possible.
