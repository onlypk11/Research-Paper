/**
 * AI Research Paper Summarizer - UI Controller & Event Handlers
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const uploadTabs = document.querySelectorAll(".upload-tab-btn");
  const tabUpload = document.getElementById("tabUpload");
  const tabPaste = document.getElementById("tabPaste");
  const pasteArea = document.getElementById("pasteArea");
  const pasteTextInput = document.getElementById("pasteTextInput");
  const pasteTitleInput = document.getElementById("pasteTitleInput");
  const summarizePastedBtn = document.getElementById("summarizePastedBtn");
  
  const samplePaperBtns = document.querySelectorAll(".sample-paper-btn");
  const processingCard = document.getElementById("processingCard");
  const processingStep = document.getElementById("processingStep");
  const resultsDashboard = document.getElementById("resultsDashboard");

  // Filter Buttons
  const langChips = document.querySelectorAll("[data-lang]");
  const levelChips = document.querySelectorAll("[data-level]");
  
  // Results Elements
  const paperTitleEl = document.getElementById("paperTitle");
  const paperAuthorsEl = document.getElementById("paperAuthors");
  const originalTimeEl = document.getElementById("originalTime");
  const summaryTimeEl = document.getElementById("summaryTime");
  const corePunchlineEl = document.getElementById("corePunchline");
  const analogyQuoteEl = document.getElementById("analogyQuote");
  const problemDescEl = document.getElementById("problemDesc");
  const methodStepsEl = document.getElementById("methodSteps");
  const findingsListEl = document.getElementById("findingsList");
  const limitationsListEl = document.getElementById("limitationsList");
  const realWorldImpactEl = document.getElementById("realWorldImpact");
  const jargonGridEl = document.getElementById("jargonGrid");

  // Actions
  const btnListenAudio = document.getElementById("btnListenAudio");
  const btnCopySummary = document.getElementById("btnCopySummary");
  const btnDownloadTxt = document.getElementById("btnDownloadTxt");
  const btnPrintReport = document.getElementById("btnPrintReport");
  const btnReset = document.getElementById("btnReset");

  // Chat Elements
  const chatMessageFeed = document.getElementById("chatMessageFeed");
  const chatInput = document.getElementById("chatInput");
  const btnSendChat = document.getElementById("btnSendChat");
  const suggestionChips = document.querySelectorAll(".suggestion-chip");

  // Settings & Theme
  const btnOpenSettings = document.getElementById("btnOpenSettings");
  const settingsModal = document.getElementById("settingsModal");
  const btnCloseSettings = document.getElementById("btnCloseSettings");
  const geminiApiKeyInput = document.getElementById("geminiApiKeyInput");
  const btnSaveApiKey = document.getElementById("btnSaveApiKey");
  const btnClearApiKey = document.getElementById("btnClearApiKey");
  const apiStatusBadge = document.getElementById("apiStatusBadge");
  const themeToggleBtn = document.getElementById("themeToggleBtn");

  // Current State
  let activePaperData = null;
  let activeLanguage = "hinglish";
  let activeLevel = "eli10";

  // Init Theme
  const savedTheme = localStorage.getItem("paper_ai_theme") || "light";
  document.body.setAttribute("data-theme", savedTheme);
  themeToggleBtn.textContent = savedTheme === "dark" ? "☀️" : "🌙";

  themeToggleBtn.addEventListener("click", () => {
    const curTheme = document.body.getAttribute("data-theme") || "light";
    const newTheme = curTheme === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("paper_ai_theme", newTheme);
    themeToggleBtn.textContent = newTheme === "dark" ? "☀️" : "🌙";
  });

  // Init API Key UI
  updateApiStatusUI();

  function updateApiStatusUI() {
    const key = window.summarizerEngine.getApiKey();
    if (key) {
      geminiApiKeyInput.value = key;
      apiStatusBadge.textContent = "⚡ Gemini AI Active";
      apiStatusBadge.style.color = "#10b981";
      apiStatusBadge.style.background = "rgba(16, 185, 129, 0.12)";
    } else {
      geminiApiKeyInput.value = "";
      apiStatusBadge.textContent = "🟢 Offline Smart NLP Engine";
      apiStatusBadge.style.color = "#6366f1";
      apiStatusBadge.style.background = "rgba(99, 102, 241, 0.12)";
    }
  }

  // Open / Close Settings
  btnOpenSettings.addEventListener("click", () => {
    settingsModal.classList.add("open");
  });

  btnCloseSettings.addEventListener("click", () => {
    settingsModal.classList.remove("open");
  });

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) settingsModal.classList.remove("open");
  });

  btnSaveApiKey.addEventListener("click", () => {
    const key = geminiApiKeyInput.value.trim();
    window.summarizerEngine.setApiKey(key);
    updateApiStatusUI();
    settingsModal.classList.remove("open");
    alert(key ? "✅ Gemini API Key सफलतापूर्वक सेव हो गई!" : "ऑफलाइन मोड चालू है।");
    if (activePaperData) {
      runSummarization();
    }
  });

  btnClearApiKey.addEventListener("click", () => {
    window.summarizerEngine.setApiKey("");
    geminiApiKeyInput.value = "";
    updateApiStatusUI();
    alert("API Key हटा दी गई है। अब ऑफलाइन स्मार्ट इंजन का उपयोग होगा।");
  });

  // Tab Switching (Upload PDF vs Paste Text)
  uploadTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      uploadTabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tabTarget = btn.getAttribute("data-tab");
      if (tabTarget === "upload") {
        dropZone.style.display = "block";
        pasteArea.classList.remove("active");
      } else {
        dropZone.style.display = "none";
        pasteArea.classList.add("active");
      }
    });
  });

  // Drag and Drop Events
  dropZone.addEventListener("click", () => fileInput.click());

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-active');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-active');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) handleSelectedFile(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      handleSelectedFile(e.target.files[0]);
    }
  });

  // Handle User File Upload
  async function handleSelectedFile(file) {
    showProcessing(`फ़ाइल "${file.name}" का विश्लेषण किया जा रहा है...`);
    try {
      let extractedData;
      if (file.name.toLowerCase().endsWith(".pdf")) {
        extractedData = await window.summarizerEngine.extractTextFromPDF(file, (cur, total) => {
          processingStep.textContent = `PDF पृष्ठ ${cur} / ${total} से ज्ञान निकाला जा रहा है...`;
        });
      } else {
        extractedData = await window.summarizerEngine.extractTextFromFile(file);
      }

      activePaperData = {
        title: extractedData.title,
        content: extractedData.text,
        authors: "Uploaded Document",
        pages: extractedData.pageCount || 1
      };

      await runSummarization();
    } catch (err) {
      hideProcessing();
      alert("फ़ाइल पढ़ने में त्रुटि: " + err.message);
    }
  }

  // Handle Pasted Text Summarization
  summarizePastedBtn.addEventListener("click", async () => {
    const text = pasteTextInput.value.trim();
    const title = pasteTitleInput.value.trim() || "Pasted Research Abstract";
    if (!text || text.length < 50) {
      alert("कृपया कम से कम 50 अक्षरों का शोध पत्र या सार (Abstract) पेस्ट करें।");
      return;
    }

    activePaperData = {
      title: title,
      content: text,
      authors: "Pasted Research Excerpt",
      pages: 1
    };

    showProcessing("टेक्स्ट का विश्लेषण और सारांश तैयार किया जा रहा है...");
    await runSummarization();
  });

  // Sample Paper 1-Click Buttons
  samplePaperBtns.forEach(btn => {
    btn.addEventListener("click", async () => {
      const paperId = btn.getAttribute("data-sample-id");
      const paper = SAMPLE_PAPERS.find(p => p.id === paperId);
      if (!paper) return;

      activePaperData = paper;
      showProcessing(`"${paper.title}" का विश्लेषण किया जा रहा है...`);
      await runSummarization();
    });
  });

  // Core Summarization Runner
  async function runSummarization() {
    if (!activePaperData) return;

    showProcessing("सरल भाषा और वास्तविक उदाहरण तैयार किए जा रहे हैं...");

    try {
      let summaryResult;
      const apiKey = window.summarizerEngine.getApiKey();

      if (apiKey && window.summarizerEngine.aiProvider === "gemini") {
        processingStep.textContent = "⚡ Google Gemini AI द्वारा सरल व्याख्या तैयार की जा रही है...";
        summaryResult = await window.summarizerEngine.generateGeminiSummary(
          activePaperData.content,
          activePaperData.title,
          activeLanguage,
          activeLevel
        );
      } else {
        processingStep.textContent = "🟢 इन-बिल्ट स्मार्ट NLP द्वारा सार निकाला जा रहा है...";
        summaryResult = window.summarizerEngine.generateHeuristicSummary(
          activePaperData,
          activeLanguage,
          activeLevel
        );
      }

      renderSummaryDashboard(summaryResult);
      hideProcessing();

      // Scroll to dashboard
      resultsDashboard.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      hideProcessing();
      console.warn("AI generation error, falling back to smart heuristic:", err);
      // Graceful fallback to heuristic
      const fallbackSummary = window.summarizerEngine.generateHeuristicSummary(
        activePaperData,
        activeLanguage,
        activeLevel
      );
      renderSummaryDashboard(fallbackSummary);
    }
  }

  // Render Dashboard
  function renderSummaryDashboard(data) {
    paperTitleEl.textContent = data.title;
    paperAuthorsEl.textContent = data.authors ? `शोधकर्ता: ${data.authors}` : "";
    originalTimeEl.textContent = data.originalTime || "40 mins";
    summaryTimeEl.textContent = data.summaryTime || "2.5 mins";

    corePunchlineEl.textContent = data.coreIdea;
    analogyQuoteEl.textContent = data.analogy;
    problemDescEl.textContent = data.problem;
    methodStepsEl.textContent = data.methodology;
    realWorldImpactEl.textContent = data.impact;

    // Render Key Findings
    findingsListEl.innerHTML = "";
    (data.findings || []).forEach(f => {
      const li = document.createElement("li");
      li.textContent = f;
      findingsListEl.appendChild(li);
    });

    // Render Limitations
    limitationsListEl.innerHTML = "";
    (data.limitations || []).forEach(l => {
      const li = document.createElement("li");
      li.textContent = l;
      limitationsListEl.appendChild(li);
    });

    // Render Jargon Grid
    jargonGridEl.innerHTML = "";
    (data.jargon || []).forEach(j => {
      const card = document.createElement("div");
      card.className = "jargon-pill-card";
      card.innerHTML = `
        <div class="jargon-term">📖 ${j.term}</div>
        <div class="jargon-meaning">${j.simpleMeaning}</div>
      `;
      jargonGridEl.appendChild(card);
    });

    // Reset Chat Feed with Welcome Message
    chatMessageFeed.innerHTML = `
      <div class="chat-bubble ai">
        नमस्ते! मैंने <strong>${data.title}</strong> का पूरा अध्ययन कर लिया है। आप इस शोध पत्र के बारे में मुझसे कोई भी सवाल पूछ सकते हैं (जैसे: क्या परिणाम निकले? इसमें क्या सीमाएं हैं? या यह हमारे जीवन को कैसे बदलता है?)।
      </div>
    `;

    resultsDashboard.style.display = "block";
  }

  // Language Filter Switching
  langChips.forEach(chip => {
    chip.addEventListener("click", () => {
      langChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeLanguage = chip.getAttribute("data-lang");
      if (activePaperData) runSummarization();
    });
  });

  // Level Filter Switching
  levelChips.forEach(chip => {
    chip.addEventListener("click", () => {
      levelChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeLevel = chip.getAttribute("data-level");
      if (activePaperData) runSummarization();
    });
  });

  // Voice Readout (Audio Podcast)
  btnListenAudio.addEventListener("click", () => {
    if (window.summarizerEngine.isSpeaking) {
      window.summarizerEngine.stopSpeaking();
      btnListenAudio.innerHTML = "<span>🔊</span> <span>ऑडियो सार सुनें</span>";
      return;
    }

    const textToRead = `${corePunchlineEl.textContent}. सरल उदाहरण: ${analogyQuoteEl.textContent}. मुख्य समस्या: ${problemDescEl.textContent}. समाधान विधि: ${methodStepsEl.textContent}. प्रभाव: ${realWorldImpactEl.textContent}`;
    
    btnListenAudio.innerHTML = "<span>⏸️</span> <span>बोलना बंद करें</span>";
    window.summarizerEngine.speakText(textToRead, () => {
      btnListenAudio.innerHTML = "<span>🔊</span> <span>ऑडियो सार सुनें</span>";
    });
  });

  // Copy Summary
  btnCopySummary.addEventListener("click", () => {
    const text = `📄 Research Paper Summary: ${paperTitleEl.textContent}\n\n`
      + `🌟 1-Line Punchline: ${corePunchlineEl.textContent}\n\n`
      + `👶 Simple Analogy: ${analogyQuoteEl.textContent}\n\n`
      + `🎯 The Problem: ${problemDescEl.textContent}\n\n`
      + `⚙️ How It Works: ${methodStepsEl.textContent}\n\n`
      + `🌍 Real-World Impact: ${realWorldImpactEl.textContent}`;

    navigator.clipboard.writeText(text).then(() => {
      alert("✅ सारांश क्लिपबोर्ड में कॉपी हो गया!");
    });
  });

  // Download Summary as TXT
  btnDownloadTxt.addEventListener("click", () => {
    const text = `=======================================================\n`
      + `  RESEARCH PAPER SIMPLIFIED SUMMARY (PAPER-EASE AI)\n`
      + `=======================================================\n\n`
      + `Title: ${paperTitleEl.textContent}\n`
      + `Original Reading Time: ${originalTimeEl.textContent} | Simplified: ${summaryTimeEl.textContent}\n\n`
      + `1. THE BIG IDEA:\n${corePunchlineEl.textContent}\n\n`
      + `2. SIMPLE ANALOGY:\n${analogyQuoteEl.textContent}\n\n`
      + `3. PROBLEM STATEMENT:\n${problemDescEl.textContent}\n\n`
      + `4. METHODOLOGY (HOW IT WORKS):\n${methodStepsEl.textContent}\n\n`
      + `5. REAL-WORLD IMPACT:\n${realWorldImpactEl.textContent}\n\n`
      + `Generated by PaperEase AI Summarizer.`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${paperTitleEl.textContent.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}_summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Print Report
  btnPrintReport.addEventListener("click", () => {
    window.print();
  });

  // Reset / Clear
  btnReset.addEventListener("click", () => {
    resultsDashboard.style.display = "none";
    activePaperData = null;
    pasteTextInput.value = "";
    pasteTitleInput.value = "";
    fileInput.value = "";
    window.summarizerEngine.stopSpeaking();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Chat with Paper Message Handler
  async function sendChatMessage(msgText) {
    const text = msgText || chatInput.value.trim();
    if (!text || !activePaperData) return;

    // Append User Bubble
    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user";
    userBubble.textContent = text;
    chatMessageFeed.appendChild(userBubble);
    chatInput.value = "";
    chatMessageFeed.scrollTop = chatMessageFeed.scrollHeight;

    // Typing bubble
    const typingBubble = document.createElement("div");
    typingBubble.className = "chat-bubble ai";
    typingBubble.textContent = "उत्तर सोचा जा रहा है...";
    chatMessageFeed.appendChild(typingBubble);
    chatMessageFeed.scrollTop = chatMessageFeed.scrollHeight;

    try {
      const answer = await window.summarizerEngine.askQuestion(text, activePaperData, activeLanguage);
      typingBubble.textContent = answer;
    } catch (e) {
      typingBubble.textContent = "उत्तर निकालने में समस्या आई। कृपया पुनः प्रयास करें।";
    }

    chatMessageFeed.scrollTop = chatMessageFeed.scrollHeight;
  }

  btnSendChat.addEventListener("click", () => sendChatMessage());
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendChatMessage();
  });

  suggestionChips.forEach(chip => {
    chip.addEventListener("click", () => {
      sendChatMessage(chip.textContent.replace(/^[✦💡🔍⚠️]\s*/, ''));
    });
  });

  // Helper UI methods
  function showProcessing(stepText) {
    processingStep.textContent = stepText;
    processingCard.style.display = "block";
    resultsDashboard.style.display = "none";
  }

  function hideProcessing() {
    processingCard.style.display = "none";
  }
});
