import { useNavigate } from "react-router-dom";

export default function MidSection() {  
  const navigate = useNavigate();
  
  const handleSignIn = () => {
    navigate("/");
  };
  
  return (
    <section className="min-w-[80%] min-h-[80vh] grid grid-cols-1 md:grid-cols-2 p-6 md:p-8">
      {/* Left: Auth / Info Section */}
      <div className="flex flex-col justify-center items-end px-4 text-[var(--color-gray)]">
        <div className="flex flex-col justify-center items-center w-full max-w-sm">
          <h2 className="text-5xl font-bold bungee-regular text-[var(--color-orange)] leading-tight">
            Difficult?
          </h2>
          <h2 className="text-5xl font-bold bungee-regular text-[var(--color-orange)] leading-tight">
            Not <span className="text-[var(--color-light)]">Anymore.</span>
          </h2>

          <p className="text-lg font-semibold text-white mt-4 text-center">
            Experience the power of AI-driven research.
          </p>

          {/* Auth Box */}
          <div className="border border-gray-400 text-[var(--color-light)] p-6 mt-6 rounded-2xl shadow-md bg-[var(--color-gray)] backdrop-blur-sm w-full">
            {/* Google Button */}
            <button className="flex items-center justify-center gap-1 w-full border border-gray-400 rounded-md py-2 text-center hover:bg-neutral-900 hover:text-white transition duration-300">
              {/*Google Logo*/}
              <img src="/icons8-google-logo-48.png" alt="Google Logo" className="w-8 h-8" />
              <div className="font-bungee">
                Continue with Google
              </div>
            </button>

            <p className="text-center text-gray-300 mt-4">or</p>

            {/* Email Signup */}
            <div className="flex flex-col gap-3 mt-4">
              <input
                placeholder="Enter your email"
                className="border border-gray-400 rounded-md px-3 py-2 bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)] transition"
              />
              <button className="bg-[var(--color-orange)] font-bungee rounded-md px-3 py-2 text-white font-semibold hover:bg-[var(--color-light)] hover:text-[var(--color-gray)] transition duration-300"
              onClick={handleSignIn}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Video Section */}
      <div className="flex justify-center items-center px-4 md:px-8">
        <video
          src="/home_placeholder.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="rounded-2xl shadow-xl w-full max-w-[60%] h-auto object-cover"
        />
      </div>
    </section>
  );
}
