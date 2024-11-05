/* eslint-disable no-console */
import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { env } from '../../env-config/env';
import { prismaService } from '../../database/prisma/prisma.service';

export function initializeBot() {
  const PORT = env.PORT;
  const URL = process.env.APP_URL;
  const token = env.TELEGRAM_BOT_TOKEN;
  const bot = new Telegraf<Context>(token);

  bot.telegram.deleteWebhook().then(() => {
    bot.telegram.setWebhook(`${URL}/bot${token}`);
  });

  bot.start(ctx => {
    ctx.reply('Por favor, envie o código que você recebeu no aplicativo.');
  });

  bot.on(message('text'), async ctx => {
    const code = ctx.message.text;
    const chatId = ctx.chat?.id;

    try {
      const tokenEntry = await prismaService.telegramToken.findFirst({
        where: {
          token: code,
          expired_in: {
            gt: new Date(), // Verifica se o token ainda não expirou
          },
        },
        include: {
          user: true,
        },
      });

      if (tokenEntry) {
        await ctx.reply(
          'Código validado! Agora, por favor, compartilhe seu número de telefone:',
          {
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
          },
        );

        await prismaService.userTelegram.upsert({
          where: { user_id: tokenEntry.user_id },
          create: {
            user_id: tokenEntry.user_id,
            chat_id: chatId,
          },
          update: { chat_id: chatId },
        });
      } else {
        await ctx.reply(
          'Código inválido ou expirado. Por favor, tente novamente.',
        );
      }
    } catch (error) {
      console.error('Erro ao validar o código:', error.message);
      await ctx.reply(
        'Ocorreu um erro ao validar seu código. Tente novamente.',
      );
    }
  });

  bot.on(message('contact'), async ctx => {
    const phoneNumber = ctx.message.contact.phone_number;
    const chatId = ctx.chat?.id;

    await ctx.reply('Obrigado por compartilhar seu número!');

    try {
      await prismaService.userTelegram.update({
        where: { chat_id: chatId },
        data: { phone: phoneNumber },
      });
    } catch (error) {
      console.error(
        'Erro ao salvar o contato no banco de dados:',
        error.message,
      );
      await ctx.reply(
        'Ocorreu um erro ao salvar seu contato. Tente novamente mais tarde.',
      );
    }
  });

  // Iniciar o bot com webhook
  bot
    .launch({
      webhook: {
        domain: URL,
        port: +PORT,
      },
    })
    .then(() => {
      console.log(`Bot iniciado com webhook no endereço ${URL}/bot${token}`);
    })
    .catch(error => {
      console.error('Erro ao iniciar o bot:', error.message);
    });

  bot.catch(error => {
    console.error('Erro no bot:', error);
  });
}
