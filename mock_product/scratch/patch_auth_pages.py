import re

with open("src/mock/AuthPages.tsx", "r") as f:
    code = f.read()

# Add imports
imports = """import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
"""
code = code.replace('import type { Role } from "@/lib/types";', 'import type { Role } from "@/lib/types";\n' + imports)

# 1. Patch MockLoginPage
login_hook = """export function MockLoginPage() {
  const { signIn } = useMock();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      signIn(email.toLowerCase().includes("aziza") || email.toLowerCase().includes("teacher") ? "teacher" : "student");
      navigate("/app");
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      signIn("student");
      navigate("/app");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    }
  };
"""
code = re.sub(
    r'export function MockLoginPage\(\) \{.*?const submit = \(e: FormEvent\) => \{.*?navigate\("/app"\);\n  \};',
    login_hook,
    code,
    flags=re.DOTALL
)

code = code.replace('<GoogleButton />', '<GoogleButton onClick={handleGoogle} />')
code = code.replace('<Field label="Password"><Input type="password" required placeholder="••••••••" /></Field>',
                    '<Field label="Password"><Input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>')
code = code.replace('<Btn type="submit" className="w-full" size="lg">Log in</Btn>',
                    '{error && <p className="text-red-500 text-sm">{error}</p>}\n        <Btn type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Logging in..." : "Log in"}</Btn>')

# 2. Patch MockRegisterPage
register_hook = """export function MockRegisterPage() {
  const { signIn } = useMock();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      signIn(role);
      navigate("/app");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      signIn(role);
      navigate("/app");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    }
  };
"""
code = re.sub(
    r'export function MockRegisterPage\(\) \{.*?const submit = \(e: FormEvent\) => \{.*?navigate\("/app"\);\n  \};',
    register_hook,
    code,
    flags=re.DOTALL
)

code = code.replace('<Field label="Full name"><Input required placeholder="Aziza Karimova" /></Field>',
                    '<Field label="Full name"><Input required placeholder="Aziza Karimova" value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>')
code = code.replace('<Field label="Email"><Input type="email" required placeholder="you@example.com" /></Field>',
                    '<Field label="Email"><Input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>')
code = code.replace('<Field label="Password" hint="At least 8 characters."><Input type="password" required minLength={8} placeholder="••••••••" /></Field>',
                    '<Field label="Password" hint="At least 8 characters."><Input type="password" required minLength={8} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>')
code = code.replace('<Btn type="submit" className="w-full" size="lg">Create account</Btn>',
                    '{error && <p className="text-red-500 text-sm">{error}</p>}\n        <Btn type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Creating..." : "Create account"}</Btn>')


with open("src/mock/AuthPages.tsx", "w") as f:
    f.write(code)
