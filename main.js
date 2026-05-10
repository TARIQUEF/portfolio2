// main.js - Handles hover animations for project cards
(function () {
  // Respect user's motion preferences (accessibility)
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const sparklePath =
    "M93.781 51.578C95 50.969 96 49.359 96 48c0-1.375-1-2.969-2.219-3.578 0 0-22.868-1.514-31.781-10.422-8.915-8.91-10.438-31.781-10.438-31.781C50.969 1 49.375 0 48 0s-2.969 1-3.594 2.219c0 0-1.5 22.87-10.406 31.781-8.908 8.913-31.781 10.422-31.781 10.422C1 45.031 0 46.625 0 48c0 1.359 1 2.969 2.219 3.578 0 0 22.873 1.51 31.781 10.422 8.906 8.911 10.406 31.781 10.406 31.781C45.031 95 46.625 96 48 96s2.969-1 3.562-2.219c0 0 1.523-22.871 10.438-31.781 8.913-8.908 31.781-10.422 31.781-10.422Z";

  if (!prefersReducedMotion) {
    const sparkleSvg = `<svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${sparklePath}" fill="currentColor"/></svg>`;
    document.querySelectorAll(".project-card").forEach((card) => {
      if (card.querySelector(".project-card-sparkles")) return;
      const layer = document.createElement("div");
      layer.className = "project-card-sparkles";
      layer.setAttribute("aria-hidden", "true");
      layer.innerHTML = sparkleSvg.repeat(8);
      card.prepend(layer);
    });
  }

  if (prefersReducedMotion) return;

  // Find all project images that have animated content
  const images = document.querySelectorAll(".project-image[data-animated]");

  images.forEach((img) => {
    const staticSrc = img.getAttribute("data-static") || img.getAttribute("src");
    const animatedSrc = img.getAttribute("data-animated");

    if (!animatedSrc) return;

    // Check if it's a video file (we'll handle videos differently)
    const isVideo = /\.(mp4|webm|mov)$/i.test(animatedSrc);
    const isGif = /\.gif$/i.test(animatedSrc);

    if (isVideo) {
      // For videos: create a video element that plays on hover
      const video = document.createElement("video");
      video.src = animatedSrc;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.style.display = "none";
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";

      const wrapper = img.parentElement;
      const card = img.closest(".project-card");
      if (!card) return;

      wrapper.style.position = "relative";

      card.addEventListener("mouseenter", () => {
        img.style.opacity = "0";
        video.style.display = "block";
        video.currentTime = 0;
        video.play().catch(() => {
          // If autoplay fails, just show the video element
        });
      });

      card.addEventListener("mouseleave", () => {
        video.pause();
        video.style.display = "none";
        img.style.opacity = "1";
      });

      // Insert video right after the image
      wrapper.insertBefore(video, img.nextSibling);
    } else if (isGif) {
      // For GIFs: simple image swap
      let preloaded = false;

      const preload = () => {
        if (preloaded) return;
        const temp = new Image();
        temp.src = animatedSrc;
        preloaded = true;
      };

      const card = img.closest(".project-card");
      if (!card) return;

      card.addEventListener("mouseenter", () => {
        preload();
        img.src = animatedSrc;
      });

      card.addEventListener("mouseleave", () => {
        img.src = staticSrc;
      });

      img.addEventListener("focus", preload);
    }
  });

  // Add cursor-following glow effect to cards
  const cards = document.querySelectorAll(".project-card");
  
  cards.forEach((card) => {
    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      card.style.setProperty("--mouse-x", `${x}%`);
      card.style.setProperty("--mouse-y", `${y}%`);
    };

    card.addEventListener("mousemove", handleMouseMove);
  });
})();

