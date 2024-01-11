import math
import cv2

def encrypt_image(img_path: str, message: str, new_path: str):
    # load the image
    img = cv2.imread(img_path)
    # break the image into its character level. Represent the characters in ASCII.
    message = [format(ord(i), '08b') for i in message]
    _, width, _ = img.shape
    # algorithm to encode the image
    pix_req = len(message) * 3
    row_req = pix_req / width
    row_req = math.ceil(row_req)

    count, char_count = 0, 0
    for i in range(row_req + 1):
        while count < width and char_count < len(message):
            char = message[char_count]
            char_count += 1
            for index_k, k in enumerate(char):
                if (k == '1' and img[i][count][index_k % 3] % 2 == 0) or (
                        k == '0' and img[i][count][index_k % 3] % 2 == 1):
                    img[i][count][index_k % 3] -= 1
                if index_k % 3 == 2:
                    count += 1
                if index_k == 7:
                    if char_count * 3 < pix_req and img[i][count][2] % 2 == 1:
                        img[i][count][2] -= 1
                    if char_count * 3 >= pix_req and img[i][count][2] % 2 == 0:
                        img[i][count][2] -= 1
                    count += 1
        count = 0
    # Write the encrypted image into a new file
    cv2.imwrite(new_path, img)


def decrypt_image(img_path: str):
    # Algorithm to decrypt the data from the image
    img = cv2.imread(img_path)
    data = []
    stop = False
    for index_i, i in enumerate(img):
        i.tolist()
        for index_j, j in enumerate(i):
            if index_j % 3 == 2:
                # first pixel
                data.append(bin(j[0])[-1])
                # second pixel
                data.append(bin(j[1])[-1])
                # third pixel
                if bin(j[2])[-1] == '1':
                    stop = True
                    break
            else:
                # first pixel
                data.append(bin(j[0])[-1])
                # second pixel
                data.append(bin(j[1])[-1])
                # third pixel
                data.append(bin(j[2])[-1])
        if stop:
            break

    message = []
    # join all the bits to form letters (ASCII Representation)
    for i in range(int((len(data) + 1) / 8)):
        message.append(data[i * 8:(i * 8 + 8)])
    # join all the letters to form the message.
    message = [chr(int(''.join(i), 2)) for i in message]
    return ''.join(message)

if __name__=="__main__":
    while True:
        print("This module encrypt any image and give '.png' output\n\
and we can decrypt only '.png' extension.\n\
\t:: Welcome to Image Steganography ::\n\t\t1. Encode\n\t\t2. Decode\n\t\t3. Exit\n")
        n=input("Enter your choice: ")
        if n=='1':
            img = input("Enter image name(with extension) : ")
            data = input("Enter data to be encoded : ")
            try:
                encrypt_image(img, data, img.split('.')[0]+"_encoded.png")
                print("Image encoded Successfully....!\n\t\tx...x...x\n")
            except Exception as  e:
                print("ERROR!!: ",e,'\n\t\tx...x...x\n')
        elif n=='2':
            img = input("Enter image name(only with '.png' extension) : ")
            try:
                print("Decoded Information: - ",decrypt_image(img),end='\n\t\tx...x...x\n\n')
            except Exception as e:
                print("ERROR!!: ",e,'\n\t\tx...x...x\n')
        elif n=='3':
            break
        else:
            print("Invalid choice...Please try again!")
            input()
            break
