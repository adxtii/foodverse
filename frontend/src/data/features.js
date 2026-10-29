// One entry per FoodVerse tool. Used by the home page and the navbar.
export const features = [
  { path: '/recognize', icon: '📷', title: 'Recognize', text: 'Upload a photo or short video and name every dish and ingredient.' },
  { path: '/nutrition', icon: '🥗', title: 'Nutrition', text: 'Estimated calories, protein, carbs, fats and a health score.' },
  { path: '/freshness', icon: '🍎', title: 'Freshness', text: 'Fresh, moderately fresh or spoiled, judged from color and texture.' },
  { path: '/hygiene', icon: '🧤', title: 'Hygiene', text: 'Kitchen video check for gloves, hair caps, handling and cleanliness.' },
  { path: '/cook', icon: '🍳', title: 'Cook', text: 'Recipes, steps and answers based on what you have in the kitchen.' },
  { path: '/plan', icon: '📅', title: 'Meal plan', text: 'Adaptive plans built around your body, goal and preferences.' },
  { path: '/dashboard', icon: '📊', title: 'Dashboard', text: 'Your results in one place, with alerts and plain-language insights.' },
]

export const steps = [
  { n: '01', title: 'Show it', text: 'Photo, video, voice or text. Whatever is easiest.' },
  { n: '02', title: 'Understand it', text: 'Vision and language models read what is really there.' },
  { n: '03', title: 'Act on it', text: 'Clear scores, alerts and next steps, not raw output.' },
]
