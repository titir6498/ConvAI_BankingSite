# SecureBank Website - Technical Documentation

## Overview

SecureBank is a full-stack banking website with an integrated AI-powered chatbot assistant. The application provides customers with 24/7 support for banking inquiries while maintaining security and compliance standards. This documentation focuses on the chatbot functionality and how the frontend and backend work together to deliver seamless customer service.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Structure](#backend-structure)
3. [Frontend Structure](#frontend-structure)
4. [Chatbot Functionality](#chatbot-functionality)
5. [Communication Flow](#communication-flow)
6. [API Endpoints](#api-endpoints)
7. [Setup and Deployment](#setup-and-deployment)

---

## Architecture Overview

SecureBank follows a **client-server architecture** with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Chat Widget (ChatWidget.jsx)                  │ │
│  │  - Manages UI state (open/close)                       │ │
│  │  - Handles user input                                  │ │
│  │  - Displays message history                            │ │
│  │  - Sends requests to backend                           │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP POST Request
                       │ (User Message)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Server (server.js)                           │ │
│  │  - Handles /api/chat POST endpoint                     │ │
│  │  - Validates incoming messages                         │ │
│  │  - Routes requests to response generator               │ │
│  └────────────────────────────────────────────────────────┘ │
│                       │                                       │
│                       ↓                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │    Response Generator (responseGenerator.js)           │ │
│  │  - Loads intent patterns from intents.json             │ │
│  │  - Matches user messages to intents                    │ │
│  │  - Selects appropriate response                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                       │                                       │
│                       ↓                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │      Intent Configuration (intents.json)               │ │
│  │  - Banking service patterns                            │ │
│  │  - Response templates                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                       │
                       ↑ HTTP Response
                    (JSON with reply)
```

---

## Backend Structure

### Server Configuration (`server.js`)

The backend is built using **Express.js**, a lightweight Node.js framework.

**Key Features:**
- **CORS Enabled**: Allows cross-origin requests from the frontend
- **JSON Parser**: Handles JSON request bodies
- **Static File Serving**: Serves frontend build in production
- **Error Handling**: Comprehensive try-catch blocks for reliability

**Main Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Server health check |
| `/api/chat` | POST | Process user messages and return chatbot responses |

**Request/Response Format:**

```javascript
// Request
POST /api/chat
{
  "message": "check my account balance"
}

// Response
{
  "reply": "For security reasons, I cannot display your balance here. Please log in to your online banking or mobile app to view your account balance.",
  "timestamp": "2024-01-16T10:30:00.000Z"
}
```

**Error Handling:**
- Returns 400 Bad Request for missing or invalid messages
- Returns 500 Internal Server Error with user-friendly message on processing errors

---

### Response Generator (`responseGenerator.js`)

The response generator is the brain of the chatbot, implementing pattern matching and intent recognition.

**Workflow:**

```
1. User sends message → 2. findIntent() looks for matching patterns → 
3. If match found → Select random response from intent → Return response →
4. If no match → Return fallback response
```

**Key Functions:**

#### `findIntent(message)`
- Converts user message to lowercase
- Iterates through all intents in `intents.json`
- For each intent, checks if message contains any of its patterns
- Returns the matching intent object or `null`

**Example:**
```javascript
// User message: "Can I apply for a credit card?"
// Pattern match found: "apply for credit card"
// Returns: credit_cards intent object
```

#### `getResponse(userMessage)`
- Validates that message is not empty
- Calls `findIntent()` to identify intent
- If intent found: randomly selects from 3-4 response options (provides variety)
- If no intent found: returns a fallback response
- Ensures responses are contextually appropriate

**Design Benefits:**
- **Randomized Responses**: Multiple responses per intent prevent repetitive interactions
- **Fallback Handling**: Gracefully handles unknown queries
- **Case-Insensitive**: "Check balance", "CHECK BALANCE", "check balance" all match

---

### Intent Configuration (`intents.json`)

The intents file defines all banking knowledge the chatbot understands.

**Structure:**
```json
{
  "intents": [
    {
      "tag": "unique_intent_id",
      "patterns": ["pattern1", "pattern2", "pattern3"],
      "responses": ["response1", "response2", "response3"]
    }
  ]
}
```

**Available Banking Intents:**

| Intent Tag | Purpose | Example Patterns |
|---|---|---|
| `greeting` | Welcome messages | "hello", "hi", "good morning" |
| `account_balance` | Account inquiries | "check balance", "account balance", "how much do i have" |
| `credit_cards` | Credit card services | "credit card", "apply for credit card", "card benefits" |
| `loan_services` | Loan inquiries | "loan", "mortgage", "personal loan", "education loan" |
| `transfers_payments` | Money transfers | "transfer money", "bill payment", "wire transfer" |
| `account_services` | Account management | "open account", "close account", "update information" |
| `atm_branch` | ATM & branch info | "atm location", "branch hours", "nearest atm" |
| `online_banking` | Digital services | "online banking", "mobile app", "login problem" |
| `fraud_security` | Security concerns | "fraud alert", "suspicious activity", "phishing" |
| `investment_services` | Investment products | "mutual funds", "retirement accounts", "401k" |
| `interest_rates` | Rate information | "interest rate", "apy", "mortgage rates" |
| `statements_tax` | Documents | "bank statement", "tax documents", "1099" |
| `customer_service` | Support channels | "contact support", "customer service", "phone number" |
| `fallback` | Unknown queries | (No patterns - default for unmatched) |

**Response Examples:**

For "check balance" pattern:
1. "For security reasons, I cannot display your balance here. Please log in to your online banking or mobile app to view your account balance."
2. "To check your account balance, please sign in to your SecureBank online banking account or use our mobile app."
3. "Account balances are available through secure channels. Please log in to your account via our website or contact phone banking for assistance."

Each intent has 3-4 varied responses to ensure customer interactions feel natural and less scripted.

---

## Frontend Structure

### Main Application (`App.js`)

The React application serves as the main website container and integrates the chat widget globally.

**Key Components:**
- **Navigation Bar**: Logo, tagline, main navigation links, login button
- **Routes**: Home, Contact, Login, Signup pages
- **Services Grid**: Highlights main banking services
- **Chat Widget**: Available on every page (floating button)
- **Footer**: Contact info, quick links, legal disclaimers, security notice

**Layout:**
```
┌─────────────────────────────────────┐
│         Navigation Header           │
├─────────────────────────────────────┤
│                                     │
│     Page Content (Route-based)      │
│                                     │
│  Services Grid:                     │
│  - Secure Banking                   │
│  - Easy Loans                        │
│  - 24/7 Support                      │
│                                     │
├─────────────────────────────────────┤
│           Footer                    │
│    (Contact, Links, Legal)          │
├─────────────────────────────────────┤
│  Chat Widget (Floating Button)      │
└─────────────────────────────────────┘
```

---

### Chat Widget Component (`ChatWidget.jsx`)

The Chat Widget is a floating component that provides the chatbot interface to users.

**Component State:**

```javascript
const [open, setOpen] = useState(false);        // Is chat window open?
const [messages, setMessages] = useState([]);   // Chat message history
const [input, setInput] = useState("");         // Current user input
```

**UI Elements:**
1. **Toggle Button**: "Help" button in bottom-right corner
2. **Chat Box**: Expands when button is clicked
3. **Message Display Area**: Shows conversation history with sender differentiation
4. **Input Field**: Text input for user queries
5. **Send Button**: Submits message to backend

**Key Function: `sendMessage()`**

```javascript
const sendMessage = async () => {
  // 1. Validate input is not empty
  if (!input.trim()) return;

  // 2. Add user message to local state (immediate display)
  const userMsg = { sender: "user", text: input };
  setMessages([...messages, userMsg]);

  // 3. Send to backend API
  const response = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: input })
  });

  // 4. Parse response
  const data = await response.json();

  // 5. Add bot response to conversation
  setMessages(prev => [...prev, { sender: "bot", text: data.reply }]);

  // 6. Clear input field
  setInput("");
};
```

**User Experience Flow:**

```
User clicks "Help" button
        ↓
Chat window opens with empty message history
        ↓
User types "How do I open an account?"
        ↓
User clicks "Send"
        ↓
Message appears in chat (sender: "user")
        ↓
API request sent to backend
        ↓
Backend processes and returns response
        ↓
Bot message appears in chat (sender: "bot")
        ↓
Input field clears and user can continue conversation
```

### Products & Services Component (`ProductsServices.js`)

The Products & Services page displays the banking products and services offered by SecureBank in a responsive card grid.

**Component Structure:**

```javascript
const products = [
  {
    icon: "💰",
    title: "Savings Account",
    description: "Secure your future with high-interest savings accounts and easy access to funds."
  },
  // ... more products
];

return (
  <div className="products-container">
    <div className="products-header">
      <h2>Our Products & Services</h2>
      <p>Explore the wide range of financial solutions we offer to meet your needs.</p>
    </div>
    <div className="product-grid">
      {products.map((product, index) => (
        <div key={index} className="product-card">
          <div className="service-icon">{product.icon}</div>
          <h3>{product.title}</h3>
          <p>{product.description}</p>
        </div>
      ))}
    </div>
  </div>
);
```

**Products Offered:**
- 💰 Savings Account - High-interest savings with easy fund access
- 💳 Checking Account - Daily transactions with zero hidden charges
- 📊 Loans - Flexible personal, home, and auto loan options
- 💎 Credit Cards - Rewards, cashback, and secure payments
- 📈 Investment Services - Expert guidance and diverse opportunities
- 🛡️ Insurance - Comprehensive protection plans

**Styling Features:**

The product cards use a responsive grid layout with professional styling:

```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #E1E8ED;
  box-shadow: 0 4px 12px rgba(15, 40, 84, 0.05);
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(15, 40, 84, 0.1);
  border-color: #4988C4;
}

.product-card h3 {
  color: #0F2854;
  margin-bottom: 0.8rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.product-card p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
}
```

**Design Features:**
- **Responsive Grid**: Auto-fit layout that adapts to screen size (minimum 280px card width)
- **Hover Effects**: Cards elevate with shadow enhancement and accent border color
- **Icon Integration**: Emoji icons for visual interest and quick recognition
- **Consistent Typography**: Matches the SecureBank design system throughout
- **Professional Spacing**: 2rem gaps and padding for proper visual hierarchy

---

## Chatbot Functionality

### How the Chatbot Understands User Intent

The chatbot uses **keyword pattern matching** to understand user queries. This is a rule-based approach rather than machine learning, making it lightweight and predictable.

**Example Matching Process:**

```
User Input: "Can I transfer money to another account?"
               ↓
         Normalize to lowercase
               ↓
     Check against all intent patterns
               ↓
   Found match: "transfer money" in transfers_payments intent
               ↓
    Return random response from transfers_payments responses
               ↓
"You can transfer money between your accounts, to other SecureBank customers, 
 or to external accounts through online banking or our mobile app."
```

### Response Selection Strategy

The chatbot maintains conversation variety through **randomized response selection**:

```javascript
const randomIndex = Math.floor(Math.random() * responses.length);
return responses[randomIndex];
```

**Benefits:**
- Conversations feel natural and less scripted
- Users experience different helpful information
- Prevents boredom from repetitive answers

### Fallback Mechanism

For queries the chatbot doesn't recognize, it provides helpful fallback responses:

```
User: "How do I file taxes?"
        ↓
    No pattern match found
        ↓
    Access fallback intent responses
        ↓
"I'm not sure about that specific banking question. For detailed assistance, 
 please call our customer service at 1-888-SECURE-BANK or visit a branch."
```

The fallback encourages users to seek human assistance for complex queries while maintaining a helpful tone.

---

## Communication Flow

### Complete Request-Response Cycle

**Step 1: User Interaction (Frontend)**
- User types message in Chat Widget
- Presses Send button
- React component creates message object

**Step 2: API Request (Frontend → Backend)**
```
POST http://localhost:5000/api/chat
Content-Type: application/json

{
  "message": "how do i apply for a loan?"
}
```

**Step 3: Backend Processing**
- Express server receives request
- Validates message field exists and is string
- Calls `responseGenerator.getResponse(message)`
- Response generator:
  1. Checks if message is empty → return prompt
  2. Calls findIntent() to match patterns
  3. If match found → select random response
  4. If no match → return fallback response

**Step 4: API Response (Backend → Frontend)**
```
HTTP 200 OK
Content-Type: application/json

{
  "reply": "We offer various loan products including personal, home, auto, 
           and education loans. You can apply online, visit any branch, 
           or call our loan center at 1-800-LOAN-NOW.",
  "timestamp": "2024-01-16T10:30:45.123Z"
}
```

**Step 5: Display Response (Frontend)**
- React receives response data
- Adds bot message to state
- Component re-renders with new message
- User sees bot reply in chat window

**Timing:**
- Typical request latency: 50-200ms (local network)
- Production latency: 200-500ms (internet latency added)
- User perceives immediate response (async handling)

---

## API Endpoints

### Health Check Endpoint

**Purpose:** Verify backend is running and healthy

```
GET /api/health

Response (200 OK):
{
  "status": "OK",
  "message": "Chat server is running"
}
```

### Chat Endpoint

**Purpose:** Process user messages and return chatbot responses

**Request:**
```
POST /api/chat
Content-Type: application/json

{
  "message": "string"  // User's query (required)
}
```

**Success Response (200 OK):**
```json
{
  "reply": "Bot's response text",
  "timestamp": "2024-01-16T10:30:00.000Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid request. Message is required."
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "response": "Sorry, I encountered an error. Please try again or contact admin for advanced queries."
}
```

**Input Validation:**
- Message must be a string
- Message must be present in request body
- Empty strings are accepted but prompted to ask for input

**Output Guarantees:**
- Always returns valid JSON
- Always includes timestamp in success responses
- Always returns appropriate HTTP status codes

---

## Setup and Deployment

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (included with Node.js)
- **Git** (for version control)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Environment variables (optional)
# Create .env file if needed for PORT configuration
# PORT=5000

# Start development server
npm start
# Server runs on http://localhost:5000

# Start with nodemon for auto-reload during development
npm install --save-dev nodemon
npx nodemon server.js
```

**Dependencies:**
- `express`: Web framework
- `cors`: Cross-Origin Resource Sharing
- `path`: File path utilities (Node built-in)

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# Opens http://localhost:3000 automatically

# Build for production
npm run build
# Creates optimized build in frontend/build directory
```

**Dependencies:**
- `react`: UI library
- `react-router-dom`: Client-side routing
- `react-dom`: DOM rendering

### Production Deployment

**Combined Server Approach:**

```bash
# From root directory

# Build frontend
cd frontend
npm run build
cd ..

# Backend serves frontend
# In server.js, production mode will serve static files:
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  // Serve index.html for all routes
}

# Start backend
cd backend
NODE_ENV=production npm start
```

**Deployment Checklist:**
- [ ] Set `NODE_ENV=production`
- [ ] Build React app: `npm run build`
- [ ] Ensure backend serves frontend static files
- [ ] Configure appropriate PORT (e.g., 5000)
- [ ] Test all chat endpoints
- [ ] Update API endpoints in ChatWidget (production URL instead of localhost)
- [ ] Enable HTTPS in production
- [ ] Configure security headers

### Configuration

**Frontend API URL:**

In `ChatWidget.jsx`, update the fetch URL for production:

```javascript
// Development
const response = await fetch("http://localhost:5000/api/chat", { ... });

// Production (update this)
const response = await fetch("https://api.yourdomain.com/chat", { ... });
// OR
const response = await fetch("/api/chat", { ... }); // If serving from same domain
```

**Backend CORS Configuration:**

Current `server.js` allows all origins:
```javascript
app.use(cors());
```

For production, restrict to specific domains:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
```

---

## Security Considerations

### Data Security
- User messages are not stored by the chatbot
- No sensitive data should be entered in chat (passwords, card numbers)
- Chat responses direct users to secure channels for sensitive operations
- HTTPS should be used in production

### Input Validation
- Backend validates message exists and is string
- Empty messages are rejected
- Messages are trimmed of whitespace
- XSS protection through React's automatic escaping

### Rate Limiting
Consider implementing rate limiting in production:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.post('/api/chat', limiter, (req, res) => {
  // ... handle request
});
```

### CORS in Production
- Enable only specific origins
- Restrict HTTP methods to POST for chat endpoint
- Use credentials option carefully

---

## Adding New Intents

To expand chatbot capabilities, add new intents to `intents.json`:

```json
{
  "tag": "my_new_intent",
  "patterns": [
    "pattern1",
    "pattern2",
    "pattern3",
    "pattern4"
  ],
  "responses": [
    "First possible response",
    "Second possible response",
    "Third possible response"
  ]
}
```

**Guidelines:**
- Use lowercase patterns with no special characters
- Include 3-4 common ways users might ask the question
- Provide 2-4 varied responses
- Use natural language, not robotic responses
- Direct to human support for complex topics
- Include relevant contact information in responses

**Example Addition:**

```json
{
  "tag": "debit_cards",
  "patterns": [
    "debit card",
    "request debit card",
    "card replacement",
    "debit card lost",
    "debit card decline",
    "card not working"
  ],
  "responses": [
    "We can order a replacement debit card at any branch or through online banking. It typically arrives in 5-7 business days.",
    "For immediate card access, request an expedited card. For card declines, please verify funds or contact us at 1-888-SECURE-BANK.",
    "To order or replace a debit card, visit a branch, call 1-888-SECURE-BANK, or use the Cards section in online banking."
  ]
}
```

After adding, test by:
1. Restart backend server
2. Type matching pattern in chat widget
3. Verify appropriate response is returned

---

## Testing the Chatbot

### Manual Testing Examples

```
Input: "How do I apply for a loan?"
Expected: Loan services response

Input: "Hi there!"
Expected: Greeting response

Input: "Help me with something weird"
Expected: Fallback response directing to customer service

Input: "hello how are you"
Expected: Should match "hello" pattern in greeting intent

Input: "" (empty)
Expected: "Please type your question or select an option above."
```

### Testing Checklist

- [ ] All intents return responses
- [ ] Fallback response works for unknown queries
- [ ] Empty message handling works
- [ ] API returns proper HTTP status codes
- [ ] Response includes timestamp
- [ ] Multiple responses per intent return variety
- [ ] Chat widget displays messages correctly
- [ ] Backend and frontend are properly connected
- [ ] CORS doesn't block requests
- [ ] Error responses are user-friendly

---

## Troubleshooting

### Common Issues

**Issue: 404 error when accessing /api/chat**
- Ensure backend server is running on correct port
- Check that URL in ChatWidget matches backend URL
- Verify express routes are properly configured

**Issue: Chat widget not appearing**
- Check that ChatWidget component is imported in App.js
- Verify component is rendered in JSX
- Check browser console for JavaScript errors
- Ensure CSS is properly loaded

**Issue: CORS errors in browser console**
- Verify `cors` package is installed in backend
- Check `app.use(cors())` is before route handlers
- In production, configure CORS to allow frontend domain

**Issue: No response from chatbot**
- Verify backend server is running
- Check network tab in browser DevTools
- Ensure POST request has proper JSON format
- Look for errors in backend console

**Issue: Messages sent but no response appears**
- Check browser console for fetch errors
- Verify API endpoint URL is correct
- Ensure message field in request body
- Test API directly with curl or Postman

---

## Future Enhancements

### Potential Improvements

1. **Natural Language Processing**
   - Implement NLP library like compromise.js
   - Support fuzzy matching for typos
   - Improve understanding of complex queries

2. **Machine Learning Integration**
   - Train model on banking FAQs
   - Implement confidence scoring
   - Learn from user interactions

3. **Database Integration**
   - Store chat history
   - Analytics on common questions
   - User session management

4. **Advanced Features**
   - Multi-language support
   - Sentiment analysis
   - Escalation to human agents
   - Personalized responses based on user data

5. **UI Improvements**
   - Suggestion buttons for common questions
   - Typing indicators
   - Conversation ratings
   - Chat history export

6. **Integration with Banking Systems**
   - Real-time account information
   - Transaction processing through chat
   - Secure authentication for account access

---

## Conclusion

The SecureBank chatbot provides a scalable, maintainable solution for 24/7 customer support. The modular architecture allows for easy expansion of banking intents while maintaining code clarity. The pattern-matching approach ensures predictable, reliable responses without complex machine learning infrastructure.

The separation of concerns—frontend UI handling, backend API processing, and centralized intent configuration—makes the system easy to understand, test, and enhance over time.

For questions or further development, refer to the code comments and the structure outlined in this documentation.

---

**Documentation Version:** 1.0  
**Last Updated:** January 16, 2026  
**Applicable to:** Website Chat Support v1.0
