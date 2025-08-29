# NoteFusion AI - Frontend

A modern, progressive web application for intelligent note-taking and knowledge management.

## 🌟 Features

- 📝 Rich text note-taking
- 🎙️ Audio recording and transcription
- 🌍 Multi-language support (English, Spanish, French, German)
- 🌓 Light/Dark theme with system preference detection
- 📱 Progressive Web App (PWA) support
- 🔍 Full-text search
- 📊 Analytics and usage statistics
- 🔄 Real-time sync
- 🔒 Secure authentication

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or later
- npm 8.x or later

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/notefusion-ai.git
   cd notefusion-ai/frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file based on the example
   ```bash
   cp .env.example .env
   ```
   Update the environment variables in `.env` as needed.

4. Start the development server
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`

## 🌐 Internationalization

The app supports multiple languages. To add a new language:

1. Create a new translation file in `src/locales/{lang}/translation.json`
2. Update the `i18n.js` configuration to include the new language
3. Add the language to the `LanguageSelector` component

## 📱 PWA Features

The app can be installed as a PWA on supported devices. To test PWA features:

1. Build the app for production
   ```bash
   npm run build
   ```
2. Serve the production build
   ```bash
   npx serve -s build
   ```
3. Open the app in a supported browser and look for the install prompt

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 🛠️ Build for Production

```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by the NoteFusion Team
</div>
