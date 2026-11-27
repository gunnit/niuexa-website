const player = document.querySelector(".course-player video");

const youtubeHolder = document.querySelector(".youtube-course");
const youtubePlay = youtubeHolder?.querySelector("[data-youtube-play]");
const watch = document.querySelector("[data-watch]");

function youtubeStart(url, play) {
  const raw = url.searchParams.get("t");
  const seconds = raw && /^\d+$/.test(raw) ? Number(raw) : 0;
  const id = youtubeHolder.dataset.youtubeId;
  const watchUrl = new URL("https://www.youtube.com/watch");
  watchUrl.searchParams.set("v", id);
  if (seconds) watchUrl.searchParams.set("t", seconds + "s");
  watch.href = watchUrl.href;
  if (!play) return;
  const frame = document.createElement("iframe");
  frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&start=" + seconds;
  frame.title = document.querySelector("#video-titolo").textContent;
  frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  frame.allowFullscreen = true;
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  youtubeHolder.replaceChildren(frame);
  frame.focus();
}

if (youtubePlay) {
  youtubePlay.hidden = false;
  youtubePlay.addEventListener("click", () => youtubeStart(new URL(location.href), true));
}

function seekToChapter(url, shouldPlay) {
  if (youtubeHolder) return youtubeStart(url, shouldPlay);
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
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const url = new URL(link.dataset.videoTime ? location.href : link.href);
  if (link.dataset.videoTime) {
    url.searchParams.set("t", link.dataset.videoTime);
    url.hash = "video";
  }
  history.pushState(null, "", url.href);
  seekToChapter(url, true);
  if (player) player.focus();
  (player || youtubeHolder)?.scrollIntoView({ block: "center" });
});

seekToChapter(new URL(location.href), false);
window.addEventListener("popstate", () => seekToChapter(new URL(location.href), false));

const slides = document.querySelector(".slide-preview");
slides?.addEventListener("toggle", () => {
  if (!slides.open || slides.querySelector("iframe")) return;
  const frame = document.createElement("iframe");
  frame.src = slides.querySelector("a[href]").href;
  frame.title = slides.querySelector("summary").textContent;
  slides.append(frame);
});
