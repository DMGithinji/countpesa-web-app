function Loader() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <div className="flex gap-2">
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className="h-3 w-3 rounded-full bg-primary animate-bounce"
            style={{
              animationDelay: `${dot * 0.15}s`,
              animationDuration: "0.6s",
            }}
          />
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500 font-medium">Loading transactions...</p>
    </div>
  );
}

export default Loader;
