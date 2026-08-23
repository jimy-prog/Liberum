import glob

files = glob.glob("routers/*.py")

for file in files:
    try:
        with open(file, "r") as f:
            text = f.read()

        if "require_owner" in text and "require_teacher_or_owner" not in text:
            text = text.replace("require_owner", "require_teacher_or_owner")
            with open(file, "w") as f:
                f.write(text)
    except Exception as e:
        pass
