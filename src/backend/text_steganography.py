class TextSteganography:
    def __init__(self):
        # Zero Width Characters for steganography - exactly as in original
        self.ZWC = {"00":u'\u200C',"01":u'\u202C',"11":u'\u202D',"10":u'\u200E'}
        
        # Reverse mapping for decoding - exactly as in original
        self.ZWC_reverse = {u'\u200C':"00",u'\u202C':"01",u'\u202D':"11",u'\u200E':"10"}
    
    def txt_encode(self, text, cover_text):
        """Original txt_encode function - preserving original formatting"""
        l = len(text)
        i = 0
        add = ''
        while i < l:
            t = ord(text[i])
            if(t >= 32 and t <= 64):
                t1 = t + 48
                t2 = t1 ^ 170       # 170: 10101010
                res = bin(t2)[2:].zfill(8)
                add += "0011" + res
            else:
                t1 = t - 48
                t2 = t1 ^ 170
                res = bin(t2)[2:].zfill(8)
                add += "0110" + res
            i += 1
        
        res1 = add + "111111111111"
        
        # Split cover text into words while preserving structure
        words = []
        lines = cover_text.split('\n')
        for line in lines: 
            words += line.split()
        
        # Create word-to-position mapping to preserve formatting
        word_positions = []
        word_index = 0
        result_lines = []
        
        for line_idx, line in enumerate(lines):
            line_words = line.split()
            if not line_words:  # Empty line
                result_lines.append("")
                continue
                
            line_result = []
            spaces_before = []
            
            # Find original spacing
            remaining_line = line
            for word in line_words:
                word_pos = remaining_line.find(word)
                spaces_before.append(remaining_line[:word_pos])
                remaining_line = remaining_line[word_pos + len(word):]
            spaces_before.append(remaining_line)  # Trailing spaces
            
            # Process each word in the line
            for word_pos, word in enumerate(line_words):
                # Add the hidden data to words if available
                s1 = word
                if word_index < len(words):
                    # Calculate if this word should have hidden data
                    bit_index = word_index * 12
                    if bit_index < len(res1):
                        j = 0
                        HM_SK = ""
                        while(j < 12):
                            if bit_index + j + 1 < len(res1):
                                x = res1[bit_index + j] + res1[bit_index + j + 1]
                                HM_SK += self.ZWC[x]
                            j += 2
                        s1 = word + HM_SK
                
                # Add word with original spacing
                line_result.append(spaces_before[word_pos] + s1)
                word_index += 1
            
            # Add trailing spaces/content
            line_result.append(spaces_before[-1])
            result_lines.append(''.join(line_result))
        
        return '\n'.join(result_lines)
    
    def encode_message(self, cover_text, secret_message):
        """Encode secret message into cover text - preserving original capacity calculation"""
        try:
            # Split cover text into words - exactly as original
            words = []
            for line in cover_text.split('\n'): 
                words += line.split()
            
            word_count = len(words)
            bt = int(word_count)
            
            # Original logic: bt/6 is just for display, actual check is l <= bt
            max_display = int(bt/6)
            
            # Original condition: if(l<=bt) - length of message <= total word count
            if len(secret_message) > bt:
                return {
                    "success": False,
                    "error": f"String is too big please reduce string size",
                    "max_length": bt,
                    "max_display_info": max_display,
                    "cover_word_count": word_count
                }
            
            # Use original encoding function with cover text
            stego_text = self.txt_encode(secret_message, cover_text)
            
            return {
                "success": True,
                "stego_text": stego_text,
                # "cover_word_count": word_count,
                # "max_chars_capacity": bt,
                # "display_capacity": max_display,
                # "secret_message_length": len(secret_message)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Encoding failed: {str(e)}"
            }
    
    def BinaryToDecimal(self, binary):
        """Original BinaryToDecimal function - unchanged"""
        string = int(binary, 2)
        return string
    
    def decode_message(self, stego_text):
        """Original decode logic - completely unchanged"""
        try:
            words = stego_text.split()
            temp = ''
            
            # Original extraction logic - unchanged
            for words_item in words: 
                T1 = words_item
                binary_extract = ""
                for letter in T1:
                    if(letter in self.ZWC_reverse):
                         binary_extract += self.ZWC_reverse[letter]
                if binary_extract == "111111111111":
                    break
                else:
                    temp += binary_extract
            
            if not temp:
                return {
                    "success": False,
                    "error": "No hidden message found in the provided text."
                }
            
            # Original decoding logic - unchanged
            lengthd = len(temp)
            i = 0
            a = 0
            b = 4
            c = 4
            d = 12
            final = ''
            
            while i < len(temp):
                if b > len(temp) or d > len(temp):
                    break
                    
                t3 = temp[a:b]
                a += 12
                b += 12
                i += 12
                t4 = temp[c:d]
                c += 12
                d += 12
                
                if(t3 == '0110'):
                    decimal_data = self.BinaryToDecimal(t4)
                    final += chr((decimal_data ^ 170) + 48)
                elif(t3 == '0011'):
                    decimal_data = self.BinaryToDecimal(t4)
                    final += chr((decimal_data ^ 170) - 48)
            
            return {
                "success": True,
                "hidden_message": final,
                # "encrypted_bits": temp,
                # "bits_length": lengthd
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Decoding failed: {str(e)}"
            }
