react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ──────────────────────────────────────────────────────────────
const SUPA_URL = "https://erqggxsmtlrkttukcexv.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycWdneHNtdGxya3R0dWtjZXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTk1NjYsImV4cCI6MjA5ODE5NTU2Nn0.Cc6osW8eXXJUuEOjw-rlV3I_vdPp7_bGVjBZkkCswPY";
const supabase = createClient(SUPA_URL, SUPA_KEY);

// ── Paleta ───────────────────────────────────────────────────────────────
const C = {
gold: "#B8973A",
goldLight: "#D4B35A",
goldPale: "#F5EDD8",
goldDim: "#8A6F28",
cream: "#FDFBF7",
white: "#FFFFFF",
ink: "#1C1C1A",
gray: "#7A7670",
border: "#E6DDD0",
red: "#C0392B",
redPale: "#FFF0F0",
green: "#2E7D32",
};

// ── Config — substitua pelos seus dados reais ─────────────────────────────
const WHATSAPP = "5521991721655";
const CHAVE_PIX = "21991721655";

// ── Cupons ────────────────────────────────────────────────────────────────
const COUPONS = { "GLASARE10": 10, "VIPGOLD": 15, "BEM-VINDA": 20 };

// ── Categorias e tags ─────────────────────────────────────────────────────
const CATS = ["Anéis","Brincos","Colares","Pulseiras","Tornozeleiras","Conjuntos"];
const TAGS = ["","Novo","Mais vendido","Destaque","Kit","Promoção"];
