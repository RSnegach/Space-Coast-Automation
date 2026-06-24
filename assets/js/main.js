/* =========================================================================
   Space Coast Automation - site behavior
   No dependencies. Progressive enhancement: the page works without JS.
   ========================================================================= */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------------------------------------------------------------
     Current year in footer
     --------------------------------------------------------------------- */
  function setYear() {
    var els = document.querySelectorAll("[data-year]");
    var year = new Date().getFullYear();
    els.forEach(function (el) {
      el.textContent = year;
    });
  }

  /* ---------------------------------------------------------------------
     Sticky header scroll state
     --------------------------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) return;

    var close = function () {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
    };

    var open = function () {
      toggle.setAttribute("aria-expanded", "true");
      menu.classList.add("is-open");
      document.body.classList.add("no-scroll");
    };

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      expanded ? close() : open();
    });

    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) close();
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------------------------------------------------------------------
     Count-up metrics. Element carries data-count="40" data-suffix="%"
     --------------------------------------------------------------------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    var duration = 1200;
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = (target * eased).toFixed(decimals);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(frame);
  }

  function initCounters() {
    var counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-count"));
        var decimals = (el.getAttribute("data-count").split(".")[1] || "")
          .length;
        el.textContent =
          (el.getAttribute("data-prefix") || "") +
          target.toFixed(decimals) +
          (el.getAttribute("data-suffix") || "");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------------------------------------------------------------------
     Logo trajectory draw-on
     --------------------------------------------------------------------- */
  function initLogoDraw() {
    if (prefersReducedMotion) return;
    var marks = document.querySelectorAll("[data-draw]");
    marks.forEach(function (el) {
      requestAnimationFrame(function () {
        el.classList.add("is-drawn");
      });
    });
  }

  /* ---------------------------------------------------------------------
     Contact form (FormSubmit AJAX) + spam protections
     Submissions POST to the endpoint in the form's data-endpoint attribute,
     which forwards to the site inbox. Layered defenses: honeypot, time trap,
     link/HTML heuristics, and a per-browser rate limit.
     --------------------------------------------------------------------- */
  var SUBMIT_STORE = "sca_contact_submits";
  var MIN_GAP_MS = 30000; // minimum 30s between submissions
  var HOURLY_CAP = 5; // max submissions per rolling hour, per browser
  var MIN_FILL_MS = 2500; // faster than this is almost certainly a bot

  function recentSubmits() {
    try {
      return JSON.parse(localStorage.getItem(SUBMIT_STORE)) || [];
    } catch (e) {
      return [];
    }
  }

  function recordSubmit() {
    var list = recentSubmits();
    list.push(Date.now());
    try {
      localStorage.setItem(SUBMIT_STORE, JSON.stringify(list.slice(-20)));
    } catch (e) {}
  }

  function rateLimitMessage() {
    var now = Date.now();
    var list = recentSubmits();
    if (
      list.some(function (t) {
        return now - t < MIN_GAP_MS;
      })
    ) {
      return "You just sent a message. Give us a moment to read it before sending another.";
    }
    if (
      list.filter(function (t) {
        return now - t < 3600000;
      }).length >= HOURLY_CAP
    ) {
      return "You have sent several messages recently. Please email us directly at inquiries@space-coast-automation.com.";
    }
    return null;
  }

  function spamReason(message) {
    var links = (
      message.match(
        /https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|io|co|ru|info|xyz|top|biz|link|click)\b/gi
      ) || []
    ).length;
    if (links >= 2) return "links";
    if (/<\/?[a-z][\s\S]*>/i.test(message)) return "html";
    if (/\[url|\[link|\/url\]/i.test(message)) return "bbcode";
    return null;
  }

  function successMsg() {
    return "Got it. We will reply within one business day, usually sooner. Check your inbox, and your spam folder just in case.";
  }

  function setFieldError(field, message) {
    if (!field) return;
    field.classList.toggle("field--invalid", !!message);
    var err = field.querySelector(".field__error");
    if (err) err.textContent = message || "";
    var input = field.querySelector("input, select, textarea");
    if (input) {
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
  }

  function showStatus(form, type, message) {
    var box = form.querySelector("[data-form-status]");
    if (!box) return;
    box.className = "form-status is-visible form-status--" + type;
    var text = box.querySelector("[data-status-text]");
    if (text) text.textContent = message;
    box.setAttribute("role", type === "error" ? "alert" : "status");
  }

  function hideStatus(form) {
    var box = form.querySelector("[data-form-status]");
    if (box) box.className = "form-status";
  }

  function validate(form) {
    var ok = true;
    var fields = form.querySelectorAll(".field[data-required]");
    fields.forEach(function (field) {
      var input = field.querySelector("input, select, textarea");
      if (!input) return;
      var value = (input.value || "").trim();
      if (!value) {
        setFieldError(field, "We need this one to reach you back.");
        ok = false;
        return;
      }
      if (input.type === "email") {
        var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!valid) {
          setFieldError(field, "That email does not look right. Mind checking it?");
          ok = false;
          return;
        }
      }
      setFieldError(field, "");
    });
    return ok;
  }

  function initForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;

    var loadedAt = Date.now();
    var endpoint = form.getAttribute("data-endpoint") || "";

    // Clear field error on input
    form.querySelectorAll(".field[data-required]").forEach(function (field) {
      var input = field.querySelector("input, select, textarea");
      if (input) {
        input.addEventListener("input", function () {
          setFieldError(field, "");
        });
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideStatus(form);

      // 1) Honeypot: bots fill this hidden field. Show success, send nothing.
      var honey = form.querySelector('input[name="_honey"]');
      if (honey && honey.value) {
        form.reset();
        showStatus(form, "success", successMsg());
        return;
      }

      // 2) Time trap: submitted faster than a human plausibly could.
      if (Date.now() - loadedAt < MIN_FILL_MS) {
        form.reset();
        showStatus(form, "success", successMsg());
        return;
      }

      // 3) Required fields and email format
      if (!validate(form)) {
        showStatus(
          form,
          "error",
          "Please fix the highlighted fields and try again."
        );
        return;
      }

      // 4) Obvious-spam content heuristics
      var msgEl = form.querySelector('[name="message"]');
      var message = msgEl ? msgEl.value.trim() : "";
      if (message.length < 10) {
        showStatus(
          form,
          "error",
          "Please add a sentence or two about what you need."
        );
        return;
      }
      if (spamReason(message)) {
        showStatus(
          form,
          "error",
          "Please remove links and formatting from your message. We will follow up, and you can share links once we are in touch."
        );
        return;
      }

      // 5) Rate limit (anti-inundation)
      var limited = rateLimitMessage();
      if (limited) {
        showStatus(form, "error", limited);
        return;
      }

      if (!endpoint) {
        showStatus(
          form,
          "error",
          "This form is not connected yet. Please email us directly at inquiries@space-coast-automation.com."
        );
        return;
      }

      var submitBtn = form.querySelector("[data-submit]");
      var originalLabel = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.setAttribute("aria-busy", "true");
        submitBtn.innerHTML = "Sending...";
      }

      var payload = {};
      new FormData(form).forEach(function (v, k) {
        payload[k] = v;
      });

      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res
            .json()
            .catch(function () {
              return {};
            })
            .then(function (json) {
              return { ok: res.ok, json: json };
            });
        })
        .then(function (result) {
          var ok =
            result.ok &&
            (result.json.success === true || result.json.success === "true");
          if (ok) {
            recordSubmit();
            form.reset();
            showStatus(form, "success", successMsg());
          } else {
            throw new Error(
              (result.json && result.json.message) || "Submission failed"
            );
          }
        })
        .catch(function () {
          showStatus(
            form,
            "error",
            "Something did not go through on our end. Please try again, or email us directly at inquiries@space-coast-automation.com."
          );
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.removeAttribute("aria-busy");
            submitBtn.innerHTML = originalLabel;
          }
        });
    });
  }

  /* ---------------------------------------------------------------------
     Init
     --------------------------------------------------------------------- */
  function init() {
    setYear();
    initHeader();
    initNav();
    initReveal();
    initCounters();
    initLogoDraw();
    initForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
