import { Telegraf } from 'telegraf';
import { env } from '../../env-config/env';
import { message } from 'telegraf/filters';

export function initializeBot() {
  const token = env.TELEGRAM_BOT_TOKEN;
  const bot = new Telegraf(token);

  bot.start(ctx => {
    ctx.reply('Por favor, compartilhe seu número de telefone:', {
      reply_markup: {
        one_time_keyboard: true,
        keyboard: [
          [
            {
              text: 'Enviar meu número de telefone',
              request_contact: true,
            },
          ],
        ],
      },
    });
  });

  bot.on(message('contact'), ctx => {
    const phoneNumber = ctx.message.contact.phone_number;
    console.log(`Número de telefone recebido: ${phoneNumber}`);

    ctx.reply('Obrigado por compartilhar seu número!');
  });

  bot
    .launch()
    .then(() => {
      console.log('Bot started in polling mode.');
    })
    .catch(error => {
      console.error('Erro ao iniciar o bot:', error.message);
    });

  bot.catch(error => {
    console.error('Erro no bot:', error);
  });
}
