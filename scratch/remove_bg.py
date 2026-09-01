"""
Blue Tours - Logo Background Remover
Removes the off-white paper texture background from Logo.png
and saves a transparent PNG ready for web use.
"""

import urllib.request
import subprocess
import sys
import os

# Step 1: Ensure Pillow is installed
try:
    from PIL import Image
    print("Pillow is already installed.")
except ImportError:
    print("Installing Pillow...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "--quiet"])
    from PIL import Image

# Step 2: Load Logo.png
logo_path = os.path.join(os.path.dirname(__file__), "..", "Logo.png")
logo_path = os.path.normpath(logo_path)
print(f"Loading logo from: {logo_path}")

img = Image.open(logo_path).convert("RGBA")
width, height = img.size
print(f"Image size: {width} x {height}")

# Step 3: Sample the background colour from multiple corner pixels
# The paper texture background is a near-white off-white tone
# We sample all 4 corners + near-edges to find the base background shade
pixels = img.load()

sample_points = [
    (0, 0), (width-1, 0),
    (0, height-1), (width-1, height-1),
    (10, 10), (width-10, 10),
    (10, height-10), (width-10, height-10),
    (width//2, 0), (width//2, height-1),
    (0, height//2), (width-1, height//2),
]

bg_samples = [pixels[x, y][:3] for x, y in sample_points]
avg_r = sum(s[0] for s in bg_samples) // len(bg_samples)
avg_g = sum(s[1] for s in bg_samples) // len(bg_samples)
avg_b = sum(s[2] for s in bg_samples) // len(bg_samples)
print(f"Detected background colour (avg): RGB({avg_r}, {avg_g}, {avg_b})")

# Step 4: Remove background using flood-fill approach from all 4 corners
# Tolerance: pixels within this distance from background colour are made transparent
TOLERANCE = 38  # Adjust: higher = more aggressive removal

def colour_distance(c1, c2):
    """Euclidean distance between two RGB tuples."""
    return ((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2 + (c1[2]-c2[2])**2) ** 0.5

bg_colour = (avg_r, avg_g, avg_b)

# Convert to list for mutability
data = list(img.getdata())
new_data = []
removed = 0

for i, pixel in enumerate(data):
    r, g, b, a = pixel
    dist = colour_distance((r, g, b), bg_colour)
    if dist < TOLERANCE:
        # Replace near-background pixels with full transparency
        new_data.append((r, g, b, 0))
        removed += 1
    else:
        new_data.append(pixel)

print(f"Removed {removed} background pixels ({100*removed//(width*height)}% of image)")

# Step 5: Apply the new pixel data
img.putdata(new_data)

# Step 6: Save the transparent PNG in root directory
out_path = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "LogoTransparent.png"))
img.save(out_path, "PNG")
print(f"✅ Saved: {out_path}")
print("Done! Use LogoTransparent.png in your HTML for a clean transparent logo.")
