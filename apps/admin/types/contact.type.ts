export interface IContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
