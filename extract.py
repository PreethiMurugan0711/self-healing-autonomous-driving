import sys

with open(r'c:\Users\murug\OneDrive\Documents\Car Automation\_stitch_reference\_stitch_reference\code.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Separate HTML and JS
js_start = content.find('<script>')
js_end = content.find('</script>', js_start)

# The JS script tag is around line 738, we take everything before it.
html_part = content[:js_start]
js_part = content[js_start:js_end+9]

html_part += '\n    <!-- ADDED: Flask Static JS -->\n    <script src="{{ url_for(\'static\', filename=\'script.js\') }}"></script>\n</body>\n</html>'

# Modify HTML to include actual Video Feed
# Replace the SVG viewport with <img id="video-feed" src="/video_feed" ...>
old_viewport = '<div class="relative w-full aspect-[16/9] bg-[#070e17] overflow-hidden border-b border-outline-variant transition-all duration-300" id="viewportContainer">'
new_viewport = old_viewport + '\n<img id="video-feed" style="width:100%; height:100%; object-fit:contain;" />\n'

html_part = html_part.replace(old_viewport, new_viewport)

# We want to remove the hardcoded SVG and overlays since we have real video
start_svg = html_part.find('<div class="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0')
end_svg = html_part.find('<!-- Bottom HUD Metric Overlay -->')
if start_svg != -1 and end_svg != -1:
    html_part = html_part[:start_svg] + html_part[end_svg:]

# Write HTML
with open(r'c:\Users\murug\OneDrive\Documents\Car Automation\templates\index.html', 'w', encoding='utf-8') as f:
    f.write(html_part)

# Also write the old JS script out for reference
with open(r'c:\Users\murug\OneDrive\Documents\Car Automation\static\stitch_script.js', 'w', encoding='utf-8') as f:
    f.write(js_part)

print("Extraction complete")
