import numpy as np
import os
import wave
import json
import tempfile
import subprocess
import warnings
from scipy.fft import dct, idct
from Crypto.Cipher import AES
import base64

warnings.filterwarnings("ignore")

class AudioSteganography:
    """Unified Audio Steganography class supporting MP3, WAV, and other audio formats."""
    
    def __init__(self, delta: float = 1000.0, frame_size: int = 2048, coefficient_index: int = 20):
        """Initialize AudioSteganography with robust parameters for MP3 processing."""
        self.delta = delta
        self.frame_size = frame_size
        self.coefficient_index = coefficient_index

    def _encrypt_message(self, message: str, password: str) -> bytes:
        """Encrypt message using AES encryption."""
        cipher = AES.new(password.encode('utf-8').ljust(32, b'0'), AES.MODE_EAX)
        ciphertext, tag = cipher.encrypt_and_digest(message.encode())
        return base64.b64encode(cipher.nonce + tag + ciphertext)

    def _decrypt_message(self, data: bytes, password: str) -> str:
        """Decrypt message using AES decryption."""
        decoded = base64.b64decode(data)
        nonce, tag, ciphertext = decoded[:16], decoded[16:32], decoded[32:]
        cipher = AES.new(password.encode('utf-8').ljust(32, b'0'), AES.MODE_EAX, nonce=nonce)
        return cipher.decrypt_and_verify(ciphertext, tag).decode()

    def _load_audio_mp3(self, path: str):
        """
        Load an MP3 into a mono 16-bit PCM numpy array (float32) plus its sample rate.
        """
        with subprocess.Popen(
            ["ffmpeg", "-y", "-v", "quiet", "-i", path,
             "-f", "s16le", "-acodec", "pcm_s16le", "-ac", "1", "-"],
            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL
        ) as p:
            chunks = []
            while True:
                chunk = p.stdout.read(65536)
                if not chunk:
                    break
                chunks.append(chunk)
            p.wait()
        
        raw_data = b''.join(chunks)
        audio = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32)
        
        probe = subprocess.run(
            ["ffprobe", "-v", "quiet", "-select_streams", "a:0",
             "-show_entries", "stream=sample_rate",
             "-of", "csv=p=0", path],
            capture_output=True, check=True, text=True
        )
        sr = int(probe.stdout.strip())
        return audio, sr

    def _save_audio_mp3(self, audio: np.ndarray, sr: int, out_path: str):
        """
        Take a float32/int16 numpy array (mono), and encode it back to MP3.
        """
        with subprocess.Popen(
            ["ffmpeg", "-y", "-v", "quiet",
             "-f", "s16le", "-acodec", "pcm_s16le", "-ac", "1", "-ar", str(sr), "-i", "-",
             "-b:a", "256k", out_path],
            stdin=subprocess.PIPE, stderr=subprocess.DEVNULL
        ) as p:
            audio_bytes = audio.astype(np.int16).tobytes()
            chunk_size = 65536
            for i in range(0, len(audio_bytes), chunk_size):
                p.stdin.write(audio_bytes[i:i+chunk_size])
            p.stdin.close()
            p.wait()

    def _encode_bits_vectorized(self, message: str) -> np.ndarray:
        """Convert string to bit array using vectorized operations."""
        message_bytes = np.frombuffer(message.encode('utf-8'), dtype=np.uint8)
        bits = np.unpackbits(message_bytes)
        header = np.array([int(b) for b in format(len(message), '08b')], dtype=np.uint8)
        return np.concatenate([header, bits])

    def _decode_bits_vectorized(self, bits: np.ndarray, length: int) -> str:
        """Convert bit array back to string using vectorized operations."""
        if len(bits) < 8 + length * 8:
            return ""
        
        msg_bits = bits[8:8 + length * 8]
        msg_bytes = np.packbits(msg_bits.reshape(-1, 8))
        
        try:
            return msg_bytes.tobytes().decode('utf-8')
        except:
            msg = ""
            for i in range(0, len(msg_bits), 8):
                byte_val = int(''.join(map(str, msg_bits[i:i+8])), 2)
                if 32 <= byte_val <= 126:
                    msg += chr(byte_val)
                elif byte_val == 0:
                    break
                else:
                    msg += "?"
            return msg

    def encode_mp3(self, audio_file: str, message: str, output_file: str) -> dict:
        """Encode a message into an MP3 audio file using QIM."""
        try:
            capacity_info = self.get_mp3_capacity(audio_file)
            if not capacity_info["status"] or len(message) > capacity_info["capacity"]:
                 return {
                    "capacity": capacity_info.get("capacity", 0),
                    "stego_text": "",
                    "hidden_message": message,
                    "status": False
                }

            audio, sr = self._load_audio_mp3(audio_file)
            full_bits = self._encode_bits_vectorized(message)
            num_frames = (len(audio) - self.frame_size + 1) // self.frame_size

            if len(full_bits) > num_frames:
                return {
                    "stego_text": "",
                    "status": False
                }
            
            total_samples = num_frames * self.frame_size
            frames_view = audio[:total_samples].reshape(num_frames, self.frame_size)
            encode_count = len(full_bits)

            if encode_count > 0:
                target_frames = frames_view[:encode_count]
                dct_coeffs = dct(target_frames, norm='ortho', axis=1)
                dct_coeffs[:, self.coefficient_index] = np.where(
                    full_bits.astype(bool), self.delta, -self.delta
                )
                frames_view[:encode_count] = idct(dct_coeffs, norm='ortho', axis=1)
            
            modified_audio = np.empty_like(audio)
            modified_audio[:total_samples] = frames_view.ravel()
            
            if total_samples < len(audio):
                modified_audio[total_samples:] = audio[total_samples:]
            
            np.clip(modified_audio, -32768, 32767, out=modified_audio)
            self._save_audio_mp3(modified_audio, sr, output_file)
            
            return {
                "stego_text": output_file,
                "status": True
            }
        except Exception:
            return {
                "stego_text": "",
                "status": False
            }

    def decode_mp3(self, audio_file: str) -> dict:
        """Decode a hidden message from an MP3 audio file."""
        try:
            audio, _ = self._load_audio_mp3(audio_file)
            num_frames = (len(audio) - self.frame_size + 1) // self.frame_size
            max_frames_for_len = min(256, num_frames)

            if max_frames_for_len < 8:
                 return {"hidden_message": "", "status": False}

            frames_view_len = audio[:max_frames_for_len * self.frame_size].reshape(max_frames_for_len, self.frame_size)
            dct_coeffs_len = dct(frames_view_len, norm='ortho', axis=1)
            coeffs_len = dct_coeffs_len[:, self.coefficient_index]
            bits_len = (coeffs_len > 0).astype(np.uint8)
            
            if len(bits_len) < 8:
                return {"hidden_message": "", "status": False}
                
            length = int("".join(map(str, bits_len[:8])), 2)
                
            if not (0 < length <= 500):
                return {"hidden_message": "", "status": False}
            
            needed_bits = 8 + length * 8
            if num_frames < needed_bits:
                return {"hidden_message": "", "status": False}

            frames_view_msg = audio[:needed_bits * self.frame_size].reshape(needed_bits, self.frame_size)
            dct_coeffs_msg = dct(frames_view_msg, norm='ortho', axis=1)
            coeffs_msg = dct_coeffs_msg[:, self.coefficient_index]
            bits_msg = (coeffs_msg > 0).astype(np.uint8)
            message = self._decode_bits_vectorized(bits_msg, length)
            capacity_info = self.get_mp3_capacity(audio_file)
            
            return {
                "hidden_message": message,
                "status": True
            }
        except Exception:
            return { "hidden_message": "", "status": False }

    def get_mp3_capacity(self, audio_file: str) -> dict:
        """Check the encoding capacity of an MP3 file."""
        try:
            file_size = os.path.getsize(audio_file)
            estimated_samples = file_size * 5
            num_frames = estimated_samples // self.frame_size

            if num_frames < 100:
                 audio, _ = self._load_audio_mp3(audio_file)
                 num_frames = (len(audio) - self.frame_size + 1) // self.frame_size
            
            max_chars = max(0, (num_frames - 8) // 8)
            
            return {
                "capacity": max_chars,
                "status": True
            }
        except Exception:
            return {
                "capacity": 0,
                "status": False
            }

    def encode_wav(self, infile: str, message: str, outfile: str) -> dict:
        """Encode message in WAV file using LSB."""
        try:
            capacity_info = self.get_wav_capacity(infile)
            if not capacity_info["status"] or len(message) > capacity_info["capacity"]:
                return {
                    "stego_text": "",
                    "status": False
                }

            with wave.open(infile, mode='rb') as song:
                frame_bytes = bytearray(list(song.readframes(song.getnframes())))
                params = song.getparams()

            message = message + int((len(frame_bytes) - (len(message) * 8)) / 8) * '#'
            bits = list(map(int, ''.join([bin(ord(i)).lstrip('0b').rjust(8, '0') for i in message])))

            for i, bit in enumerate(bits):
                frame_bytes[i] = (frame_bytes[i] & 254) | bit
            frame_modified = bytes(frame_bytes)

            with wave.open(outfile, 'wb') as fd:
                fd.setparams(params)
                fd.writeframes(frame_modified)
            
            return {
                "stego_text": outfile,
                "status": True
            }
        except Exception:
            return {
                "stego_text": "",
                "status": False
            }

    def decode_wav(self, file: str) -> dict:
        """Decode hidden message from WAV file."""
        try:
            with wave.open(file, mode='rb') as song:
                frame_bytes = bytearray(list(song.readframes(song.getnframes())))
            
            extracted = [frame_bytes[i] & 1 for i in range(len(frame_bytes))]
            message = "".join(chr(int("".join(map(str, extracted[i:i+8])), 2)) for i in range(0, len(extracted), 8))
            decoded = message.split("#")[0]
            capacity_info = self.get_wav_capacity(file);
            
            return {
                "hidden_message": decoded,
                "status": True
            }
        except Exception:
            return {
                "hidden_message": "",
                "status": False
            }

    def get_wav_capacity(self, file: str) -> dict:
        """Calculate the maximum message capacity for a WAV file."""
        try:
            with wave.open(file, mode='rb') as song:
                frame_count = song.getnframes()
            
            max_chars = frame_count // 8
            
            return {
                "capacity": max_chars,
                "status": True
            }
        except Exception:
            return {
                "capacity": 0,
                "status": False
            }

    def get_other_capacity(self, file_path: str) -> dict:
        """Calculate the embedding capacity for other file formats."""
        try:
            # For append-based steganography, capacity is practically unlimited.
            return {
                "capacity": float('inf'),
                "status": True
            }
        except Exception:
            return {
                "capacity": 0,
                "status": False
            }

    def encode_other(self, input_path: str, message: str, output_path: str) -> dict:
        """Encode message in other audio formats by appending encrypted data."""
        password = r'''+n%.Y9J~"p/VC<2=s@;,OQZ%£897u7A'''
        try:
            with open(input_path, "rb") as file:
                audio_data = file.read()
            encrypted = self._encrypt_message(message, password)
            with open(output_path, "wb") as file:
                file.write(audio_data + b":::" + encrypted)
            
            return {
                "stego_text": output_path,
                "status": True
            }
        except Exception:
            return {
                "stego_text": "",
                "status": False
            }

    def decode_other(self, file_path: str) -> dict:
        """Decode hidden message from other audio formats."""
        password = r'''+n%.Y9J~"p/VC<2=s@;,OQZ%£897u7A'''
        try:
            with open(file_path, "rb") as file:
                combined_data = file.read()
            if b":::" not in combined_data:
                return {
                    "hidden_message": "",
                    "status": False
                }
            _, encrypted_message = combined_data.rsplit(b":::", 1)
            decoded_message = self._decrypt_message(encrypted_message, password)
            
            return {
                "hidden_message": decoded_message,
                "status": True
            }
        except Exception:
            return {
                "hidden_message": "",
                "status": False
            }

if __name__ == "__main__":
    steganographer = AudioSteganography()

    # Test WAV
    print("--- Testing WAV ---")
    wav_capacity = steganographer.get_wav_capacity("input/3.wav")
    print(f"WAV Capacity: {wav_capacity}")
    wav_encode_result = steganographer.encode_wav("input/3.wav", "Hello WAV", "output.wav")
    print(f"WAV Encode: {wav_encode_result}")
    if wav_encode_result["status"]:
        wav_decode_result = steganographer.decode_wav("output.wav")
        print(f"WAV Decode: {wav_decode_result}")

    # Test MP3
    print("\n--- Testing MP3 ---")
    mp3_capacity = steganographer.get_mp3_capacity("input/1.mp3")
    print(f"MP3 Capacity: {mp3_capacity}")
    mp3_encode_result = steganographer.encode_mp3("input/1.mp3", "Hello MP3", "output.mp3")
    print(f"MP3 Encode: {mp3_encode_result}")
    if mp3_encode_result["status"]:
        mp3_decode_result = steganographer.decode_mp3("output.mp3")
        print(f"MP3 Decode: {mp3_decode_result}")

    # Test Other (FLAC)
    print("\n--- Testing Other (FLAC) ---")
    other_capacity = steganographer.get_other_capacity("input/sample1.flac")
    print(f"Other Capacity: {other_capacity}")
    other_encode_result = steganographer.encode_other("input/sample1.flac", "output.flac", "Hello FLAC")
    print(f"Other Encode: {other_encode_result}")
    if other_encode_result["status"]:
        other_decode_result = steganographer.decode_other("output.flac")
        print(f"Other Decode: {other_decode_result}")
