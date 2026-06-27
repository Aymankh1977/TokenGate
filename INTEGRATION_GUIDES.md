# TokenGate Integration Guides

Complete guides for integrating with TokenGate's AI API Gateway for all supported providers.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [OpenAI Integration](#openai-integration)
3. [Anthropic (Claude) Integration](#anthropic-claude-integration)
4. [Cohere Integration](#cohere-integration)
5. [Mistral AI Integration](#mistral-ai-integration)
6. [Together AI Integration](#together-ai-integration)
7. [Replicate Integration](#replicate-integration)
8. [Authentication](#authentication)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

---

## Getting Started

### Prerequisites

- TokenGate account (sign up at [aitokengate-92jpnneq.manus.space](https://aitokengate-92jpnneq.manus.space))
- Active token balance (purchase tokens in your dashboard)
- Generated API key (create in API Keys section of dashboard)

### Basic Setup

1. **Sign Up**: Create a TokenGate account
2. **Purchase Tokens**: Buy tokens using credit card or crypto
3. **Generate API Key**: Create an API key in your dashboard
4. **Choose Provider**: Select which AI provider you want to use
5. **Integrate**: Follow provider-specific guide below

### Authentication

All requests to TokenGate must include your API key in the Authorization header:

```bash
Authorization: Bearer YOUR_API_KEY
```

---

## OpenAI Integration

### Setup

```python
from openai import OpenAI

client = OpenAI(
    api_key="tg_your_api_key_here",
    base_url="https://aitokengate-92jpnneq.manus.space/api/gateway/openai"
)
```

### Chat Completions

```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)
```

### Token Usage

TokenGate automatically deducts tokens based on actual usage:

```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Explain quantum computing"}
    ]
)

# Tokens are automatically deducted from your balance
# Check your dashboard for usage details
```

### Supported Models

- `gpt-4o` - Latest GPT-4 Omni model
- `gpt-4-turbo` - GPT-4 Turbo
- `gpt-3.5-turbo` - GPT-3.5 Turbo
- `gpt-4-vision-preview` - GPT-4 with vision

### Pricing

| Model | Input | Output |
|-------|-------|--------|
| gpt-4o | $0.005/1K tokens | $0.015/1K tokens |
| gpt-4-turbo | $0.01/1K tokens | $0.03/1K tokens |
| gpt-3.5-turbo | $0.0005/1K tokens | $0.0015/1K tokens |

---

## Anthropic (Claude) Integration

### Setup

```python
import anthropic

client = anthropic.Anthropic(
    api_key="tg_your_api_key_here",
    base_url="https://aitokengate-92jpnneq.manus.space/api/gateway/anthropic"
)
```

### Messages API

```python
response = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello Claude!"}
    ]
)

print(response.content[0].text)
```

### Supported Models

- `claude-3-opus-20240229` - Most capable model
- `claude-3-sonnet-20240229` - Balanced model
- `claude-3-haiku-20240307` - Fast and compact model

### Pricing

| Model | Input | Output |
|-------|-------|--------|
| Claude 3 Opus | $0.015/1K tokens | $0.075/1K tokens |
| Claude 3 Sonnet | $0.003/1K tokens | $0.015/1K tokens |
| Claude 3 Haiku | $0.00025/1K tokens | $0.00125/1K tokens |

---

## Cohere Integration

### Setup

```python
import cohere

client = cohere.ClientV2(
    api_key="tg_your_api_key_here",
    base_url="https://aitokengate-92jpnneq.manus.space/api/gateway/cohere"
)
```

### Text Generation

```python
response = client.chat(
    model="command-r-plus",
    messages=[
        {"role": "user", "content": "What is machine learning?"}
    ]
)

print(response.message.content[0].text)
```

### Supported Models

- `command-r-plus` - Advanced model with RAG capabilities
- `command-r` - Balanced model
- `command` - Fast model

### Pricing

| Model | Input | Output |
|-------|-------|--------|
| Command R Plus | $0.003/1K tokens | $0.015/1K tokens |
| Command R | $0.0005/1K tokens | $0.0015/1K tokens |

---

## Mistral AI Integration

### Setup

```python
from mistralai.client import MistralClient

client = MistralClient(
    api_key="tg_your_api_key_here",
    endpoint="https://aitokengate-92jpnneq.manus.space/api/gateway/mistral"
)
```

### Chat Completions

```python
from mistralai.models.chat_message import ChatMessage

messages = [
    ChatMessage(role="user", content="Hello Mistral!")
]

response = client.chat(
    model="mistral-large-latest",
    messages=messages
)

print(response.choices[0].message.content)
```

### Supported Models

- `mistral-large-latest` - Most capable model
- `mistral-medium-latest` - Balanced model
- `mistral-small-latest` - Fast model

### Pricing

| Model | Input | Output |
|-------|-------|--------|
| Mistral Large | $0.002/1K tokens | $0.006/1K tokens |
| Mistral Medium | $0.00027/1K tokens | $0.00081/1K tokens |
| Mistral Small | $0.00014/1K tokens | $0.00042/1K tokens |

---

## Together AI Integration

### Setup

```python
import together

together.api_key = "tg_your_api_key_here"

response = together.Complete.create(
    prompt="Hello Together AI!",
    model="meta-llama/Llama-2-70b-chat-hf",
    max_tokens=512,
)
```

### Supported Models

- `meta-llama/Llama-2-70b-chat-hf` - Llama 2 70B
- `meta-llama/Llama-2-13b-chat-hf` - Llama 2 13B
- `mistralai/Mistral-7B-Instruct-v0.1` - Mistral 7B
- `NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO` - Nous Hermes 2

### Pricing

Varies by model. Check dashboard for current pricing.

---

## Replicate Integration

### Setup

```python
import replicate

replicate.api_token = "tg_your_api_key_here"

output = replicate.run(
    "stability-ai/stable-diffusion-v2:db21e45d3f7023abc9f30f5cc29eaa63",
    input={"prompt": "A beautiful sunset"}
)
```

### Supported Models

- Image generation (Stable Diffusion)
- Text generation (Llama, Mistral, etc.)
- Audio generation
- Video generation

### Pricing

Varies by model. Check dashboard for current pricing.

---

## Authentication

### API Key Format

TokenGate API keys follow this format:

```
tg_[random_string]_[random_string]
```

### Generating API Keys

1. Log in to your TokenGate dashboard
2. Navigate to "API Keys" section
3. Click "Generate New Key"
4. Copy the key (you won't see it again)
5. Store securely (use environment variables)

### Using Environment Variables

```bash
export TOKENGATE_API_KEY="tg_your_api_key_here"
```

```python
import os

api_key = os.getenv("TOKENGATE_API_KEY")
```

### Revoking API Keys

1. Log in to your TokenGate dashboard
2. Navigate to "API Keys" section
3. Find the key you want to revoke
4. Click "Revoke"
5. Confirm revocation

---

## Error Handling

### Common Errors

**401 Unauthorized**
```
Error: Invalid or missing API key
Solution: Check your API key is correct and not revoked
```

**402 Payment Required**
```
Error: Insufficient token balance
Solution: Purchase more tokens in your dashboard
```

**429 Too Many Requests**
```
Error: Rate limit exceeded
Solution: Wait before making more requests (see Rate Limiting section)
```

**500 Internal Server Error**
```
Error: Provider service unavailable
Solution: Try again later or contact support
```

### Error Response Format

```json
{
  "error": {
    "message": "Insufficient token balance",
    "code": "insufficient_balance",
    "status": 402
  }
}
```

---

## Rate Limiting

### Rate Limits

- **Free tier**: 100 requests/minute
- **Starter**: 1,000 requests/minute
- **Growth**: 5,000 requests/minute
- **Professional**: 10,000 requests/minute
- **Enterprise**: Custom limits

### Checking Rate Limit Status

Response headers include rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

### Handling Rate Limits

```python
import time
import requests

def make_request_with_retry(url, headers, data, max_retries=3):
    for attempt in range(max_retries):
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 429:
            # Rate limited, wait and retry
            wait_time = int(response.headers.get('X-RateLimit-Reset', 60))
            print(f"Rate limited. Waiting {wait_time} seconds...")
            time.sleep(wait_time)
            continue
        
        return response
    
    raise Exception("Max retries exceeded")
```

---

## Best Practices

### 1. Use Environment Variables

```python
import os
from openai import OpenAI

api_key = os.getenv("TOKENGATE_API_KEY")
client = OpenAI(
    api_key=api_key,
    base_url="https://aitokengate-92jpnneq.manus.space/api/gateway/openai"
)
```

### 2. Monitor Token Usage

```python
# Check your dashboard regularly
# Set up alerts for low balance
# Plan token purchases in advance
```

### 3. Implement Error Handling

```python
try:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Hello!"}]
    )
except Exception as e:
    print(f"Error: {e}")
    # Handle error appropriately
```

### 4. Use Streaming for Long Responses

```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Tell me a story"}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content, end="")
```

### 5. Cache Responses When Possible

```python
# Store responses to avoid duplicate API calls
cache = {}

def get_response(prompt):
    if prompt in cache:
        return cache[prompt]
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )
    
    cache[prompt] = response
    return response
```

---

## Support

For issues or questions:

- **Documentation**: [aitokengate-92jpnneq.manus.space/docs](https://aitokengate-92jpnneq.manus.space)
- **Email**: support@tokengate.com
- **Discord**: [Join our community](https://discord.gg/tokengate)
- **GitHub**: [Report issues](https://github.com/Aymankh1977/TokenGate)

---

## SDK Examples

### Python

```python
from openai import OpenAI

client = OpenAI(
    api_key="tg_your_api_key",
    base_url="https://aitokengate-92jpnneq.manus.space/api/gateway/openai"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)
```

### JavaScript/Node.js

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "tg_your_api_key",
  baseURL: "https://aitokengate-92jpnneq.manus.space/api/gateway/openai",
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(response.choices[0].message.content);
```

### cURL

```bash
curl -X POST \
  https://aitokengate-92jpnneq.manus.space/api/gateway/openai/chat/completions \
  -H "Authorization: Bearer tg_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## Troubleshooting

### Issue: "Invalid API Key"

**Solution:**
1. Check your API key is correct
2. Verify the key hasn't been revoked
3. Generate a new key if needed
4. Make sure it's in the Authorization header

### Issue: "Insufficient Token Balance"

**Solution:**
1. Log in to your dashboard
2. Check your current token balance
3. Purchase more tokens
4. Wait for purchase to complete

### Issue: "Rate Limit Exceeded"

**Solution:**
1. Wait before making more requests
2. Upgrade to a higher tier plan
3. Implement exponential backoff
4. Contact support for custom limits

### Issue: "Provider Service Unavailable"

**Solution:**
1. Check provider status page
2. Try again in a few minutes
3. Use a different provider temporarily
4. Contact support if issue persists

---

All integration guides are complete and ready to use. Start building with TokenGate today!
