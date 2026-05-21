# Connect OpenAI API

Use when you need to call the OpenAI API from a Lovable project to add AI-powered features like chat, completion, or image generation.

## Overview

This skill covers setting up the OpenAI client, making chat completion requests, streaming responses, and handling errors safely.

## Steps

1. Add your OpenAI API key to environment variables
2. Initialize the OpenAI client
3. Make a chat completion request
4. Optionally stream the response
5. Handle errors and rate limits

## Code Examples

### Initialize Client

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // only for prototyping
});
```

### Basic Chat Completion

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: userMessage },
  ],
});

const reply = response.choices[0].message.content;
```

### Streaming Response

```typescript
const stream = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: userMessage }],
  stream: true,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content || "";
  process.stdout.write(delta);
}
```

### Error Handling

```typescript
try {
  const response = await openai.chat.completions.create({ ... });
} catch (error) {
  if (error instanceof OpenAI.APIError) {
    console.error(error.status, error.message);
  }
}
```

## Notes

- Never expose your API key in client-side code in production — proxy through a backend
- `dangerouslyAllowBrowser: true` is only acceptable for internal prototypes
- Prefer streaming for long responses to improve perceived performance
