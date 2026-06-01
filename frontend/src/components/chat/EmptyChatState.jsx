export default function EmptyChatState() {
  return (
 
    <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] ">
      <img
        src="/chat.png"   // 👈 apna logo ya icon
        alt="Chat"
        className="w-56 mb-6 opacity-90"
      />

      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        Welcome!
      </h2>

      <p className="text-base text-gray-800 text-center max-w-sm">
      No chat started , start conversation by selecting anyone to your contacts
      </p>
    </div>
  );
}
