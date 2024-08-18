from django.shortcuts import render

def index(request):
    return render(request, 'index.html',)

def text(request):
    return render(request, 'Text.html')

def image(request):
    return render(request, 'Image.html')

def audio(request):
    return render(request, 'Audio.html')

def video(request):
    return render(request, 'Video.html')
