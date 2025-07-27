# 🍪 Cooksavvy Backend

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-blue?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen?logo=mongodb)
![AI Powered](https://img.shields.io/badge/AI-Gemini%20API-yellow?logo=google)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## 🚀 Overview
Cooksavvy is a modern, AI-powered backend platform for discovering, managing, and personalizing recipes. It leverages Google Gemini AI to provide intelligent recipe search and dietary recommendations, while supporting robust user authentication, nutrition tracking, and shopping cart features.

---

## ✨ Features
- **User Authentication:** Register, login, email verification, password reset, profile management, avatar upload.
- **AI-Powered Recipe Search:**
  - Search by ingredient, diet, image, manual ingredient list, or location.
- **Recipe Management:**
  - Save favorites, view ratings, detailed nutrition info.
- **Shopping Cart:**
  - Add/remove/update ingredients, clear cart.
- **Personalization:**
  - Dietary preferences, allergy support.
- **Health Check Endpoint:**
  - For uptime monitoring and deployment checks.

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **AI Integration:** Google Gemini API
- **Email:** Nodemailer, Mailgen
- **File Uploads:** Multer
- **Other:** JWT, bcrypt, dotenv

---

## 📦 API Endpoints

### Auth (`/api/v1/auth/`)
- `POST /register` — Register a new user
- `POST /login` — Login with email/username & password
- `GET /verify` — Email verification
- `POST /resend-verification` — Resend verification email
- `GET /refresh-token` — Refresh JWT tokens
- `GET /profile` — Get user profile
- `PATCH /profile` — Update profile
- `PATCH /profile` (with image) — Upload avatar
- `POST /logout` — Logout user
- `POST /forgot-password` — Request password reset
- `POST /reset-password` — Reset password
- `POST /favourites/:recipeId` — Add recipe to favorites
- `DELETE /favourites/:recipeId` — Remove from favorites
- `GET /favourites` — List favorite recipes

### Recipes (`/api/v1/recipes/`)
- `GET /` — Fetch AI-powered recipes
- `GET /:ingredient` — Search by ingredient
- `GET /diet/:diet` — Search by diet
- `POST /ingredients/upload-image` — Search by image (upload)
- `POST /ingredients/upload-list` — Search by image of ingredient list
- `POST /ingredients/upload-manual-list` — Search by manual ingredient list
- `GET /:location` — Search by location
- `POST /cart/add` — Add ingredient to cart
- `DELETE /cart/remove/:ingredientName` — Remove from cart
- `PUT /cart/update/:ingredientName` — Update cart item quantity
- `GET /cart` — View cart
- `DELETE /cart/clear` — Clear cart

### Health Check (`/api/v1/health-check/`)
- `GET /` — Server status

---

## 🗂️ Data Models

### User
- `avatar` (url, localPath)
- `userName`, `email`, `fullName`, `password`
- `isEmailVerified`, `dietPreferences`, `allergies`
- `favouriteRecipes` (array of Recipe IDs)
- `cart` (ingredientName, quantity)
- `refreshToken`, `forgotPasswordToken`, `emailToken` (with expiry)

### Recipe
- `recipeImage`, `recipeVideoUrl`, `title`, `description`
- `ratings`, `mealType`, `cookTime`, `difficultLevel`
- `ingredients` (name, quantity)
- `nutritions` (Nutrition ID)
- `steps` (stepNumber, stepContent)
- `tags`

### Nutrition
- `energy`, `carbs`, `sugars`, `dietaryFiber`, `proteins`, `fats`, `saturatedFat`, `transFat`, `unsaturatedFat`, `cholesterol`, `sodium`, `potassium`, `calcium`, `iron`, `servingSize`, `vitamins`

---

## 🧩 Utilities & Helpers
- **API Response & Error Handlers:** Consistent JSON responses and error management.
- **Async Handler:** Simplifies async/await error handling.
- **Email Utility:** Sends verification and password reset emails.
- **AI Helpers:** Integrate with Gemini API for recipe intelligence.
- **Constants:** Dietary, allergy, and difficulty enums for validation.

---

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/cooksavvy-backend.git
   cd cooksavvy-backend/backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values (MongoDB URI, JWT secrets, Gemini API key, email credentials, etc.)
4. **Run the server:**
   ```bash
   npm start
   ```

---

## 📋 Example: Register User
```http
POST /api/v1/auth/register
Content-Type: application/json
{
  "email": "user@example.com",
  "userName": "chef123",
  "fullName": "Chef Example",
  "password": "yourpassword",
  "dietPreferences": ["vegan"],
  "allergies": ["gluten"]
}
```

---

## 🤝 Contribution
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
This project is licensed under the MIT License.
