const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

/** RAG Service - Retrieval-Augmented Generation with LLM Integration
 * Retrieves banking knowledge and uses LLM API to generate contextual responses
 */

class RAGService {
  constructor() {
    this.llmProvider = process.env.LLM_PROVIDER || 'gemini';
    this.apiKey = process.env.LLM_API_KEY;
    
    // Initialize Google Generative AI client if using Gemini
    if (this.llmProvider === 'gemini' && this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    }
    
    this.knowledgeBase = [];
    this.embeddings = {};
    this.loadKnowledgeBase();
    this.validateLLMConfig();
  }

  validateLLMConfig() {
    if (!this.apiKey) {
      console.warn('⚠ LLM_API_KEY not configured. Falling back to template-based responses.');
      this.llmEnabled = false;
    } else {
      this.llmEnabled = true;
      console.log(`✓ LLM Integration enabled (${this.llmProvider})`);
    }
  }

  loadKnowledgeBase() {
    try {
      const intentsPath = path.join(__dirname, '../chatbot/intents.json');
      const intents = JSON.parse(fs.readFileSync(intentsPath, 'utf8'));

      this.knowledgeBase = intents.intents
        .filter(intent => intent.patterns && intent.patterns.length > 0)
        .map(intent => ({
          tag: intent.tag,
          patterns: intent.patterns,
          responses: intent.responses,
          context: intent.context || '',
          empathetic: intent.empathetic || false,
          emotion: intent.emotion || 'neutral',
          escalate: intent.escalate || false,
          keywords: this.extractKeywords(intent.patterns)
        }));

      console.log('✓ RAG Knowledge base loaded with', this.knowledgeBase.length, 'intents');
    } catch (error) {
      console.error('Error loading knowledge base:', error.message);
      this.knowledgeBase = [];
    }
  }

  /* Embedding using TF-IDF style tokenization */
  getEmbedding(text) {
    const tokens = text.toLowerCase().match(/\b\w+\b/g) || [];
    return tokens.reduce((acc, token) => {
      acc[token] = (acc[token] || 0) + 1;
      return acc;
    }, {});
  }

  /* Calculate cosine similarity between two embeddings */
  calculateSimilarity(embedding1, embedding2) {
    const allKeys = new Set([...Object.keys(embedding1), ...Object.keys(embedding2)]);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    allKeys.forEach(key => {
      const val1 = embedding1[key] || 0;
      const val2 = embedding2[key] || 0;
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    });

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /* Retrieve relevant documents from knowledge base using semantic search */
  retrieveContext(userMessage, topK = 3) {
    if (this.knowledgeBase.length === 0) {
      return [];
    }

    const queryEmbedding = this.getEmbedding(userMessage);
    
    const scoredDocs = this.knowledgeBase.map(doc => {
      const patternText = doc.patterns.join(' ');
      const docEmbedding = this.getEmbedding(patternText);
      const similarity = this.calculateSimilarity(queryEmbedding, docEmbedding);

      return {
        ...doc,
        score: similarity,
        matchedPatterns: this.findMatchedPatterns(userMessage, doc.patterns)
      };
    });

    return scoredDocs
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .filter(doc => doc.score > 0.05);
  }

  /* Search for patterns matching the user message */
  findMatchedPatterns(userMessage, patterns) {
    const lowerMessage = userMessage.toLowerCase();
    return patterns.filter(pattern => 
      lowerMessage.includes(pattern.toLowerCase()) || 
      this.calculateSimilarity(
        this.getEmbedding(userMessage),
        this.getEmbedding(pattern)
      ) > 0.3
    );
  }

  extractKeywords(patterns) {
    const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'i', 'you', 'my']);
    const keywords = new Set();

    patterns.forEach(pattern => {
      const words = pattern.toLowerCase().match(/\b\w+\b/g) || [];
      words.forEach(word => {
        if (word.length > 2 && !stopwords.has(word)) {
          keywords.add(word);
        }
      });
    });

    return Array.from(keywords);
  }

  /** Build system prompt for LLM with banking context **/
  buildSystemPrompt() {
    return `You are a professional and empathetic banking customer service assistant. 
Your role is to provide accurate, helpful information about banking services including:
- Account management and balance inquiries
- Loan and credit services
- Credit card services
- Fund transfers and payments
- Security and fraud prevention
- Banking fees and charges

Guidelines:
- Be professional yet friendly
- Provide specific, actionable information
- Mention escalation to specialists when needed
- Always prioritize customer security
- Keep responses concise (2-3 sentences max)
- Offer next steps or suggested actions`;
  }

  /* Build LLM context from retrieved documents */
  buildRAGContext(retrievedDocs) {
    if (retrievedDocs.length === 0) {
      return '';
    }

    let context = 'RETRIEVED KNOWLEDGE BASE CONTEXT:\n';
    context += '================================\n';

    retrievedDocs.forEach((doc, index) => {
      context += `\n[Intent: ${doc.tag}]\n`;
      context += `Matched Patterns: ${doc.matchedPatterns.join(', ')}\n`;
      context += `Context: ${doc.context}\n`;
      context += `Sample Responses: ${doc.responses.slice(0, 2).join(' | ')}\n`;
    });

    return context;
  }

  /* Generate LLM prompt with RAG context and conversation history */
  buildLLMPrompt(userMessage, retrievedDocs, emotion, conversationContext = '') {
    const ragContext = this.buildRAGContext(retrievedDocs);
    const emotionContext = `User Emotion: ${emotion} (Consider adjusting tone accordingly)`;
    const historicalContext = conversationContext ? `\nConversation History:\n${conversationContext}` : '';
    console.log('Historical Context Retrieved: ', historicalContext);
    return `${this.buildSystemPrompt()}

${emotionContext}${historicalContext}

${ragContext}

User Query: "${userMessage}"

Generate a helpful, natural banking support response based on the retrieved context above. Do not mention "intents" or "patterns" - respond naturally as a customer service agent.`;
  }

  /**
   * Call Google Gemini API for response generation
   */
  async callGemini(prompt) {
    try {
      console.log('Prompt to LLM: ', prompt);
      const result = await this.model.generateContent(
        prompt
        );
        const response = result.response;

        console.log('Gemini API response:', response.text());

      const data = await response.text();

      return data.trim();
    } catch (error) {
      console.error('Gemini API error:', error.message);
      return null;
    }
  }


  /* Generate LLM-based response with RAG context */
  async generateLLMResponse(userMessage, retrievedDocs, emotion, conversationContext = '') {
    if (!this.llmEnabled) {
      console.log('LLM disabled, using fallback response');
      return this.selectResponseByEmotion(
        retrievedDocs[0]?.responses || [],
        emotion,
        retrievedDocs[0]?.empathetic || false
      );
    }

    try {
      const prompt = this.buildLLMPrompt(userMessage, retrievedDocs, emotion, conversationContext);
      
      let generatedText;
      if (this.llmProvider === 'openai') {
        generatedText = await this.callOpenAI(prompt);
      } else if (this.llmProvider === 'huggingface') {
        generatedText = await this.callHuggingFace(prompt);
      } else if (this.llmProvider === 'gemini') {
        generatedText = await this.callGemini(prompt);
      } else {
        throw new Error(`Unknown LLM provider: ${this.llmProvider}`);
      }

      return generatedText || this.generateFallbackResponse(emotion);
    } catch (error) {
      console.error('LLM generation error:', error.message);
      return this.generateFallbackResponse(emotion);
    }
  }

  /* Generate response using retrieved context, emotion, and conversation history */
  async generateResponse(userMessage, retrievedDocs, emotion, conversationContext = '') {
    if (retrievedDocs.length === 0) {
      return {
        text: this.generateFallbackResponse(emotion),
        source: 'fallback',
        confidence: 0,
        suggestedActions: [],
        requiresEscalation: true,
        matchedIntent: 'unknown',
        usedLLM: false
      };
    }

    const primaryDoc = retrievedDocs[0];
    
    // Generate LLM-based response with RAG context and conversation history
    const responseText = await this.generateLLMResponse(userMessage, retrievedDocs, emotion, conversationContext);

    return {
      reply: responseText,
      text: responseText,
      source: primaryDoc.tag,
      confidence: Math.min(Math.max(primaryDoc.score, 0), 1),
      suggestedActions: this.generateSuggestedActions(primaryDoc, userMessage),
      requiresEscalation: primaryDoc.escalate,
      matchedIntent: primaryDoc.tag,
      usedLLM: this.llmEnabled
    };
  }

  /* Select response based on emotional context */
  selectResponseByEmotion(responses, emotion, isEmpathetic) {
    if (!responses || responses.length === 0) {
      return "I'm here to help. Could you provide more details?";
    }

    // For frustrated/angry users, prioritize reassuring responses
    if (emotion === 'frustrated' || emotion === 'angry') {
      if (isEmpathetic) {
        return responses[0]; // Use first (most empathetic) response
      }
    }

    // For sad users, be empathetic
    if (emotion === 'sad') {
      if (isEmpathetic) {
        return responses[0];
      }
    }

    // For happy users, be encouraging
    if (emotion === 'happy') {
      return responses[Math.min(1, responses.length - 1)]; // Use second response if available
    }

    // Default: random response
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /* Generate suggested actions based on context and intent */
  generateSuggestedActions(doc, userMessage) {
    const actions = [];
    const tag = doc.tag.toLowerCase();
    
    if (tag.includes('account') || tag.includes('balance')) {
      actions.push('View account details');
      actions.push('Open new account');
    }
    if (tag.includes('loan')) {
      actions.push('Check eligibility');
      actions.push('Apply for loan');
      actions.push('Calculate EMI');
    }
    if (tag.includes('card') || tag.includes('credit')) {
      actions.push('View card benefits');
      actions.push('Apply for card');
      actions.push('Report lost card');
    }
    if (tag.includes('transfer') || tag.includes('payment')) {
      actions.push('Transfer funds');
      actions.push('Pay bills');
    }
    if (tag.includes('security') || tag.includes('fraud')) {
      actions.push('Report fraud');
      actions.push('Change password');
    }

    return actions.slice(0, 2); // Return max 2 suggestions
  }

  /* Fallback response when no relevant documents found */
  generateFallbackResponse(emotion) {
    const fallbacks = {
      happy: "That's wonderful! How else can I assist you today?",
      sad: "I'm here to help. What specific banking service can I assist you with?",
      angry: "I understand your concern. Let me connect you with a specialist. Please call 1-888-SECURE-BANK for immediate assistance.",
      frustrated: "I apologize for any inconvenience. For faster resolution, please call our customer service team at 1-888-SECURE-BANK.",
      neutral: "I'm not entirely sure about that. For detailed assistance, please contact our customer service at 1-888-SECURE-BANK or visit a branch."
    };

    return fallbacks[emotion] || fallbacks.neutral;
  }

  /* Get raw retrieval score for debugging/monitoring */
  getRetrievalMetrics(userMessage) {
    const retrieved = this.retrieveContext(userMessage, 5);
    return {
      topMatch: retrieved.length > 0 ? retrieved[0].tag : 'none',
      confidenceScore: retrieved.length > 0 ? retrieved[0].score : 0,
      retrievalCount: retrieved.length,
      allMatches: retrieved.map(r => ({
        tag: r.tag,
        score: r.score,
        matchedPatterns: r.matchedPatterns
      }))
    };
  }
}

module.exports = new RAGService();
