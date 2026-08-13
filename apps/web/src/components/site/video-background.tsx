"use client";

export function VideoBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-bg-poster.jpg"
        className="h-full w-full object-cover object-center motion-reduce:hidden md:object-contain"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
      <img
        src="/hero-bg-poster.jpg"
        alt=""
        className="hidden h-full w-full object-cover object-center motion-reduce:block md:object-contain"
      />
    </div>
  );
}
