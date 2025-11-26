const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { dashscopeApiKey } = require('./config/aliyun');

/**
 * 简单的流式识别 Session 管理，仅用于 POC。
 * key: sessionId, value: { ws, latestText, finalizePromise, resolveFinal, rejectFinal }
 */
const sessions = new Map();

/**
 * 注册 Paraformer Realtime v2 流式识别相关路由。
 * 该模块与现有业务解耦，仅在开发环境挂载。
 *
 * @param {import('express').Express} app
 * @param {Function} authenticateToken
 */
function registerParaformerRealtimeStream(app, authenticateToken) {
  if (!dashscopeApiKey) {
    console.warn(
      '[Paraformer-Stream] DashScope API key 未配置，流式接口将不可用（/api/paraformer/realtime-session/*）。'
    );
  }

  // 1) 创建新的识别 Session
  app.post(
    '/api/paraformer/realtime-session/start',
    authenticateToken,
    async (req, res) => {
      if (!dashscopeApiKey) {
        return res
          .status(500)
          .json({ error: 'DashScope API key not configured on server.' });
      }

      const apiKey = dashscopeApiKey;
      const url = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/';
      const sessionId = uuidv4().replace(/-/g, '').slice(0, 32);

      const ws = new WebSocket(url, {
        headers: {
          Authorization: `bearer ${apiKey}`,
        },
      });

      let latestText = '';
      let fullText = '';
      let lastCommittedSentenceId = 0;
      let taskStarted = false;
      let finished = false;

      let resolveFinal;
      let rejectFinal;
      const finalizePromise = new Promise((resolve, reject) => {
        resolveFinal = resolve;
        rejectFinal = reject;
      });

      // 基本事件处理：与非流式版本类似，但不主动发送音频
      ws.on('open', () => {
        const runTaskMessage = {
          header: {
            action: 'run-task',
            task_id: sessionId,
            streaming: 'duplex',
          },
          payload: {
            task_group: 'audio',
            task: 'asr',
            function: 'recognition',
            model: 'paraformer-realtime-v2',
            // 前端将音频转成 16kHz 单声道 PCM
            parameters: {
              sample_rate: 16000,
              format: 'pcm',
            },
            input: {},
          },
        };
        ws.send(JSON.stringify(runTaskMessage));
      });

      ws.on('message', (data) => {
        try {
          console.log('[Paraformer-Stream] WS message:', data.toString());
        } catch {
          // ignore
        }

        let message;
        try {
          message = JSON.parse(data);
        } catch {
          return;
        }

        const event = message?.header?.event;
        const output = message?.payload?.output;

        switch (event) {
          case 'task-started':
            taskStarted = true;
            break;
          case 'result-generated': {
            // 更新最新句子，同时在句子结束时累积到 fullText
            const sentence = output?.sentence;
            let sentenceText =
              sentence?.text || output?.text || output?.result || '';

            if (!sentenceText && Array.isArray(output?.sentences)) {
              const lastSentence = output.sentences
                .map((s) => s.text || s.result || '')
                .filter(Boolean)
                .at(-1);
              sentenceText = lastSentence || '';
            }

            if (sentenceText) {
              latestText = sentenceText;
            }

            if (
              sentenceText &&
              sentence &&
              sentence.sentence_end === true &&
              typeof sentence.sentence_id === 'number' &&
              sentence.sentence_id > lastCommittedSentenceId
            ) {
              fullText = fullText
                ? `${fullText}${sentenceText}`
                : sentenceText;
              lastCommittedSentenceId = sentence.sentence_id;
            }
            break;
          }
          case 'task-finished': {
            const sentence = output?.sentence;
            let sentenceText =
              sentence?.text || output?.text || output?.result || '';

            if (!sentenceText && Array.isArray(output?.sentences)) {
              const lastSentence = output.sentences
                .map((s) => s.text || s.result || '')
                .filter(Boolean)
                .at(-1);
              sentenceText = lastSentence || '';
            }

            if (sentenceText && !latestText) {
              latestText = sentenceText;
            }

            if (
              sentenceText &&
              sentence &&
              sentence.sentence_end === true &&
              typeof sentence.sentence_id === 'number' &&
              sentence.sentence_id > lastCommittedSentenceId
            ) {
              fullText = fullText
                ? `${fullText}${sentenceText}`
                : sentenceText;
              lastCommittedSentenceId = sentence.sentence_id;
            }

            const finalText = (fullText || latestText || '').trim();

            finished = true;
            ws.close();
            resolveFinal(finalText);
            break;
          }
          case 'task-failed': {
            finished = true;
            const errMsg =
              message?.header?.error_message || 'Paraformer realtime task failed';
            ws.close();
            rejectFinal(new Error(errMsg));
            break;
          }
          default:
            break;
        }
      });

      ws.on('error', (error) => {
        if (!finished) {
          finished = true;
          rejectFinal(error);
        }
      });

      ws.on('close', () => {
        if (!taskStarted && !finished) {
          rejectFinal(
            new Error('Paraformer realtime task did not start before connection close.')
          );
        }
      });

      sessions.set(sessionId, {
        ws,
        latestText,
        finalizePromise,
        resolveFinal,
        rejectFinal,
      });

      res.json({ sessionId });
    }
  );

  // 2) 接收一小段 16k PCM，并通过 WS 发给阿里云
  app.post(
    '/api/paraformer/realtime-session/:id/chunk',
    authenticateToken,
    (req, res) => {
      const { id } = req.params;
      const session = sessions.get(id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      const { ws } = session;
      if (ws.readyState !== WebSocket.OPEN) {
        return res.status(409).json({ error: 'WebSocket not open' });
      }

      const audioBuffer = req.body;
      if (!audioBuffer || !audioBuffer.length) {
        return res.status(400).json({ error: 'No audio data found in request body.' });
      }

      ws.send(audioBuffer);
      return res.sendStatus(204);
    }
  );

  // 3) 结束会话并等待最终结果
  app.post(
    '/api/paraformer/realtime-session/:id/finish',
    authenticateToken,
    async (req, res) => {
      const { id } = req.params;
      const session = sessions.get(id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const { ws, finalizePromise } = session;
      if (ws.readyState !== WebSocket.OPEN) {
        sessions.delete(id);
        return res.status(409).json({ error: 'WebSocket not open' });
      }

      // 发送 finish-task，等待阿里云返回 task-finished
      const finishTaskMessage = {
        header: {
          action: 'finish-task',
          task_id: id,
          streaming: 'duplex',
        },
        payload: {
          input: {},
        },
      };
      ws.send(JSON.stringify(finishTaskMessage));

      try {
        const transcript = await finalizePromise;
        sessions.delete(id);
        console.log('[Paraformer-Stream] Final transcript:\n', transcript || '<EMPTY>');
        return res.json({ transcript });
      } catch (error) {
        sessions.delete(id);
        console.error(
          '[Paraformer-Stream] Error waiting for final transcript:',
          error && error.message ? error.message : error
        );
        return res.status(500).json({
          error: 'Paraformer realtime streaming failed',
          detail: error && error.message ? error.message : String(error),
        });
      }
    }
  );
}

module.exports = {
  registerParaformerRealtimeStream,
};


