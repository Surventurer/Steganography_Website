import wave

def embed(infile: str, message: str, outfile: str):
    # TODO add password functionality preferably using encryption
    """This takes your message and hides it in infile and saves it in outfile"""
    song = wave.open(infile, mode='rb')
    # Read frames and convert to byte array
    frame_bytes = bytearray(list(song.readframes(song.getnframes())))

    # Append dummy data to fill out rest of the bytes. Receiver shall detect and remove these characters.
    message = message + int((len(frame_bytes) - (len(message) * 8 * 8)) / 8) * '#'
    # Convert text to bit array
    bits = list(map(int, ''.join([bin(ord(i)).lstrip('0b').rjust(8, '0') for i in message])))

    # Replace LSB of each byte of the audio data by one bit from the text bit array
    for i, bit in enumerate(bits):
        frame_bytes[i] = (frame_bytes[i] & 254) | bit
    frame_modified = bytes(frame_bytes)

    # Write bytes to a new wave audio file
    with wave.open(outfile, 'wb') as fd:
        fd.setparams(song.getparams())
        fd.writeframes(frame_modified)
    song.close()
    return outfile


def extract(file: str):
    """This function takes the filepath and decodes the hidden data and returns it"""
    song = wave.open(file, mode='rb')
    # Convert audio to byte array
    frame_bytes = bytearray(list(song.readframes(song.getnframes())))
    # Extract the LSB of each byte
    extracted = [frame_bytes[i] & 1 for i in range(len(frame_bytes))]
    # Convert byte array back to string
    message = "".join(chr(int("".join(map(str, extracted[i:i+8])), 2)) for i in range(0, len(extracted), 8))
    # Cut off at the filler characters
    decoded = message.split("###")[0]
    song.close()
    return decoded

if __name__=="__main__":
    while True:
        print("This module encrypt decrypt only '.wav' extension.\n\
\t:: Welcome to Audio Steganography ::\n\t\t1. Encode\n\t\t2. Decode\n\t\t3. Exit\n")
        n=input("Enter your choice: ")
        if n=='1':
            aud = input("Enter audio name(with '.wav' extension) : ")
            data = input("Enter data to be encoded : ")
            audo=input("Enter audio outfile name(with '.wav' extension) : ")
            try:
                embed(aud,data,audo)
                print("Audio encoded Successfully....!\n\t\tx...x...x\n")
            except Exception as  e:
                print("ERROR!!: ",e,'\n\t\tx...x...x\n')
        elif n=='2':
            aud = input("Enter audio name(only with '.wav' extension) : ")
            try:
                print("Decoded Information: - ",extract(aud),end='\n\t\tx...x...x\n\n')
            except Exception as e:
                print("ERROR!!: ",e,'\n\t\tx...x...x\n')
        elif n=='3':
            break
        else:
            print("Invalid choice...Please try again!")
            input()
            break
