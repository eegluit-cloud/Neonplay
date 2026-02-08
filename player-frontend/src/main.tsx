import { createRoot } from "react-dom/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import App from "./App.tsx";
import "./index.css";

gsap.registerPlugin(ScrollTrigger);

gsap.defaults({
  ease: "power2.out",
  duration: 0.5,
});

ScrollTrigger.config({
  fastScrollEnd: 3000,
});

createRoot(document.getElementById("root")!).render(<App />);
