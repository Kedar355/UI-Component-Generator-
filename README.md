# 🎨 UI Component Generator 🚀

> Generate beautiful UI components with AI in seconds ✨


## 🌟 Features

- 🤖 **AI-Powered Generation**: Transform text descriptions into fully functional React components
- 🎭 **Multiple Component Types**: Generate buttons, cards, forms, and more
- 🧩 **Tailwind CSS Integration**: All components use Tailwind classes for styling
- 📋 **Copy-Paste Ready Code**: Get code that works immediately in your project
- 🔄 **Real-Time Preview**: See your components come to life as you describe them
- 🔧 **Customization Options**: Fine-tune the generated components to match your needs

## 🚀 Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/Kedar355/UI-Component-Generator-.git
cd UI-Component-Generator-
```


2. **Add your OpenAI api on the 15th line of script.js**

3. **Run the HTML file Directly with Live Server**
 
## 🧠 How It Works

1. 🖊️ **Describe Your Component**: Enter a detailed description of the UI component you want to create
2. 🔍 **Review Options**: Choose from suggested component variations
3. 🔄 **Generate & Preview**: See the component rendered in real-time
4. 📝 **Copy Code**: Get the React + Tailwind CSS code to use in your project

## 🎮 Usage Examples

### Simple Button Component

Input:
```
Create a primary button with rounded corners and a hover effect
```

Output:
```jsx
function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    >
      {children}
    </button>
  );
}
```

## 📚 Available Component Types

- 🔘 Buttons (Primary, Secondary, Outline, Icon, etc.)
- 🃏 Cards (Product, Profile, Feature, etc.)
- 📝 Forms (Login, Signup, Contact, etc.)
- 📱 Modals (Alert, Confirmation, Customizable)
- 📊 Data Display (Tables, Lists, Stats)
- 🧭 Navigation (Menus, Tabs, Breadcrumbs)
- 📢 Notifications (Alerts, Toasts)


## 💡 Future Improvements

- [ ] Support for additional UI frameworks (Material UI, Chakra UI)
- [ ] Component history and favorites
- [ ] Export entire component libraries
- [ ] Theming system integration
- [ ] Interactive component editing with props panel


## 🙏 Acknowledgements

- [OpenAI](https://openai.com/) for their powerful AI models
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling components
- [Vite](https://vitejs.dev/) for the fast development environment

---

Built with ❤️ by [Kedar355](https://github.com/Kedar355)
