# ViralHook.ai - Next.js AI Micro-SaaS Template

Thank you for purchasing ViralHook.ai! This is a premium, production-ready starter template built using a modern, scalable development stack. Follow the steps below to get the project running locally and configure it for production deployment.

## 🛠️ Project Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## 🚀 Quick Start Setup Guide

Follow these simple steps to run the application on your local machine:

### 1. Extract the Files
Unzip the project folder to your preferred workspace directory.

### 2. Install Project Dependencies
Open your terminal inside the root project directory and run the following command to download the clean project packages:
```bash
npm install
```

### 3. Run the Local Development Server
Start the local workspace environment by executing:
```bash
npm run dev
```
Once initialized, open your browser and navigate to **http://localhost:3000** to see your app live.

---

## 🔧 Production Customization Guide

### 📱 Connecting Production API Keys
The project includes a fully interactive mock layout framework. To connect your live live automation features, create a copy of the `.env.example` file, rename it to `.env.local`, and supply your custom production API environment variables:

- **AI Content Processing**: Replace the mock timeout script in `app/api/generate/route.ts` with your live OpenAI or Google Gemini SDK initialization handlers.
- **User Authentication**: Drop your production credentials into your initialization wrapper to handle user profiles natively.
- **Monetization Gate**: Swap out the mock Framer Motion modal overlay component directly inside the workspace workflow layout to link your live Stripe checkout redirect hyperlinks.

### 📦 Building for Production
To test the compilation performance or export fully optimized static production build directories, execute:
```bash
npm run build
```


React Js--->

It is java script library
it is used to make web contained applications
with react we can make SPA(single pager application)
react follows component based architecture

Why React Js--->

Because of virtual document object
easy to learn
Large community

History of react Js--->
Developed by facebook
current version is 19
after react you can easily learn react native for mobile development


Why vite react setup--->
Vite is a fast development server and build tools.
efficient production build 
simple configuration
type script support
vite supports features css pre-processor, css modules


Node modules--->
this folder contails all libraries and packages your project needs.
you never edit anything here manually
it is created automatically when you npl install


Public--->
it contains static files " images ,icons ,etc ." i.e. search directly to the browser


Scr--->
this is the main folder where you write your react code.


Assets--->
It is used to store images, fonts or other files react component use.


App.css--->
It contains css styls for your app componets


App.jsx--->
Jsx is syntax extension for java script that lets you write html like markup inside a java script.

this is your main react component. what ever user interface you build usually starts from here.
jsx(java script xml) xml(xtensible markup language)

index.css--->
global css for the whole project
apply styling fro everything


main.jss--->
the starting point of your react application
it connects reacts with the index.html file


gitignore--->
it tells git which file or folder to ignore


eslint.config.js--->
it helps maintain clean code and catch errors.


index.html--->
Main html file.
react is injected into a <div.id="root"></div> inside this file.
you rerely edit this.
