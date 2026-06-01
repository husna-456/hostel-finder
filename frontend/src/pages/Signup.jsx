import Header from "../components/Header";
import Signup from "../components/Signup";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md space-y-6">
        <Signup />
      </div>
    </div>
  );
}
