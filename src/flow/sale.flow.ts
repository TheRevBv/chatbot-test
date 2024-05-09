import BotWhatsapp from "@bot-whatsapp/bot";
import chatbotFlow from "./chatbot.flow";
import welcomeFlow from "./welcome.flow";
import pixcua from "@services/pixcua";
import helloFlow from "./hello.flow";
import idleFlow from "./idle.flow";

const enum ACTIONS {
  ORDER = "pedido",
  BILL = "factura",
}

/**
 * Un flujo conversacion que es por defecto cunado no se contiene palabras claves en otros flujos
 */
export default function saleFlow(): BotWhatsapp.IMethodsChain {
  const salesFlow = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.WELCOME)
    .addAnswer(
      "Hola! Soy un bot de ventas, ¿En qué puedo ayudarte?",
      { capture: true },
      async (ctx, { state, fallBack, gotoFlow }) => {
        switch (ctx.body.toLowerCase()) {
          case ACTIONS.ORDER:
            //Actualiza el estado de la conversación o mandar a otro flujo
            await state.update({ action: ACTIONS.ORDER });
            // await gotoFlow(idleFlow);
            break;
          case ACTIONS.BILL:
            //Actualiza el estado de la conversación o mandar a otro flujo
            await state.update({ action: ACTIONS.BILL });
            // await gotoFlow(idleFlow);
            break;
          default:
            return fallBack(
              "No entiendo tu solicitud, ingresa un pedido o factura"
            );
        }
      }
    )
    .addAnswer("¡Genial! Procesando tu solicitud")
    .addAction(async (ctx, { flowDynamic, state }) => {
      const empresaSvc = new pixcua.empresa();
      const empresas = await empresaSvc.getEmpresas();

      console.log(`[EMPRESAS]:`, empresas);
    });
  return salesFlow;
}

/* 
.addAction(async (ctx, { flowDynamic, state }) => {
  try {
    const history = (state.getMyState()?.history ?? []) as string[];
    const ai = history.join(" ");

    console.log(`[QUE QUIERES realizar:`, ai.toLowerCase());

    if (ai.toLowerCase().includes("pedido")) {
      return flowDynamic("¡Claro! Aqui tienes el lista de productos.");
    }

    if (ai.toLowerCase().includes("factura")) {
      return flowDynamic("¡Claro! Ingresa tu Factura.");
    }

    return flowDynamic("¡Genial! ¿Qué accion deseas realizar?");
  } catch (err) {
    console.log(`[ERROR]:`, err);
  }
})
// .addAnswer("¡Genial! ¿Qué producto deseas comprar?")
.addAction(async (ctx, { state, gotoFlow }) => {
  try {
    // const products = await pixcua.getProducts();
    const products = [
      { name: "celular", price: 300 },
      { name: "laptop", price: 500 },
      { name: "tablet", price: 200 },
    ];
    console.log(`[PRODUCTS]:`, products);

    const product = products.find((product) =>
      ctx.body.toLowerCase().includes(product.name.toLowerCase())
    );

    if (!product) {
      return gotoFlow(welcomeFlow);
    }

    await state.update({ product });
  } catch (err) {
    console.log(`[ERROR]:`, err);
    return;
  }
});
 */
