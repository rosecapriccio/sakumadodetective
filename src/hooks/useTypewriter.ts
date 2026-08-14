import { useRef, useState } from "react";

export function useTypewriter() {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  //テキスト全文 クリック時に全文表示するために保持しておく
  const [fullText, setFullText] = useState<string>("");

  const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerTyping = (text: string) => {
    if (typingTimer.current) clearInterval(typingTimer.current);

    setFullText(text);
    setDisplayedText("");
    setIsTyping(true);

    let currentText = "";
    let currentIndex = 0;
    const textArray = Array.from(text);

    typingTimer.current = setInterval(() => {
      if (currentIndex < textArray.length) {
        currentText += textArray[currentIndex];
        setDisplayedText(currentText);
        currentIndex++;
      } else {
        setIsTyping(false);
        if (typingTimer.current) clearInterval(typingTimer.current);
      }
    }, 50);
  };

  // 文字が流れている途中にクリック：一気に全文字表示
  const skipTyping = () => {
    if (typingTimer.current) clearInterval(typingTimer.current);
    setDisplayedText(fullText);
    setIsTyping(false);
  };

  const clearText = () => setDisplayedText("");

  return {
    displayedText,
    isTyping,
    fullText,
    triggerTyping,
    skipTyping,
    clearText,
  };
}
