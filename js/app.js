/**
 * ExamNotes Hub - Main Application Logic
 * Pure Vanilla JavaScript: Fast, responsive, and zero dependencies
 */

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  let notes = getStoredNotes();
  let currentCategory = "all";
  let currentSubCategory = "all";
  let currentSort = "popular";
  let searchQuery = "";
  let bookmarks = JSON.parse(localStorage.getItem("examnotes_bookmarks") || "[]");
  let activePreviewNote = null;
  let currentZoom = 100;
  let currentPreviewPage = 1;

  // -------------------------------------------------------------------------
  // DOM Elements
  // -------------------------------------------------------------------------
  const notesGrid = document.getElementById("notesGrid");
  const resultsCount = document.getElementById("resultsCount");
  const activeFilters = document.getElementById("activeFilters");
  const searchInput = document.getElementById("searchInput");
  const searchCategorySelect = document.getElementById("searchCategorySelect");
  const searchBtn = document.getElementById("searchBtn");
  const subCategoryFilter = document.getElementById("subCategoryFilter");
  const sortSelect = document.getElementById("sortSelect");
  const categoryPills = document.querySelectorAll(".category-pill");
  const bookmarkCountBadge = document.getElementById("bookmarkCountBadge");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const bookmarkNavBtn = document.getElementById("bookmarkNavBtn");
  
  // Stats Elements
  const statTotalNotes = document.getElementById("statTotalNotes");
  const statSubjects = document.getElementById("statSubjects");
  const statDownloads = document.getElementById("statDownloads");

  // Modals
  const pdfModal = document.getElementById("pdfModal");
  const closePdfModalBtn = document.getElementById("closePdfModalBtn");
  const pdfModalTitle = document.getElementById("pdfModalTitle");
  const pdfModalSubtitle = document.getElementById("pdfModalSubtitle");
  const pdfSheetContainer = document.getElementById("pdfSheetContainer");
  const modalDownloadBtn = document.getElementById("modalDownloadBtn");
  const openDirectPdfBtn = document.getElementById("openDirectPdfBtn");
  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const zoomResetBtn = document.getElementById("zoomResetBtn");
  const zoomLevelText = document.getElementById("zoomLevelText");
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const pageIndicator = document.getElementById("pageIndicator");

  // Upload Modal
  const uploadModal = document.getElementById("uploadModal");
  const openUploadModalBtn = document.getElementById("openUploadModalBtn");
  const heroUploadBtn = document.getElementById("heroUploadBtn");
  const closeUploadModalBtn = document.getElementById("closeUploadModalBtn");
  const uploadForm = document.getElementById("uploadForm");

  // Request Section
  const requestNotesBtn = document.getElementById("requestNotesBtn");

  // Toast Container
  const toastContainer = document.getElementById("toastContainer");

  // -------------------------------------------------------------------------
  // Theme Management
  // -------------------------------------------------------------------------
  function initTheme() {
    const savedTheme = localStorage.getItem("examnotes_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("examnotes_theme", theme);
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === "dark" ? "☀️" : "🌙";
      themeToggleBtn.setAttribute("title", theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode");
    }
  }

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(currentTheme === "dark" ? "light" : "dark");
  });

  // -------------------------------------------------------------------------
  // Populate Filter Dropdowns & Stats
  // -------------------------------------------------------------------------
  function updateSubCategoryOptions() {
    const relevantNotes = currentCategory === "all" || currentCategory === "saved"
      ? notes
      : notes.filter(n => n.category === currentCategory);

    const subCategories = Array.from(new Set(relevantNotes.map(n => n.subCategory))).sort();

    subCategoryFilter.innerHTML = '<option value="all">All Subcategories / Streams</option>';
    subCategories.forEach(sub => {
      const opt = document.createElement("option");
      opt.value = sub;
      opt.textContent = sub;
      subCategoryFilter.appendChild(opt);
    });

    currentSubCategory = "all";
    subCategoryFilter.value = "all";
  }

  function updateGlobalStats() {
    if (statTotalNotes) statTotalNotes.textContent = notes.length.toLocaleString() + "+";
    
    const uniqueSubjects = new Set(notes.map(n => n.subject)).size;
    if (statSubjects) statSubjects.textContent = uniqueSubjects + "+";

    const totalDownloads = notes.reduce((sum, n) => sum + (n.downloads || 0), 0);
    if (statDownloads) {
      statDownloads.textContent = (totalDownloads > 1000000 
        ? (totalDownloads / 1000000).toFixed(1) + "M+" 
        : (totalDownloads / 1000).toFixed(0) + "K+");
    }
  }

  // -------------------------------------------------------------------------
  // Filtering & Sorting Logic
  // -------------------------------------------------------------------------
  function getFilteredNotes() {
    return notes.filter(note => {
      // Category filter
      if (currentCategory === "saved") {
        if (!bookmarks.includes(note.id)) return false;
      } else if (currentCategory !== "all" && note.category !== currentCategory) {
        return false;
      }

      // SubCategory filter
      if (currentSubCategory !== "all" && note.subCategory !== currentSubCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = note.title.toLowerCase().includes(query);
        const inSubject = note.subject.toLowerCase().includes(query);
        const inDesc = note.description.toLowerCase().includes(query);
        const inSub = note.subCategory.toLowerCase().includes(query);
        const inLevel = note.level.toLowerCase().includes(query);
        const inAuthor = note.author.toLowerCase().includes(query);
        const inTags = note.tags && note.tags.some(t => t.toLowerCase().includes(query));
        const inHighlights = note.highlights && note.highlights.some(h => h.toLowerCase().includes(query));

        if (!inTitle && !inSubject && !inDesc && !inSub && !inLevel && !inAuthor && !inTags && !inHighlights) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (currentSort === "popular") return b.downloads - a.downloads;
      if (currentSort === "rating") return b.rating - a.rating;
      if (currentSort === "pages") return b.pages - a.pages;
      if (currentSort === "title") return a.title.localeCompare(b.title);
      return 0;
    });
  }

  // -------------------------------------------------------------------------
  // Render Notes Cards
  // -------------------------------------------------------------------------
  function renderNotes() {
    const filtered = getFilteredNotes();
    notesGrid.innerHTML = "";

    // Update Counter
    const categoryName = {
      all: "सभी श्रेणियां (All Notes)",
      "up-govt": "🏛️ UP Government Exams",
      railway: "🚆 Railway Exams",
      teaching: "🎓 Teaching Exams",
      ssc: "🎯 SSC Exams",
      common: "📖 Common Study Notes (सभी परीक्षाओं हेतु)",
      saved: "⭐ सेव किए गए नोट्स (Saved Bookmarks)"
    }[currentCategory] || "Selected";

    resultsCount.innerHTML = `कुल <span>${filtered.length}</span> ${filtered.length === 1 ? 'नोट' : 'नोट्स'} प्रदर्शित (<span>${categoryName}</span>)`;

    // Render Filter Chips
    renderFilterChips();

    // Check Empty State
    if (filtered.length === 0) {
      notesGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">📚</div>
          <h3 class="empty-state-title">No Notes Found</h3>
          <p class="empty-state-text">
            ${currentCategory === "saved" 
              ? "You haven't bookmarked any study notes yet. Click the bookmark icon on any note card to save it here!" 
              : "We couldn't find any study notes matching your filters. Try clearing your search keyword or change the category."}
          </p>
          <button class="btn-cta" id="emptyResetBtn">Reset All Filters</button>
        </div>
      `;
      const emptyResetBtn = document.getElementById("emptyResetBtn");
      if (emptyResetBtn) {
        emptyResetBtn.addEventListener("click", resetAllFilters);
      }
      return;
    }

    // Render Note Cards
    filtered.forEach(note => {
      const isBookmarked = bookmarks.includes(note.id);
      const card = document.createElement("div");
      card.className = "note-card";
      
      const badgeClass = `badge-${note.badgeType || 'accent'}`;

      card.innerHTML = `
        <div>
          <div class="note-card-top">
            <div class="card-badges">
              <span class="badge badge-subject">${escapeHTML(note.subject)}</span>
              <span class="badge ${badgeClass}">${escapeHTML(note.badge)}</span>
            </div>
            <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-id="${note.id}" title="${isBookmarked ? 'Remove from Saved' : 'Save note'}">
              ${isBookmarked ? '★' : '☆'}
            </button>
          </div>

          <h3 class="note-card-title">${escapeHTML(note.title)}</h3>
          
          <div class="note-card-sub">
            <span>🎓 ${escapeHTML(note.subCategory)}</span>
            <span>•</span>
            <span>📍 ${escapeHTML(note.level)}</span>
          </div>

          <p class="note-card-desc">${escapeHTML(note.description)}</p>

          ${note.highlights && note.highlights.length > 0 ? `
            <ul class="highlights-preview">
              ${note.highlights.slice(0, 2).map(h => `<li>${escapeHTML(h)}</li>`).join("")}
            </ul>
          ` : ""}
        </div>

        <div>
          <div class="note-meta-bar">
            <span class="meta-item" title="Pages count">📄 ${note.pages} Pgs</span>
            <span class="meta-item" title="File size">💾 ${note.fileSize}</span>
            <span class="meta-item" title="Downloads count">📥 ${(note.downloads / 1000).toFixed(1)}k</span>
            <span class="meta-item" title="Student rating">⭐ ${note.rating}</span>
          </div>

          <div class="note-actions">
            <button class="btn-card-preview" data-id="${note.id}">
              <span>👁️ Preview</span>
            </button>
            ${note.downloadUrl && note.downloadUrl.endsWith('.html') ? `
              <a href="${note.downloadUrl}" class="btn-card-preview" style="text-decoration: none; background: #4f46e5; color: #fff; border-color: #4338ca;" target="_blank">
                <span>📖 Read Notes</span>
              </a>
            ` : `
              <button class="btn-card-download" data-id="${note.id}">
                <span>⬇️ Download</span>
              </button>
            `}
          </div>
        </div>
      `;

      // Event Listeners for Card buttons
      const bookmarkBtn = card.querySelector(".bookmark-btn");
      bookmarkBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleBookmark(note.id);
      });

      const previewBtn = card.querySelector(".btn-card-preview");
      previewBtn.addEventListener("click", () => {
        openPdfPreview(note);
      });

      const downloadBtn = card.querySelector(".btn-card-download");
      downloadBtn.addEventListener("click", () => {
        downloadNotePdf(note);
      });

      notesGrid.appendChild(card);
    });
  }

  function renderFilterChips() {
    activeFilters.innerHTML = "";
    let hasFilters = false;

    if (searchQuery.trim() !== "") {
      hasFilters = true;
      activeFilters.appendChild(createChip(`Search: "${searchQuery}"`, () => {
        searchQuery = "";
        searchInput.value = "";
        renderNotes();
      }));
    }

    if (currentCategory !== "all") {
      hasFilters = true;
      const label = {
        "up-govt": "🏛️ UP Govt",
        railway: "🚆 Railway",
        teaching: "🎓 Teaching",
        ssc: "🎯 SSC",
        common: "📖 Common Notes",
        saved: "⭐ Saved"
      }[currentCategory] || currentCategory;
      activeFilters.appendChild(createChip(`Category: ${label}`, () => {
        setCategory("all");
      }));
    }

    if (currentSubCategory !== "all") {
      hasFilters = true;
      activeFilters.appendChild(createChip(`Stream: ${currentSubCategory}`, () => {
        currentSubCategory = "all";
        subCategoryFilter.value = "all";
        renderNotes();
      }));
    }

    if (hasFilters) {
      const clearBtn = document.createElement("button");
      clearBtn.className = "btn-clear-filters";
      clearBtn.textContent = "Clear All";
      clearBtn.addEventListener("click", resetAllFilters);
      activeFilters.appendChild(clearBtn);
    }
  }

  function createChip(text, onRemove) {
    const chip = document.createElement("span");
    chip.className = "filter-chip";
    chip.innerHTML = `${escapeHTML(text)} <span class="filter-chip-remove">&times;</span>`;
    chip.querySelector(".filter-chip-remove").addEventListener("click", onRemove);
    return chip;
  }

  function resetAllFilters() {
    currentCategory = "all";
    currentSubCategory = "all";
    searchQuery = "";
    currentSort = "popular";

    searchInput.value = "";
    subCategoryFilter.value = "all";
    sortSelect.value = "popular";
    if (searchCategorySelect) searchCategorySelect.value = "all";

    updateCategoryPillsUI();
    updateSubCategoryOptions();
    renderNotes();
  }

  // -------------------------------------------------------------------------
  // Bookmarks Logic
  // -------------------------------------------------------------------------
  function toggleBookmark(noteId) {
    const index = bookmarks.indexOf(noteId);
    const note = notes.find(n => n.id === noteId);
    const title = note ? note.title : "Note";

    if (index > -1) {
      bookmarks.splice(index, 1);
      showToast(`Removed from Bookmarks: ${title.slice(0, 32)}...`, "info");
    } else {
      bookmarks.push(noteId);
      showToast(`Added to Bookmarks! ⭐`, "success");
    }

    localStorage.setItem("examnotes_bookmarks", JSON.stringify(bookmarks));
    updateBookmarkBadge();
    renderNotes();
  }

  function updateBookmarkBadge() {
    if (bookmarkCountBadge) {
      bookmarkCountBadge.textContent = bookmarks.length;
      bookmarkCountBadge.style.display = bookmarks.length > 0 ? "flex" : "none";
    }
  }

  bookmarkNavBtn.addEventListener("click", () => {
    setCategory("saved");
  });

  // -------------------------------------------------------------------------
  // Category & Filter Controls
  // -------------------------------------------------------------------------
  function setCategory(cat) {
    currentCategory = cat;
    updateCategoryPillsUI();
    updateSubCategoryOptions();
    renderNotes();
  }

  function updateCategoryPillsUI() {
    categoryPills.forEach(pill => {
      const cat = pill.getAttribute("data-category");
      if (cat === currentCategory) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });
  }

  categoryPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const cat = pill.getAttribute("data-category");
      setCategory(cat);
    });
  });

  subCategoryFilter.addEventListener("change", (e) => {
    currentSubCategory = e.target.value;
    renderNotes();
  });

  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderNotes();
  });

  // Search Bar
  function performSearch() {
    searchQuery = searchInput.value.trim();
    if (searchCategorySelect && searchCategorySelect.value !== "all") {
      currentCategory = searchCategorySelect.value;
      updateCategoryPillsUI();
      updateSubCategoryOptions();
    }
    renderNotes();

    // Scroll to results if on mobile/smaller screen
    const resultsAnchor = document.getElementById("resultsAnchor");
    if (resultsAnchor) {
      resultsAnchor.scrollIntoView({ behavior: "smooth" });
    }
  }

  searchBtn.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  // -------------------------------------------------------------------------
  // Download Note Logic
  // -------------------------------------------------------------------------
  function downloadNotePdf(note) {
    // Increment download count locally
    note.downloads = (note.downloads || 0) + 1;
    saveNotesToStorage(notes);
    updateGlobalStats();
    renderNotes();

    showToast(`Downloading: ${note.title.slice(0, 36)}...`, "success");

    // Initiate file download
    const cleanFileName = (note.title.replace(/[^a-zA-Z0-9_\- ]/g, "").trim().replace(/\s+/g, "_") || "Exam_Notes") + ".pdf";
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = note.downloadUrl || "assets/sample-note.pdf";
    downloadAnchor.download = cleanFileName;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  }

  // -------------------------------------------------------------------------
  // Interactive PDF Preview Modal
  // -------------------------------------------------------------------------
  function openPdfPreview(note) {
    activePreviewNote = note;
    currentZoom = 100;
    currentPreviewPage = 1;

    pdfModalTitle.textContent = note.title;
    pdfModalSubtitle.textContent = `${note.categoryLabel} • ${note.subCategory} • ${note.pages} Total Pages • Size: ${note.fileSize}`;

    renderPdfPage(note, currentPreviewPage);
    updateZoomDisplay();
    updatePageDisplay(note);

    pdfModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closePdfPreview() {
    pdfModal.classList.remove("active");
    document.body.style.overflow = "";
    activePreviewNote = null;
  }

  function renderPdfPage(note, pageNum) {
    const isFirstPage = pageNum === 1;

    let pageContentHtml = "";
    if (isFirstPage) {
      pageContentHtml = `
        <div class="doc-header-top">
          <div>
            <span class="doc-exam-badge">${escapeHTML(note.subCategory)}</span>
            <div style="font-size: 0.8rem; color: #4f46e5; font-weight: 600; margin-top: 4px;">सत्यापित टॉपर हैंडबुक • VERIFIED SARKARI EXAM NOTES</div>
          </div>
          <div class="doc-page-num">PAGE 01 / ${note.pages}</div>
        </div>

        <h1 class="doc-title-main">${escapeHTML(note.title)}</h1>

        <div style="font-size: 0.9rem; color: #475569; margin-bottom: 20px; font-family: var(--font-sans);">
          <strong>विषय (Subject):</strong> ${escapeHTML(note.subject)} &nbsp;|&nbsp; 
          <strong>लेखक/स्रोत:</strong> ${escapeHTML(note.author)} &nbsp;|&nbsp; 
          <strong>स्तर:</strong> ${escapeHTML(note.level)}
        </div>

        <div class="doc-callout-box">
          <strong>🎯 परीक्षा दृष्टिकोण एवं महत्वपूर्ण सार (Exam Scope):</strong>
          ${escapeHTML(note.description)}
        </div>

        <h3 style="font-family: var(--font-sans); font-size: 1.15rem; color: #1e293b; margin: 20px 0 10px;">
          📌 मुख्य अध्याय एवं दोहराए जाने वाले बिंदु (High-Yield Highlights):
        </h3>

        <ul class="doc-bullet-list">
          ${note.highlights ? note.highlights.map(h => `<li><strong>${escapeHTML(h)}</strong> - विस्तृत व्याख्या, पिछले वर्षों के प्रश्न एवं शॉर्टकट ट्रिक्स।</li>`).join("") : ""}
        </ul>

        <div class="doc-formula-box">
          ⚡ EXAM SHORTCUT / FORMULA CAPSULE:<br>
          <span style="letter-spacing: 0.05em; font-size: 1.15rem;">SI = (P × R × T) / 100 &emsp;|&emsp; CI - SI (2 Yrs) = P(R / 100)² &emsp;|&emsp; F = m × a &emsp;|&emsp; p = m × v</span>
        </div>

        ${note.downloadUrl && note.downloadUrl.endsWith('.html') ? `
          <div style="margin: 20px 0; text-align: center;">
            <a href="${note.downloadUrl}" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; background: #2563eb; color: #fff; text-decoration: none; font-weight: 700; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(37,99,235,0.3); font-size: 1rem;">
              <span>📖 डिजिटल हस्तलिखित कॉपी में सीधे खोलें (Open Full Handwritten Notebook)</span> <span>➔</span>
            </a>
          </div>
        ` : ""}

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px 16px; border-radius: 6px; font-family: var(--font-sans); font-size: 0.85rem; color: #065f46; margin-top: 24px;">
          💡 <strong>टॉपर सीक्रेट टिप (Examiner's Strategy):</strong> इस विषय के 60-70% प्रश्न सीधे पिछले 5 वर्षों के हल प्रश्न-पत्रों से दोहराए जाते हैं। मुख्य सूत्रों और परिभाषाओं को बार-बार दोहराएं!
        </div>
      `;
    } else {
      pageContentHtml = `
        <div class="doc-header-top">
          <div>
            <span class="doc-exam-badge">${escapeHTML(note.subCategory)}</span>
            <div style="font-size: 0.8rem; color: #4f46e5; font-weight: 600; margin-top: 4px;">अध्यायवार विस्तृत अध्ययन सामग्री • CHAPTER MODULE</div>
          </div>
          <div class="doc-page-num">PAGE 0${pageNum} / ${note.pages}</div>
        </div>

        <h2 style="font-family: var(--font-sans); font-size: 1.3rem; color: #0f172a; margin-bottom: 12px;">
          खंड ${pageNum - 1}: परीक्षा उपयोगी शॉर्टकट ट्रिक्स एवं अभ्यास प्रश्न बैंक
        </h2>

        <p class="doc-chapter-summary">
          प्रतियोगी परीक्षा में कम समय में 100% सटीकता के साथ प्रश्नों को हल करने के लिए निम्नलिखित चरणों का पालन करें:
        </p>

        <div class="doc-callout-box" style="border-left-color: #10b981;">
          <strong>प्रश्नों को त्वरित हल करने की रणनीति:</strong>
          1. प्रश्न को ध्यान से पढ़ें और विकल्पों को एलिमिनेट (Option Elimination) करने का प्रयास करें।<br>
          2. सूत्रों में मान सीधे प्रतिस्थापित (Direct Value Substitution) करें।<br>
          3. नकारात्मक अंकन से बचने हेतु संदिग्ध प्रश्नों को स्किप करें।
        </div>

        <div class="doc-formula-box" style="border-color: #3b82f6; color: #1e40af; background: #eff6ff;">
          <span style="font-size: 1.15rem;">औसत चाल = 2xy / (x + y) &emsp;|&emsp; कार्यक्षमता ∝ 1 / समय &emsp;|&emsp; लाभ% = (लाभ / क्रय मूल्य) × 100</span>
        </div>

        <div style="font-family: var(--font-sans); font-size: 0.9rem; line-height: 1.6; color: #334155; margin-top: 20px;">
          <strong>विगत वर्षों में पूछा गया मॉडल प्रश्न (Previous Year PYQ):</strong><br>
          <em>प्रश्न: यदि A किसी कार्य को 10 दिन में तथा B उसी कार्य को 15 दिन में करता है, तो दोनों मिलकर कार्य कितने दिनों में समाप्त करेंगे?</em><br>
          <span style="color: #166534; font-weight: 600;">हल (LCM विधि):</span> कुल कार्य = LCM(10, 15) = 30 इकाई। A की क्षमता = 3 इकाई/दिन, B की क्षमता = 2 इकाई/दिन।<br>
          कुल समय = 30 / (3 + 2) = <strong>6 दिन</strong> (उत्तर)।
        </div>
      `;
    }

    pdfSheetContainer.innerHTML = `
      <div class="pdf-page-sheet" id="renderedPdfSheet" style="transform: scale(${currentZoom / 100}); transform-origin: top center;">
        <div class="pdf-watermark">EXAMNOTES HUB</div>
        ${pageContentHtml}
      </div>
    `;
  }

  function updateZoomDisplay() {
    if (zoomLevelText) zoomLevelText.textContent = `${currentZoom}%`;
    const sheet = document.getElementById("renderedPdfSheet");
    if (sheet) {
      sheet.style.transform = `scale(${currentZoom / 100})`;
    }
  }

  function updatePageDisplay(note) {
    if (pageIndicator) pageIndicator.textContent = `Page ${currentPreviewPage} of ${Math.min(note.pages, 5)} (Preview)`;
  }

  zoomInBtn.addEventListener("click", () => {
    if (currentZoom < 150) {
      currentZoom += 10;
      updateZoomDisplay();
    }
  });

  zoomOutBtn.addEventListener("click", () => {
    if (currentZoom > 70) {
      currentZoom -= 10;
      updateZoomDisplay();
    }
  });

  zoomResetBtn.addEventListener("click", () => {
    currentZoom = 100;
    updateZoomDisplay();
  });

  prevPageBtn.addEventListener("click", () => {
    if (currentPreviewPage > 1) {
      currentPreviewPage--;
      renderPdfPage(activePreviewNote, currentPreviewPage);
      updatePageDisplay(activePreviewNote);
      pdfSheetContainer.scrollTop = 0;
    }
  });

  nextPageBtn.addEventListener("click", () => {
    if (currentPreviewPage < Math.min(activePreviewNote.pages, 5)) {
      currentPreviewPage++;
      renderPdfPage(activePreviewNote, currentPreviewPage);
      updatePageDisplay(activePreviewNote);
      pdfSheetContainer.scrollTop = 0;
    }
  });

  closePdfModalBtn.addEventListener("click", closePdfPreview);
  pdfModal.addEventListener("click", (e) => {
    if (e.target === pdfModal) closePdfPreview();
  });

  modalDownloadBtn.addEventListener("click", () => {
    if (activePreviewNote) {
      downloadNotePdf(activePreviewNote);
    }
  });

  openDirectPdfBtn.addEventListener("click", () => {
    if (activePreviewNote) {
      window.open(activePreviewNote.downloadUrl || "assets/sample-note.pdf", "_blank");
    }
  });

  // Keyboard shortcut for modal close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (pdfModal.classList.contains("active")) closePdfPreview();
      if (uploadModal.classList.contains("active")) closeUploadModal();
    }
  });

  // -------------------------------------------------------------------------
  // Upload Notes Modal
  // -------------------------------------------------------------------------
  function openUploadModal() {
    uploadModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeUploadModal() {
    uploadModal.classList.remove("active");
    document.body.style.overflow = "";
    uploadForm.reset();
  }

  if (openUploadModalBtn) openUploadModalBtn.addEventListener("click", openUploadModal);
  if (heroUploadBtn) heroUploadBtn.addEventListener("click", openUploadModal);
  if (closeUploadModalBtn) closeUploadModalBtn.addEventListener("click", closeUploadModal);
  
  uploadModal.addEventListener("click", (e) => {
    if (e.target === uploadModal) closeUploadModal();
  });

  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("uploadTitle").value.trim();
    const subject = document.getElementById("uploadSubject").value.trim();
    const category = document.getElementById("uploadCategory").value;
    const subCategory = document.getElementById("uploadSubCategory").value.trim();
    const level = document.getElementById("uploadLevel").value.trim();
    const author = document.getElementById("uploadAuthor").value.trim() || "Community Scholar";
    const badge = document.getElementById("uploadBadge").value;
    const description = document.getElementById("uploadDescription").value.trim();
    const highlightsText = document.getElementById("uploadHighlights").value.trim();

    const highlights = highlightsText ? highlightsText.split("\n").filter(h => h.trim()) : [
      "Key formulas and definitions",
      "Solved problems & practice exercises"
    ];

    const newNote = {
      id: "user-" + Date.now(),
      title,
      subject,
      category,
      categoryLabel: {
        "up-govt": "UP Government Exams",
        railway: "Railway Exams",
        teaching: "Teaching Exams",
        ssc: "SSC Exams",
        common: "Common Study Notes"
      }[category] || "General Exam",
      subCategory: subCategory || "General Stream",
      level: level || "All Levels",
      author,
      fileSize: "6.5 MB",
      pages: Math.floor(Math.random() * 40) + 40,
      downloads: 1,
      rating: 5.0,
      reviewsCount: 1,
      format: "PDF",
      badge,
      badgeType: badge === "Handwritten" ? "accent" : (badge === "Most Popular" ? "warning" : "success"),
      description,
      tags: [subject, subCategory, "User Upload", badge],
      downloadUrl: "assets/sample-note.pdf",
      highlights
    };

    notes.unshift(newNote);
    saveNotesToStorage(notes);

    closeUploadModal();
    updateSubCategoryOptions();
    updateGlobalStats();
    renderNotes();

    showToast("🎉 Your notes have been published successfully!", "success");
  });

  // Request Notes trigger
  if (requestNotesBtn) {
    requestNotesBtn.addEventListener("click", () => {
      const subject = prompt("Which subject or exam notes are you looking for?");
      if (subject && subject.trim()) {
        showToast(`Request registered for "${subject}". We'll add them soon!`, "info");
      }
    });
  }

  // -------------------------------------------------------------------------
  // Toast Helper
  // -------------------------------------------------------------------------
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === "success" ? "✅" : "ℹ️"}</span>
      <span>${escapeHTML(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(16px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3500);
  }

  // -------------------------------------------------------------------------
  // Security / Utility
  // -------------------------------------------------------------------------
  function escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------
  initTheme();
  updateBookmarkBadge();
  updateSubCategoryOptions();
  updateGlobalStats();
  renderNotes();
});
