with open("main.py", "r") as f:
    text = f.read()

bad_str = """app.mount("/images",
    "/assets", StaticFiles(directory=str(LANDING_IMAGES_DIR)), name="landing_images")"""

good_str = """app.mount("/images", StaticFiles(directory=str(LANDING_IMAGES_DIR)), name="landing_images")"""

text = text.replace(bad_str, good_str)
with open("main.py", "w") as f:
    f.write(text)
