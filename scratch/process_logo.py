import os
import sys

def process_logo():
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("PIL (Pillow) is not installed. We will install it or copy files directly.")
        return False

    logo_path = "Logo.png"
    if not os.path.exists(logo_path):
        print(f"Error: {logo_path} not found in current directory.")
        return False

    print("Opening logo file...")
    img = Image.open(logo_path)
    width, height = img.size
    print(f"Logo dimensions: {width}x{height}")

    # Ensure output directory exists
    os.makedirs("assets/logos", exist_ok=True)

    # 1. Clean Full Logo Crop (removes excess white margins around the logo)
    # The logo components are roughly centered. Let's crop the main content.
    # We will crop from x: 0.2*width to 0.8*width, y: 0.1*height to 0.9*height.
    # Let's write a dynamic bounding box crop based on non-white pixels if possible,
    # or a structured geometric crop:
    left = int(width * 0.28)
    top = int(height * 0.1)
    right = int(width * 0.72)
    bottom = int(height * 0.9)
    
    full_crop = img.crop((left, top, right, bottom))
    full_crop.save("assets/logos/logo-full.png", "PNG")
    print("Saved logo-full.png")

    # 2. Icon Only Crop (Circular emblem in the top half)
    # The emblem center is roughly at x: 0.5*width, y: 0.4*height
    # The radius is roughly 0.23*height
    cx = int(width * 0.5)
    cy = int(height * 0.4)
    r = int(height * 0.25)
    
    icon_box = (cx - r, cy - r, cx + r, cy + r)
    icon_crop = img.crop(icon_box)
    
    # Optional: Make icon background transparent circular mask
    # We will create a transparent circle mask of size (2*r, 2*r)
    mask = Image.new('L', (2*r, 2*r), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, 2*r, 2*r), fill=255)
    
    # Add alpha channel
    icon_rgba = icon_crop.convert("RGBA")
    icon_rgba.putalpha(mask)
    
    icon_rgba.save("assets/logos/logo-icon.png", "PNG")
    print("Saved logo-icon.png")
    
    # 3. Favicon (32x32 scaled icon)
    favicon = icon_rgba.resize((32, 32), Image.Resampling.LANCZOS)
    favicon.save("assets/logos/logo-favicon.png", "PNG")
    print("Saved logo-favicon.png")
    
    # 4. App Icon (180x180 square)
    app_icon = icon_rgba.resize((180, 180), Image.Resampling.LANCZOS)
    app_icon.save("assets/logos/logo-app-icon.png", "PNG")
    print("Saved logo-app-icon.png")

    return True

if __name__ == "__main__":
    success = process_logo()
    if not success:
        sys.exit(1)
