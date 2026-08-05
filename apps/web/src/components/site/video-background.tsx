"use client";

export function VideoBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-bg-poster.jpg"
        className="h-full w-full object-cover object-bottom motion-reduce:hidden"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
      <img
        src="/hero-bg-poster.jpg"
        alt=""
        className="hidden h-full w-full object-cover object-bottom motion-reduce:block"
      />
    </div>
  );
}
