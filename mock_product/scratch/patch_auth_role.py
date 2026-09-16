import re

with open("src/mock/AuthPages.tsx", "r") as f:
    code = f.read()

new_user_role = """        if (res.ok) {
           success = true;
           const eml = email.toLowerCase();
           if (eml.includes("teacher") || eml.includes("aziza")) {
             userRole = "teacher";
           } else if (eml.includes("owner") || eml.includes("admin")) {
             userRole = "owner"; // though mock app might only support teacher/student
           } else {
             userRole = "student";
           }
        } else {"""

code = re.sub(
    r'if \(res.ok\) \{.*?\} else \{',
    new_user_role,
    code,
    flags=re.DOTALL
)

with open("src/mock/AuthPages.tsx", "w") as f:
    f.write(code)
