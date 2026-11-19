/**
 * Sample Research Papers Data for AI Paper Summarizer
 * Provides rich full-text and pre-parsed academic papers for instant testing
 */

const SAMPLE_PAPERS = [
  {
    id: "transformer-attention",
    title: "Attention Is All You Need",
    authors: "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, et al. (Google Brain & Google Research)",
    year: "2017",
    category: "Artificial Intelligence / Deep Learning",
    readingTimeOriginal: "45 mins",
    summaryTime: "2 mins",
    pages: 15,
    citationCount: "120,000+",
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results by over 2 BLEU.",
    content: `Attention Is All You Need
Authors: Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin

1. Introduction
Recurrent neural networks, long short-term memory (LSTM) and gated recurrent (GRU) neural networks in particular, have been firmly established as state of the art approaches in sequence modeling and transduction problems such as language modeling and machine translation. Recurrent models typically factor computation along the symbol positions of the input and output sequences. Aligning the positions to steps in computation time, they generate a sequence of hidden states h_t, as a function of the previous hidden state h_{t-1} and the input for position t. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples.

In this work we propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.

2. Background
The goal of reducing sequential computation also forms the foundation of the Extended Neural GPU, ByteNet and ConvS2S, all of which use convolutional neural networks as basic building blocks. In these models, the number of operations required to relate signals from two arbitrary input or output positions grows in the distance between positions, linearly for ConvS2S and logarithmically for ByteNet. This makes it more difficult to learn dependencies between distant positions. In the Transformer this is reduced to a constant number of operations, albeit at the cost of reduced effective resolution due to averaging attention-weighted positions, an effect we counteract with Multi-Head Attention.

Self-attention, sometimes called intra-attention, is an attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence.

3. Model Architecture
Most competitive neural sequence transduction models have an encoder-decoder structure. Here, the encoder maps an input sequence of symbol representations (x_1, ..., x_n) to a sequence of continuous representations z = (z_1, ..., z_n). Given z, the decoder then generates an output sequence (y_1, ..., y_m) of symbols one element at a time. At each step the model is auto-regressive, consuming the previously generated symbols as additional input when generating the next.

The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder.
The encoder is composed of a stack of N = 6 identical layers. Each layer has two sub-layers: a multi-head self-attention mechanism, and a simple, position-wise fully connected feed-forward network. We employ a residual connection around each of the two sub-layers, followed by layer normalization.

The decoder is also composed of a stack of N = 6 identical layers. In addition to the two sub-layers in each encoder layer, the decoder inserts a third sub-layer, which performs multi-head attention over the output of the encoder stack. We also modify the self-attention sub-layer in the decoder stack to prevent positions from attending to subsequent positions (masking).

Scaled Dot-Product Attention:
Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) * V
where Q is queries, K is keys, and V is values. The scaling factor 1/sqrt(d_k) prevents the dot products from growing large in magnitude for large values of d_k.

Multi-Head Attention:
Instead of performing a single attention function with d_model-dimensional keys, values and queries, we found it beneficial to linearly project the queries, keys and values h times with different, learned linear projections. Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.

4. Why Self-Attention
We consider three desiderata:
1) Total computational complexity per layer.
2) Amount of computation that can be parallelized, measured by minimum number of sequential operations required.
3) Path length between long-range dependencies in the network. A shorter path length makes it easier to learn long-range dependencies. Self-attention connects all positions with a constant O(1) number of sequentially executed operations, whereas recurrent layers require O(n) sequential operations.

5. Training & Results
On the WMT 2014 English-to-German translation task, the big transformer model out-performed the best previously reported models (including ensembles) by more than 2.0 BLEU, establishing a new state-of-the-art BLEU score of 28.4. Training took 3.5 days on 8 P100 GPUs.
On the WMT 2014 English-to-French translation task, our big model achieves a BLEU score of 41.0, outperforming all of the previously published single models, at 1/4 the training cost of the previous state-of-the-art model.

6. Conclusion
In this work, we presented the Transformer, the first sequence transduction model based entirely on attention, replacing the recurrent layers most commonly used in encoder-decoder architectures with multi-headed self-attention. For translation tasks, the Transformer can be trained significantly faster than architectures based on recurrent or convolutional layers. On both WMT 2014 English-to-German and WMT 2014 English-to-French translation tasks, we achieved a new state of the art.`,
    jargonTerms: [
      { term: "Self-Attention", simpleMeaning: "A technique where an AI model looks at every word in a sentence at once and decides which other words are most closely related (like connecting 'bank' to 'river' instead of 'money')." },
      { term: "Transformer", simpleMeaning: "The modern AI brain architecture powering ChatGPT, Gemini, and Claude that processes text in parallel instead of reading one word at a time." },
      { term: "BLEU Score", simpleMeaning: "An exam-like score from 0 to 100 that measures how closely an AI's translation matches a human expert's translation." },
      { term: "Encoder-Decoder", simpleMeaning: "A two-part system: the Encoder reads and understands the input (like English), and the Decoder generates the target output (like Hindi)." },
      { term: "Parallelization", simpleMeaning: "Doing many calculations at the exact same time on GPU graphics chips rather than waiting in a slow line." }
    ]
  },
  {
    id: "crispr-cas9-therapeutics",
    title: "CRISPR-Cas9 Genome Editing: From Basic Biology to Clinical Therapies",
    authors: "Jennifer A. Doudna & Emmanuelle Charpentier (Nobel Prize in Chemistry 2020)",
    year: "2020",
    category: "Biotechnology / Genetics / Medicine",
    readingTimeOriginal: "50 mins",
    summaryTime: "2.5 mins",
    pages: 18,
    citationCount: "45,000+",
    abstract: "The clustered regularly interspaced short palindromic repeats (CRISPR)–associated protein 9 (Cas9) system has transformed genome engineering. Originally discovered as an adaptive immune mechanism in bacteria against bacteriophages, Cas9 functions as an RNA-guided endonuclease that introduces targeted DNA double-strand breaks. This review summarizes the molecular mechanisms of Cas9 target recognition, cleavage, repair pathways (NHEJ vs. HDR), and recent therapeutic clinical trials for human genetic disorders including sickle cell disease, beta-thalassemia, and oncological immunotherapies.",
    content: `CRISPR-Cas9 Genome Editing: From Basic Biology to Clinical Therapies
Authors: Jennifer A. Doudna, Emmanuelle Charpentier

1. Introduction
The ability to alter genomic sequences with precision has been a longstanding goal in biomedical science. Early technologies such as zinc-finger nucleases (ZFNs) and transcription activator-like effector nucleases (TALENs) relied on modular protein-DNA interactions. Although functional, protein engineering for each novel target locus was labor-intensive and costly. The discovery of CRISPR-Cas adaptive immunity in bacteria provided an elegant alternative: a single invariable protein (Cas9) guided to target DNA sequences through Watson-Crick base pairing of a short synthetic guide RNA (sgRNA).

2. Molecular Mechanism of Cleavage
The Streptococcus pyogenes Cas9 (SpCas9) endonuclease requires two components:
1. A single guide RNA (sgRNA) comprising a 20-nucleotide spacer complementary to the target protospacer sequence.
2. A short protospacer adjacent motif (PAM) sequence, specifically 5'-NGG-3', adjacent to the target genomic site.

Cas9 first interrogates DNA for the PAM sequence. Upon PAM binding, local DNA unwinding occurs, allowing RNA-DNA heteroduplex formation. If sufficient complementarity exists, the HNH and RuvC endonuclease domains cleave the complementary and non-complementary DNA strands respectively, producing a blunt double-strand break (DSB) 3 base pairs upstream of the PAM.

3. Cellular Repair Pathways
Eukaryotic cells repair DSBs via two primary competing pathways:
- Non-Homologous End Joining (NHEJ): An error-prone repair mechanism that ligates severed DNA ends, frequently introducing random insertions or deletions (indels). This is ideal for gene knockouts to disrupt pathogenic genes.
- Homology-Directed Repair (HDR): A high-fidelity pathway utilizing an exogenous donor DNA template to introduce precise sequence modifications, corrections, or gene insertions during the S/G2 cell cycle phases.

4. Clinical Breakthroughs
In 2019-2023, ex vivo autologous hematopoietic stem cell therapies demonstrated remarkable success. Patients suffering from transfusion-dependent beta-thalassemia and severe sickle cell disease (SCD) received CRISPR-edited CD34+ cells targeting the BCL11A erythroid enhancer. Re-activation of fetal hemoglobin (HbF) eliminated vaso-occlusive crises and blood transfusion dependence across 95%+ of clinical trial participants.

5. Challenges & Future Horizons
Major remaining hurdles include:
- Off-target cleavage at non-intended genomic loci.
- In vivo delivery vectors (e.g., lipid nanoparticles vs. adeno-associated viral vectors).
- High treatment cost limiting global healthcare accessibility.

6. Conclusion
CRISPR-Cas9 has revolutionized molecular biology and human medicine, converting theoretical genetic editing into real-world curative therapies. Continued development of high-fidelity Cas variants and base editing promises to broaden therapeutic scope while improving safety profiles.`,
    jargonTerms: [
      { term: "CRISPR-Cas9", simpleMeaning: "A molecular 'pair of scissors' that scientists can guide with high precision to cut, edit, or fix faulty genes in DNA." },
      { term: "Guide RNA (sgRNA)", simpleMeaning: "A molecular GPS that tells the Cas9 scissors exactly where to cut in the 3 billion letters of our DNA code." },
      { term: "Double-Strand Break (DSB)", simpleMeaning: "A complete cut through both sides of the DNA double helix ladder." },
      { term: "Sickle Cell Disease", simpleMeaning: "A genetic blood disorder where red blood cells become sickle/crescent-shaped, causing severe pain and blockages." },
      { term: "Off-target Cleavage", simpleMeaning: "An accidental cut by the gene scissors in the wrong place of the DNA, which scientists work hard to prevent." }
    ]
  },
  {
    id: "quantum-supremacy",
    title: "Quantum Supremacy Using a Programmable Superconducting Processor",
    authors: "Frank Arute, Kunal Arya, John M. Martinis, et al. (Google Quantum AI)",
    year: "2019",
    category: "Quantum Physics & Advanced Computing",
    readingTimeOriginal: "40 mins",
    summaryTime: "2 mins",
    pages: 12,
    citationCount: "6,800+",
    abstract: "The promise of quantum computers is that certain computational tasks might be executed exponentially faster on a quantum processor than on a classical computer. We demonstrate quantum computational supremacy using a programmable superconducting processor with 53 operating qubits, named Sycamore. Our processor takes approximately 200 seconds to sample one instance of a quantum circuit a million times—our benchmarks indicate that the equivalent task for a state-of-the-art classical supercomputer would take approximately 10,000 years. This dramatic increase in speed compared to all known classical algorithms represents an experimental milestone for quantum computing.",
    content: `Quantum Supremacy Using a Programmable Superconducting Processor
Authors: Google Quantum AI Team & Collaborators

1. Introduction
Since the 1980s, physicists including Richard Feynman conjectured that quantum mechanical phenomena—specifically superposition and entanglement—could execute certain specialized mathematical algorithms exponentially faster than any Turing machine or classical supercomputer. The achievement of 'Quantum Supremacy' marks the pivotal threshold where a real quantum computer performs a calculation that cannot be feasibly reproduced by classical supercomputers within any practical timeframe.

2. The Sycamore Processor Architecture
The Sycamore processor comprises a two-dimensional grid of 54 transmon qubits (one qubit failed, leaving 53 operational qubits). Each qubit is coupled to its four nearest neighbors with an adjustable coupler. This architecture allows:
- Individual microwave control of each qubit's state.
- Fast tuning of qubit frequencies to suppress unwanted cross-talk.
- High-fidelity single-qubit gates (error rate 0.15%) and two-qubit gates (error rate 0.36%).

The processor operates inside a dilution refrigerator cooled to 20 millikelvin (-273.13°C), colder than deep space, to maintain quantum coherence and superconductivity.

3. Benchmark Task: Random Circuit Sampling
To prove supremacy, we implemented Cross-Entropy Benchmarking (XEB) on random quantum circuits. A random quantum circuit applies alternating single-qubit and two-qubit quantum gates to all 53 qubits across m cycles. As the depth increases, the quantum state space grows exponentially to 2^53 = 9 x 10^15 states. Simulating this quantum wave interference classically requires storing and multiplying vectors with 9 quadrillion complex numbers.

4. Performance & Classical Comparison
Sycamore executed circuits of depth 20 with 53 qubits and gathered 1 million samples in 200 seconds.
Using the world's most powerful classical supercomputer at the time (Summit at Oak Ridge National Laboratory, with 40,000 CPUs and GPUs), calculating this same random probability distribution via tensor network contraction would require approximately 10,000 years and millions of kilowatt-hours of electrical energy.

5. Significance & Limitations
The task solved (random circuit verification) is a synthetic mathematical benchmark rather than an immediately practical commercial application (such as battery chemistry simulation or drug design). However, it rigorously confirms that quantum mechanics functions as predicted at high complexity in hardware.

6. Conclusion
We have demonstrated quantum supremacy with a programmable superconducting processor. This milestone opens the era of Noisy Intermediate-Scale Quantum (NISQ) technology, moving toward fault-tolerant quantum computing and practical quantum chemistry.`,
    jargonTerms: [
      { term: "Qubit (Quantum Bit)", simpleMeaning: "Unlike a normal computer bit that can only be 0 OR 1, a qubit can be 0, 1, or both at the same time (Superposition)." },
      { term: "Quantum Supremacy", simpleMeaning: "The historic moment when a quantum computer solves a problem that even the world's fastest supercomputer cannot finish in thousands of years." },
      { term: "Superposition", simpleMeaning: "A quantum magic trick where a particle explores multiple possibilities simultaneously until you measure it." },
      { term: "Entanglement", simpleMeaning: "When two qubits are deeply connected such that changing one instantly affects the other, no matter how far apart they are." },
      { term: "Dilution Refrigerator", simpleMeaning: "A hyper-advanced cooling tank that drops temperature to near absolute zero (-273°C) so qubits don't get disturbed by heat." }
    ]
  },
  {
    id: "ai-cancer-detection",
    title: "International Evaluation of an AI System for Breast Cancer Screening",
    authors: "Scott Mayer McKinney, Shravya Shetty, Christopher J. Kelly, et al. (Nature 2020)",
    year: "2020",
    category: "Medicine / Healthcare AI / Radiology",
    readingTimeOriginal: "35 mins",
    summaryTime: "2 mins",
    pages: 10,
    citationCount: "3,200+",
    abstract: "Screening mammography aims to detect breast cancer at early stages when treatment is more effective. However, false positives and false negatives remain common. We present an artificial intelligence (AI) system trained on a large de-identified dataset from the UK and USA. The AI system outperformed all human expert radiologists in a simulated trial, achieving an absolute reduction of 5.7% and 1.2% (USA and UK) in false positives, and 9.4% and 2.7% in false negatives. In an independent study of six radiologists, the AI system maintained superior accuracy, demonstrating its potential to assist or double-read alongside clinical doctors.",
    content: `International Evaluation of an AI System for Breast Cancer Screening
Published in Nature (2020)
Authors: Google Health, DeepMind, Cancer Research UK Imperial Centre, Northwestern University

1. The Clinical Problem
Breast cancer is the second leading cause of cancer death in women globally. Routine mammography screening saves thousands of lives through early tumor identification. However, interpreting screening mammograms is exceptionally challenging:
- False Negatives: An estimated 20% of breast cancers are missed by radiologists during screening.
- False Positives: Millions of healthy women receive alarming false alarms requiring stressful biopsies and expensive secondary imaging.
- Global Shortage: Radiologist shortages in the UK and developing nations create long delays.

2. The AI System Architecture
The researchers engineered an ensemble of deep convolutional neural networks (CNNs). The model was trained on historical, biopsy-verified mammograms from:
- United Kingdom dataset: 25,856 women
- United States dataset: 3,097 women

The model processes all standard screening views (cranio-caudal and mediolateral oblique for each breast). Rather than only giving a binary yes/no prediction, it produces a calibrated continuous risk score from 0 to 1, pinpointing suspicious regions with heatmaps.

3. Results Across Borders
When tested against real-world screening outcomes:
- In the US cohort: AI reduced False Positives by 5.7% and reduced False Negatives (missed tumors) by 9.4%.
- In the UK cohort: AI reduced False Positives by 1.2% and reduced False Negatives by 2.7%.
- Area Under the ROC Curve (AUC-ROC): The AI surpassed the average clinical radiologist by an AUC margin of 0.115 in the US.

4. Human + AI Collaboration
In the United Kingdom, screening guidelines mandate that every mammogram be reviewed by two independent expert radiologists ('double reading'). The study simulated replacing the second human radiologist with the AI algorithm:
- Result: The AI-plus-single-human-radiologist workflow maintained identical or superior accuracy while reducing radiologist clinical workload by 88%.

5. Limitations & Ethical Considerations
The dataset was retrospective, meaning prospective randomized clinical trials are still required before autonomous deployment. Furthermore, algorithms must be validated across diverse ethnicities and varying mammography scanner hardware.

6. Conclusion
An AI system can detect breast cancer in screening mammograms with greater accuracy than single human experts. It holds tremendous promise as an assistive 'second reader' to alleviate doctor burnout and catch early-stage cancers before they spread.`,
    jargonTerms: [
      { term: "Mammogram", simpleMeaning: "A low-dose X-ray picture of the breast used to detect early signs of cancer before symptoms appear." },
      { term: "False Positive", simpleMeaning: "A false alarm: test says a healthy person has cancer when they actually do not." },
      { term: "False Negative", simpleMeaning: "A missed danger: test says the person is healthy when cancer is actually present." },
      { term: "Convolutional Neural Network (CNN)", simpleMeaning: "An AI computer vision system designed like human eyes to scan images pixel-by-pixel for tiny patterns." },
      { term: "AUC-ROC", simpleMeaning: "A performance grade from 0.5 (random guessing) to 1.0 (perfect accuracy) that measures how well a test tells sick and healthy patients apart." }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SAMPLE_PAPERS };
}
