import { useEffect } from 'react';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      // If script is already there, do nothing
      if (document.getElementById('google-translate-script')) {
        return;
      }

      window.googleTranslateElementInit = () => {
        if (!window.google || !window.google.translate) return;
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,mr,ta,te,bn,gu',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    addGoogleTranslateScript();
  }, []);

  return (
    <div className="google-translate-wrapper">
      <div id="google_translate_element"></div>
    </div>
  );
}
