(function () {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("p");
  const project = slug && window.PROJECTS && window.PROJECTS[slug];

  const contentEl = document.getElementById("project-content");
  const errorEl = document.getElementById("project-error");

  if (!project) {
    document.title = "Project not found — My Project Gallery";
    if (errorEl) errorEl.hidden = false;
    return;
  }

  document.title = `${project.title} — My Project Gallery`;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText("project-title", project.title);
  setText("project-tagline", project.tagline || "");

  const overviewEl = document.getElementById("project-overview");
  if (overviewEl) {
    const parts = Array.isArray(project.overview)
      ? project.overview
      : String(project.overview || "")
          .split(/\n+/)
          .map((p) => p.trim())
          .filter(Boolean);

    parts.forEach((text, index) => {
      const p = document.createElement("p");
      p.textContent = text;
      if (parts.length > 1 && index === parts.length - 1) {
        p.classList.add("project-detail-overview-note");
      }
      overviewEl.appendChild(p);
    });
  }

  const winnerBadge = document.getElementById("project-winner-badge");
  if (winnerBadge) {
    winnerBadge.hidden = !project.winner;
  }

  const parseYoutubeId = (raw) => {
    if (!raw || typeof raw !== "string") return "";
    const trimmed = raw.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    try {
      const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(`https://${trimmed}`);
      if (url.hostname.includes("youtu.be")) return url.pathname.slice(1).split("/")[0];
      return url.searchParams.get("v") || "";
    } catch {
      return trimmed.split(/[?&#]/)[0].slice(0, 11);
    }
  };

  const createYoutubeIframe = (videoId) => {
    const embedParams = new URLSearchParams({
      autoplay: "1",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
    });
    if (project.youtubeStart) {
      embedParams.set("start", String(project.youtubeStart));
    }

    const iframe = document.createElement("iframe");
    iframe.className = "project-video-embed";
    iframe.src = `https://www.youtube.com/embed/${videoId}?${embedParams.toString()}`;
    iframe.title = `${project.title} demo video`;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.loading = "eager";
    return iframe;
  };

  const mediaRoot = document.getElementById("project-media-root");
  const mediaSection = document.getElementById("project-media-section");
  const videoContainer = document.getElementById("project-video-container");
  const placeholder = document.getElementById("project-video-placeholder");
  const videoId = parseYoutubeId(project.youtubeId);

  if (project.mediaGallery?.length && mediaRoot) {
    mediaRoot.innerHTML = "";

    const showcase = document.createElement("div");
    showcase.className = "project-media-showcase";

    const primaryFrame = document.createElement("div");
    primaryFrame.className = "project-video-frame project-media-showcase__primary";
    primaryFrame.id = "project-video-container";

    let iframe = null;
    if (videoId) {
      iframe = createYoutubeIframe(videoId);
      primaryFrame.appendChild(iframe);
    } else {
      primaryFrame.innerHTML = `
        <div class="project-video-placeholder">
          <span class="project-video-placeholder-icon" aria-hidden="true">▶</span>
          <p>Demo video coming soon</p>
        </div>`;
    }

    const grid = document.createElement("div");
    grid.className = "project-media-showcase__grid";

    const appendGalleryItem = (item) => {
      const thumb = document.createElement("div");
      thumb.className = "project-media-showcase__thumb";

      if (item.type === "video") {
        const video = document.createElement("video");
        video.src = item.src;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.autoplay = true;
        if (item.poster) video.poster = item.poster;
        if (item.alt) video.setAttribute("aria-label", item.alt);
        thumb.appendChild(video);
      } else {
        const img = document.createElement("img");
        img.src = item.src;
        img.alt = item.alt || "";
        img.loading = "lazy";
        img.decoding = "async";
        thumb.appendChild(img);
      }

      grid.appendChild(thumb);
    };

    project.mediaGallery
      .filter((item) => item.type !== "youtube")
      .slice(0, 3)
      .forEach(appendGalleryItem);

    showcase.appendChild(primaryFrame);
    showcase.appendChild(grid);
    mediaRoot.appendChild(showcase);

    if (iframe && mediaSection) {
      setupVideoMiniPlayer({
        iframe,
        mainFrame: primaryFrame,
        videoSection: mediaSection,
        projectTitle: project.title,
      });
    }
  } else if (videoId && videoContainer) {
    if (placeholder) placeholder.remove();

    const iframe = createYoutubeIframe(videoId);
    videoContainer.appendChild(iframe);
    setupVideoMiniPlayer({
      iframe,
      mainFrame: videoContainer,
      videoSection: mediaSection || document.querySelector(".project-detail-video"),
      projectTitle: project.title,
    });
  }

  const highlightsEl = document.getElementById("project-highlights");
  if (highlightsEl && project.highlights) {
    project.highlights.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      highlightsEl.appendChild(li);
    });
  }

  const stackEl = document.getElementById("project-stack");
  if (stackEl && project.stack) {
    project.stack.forEach((tech) => {
      const span = document.createElement("span");
      span.className = "project-stack-tag";
      span.textContent = tech;
      stackEl.appendChild(span);
    });
  }

  const actionsEl = document.getElementById("project-actions");
  if (actionsEl) {
    const links = [
      {
        href: project.github,
        label: "View on GitHub",
        className: "project-cta project-cta--primary",
        icon: "⌥",
      },
      {
        href: project.demo,
        label: "Try it live",
        className: "project-cta project-cta--secondary",
        icon: "↗",
      },
      {
        href: project.devpost,
        label: "Devpost",
        className: "project-cta project-cta--ghost",
        icon: "★",
      },
    ];

    let added = 0;
    links.forEach(({ href, label, className, icon }) => {
      if (!href) return;
      const a = document.createElement("a");
      a.href = href;
      a.className = className;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.innerHTML = `<span class="project-cta-icon" aria-hidden="true">${icon}</span>${label}`;
      actionsEl.appendChild(a);
      added += 1;
    });

    if (added === 0) {
      const note = document.createElement("p");
      note.className = "project-actions-note";
      note.textContent =
        "Links coming soon — add GitHub, live demo, or Devpost URLs in js/projects-data.js.";
      actionsEl.appendChild(note);
    }
  }

  if (contentEl) contentEl.hidden = false;
})();

function setupVideoMiniPlayer({ iframe, mainFrame, videoSection, projectTitle }) {
  if (!iframe || !mainFrame || !videoSection) return;

  const mini = document.getElementById("project-video-mini");
  const miniFrame = document.getElementById("project-video-mini-frame");
  const miniLabel = document.getElementById("project-video-mini-label");
  const backBtn = document.getElementById("project-video-mini-back");

  if (!mini || !miniFrame) return;

  if (miniLabel) miniLabel.textContent = projectTitle;

  let dockedToMini = false;

  const dockToMain = () => {
    if (!dockedToMini) return;
    dockedToMini = false;
    mainFrame.appendChild(iframe);
    mainFrame.classList.remove("project-video-frame--docked");
    mini.classList.remove("is-active");
    mini.hidden = true;
  };

  const dockToMini = () => {
    if (dockedToMini) return;
    dockedToMini = true;
    miniFrame.appendChild(iframe);
    mainFrame.classList.add("project-video-frame--docked");
    mini.hidden = false;
    requestAnimationFrame(() => mini.classList.add("is-active"));
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.intersectionRatio < 0.15) {
        dockToMini();
      } else {
        dockToMain();
      }
    },
    { threshold: [0, 0.15, 0.35, 1] }
  );

  observer.observe(videoSection);

  backBtn?.addEventListener("click", () => {
    videoSection.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

