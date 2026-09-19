import logo from "../assets/logo.jpeg";

function Loading() {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="flex flex-col items-center">

        {/* LOGO */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-28 w-28 rounded-full border-4 border-indigo-200 border-t-indigo-700 animate-spin"></div>

          <img
            src={logo}
            alt="SSB Gagak Muda"
            className="h-20 w-20 rounded-full object-cover shadow-lg"
          />
        </div>

        {/* TEXT */}
        <h2 className="mt-7 text-xl font-black text-gray-800">
          Gagak Muda
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Memuat halaman...
        </p>

        {/* DOT ANIMATION */}
        <div className="mt-3 flex gap-1">
          <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce"></span>
          <span
            className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce"
            style={{ animationDelay: "0.15s" }}
          ></span>
          <span
            className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce"
            style={{ animationDelay: "0.3s" }}
          ></span>
        </div>

      </div>
    </div>
  );
}

export default Loading;