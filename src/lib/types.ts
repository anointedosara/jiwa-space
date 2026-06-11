export type Space = {
  _id: string;
  name: string;
  type: "Hotel" | "Apartment" | "Villa" | "Guest House";
  location: string;
  area: string;
  city: string;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  badge?: string;
  hostName: string;
  hostLogo: string;
  description: string;
  images: string[];
  amenities: string[];
  popular: boolean;
};

export type ChatMessage = { from: "me" | "them"; text: string; time: string };

export type Chat = {
  _id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  unread: number;
  time: string;
  messages: ChatMessage[];
};

export type AppNotification = {
  _id: string;
  icon: "discount" | "star" | "chat" | "heart";
  title: string;
  body: string;
  read: boolean;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  avatar?: string;
  role?: string;
  verified?: boolean;
  favourites?: string[];
};

export function formatPrice(currency: string, value: number): string {
  return `${currency}${value.toLocaleString("en-US")}`;
}
