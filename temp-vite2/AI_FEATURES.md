# AI Features in NoteFusion

This document provides an overview of the AI features available in NoteFusion and how to set them up.

## Available AI Features

1. **Text Summarization** - Generate concise summaries of your notes
2. **Text Improvement** - Get suggestions to improve your writing
3. **Tag Generation** - Automatically generate relevant tags for your notes
4. **Translation** - Translate text between different languages
5. **Idea Generation** - Generate creative ideas based on your notes

## Setup Instructions

### 1. Get an OpenAI API Key

1. Sign up at [OpenAI](https://platform.openai.com/signup)
2. Navigate to the [API Keys](https://platform.openai.com/account/api-keys) section
3. Create a new secret key

### 2. Configure Environment Variables

Create a `.env` file in the project root and add your OpenAI API key:

```env
# Required for AI features
VITE_OPENAI_API_KEY=your_api_key_here

# Optional: Specify the model (defaults to gpt-4-turbo)
VITE_OPENAI_MODEL=gpt-4-turbo
```

### 3. Install Dependencies

Make sure you have the required dependencies installed:

```bash
npm install openai
```

## Usage

### In Your Code

```typescript
import { useAI } from '@/contexts/AIContext';

function MyComponent() {
  const { generateSummary, improveText } = useAI();
  
  const handleSummarize = async (text: string) => {
    try {
      const summary = await generateSummary(text);
      console.log('Summary:', summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    }
  };
  
  // ...
}
```

### Error Handling

The AI service includes comprehensive error handling for various scenarios:

- **Missing API Key** - Clear error message with setup instructions
- **Rate Limiting** - User-friendly message when rate limits are hit
- **Network Issues** - Helpful guidance for connection problems
- **API Errors** - Specific error messages for different types of API failures

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Ensure the key is correctly set in your `.env` file
   - Verify the key has the necessary permissions
   - Check for any typos or extra spaces

2. **Rate Limiting**
   - Free tier has rate limits
   - Consider upgrading your OpenAI plan if you hit limits frequently

3. **Slow Responses**
   - The model might be experiencing high load
   - Try again in a few moments
   - Consider using a smaller model if speed is critical

## Security Considerations

- Never commit your `.env` file to version control
- Add `.env` to your `.gitignore` file
- Use environment variables for all sensitive information
- Consider implementing server-side API calls in production to keep your API key secure

## License

This project uses the OpenAI API. Please review OpenAI's [terms of service](https://openai.com/policies/terms-of-use) and [pricing](https://openai.com/pricing) before use.
