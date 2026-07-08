import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ──────────────────────────────────────────────────────────────
const SUPA_URL = "https://erqggxsmtlrkttukcexv.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycWdneHNtdGxya3R0dWtjZXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTk1NjYsImV4cCI6MjA5ODE5NTU2Nn0.Cc6osW8eXXJUuEOjw-rlV3I_vdPp7_bGVjBZkkCswPY";
const supabase = createClient(SUPA_URL, SUPA_KEY);

// ── Paleta ───────────────────────────────────────────────────────────────
const C = {
  gold:      "#B8973A",
  goldLight: "#D4B35A",
  goldPale:  "#F5EDD8",
  goldDim:   "#8A6F28",
  cream:     "#FDFBF7",
  white:     "#FFFFFF",
  ink:       "#1C1C1A",
  gray:      "#7A7670",
  border:    "#E6DDD0",
  red:       "#C0392B",
  redPale:   "#FFF0F0",
  green:     "#2E7D32",
};

// ── Config — substitua pelos seus dados reais ─────────────────────────────
const WHATSAPP  = "5521991721655";
const CHAVE_PIX = "21991721655";

// ── Cupons ────────────────────────────────────────────────────────────────
const COUPONS = { "GLASARE10": 10, "VIPGOLD": 15, "BEM-VINDA": 20 };

// ── Categorias e tags ─────────────────────────────────────────────────────
const CATS = ["Anéis","Brincos","Colares","Pulseiras","Tornozeleiras","Conjuntos"];
const TAGS = ["","Novo","Mais vendido","Destaque","Kit","Promoção"];

// ── Senha do admin ────────────────────────────────────────────────────────
const ADMIN_PASS = "glasare2025";

// ── Peças iniciais (seed) ─────────────────────────────────────────────────
const SEED = [
  { id:"p1",  name:"Anel Solitário",    desc:"Anel folheado 18k com zircônia central",      price:89.90,  cat:"Anéis",        tag:"Mais vendido", image:null, active:true, emoji:"💍" },
  { id:"p2",  name:"Brinco Argola",     desc:"Argola dourada 3cm, folheado 18k",            price:59.90,  cat:"Brincos",      tag:"",             image:null, active:true, emoji:"⭕" },
  { id:"p3",  name:"Colar Veneziana",   desc:"Corrente veneziana 45cm, folheado 18k",       price:79.90,  cat:"Colares",      tag:"Novo",         image:null, active:true, emoji:"📿" },
  { id:"p4",  name:"Pulseira Elo",      desc:"Elo português 18cm, folheado 18k",            price:69.90,  cat:"Pulseiras",    tag:"",             image:null, active:true, emoji:"🔗" },
  { id:"p5",  name:"Brinco Pérola",     desc:"Pérola sintética com haste dourada",          price:49.90,  cat:"Brincos",      tag:"",             image:null, active:true, emoji:"🤍" },
  { id:"p6",  name:"Anel Aparador",     desc:"Aparador liso delicado, folheado 18k",        price:45.90,  cat:"Anéis",        tag:"",             image:null, active:true, emoji:"✨" },
  { id:"p7",  name:"Colar Gota",        desc:"Pingente gota com zircônia, folheado 18k",    price:99.90,  cat:"Colares",      tag:"Destaque",     image:null, active:true, emoji:"💧" },
  { id:"p8",  name:"Tornozeleira Boho", desc:"Com berloques dourados, folheado 18k",        price:55.90,  cat:"Tornozeleiras",tag:"",             image:null, active:true, emoji:"🌸" },
  { id:"p9",  name:"Conjunto Lua",      desc:"Brinco + colar lua crescente, folheado 18k",  price:129.90, cat:"Conjuntos",    tag:"Kit",          image:null, active:true, emoji:"🌙" },
  { id:"p10", name:"Pulseira Riviera",  desc:"Zircônias coloridas, folheado 18k",           price:89.90,  cat:"Pulseiras",    tag:"Novo",         image:null, active:true, emoji:"🎀" },
  { id:"p11", name:"Brinco Ear Cuff",   desc:"Ear cuff geométrico sem furo, folheado 18k", price:39.90,  cat:"Brincos",      tag:"",             image:null, active:true, emoji:"🔺" },
  { id:"p12", name:"Colar Corrente",    desc:"Corrente grumet 50cm, folheado 18k",          price:95.90,  cat:"Colares",      tag:"",             image:null, active:true, emoji:"⛓️" },
];

const fmt = (v) => Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const EMPTY_FORM = { name:"", desc:"", price:"", cat:"Anéis", tag:"", image:null, emoji:"💎", active:true, codigo:"" };

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE RAIZ
// ═══════════════════════════════════════════════════════════════════════════
export default function GlasareApp() {
  const [mode, setMode]         = useState("loja"); // "loja" | "admin"
  const [adminAuth, setAdminAuth] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [passErr, setPassErr]   = useState(false);
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded]     = useState(false);

  useEffect(()=>{
    (async()=>{
      try {
        const { data, error } = await supabase
          .from("produtos")
          .select("*")
          .order("created_at", { ascending: true });
        if (data && data.length > 0) {
          setProducts(data.map(p => ({ ...p, desc: p.descricao })));
        } else {
          // Sem peças no banco ainda — carrega seed e salva
          const toInsert = SEED.map(p => ({
            id: p.id, name: p.name, descricao: p.desc,
            price: p.price, cat: p.cat, tag: p.tag,
            emoji: p.emoji, image: p.image, active: p.active
          }));
          await supabase.from("produtos").insert(toInsert);
          setProducts(SEED);
        }
      } catch { setProducts(SEED); }
      setTimeout(()=>setLoaded(true), 100);
    })();
  },[]);

  const persist = async (data) => {
    // não usado mais — cada operação salva direto no Supabase via Admin
  };

  const [logoClicks, setLogoClicks] = useState(0);
  const [showLogin, setShowLogin]   = useState(false);

  const enterAdmin = () => {
    if (passInput === ADMIN_PASS) { setAdminAuth(true); setMode("admin"); setPassInput(""); setPassErr(false); setShowLogin(false); }
    else { setPassErr(true); }
  };

  const handleLogoClick = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 3) { setShowLogin(true); setLogoClicks(0); }
  };

  if (!loaded) return (
    <div style={{ minHeight:"100vh", background:C.cream, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <div style={{ fontSize:24, fontWeight:700, color:C.goldDim, letterSpacing:4 }}>GLASARE</div>
      <div style={{ width:32, height:2, background:`linear-gradient(90deg,${C.goldLight},${C.gold})`, borderRadius:2 }}/>
      <div style={{ fontSize:11, color:C.gray, fontFamily:"sans-serif", letterSpacing:3 }}>carregando…</div>
    </div>
  );

  return (
    <div>
      {mode === "loja"
        ? <Loja products={products.filter(p=>p.active)} onLogoClick={handleLogoClick} />
        : <Admin products={products} setProducts={setProducts} persist={persist} />
      }

      {/* Barra de modo — só quando autenticada */}
      {adminAuth && (
        <div style={{ position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)", zIndex:999, background:C.ink, borderRadius:40, padding:"8px 6px", display:"flex", gap:4, boxShadow:"0 8px 32px rgba(0,0,0,0.25)" }}>
          {[["loja","🛍️ Loja"],["admin","⚙️ Admin"]].map(([m,l])=>(
            <button key={m} onClick={()=>setMode(m)} style={{ padding:"9px 22px", borderRadius:32, border:"none", cursor:"pointer", fontFamily:"sans-serif", fontSize:12, fontWeight:700, letterSpacing:.5, background:mode===m?`linear-gradient(135deg,${C.goldLight},${C.gold})`:"transparent", color:mode===m?C.white:C.gray, transition:"all .2s" }}>{l}</button>
          ))}
          <button onClick={()=>{setAdminAuth(false);setMode("loja");}} style={{ padding:"9px 16px", borderRadius:32, border:"none", cursor:"pointer", fontFamily:"sans-serif", fontSize:11, color:"#666", background:"transparent" }}>Sair</button>
        </div>
      )}

      {/* Modal login admin */}
      {showLogin && !adminAuth && (
        <div style={{ position:"fixed", inset:0, zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.5)" }}>
          <div style={{ background:C.white, borderRadius:16, padding:32, width:320, boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.goldDim, letterSpacing:1, marginBottom:4 }}>Área Restrita</div>
            <div style={{ fontSize:12, color:C.gray, fontFamily:"sans-serif", marginBottom:20 }}>Digite a senha para acessar o painel admin.</div>
            <input
              type="password" value={passInput}
              onChange={e=>{setPassInput(e.target.value);setPassErr(false);}}
              onKeyDown={e=>e.key==="Enter"&&enterAdmin()}
              placeholder="Senha"
              style={{ width:"100%", padding:"10px 12px", border:`1px solid ${passErr?C.red:C.border}`, borderRadius:8, fontFamily:"sans-serif", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:8 }}
            />
            {passErr && <div style={{ fontSize:11, color:C.red, fontFamily:"sans-serif", marginBottom:8 }}>Senha incorreta.</div>}
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={enterAdmin} style={{ flex:1, padding:"11px", background:`linear-gradient(135deg,${C.goldLight},${C.gold})`, color:C.white, border:"none", borderRadius:8, cursor:"pointer", fontFamily:"sans-serif", fontSize:13, fontWeight:700 }}>Entrar</button>
              <button onClick={()=>{setShowLogin(false);setPassInput("");setPassErr(false);}} style={{ flex:1, padding:"11px", background:C.white, color:C.gray, border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer", fontFamily:"sans-serif", fontSize:13 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOJA
// ═══════════════════════════════════════════════════════════════════════════
function Loja({ products, onLogoClick }) {
  const [cat, setCat]           = useState("Todos");
  const [search, setSearch]     = useState("");
  const [cart, setCart]         = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon]     = useState(null);
  const [couponErr, setCouponErr] = useState("");
  const [checkout, setCheckout] = useState(false);
  const [payMethod, setPayMethod] = useState("whatsapp");
  const [form, setForm]         = useState({ name:"", phone:"", address:"" });
  const [pix, setPix]           = useState(false);
  const [toast, setToast]       = useState(null);
  const [detail, setDetail]     = useState(null);

  // ── Registro de visita (analytics próprio via Supabase) ─────────────────
  useEffect(() => {
    const registrarVisita = async () => {
      try {
        await supabase.from('visitas').insert({
          pagina: window.location.pathname,
          origem: document.referrer || 'direto'
        });
      } catch (error) {
        console.error('Erro ao registrar visita:', error);
      }
    };
    registrarVisita();
  }, []);

  const showToast = (msg,type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),2800); };

  const allCats = ["Todos",...CATS];
  const filtered = products.filter(p => {
    const okCat = cat==="Todos" || p.cat===cat;
    const okQ   = p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
    return okCat && okQ;
  });

  const addCart = (p) => {
    setCart(c => { const ex=c.find(x=>x.id===p.id); if(ex) return c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x); return [...c,{...p,qty:1}]; });
    showToast(`${p.name} adicionado ao carrinho`);
  };
  const removeCart = (id) => setCart(c=>c.filter(x=>x.id!==id));
  const changeQty  = (id,d) => setCart(c=>c.map(x=>x.id===id?{...x,qty:Math.max(1,x.qty+d)}:x));

  const subtotal  = cart.reduce((a,x)=>a+x.price*x.qty,0);
  const discount  = coupon ? subtotal*(COUPONS[coupon]/100) : 0;
  const total     = subtotal - discount;
  const cartCount = cart.reduce((a,x)=>a+x.qty,0);

  const applyCoupon = () => {
    const k = couponInput.trim().toUpperCase();
    if(COUPONS[k]){setCoupon(k);setCouponErr("");showToast(`Cupom aplicado: ${COUPONS[k]}% de desconto! 🎉`);}
    else{setCouponErr("Cupom inválido ou expirado.");setCoupon(null);}
  };

  const cartLines = () => cart.map(x=>`• ${x.codigo ? `[${x.codigo}] ` : ""}${x.name} x${x.qty} — ${fmt(x.price * x.qty)}`).join("\n");

  const sendWhatsApp = () => {
    const msg = encodeURIComponent(`Olá, Glasare! 💛\n\nGostaria de finalizar meu pedido:\n\n${cartLines()}\n\n`+(coupon?`Cupom: ${coupon} (-${COUPONS[coupon]}%)\n`:"")+`*Total: ${fmt(total)}*\n\nNome: ${form.name}\nTelefone: ${form.phone}\nEndereço: ${form.address}`);
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`,"_blank");
    setCheckout(false); setCartOpen(false);
    showToast("Pedido enviado pelo WhatsApp! 🟢");
  };

  return (
    <div style={{ minHeight:"100vh", background:C.cream, fontFamily:"'Georgia',serif", color:C.ink, paddingBottom:80 }}>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}

      {/* HEADER */}
      <header style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64, position:"sticky", top:0, zIndex:50 }}>
        <div onClick={onLogoClick} style={{ cursor:"default", userSelect:"none" }}>
          <div style={{ fontSize:22, fontWeight:700, color:C.goldDim, letterSpacing:4, textTransform:"uppercase" }}>Glasare</div>
          <div style={{ fontSize:9, color:C.gray, letterSpacing:5, textTransform:"uppercase", marginTop:-2, fontFamily:"sans-serif" }}>Semi Joias Folheadas 18k</div>
        </div>
        <button onClick={()=>setCartOpen(true)} style={{ background:`linear-gradient(135deg,${C.goldLight},${C.gold})`, border:"none", borderRadius:24, padding:"8px 20px", color:C.white, fontFamily:"sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8, boxShadow:`0 2px 12px ${C.gold}55` }}>
          🛒 Carrinho {cartCount>0 && <span style={{ background:C.white, color:C.goldDim, borderRadius:12, padding:"1px 8px", fontSize:11, fontWeight:800 }}>{cartCount}</span>}
        </button>
      </header>

      {/* TARJA PROMOCIONAL */}
      <div style={{ background:`linear-gradient(135deg,${C.goldLight},${C.gold})`, padding:"14px 16px", textAlign:"center" }}>
        <div style={{ color:C.white, fontFamily:"sans-serif", fontWeight:800, fontSize:15, letterSpacing:1 }}>LUCRE ATÉ 300%</div>
      </div>

      {/* HERO */}
      <div style={{ background:C.white, padding:"52px 32px 44px", textAlign:"center", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:10, color:C.gold, letterSpacing:7, textTransform:"uppercase", marginBottom:18, fontFamily:"sans-serif" }}>Coleção Premium · Folheado 18k</div>
        <h1 style={{ fontSize:36, fontWeight:400, color:C.ink, margin:"0 0 10px", letterSpacing:3, lineHeight:1.3 }}>
          Brilho que expressa<br/><span style={{ fontStyle:"italic", color:C.gold }}>sua essência.</span>
        </h1>
        <div style={{ width:40, height:1, background:C.gold, margin:"20px auto" }}/>
        <p style={{ color:C.gray, fontFamily:"sans-serif", fontSize:13, margin:"0 auto 28px", maxWidth:400, lineHeight:1.9 }}>
          Peças selecionadas para mulheres que apreciam o que há de mais fino e sofisticado.
        </p>
        <div style={{ display:"flex", justifyContent:"center", gap:32, flexWrap:"wrap" }}>
          {["Folheado 18k","Alta durabilidade","Entregamos em todo o Brasil"].map(t=>(
            <span key={t} style={{ color:C.gray, fontFamily:"sans-serif", fontSize:11, letterSpacing:1.5, textTransform:"uppercase", display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ color:C.gold, fontSize:8 }}>◆</span>{t}
            </span>
          ))}
        </div>
      </div>

      {/* FILTROS */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"16px 32px", display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar peça..."
          style={{ padding:"8px 16px", border:`1px solid ${C.border}`, borderRadius:20, fontFamily:"sans-serif", fontSize:13, outline:"none", minWidth:200, background:C.cream }} />
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {allCats.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontFamily:"sans-serif", cursor:"pointer", border:`1px solid ${cat===c?C.gold:C.border}`, background:cat===c?C.goldPale:C.white, color:cat===c?C.goldDim:C.gray, fontWeight:cat===c?700:400 }}>{c}</button>
          ))}
        </div>
        <span style={{ marginLeft:"auto", fontFamily:"sans-serif", fontSize:12, color:C.gray }}>{filtered.length} peças</span>
      </div>

      {/* GRID */}
      <div style={{ padding:"32px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:24 }}>
        {filtered.length===0 && <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"48px 0", color:C.gray, fontFamily:"sans-serif" }}>Nenhuma peça encontrada.</div>}
        {filtered.map(p=>(
          <div key={p.id} style={{ background:C.white, borderRadius:12, overflow:"hidden", border:`1px solid ${C.border}`, boxShadow:"0 2px 10px rgba(0,0,0,0.05)", transition:"transform .2s,box-shadow .2s", cursor:"pointer" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.10)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,0.05)";}}>
            <div onClick={()=>setDetail(p)} style={{ height:190, background:`linear-gradient(135deg,${C.goldPale},#EEE4CC)`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
              {p.image ? <img src={p.image} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <span style={{ fontSize:62 }}>{p.emoji}</span>}
              {p.tag && <span style={{ position:"absolute", top:12, left:12, background:C.goldDim, color:C.white, fontSize:10, padding:"3px 10px", borderRadius:20, fontFamily:"sans-serif", fontWeight:700 }}>{p.tag}</span>}
            </div>
            <div style={{ padding:"16px 18px 20px" }}>
              <div style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>{p.name}</div>
              {p.codigo && <div style={{ fontSize:10, color:C.gold, fontFamily:"sans-serif", letterSpacing:1.5, textTransform:"uppercase", marginBottom:4 }}>#{p.codigo}</div>}
              <div style={{ fontSize:12, color:C.gray, fontFamily:"sans-serif", lineHeight:1.5, marginBottom:14, minHeight:32 }}>{p.desc}</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ fontSize:19, fontWeight:700, color:C.goldDim }}>{fmt(p.price)}</div>
                <button onClick={()=>addCart(p)} style={{ background:`linear-gradient(135deg,${C.goldLight},${C.gold})`, color:C.white, border:"none", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontFamily:"sans-serif", fontSize:12, fontWeight:700 }}>+ Carrinho</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DETALHE */}
      {detail && (
        <Overlay onClose={()=>setDetail(null)}>
          <div style={{ padding:28 }}>
            <div style={{ height:220, background:`linear-gradient(135deg,${C.goldPale},#EEE4CC)`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20, overflow:"hidden" }}>
              {detail.image ? <img src={detail.image} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <span style={{ fontSize:80 }}>{detail.emoji}</span>}
            </div>
            {detail.tag && <span style={{ background:C.goldDim, color:C.white, fontSize:10, padding:"3px 12px", borderRadius:20, fontFamily:"sans-serif", fontWeight:700 }}>{detail.tag}</span>}
            <div style={{ fontSize:22, fontWeight:700, margin:"12px 0 6px" }}>{detail.name}</div>
            <div style={{ fontSize:13, color:C.gray, fontFamily:"sans-serif", lineHeight:1.7, marginBottom:16 }}>{detail.desc}</div>
            <div style={{ fontSize:10, color:C.gray, fontFamily:"sans-serif", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>Categoria</div>
            <div style={{ fontSize:13, fontFamily:"sans-serif", marginBottom:20 }}>{detail.cat}</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:26, fontWeight:700, color:C.goldDim }}>{fmt(detail.price)}</div>
              <button onClick={()=>{addCart(detail);setDetail(null);}} style={{ background:`linear-gradient(135deg,${C.goldLight},${C.gold})`, color:C.white, border:"none", borderRadius:8, padding:"12px 24px", cursor:"pointer", fontFamily:"sans-serif", fontSize:14, fontWeight:700 }}>Adicionar ao Carrinho</button>
            </div>
          </div>
        </Overlay>
      )}

      {/* CARRINHO DRAWER */}
      {cartOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:200 }}>
          <div onClick={()=>setCartOpen(false)} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.45)" }}/>
          <div style={{ position:"absolute", right:0, top:0, bottom:0, width:"min(420px,100vw)", background:C.white, display:"flex", flexDirection:"column", boxShadow:"-8px 0 40px rgba(0,0,0,0.15)" }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:16, fontWeight:700, letterSpacing:1 }}>🛒 Carrinho</div>
              <button onClick={()=>setCartOpen(false)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.gray }}>×</button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"16px 24px" }}>
              {cart.length===0
                ? <div style={{ textAlign:"center", padding:"48px 0", color:C.gray, fontFamily:"sans-serif" }}><div style={{ fontSize:40, marginBottom:12 }}>🛒</div><div>Seu carrinho está vazio.</div></div>
                : cart.map(x=>(
                  <div key={x.id} style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ width:48, height:48, background:C.goldPale, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, overflow:"hidden" }}>
                      {x.image ? <img src={x.image} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : x.emoji}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700 }}>{x.name}</div>
                      {x.codigo && <div style={{ fontSize:10, color:C.gold, fontFamily:"sans-serif", letterSpacing:1 }}>#{x.codigo}</div>}
                      <div style={{ fontSize:12, color:C.gray, fontFamily:"sans-serif" }}>{fmt(x.price)} un.</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <QtyBtn onClick={()=>changeQty(x.id,-1)}>−</QtyBtn>
                      <span style={{ fontFamily:"sans-serif", fontSize:13, minWidth:18, textAlign:"center" }}>{x.qty}</span>
                      <QtyBtn onClick={()=>changeQty(x.id,+1)}>+</QtyBtn>
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.goldDim, minWidth:64, textAlign:"right" }}>{fmt(x.price*x.qty)}</div>
                    <button onClick={()=>removeCart(x.id)} style={{ background:"none", border:"none", color:C.gray, cursor:"pointer", fontSize:16 }}>✕</button>
                  </div>
                ))
              }
            </div>
            {cart.length>0 && (
              <div style={{ padding:"16px 24px", borderTop:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                  <input value={couponInput} onChange={e=>setCouponInput(e.target.value)} placeholder="Cupom de desconto"
                    style={{ flex:1, padding:"8px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"sans-serif", fontSize:12, outline:"none" }}/>
                  <button onClick={applyCoupon} style={{ padding:"8px 14px", background:C.goldPale, color:C.goldDim, border:`1px solid ${C.gold}`, borderRadius:8, cursor:"pointer", fontFamily:"sans-serif", fontSize:12, fontWeight:700 }}>Aplicar</button>
                </div>
                {couponErr && <div style={{ fontSize:11, color:C.red, fontFamily:"sans-serif", marginBottom:8 }}>{couponErr}</div>}
                {coupon && <div style={{ fontSize:11, color:C.green, fontFamily:"sans-serif", marginBottom:8, fontWeight:600 }}>✓ Cupom {coupon} aplicado — {COUPONS[coupon]}% off</div>}
                <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"sans-serif", fontSize:13, marginBottom:4 }}><span style={{ color:C.gray }}>Subtotal</span><span>{fmt(subtotal)}</span></div>
                {coupon && <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"sans-serif", fontSize:13, color:C.green, marginBottom:4 }}><span>Desconto ({COUPONS[coupon]}%)</span><span>− {fmt(discount)}</span></div>}
                <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, fontSize:16, borderTop:`1px solid ${C.border}`, paddingTop:10, marginBottom:16 }}><span>Total</span><span style={{ color:C.goldDim }}>{fmt(total)}</span></div>
                <button onClick={()=>{setCartOpen(false);setCheckout(true);}} style={{ width:"100%", padding:"14px", background:`linear-gradient(135deg,${C.goldLight},${C.gold})`, color:C.white, border:"none", borderRadius:10, cursor:"pointer", fontFamily:"sans-serif", fontSize:15, fontWeight:800, letterSpacing:.5, boxShadow:`0 4px 18px ${C.gold}55` }}>Finalizar Pedido →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT */}
      {checkout && (
        <Overlay onClose={()=>setCheckout(false)}>
          <div style={{ padding:28 }}>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:20, letterSpacing:1 }}>Finalizar Pedido</div>
            <FL label="Seu nome"><FI value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Nome completo"/></FL>
            <FL label="WhatsApp / Telefone"><FI value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="(21) 99999-9999"/></FL>
            <FL label="Endereço de entrega" mb={20}><FI value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} placeholder="Rua, número, bairro, cidade"/></FL>
            <div style={{ background:C.cream, borderRadius:8, padding:"12px 16px", marginBottom:20, fontFamily:"sans-serif", fontSize:13 }}>
              {cart.map(x=><div key={x.id} style={{ display:"flex", justifyContent:"space-between", marginBottom:4, color:C.gray }}><span>{x.name} × {x.qty}</span><span>{fmt(x.price*x.qty)}</span></div>)}
              {coupon && <div style={{ display:"flex", justifyContent:"space-between", color:C.green }}><span>Desconto</span><span>− {fmt(discount)}</span></div>}
              <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, fontSize:15, borderTop:`1px solid ${C.border}`, paddingTop:8, marginTop:8 }}><span>Total</span><span style={{ color:C.goldDim }}>{fmt(total)}</span></div>
            </div>
            <FL label="Como deseja pagar?">
              <div style={{ display:"flex", gap:10, marginTop:6 }}>
                {[["whatsapp","💬 WhatsApp"],["pix","🏦 Pix"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setPayMethod(v)} style={{ flex:1, padding:"12px 8px", borderRadius:10, fontFamily:"sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", border:`2px solid ${payMethod===v?C.gold:C.border}`, background:payMethod===v?C.goldPale:C.white, color:payMethod===v?C.goldDim:C.gray }}>{l}</button>
                ))}
              </div>
            </FL>
            <button onClick={()=>{ if(!form.name||!form.phone){showToast("Preencha nome e telefone","err");return;} payMethod==="whatsapp"?sendWhatsApp():(setPix(true),setCheckout(false)); }}
              style={{ width:"100%", padding:"14px", background:`linear-gradient(135deg,${C.goldLight},${C.gold})`, color:C.white, border:"none", borderRadius:10, cursor:"pointer", fontFamily:"sans-serif", fontSize:15, fontWeight:800, marginTop:20, boxShadow:`0 4px 18px ${C.gold}44` }}>
              {payMethod==="whatsapp"?"Enviar pelo WhatsApp 💬":"Ver dados do Pix 🏦"}
            </button>
          </div>
        </Overlay>
      )}

      {/* PIX */}
      {pix && (
        <Overlay onClose={()=>{setPix(false);setCart([]);setCoupon(null);setCouponInput("");}}>
          <div style={{ padding:32, textAlign:"center" }}>
            <div style={{ fontSize:52, marginBottom:12 }}>🏦</div>
            <div style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>Pague via Pix</div>
            <div style={{ background:"#FFF8E1", border:"1px solid #F9A825", borderRadius:8, padding:"12px 16px", marginBottom:16, fontFamily:"sans-serif", fontSize:13, color:"#5D4037", lineHeight:1.7 }}>
              ⚠️ <strong>Atenção:</strong> Seu pedido só será confirmado após o envio e verificação do comprovante de pagamento pelo WhatsApp.
            </div>
            <div style={{ fontSize:13, color:C.gray, fontFamily:"sans-serif", marginBottom:16, lineHeight:1.6 }}>
              1. Copie a chave Pix abaixo<br/>
              2. Faça o pagamento no seu banco<br/>
              3. Envie o comprovante pelo WhatsApp<br/>
              4. Aguarde a confirmação da Glasare
            </div>
            <div style={{ background:C.cream, border:`1px solid ${C.border}`, borderRadius:8, padding:"14px 20px", fontFamily:"monospace", fontSize:15, letterSpacing:.5, marginBottom:8, userSelect:"all" }}>{CHAVE_PIX}</div>
            <div style={{ fontSize:11, color:C.gray, fontFamily:"sans-serif", marginBottom:8 }}>Chave Pix — Telefone</div>
            <div style={{ fontSize:24, fontWeight:800, color:C.goldDim, margin:"12px 0 20px" }}>{fmt(total)}</div>
            <button onClick={()=>{ const msg=encodeURIComponent(`Olá, Glasare! 💛\n\nRealizei o pagamento via Pix e gostaria de enviar o comprovante para confirmar meu pedido.\n\n${cartLines()}\n\n*Total: ${fmt(total)}*\n\nNome: ${form.name}\nTelefone: ${form.phone}`); window.open(`https://wa.me/${WHATSAPP}?text=${msg}`,"_blank"); setPix(false);setCart([]);setCoupon(null);setCouponInput(""); }}
              style={{ width:"100%", padding:"13px", background:"#25D366", color:C.white, border:"none", borderRadius:10, cursor:"pointer", fontFamily:"sans-serif", fontSize:14, fontWeight:800 }}>
              Enviar comprovante pelo WhatsApp 💬
            </button>
            <div style={{ fontSize:11, color:C.gray, fontFamily:"sans-serif", marginTop:12, lineHeight:1.6 }}>
              Seu pedido será confirmado após verificação do pagamento.
            </div>
          </div>
        </Overlay>
      )}

      <div style={{ textAlign:"center", padding:"32px 0 40px", borderTop:`1px solid ${C.border}`, color:C.gray, fontFamily:"sans-serif", fontSize:12, letterSpacing:1 }}>
        © 2025 Glasare · Semi Joias Folheadas 18k · Rio de Janeiro
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════════════════════
function Admin({ products, setProducts, persist }) {
  const [tab, setTab]             = useState("produtos"); // produtos | estoque | consultoras | locais | visitas
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [filterCat, setFilterCat] = useState("Todos");
  const [search, setSearch]       = useState("");
  const [toast, setToast]         = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const fileRef = useRef();

  const showToast = (msg,type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),2800); };

  const openNew  = () => { setForm({...EMPTY_FORM}); setModal("new"); };
  const openEdit = (p) => { setForm({...p, price:String(p.price).replace(".",",")}); setModal(p.id); };
  const closeModal = () => { setModal(null); setForm(EMPTY_FORM); };

  const handleImage = (e) => {
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=ev=>setForm(d=>({...d,image:ev.target.result})); r.readAsDataURL(f);
  };

  const saveProduct = async () => {
    if(!form.name.trim()){showToast("Informe o nome da peça","err");return;}
    const priceNum=parseFloat(String(form.price).replace(",","."));
    if(isNaN(priceNum)||priceNum<=0){showToast("Informe um valor válido","err");return;}

    showToast("Salvando...", "ok");

    let imageUrl = form.image;
    if (form.image && form.image.startsWith("data:")) {
      try {
        const base64 = form.image.split(",")[1];
        const byteArr = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const fileName = `produto-${Date.now()}.jpg`;
        const { data: upData, error: upErr } = await supabase.storage
          .from("produtos-imagens")
          .upload(fileName, byteArr, { contentType: "image/jpeg", upsert: true });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from("produtos-imagens").getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      } catch(e) { imageUrl = null; }
    }

    const row = {
      name: form.name,
      descricao: form.desc,
      price: priceNum,
      cat: form.cat,
      tag: form.tag,
      emoji: form.emoji || "💎",
      image: imageUrl,
      active: form.active,
      codigo: form.codigo || ""
    };

    let updated;
    let newId = modal;
    if(modal==="new"){
      const { data, error } = await supabase.from("produtos").insert([row]).select();
      if (error) { showToast("Erro ao salvar. Tente novamente.", "err"); return; }
      const nova = data?.[0] ? { ...data[0], desc: data[0].descricao } : { ...row, desc:form.desc, id:"p"+Date.now() };
      newId = nova.id;
      updated = [...products, nova];
      showToast("Peça cadastrada!");
    } else {
      const { error } = await supabase.from("produtos").update(row).eq("id", modal);
      if (error) { showToast("Erro ao atualizar. Tente novamente.", "err"); return; }
      updated = products.map(p => p.id===modal ? {...p,...row, desc:form.desc, price:priceNum} : p);
      showToast("Peça atualizada!");
    }
    setProducts(updated);
    closeModal();
  };

  const toggleActive = async (id) => {
    const p = products.find(x=>x.id===id);
    await supabase.from("produtos").update({ active: !p.active }).eq("id", id);
    const updated=products.map(p=>p.id===id?{...p,active:!p.active}:p);
    setProducts(updated);
  };

  const deleteProduct = async (id) => {
    await supabase.from("produtos").delete().eq("id", id);
    const updated=products.filter(p=>p.id!==id);
    setProducts(updated); setConfirmDel(null); showToast("Peça removida.");
  };

  const filtered=products.filter(p=>{
    const okCat=filterCat==="Todos"||p.cat===filterCat;
    const okQ=p.name.toLowerCase().includes(search.toLowerCase());
    return okCat&&okQ;
  });

  const ativos=products.filter(p=>p.active).length;

  const TABS = [
    ["produtos","💎 Peças"],
    ["estoque","📦 Estoque"],
    ["consultoras","🤝 Consultoras"],
    ["locais","📍 Locais"],
    ["visitas","📊 Visitas"],
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.cream, fontFamily:"'Georgia',serif", color:C.ink, paddingBottom:80 }}>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}

      {/* HEADER */}
      <header style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:C.goldDim, letterSpacing:4, textTransform:"uppercase" }}>Glasare</div>
          <div style={{ fontSize:9, color:C.gray, letterSpacing:4, textTransform:"uppercase", marginTop:-2, fontFamily:"sans-serif" }}>Painel Admin</div>
        </div>
        {tab==="produtos" && (
          <button onClick={openNew} style={{ background:`linear-gradient(135deg,${C.goldLight},${C.gold})`, color:C.white, border:"none", borderRadius:8, padding:"10px 22px", cursor:"pointer", fontFamily:"sans-serif", fontSize:13, fontWeight:700, boxShadow:`0 2px 12px ${C.gold}44` }}>+ Nova Peça</button>
        )}
      </header>

      {/* SUB-NAVEGAÇÃO */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"12px 32px", display:"flex", gap:8, flexWrap:"wrap" }}>
        {TABS.map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"8px 18px", borderRadius:20, fontSize:12, fontFamily:"sans-serif", cursor:"pointer", border:`1px solid ${tab===t?C.gold:C.border}`, background:tab===t?C.goldPale:C.white, color:tab===t?C.goldDim:C.gray, fontWeight:tab===t?700:400 }}>{l}</button>
        ))}
      </div>

      {tab==="produtos" && (
        <>
          {/* RESUMO */}
          <div style={{ padding:"24px 32px 0", display:"flex", gap:16, flexWrap:"wrap" }}>
            {[{label:"Total de peças",value:products.length,icon:"💎"},{label:"Ativas na loja",value:ativos,icon:"✅"},{label:"Inativas",value:products.length-ativos,icon:"⏸️"}].map(s=>(
              <div key={s.label} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 24px", minWidth:140, flex:1 }}>
                <div style={{ fontSize:22 }}>{s.icon}</div>
                <div style={{ fontSize:28, fontWeight:700, color:C.goldDim, marginTop:4 }}>{s.value}</div>
                <div style={{ fontSize:11, color:C.gray, fontFamily:"sans-serif", letterSpacing:1, textTransform:"uppercase", marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* FILTROS */}
          <div style={{ padding:"20px 32px", display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar peça..."
              style={{ padding:"8px 16px", border:`1px solid ${C.border}`, borderRadius:20, fontFamily:"sans-serif", fontSize:13, outline:"none", minWidth:200, background:C.white }}/>
            {["Todos",...CATS].map(c=>(
              <button key={c} onClick={()=>setFilterCat(c)} style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontFamily:"sans-serif", cursor:"pointer", border:`1px solid ${filterCat===c?C.gold:C.border}`, background:filterCat===c?C.goldPale:C.white, color:filterCat===c?C.goldDim:C.gray, fontWeight:filterCat===c?700:400 }}>{c}</button>
            ))}
            <span style={{ marginLeft:"auto", fontFamily:"sans-serif", fontSize:12, color:C.gray }}>{filtered.length} peças</span>
          </div>

          {/* LISTA */}
          <div style={{ padding:"0 32px 48px" }}>
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"56px 1fr 110px 90px 90px 80px 130px", padding:"10px 20px", background:C.cream, borderBottom:`1px solid ${C.border}` }}>
                {["Foto","Peça","Categoria","Preço","Tag","Status","Ações"].map(h=>(
                  <div key={h} style={{ fontSize:10, color:C.gray, fontFamily:"sans-serif", letterSpacing:1.5, textTransform:"uppercase", fontWeight:600 }}>{h}</div>
                ))}
              </div>
              {filtered.length===0 && <div style={{ padding:40, textAlign:"center", color:C.gray, fontFamily:"sans-serif", fontSize:13 }}>Nenhuma peça encontrada.</div>}
              {filtered.map((p,i)=>(
                <div key={p.id} style={{ display:"grid", gridTemplateColumns:"56px 1fr 110px 90px 90px 80px 130px", alignItems:"center", padding:"14px 20px", borderBottom:i<filtered.length-1?`1px solid ${C.border}`:"none", background:p.active?C.white:"#FAFAF8", opacity:p.active?1:0.6 }}>
                  <div style={{ width:42, height:42, borderRadius:8, background:C.goldPale, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", fontSize:20 }}>
                    {p.image?<img src={p.image} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>:p.emoji||"💎"}
                  </div>
                  <div style={{ paddingRight:12 }}>
                    <div style={{ fontSize:14, fontWeight:700, marginBottom:2 }}>{p.name}</div>
                    {p.codigo && <div style={{ fontSize:10, color:C.gold, fontFamily:"sans-serif", letterSpacing:1, marginBottom:2 }}>#{p.codigo}</div>}
                    <div style={{ fontSize:11, color:C.gray, fontFamily:"sans-serif", lineHeight:1.4 }}>{p.desc || p.descricao}</div>
                  </div>
                  <div style={{ fontSize:12, color:C.gray, fontFamily:"sans-serif" }}>{p.cat}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.goldDim }}>{fmt(p.price)}</div>
                  <div>{p.tag?<span style={{ background:C.goldPale, color:C.goldDim, fontSize:10, padding:"3px 10px", borderRadius:20, fontFamily:"sans-serif", fontWeight:700 }}>{p.tag}</span>:<span style={{ color:C.border }}>—</span>}</div>
                  <div>
                    <button onClick={()=>toggleActive(p.id)} style={{ background:p.active?"#E8F5E9":C.redPale, color:p.active?C.green:C.red, border:`1px solid ${p.active?"#A5D6A7":"#FFCDD2"}`, borderRadius:20, padding:"4px 12px", fontSize:10, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>
                      {p.active?"Ativa":"Inativa"}
                    </button>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={()=>openEdit(p)} style={{ padding:"6px 12px", background:C.goldPale, color:C.goldDim, border:`1px solid ${C.gold}`, borderRadius:6, cursor:"pointer", fontFamily:"sans-serif", fontSize:11, fontWeight:700 }}>✏️ Editar</button>
                    <button onClick={()=>setConfirmDel(p.id)} style={{ padding:"6px 10px", background:C.redPale, color:C.red, border:`1px solid #FFCDD2`, borderRadius:6, cursor:"pointer", fontFamily:"sans-serif", fontSize:11 }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab==="estoque" && <EstoqueTab products={products} showToast={showToast} />}
      {tab==="consultoras" && <ConsultorasTab showToast={showToast} />}
      {tab==="locais" && <LocaisTab showToast={showToast} />}
      {tab==="visitas" && <VisitasTab />}

      {/* MODAL PEÇA */}
      {modal && (
        <Overlay onClose={closeModal}>
          <div style={{ padding:"28px 32px" }}>
            <div style={{ fontSize:17, fontWeight:700, color:C.goldDim, letterSpacing:1, marginBottom:22 }}>{modal==="new"?"Nova Peça":"Editar Peça"}</div>
            <div onClick={()=>fileRef.current?.click()} style={{ width:"100%", height:160, background:`linear-gradient(135deg,${C.goldPale},#EEE4CC)`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", marginBottom:18, overflow:"hidden", border:`2px dashed ${C.gold}` }}>
              {form.image?<img src={form.image} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>:<div style={{ textAlign:"center" }}><div style={{ fontSize:36 }}>{form.emoji||"📷"}</div><div style={{ fontSize:12, color:C.goldDim, fontFamily:"sans-serif", marginTop:6, fontWeight:600 }}>Clique para adicionar foto</div></div>}
            </div>
            <input type="file" accept="image/*" ref={fileRef} onChange={handleImage} style={{ display:"none" }}/>
            <FL label="Nome da peça *"><FI value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Anel Solitário"/></FL>
            <FL label="Código da peça">
              <FI value={form.codigo||""} onChange={e=>setForm(f=>({...f,codigo:e.target.value.toUpperCase()}))} placeholder="Ex: AN001, BR002, CO003"/>
            </FL>
            <FL label="Descrição">
              <textarea value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="Breve descrição" rows={2}
                style={{ width:"100%", padding:"9px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"sans-serif", fontSize:13, resize:"none", boxSizing:"border-box", outline:"none" }}/>
            </FL>
            <div style={{ display:"flex", gap:12, marginBottom:14 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:C.gray, fontFamily:"sans-serif", letterSpacing:1.5, textTransform:"uppercase", marginBottom:6, fontWeight:600 }}>Preço (R$) *</div>
                <FI value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="89,90"/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:C.gray, fontFamily:"sans-serif", letterSpacing:1.5, textTransform:"uppercase", marginBottom:6, fontWeight:600 }}>Categoria</div>
                <select value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))} style={{ width:"100%", padding:"9px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"sans-serif", fontSize:13, outline:"none", background:C.white }}>
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:C.gray, fontFamily:"sans-serif", letterSpacing:1.5, textTransform:"uppercase", marginBottom:6, fontWeight:600 }}>Tag</div>
                <select value={form.tag} onChange={e=>setForm(f=>({...f,tag:e.target.value}))} style={{ width:"100%", padding:"9px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"sans-serif", fontSize:13, outline:"none", background:C.white }}>
                  {TAGS.map(t=><option key={t} value={t}>{t||"— sem tag"}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
              <button onClick={()=>setForm(f=>({...f,active:!f.active}))} style={{ width:44, height:24, borderRadius:12, border:"none", cursor:"pointer", position:"relative", background:form.active?C.gold:C.border, transition:"background .2s" }}>
                <div style={{ width:18, height:18, background:C.white, borderRadius:9, position:"absolute", top:3, left:form.active?23:3, transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,.2)" }}/>
              </button>
              <span style={{ fontFamily:"sans-serif", fontSize:13, color:C.gray }}>{form.active?"Peça ativa na loja":"Peça inativa (não aparece na loja)"}</span>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={saveProduct} style={{ flex:1, padding:"13px", background:`linear-gradient(135deg,${C.goldLight},${C.gold})`, color:C.white, border:"none", borderRadius:10, cursor:"pointer", fontFamily:"sans-serif", fontSize:14, fontWeight:800 }}>{modal==="new"?"Cadastrar Peça":"Salvar Alterações"}</button>
              <button onClick={closeModal} style={{ flex:1, padding:"13px", background:C.white, color:C.gray, border:`1px solid ${C.border}`, borderRadius:10, cursor:"pointer", fontFamily:"sans-serif", fontSize:14 }}>Cancelar</button>
            </div>
          </div>
        </Overlay>
      )}

      {/* CONFIRMAR EXCLUSÃO */}
      {confirmDel && (
        <Overlay onClose={()=>setConfirmDel(null)}>
          <div style={{ padding:32, textAlign:"center" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>🗑️</div>
            <div style={{ fontSize:17, fontWeight:700, marginBottom:8 }}>Remover esta peça?</div>
            <div style={{ fontSize:13, color:C.gray, fontFamily:"sans-serif", marginBottom:24 }}>Ela será removida da loja. Não é possível desfazer.</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>deleteProduct(confirmDel)} style={{ flex:1, padding:"12px", background:C.red, color:C.white, border:"none", borderRadius:8, cursor:"pointer", fontFamily:"sans-serif", fontSize:14, fontWeight:700 }}>Remover</button>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1, padding:"12px", background:C.white, color:C.gray, border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer", fontFamily:"sans-serif", fontSize:14 }}>Cancelar</button>
            </div>
          </div>
        </Overlay>
      )}
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VISITAS (analytics próprio)
// ═══════════════════════════════════════════════════════════════════════════
function VisitasTab() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("visitas")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(2000);
    setVisitas(data || []);
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const seteDiasAtras = new Date(hoje); seteDiasAtras.setDate(seteDiasAtras.getDate()-6);

  const totalVisitas = visitas.length;
  const visitasHoje = visitas.filter(v => new Date(v.criado_em) >= hoje).length;

  // Agrupa por dia (últimos 7 dias)
  const porDia = [];
  for (let i=6; i>=0; i--) {
    const dia = new Date(hoje); dia.setDate(dia.getDate()-i);
    const diaFim = new Date(dia); diaFim.setDate(diaFim.getDate()+1);
    const count = visitas.filter(v => { const d=new Date(v.criado_em); return d>=dia && d<diaFim; }).length;
    porDia.push({ label: dia.toLocaleDateString("pt-BR",{ day:"2-digit", month:"2-digit" }), count });
  }
  const maxDia = Math.max(1, ...porDia.map(d=>d.count));

  // Agrupa por origem
  const origemMap = {};
  visitas.forEach(v => {
    let origem = v.origem || "direto";
    if (origem.includes("instagram")) origem = "Instagram";
    else if (origem.includes("whatsapp") || origem.includes("wa.me")) origem = "WhatsApp";
    else if (origem.includes("facebook")) origem = "Facebook";
    else if (origem === "direto" || origem === "") origem = "Direto / Link";
    else { try { origem = new URL(origem).hostname; } catch { origem = "Outro"; } }
    origemMap[origem] = (origemMap[origem]||0)+1;
  });
  const origens = Object.entries(origemMap).sort((a,b)=>b[1]-a[1]);

  return (
    <div style={{ padding:"24px 32px 48px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ fontSize:15, fontWeight:700, color:C.goldDim }}>Visitas ao site</div>
        <button onClick={load} style={{ background:C.white, color:C.goldDim, border:`1px solid ${C.gold}`, borderRadius:8, padding:"8px 16px", cursor:"pointer", fontFamily:"sans-serif", fontSize:12, fontWeight:700 }}>↻ Atualizar</button>
      </div>

      {loading ? (
        <div style={{ padding:24, textAlign:"center", color:C.gray, fontFamily:"sans-serif" }}>Carregando...</div>
      ) : (
        <>
          {/* RESUMO */}
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:24 }}>
            {[{label:"Visitas hoje", value:visitasHoje, icon:"📅"},{label:"Total registrado", value:totalVisitas, icon:"👀"}].map(s=>(
              <div key={s.label} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 24px", minWidth:160, flex:1 }}>
                <div style={{ fontSize:22 }}>{s.icon}</div>
                <div style={{ fontSize:28, fontWeight:700, color:C.goldDim, marginTop:4 }}>{s.value}</div>
                <div style={{ fontSize:11, color:C.gray, fontFamily:"sans-serif", letterSpacing:1, textTransform:"uppercase", marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* GRÁFICO DE BARRAS — ÚLTIMOS 7 DIAS */}
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 24px", marginBottom:24 }}>
            <div style={{ fontSize:12, color:C.gray, fontFamily:"sans-serif", letterSpacing:1, textTransform:"uppercase", marginBottom:16, fontWeight:600 }}>Últimos 7 dias</div>
            <div style={{ display:"flex", alignItems:"flex-end", gap:12, height:140 }}>
              {porDia.map(d=>(
                <div key={d.label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                  <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.goldDim, fontWeight:700 }}>{d.count}</div>
                  <div style={{ width:"100%", maxWidth:36, height:Math.max(4,(d.count/maxDia)*100), background:`linear-gradient(180deg,${C.goldLight},${C.gold})`, borderRadius:"6px 6px 0 0" }}/>
                  <div style={{ fontSize:10, fontFamily:"sans-serif", color:C.gray }}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ORIGEM */}
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 24px" }}>
            <div style={{ fontSize:12, color:C.gray, fontFamily:"sans-serif", letterSpacing:1, textTransform:"uppercase", marginBottom:16, fontWeight:600 }}>De onde vieram</div>
            {origens.length===0 && <div style={{ color:C.gray, fontFamily:"sans-serif", fontSize:13 }}>Ainda não há dados suficientes.</div>}
            {origens.map(([origem,count])=>(
              <div key={origem} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                <div style={{ width:110, fontSize:12, fontFamily:"sans-serif", color:C.ink }}>{origem}</div>
                <div style={{ flex:1, background:C.cream, borderRadius:6, overflow:"hidden", height:16 }}>
                  <div style={{ width:`${(count/totalVisitas)*100}%`, height:"100%", background:`linear-gradient(90deg,${C.goldLight},${C.gold})` }}/>
                </div>
                <div style={{ fontSize:12, fontFamily:"sans-serif", fontWeight:700, color:C.goldDim, minWidth:30, textAlign:"right" }}>{count}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCAIS (estoque geral + expositores)
// ═══════════════════════════════════════════════════════════════════════════
function LocaisTab({ showToast }) {
  const [locais, setLocais]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState({ nome:"", tipo:"expositor", endereco:"" });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("locais").select("*").order("created_at",{ascending:true});
    setLocais(data||[]);
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const salvar = async () => {
    if(!form.nome.trim()){ showToast("Informe o nome do local","err"); return; }
    const { error } = await supabase.from("locais").insert([{ nome:form.nome, tipo:form.tipo, endereco:form.endereco }]);
    if(error){ showToast("Erro ao criar local","err"); return; }
    showToast("Local criado!");
    setForm({ nome:"", tipo:"expositor", endereco:"" });
    setShowForm(false);
    load();
  };

  const toggleAtivo = async (l) => {
    await supabase.from("locais").update({ ativo: !l.ativo }).eq("id", l.id);
    load();
  };

  return (
    <div style={{ padding:"24px 32px 48px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ fontSize:15, fontWeight:700, color:C.goldDim }}>Locais e expositores</div>
        <button onClick={()=>setShowForm(s=>!s)} style={{ background:`linear-gradient(135deg,${C.goldLight},${C.gold})`, color:C.white, border:"none", borderRadius:8, padding:"9px 18px", cursor:"pointer", fontFamily:"sans-serif", fontSize:12, fontWeight:700 }}>
          {showForm ? "Cancelar" : "+ Novo Local"}
        </button>
      </div>

      {showForm && (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:20 }}>
          <FL label="Nome do local *"><FI value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Ex: Farmácia Vida Bela"/></FL>
          <FL label="Endereço"><FI value={form.endereco} onChange={e=>setForm(f=>({...f,endereco:e.target.value}))} placeholder="Rua, número, bairro"/></FL>
          <button onClick={salvar} style={{ padding:"11px 20px", background:`linear-gradient(135deg,${C.goldLight},${C.gold})`, color:C.white, border:"none", borderRadius:8, cursor:"pointer", fontFamily:"sans-serif", fontSize:13, fontWeight:700 }}>Salvar Local</button>
        </div>
      )}

      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
        {loading && <div style={{ padding:24, textAlign:"center", color:C.gray, fontFamily:"sans-serif" }}>Carregando...</div>}
        {!loading && locais.length===0 && <div style={{ padding:24, textAlign:"center", color:C.gray, fontFamily:"sans-serif" }}>Nenhum local cadastrado ainda.</div>}
        {locais.map((l,i)=>(
          <div key={l.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:i<locais.length-1?`1px solid ${C.border}`:"none" }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700 }}>{l.nome} {l.tipo==="geral" && <span style={{ fontSize:10, color:C.gold, fontFamily:"sans-serif" }}>(estoque geral)</span>}</div>
              {l.endereco && <div style={{ fontSize:11, color:C.gray, fontFamily:"sans-serif" }}>{l.endereco}</div>}
            </div>
            {l.tipo!=="geral" && (
              <button onClick={()=>toggleAtivo(l)} style={{ background:l.ativo?"#E8F5E9":C.redPale, color:l.ativo?C.green:C.red, border:`1px solid ${l.ativo?"#A5D6A7":"#FFCDD2"}`, borderRadius:20, padding:"4px 12px", fontSize:10, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>
                {l.ativo?"Ativo":"Inativo"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSULTORAS
// ═══════════════════════════════════════════════════════════════════════════
function ConsultorasTab({ showToast }) {
  const [lista, setLista]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState({ nome:"", telefone:"", codigo:"", comissao_percent:"20" });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("consultoras").select("*").order("created_at",{ascending:true});
    setLista(data||[]);
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const salvar = async () => {
    if(!form.nome.trim()){ showToast("Informe o nome da consultora","err"); return; }
    if(!form.codigo.trim()){ showToast("Informe o código pessoal","err"); return; }
    const { error } = await supabase.from("consultoras").insert([{
      nome: form.nome,
      telefone: form.telefone,
      codigo: form.codigo.trim().toUpperCase(),
      comissao_percent: parseFloat(form.comissao_percent)||20
    }]);
    if(error){
      if(String(error.message).includes("duplicate")) showToast("Já existe uma consultora com esse código","err");
      else showToast("Erro ao salvar consultora","err");
      return;
    }
    showToast("Consultora cadastrada!");
    setForm({ nome:"", telefone:"", codigo:"", comissao_percent:"20" });
    setShowForm(false);
    load();
  };

  const toggleAtiva = async (c) => {
    await supabase.from("consultoras").update({ ativa: !c.ativa }).eq("id", c.id);
    load();
  };

  return (
    <div style={{ padding:"24px 32px 48px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ fontSize:15, fontWeight:700, color:C.goldDim }}>Consultoras digitais</div>
        <button onClick={()=>setShowForm(s=>!s)} style={{ background:`linear-gradient(135deg,${C.goldLight},${C.gold})`, color:C.white, border:"none", borderRadius:8, padding:"9px 18px", cursor:"pointer", fontFamily:"sans-serif", fontSize:12, fontWeight:700 }}>
          {showForm ? "Cancelar" : "+ Nova Consultora"}
        </button>
      </div>

      {showForm && (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:20 }}>
          <FL label="Nome *"><FI value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Ex: Maria Silva"/></FL>
          <FL label="WhatsApp / Telefone"><FI value={form.telefone} onChange={e=>setForm(f=>({...f,telefone:e.target.value}))} placeholder="(21) 99999-9999"/></FL>
          <div style={{ display:"flex", gap:12 }}>
            <div style={{ flex:1 }}>
              <FL label="Código pessoal *"><FI value={form.codigo} onChange={e=>setForm(f=>({...f,codigo:e.target.value.toUpperCase()}))} placeholder="Ex: MARIA10"/></FL>
            </div>
            <div style={{ flex:1 }}>
              <FL label="Comissão (%)"><FI value={form.comissao_percent} onChange={e=>setForm(f=>({...f,comissao_percent:e.target.value}))} placeholder="20"/></FL>
            </div>
          </div>
          <button onClick={salvar} style={{ padding:"11px 20px", background:`linear-gradient(135deg,${C.goldLight},${C.gold})`, color:C.white, border:"none", borderRadius:8, cursor:"pointer", fontFamily:"sans-serif", fontSize:13, fontWeight:700 }}>Salvar Consultora</button>
        </div>
      )}

      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
        {loading && <div style={{ padding:24, textAlign:"center", color:C.gray, fontFamily:"sans-serif" }}>Carregando...</div>}
        {!loading && lista.length===0 && <div style={{ padding:24, textAlign:"center", color:C.gray, fontFamily:"sans-serif" }}>Nenhuma consultora cadastrada ainda.</div>}
        {lista.map((c,i)=>(
          <div key={c.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:i<lista.length-1?`1px solid ${C.border}`:"none" }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700 }}>{c.nome}</div>
              <div style={{ fontSize:11, color:C.gold, fontFamily:"sans-serif", letterSpacing:1 }}>Código: {c.codigo} · Comissão: {c.comissao_percent}%</div>
              {c.telefone && <div style={{ fontSize:11, color:C.gray, fontFamily:"sans-serif" }}>{c.telefone}</div>}
            </div>
            <button onClick={()=>toggleAtiva(c)} style={{ background:c.ativa?"#E8F5E9":C.redPale, color:c.ativa?C.green:C.red, border:`1px solid ${c.ativa?"#A5D6A7":"#FFCDD2"}`, borderRadius:20, padding:"4px 12px", fontSize:10, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>
              {c.ativa?"Ativa":"Inativa"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ESTOQUE POR LOCAL + TRANSFERÊNCIAS
// ═══════════════════════════════════════════════════════════════════════════
function EstoqueTab({ products, showToast }) {
  const [locais, setLocais]       = useState([]);
  const [estoque, setEstoque]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ produto_id:"", origem_id:"", destino_id:"", quantidade:"1" });

  const load = async () => {
    setLoading(true);
    const [{ data: l }, { data: e }] = await Promise.all([
      supabase.from("locais").select("*").order("created_at",{ascending:true}),
      supabase.from("estoque_local").select("*"),
    ]);
    setLocais(l||[]);
    setEstoque(e||[]);
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const qtyEm = (produtoId, localId) => {
    const row = estoque.find(x=>x.produto_id===produtoId && x.local_id===localId);
    return row ? row.quantidade : 0;
  };

  const geral = locais.find(l=>l.tipo==="geral");
  const expositores = locais.filter(l=>l.tipo!=="geral");

  const transferir = async () => {
    const { produto_id, origem_id, destino_id, quantidade } = form;
    const qtd = parseInt(quantidade);
    if(!produto_id || !origem_id || !destino_id){ showToast("Preencha peça, origem e destino","err"); return; }
    if(origem_id===destino_id){ showToast("Origem e destino devem ser diferentes","err"); return; }
    if(!qtd || qtd<=0){ showToast("Informe uma quantidade válida","err"); return; }

    const disponivel = qtyEm(produto_id, origem_id);
    if(qtd > disponivel){ showToast(`Só há ${disponivel} unidade(s) disponível(is) na origem`,"err"); return; }

    const origemRow = estoque.find(x=>x.produto_id===produto_id && x.local_id===origem_id);
    if(origemRow){
      await supabase.from("estoque_local").update({ quantidade: origemRow.quantidade - qtd }).eq("id", origemRow.id);
    }
    const destinoRow = estoque.find(x=>x.produto_id===produto_id && x.local_id===destino_id);
    if(destinoRow){
      await supabase.from("estoque_local").update({ quantidade: destinoRow.quantidade + qtd }).eq("id", destinoRow.id);
    } else {
      await supabase.from("estoque_local").insert([{ produto_id, local_id:destino_id, quantidade: qtd }]);
    }
    await supabase.from("transferencias").insert([{ produto_id, local_origem_id:origem_id, local_destino_id:destino_id, quantidade:qtd }]);

    showToast("Transferência realizada!");
    setForm({ produto_id:"", origem_id:"", destino_id:"", quantidade:"1" });
    setShowForm(false);
    load();
  };

  const ajustarEstoqueGeral = async (produtoId, novaQtd) => {
    if(!geral) return;
    const row = estoque.find(x=>x.produto_id===produtoId && x.local_id===geral.id);
    const qtd = parseInt(novaQtd)||0;
    if(row){
      await supabase.from("estoque_local").update({ quantidade: qtd }).eq("id", row.id);
    } else {
      await supabase.from("estoque_local").insert([{ produto_id:produtoId, local_id:geral.id, quantidade: qtd }]);
    }
    load();
  };

  return (
    <div style={{ padding:"24px 32px 48px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div style={{ fontSize:15, fontWeight:700, color:C.goldDim }}>Estoque por local</div>
        <button onClick={()=>setShowForm(s=>!s)} disabled={expositores.length===0} style={{ background:expositores.length===0?C.border:`linear-gradient(135deg,${C.goldLight},${C.gold})`, color:C.white, border:"none", borderRadius:8, padding:"9px 18px", cursor:expositores.length===0?"not-allowed":"pointer", fontFamily:"sans-serif", fontSize:12, fontWeight:700 }}>
          {showForm ? "Cancelar" : "↔ Transferir Peça"}
        </button>
      </div>

      {expositores.length===0 && (
        <div style={{ background:C.goldPale, borderRadius:10, padding:16, marginBottom:20, fontFamily:"sans-serif", fontSize:13, color:C.goldDim }}>
          Cadastre um local (aba "📍 Locais") antes de transferir peças pra expositores.
        </div>
      )}

      {showForm && expositores.length>0 && (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:20 }}>
          <FL label="Peça">
            <select value={form.produto_id} onChange={e=>setForm(f=>({...f,produto_id:e.target.value}))} style={{ width:"100%", padding:"9px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"sans-serif", fontSize:13, outline:"none", background:C.white }}>
              <option value="">Selecione a peça</option>
              {products.map(p=><option key={p.id} value={p.id}>{p.name}{p.codigo?` (#${p.codigo})`:""}</option>)}
            </select>
          </FL>
          <div style={{ display:"flex", gap:12 }}>
            <div style={{ flex:1 }}>
              <FL label="De (origem)">
                <select value={form.origem_id} onChange={e=>setForm(f=>({...f,origem_id:e.target.value}))} style={{ width:"100%", padding:"9px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"sans-serif", fontSize:13, outline:"none", background:C.white }}>
                  <option value="">Selecione</option>
                  {locais.map(l=><option key={l.id} value={l.id}>{l.nome}{form.produto_id?` — ${qtyEm(form.produto_id,l.id)} un.`:""}</option>)}
                </select>
              </FL>
            </div>
            <div style={{ flex:1 }}>
              <FL label="Para (destino)">
                <select value={form.destino_id} onChange={e=>setForm(f=>({...f,destino_id:e.target.value}))} style={{ width:"100%", padding:"9px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"sans-serif", fontSize:13, outline:"none", background:C.white }}>
                  <option value="">Selecione</option>
                  {locais.map(l=><option key={l.id} value={l.id}>{l.nome}</option>)}
                </select>
              </FL>
            </div>
          </div>
          <FL label="Quantidade"><FI value={form.quantidade} onChange={e=>setForm(f=>({...f,quantidade:e.target.value}))} placeholder="1"/></FL>
          <button onClick={transferir} style={{ padding:"11px 20px", background:`linear-gradient(135deg,${C.goldLight},${C.gold})`, color:C.white, border:"none", borderRadius:8, cursor:"pointer", fontFamily:"sans-serif", fontSize:13, fontWeight:700 }}>Confirmar Transferência</button>
        </div>
      )}

      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:`1fr ${locais.map(()=>"100px").join(" ")}`, padding:"10px 20px", background:C.cream, borderBottom:`1px solid ${C.border}`, gap:8 }}>
          <div style={{ fontSize:10, color:C.gray, fontFamily:"sans-serif", letterSpacing:1, textTransform:"uppercase", fontWeight:600 }}>Peça</div>
          {locais.map(l=><div key={l.id} style={{ fontSize:10, color:C.gray, fontFamily:"sans-serif", letterSpacing:1, textTransform:"uppercase", fontWeight:600, textAlign:"center" }}>{l.nome}</div>)}
        </div>
        {loading && <div style={{ padding:24, textAlign:"center", color:C.gray, fontFamily:"sans-serif" }}>Carregando...</div>}
        {!loading && products.map((p,i)=>(
          <div key={p.id} style={{ display:"grid", gridTemplateColumns:`1fr ${locais.map(()=>"100px").join(" ")}`, alignItems:"center", padding:"10px 20px", borderBottom:i<products.length-1?`1px solid ${C.border}`:"none", gap:8 }}>
            <div style={{ fontSize:13, fontWeight:700 }}>{p.name}{p.codigo?<span style={{ color:C.gold, fontWeight:400 }}> #{p.codigo}</span>:""}</div>
            {locais.map(l=>(
              l.tipo==="geral"
                ? <input key={l.id} defaultValue={qtyEm(p.id,l.id)} onBlur={e=>ajustarEstoqueGeral(p.id,e.target.value)}
                    style={{ width:"100%", textAlign:"center", padding:"6px", border:`1px solid ${C.border}`, borderRadius:6, fontFamily:"sans-serif", fontSize:13, outline:"none" }}/>
                : <div key={l.id} style={{ textAlign:"center", fontFamily:"sans-serif", fontSize:13, color:qtyEm(p.id,l.id)>0?C.goldDim:C.border, fontWeight:qtyEm(p.id,l.id)>0?700:400 }}>{qtyEm(p.id,l.id)}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ fontSize:11, color:C.gray, fontFamily:"sans-serif", marginTop:10 }}>
        💡 O campo do "Estoque Geral" é editável — digite a quantidade e clique fora pra salvar. Os demais locais só mudam por transferência.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS COMPARTILHADOS
// ═══════════════════════════════════════════════════════════════════════════
function Overlay({ children, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.45)" }}/>
      <div style={{ position:"relative", background:"#fff", borderRadius:16, width:"100%", maxWidth:500, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:16, background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.gray, zIndex:1 }}>×</button>
        {children}
      </div>
    </div>
  );
}

function Toast({ msg, type }) {
  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:1000, background:type==="err"?C.red:C.goldDim, color:C.white, padding:"11px 22px", borderRadius:8, fontSize:13, fontFamily:"sans-serif", fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,0.18)", letterSpacing:.3, animation:"fadeUp .3s ease" }}>
      {type==="err"?"⚠️ ":"✓ "}{msg}
    </div>
  );
}

function QtyBtn({ onClick, children }) {
  return <button onClick={onClick} style={{ width:26, height:26, borderRadius:6, border:`1px solid ${C.border}`, background:C.cream, cursor:"pointer", fontFamily:"sans-serif", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>{children}</button>;
}

function FL({ label, children, mb=14 }) {
  return (
    <div style={{ marginBottom:mb }}>
      <div style={{ fontSize:10, color:C.gray, fontFamily:"sans-serif", letterSpacing:1.5, textTransform:"uppercase", marginBottom:6, fontWeight:600 }}>{label}</div>
      {children}
    </div>
  );
}

function FI({ value, onChange, placeholder }) {
  return <input value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", padding:"9px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"sans-serif", fontSize:13, outline:"none", boxSizing:"border-box", background:C.white }}/>;
}
