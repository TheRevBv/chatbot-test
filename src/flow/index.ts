import { createFlow } from "bot-ts-demo";

import BotWhatsapp from "@bot-whatsapp/bot";
import helloFlow from "./hello.flow";
import welcomeFlow from "./welcome.flow";
import paypalFlow from "./paypal.flow";
import chatbotFlow from "./chatbot.flow";
import nodeFlow from "./node.flow";
import saleFlow from "./sale.flow";

import idleFlow from "./idle.flow";

/**
 * Debes de implementar todos los flujos
 */
export default createFlow([idleFlow, saleFlow]);
