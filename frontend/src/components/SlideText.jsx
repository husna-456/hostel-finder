import { useEffect, useRef } from "react";

export default function SlideText({ text }) {
  const textRef = useRef(null);

  useEffect(() => {
    const element = textRef.current;
    let x = window.innerWidth;

    const interval = setInterval(() => {
      x -= 2; // faster
      element.style.transform = `translateX(${x}px)`;
      if (x < -element.offsetWidth) x = window.innerWidth;
    }, 10); // faster interval

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden whitespace-nowrap text-gray-200 mt-2">
      <p ref={textRef} className="inline-block text-lg font-semibold">
        {text}
      </p>
    </div>
  );
}






