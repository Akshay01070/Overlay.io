import type { GreetingTemplate, TemplateCategory } from "@/lib/types";

export const CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "festivals", label: "Festivals" },
  { id: "love", label: "Love" },
];

export const TEMPLATES: GreetingTemplate[] = [
  {
    id: "love-beach-01",
    title: "Sunset Romance",
    category: "love",
    isPremium: false,
    backgroundUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    quote: [
      { text: "क्या हिसाब दूँ तुम्हें अपनी चाहत का" },
      {
        text: "आज टटोला अपनी साँसों को",
        highlight: "साँसों",
        highlightColor: "#e11d48",
      },
      { text: "तो हर साँस के फासलों में तुम्हें पाया" },
    ],
  },
  {
    id: "love-rose-01",
    title: "Rose & Butterfly",
    category: "love",
    isPremium: false,
    backgroundUrl:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80",
    quote: [
      {
        text: "तू पास हो या दूर, फर्क नहीं पड़ता, तेरा ख्याल ही मेरे चेहरे पर मुस्कान ला देता है।",
      },
    ],
    signature: "— Love —",
  },
  {
    id: "birthday-01",
    title: "Birthday Wishes",
    category: "birthday",
    isPremium: false,
    backgroundUrl:
      "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80",
    quote: [{ text: "जन्मदिन की हार्दिक शुभकामनाएँ!" }],
    signature: "— Celebrate —",
  },
  {
    id: "birthday-02",
    title: "Party Lights",
    category: "birthday",
    isPremium: true,
    backgroundUrl:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    quote: [{ text: "आपके जीवन में खुशियाँ हमेशा बनी रहें।" }],
    signature: "— Birthday —",
  },
  {
    id: "anniversary-01",
    title: "Together Forever",
    category: "anniversary",
    isPremium: false,
    backgroundUrl:
      "https://images.unsplash.com/photo-1516589178581-6ec563931beb?w=800&q=80",
    quote: [{ text: "हर पल तुम्हारे साथ एक खूबसूरत याद बन जाता है।" }],
    signature: "— Anniversary —",
  },
  {
    id: "anniversary-02",
    title: "Golden Years",
    category: "anniversary",
    isPremium: true,
    backgroundUrl:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    quote: [{ text: "प्यार की यह कहानी हमेशा लिखती रहे।" }],
  },
  {
    id: "festival-diwali",
    title: "Diwali Glow",
    category: "festivals",
    isPremium: false,
    backgroundUrl:
      "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80",
    quote: [{ text: "दीपावली की हार्दिक शुभकामनाएँ!" }],
    signature: "— Shubh Deepawali —",
  },
  {
    id: "festival-holi",
    title: "Holi Colors",
    category: "festivals",
    isPremium: true,
    backgroundUrl:
      "https://images.unsplash.com/photo-1524492412937-b28c165ac877?w=800&q=80",
    quote: [{ text: "रंगों से भरी खुशियों की बहार मुबारक हो!" }],
  },
  {
    id: "love-premium-01",
    title: "Eternal Bond",
    category: "love",
    isPremium: true,
    backgroundUrl:
      "https://images.unsplash.com/photo-1518568814500-bf213f0e1b8e?w=800&q=80",
    quote: [{ text: "तुम मेरी दुनिया की सबसे खूबसूरत कहानी हो।" }],
    signature: "— Forever —",
  },
];

export function getTemplateById(id: string): GreetingTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
