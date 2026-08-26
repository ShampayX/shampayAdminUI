export const TextToSpeak = (text: string) => {
  let utterance = new SpeechSynthesisUtterance();
  utterance.text = text;
  utterance.voice = window.speechSynthesis.getVoices()[18];
  window.speechSynthesis.speak(utterance);
};
