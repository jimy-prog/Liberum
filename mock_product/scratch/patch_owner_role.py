import re
with open("src/mock/AuthPages.tsx", "r") as f:
    code = f.read()

code = code.replace('userRole = "owner"; // though mock app might only support teacher/student', 'userRole = "teacher"; // owner sees teacher dashboard in mock')

with open("src/mock/AuthPages.tsx", "w") as f:
    f.write(code)
