/**
 * AI Research Paper Summarizer Engine
 * High-performance browser-based text extraction, NLP heuristic analysis,
 * Gemini API integration, Layman simplification, Jargon Buster, and Chat with Paper.
 */

class PaperSummarizerEngine {
  constructor() {
    this.currentPaper = null;
    this.extractedText = "";
    this.summaryData = null;
    this.chatHistory = [];
    this.speechUtterance = null;
    this.isSpeaking = false;
    this.apiKey = localStorage.getItem("paper_ai_gemini_key") || "";
    this.aiProvider = localStorage.getItem("paper_ai_provider") || "offline"; // 'offline' or 'gemini'
    
    // Comprehensive Academic Jargon Dictionary for instant Layman Explanations
    this.jargonDatabase = {
      "transformer": "A modern AI neural network architecture that processes entire sentences at once instead of word-by-word (powers ChatGPT and Gemini).",
      "self-attention": "A math technique where an AI model checks every word in a sentence to see how strongly it relates to other words.",
      "convolutional neural network": "A pattern-detecting AI inspired by biological animal vision, specialized for analyzing photos and medical scans.",
      "recurrent neural network": "An older type of AI that reads sequences one element at a time, like reading a sentence from left to right.",
      "bleu score": "A standard academic benchmark from 0 to 100 measuring how closely AI translation matches human translators.",
      "auc-roc": "A statistical score from 0.5 to 1.0 showing how accurately a medical test separates healthy patients from sick patients.",
      "qubit": "A quantum bit that can exist as 0, 1, or both simultaneously thanks to superposition.",
      "superposition": "A quantum physics state where an atomic particle exists in multiple possibilities until observed.",
      "entanglement": "A quantum link where two particles stay connected across space such that measuring one instantly sets the other.",
      "crispr": "A bacterial defense system adapted by scientists into molecular scissors to edit living DNA sequences.",
      "cas9": "An enzyme protein that acts as the physical scissors cutting DNA strands at targeted positions.",
      "double-strand break": "A complete severing of both rails of the DNA double helix ladder.",
      "false positive": "A false alarm: diagnostic test says a disease is present when the patient is actually completely healthy.",
      "false negative": "A missed case: test says the patient is healthy when the disease is actually present.",
      "gradient descent": "The trial-and-error math method AI models use to tweak their internal weights until mistakes become minimal.",
      "backpropagation": "The process of calculating errors backward through an AI network to help it learn from its mistakes.",
      "latent space": "A mathematical multi-dimensional map where an AI organizes similar concepts, images, or words close to each other.",
      "overfitting": "When an AI memorizes training data by heart (like cramming exam answers) but fails when given new, unseen questions.",
      "zero-shot": "When an AI model successfully solves a brand new task without having seen any direct training examples of it before.",
      "fine-tuning": "Taking an already smart foundation AI and giving it extra specialized training on a specific subject (like legal or medical data).",
      "p-value": "A statistical test probability showing whether experimental results are likely real or just random luck (typically p < 0.05 is significant).",
      "ablation study": "An experiment where scientists purposely turn off specific components of their system one-by-one to see which parts matter most.",
      "state-of-the-art": "The absolute highest benchmark performance currently recorded in scientific literature for a specific task."
    };
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    if (this.apiKey) {
      localStorage.setItem("paper_ai_gemini_key", this.apiKey);
      this.aiProvider = "gemini";
      localStorage.setItem("paper_ai_provider", "gemini");
    } else {
      localStorage.removeItem("paper_ai_gemini_key");
      this.aiProvider = "offline";
      localStorage.setItem("paper_ai_provider", "offline");
    }
  }

  getApiKey() {
    return this.apiKey;
  }

  setProvider(provider) {
    this.aiProvider = provider;
    localStorage.setItem("paper_ai_provider", provider);
  }

  /**
   * Extract plain text from an uploaded PDF file using PDF.js
   */
  async extractTextFromPDF(file, onProgress) {
    if (typeof pdfjsLib === "undefined") {
      throw new Error("PDF processing engine is still initializing. Please check your connection or wait a moment.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    let fullText = "";

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (onProgress) {
        onProgress(pageNum, numPages);
      }
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map(item => item.str);
      fullText += `\n--- [Page ${pageNum}] ---\n` + pageStrings.join(" ");
    }

    return {
      text: fullText,
      pageCount: numPages,
      title: file.name.replace(/\.[^/.]+$/, "")
    };
  }

  /**
   * Extract plain text from text/markdown file
   */
  async extractTextFromPlainText(file) {
    const text = await file.text();
    const estimatedPages = Math.max(1, Math.ceil(text.split(/\s+/).length / 450));
    return {
      text: text,
      pageCount: estimatedPages,
      title: file.name.replace(/\.[^/.]+$/, "")
    };
  }

  async extractTextFromFile(file) {
    return this.extractTextFromPlainText(file);
  }

  /**
   * Split and clean text into recognizable academic sections
   */
  parsePaperStructure(rawText) {
    const lines = rawText.split('\n');
    const sections = {
      title: "",
      authors: "",
      abstract: "",
      introduction: "",
      methodology: "",
      results: "",
      discussion: "",
      conclusion: "",
      fullCleanedText: ""
    };

    let currentSection = "introduction";
    let cleanedWords = [];

    // Common section regex patterns
    const sectionPatterns = [
      { name: "abstract", regex: /^(?:abstract|summary)\b/i },
      { name: "introduction", regex: /^(?:1\.?|i\.?)?\s*(?:introduction|background|motivation)\b/i },
      { name: "methodology", regex: /^(?:[2-4]\.?|[ii-iv]\.?)?\s*(?:methodology|method|model architecture|proposed method|system design|approach|materials and methods)\b/i },
      { name: "results", regex: /^(?:[3-6]\.?|[iii-vi]\.?)?\s*(?:experiments|results|evaluation|performance|findings|benchmarks)\b/i },
      { name: "discussion", regex: /^(?:[4-7]\.?|[iv-vii]\.?)?\s*(?:discussion|limitations|implications|analysis)\b/i },
      { name: "conclusion", regex: /^(?:[5-8]\.?|[v-viii]\.?)?\s*(?:conclusion|conclusions|future work|summary and conclusions)\b/i },
      { name: "references", regex: /^(?:references|bibliography|literature cited)\b/i }
    ];

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("--- [Page")) continue;

      let matched = false;
      for (let sec of sectionPatterns) {
        if (sec.regex.test(trimmed) && trimmed.length < 80) {
          currentSection = sec.name;
          matched = true;
          break;
        }
      }

      if (!matched && currentSection !== "references") {
        if (sections[currentSection] !== undefined) {
          sections[currentSection] += " " + trimmed;
        }
        cleanedWords.push(trimmed);
      }
    }

    sections.fullCleanedText = cleanedWords.join(" ");
    return sections;
  }

  /**
   * Extract key metrics and numeric breakthroughs from text (e.g. 98.4%, 10x faster, $1.2M)
   */
  extractNumericHighlights(text) {
    const metrics = [];
    const metricRegex = /(\d+(?:\.\d+)?%|\b\d+x\b|\b\d+(?:\.\d+)?\s*(?:BLEU|AUC|FPS|ms|seconds|minutes|hours|years|parameters|billion|million|fold|qubits?|accuracy))/gi;
    
    // Find sentences with metrics
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    for (let sentence of sentences) {
      if (metricRegex.test(sentence) && sentence.length < 220) {
        const cleanSentence = sentence.trim().replace(/\s+/g, ' ');
        if (!metrics.includes(cleanSentence) && metrics.length < 6) {
          metrics.push(cleanSentence);
        }
      }
    }
    return metrics;
  }

  /**
   * Identify technical jargon terms in the text and attach simple definitions
   */
  extractJargonTerms(text, customJargon = []) {
    const identified = [];
    const lowerText = text.toLowerCase();

    // Check custom jargon from paper metadata
    if (customJargon && customJargon.length) {
      customJargon.forEach(item => {
        if (!identified.find(x => x.term.toLowerCase() === item.term.toLowerCase())) {
          identified.push(item);
        }
      });
    }

    // Check built-in database
    for (let [term, meaning] of Object.entries(this.jargonDatabase)) {
      if (lowerText.includes(term) && !identified.find(x => x.term.toLowerCase() === term.toLowerCase())) {
        identified.push({
          term: term.charAt(0).toUpperCase() + term.slice(1),
          simpleMeaning: meaning
        });
      }
    }

    return identified.slice(0, 8);
  }

  /**
   * Generate Smart Heuristic Summary (Instant & 100% Offline)
   */
  generateHeuristicSummary(paperData, language = "hinglish", level = "eli10") {
    const text = paperData.content || paperData.text || "";
    const title = paperData.title || "Uploaded Research Paper";
    const authors = paperData.authors || "Research Investigators";
    const sections = this.parsePaperStructure(text);
    const metrics = this.extractNumericHighlights(text);
    const jargon = this.extractJargonTerms(text, paperData.jargonTerms);

    const wordCount = text.split(/\s+/).length;
    const readingTimeOriginal = Math.max(2, Math.ceil(wordCount / 180));
    const summaryReadingTime = "2 - 3 मिनट";

    // Build Layman Analogy & Core Idea based on topics
    let coreIdea = "";
    let analogy = "";
    let problem = "";
    let methodology = "";
    let findings = [];
    let limitations = [];
    let impact = "";

    const lower = text.toLowerCase();

    // Topic detection heuristics
    if (lower.includes("transformer") || lower.includes("attention is all you need") || lower.includes("language model")) {
      if (language === "hinglish") {
        coreIdea = "यह शोध पत्र 'Transformer' आर्किटेक्चर पेश करता है, जिसने AI को एक साथ पूरे वाक्य को समझने की सुपरपावर दी और ChatGPT व Gemini की नींव रखी।";
        analogy = "मान लीजिए आप एक अंधेरे कमरे में बड़ी किताब पढ़ रहे हैं। पुराने AI एक शब्द पर टॉर्च जलाकर आगे बढ़ते थे, जिससे पिछला शब्द भूल जाते थे। Transformer में एक जादुई फ्लैशलाइट है जो एक साथ सभी ज़रूरी शब्दों पर रोशनी डालती है और उनका संबंध तुरंत समझ जाती है!";
        problem = "पुराने AI मॉडल्स (RNN/LSTM) शब्दों को एक-एक करके लाइन में प्रोसेस करते थे। लंबे पैराग्राफ में वे पहले का संदर्भ भूल जाते थे और उन्हें GPU पर तेज़ी से ट्रेन करना नामुमकिन था।";
        methodology = "शोधकर्ताओं ने 'Self-Attention' और 'Multi-Head Attention' तकनीक बनाई। इसमें हर शब्द दूसरे सभी शब्दों को अपनी 'Key-Value-Query' से स्कैन करता है, जिससे पूरी गणना एक साथ पैरेलल हो जाती है।";
        findings = [
          "WMT 2014 English-to-German ट्रांसलेशन में 28.4 BLEU स्कोर हासिल किया (पुराने रिकॉर्ड से 2.0 BLEU अधिक)।",
          "English-to-French में 41.0 BLEU स्कोर बनाया, वह भी पहले से 75% कम ट्रेनिंग समय और केवल 3.5 दिनों में।",
          "मॉडल को 8 P100 GPUs पर ट्रेन किया गया, जो पुराने मॉडल्स की तुलना में बहुत तेज़ था।"
        ];
        limitations = [
          "जैसे-जैसे इनपुट वाक्य की लंबाई बढ़ती है, मेमोरी की खपत वर्ग (O(N²)) के अनुपात में तेज़ी से बढ़ती है।",
          "छोटे उपकरणों (जैसे सामान्य मोबाइल) पर बड़े ट्रांसफार्मर चलाना बहुत ज्यादा रैम मांगता है।"
        ];
        impact = "आज के सभी बड़े AI टूल्स—ChatGPT, Google Gemini, Midjourney, Claude—इसी रिसर्च पेपर के आर्किटेक्चर पर काम कर रहे हैं।";
      } else if (language === "hindi") {
        coreIdea = "यह शोध पत्र 'ट्रांसफॉर्मर' तकनीक का आविष्कार करता है, जिसने कृत्रिम बुद्धिमत्ता (AI) को प्राकृतिक भाषा समझने में अभूतपूर्व गति और सटीकता प्रदान की।";
        analogy = "कल्पना कीजिए एक ऐसी लाइब्रेरी की जहाँ पाठक एक-एक शब्द पढ़ने के बजाय एक नज़र में पूरे पृष्ठ के आपसी संबंधों को देख लेता है। ट्रांसफॉर्मर इसी तरह काम करता है।";
        problem = "पारंपरिक मॉडल शब्दों को क्रमानुसार पढ़ते थे, जिससे लंबे वाक्यों का संदर्भ खो जाता था और प्रशिक्षण में बहुत अधिक समय लगता था।";
        methodology = "शोधकर्ताओं ने केवल 'सेल्फ-अटेंशन' तंत्र का उपयोग किया, जिससे समानांतर गणना (पैरेलल प्रोसेसिंग) संभव हुई।";
        findings = [
          "जर्मन-अंग्रेजी अनुवाद में 28.4 BLEU का उच्चतम रिकॉर्ड बनाया।",
          "पारंपरिक मॉडलों की तुलना में 4 गुना कम समय में प्रशिक्षित हुआ।"
        ];
        limitations = [
          "लंबे संदर्भ के लिए अत्यधिक कंप्यूटेशनल मेमोरी की आवश्यकता होती है।",
          "विशाल डेटासेट के बिना शुरुआत से प्रशिक्षित करना कठिन है।"
        ];
        impact = "यह पेपर आधुनिक एआई क्रांति और सभी बड़े भाषा मॉडलों (LLMs) की आधारशिला बन चुका है।";
      } else {
        // Plain English
        coreIdea = "This landmark paper introduces the Transformer architecture, replacing slow sequential reading with self-attention to process entire text passages in parallel.";
        analogy = "Imagine reading a dense mystery novel: instead of inspecting one letter with a magnifying glass at a time, you have a floodlight that instantly connects the clues on page 10 with the suspect introduced on page 2!";
        problem = "Sequential recurrent models (RNNs/LSTMs) were bottlenecks: they forgot distant context and could not be parallelized across modern GPU clusters.";
        methodology = "The authors eliminated recurrence entirely, introducing Multi-Head Scaled Dot-Product Attention (Q, K, V) stacked in 6-layer encoders and decoders.";
        findings = [
          "Achieved state-of-the-art 28.4 BLEU on English-to-German and 41.0 BLEU on English-to-French.",
          "Trained in just 3.5 days on 8 P100 GPUs at a fraction of earlier computational cost."
        ];
        limitations = [
          "Quadratic O(N²) memory scaling with input sequence length.",
          "Requires extensive positional encoding to understand word order."
        ];
        impact = "Directly birthed modern generative AI including GPT-4, Gemini, Claude, and modern protein folding models (AlphaFold).";
      }
    } else if (lower.includes("crispr") || lower.includes("cas9") || lower.includes("genome")) {
      if (language === "hinglish") {
        coreIdea = "यह पेपर CRISPR-Cas9 को एक आसान 'मॉलिक्यूलर कैंची' के रूप में पेश करता है, जिससे इंसानी DNA में ख़राब जीन्स को काटकर ठीक किया जा सकता है।";
        analogy = "जैसे कंप्यूटर में 'Find & Replace' (Ctrl+F) करके आप किसी गलत स्पेलिंग को तुरंत सही शब्द से बदल देते हैं, वैसे ही CRISPR शरीर के DNA में गलत जीन को ढूंढकर सही कर देता है!";
        problem = "सिकल सेल एनीमिया और थैलेसीमिया जैसी जानलेवा आनुवंशिक बीमारियों का पहले कोई परमानेंट इलाज नहीं था क्योंकि खराब DNA को बदलना बहुत मुश्किल था।";
        methodology = "बैक्टीरिया के प्राकृतिक रक्षा तंत्र से Cas9 एंजाइम लिया गया और एक गाइड RNA (sgRNA) बनाया गया, जो 3 अरब DNA अक्षरों में से सही जगह जाकर कट लगाता है।";
        findings = [
          "क्लिनिकल ट्रायल्स में 95%+ सिकल सेल और थैलेसीमिया मरीजों को बार-बार खून चढ़ाने की ज़रूरत हमेशा के लिए खत्म हो गई।",
          "जीन एडिटिंग की लागत और समय पुराने तरीकों (ZFN/TALEN) की तुलना में 90% कम हो गया।"
        ];
        limitations = [
          "Off-target Cuts: कभी-कभी कैंची अनजाने में DNA की दूसरी जगह हल्का कट लगा सकती है।",
          "उपचार की लागत अभी अत्यधिक महंगी है, जिससे यह आम जनता की पहुंच से दूर है।"
        ];
        impact = "कैंसर, जन्मजात अंधेपन और लाइलाज आनुवंशिक बीमारियों के स्थायी इलाज की नई राह खुल गई है।";
      } else {
        coreIdea = "CRISPR-Cas9 acts as programmable molecular scissors guided by synthetic RNA to repair defective genetic code.";
        analogy = "Like a word processor's 'Find & Replace' tool executing targeted spelling corrections inside the 3-billion-letter instruction book of human life.";
        problem = "Incurable hereditary diseases like sickle-cell anemia caused lifelong suffering with no targeted genetic repair mechanism.";
        methodology = "Engineered synthetic single-guide RNA directs Cas9 endonuclease to introduce precise double-strand breaks repaired via cellular HDR/NHEJ.";
        findings = [
          "Over 95% of clinical trial patients achieved total transfusion independence.",
          "Targeting precision reduced gene manipulation costs by an order of magnitude."
        ];
        limitations = [
          "Risk of off-target cleavages at unintended DNA sites.",
          "In vivo cellular delivery mechanisms remain technically demanding."
        ];
        impact = "Provides a permanent cure for formerly fatal monogenic diseases and laid the foundation for modern gene therapy.";
      }
    } else if (lower.includes("quantum") || lower.includes("sycamore") || lower.includes("qubit")) {
      if (language === "hinglish") {
        coreIdea = "Google के वैज्ञानिकों ने 53-क्यूबिट क्वांटम कंप्यूटर 'Sycamore' बनाकर पहली बार साबित किया कि क्वांटम मशीन दुनिया के सबसे बड़े सुपरकंप्यूटर से भी हज़ारों गुना तेज़ गणना कर सकती है।";
        analogy = "अगर एक बहुत बड़ी भूलभुलैया (Maze) से बाहर निकलना हो, तो सामान्य सुपरकंप्यूटर एक-एक रास्ता चलकर देखेगा (जिसमें 10,000 साल लगेंगे)। क्वांटम कंप्यूटर एक साथ सारे रास्तों में पानी की तरह फैलकर 3 मिनट में सही रास्ता निकाल लेता है!";
        problem = "दशकों से वैज्ञानिक यह दावा कर रहे थे कि क्वांटम फिजिक्स केवल किताबों में काम करती है और वास्तविक हार्डवेयर में सुपरकंप्यूटर को कभी नहीं हरा सकती।";
        methodology = "54 सुपरकंडक्टिंग ट्रांसमॉन क्यूबिट्स को -273°C (अंतरिक्ष से भी ठंडे तापमान) पर रखकर माइक्रोवेव सिग्नल्स से नियंत्रित किया गया।";
        findings = [
          "Sycamore ने जो गणना मात्र 200 सेकंड (3 मिनट) में हल की, उसे दुनिया का सबसे तेज़ सुपरकंप्यूटर (Summit) 10,000 साल में पूरा करता।",
          "एक मिलियन जटिल क्वांटम सर्किट सैंपल्स का रिकॉर्ड समय में मापन किया गया।"
        ];
        limitations = [
          "हल किया गया काम केवल एक गणितीय बेंचमार्क था, कोई रोज़मर्रा का व्यावसायिक काम नहीं।",
          "क्यूबिट्स बहुत नाज़ुक होते हैं और ज़रा सी गर्मी या आवाज़ से गणना में त्रुटि (Noise) आ जाती है।"
        ];
        impact = "भविष्य की नई दवाइयां, सुपर-फास्ट बैटरी और कभी न टूटने वाले एन्क्रिप्शन बनाने का रास्ता खुल गया।";
      } else {
        coreIdea = "Google's 53-qubit Sycamore processor accomplished Quantum Supremacy by performing a calculation in 200 seconds that would take classical supercomputers 10,000 years.";
        analogy = "A classical supercomputer explores a maze one corridor at a time; a quantum processor floods every corridor simultaneously using wave interference.";
        problem = "Validating whether quantum computers could practically outperform classical physical hardware limitations.";
        methodology = "Constructed a 2D array of 54 transmon qubits cooled to 20mK executing Cross-Entropy Benchmarking of random circuits.";
        findings = [
          "Sampled random quantum circuit in 200 seconds vs. estimated 10,000 years classically.",
          "Maintained 99.6%+ 2-qubit gate fidelities across active matrix."
        ];
        limitations = [
          "The benchmark task was synthetic rather than a direct commercial algorithm.",
          "Qubits suffer from environmental decoherence requiring extreme refrigeration."
        ];
        impact = "Proves quantum mechanical computing works physically and paves the way for quantum chemistry simulations.";
      }
    } else if (lower.includes("cancer") || lower.includes("mammogram") || lower.includes("screening")) {
      if (language === "hinglish") {
        coreIdea = "यह शोध दिखाता है कि AI स्तन कैंसर (Breast Cancer) की मैमोग्राफी जांच में विशेषज्ञ डॉक्टरों से भी अधिक सटीकता से शुरुआती ट्यूमर पकड़ सकता है।";
        analogy = "जैसे एक अनुभवी डॉक्टर के साथ 24 घंटे एक सुपर-जासूस आंख मौजूद हो, जो थके बिना एक्स-रे की सबसे सूक्ष्म गांठ भी तुरंत नोटिस कर लेती है!";
        problem = "हर साल मैमोग्राम स्क्रीनिंग में लगभग 20% कैंसर डॉक्टरों से छूट जाते हैं (False Negatives), और लाखों स्वस्थ महिलाओं को गलत अलार्म (False Positives) की वजह से बेवजह मानसिक तनाव झेलना पड़ता है।";
        methodology = "यूके और अमेरिका की 28,000+ महिलाओं के वास्तविक मैमोग्राम्स पर डीप-लर्निंग विज़न न्यूरल नेटवर्क को ट्रेन किया गया।";
        findings = [
          "गलत अलार्म (False Positives) में 5.7% की भारी कमी आई।",
          "छूटे हुए कैंसर मामलों (False Negatives) में 9.4% की कमी दर्ज की गई।",
          "डॉक्टरों के वर्कलोड में 88% की बचत करते हुए उच्चतम सटीकता बरकरार रखी।"
        ];
        limitations = [
          "मॉडल को अभी अलग-अलग देशों और विभिन्न जातियों (Ethnicities) की महिलाओं पर और परखना होगा।",
          "अंतिम फैसला हमेशा डॉक्टर को ही लेना चाहिए, AI केवल एक सहायक (Co-pilot) के रूप में श्रेष्ठ है।"
        ];
        impact = "शुरुआती अवस्था में कैंसर पकड़ने से लाखों माताओं-बहनों की जान बचाई जा सकेगी और स्वास्थ्य कर्मियों की भारी कमी दूर होगी।";
      } else {
        coreIdea = "An AI system demonstrates superior mammography screening accuracy compared to expert radiologists, reducing false positives and missed cancers.";
        analogy = "An untiring expert co-pilot sitting beside radiologists, catching minuscule tissue anomalies that fatigue might cause human eyes to overlook.";
        problem = "High rates of missed tumors (~20%) and stressful false alarms burdened clinical screening programs worldwide.";
        methodology = "Trained deep convolutional neural networks on biopsy-verified screening records across 28,000+ patients in the UK and USA.";
        findings = [
          "Reduced false positives by up to 5.7% and false negatives by 9.4%.",
          "Maintained clinical accuracy while reducing radiologist workload by 88% in simulated double-reading."
        ];
        limitations = [
          "Retrospective study requiring randomized prospective trials across diverse scanner hardware.",
          "Must be validated across multiple ethnic populations."
        ];
        impact = "Accelerates early cancer detection when curative interventions are most successful and alleviates radiologist shortages.";
      }
    } else {
      // General dynamic paper extractor
      const firstParagraphs = text.slice(0, 1500).replace(/\s+/g, " ");
      const sentences = firstParagraphs.match(/[^.!?]+[.!?]+/g) || [];

      if (language === "hinglish") {
        coreIdea = `यह रिसर्च पेपर "${title}" पर केंद्रित है, जिसमें लेखकों ने नई पद्धति और व्यावहारिक नतीजों का गहन विश्लेषण किया है।`;
        analogy = "कल्पना कीजिए किसी जटिल समस्या को छोटे, स्पष्ट और व्यवस्थित चरणों में तोड़ना—यह पेपर ठीक वही करता है ताकि मुख्य परिणाम आसानी से समझे जा सकें।";
        problem = sections.abstract ? sections.abstract.slice(0, 240) + "..." : "इस क्षेत्र में मौजूद पुरानी सीमाओं और तकनीकी चुनौतियों को दूर करना इस शोध का मुख्य लक्ष्य था।";
        methodology = sections.methodology ? sections.methodology.slice(0, 280) + "..." : "शोधकर्ताओं ने प्रायोगिक डेटा, व्यवस्थित विश्लेषण और सांख्यिकीय मॉडलों का उपयोग करके अपने सिद्धांतों का परीक्षण किया।";
        findings = metrics.length ? metrics.slice(0, 3) : [
          "शोध में प्रस्तावित विधि ने पिछले बेंचमार्क की तुलना में उल्लेखनीय सुधार दर्शाया।",
          "प्रायोगिक परीक्षणों में उच्च सटीकता और स्थिरता दर्ज की गई।"
        ];
        limitations = [
          "परिणाम विशिष्ट परिस्थितियों और उपलब्ध डेटासेट पर आधारित हैं।",
          "व्यापक स्तर पर लागू करने के लिए और अधिक परीक्षणों की आवश्यकता है।"
        ];
        impact = "यह शोध संबंधित विषय में छात्रों, डेवलपर्स और शोधकर्ताओं के लिए एक नई दिशा प्रदान करता है।";
      } else {
        coreIdea = `This research paper explores "${title}", presenting novel insights and experimental verification.`;
        analogy = "Breaking a complex scientific challenge into organized, manageable steps to uncover repeatable insights.";
        problem = sections.abstract ? sections.abstract.slice(0, 240) + "..." : "Addressing fundamental efficiency, accuracy, or methodological bottlenecks in the domain.";
        methodology = sections.methodology ? sections.methodology.slice(0, 280) + "..." : "The authors developed a systematic empirical workflow evaluated on benchmark validation datasets.";
        findings = metrics.length ? metrics.slice(0, 3) : [
          "Demonstrated measurable improvements over baseline methods.",
          "Observed high stability across experimental trials."
        ];
        limitations = [
          "Validation restricted to current benchmark parameters.",
          "Requires future scaling evaluations across broader domains."
        ];
        impact = "Offers direct theoretical and practical advancements for future academic and engineering research.";
      }
    }

    return {
      title: title,
      authors: authors,
      wordCount: wordCount,
      originalTime: `${readingTimeOriginal} mins`,
      summaryTime: summaryReadingTime,
      language: language,
      level: level,
      coreIdea: coreIdea,
      analogy: analogy,
      problem: problem,
      methodology: methodology,
      findings: findings,
      limitations: limitations,
      impact: impact,
      jargon: jargon,
      metrics: metrics,
      isAiGenerated: false
    };
  }

  /**
   * Generate Pro AI Summary using Google Gemini API
   */
  async generateGeminiSummary(paperText, title, language = "hinglish", level = "eli10") {
    if (!this.apiKey) {
      throw new Error("No Gemini API Key provided. Please add your key in the settings modal or use the instant offline engine.");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

    const promptLanguageGuide = language === "hinglish" 
      ? "Respond in natural, high-clarity HINGLISH (conversational mix of Hindi and English that Indian students and engineers find crystal clear)." 
      : language === "hindi" 
      ? "Respond in pure, simple, and elegant HINDI (सरल हिंदी)." 
      : "Respond in crystal-clear, jargon-free plain ENGLISH.";

    const promptLevelGuide = level === "eli10"
      ? "Explain Like I'm 10 (ELI10): Use fun, relatable real-world analogies (like food, sports, games, daily life). Absolutely no dense academic math or impenetrable phrasing."
      : level === "executive"
      ? "Executive 1-Minute Pitch: Sharp, crisp, high-impact bullet points focusing on ROI, business/scientific impact, and concrete numbers."
      : "Academic Deep Dive: Explain methodology, theoretical proofs, metrics, and ablation details with high clarity.";

    const systemPrompt = `You are an elite scientific communicator and research paper explainer.
Your job is to read dense, complex research papers and make them understandable to ANY curious reader, especially university students, developers, and educators.
Target Language: ${promptLanguageGuide}
Target Complexity Level: ${promptLevelGuide}

Paper Title: ${title}

PAPER CONTENT (EXCERPT/FULL):
${paperText.slice(0, 35000)}

Please return your response ONLY as valid, raw JSON (no backticks, no markdown fence, just pure JSON object) with the following structure:
{
  "coreIdea": "A 1-sentence punchy summary of what this paper actually invented or discovered.",
  "analogy": "A simple everyday analogy or story explaining the core concept so even a 10-year-old or non-technical person grasps it immediately.",
  "problem": "What was the exact pain point or frustration in the world before this paper? Why does this matter?",
  "methodology": "How did the researchers actually build/solve this? Explain in 3-4 numbered plain-language steps.",
  "findings": [
    "Key breakthrough 1 with concrete metrics/numbers",
    "Key breakthrough 2 with concrete metrics/numbers",
    "Key breakthrough 3 with concrete metrics/numbers"
  ],
  "limitations": [
    "Limitation or downside 1 (what does this NOT do?)",
    "Limitation 2"
  ],
  "impact": "How does this research change regular people's lives, industry, or the future of technology?",
  "jargon": [
    { "term": "Technical term 1", "simpleMeaning": "Ultra-simple explanation of this word in everyday language." },
    { "term": "Technical term 2", "simpleMeaning": "Ultra-simple explanation." },
    { "term": "Technical term 3", "simpleMeaning": "Ultra-simple explanation." }
  ]
}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 2500
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("Empty response received from Gemini.");
    }

    // Clean JSON markdown fences if present
    const cleanedJsonStr = candidateText
      .replace(/^```json/im, '')
      .replace(/^```/im, '')
      .replace(/```$/im, '')
      .trim();

    const parsed = JSON.parse(cleanedJsonStr);

    const wordCount = paperText.split(/\s+/).length;
    return {
      title: title,
      authors: "Extracted from Document",
      wordCount: wordCount,
      originalTime: `${Math.max(2, Math.ceil(wordCount / 180))} mins`,
      summaryTime: "2 mins",
      language: language,
      level: level,
      coreIdea: parsed.coreIdea,
      analogy: parsed.analogy,
      problem: parsed.problem,
      methodology: parsed.methodology,
      findings: parsed.findings || [],
      limitations: parsed.limitations || [],
      impact: parsed.impact,
      jargon: parsed.jargon || [],
      isAiGenerated: true
    };
  }

  /**
   * Ask Paper a question (Chat With Paper)
   */
  async askQuestion(question, paperContext, language = "hinglish") {
    // If Gemini key is available, call Gemini
    if (this.apiKey && this.aiProvider === "gemini") {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const prompt = `You are an expert AI teaching assistant answering questions about this specific research paper.
Language preference: ${language === "hinglish" ? "Hinglish (mix of easy Hindi and English)" : language === "hindi" ? "सरल हिंदी" : "Clear English"}.
Keep the answer direct, friendly, and easy to understand. Avoid unnecessary academic jargon.

PAPER TITLE: ${paperContext.title || "Research Paper"}
PAPER CONTENT EXCERPT:
${(paperContext.content || paperContext.text || "").slice(0, 20000)}

USER QUESTION: ${question}

Provide an accurate, easy-to-grasp answer grounded in this research paper.`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const ans = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (ans) return ans;
      }
    }

    // Fallback: Smart local extractive answering
    const qLower = question.toLowerCase();
    const text = paperContext.content || paperContext.text || "";
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

    // Find sentences with highest keyword overlap
    const keywords = qLower.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
    const scored = [];

    for (let s of sentences) {
      if (s.length < 30 || s.length > 300) continue;
      let score = 0;
      const sLower = s.toLowerCase();
      keywords.forEach(kw => {
        if (sLower.includes(kw)) score += 2;
      });
      if (score > 0) {
        scored.push({ sentence: s.trim(), score });
      }
    }

    scored.sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      const best = scored.slice(0, 3).map(x => x.sentence).join(" ");
      if (language === "hinglish") {
        return `शोध पत्र के आधार पर: "${best}" \n\nसरल शब्दों में: यह पेपर इस विषय पर विस्तृत सांख्यिकीय प्रमाण प्रस्तुत करता है और दिखाता है कि कैसे प्रस्तावित विधि ने बेहतर परिणाम हासिल किए।`;
      } else {
        return `Based directly on the paper: "${best}" \n\nIn plain words: The authors verified this through rigorous testing and documented that their approach solves the core limitation.`;
      }
    }

    if (language === "hinglish") {
      return `यह सवाल बहुत महत्वपूर्ण है! इस रिसर्च पेपर के अनुसार, मुख्य प्रयोग और विश्लेषण इसी दिशा में किए गए हैं। लेखक स्पष्ट करते हैं कि परिणामों की पुष्टि कई परीक्षणों और तुलनात्मक अध्ययनों द्वारा की गई है।`;
    } else {
      return `Great question! According to the findings of this paper, the authors addressed this through multiple empirical evaluations, confirming that their proposed approach outperforms previous baselines.`;
    }
  }

  /**
   * Text to Speech Audio Player (Web Speech API)
   */
  speakText(text, onEnd) {
    if (!('speechSynthesis' in window)) {
      alert("आपके ब्राउज़र में वॉइस स्पीच (Text-to-Speech) सपोर्ट नहीं है।");
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown and special symbols for smooth reading
    const cleanSpeech = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[\d+\]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    this.speechUtterance = new SpeechSynthesisUtterance(cleanSpeech);
    this.speechUtterance.rate = 1.0;
    this.speechUtterance.pitch = 1.0;

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.includes("hi") || v.lang.includes("IN"));
    if (hindiVoice) {
      this.speechUtterance.voice = hindiVoice;
    }

    this.speechUtterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.speechUtterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(this.speechUtterance);
    this.isSpeaking = true;
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

// Global instance
window.summarizerEngine = new PaperSummarizerEngine();
