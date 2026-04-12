import { Client } from "./client";

export interface Event {
  id: string;
  client_id: string | null;
  title: string;
  date: string;
  location: string;
  type:
    | "Casamento"
    | "Corporativo"
    | "Aniversário"
    | "Confraternização"
    | "Evento"
    | "Outro";
  status: "Agendado" | "Em andamento" | "Concluído" | "Cancelado";
  staff_count: number;
  value: number;
  notes: string;
  created_at: string;
  clients?: Client;
}
