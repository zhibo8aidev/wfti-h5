import { POSTER_TIMEOUT_MS } from "../config.js";
import { logError, track } from "./tracker.js";
import { withTimeout } from "../utils/helpers.js";

function drawRadar(ctx, scores, x, y, radius) {
  const keys = Object.keys(scores);
  const values = keys.map((key) => scores[key] / 6);
  const angleStep = (Math.PI * 2) / keys.length;

  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  for (let ring = 1; ring <= 4; ring += 1) {
    ctx.beginPath();
    for (let i = 0; i < keys.length; i += 1) {
      const angle = -Math.PI / 2 + i * angleStep;
      const px = Math.cos(angle) * radius * (ring / 4);
      const py = Math.sin(angle) * radius * (ring / 4);
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }

  ctx.beginPath();
  values.forEach((value, index) => {
    const angle = -Math.PI / 2 + index * angleStep;
    const px = Math.cos(angle) * radius * value;
    const py = Math.sin(angle) * radius * value;
    if (index === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(242, 200, 106, 0.28)";
  ctx.strokeStyle = "#f2c86a";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export async function generatePoster(result, qrConfig) {
  try {
    const blob = await withTimeout(
      new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = 750;
        canvas.height = 1334;
        const ctx = canvas.getContext("2d");

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#081a40");
        gradient.addColorStop(0.45, "#175d7b");
        gradient.addColorStop(1, "#eef4fa");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.beginPath();
        ctx.arc(375, 260, 220, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#dfe8f4";
        ctx.font = "700 28px sans-serif";
        ctx.fillText("WFTI 世界杯球迷人格海报", 56, 88);

        ctx.fillStyle = "#ffffff";
        ctx.font = "700 84px sans-serif";
        ctx.fillText(result.personalityCode, 56, 196);
        ctx.font = "700 52px sans-serif";
        ctx.fillText(result.personalityName, 56, 276);

        ctx.font = "400 28px sans-serif";
        const lines = [result.persona.oneLiner, result.persona.description];
        let top = 344;
        lines.forEach((line) => {
          const parts = line.match(/.{1,22}/g) || [];
          parts.slice(0, 3).forEach((part) => {
            ctx.fillText(part, 56, top);
            top += 42;
          });
        });

        drawRadar(ctx, result.rawScores, 555, 278, 128);

        ctx.fillStyle = "rgba(255,255,255,0.82)";
        ctx.roundRect(44, 560, 662, 250, 28);
        ctx.fill();

        ctx.fillStyle = "#1c3850";
        ctx.font = "700 32px sans-serif";
        ctx.fillText("人格档案", 76, 620);
        ctx.font = "400 26px sans-serif";
        ctx.fillText(`球星对照：${result.persona.star}`, 76, 678);
        ctx.fillText(`最佳拍档：${result.persona.partner}`, 76, 724);
        ctx.fillText(`天敌属性：${result.persona.rival}`, 76, 770);

        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.roundRect(44, 850, 662, 388, 28);
        ctx.fill();

        ctx.fillStyle = "#203b52";
        ctx.font = "700 30px sans-serif";
        ctx.fillText("扫码查看完整人格档案", 72, 914);

        ctx.fillStyle = "#5b7695";
        ctx.font = "400 24px sans-serif";
        ctx.fillText("【待接口确认】二维码图片未接入，当前展示 mock 扫码区", 72, 956);

        const qrX = 72;
        const qrY = 996;
        const qrSize = 180;
        const cell = 15;
        for (let row = 0; row < 12; row += 1) {
          for (let col = 0; col < 12; col += 1) {
            const shouldFill = ((row * 13 + col * 7 + result.personalityCode.length) % 3) === 0;
            ctx.fillStyle = shouldFill ? "#173856" : "#eff4f8";
            ctx.fillRect(qrX + col * cell, qrY + row * cell, cell - 2, cell - 2);
          }
        }
        ctx.fillStyle = "#1f3951";
        ctx.font = "700 26px sans-serif";
        ctx.fillText(result.persona.tags.slice(0, 2).join(" / "), 290, 1058);
        ctx.font = "400 22px sans-serif";
        const link = qrConfig.link.slice(0, 40);
        ctx.fillText(link, 290, 1100);
        ctx.fillText("直播吧 · 世界杯球迷人格大鉴赏", 290, 1140);

        canvas.toBlob((generatedBlob) => {
          resolve(generatedBlob);
        }, "image/png");
      }),
      POSTER_TIMEOUT_MS,
      "poster generation timeout"
    );

    track("wfti_poster_generate_success", { personalityCode: result.personalityCode });
    return blob;
  } catch (error) {
    logError("wfti_poster_generate_fail", { error: error.message });
    throw error;
  }
}
