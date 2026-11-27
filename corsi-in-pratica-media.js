const player = document.querySelector(".course-player video");

let youtubeFrame = document.querySelector(".youtube-course iframe");
const watch = document.querySelector("[data-watch]");

function youtubeStart(url, play) {
  const raw = url.searchParams.get("t");
  const seconds = raw && /^\d+$/.test(raw) ? Number(raw) : 0;
  const watchUrl = new URL(watch.href);
  if (seconds) watchUrl.searchParams.set("t", seconds + "s");
  else watchUrl.searchParams.delete("t");
  watch.href = watchUrl.href;

  const embed = new URL(youtubeFrame.src);
  embed.searchParams.set("autoplay", "1");
  embed.searchParams.set("start", seconds);
  if (play) {
    // A fresh frame leaves chapter navigation in the page's own history.
    const nextFrame = youtubeFrame.cloneNode(false);
    nextFrame.removeAttribute("srcdoc");
    nextFrame.src = embed.href;
    youtubeFrame.replaceWith(nextFrame);
    youtubeFrame = nextFrame;
    youtubeFrame.focus();
  } else {
    const preview = youtubeFrame.contentDocument?.querySelector(".course-preview");
    if (preview) preview.href = embed.href;
  }
}

function prepareYouTubePreview() {
  const link = youtubeFrame?.contentDocument?.querySelector(".course-preview");
  if (!link) return;
  youtubeStart(new URL(location.href), false);
  link.onclick = event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    youtubeStart(new URL(location.href), true);
  };
}

youtubeFrame?.addEventListener("load", prepareYouTubePreview);
prepareYouTubePreview();

function seekToChapter(url, shouldPlay) {
  if (youtubeFrame) return youtubeStart(url, shouldPlay);
  const value = url.searchParams.get("t");
  if (!player || value === null || !/^\d+$/.test(value)) return;
  function seek() {
    player.currentTime = Math.min(Number(value), player.duration);
    if (shouldPlay) player.play().catch(() => {});
  }
  if (player.readyState >= HTMLMediaElement.HAVE_METADATA) {
    seek();
  } else {
    player.addEventListener("loadedmetadata", seek, { once: true });
    player.preload = "metadata";
  }
}

document.querySelector(".course-chapters")?.addEventListener("click", event => {
  const link = event.target.closest("a");
  if ((!player && !youtubeFrame) || !link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const url = new URL(link.dataset.videoTime ? location.href : link.href);
  if (link.dataset.videoTime) {
    url.searchParams.set("t", link.dataset.videoTime);
    url.hash = "video";
  }
  if (url.href !== location.href) history.pushState(null, "", url.href);
  seekToChapter(url, true);
  if (player) player.focus();
  (player || youtubeFrame)?.scrollIntoView({ block: "center" });
});

seekToChapter(new URL(location.href), false);
window.addEventListener("popstate", () => {
  const playingOnYouTube = youtubeFrame && !youtubeFrame.hasAttribute("srcdoc");
  seekToChapter(new URL(location.href), playingOnYouTube);
});

const slides = document.querySelector(".slide-preview");
slides?.addEventListener("toggle", () => {
  if (!slides.open || slides.querySelector("iframe")) return;
  const frame = document.createElement("iframe");
  frame.src = slides.querySelector("a[href]").href;
  frame.title = slides.querySelector("summary").textContent;
  slides.append(frame);
});
