// Assets imports for dynamic paths
import campusImg from './images/campus.jpg';
import logoImg from './images/logo.svg';
import googleIconImg from './images/logo_google_g_icon.svg';

// Export all assets
export {
  campusImg,
  logoImg,
  googleIconImg
};

// Set CSS custom properties for background images
const setCSSVariables = () => {
  const root = document.documentElement;
  root.style.setProperty('--campus-image', `url(${campusImg})`);
};

// Call this function when the app loads
setCSSVariables();

export default setCSSVariables;
