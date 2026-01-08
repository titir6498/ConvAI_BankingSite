const express = require("express");
const cors = require("cors");
const getResponse = require("./services/responseEngine");

const app = express();
app.use(cors());
app.use(express.json());

const faqResponses = [
  { keywords: ["login", "sign in"], response: "Click the Login button on the top right." },
  { keywords: ["register", "signup"], response: "Use Register to create a new account." },
  { keywords: ["password", "reset"], response: "Go to Settings and reset your password." }
];

app.post("/chat", (req, res) => {
  const msg = req.body.message.toLowerCase();
  // const match = faqResponses.find(f =>
  //   f.keywords.some(k => msg.includes(k))
  // );
  const match = getResponse(msg);
  res.json({ reply: match });
});

app.listen(5000, () => console.log("Backend running on port 5000"));