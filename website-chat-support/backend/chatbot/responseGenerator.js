// // Intent patterns for matching user queries
// const intents = {
//   greetings: {
//     patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
//     responses: [
//       'Hello! Welcome to our E-commerce Store. How can I assist you today?',
//       'Hi there! Ready to help with your shopping needs.',
//       'Greetings! How may I help you navigate our store?'
//     ]
//   },
//   orderTracking: {
//     patterns: ['track', 'tracking', 'order status', 'where is my order', 'when will it arrive', 'delivery status'],
//     responses: [
//       'You can track your order by going to "My Account" → "Order History" → "Track Order".',
//       'To track your order, please provide your order number. You can find it in your order confirmation email.',
//       'Order tracking is available in your account dashboard. Most orders arrive within 3-5 business days.'
//     ]
//   },
//   returns: {
//     patterns: ['return', 'refund', 'exchange', 'send back', 'wrong item', 'defective'],
//     responses: [
//       'Our return policy allows returns within 30 days of delivery. Visit "My Account" → "Returns" to start a return.',
//       'For returns, please ensure items are unused with original packaging. You can initiate a return from your order history.',
//       'We offer free returns within 30 days. Go to your order details and click "Return Item" to begin.'
//     ]
//   },
//   products: {
//     patterns: ['find product', 'search for', 'looking for', 'where can i find', 'do you have', 'product availability'],
//     responses: [
//       'Use the search bar at the top of any page to find products. You can filter by category, price, or brand.',
//       'Browse our categories or use specific keywords in search. Need help finding something specific?',
//       'Check our "New Arrivals" or "Best Sellers" sections for popular items. You can also use advanced search filters.'
//     ]
//   },
//   payment: {
//     patterns: ['payment', 'credit card', 'paypal', 'failed payment', 'payment method', 'billing'],
//     responses: [
//       'We accept Visa, MasterCard, PayPal, and Apple Pay. Payment issues? Try a different method or check with your bank.',
//       'For payment problems, ensure your card details are correct and you have sufficient funds. You can also try PayPal.',
//       'Update payment methods in "Account Settings" → "Payment Methods". For declined payments, contact your bank.'
//     ]
//   },
//   account: {
//     patterns: ['account', 'login', 'password', 'sign up', 'profile', 'my account'],
//     responses: [
//       'Manage your account by clicking your name in the top right corner. You can update details, addresses, and preferences.',
//       'For login issues, use "Forgot Password" on the sign-in page. Account settings are accessible from your profile.',
//       'Create an account for faster checkout and order tracking. Go to "Sign Up" in the top navigation.'
//     ]
//   },
//   shipping: {
//     patterns: ['shipping', 'delivery', 'shipping cost', 'free shipping', 'when will it ship', 'international shipping'],
//     responses: [
//       'Standard shipping: 3-5 business days ($4.99). Free shipping on orders over $50. Express shipping available.',
//       'We ship worldwide! Delivery times vary by location. Check the shipping calculator at checkout for estimates.',
//       'Orders usually ship within 24 hours. You\'ll receive a tracking email once your order is dispatched.'
//     ]
//   },
//   promotions: {
//     patterns: ['discount', 'coupon', 'promo code', 'sale', 'deal', 'special offer'],
//     responses: [
//       'Check our "Deals" page for current promotions. Sign up for our newsletter to receive exclusive coupons!',
//       'Use code WELCOME10 for 10% off your first order. Seasonal sales are announced on our homepage.',
//       'We have weekly deals! Follow us on social media for flash sales and limited-time offers.'
//     ]
//   },
//   contact: {
//     patterns: ['contact', 'customer service', 'speak to someone', 'call', 'email', 'support'],
//     responses: [
//       'Our customer service team is available 24/7 at 1-800-ECOMMERCE or support@ecommerce-store.com.',
//       'For urgent issues, call us at 1-800-ECOMMERCE. You can also use the contact form on our "Help" page.',
//       'Live chat with a human agent is available 9 AM - 9 PM EST. Click "Contact Us" in the footer for options.'
//     ]
//   },
//   goodbye: {
//     patterns: ['bye', 'goodbye', 'thanks', 'thank you', 'that\'s all', 'exit'],
//     responses: [
//       'You\'re welcome! Happy shopping!',
//       'Thank you for visiting! Come back anytime.',
//       'Glad I could help! Have a great day!'
//     ]
//   }
// };

// // Helper function to find intent based on message
// function findIntent(message) {
//   const lowerMessage = message.toLowerCase();
  
//   for (const [intentName, intentData] of Object.entries(intents)) {
//     for (const pattern of intentData.patterns) {
//       if (lowerMessage.includes(pattern.toLowerCase())) {
//         return intentName;
//       }
//     }
//   }
  
//   return null;
// }

// // Generate response based on user message
// function getResponse(userMessage) {
//   // Check for empty message
//   if (!userMessage || userMessage.trim().length === 0) {
//     return "Please type your question or select an option above.";
//   }
  
//   // Find matching intent
//   const intent = findIntent(userMessage);
  
//   if (intent) {
//     // Select random response from intent's responses array
//     const responses = intents[intent].responses;
//     const randomIndex = Math.floor(Math.random() * responses.length);
//     return responses[randomIndex];
//   }
  
//   // Fallback for unrecognized questions
//   return "I'm not sure about that. For advanced queries, please contact our customer service team at support@ecommerce-store.com or call 1-800-ECOMMERCE.";
// }

// module.exports = {
//   getResponse,
//   intents // Export for testing
// };

const intentsData = require('./intents.json');

// Helper function to find intent based on message
function findIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const intent of intentsData.intents) {
    // Skip fallback intent for pattern matching
    if (intent.tag === 'fallback') continue;
    
    for (const pattern of intent.patterns) {
      if (lowerMessage.includes(pattern.toLowerCase())) {
        return intent;
      }
    }
  }
  
  return null;
}

// Generate response based on user message
function getResponse(userMessage) {
  // Check for empty message
  if (!userMessage || userMessage.trim().length === 0) {
    return "Please type your question or select an option above.";
  }
  
  // Find matching intent
  const intent = findIntent(userMessage);
  
  if (intent) {
    // Select random response from intent's responses array
    const responses = intent.responses;
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }
  
  // Use fallback response
  const fallbackIntent = intentsData.intents.find(i => i.tag === 'fallback');
  const fallbackResponses = fallbackIntent.responses;
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
}

module.exports = {
  getResponse,
  intents: intentsData
};