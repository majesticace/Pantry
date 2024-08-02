import { useEffect } from 'react';
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp } from "firebase/app";

const MyComponent = () => {
  useEffect(() => {
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
      measurementId: "YOUR_MEASUREMENT_ID"
    };

    const app = initializeApp(firebaseConfig);

    if (typeof window !== 'undefined') {
      isSupported().then(supported => {
        if (supported) {
          const analytics = getAnalytics(app);
          // Use analytics here
        }
      }).catch(console.error);
    }
  }, []);

  return <div>My Component</div>;
}

export default MyComponent;
