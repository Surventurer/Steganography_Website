// A simple End-Of-Message marker. Using a complex, less-likely-to-occur sequence is better.
const EOM_MARKER = '||EOM||';

// Converts a string to its binary representation using TextEncoder for UTF-8 support
function stringToBinary(str: string): string {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str + EOM_MARKER);
  let binaryString = '';
  for (let i = 0; i < encoded.length; i++) {
    const binary = encoded[i].toString(2).padStart(8, '0');
    binaryString += binary;
  }
  return binaryString;
}

// Converts a binary string to its original string representation
function binaryToString(binaryStr: string): string {
  const bytes = new Uint8Array(binaryStr.length / 8);
  for (let i = 0, j = 0; i < binaryStr.length; i += 8, j++) {
    bytes[j] = parseInt(binaryStr.slice(i, i + 8), 2);
  }
  
  const decoder = new TextDecoder();
  const decoded = decoder.decode(bytes);
  
  const markerIndex = decoded.indexOf(EOM_MARKER);
  if (markerIndex !== -1) {
      return decoded.substring(0, markerIndex);
  }
  
  return ""; // Marker not found, indicating no message or corrupted data
}

// Encodes a message into the least significant bits (LSB) of image data
export function encodeMessage(imageData: ImageData, message: string): ImageData | null {
  const binaryMessage = stringToBinary(message);
  const data = imageData.data;

  // Each pixel (4 bytes) can store 3 bits (in R, G, B channels). Alpha is unused.
  const maxBytes = (data.length / 4) * 3;
  if (binaryMessage.length > maxBytes) {
    console.error("Message is too long for this image.");
    return null;
  }

  let messageIndex = 0;
  for (let i = 0; i < data.length; i += 4) {
    // Iterate over R, G, B channels
    for (let j = 0; j < 3; j++) {
      if (messageIndex < binaryMessage.length) {
        // Clear the LSB and set it to the message bit
        data[i + j] = (data[i + j] & 0xFE) | parseInt(binaryMessage[messageIndex], 2);
        messageIndex++;
      }
    }
  }

  return imageData;
}

// Decodes a message from the LSB of image data
export function decodeMessage(imageData: ImageData): string {
  const data = imageData.data;
  let binaryMessage = '';
  const markerBinary = stringToBinary('').slice(0, -stringToBinary(EOM_MARKER).length); // Binary of EOM_MARKER without its own EOM

  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      binaryMessage += (data[i + j] & 1).toString();
    }
    // Check for EOM marker periodically to speed up decoding for large images
    if (i % 1000 === 0) {
        if (binaryToString(binaryMessage).includes(EOM_MARKER)) {
            return binaryToString(binaryMessage);
        }
    }
  }
  
  return binaryToString(binaryMessage);
}
