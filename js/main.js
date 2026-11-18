/* ===== Navbar: shrink on scroll ===== */
(function () {
  var nav = document.getElementById("main-nav");
  var ticking = null;
  function update() {
    if (window.scrollY > 0) {
      if (nav) nav.classList.add("scrolling");
      var p = 1 - Math.pow(1 - Math.min(window.scrollY / 1000, 1), 4);
      var start = window.innerWidth * 0.8;
      var w = start - (start - 528) * p;
      if (window.innerWidth >= 768 && nav) nav.style.setProperty("width", w + "px");
    } else {
      if (nav) nav.classList.remove("scrolling");
      if (nav) nav.style.setProperty("width", "80%");
    }
    ticking = null;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) ticking = requestAnimationFrame(update);
  }, { passive: true });

  /* smooth scroll for in-page links */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = (a.getAttribute("href") || "").substring(1);
      var target = document.getElementById(id);
      if (!id) return;
      e.preventDefault();
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* highlight active nav link */
  var sections = document.querySelectorAll("section[id]");
  var links = document.querySelectorAll("nav a[href^='#']");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        links.forEach(function (l) { l.classList.remove("active"); });
        var l = document.querySelector('nav a[href="#' + en.target.getAttribute("id") + '"]');
        if (l) l.classList.add("active");
      }
    });
  }, { threshold: 0.6 });
  sections.forEach(function (s) { io.observe(s); });
})();

/* ===== Skills accordion ("What I do?") ===== */
(function () {
  var items = document.querySelectorAll("#home ul.space-y-4 > li");
  items.forEach(function (li) {
    var card = li.firstElementChild;
    var arrow = card.querySelector("svg.transform");
    var panel = card.children[1];
    card.addEventListener("click", function () {
      var open = panel.classList.contains("opacity-100");
      items.forEach(function (o) {
        var c = o.firstElementChild;
        c.children[1].classList.remove("max-h-[500px]", "pb-4", "opacity-100");
        c.children[1].classList.add("max-h-0", "opacity-0");
        c.querySelector("svg.transform").classList.remove("rotate-180");
      });
      if (!open) {
        panel.classList.remove("max-h-0", "opacity-0");
        panel.classList.add("max-h-[500px]", "pb-4", "opacity-100");
        arrow.classList.add("rotate-180");
      }
    });
  });
})();

/* ===== Letter glitch canvas (logo naga Kali dibentuk dari huruf ungu yang berubah jadi biru) ===== */
(function () {
  var canvas = document.querySelector("#home canvas");
  if (!canvas) return;
  var colors = ["#5e4491", "#A476FF", "#241a38"];
  var blue = { r: 75, g: 156, b: 255 };            /* warna biru logo */
  var speed = 33, smooth = true;
  var fontSize = 16, cw = 10, ch = 20;
  var sub = 4;                                       /* resolusi sampling mask per sel huruf */
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>,0123456789".split("");
  var ctx = canvas.getContext("2d");
  if (!ctx) { console.error("Could not initialize the code animation canvas."); return; }
  var dragonPath = new Path2D("M12.778 5.943s-1.97-.13-5.327.92c-3.42 1.07-5.36 2.587-5.36 2.587s5.098-2.847 10.852-3.008zm7.351 3.095l.257-.017s-1.468-1.78-4.278-2.648c1.58.642 2.954 1.493 4.021 2.665zm.42.74c.039-.068.166.217.263.337.004.024.01.039-.045.027-.005-.025-.013-.032-.013-.032s-.135-.08-.177-.137c-.041-.057-.049-.157-.028-.195zm3.448 8.479s.312-3.578-5.31-4.403a18.277 18.277 0 0 0-2.524-.187c-4.506.06-4.67-5.197-1.275-5.462 1.407-.116 3.087.643 4.73 1.408-.007.204.002.385.136.552.134.168.648.35.813.445.164.094.691.43 1.014.85.07-.131.654-.512.654-.512s-.14.003-.465-.119c-.326-.122-.713-.49-.722-.511-.01-.022-.015-.055.06-.07.059-.049-.072-.207-.13-.265-.058-.058-.445-.716-.454-.73-.009-.016-.012-.031-.04-.05-.085-.027-.46.04-.46.04s-.575-.283-.774-.893c.003.107-.099.224 0 .469-.3-.127-.558-.344-.762-.88-.12.305 0 .499 0 .499s-.707-.198-.82-.85c-.124.293 0 .469 0 .469s-1.153-.602-3.069-.61c-1.283-.118-1.55-2.374-1.43-2.754 0 0-1.85-.975-5.493-1.406-3.642-.43-6.628-.065-6.628-.065s6.45-.31 11.617 1.783c.176.785.704 2.094.989 2.723-.815.563-1.733 1.092-1.876 2.97-.143 1.878 1.472 3.53 3.474 3.58 1.9.102 3.214.116 4.806.942 1.52.84 2.766 3.4 2.89 5.703.132-1.709-.509-5.383-3.5-6.498 4.181.732 4.549 3.832 4.549 3.832zM12.68 5.663l-.15-.485s-2.484-.441-5.822-.204C3.37 5.211 0 6.38 0 6.38s6.896-1.735 12.68-.717Z");
  var maskCanvas = document.createElement("canvas");
  var maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
  if (!maskCtx) { console.error("Could not initialize the Kali dragon mask canvas."); return; }
  var letters = [], cols = 0, rows = 0, last = Date.now(), raf = null;
  var animationStarted = Date.now();
  var codeDuration = 2600, transitionDuration = 1100, holdDuration = 2800;
  var cycleDuration = codeDuration + transitionDuration * 2 + holdDuration;
  var coverageMin = 0.2;                             /* min. porsi sel yang tertutup naga agar huruf jadi biru */

  function rc() { return chars[Math.floor(Math.random() * chars.length)]; }
  function hex(h) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
  }
  var palette = colors.map(hex);
  function rcol() { return palette[Math.floor(Math.random() * palette.length)]; }
  function mix(a, b, f) {
    return "rgb(" + Math.round(a.r + (b.r - a.r) * f) + ", " + Math.round(a.g + (b.g - a.g) * f) + ", " + Math.round(a.b + (b.b - a.b) * f) + ")";
  }
  function lerp(a, b, f) {
    return { r: a.r + (b.r - a.r) * f, g: a.g + (b.g - a.g) * f, b: a.b + (b.b - a.b) * f };
  }
  /* huruf yang menjadi bagian naga berubah jadi biru sesuai opacity (0..1) */
  function draw(opacity) {
    if (!letters.length) return;
    var r = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, r.width, r.height);
    ctx.font = fontSize + "px monospace";
    ctx.textBaseline = "top";
    for (var i = 0; i < letters.length; i++) {
      var l = letters[i];
      var isDragon = l.dragon > 0 && opacity > 0;
      /* huruf di luar naga diredupkan sedikit agar bentuk logo lebih jelas */
      ctx.globalAlpha = isDragon ? 1 : 1 - 0.5 * opacity;
      ctx.fillStyle = isDragon ? mix(l.rgb, blue, opacity) : mix(l.rgb, l.rgb, 0);
      ctx.fillText(l.char, l.x, l.y);
    }
    ctx.globalAlpha = 1;
  }
  function resize() {
    var p = canvas.parentElement, dpr = window.devicePixelRatio || 1;
    var r = p.getBoundingClientRect();
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    canvas.style.width = r.width + "px"; canvas.style.height = r.height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(r.width / cw); rows = Math.ceil(r.height / ch);

    /* gambar naga ke mask beresolusi sub x sub per sel huruf */
    /* logo diskalakan dan diposisikan berdasarkan bounding box naga (x 0.04-23.99, y 3.08-20.9) */
    var bw = 23.95, bh = 17.82, bx = 0.04, by = 3.08;
    var logoScale = Math.min(r.width * 0.98 / bw, r.height * 0.98 / bh);
    var logoX = (r.width - logoScale * bw) / 2 - bx * logoScale;
    var logoY = (r.height - logoScale * bh) / 2 - by * logoScale;
    var mw = cols * sub, mh = rows * sub;
    maskCanvas.width = mw; maskCanvas.height = mh;
    maskCtx.clearRect(0, 0, mw, mh);
    var sx = sub / cw, sy = sub / ch;
    maskCtx.setTransform(logoScale * sx, 0, 0, logoScale * sy, logoX * sx, logoY * sy);
    maskCtx.fill(dragonPath);
    maskCtx.setTransform(1, 0, 0, 1, 0, 0);
    var mask = maskCtx.getImageData(0, 0, mw, mh).data;

    letters = [];
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var hit = 0;
        for (var j = 0; j < sub; j++)
          for (var i = 0; i < sub; i++)
            if (mask[((y * sub + j) * mw + (x * sub + i)) * 4 + 3] > 64) hit++;
        var cov = hit / (sub * sub);
        letters.push({
          char: rc(), rgb: rcol(), target: rcol(), from: null, prog: 1,
          x: x * cw, y: y * ch, dragon: cov >= coverageMin ? cov : 0
        });
      }
    }
    draw(0);
  }
  function update() {
    var n = Math.max(1, Math.floor(letters.length * 0.05));
    for (var i = 0; i < n; i++) {
      var l = letters[Math.floor(Math.random() * letters.length)];
      if (!l) continue;
      l.char = rc(); l.target = rcol();
      if (!smooth) { l.rgb = l.target; l.prog = 1; } else { l.from = l.rgb; l.prog = 0; }
    }
  }
  function transitions() {
    letters.forEach(function (l) {
      if (l.prog < 1) {
        l.prog = Math.min(1, l.prog + 0.05);
        l.rgb = lerp(l.from, l.target, l.prog);
      }
    });
  }
  function animate() {
    var now = Date.now();
    var redraw = now - last >= speed;
    if (redraw) { update(); last = now; }
    if (smooth) transitions();
    if (redraw) {
      var phase = (now - animationStarted) % cycleDuration;
      var opacity = 0;
      if (phase >= codeDuration) {
        phase -= codeDuration;
        if (phase < transitionDuration) {
          var progress = phase / transitionDuration;
          opacity = progress * progress * (3 - 2 * progress);
        } else {
          phase -= transitionDuration;
          if (phase < holdDuration) {
            opacity = 1;
          } else {
            var fade = Math.min(1, (phase - holdDuration) / transitionDuration);
            opacity = 1 - fade * fade * (3 - 2 * fade);
          }
        }
      }
      draw(opacity);
    }
    raf = requestAnimationFrame(animate);
  }
  resize(); animate();
  var t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(function () { cancelAnimationFrame(raf); resize(); animate(); }, 100);
  });
})();

/* ===== Like button (disimpan di localStorage browser) ===== */
(function () {
  var box = document.getElementById("like-button");
  if (!box) return;
  var liked = false, likes = 0;
  try {
    liked = localStorage.getItem("websiteIsLiked") === "true";
    likes = parseInt(localStorage.getItem("websiteLikes") || "0", 10) || 0;
  } catch (e) {}
  if (liked && likes < 1) likes = 1;

  var heart = '<path d="M16.5 3C19.5376 3 22 5.5 22 9C22 16 14.5 20 12 21.5C9.5 20 2 16 2 9C2 5.5 4.5 3 7.5 3C9.35997 3 11 4 12 5C13 4 14.64 3 16.5 3ZM12.9339 18.6038C13.8155 18.0485 14.61 17.4955 15.3549 16.9029C18.3337 14.533 20 11.9435 20 9C20 6.64076 18.463 5 16.5 5C15.4241 5 14.2593 5.56911 13.4142 6.41421L12 7.82843L10.5858 6.41421C9.74068 5.56911 8.5759 5 7.5 5C5.55906 5 4 6.6565 4 9C4 11.9435 5.66627 14.533 8.64514 16.9029C9.39 17.4955 10.1845 18.0485 11.0661 18.6038C11.3646 18.7919 11.6611 18.9729 12 19.1752C12.3389 18.9729 12.6354 18.7919 12.9339 18.6038Z"></path>';

  function render(anim) {
    box.innerHTML =
      '<div class="flex items-center"><button type="button" ' + (liked ? "disabled " : "") +
      'class="group relative w-40 h-10 flex items-center justify-center p-3 rounded-full transition-all duration-300 ease-in-out transform border-2 ' +
      (liked ? "border-[var(--sec)] cursor-default" : "border-[var(--white-icon)] hover:scale-105 hover:border-[var(--white)]") +
      (anim ? " animate-heart-pulse" : "") + '">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 transition-all duration-300 ease-in-out ' +
      (liked ? "text-[var(--sec)] scale-110" : "text-[var(--white-icon)] group-hover:text-[var(--white)] group-hover:scale-105") + '">' + heart + "</svg>" +
      '<span class="text-sm pl-3 font-medium text-[var(--white)]">' + likes + " Likes</span></button></div>";
    var b = box.querySelector("button");
    if (!liked) b.addEventListener("click", function () {
      liked = true; likes += 1;
      try { localStorage.setItem("websiteIsLiked", "true"); localStorage.setItem("websiteLikes", String(likes)); } catch (e) {}
      render(true);
      setTimeout(function () { render(false); }, 600);
    });
  }
  render(false);
})();

/* ===== Contact form (Formspree) ===== */
(function () {
  var form = document.getElementById("contact-form");
  var msg = document.getElementById("form-message");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) {
        if (r.ok) { form.reset(); form.style.display = "none"; msg.classList.remove("hidden"); }
        else { r.json().then(function (d) { console.error(d); }); alert("There was a problem sending your message."); }
      })
      .catch(function (err) { console.error(err); alert("There was a problem sending your message."); });
  });
})();
