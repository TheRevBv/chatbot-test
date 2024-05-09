import { createFlow, addKeyword, EVENTS } from "bot-ts-demo";
// import { generatePaymentLink } from 'src/services/paypal';

/**
 * Un flujo conversacion que responder a las palabras claves "hola", "buenas", ...
 */
export default addKeyword(EVENTS.ACTION)
  .addAnswer(
    "¿Como es tu email? lo necesito para generar link de",
    { capture: true },
    async (ctx, { state, fallBack }) => {
      if (!ctx.body.includes("@")) {
        return fallBack("Eyy!bro esto no es un email valido! ponte serio");
      }
      await state.update({ email: ctx.body.toLowerCase() });
    }
  )
  .addAnswer("...generando link de pago de curso de node")
  .addAction(async (ctx, { flowDynamic, state }) => {
    const email = state.get("email");
    // const paypalLink = await generatePaymentLink('39.00', email)
    // await flowDynamic(paypalLink)
  });
