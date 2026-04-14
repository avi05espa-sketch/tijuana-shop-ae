import { Bot, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

const GREETING: Message = {
  id: "greeting",
  role: "bot",
  text: "¡Hola! Soy Avi Bot 🤖 Tu asistente de Tijuana Shop AE. Estoy aquí para ayudarte a comprar, vender y moverte seguro en Tijuana. ¿En qué te puedo ayudar?",
};

// ─── Q&A Knowledge Base ──────────────────────────────────────────────────────

const QA: { keywords: string[]; response: string }[] = [
  {
    keywords: [
      "hola",
      "buenos días",
      "buenas tardes",
      "buenas noches",
      "buenas",
      "hey",
      "hi",
      "saludos",
      "qué tal",
      "que tal",
    ],
    response:
      "¡Hola! 👋 Bienvenido a Tijuana Shop AE. Puedo ayudarte a comprar, vender, o contarte sobre los puntos de entrega seguros. ¿Por dónde empezamos?",
  },
  {
    keywords: [
      "cómo compro",
      "como compro",
      "cómo se compra",
      "como se compra",
      "quiero comprar",
      "proceso de compra",
      "pasos para comprar",
    ],
    response:
      "¡Comprar es fácil! 🛍️\n\n1. Encuentra el producto que te guste\n2. Toca el botón verde de WhatsApp para contactar al vendedor directamente\n3. Acuerda el lugar de entrega (¡usa nuestros Puntos Seguros!)\n4. Verifica el producto antes de pagar\n5. Paga en efectivo o transferencia al momento de la entrega\n\n¡Nunca deposites dinero por adelantado sin ver el producto! 🛡️",
  },
  {
    keywords: [
      "cómo vendo",
      "como vendo",
      "cómo se vende",
      "como se vende",
      "quiero vender",
      "proceso de venta",
      "pasos para vender",
      "publicar",
      "crear publicación",
    ],
    response:
      '¡Vender en Tijuana Shop AE es sencillo! 💼\n\n1. Crea tu cuenta (gratis)\n2. Toca "+ Publicar" en el menú\n3. Sube fotos claras del producto\n4. Completa título, precio, categoría y zona de Tijuana\n5. Agrega tu número de WhatsApp para que los compradores te contacten\n6. ¡Listo! Tu publicación ya está activa\n\n¿Tienes alguna duda sobre el proceso? 📝',
  },
  {
    keywords: [
      "puntos de entrega",
      "lugar seguro",
      "dónde entregar",
      "donde entregar",
      "punto seguro",
      "entrega segura",
      "puntos seguros",
    ],
    response:
      "🗺️ Los Puntos de Entrega Seguros en Tijuana son:\n\n📍 Plaza Río — Zona Río\n📍 Macroplaza — Centro\n📍 Plaza Península — Playas de Tijuana\n📍 Galerías Hipódromo — Zona Hipódromo\n📍 Walmart Otay — Otay\n📍 Soriana Centro — Centro\n📍 Sports Forum — Corredor 2000\n\nSiempre acuerda entregas en lugares públicos y concurridos. ¡Nuestro mapa de Entrega Segura tiene fotos y cómo llegar a cada punto! 🙌",
  },
  {
    keywords: [
      "pago seguro",
      "cómo pagar",
      "como pagar",
      "depósito",
      "transferencia",
      "efectivo",
      "adelanto",
      "no deposites",
    ],
    response:
      "💳 Consejos para pagar de forma segura:\n\n✅ Pago contra entrega — paga solo cuando ya tienes el producto en tus manos\n✅ Verifica el artículo antes de entregar el dinero\n✅ Usa transferencia bancaria en el momento, no antes\n❌ NUNCA deposites dinero por adelantado sin ver el producto\n❌ Si alguien te pide depósito previo, es una señal de alerta 🚩\n\nTijuana Shop AE no se responsabiliza de pagos fuera de la plataforma.",
  },
  {
    keywords: [
      "whatsapp",
      "contactar vendedor",
      "contacto vendedor",
      "hablar con vendedor",
      "botón verde",
      "número vendedor",
    ],
    response:
      "📱 Para contactar al vendedor por WhatsApp:\n\n1. Abre la página del producto que te interesa\n2. Toca el botón verde de WhatsApp\n3. Se abrirá WhatsApp directamente con un mensaje predeterminado\n4. El vendedor responderá y pueden acordar los detalles de la entrega\n\nRecuerda: el número de WhatsApp del vendedor es público para facilitar la compraventa segura.",
  },
  {
    keywords: [
      "apartado",
      "reservado",
      "marcar apartado",
      "reservar producto",
      "apartar",
    ],
    response:
      '📌 La opción de "Apartado" permite al vendedor marcar un producto como reservado mientras se concreta la venta.\n\nSi ves un producto marcado como Apartado, significa que ya hay un trato en proceso. Puedes contactar al vendedor para saber si sigue disponible o preguntar cuándo estará libre nuevamente.',
  },
  {
    keywords: [
      "admin",
      "panel de admin",
      "administrador",
      "panel admin",
      "acceso admin",
    ],
    response:
      "🔐 El panel de administración está disponible solo para usuarios con rol de admin.\n\nPara acceder, escribe la palabra clave en la barra de búsqueda y luego ingresa tu contraseña de admin. Si crees que deberías tener acceso, contacta al equipo de Tijuana Shop AE. 🛡️",
  },
  {
    keywords: [
      "reportar",
      "reportar usuario",
      "reporte",
      "queja",
      "fraude",
      "estafa",
      "denunciar",
    ],
    response:
      '🚩 Si encuentras un usuario, producto o mensaje sospechoso:\n\n1. Ve al perfil del usuario o a la publicación\n2. Toca el botón "Reportar"\n3. Selecciona el motivo del reporte\n4. Nuestro equipo revisará tu reporte a la brevedad\n\nNo tolerar fraudes es parte de nuestra comunidad. ¡Gracias por ayudar a mantener Tijuana Shop AE seguro! 🙏',
  },
  {
    keywords: [
      "zona",
      "zonas",
      "playas",
      "otay",
      "centro",
      "corredor",
      "corredor 2000",
      "colonias",
      "colonia",
      "mapa",
    ],
    response:
      "📍 Tijuana Shop AE está organizado por zonas:\n\n🌊 Playas — Playas de Tijuana y alrededores\n🏙️ Centro — Centro histórico y zona centro\n🏭 Otay — Otay, Mesa de Otay\n🛣️ Corredor 2000 — Corredor Tijuana-Tecate\n\nPuedes filtrar productos por zona en el mapa interactivo para encontrar vendedores cerca de ti. 🗺️",
  },
  {
    keywords: [
      "registro",
      "registrar",
      "crear cuenta",
      "nueva cuenta",
      "cómo me registro",
      "como me registro",
    ],
    response:
      '✨ Registrarte en Tijuana Shop AE es gratis y rápido:\n\n1. Toca "Registrarme" en la barra de navegación\n2. Ingresa tu nombre, teléfono y correo\n3. Acepta los Términos y Condiciones\n4. ¡Ya eres parte de la comunidad tijuanense! 🎉\n\nEl primer usuario registrado recibe el rol de administrador automáticamente.',
  },
  {
    keywords: [
      "seguridad",
      "seguro",
      "confianza",
      "verificado",
      "perfil verificado",
      "insignia",
    ],
    response:
      "🛡️ En Tijuana Shop AE la confianza es primero:\n\n✅ Los usuarios verificados tienen una insignia en su perfil\n✅ Revisa siempre el perfil del vendedor: foto, reseñas y zona\n✅ Haz entregas en Puntos Seguros públicos\n✅ Un vendedor confiable tiene foto de perfil, bio y calificaciones\n\nSi algo parece demasiado bueno para ser verdad, ¡reporta! 🚩",
  },
  {
    keywords: [
      "gracias",
      "thank",
      "perfecto",
      "excelente",
      "genial",
      "muy bien",
      "listo",
    ],
    response:
      "¡De nada! 😊 Me alegra haberte ayudado. Si tienes más preguntas sobre comprar, vender o moverte seguro en Tijuana, aquí estaré.\n\n¡Buenas compras en Tijuana Shop AE! 🛍️🇲🇽",
  },
  {
    keywords: ["adios", "adiós", "bye", "hasta luego", "nos vemos", "chao"],
    response:
      "¡Hasta luego! 👋 Fue un placer ayudarte. ¡Vuelve cuando quieras y cuídate mucho en Tijuana! 🤖",
  },
  {
    keywords: [
      "categoria",
      "categoría",
      "categorias",
      "categorías",
      "electronico",
      "electrónico",
      "mueble",
      "ropa",
      "auto",
    ],
    response:
      "📦 Categorías disponibles en Tijuana Shop AE:\n\n📱 Electrónicos — Celulares, computadoras, gadgets\n🛋️ Muebles — Para el hogar y oficina\n👕 Ropa — Ropa y accesorios\n🚗 Autos — Vehículos y refacciones\n📦 Otros — Todo lo demás\n\nUsa los filtros para encontrar exactamente lo que buscas.",
  },
  {
    keywords: [
      "calificación",
      "calificacion",
      "estrellas",
      "reseña",
      "reseñas",
      "opinión",
      "opiniones",
    ],
    response:
      "⭐ Los vendedores tienen calificaciones de 1 a 5 estrellas basadas en opiniones de compradores anteriores.\n\nRevisa siempre la calificación y los comentarios antes de hacer un trato. Un vendedor con varias reseñas positivas es una señal de confianza. 🙌",
  },
];

function generateBotResponse(message: string): string {
  const lower = message.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

  for (const qa of QA) {
    const normalizedKeywords = qa.keywords.map((kw) =>
      kw.normalize("NFD").replace(/\p{M}/gu, ""),
    );
    if (normalizedKeywords.some((kw) => lower.includes(kw))) {
      return qa.response;
    }
  }

  return "Hmm, no encontré una respuesta exacta para eso 🤔\n\nTe recomiendo:\n• Revisar la sección de Ayuda en Configuración\n• Contactar a nuestro equipo de soporte\n• O pregúntame algo más específico sobre cómo comprar, vender o los puntos de entrega seguros en Tijuana. ¡Estoy aquí para ayudarte! 😊";
}

const QUICK_QUESTIONS = [
  "¿Cómo compro?",
  "¿Cómo vendo?",
  "¿Puntos de entrega seguros?",
  "¿Cómo pago de forma segura?",
];

export function AviBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const sendMessage = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isPending) return;

    if (showQuickQuestions) setShowQuickQuestions(false);

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsPending(true);

    const delay = 700 + Math.random() * 500;
    setTimeout(() => {
      const response = generateBotResponse(msg);
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, role: "bot", text: response },
      ]);
      setIsPending(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      <style>{`
        @keyframes botDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        .avibot-panel { background: #0e0e0e; border: 1.5px solid rgba(0,255,255,0.45); box-shadow: 0 0 24px rgba(0,255,255,0.18), 0 8px 40px rgba(0,0,0,0.7); }
        .avibot-titlebar { background: rgba(0,255,255,0.07); border-bottom: 1px solid rgba(0,255,255,0.2); }
        .avibot-avatar { background: rgba(0,255,255,0.15); border: 1px solid rgba(0,255,255,0.4); }
        .avibot-close-btn { color: rgba(0,255,255,0.6); }
        .avibot-close-btn:hover { color: #00ffff; }
        .avibot-msg-user { background: rgba(0,255,255,0.18); border: 1px solid rgba(0,255,255,0.35); color: #e0fffe; border-radius: 18px 18px 4px 18px; }
        .avibot-msg-bot { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(0,255,255,0.9); border-radius: 18px 18px 18px 4px; }
        .avibot-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(0,255,255,0.2); color: #e0fffe; caret-color: #00ffff; }
        .avibot-input:focus { border-color: rgba(0,255,255,0.5); outline: none; }
        .avibot-input::placeholder { color: rgba(0,255,255,0.3); }
        .avibot-send { background: rgba(0,255,255,0.2); border: 1px solid rgba(0,255,255,0.35); color: #00ffff; }
        .avibot-send:disabled { background: rgba(0,255,255,0.05); color: rgba(0,255,255,0.25); cursor: not-allowed; }
        .avibot-input-bar { border-top: 1px solid rgba(0,255,255,0.15); }
        .avibot-toggle { background: rgba(0,255,255,0.15); border: 1.5px solid rgba(0,255,255,0.5); box-shadow: 0 0 18px rgba(0,255,255,0.25); color: #00ffff; }
        .avibot-toggle:hover { box-shadow: 0 0 28px rgba(0,255,255,0.45); background: rgba(0,255,255,0.22); }
        .avibot-dot-avatar { background: rgba(0,255,255,0.12); border: 1px solid rgba(0,255,255,0.3); }
        .avibot-dot { background: #00ffff; width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .avibot-dot:nth-child(1) { animation: botDot 1.2s ease-in-out 0s infinite; }
        .avibot-dot:nth-child(2) { animation: botDot 1.2s ease-in-out 0.2s infinite; }
        .avibot-dot:nth-child(3) { animation: botDot 1.2s ease-in-out 0.4s infinite; }
        .avibot-scroll::-webkit-scrollbar { width: 4px; }
        .avibot-scroll::-webkit-scrollbar-track { background: transparent; }
        .avibot-scroll::-webkit-scrollbar-thumb { background: rgba(0,255,255,0.2); border-radius: 2px; }
        .avibot-msg-bot { white-space: pre-line; }
        .quick-pill { background: rgba(0,255,255,0.08); border: 1px solid rgba(0,255,255,0.3); color: rgba(0,255,255,0.85); border-radius: 999px; font-size: 12px; padding: 5px 12px; cursor: pointer; transition: background 0.18s; }
        .quick-pill:hover { background: rgba(0,255,255,0.18); }
      `}</style>

      <div
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3"
        data-ocid="avibot-widget"
      >
        {open && (
          <div
            className="avibot-panel flex flex-col overflow-hidden rounded-2xl"
            style={{ width: 320, height: 500 }}
            data-ocid="avibot-panel"
          >
            {/* Title bar */}
            <div className="avibot-titlebar flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="avibot-avatar flex h-8 w-8 items-center justify-center rounded-full">
                  <Bot className="h-4 w-4" style={{ color: "#00ffff" }} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold leading-tight"
                    style={{
                      color: "#00ffff",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Avi Bot 🤖
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(0,255,255,0.55)" }}
                  >
                    Asistente virtual
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar chat"
                className="avibot-close-btn flex h-7 w-7 items-center justify-center rounded-full transition-smooth"
                data-ocid="avibot-close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="avibot-scroll flex flex-1 flex-col gap-3 overflow-y-auto p-4"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="avibot-dot-avatar mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      <Bot className="h-3 w-3" style={{ color: "#00ffff" }} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user" ? "avibot-msg-user" : "avibot-msg-bot"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Quick questions — shown after greeting only */}
              {showQuickQuestions && messages.length === 1 && (
                <div
                  className="flex flex-wrap gap-2 pt-1"
                  data-ocid="avibot-quick-questions"
                >
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      className="quick-pill"
                      onClick={() => sendMessage(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Typing indicator */}
              {isPending && (
                <div className="flex justify-start" data-ocid="avibot-typing">
                  <div className="avibot-dot-avatar mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    <Bot className="h-3 w-3" style={{ color: "#00ffff" }} />
                  </div>
                  <div className="avibot-msg-bot flex items-center gap-1 px-4 py-3">
                    <span className="avibot-dot" />
                    <span className="avibot-dot" />
                    <span className="avibot-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="avibot-input-bar flex items-center gap-2 px-3 py-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                disabled={isPending}
                className="avibot-input flex-1 rounded-xl px-3 py-2 text-sm transition-smooth"
                data-ocid="avibot-input"
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isPending}
                aria-label="Enviar mensaje"
                className="avibot-send flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-smooth"
                data-ocid="avibot-send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Toggle button — icon only so it doesn't overlap the bottom nav Perfil button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar Avi Bot" : "Abrir Avi Bot"}
          className="avibot-toggle flex items-center justify-center rounded-full transition-smooth"
          style={{ width: 48, height: 48 }}
          data-ocid="avibot-toggle"
        >
          <Bot className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
