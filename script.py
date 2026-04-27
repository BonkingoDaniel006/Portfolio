import qrcode 

def create(texte):
    qr = qrcode.QRCode(version=1,error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
    qr.add_data(texte)
    qr.make(fit= True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    return qr_img
txt= "https://danielbokingoportfolio.onrender.com"
image= create(txt)
image.save("qr.png")