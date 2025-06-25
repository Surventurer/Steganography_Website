# import os
# import cv2
# import math
# import shutil
# import tempfile
# import subprocess
import base64
# import numpy as np
# import concurrent.futures
from pathlib import Path
# from PIL import Image
from Crypto.Cipher import AES

# try:
#     from numba import jit, prange
#     NUMBA_AVAILABLE = True
# except ImportError:
#     NUMBA_AVAILABLE = False
#     def jit(*args, **kwargs):
#         def decorator(func):
#             return func
#         return decorator
#     prange = range

class VideoSteganography:
    PASSWORD = r"UmvR\2$:Pzu0£Pgg0:x9yCJ6NiHA]<"

    def _encrypt_message(self, message: str) -> bytes:
        cipher = AES.new(self.PASSWORD.encode('utf-8').ljust(32, b'0'), AES.MODE_EAX)
        ciphertext, tag = cipher.encrypt_and_digest(message.encode())
        return base64.b64encode(cipher.nonce + tag + ciphertext)

    def _decrypt_message(self, data: bytes) -> str:
        decoded = base64.b64decode(data)
        nonce, tag, ciphertext = decoded[:16], decoded[16:32], decoded[32:]
        cipher = AES.new(self.PASSWORD.encode('utf-8').ljust(32, b'0'), AES.MODE_EAX, nonce=nonce)
        return cipher.decrypt_and_verify(ciphertext, tag).decode()

    def _get_extension(self, filepath: str) -> str:
        return Path(filepath).suffix.lower()

    def encode(self, input_path: str, message: str, output_path: str) -> dict:
        ext = self._get_extension(input_path)
        try:
            # if ext in ['.avi', '.mov']:
            #     self._embed_avi_mov(input_path, message, output_path)
            #     return {"stego_video": output_path, "status": True}
            # # elif ext == '.mp4':
            # #     return {"stego_video": "", "status": False, "error": "MP4 format not supported"}
            # else:
            with open(input_path, "rb") as file:
                data = file.read()
            encrypted = self._encrypt_message(message)
            with open(output_path, "wb") as file:
                file.write(data + b":::" + encrypted)
            return {"stego_video": output_path, "status": True}
        except Exception as e:
            return {"stego_video": "", "status": False, "error": str(e)}

    def decode(self, input_path: str) -> dict:
        ext = self._get_extension(input_path)
        try:
            # if ext in ['.avi', '.mov']:
                # message = self._extract_avi_mov(input_path)
                # return {"hidden_message": message, "status": True}
            # # elif ext == '.mp4':
            # #     return {"hidden_message": "", "status": False, "error": "MP4 format not supported"}
            # else:
            with open(input_path, "rb") as file:
                data = file.read()
            if b":::" not in data:
                return {"hidden_message": "", "status": False, "error": "No hidden data found"}
            _, encrypted = data.rsplit(b":::", 1)
            return {"hidden_message": self._decrypt_message(encrypted), "status": True}
        except Exception as e:
            return {"hidden_message": "", "status": False, "error": str(e)}

    # def _embed_avi_mov(self, input_path, message, output_path):
    #     temp_dir = Path(tempfile.mkdtemp())
    #     frames_dir = temp_dir / "frames"
    #     frames_dir.mkdir()
    #     try:
    #         print(f"Processing video: {input_path}")
            
    #         # Extract frames
    #         result = subprocess.run(f'ffmpeg -y -i "{input_path}" -q:v 1 "{frames_dir}/frame%05d.png"', 
    #                               shell=True, capture_output=True, text=True)
    #         if result.returncode != 0:
    #             raise Exception(f"Frame extraction failed: {result.stderr}")
            
    #         # Get FPS
    #         fps_output = subprocess.run(f'ffmpeg -i "{input_path}" 2>&1', 
    #                                   shell=True, capture_output=True, text=True)
    #         fps = 30
    #         if "fps" in fps_output.stdout:
    #             try:
    #                 fps = float(fps_output.stdout.split("fps")[0].split()[-1])
    #                 print(f"Detected FPS: {fps}")
    #             except:
    #                 print("Using default FPS: 30")
            
    #         message_bytes = message.encode('utf-8')
    #         bits = ''.join(f"{b:08b}" for b in message_bytes) + '1111111111111110'
    #         frames = sorted(frames_dir.glob("frame*.png"))
            
    #         if not frames:
    #             raise Exception("No frames extracted from video")
            
    #         print(f"Extracted {len(frames)} frames")
            
    #         cap = cv2.VideoCapture(str(input_path))
    #         width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    #         height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    #         cap.release()
            
    #         print(f"Video dimensions: {width}x{height}")
            
    #         frame_capacity = width * height
    #         bit_index = 0
            
    #         for frame in frames:
    #             if bit_index >= len(bits):
    #                 break
    #             img = cv2.imread(str(frame))
    #             img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    #             blue = img[:, :, 2].flatten()
    #             bits_to_embed = min(len(blue), len(bits) - bit_index)
    #             for i in range(bits_to_embed):
    #                 blue[i] = (blue[i] & 0xFE) | int(bits[bit_index + i])
    #             img[:, :, 2] = blue.reshape((height, width))
    #             cv2.imwrite(str(frame), cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
    #             bit_index += bits_to_embed
            
    #         print("Reconstructing video from frames...")
    #         temp_video = temp_dir / "video.avi"
    #         video_result = subprocess.run(f'ffmpeg -y -framerate {fps} -i "{frames_dir}/frame%05d.png" -c:v ffv1 "{temp_video}"', 
    #                                     shell=True, capture_output=True, text=True)
            
    #         if video_result.returncode != 0:
    #             raise Exception(f"Video reconstruction failed: {video_result.stderr}")
            
    #         print("Checking for audio stream...")
    #         # Check if the input video has an audio stream
    #         audio_check = subprocess.run(f'ffmpeg -i "{input_path}" -f null - 2>&1', 
    #                                    shell=True, capture_output=True, text=True)
    #         has_audio = "Audio:" in audio_check.stderr
            
    #         if has_audio:
    #             print("Audio stream detected, extracting audio...")
    #             temp_audio = temp_dir / "audio.aac"
    #             audio_result = subprocess.run(f'ffmpeg -y -i "{input_path}" -vn -acodec copy "{temp_audio}"', 
    #                                         shell=True, capture_output=True, text=True)
                
    #             if audio_result.returncode == 0 and temp_audio.exists():
    #                 print("Combining video and audio...")
    #                 # Combine video and audio
    #                 combine_result = subprocess.run(f'ffmpeg -y -i "{temp_video}" -i "{temp_audio}" -c copy "{output_path}"', 
    #                                               shell=True, capture_output=True, text=True)
    #                 if combine_result.returncode != 0:
    #                     print(f"Audio combination failed: {combine_result.stderr}")
    #                     print("Using video only...")
    #                     shutil.copy(temp_video, output_path)
    #             else:
    #                 # Audio extraction failed, use video only
    #                 print(f"Audio extraction failed: {audio_result.stderr}")
    #                 print("Using video only...")
    #                 shutil.copy(temp_video, output_path)
    #         else:
    #             # No audio stream, use video only
    #             print("No audio stream detected, using video only...")
    #             shutil.copy(temp_video, output_path)
                
    #         print(f"Steganography completed successfully: {output_path}")
    #     finally:
    #         shutil.rmtree(temp_dir)

    # def _extract_avi_mov(self, input_path):
    #     temp_dir = Path(tempfile.mkdtemp())
    #     frames_dir = temp_dir / "frames"
    #     frames_dir.mkdir()
    #     try:
    #         print(f"Extracting message from video: {input_path}")
            
    #         # Extract frames
    #         result = subprocess.run(f'ffmpeg -y -i "{input_path}" -q:v 1 "{frames_dir}/frame%05d.png"', 
    #                               shell=True, capture_output=True, text=True)
    #         if result.returncode != 0:
    #             raise Exception(f"Frame extraction failed: {result.stderr}")
            
    #         frames = sorted(frames_dir.glob("frame*.png"))
            
    #         if not frames:
    #             raise Exception("No frames extracted from video")
            
    #         print(f"Extracted {len(frames)} frames for analysis")
            
    #         bits = []
    #         for frame in frames:
    #             img = Image.open(frame)
    #             arr = np.array(img)
    #             if arr.ndim == 3 and arr.shape[2] >= 3:
    #                 blue = arr[:, :, 2].flatten()
    #                 bits.extend([str(b & 1) for b in blue])
    #             joined = ''.join(bits)
    #             if '1111111111111110' in joined:
    #                 idx = joined.index('1111111111111110')
    #                 joined = joined[:idx]
    #                 break
            
    #         if not joined:
    #             raise Exception("No hidden message found in video")
            
    #         print(f"Found {len(joined)} bits of hidden data")
            
    #         # Convert bits to characters
    #         chars = []
    #         for i in range(0, len(joined), 8):
    #             if i + 8 <= len(joined):
    #                 try:
    #                     char_byte = int(joined[i:i+8], 2)
    #                     chars.append(chr(char_byte))
    #                 except ValueError:
    #                     break
            
    #         message = ''.join(chars)
    #         print(f"Successfully extracted message: {len(message)} characters")
    #         return message
    #     finally:
    #         shutil.rmtree(temp_dir)
