import re

with open("src/mock/store.tsx", "r") as f:
    code = f.read()

# Update MockState interface
code = code.replace("signIn: (role: Role) => void;", "signIn: (user: User | Role) => void;\n  clearHistory: () => void;")

# Update Context value
new_value = """signIn: (u) => {
        if (typeof u === "string") {
          setUser(u === "teacher" ? MOCK_TEACHER : MOCK_STUDENT);
        } else {
          setUser(u);
        }
      },
      clearHistory: () => setAttempts([]),"""
code = code.replace('signIn: (role) => setUser(role === "teacher" ? MOCK_TEACHER : MOCK_STUDENT),', new_value)

with open("src/mock/store.tsx", "w") as f:
    f.write(code)
