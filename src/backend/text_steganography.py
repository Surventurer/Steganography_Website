class TextSteganography:
    def __init__(self):
        # Zero Width Characters for steganography - exactly as in original
        self.ZWC = {"00":u'\u200C',"01":u'\u202C',"11":u'\u202D',"10":u'\u200E'}
        
        # Reverse mapping for decoding - exactly as in original
        self.ZWC_reverse = {u'\u200C':"00",u'\u202C':"01",u'\u202D':"11",u'\u200E':"10"}
    
    def txt_encode(self, text, words):
        """Original txt_encode function - unchanged logic"""
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
        HM_SK = ""
        
        # Original encoding logic - exactly as your code
        result_text = ""
        i = 0
        while(i < len(res1)):  
            if int(i/12) >= len(words):
                break
            s = words[int(i/12)]
            j = 0
            x = ""
            HM_SK = ""
            while(j < 12):
                if i + j + 1 < len(res1):
                    x = res1[j + i] + res1[i + j + 1]
                    HM_SK += self.ZWC[x]
                j += 2
            s1 = s + HM_SK
            result_text += s1 + " "  # Add space after each word like original
            i += 12
        
        # Add remaining words - original logic
        t = int(len(res1)/12)     
        while t < len(words): 
            result_text += words[t] + " "  # Add space after each word like original
            t += 1
        
        return result_text.strip()  # Remove trailing space
    
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
            
            # Use original encoding function
            stego_text = self.txt_encode(secret_message, words)
            
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