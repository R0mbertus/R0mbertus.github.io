// Turns the server-rendered page into a draggable "window" and lets the
// taskbar/nav links open additional pages as their own floating windows
// (fetched in the background) instead of navigating away, so several
// pages can be open and moved around at once - like a real desktop.
(() => {
	const desktopShell = document.querySelector(".desktop-shell");
	const desktopBanner = document.querySelector(".desktop-banner");
	const taskbar = document.querySelector(".taskbar");
	const initialWindow = document.querySelector(".site-window");
	const taskbarItems = document.querySelector(".taskbar__items");
	const windowTemplate = document.getElementById("window-template");
	const clock = document.getElementById("taskbar-clock");
	const startWrap = document.querySelector(".taskbar__start-wrap");
	const startButton = document.querySelector(".taskbar__start");
	const startMenu = document.querySelector(".taskbar__start-menu");

	if (!desktopShell || !initialWindow || !taskbarItems || !windowTemplate) return;

	// The Start menu is just a launcher (open/focus, like the real Windows
	// Start menu) - it never reflects minimized state. Every *open* window,
	// whether launched from there or from a link inside a page, instead gets
	// its own entry in .taskbar__items for the lifetime it stays open, same
	// as real running-program buttons.
	const startMenuLinksById = new Map();
	document.querySelectorAll(".taskbar__start-menu-link[href]").forEach((link) => {
		startMenuLinksById.set(normalizeId(link.href), link);
		// The server renders aria-current="page" for whichever page this is,
		// which paints the same "pressed" look our own is-open class uses.
		// Once JS is driving, is-open is the only source of truth for that
		// look, otherwise closing the current page's own window can't
		// visually un-press its Start menu entry (aria-current is still there).
		link.removeAttribute("aria-current");
	});

	const openWindows = new Map(); // id -> window element
	let topZIndex = 500;
	let cascadeStep = 0;

	function normalizeId(href) {
		try {
			return new URL(href, location.href).pathname;
		} catch {
			return href;
		}
	}

	function bringToFront(win) {
		topZIndex += 1;
		win.style.zIndex = String(topZIndex);
		updateTaskbarActiveStates();
	}

	function isTopmost(win) {
		return !win.classList.contains("is-hidden") && Number(win.style.zIndex) === topZIndex;
	}

	function setLinkOpen(link, isOpen) {
		if (!link) return;
		link.classList.toggle("is-open", isOpen);
	}

	// The taskbar button for whichever window is focused gets the "pressed"
	// look; every other running window's button looks unpressed, same as
	// the real Windows 98 taskbar.
	function updateTaskbarActiveStates() {
		openWindows.forEach((win) => {
			if (win._taskbarButton) win._taskbarButton.classList.toggle("is-open", isTopmost(win));
		});
	}

	// Keeps windows below the logo and above the taskbar regardless of
	// viewport size, and centers new windows in that space.
	function getDesktopBounds() {
		const bannerBottom = desktopBanner ? desktopBanner.getBoundingClientRect().bottom : 0;
		const taskbarTop = taskbar ? taskbar.getBoundingClientRect().top : window.innerHeight;
		return {
			top: Math.max(16, bannerBottom + 16),
			bottom: Math.max(16, taskbarTop - 16),
		};
	}

	function positionWindow(win, index) {
		const bounds = getDesktopBounds();
		// Let the window grow as tall as the actual available desktop space
		// (between the logo and the taskbar) instead of a fixed vh cap, so it
		// only scrolls internally once it truly can't get any bigger.
		win.style.maxHeight = `${Math.max(240, bounds.bottom - bounds.top)}px`;
		const rect = win.getBoundingClientRect();
		const offset = index * 26;

		let left = (window.innerWidth - rect.width) / 2 + offset;
		let top = bounds.top + Math.max(0, (bounds.bottom - bounds.top - rect.height) / 2) + offset;

		left = Math.min(Math.max(left, 8), Math.max(8, window.innerWidth - rect.width - 8));
		top = Math.min(Math.max(top, bounds.top), Math.max(bounds.top, bounds.bottom - rect.height));

		win.style.left = `${Math.round(left)}px`;
		win.style.top = `${Math.round(top)}px`;
	}

	// Docks a narrow companion window (e.g. the buttons auto-open) hanging a
	// little over the right edge of another window and slightly lower than
	// its top, instead of the centered cascade - like it was just dropped
	// there, not neatly tiled beside it. Falls back to the left edge if
	// there's no room on the right.
	const sideWindowOverlap = 48;
	const sideWindowDownOffset = 64;

	function positionSideWindow(win, anchor) {
		const bounds = getDesktopBounds();
		win.style.maxHeight = `${Math.max(240, bounds.bottom - bounds.top)}px`;
		const anchorRect = anchor.getBoundingClientRect();
		const rect = win.getBoundingClientRect();

		// A little jitter so it doesn't look perfectly mechanical.
		const jitterX = Math.round((Math.random() - 0.5) * 16);
		const jitterY = Math.round((Math.random() - 0.5) * 20);

		let left = anchorRect.right - sideWindowOverlap + jitterX;
		if (left + rect.width > window.innerWidth - 8) {
			left = anchorRect.left - sideWindowOverlap - rect.width + jitterX;
		}
		left = Math.min(Math.max(left, 8), Math.max(8, window.innerWidth - rect.width - 8));
		const top = Math.min(Math.max(anchorRect.top + sideWindowDownOffset + jitterY, bounds.top), Math.max(bounds.top, bounds.bottom - rect.height));

		win.style.left = `${Math.round(left)}px`;
		win.style.top = `${Math.round(top)}px`;
	}

	// Windows for a page with its own Start menu entry (Home/Blog/About) reuse
	// that entry's icon; anything else (e.g. a single blog post) falls back
	// to the generic window icon.
	function getIconClass(id) {
		const icon = startMenuLinksById.get(id)?.querySelector(".taskbar__link-icon");
		const specific = icon && [...icon.classList].find((c) => c !== "taskbar__link-icon");
		return specific || "taskbar__link-icon--window";
	}

	// Creates the running-window button in .taskbar__items for a freshly
	// opened window. It stays put (surviving minimize/restore) until the
	// window is closed. The strip is nowrap + overflow:hidden in CSS, so on
	// a cramped screen extra buttons simply have no room to show rather than
	// wrapping the taskbar onto a second line.
	function createTaskbarItem(win, id, title) {
		const item = document.createElement("li");
		item.className = "taskbar__item taskbar__item--window";
		const button = document.createElement("button");
		button.type = "button";
		button.className = "taskbar__link taskbar__link--window";
		const icon = document.createElement("span");
		icon.className = `taskbar__link-icon ${getIconClass(id)}`;
		icon.setAttribute("aria-hidden", "true");
		button.append(icon, document.createTextNode(title));
		button.addEventListener("click", () => {
			if (win.classList.contains("is-hidden")) {
				restoreWindow(id);
			} else if (isTopmost(win)) {
				minimizeWindow(id);
			} else {
				bringToFront(win);
			}
		});
		item.append(button);
		taskbarItems.append(item);
		win._taskbarItem = item;
		win._taskbarButton = button;
	}

	function minimizeWindow(id) {
		const win = openWindows.get(id);
		if (!win) return;

		win.classList.add("is-minimizing");
		win.addEventListener("animationend", () => {
			win.classList.remove("is-minimizing");
			win.classList.add("is-hidden");
			updateTaskbarActiveStates();
		}, { once: true });
	}

	function restoreWindow(id) {
		const win = openWindows.get(id);
		if (!win) return;

		win.classList.remove("is-hidden");
		win.classList.add("is-restoring");
		win.addEventListener("animationend", () => {
			win.classList.remove("is-restoring");
		}, { once: true });
		bringToFront(win);
	}

	function closeWindow(id) {
		const win = openWindows.get(id);
		if (!win) return;

		win.classList.add("is-minimizing");
		win.addEventListener("animationend", () => {
			if (win._taskbarItem) win._taskbarItem.remove();
			win.remove();
			openWindows.delete(id);
		}, { once: true });
		setLinkOpen(startMenuLinksById.get(id), false);
	}

	function makeDraggable(win) {
		const titleBar = win.querySelector(".title-bar");

		titleBar.addEventListener("pointerdown", (event) => {
			if (event.button !== 0 || event.target.closest(".title-bar-controls")) return;
			event.preventDefault();
			bringToFront(win);

			const startX = event.clientX;
			const startY = event.clientY;
			const startLeft = win.offsetLeft;
			const startTop = win.offsetTop;
			titleBar.setPointerCapture(event.pointerId);

			function onMove(moveEvent) {
				const maxLeft = Math.max(0, window.innerWidth - win.offsetWidth);
				const maxTop = Math.max(0, window.innerHeight - 60);
				const nextLeft = startLeft + (moveEvent.clientX - startX);
				const nextTop = startTop + (moveEvent.clientY - startY);
				win.style.left = `${Math.min(Math.max(nextLeft, 0), maxLeft)}px`;
				win.style.top = `${Math.min(Math.max(nextTop, 0), maxTop)}px`;
			}

			function onUp(upEvent) {
				titleBar.removeEventListener("pointermove", onMove);
				titleBar.releasePointerCapture(upEvent.pointerId);
			}

			titleBar.addEventListener("pointermove", onMove);
			titleBar.addEventListener("pointerup", onUp, { once: true });
		});
	}

	function wireWindow(win, id) {
		win.querySelector('[aria-label="Minimize"]').addEventListener("click", () => minimizeWindow(id));
		win.querySelector('[aria-label="Close"]').addEventListener("click", () => closeWindow(id));
		win.addEventListener("pointerdown", () => bringToFront(win));
		makeDraggable(win);
	}

	function hydrateInitialWindow() {
		const id = normalizeId(location.pathname);
		initialWindow.classList.add("floating-window");
		wireWindow(initialWindow, id);
		positionWindow(initialWindow, 0);
		openWindows.set(id, initialWindow);
		createTaskbarItem(initialWindow, id, initialWindow.querySelector(".title-bar-text").textContent);
		bringToFront(initialWindow);
		setLinkOpen(startMenuLinksById.get(id), true);
	}

	async function fetchWindowContent(url) {
		const response = await fetch(url);
		const contentType = response.headers.get("content-type") || "";
		if (!response.ok || !contentType.includes("html")) throw new Error("Not an HTML page");
		const doc = new DOMParser().parseFromString(await response.text(), "text/html");
		const contentPanel = doc.querySelector(".content-panel");
		if (!contentPanel) throw new Error("No content panel found");
		return {
			title: doc.getElementById("win-title")?.textContent || doc.title,
			html: contentPanel.innerHTML,
		};
	}

	async function openWindow(url, fallbackTitle, { side = false, sideAnchor = null } = {}) {
		const id = normalizeId(url);

		let page;
		try {
			page = await fetchWindowContent(url);
		} catch {
			location.href = url;
			return;
		}

		const fragment = windowTemplate.content.cloneNode(true);
		const win = fragment.querySelector(".floating-window");
		win.querySelector(".title-bar-text").textContent = page.title || fallbackTitle || "";
		win.querySelector(".content-panel").innerHTML = page.html;

		if (side) {
			// Narrower than the .floating-window stylesheet min-width, since
			// this is a companion window docked beside the main one, not a
			// full page - inline styles win over the class rule.
			win.style.minWidth = "0";
			win.style.width = "min(260px, 90vw)";
		} else {
			win.style.width = "min(720px, 90vw)";
		}

		desktopShell.after(win);
		wireWindow(win, id);
		if (side) {
			positionSideWindow(win, sideAnchor || initialWindow);
		} else {
			cascadeStep = (cascadeStep + 1) % 6;
			positionWindow(win, cascadeStep);
		}
		openWindows.set(id, win);
		createTaskbarItem(win, id, page.title || fallbackTitle || "");
		bringToFront(win);
		setLinkOpen(startMenuLinksById.get(id), true);
	}

	// Start menu entries / logo: just open or focus the target, like a real
	// Start menu launcher - minimizing/restoring is the taskbar button's job.
	function openOrFocus(url, fallbackTitle) {
		const id = normalizeId(url);
		const existing = openWindows.get(id);
		if (!existing) {
			openWindow(url, fallbackTitle);
			return;
		}
		if (existing.classList.contains("is-hidden")) {
			restoreWindow(id);
		} else {
			bringToFront(existing);
		}
	}

	function isPlainClick(event) {
		return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
	}

	function setStartMenuOpen(isOpen) {
		if (!startMenu || !startButton) return;
		startMenu.hidden = !isOpen;
		startButton.setAttribute("aria-expanded", String(isOpen));
		startButton.classList.toggle("is-open", isOpen);
	}

	if (startButton && startMenu && startWrap) {
		startButton.addEventListener("click", (event) => {
			if (!isPlainClick(event)) return;
			setStartMenuOpen(startMenu.hidden);
		});

		document.querySelectorAll(".taskbar__start-menu-link[href]").forEach((link) => {
			link.addEventListener("click", (event) => {
				if (!isPlainClick(event)) return;
				event.preventDefault();
				setStartMenuOpen(false);
				openOrFocus(link.href, link.dataset.title || link.textContent.trim());
			});
		});

		document.addEventListener("click", (event) => {
			if (!startMenu.hidden && !startWrap.contains(event.target)) setStartMenuOpen(false);
		});

		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && !startMenu.hidden) setStartMenuOpen(false);
		});
	}

	// Same-site links *inside* window content (blog post list, tags,
	// next/prev, in-post links, ...) would otherwise be plain <a> navigations
	// that reload the page and wipe out every open window. Route them through
	// the same open-a-floating-window path as the taskbar/Start menu instead.
	document.addEventListener("click", (event) => {
		if (!isPlainClick(event)) return;
		const link = event.target.closest("a[href]");
		if (!link || !link.closest(".content-panel")) return;
		if (link.target && link.target !== "_self") return;
		if (link.hasAttribute("download")) return;

		const href = link.getAttribute("href");
		if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

		let url;
		try {
			url = new URL(href, location.href);
		} catch {
			return;
		}
		if (url.origin !== location.origin) return;

		event.preventDefault();
		openOrFocus(url.href, link.textContent.trim());
	});

	const logoLink = document.querySelector(".desktop-banner__logo");
	if (logoLink) {
		logoLink.addEventListener("click", (event) => {
			if (!isPlainClick(event)) return;
			const href = logoLink.getAttribute("href");
			if (!href || href.startsWith("#")) return;
			event.preventDefault();
			openOrFocus(logoLink.href, logoLink.textContent.trim());
		});
	}

	function updateClock() {
		if (!clock) return;
		clock.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
	}

	// Keep the available-height cap honest, and pull any window back on
	// screen, whenever the viewport changes size - including a mobile
	// browser's address bar showing/hiding, which resizes the viewport
	// without the user touching a window.
	function clampWindowsToViewport() {
		const bounds = getDesktopBounds();
		const maxHeight = `${Math.max(240, bounds.bottom - bounds.top)}px`;
		openWindows.forEach((win) => {
			win.style.maxHeight = maxHeight;
			const maxLeft = Math.max(8, window.innerWidth - win.offsetWidth - 8);
			const maxTop = Math.max(bounds.top, bounds.bottom - win.offsetHeight);
			win.style.left = `${Math.min(Math.max(win.offsetLeft, 8), maxLeft)}px`;
			win.style.top = `${Math.min(Math.max(win.offsetTop, bounds.top), maxTop)}px`;
		});
	}

	window.addEventListener("resize", clampWindowsToViewport);
	if (window.visualViewport) window.visualViewport.addEventListener("resize", clampWindowsToViewport);

	// Auto-opens the buttons page docked next to the main
	// window, but only when it isn't already the page being visited and
	// there's actually room beside the main window (either side) for it.
	const buttonsPageId = "/buttons/";
	const buttonsCompanionWidth = 260;

	function maybeOpenButtonsCompanion() {
		const currentId = normalizeId(location.pathname);
		if (currentId === buttonsPageId) return;
		if (openWindows.has(buttonsPageId)) return;

		const anchorRect = initialWindow.getBoundingClientRect();
		const neededRoom = buttonsCompanionWidth - sideWindowOverlap;
		const roomRight = window.innerWidth - anchorRect.right;
		const roomLeft = anchorRect.left;
		if (Math.max(roomRight, roomLeft) < neededRoom) return;

		// openWindow() already brings the companion to front last, so it ends
		// up on top of the main window, like it was just dropped there.
		openWindow(buttonsPageId, "Buttons", { side: true, sideAnchor: initialWindow });
	}

	hydrateInitialWindow();
	maybeOpenButtonsCompanion();
	updateClock();
	setInterval(updateClock, 15000);
})();
